import Pusher from "pusher-js";
import { client } from "~/_graphql";
import { currentTokenVar } from "~/_graphql/cache/auth";
import { REALTIME_CONFIG } from "~/_graphql/queries";
import config from "~/config";
import type { RealtimeConfig } from "~/utils/types";

/**
 * Realtime client for the dashboard. The API says which transport to use
 * (`realtimeConfig.provider`):
 *   - "stream": the API's built-in Server-Sent Events (default; no account needed)
 *   - "pusher": Pusher Channels, when the API has PUSHER_* configured
 * Both are wrapped in the same `subscribe(channel, onEvent)` interface, and
 * both report whether events are actually flowing (`onStatus`) so views can
 * poll while the connection is down instead of silently going stale.
 */
export type RealtimeHandler = (event: string, data: Record<string, unknown>) => void;

export interface RealtimeClient {
  provider: "pusher" | "stream";
  subscribe: (channel: string, handler: RealtimeHandler) => () => void;
  /**
   * Calls `listener` with the current connection state, then again whenever it
   * changes. Subscribing is not the same as being connected: the stream can be
   * unreachable, or drop. Returns an unsubscribe.
   */
  onStatus: (listener: (connected: boolean) => void) => () => void;
  disconnect: () => void;
}

/** `url`'s path and query on another origin. */
const onOrigin = (url: string, origin: string) => {
  try {
    const parsed = new URL(url);
    return `${origin}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

/** Reconnect delay: quick at first, then backing off to once a minute. */
const backoff = (attempt: number) => Math.min(60_000, 2_000 * 2 ** Math.min(attempt, 5));

/** One EventSource per channel, shared by every subscriber, re-ticketed on reconnect. */
export const createStreamClient = (
  endpoints: Pick<RealtimeConfig, "ticketEndpoint" | "streamEndpoint">,
  getToken: () => string | null,
  /**
   * An origin already known to reach the API (the one GraphQL uses). If the
   * endpoints the API advertises can't be reached — its public URL is stale,
   * or only resolves from outside — the same paths are tried here.
   */
  fallbackOrigin?: string,
): RealtimeClient => {
  type Entry = {
    handlers: Set<RealtimeHandler>;
    source: EventSource | null;
    closed: boolean;
    live: boolean;
    attempt: number;
    retry?: number;
  };
  const channels = new Map<string, Entry>();

  const routes = [{ ticket: endpoints.ticketEndpoint, stream: endpoints.streamEndpoint }];
  if (fallbackOrigin) {
    const alternate = {
      ticket: onOrigin(endpoints.ticketEndpoint, fallbackOrigin),
      stream: onOrigin(endpoints.streamEndpoint, fallbackOrigin),
    };
    if (alternate.ticket !== routes[0].ticket) routes.push(alternate);
  }
  let route = 0;

  const listeners = new Set<(connected: boolean) => void>();
  let connected = false;
  const refreshStatus = () => {
    const next = [...channels.values()].some((entry) => entry.live);
    if (next === connected) return;
    connected = next;
    listeners.forEach((listener) => listener(connected));
  };

  /** A connection attempt failed or an open stream dropped: try again, later each time. */
  const reconnect = (channel: string, entry: Entry, opened: boolean) => {
    entry.source = null;
    entry.live = false;
    refreshStatus();
    if (entry.closed) return;
    // Never got through on this route: move to the next one straight away.
    const switching = !opened && routes.length > 1 && entry.attempt < routes.length - 1;
    if (!opened) route = (route + 1) % routes.length;
    const delay = switching ? 250 : backoff(entry.attempt);
    entry.attempt += 1;
    entry.retry = window.setTimeout(() => void open(channel, entry), delay);
  };

  const open = async (channel: string, entry: Entry) => {
    if (entry.closed) return;
    const { ticket: ticketEndpoint, stream: streamEndpoint } = routes[route];
    try {
      const response = await fetch(ticketEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify({ channels: [channel] }),
      });
      if (!response.ok) throw new Error(`ticket ${response.status}`);
      const { ticket } = (await response.json()) as { ticket: string };
      if (entry.closed) return;
      const source = new EventSource(`${streamEndpoint}?ticket=${encodeURIComponent(ticket)}`);
      entry.source = source;
      let opened = false;
      source.onopen = () => {
        opened = true;
        entry.attempt = 0;
        entry.live = true;
        refreshStatus();
      };
      const dispatch = (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data) as { payload?: Record<string, unknown> };
          entry.handlers.forEach((handler) => handler(event.type, parsed.payload ?? {}));
        } catch {
          /* ignore malformed frames */
        }
      };
      // EventSource only surfaces named events through addEventListener.
      for (const name of [
        "conversation.created",
        "conversation.assigned",
        "conversation.updated",
        "conversation.resolved",
        "message.created",
        "agent.status_changed",
        "customer.created",
      ]) {
        source.addEventListener(name, dispatch);
      }
      // The ticket is single-use in practice (it expires in a minute), so on
      // any error close and reconnect with a fresh one instead of letting
      // EventSource retry the stale URL.
      source.onerror = () => {
        source.close();
        reconnect(channel, entry, opened);
      };
    } catch {
      reconnect(channel, entry, false);
    }
  };

  return {
    provider: "stream",
    subscribe: (channel, handler) => {
      let entry = channels.get(channel);
      if (!entry) {
        entry = { handlers: new Set(), source: null, closed: false, live: false, attempt: 0 };
        channels.set(channel, entry);
        void open(channel, entry);
      }
      entry.handlers.add(handler);
      const current = entry;
      return () => {
        current.handlers.delete(handler);
        if (current.handlers.size === 0) {
          current.closed = true;
          window.clearTimeout(current.retry);
          current.source?.close();
          current.live = false;
          channels.delete(channel);
          refreshStatus();
        }
      };
    },
    onStatus: (listener) => {
      listeners.add(listener);
      listener(connected);
      return () => {
        listeners.delete(listener);
      };
    },
    disconnect: () => {
      for (const [channel, entry] of channels) {
        entry.closed = true;
        window.clearTimeout(entry.retry);
        entry.source?.close();
        entry.live = false;
        channels.delete(channel);
      }
      refreshStatus();
    },
  };
};

const createPusherClient = (config: RealtimeConfig): RealtimeClient => {
  const pusher = new Pusher(config.key ?? "", {
    cluster: config.cluster ?? "mt1",
    channelAuthorization: {
      endpoint: config.authEndpoint,
      transport: "ajax",
      headersProvider: () => ({ Authorization: `Bearer ${currentTokenVar() ?? ""}` }),
    },
  });
  return {
    provider: "pusher",
    subscribe: (channelName, handler) => {
      const channel = pusher.subscribe(channelName);
      const fn = (event: string, data: unknown) => {
        if (!event.startsWith("pusher:")) handler(event, (data ?? {}) as Record<string, unknown>);
      };
      channel.bind_global(fn);
      return () => channel.unbind_global(fn);
    },
    onStatus: (listener) => {
      const report = () => listener(pusher.connection.state === "connected");
      pusher.connection.bind("state_change", report);
      report();
      return () => {
        pusher.connection.unbind("state_change", report);
      };
    },
    disconnect: () => pusher.disconnect(),
  };
};

let instance: Promise<RealtimeClient | null> | null = null;

/** The realtime client, or null if the API can't be reached (callers then poll). */
export const getRealtime = (): Promise<RealtimeClient | null> => {
  instance ??= client
    .query<{ realtimeConfig: RealtimeConfig }>({ query: REALTIME_CONFIG, fetchPolicy: "cache-first" })
    .then(({ data }) => {
      const realtime = data?.realtimeConfig;
      if (!realtime?.enabled) return null;
      if (realtime.provider === "pusher" && realtime.key) return createPusherClient(realtime);
      return createStreamClient(realtime, () => currentTokenVar(), config.apiUri);
    })
    .catch(() => {
      instance = null;
      return null;
    });
  return instance;
};

/** @deprecated use getRealtime — kept for older imports. */
export const getPusher = getRealtime;

/** Drop connections on sign-out so the next member gets fresh ones. */
export const disconnectPusher = async () => {
  const realtime = await instance;
  realtime?.disconnect();
  instance = null;
};
