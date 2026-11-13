import Pusher from "pusher-js";
import { client } from "~/_graphql";
import { currentTokenVar } from "~/_graphql/cache/auth";
import { REALTIME_CONFIG } from "~/_graphql/queries";
import type { RealtimeConfig } from "~/utils/types";

/**
 * Realtime client for the dashboard. The API says which transport to use
 * (`realtimeConfig.provider`):
 *   - "stream": the API's built-in Server-Sent Events (default; no account needed)
 *   - "pusher": Pusher Channels, when the API has PUSHER_* configured
 * Both are wrapped in the same `subscribe(channel, onEvent)` interface.
 */
export type RealtimeHandler = (event: string, data: Record<string, unknown>) => void;

export interface RealtimeClient {
  provider: "pusher" | "stream";
  subscribe: (channel: string, handler: RealtimeHandler) => () => void;
  disconnect: () => void;
}

/** One EventSource per channel, shared by every subscriber, re-ticketed on reconnect. */
export const createStreamClient = (
  config: Pick<RealtimeConfig, "ticketEndpoint" | "streamEndpoint">,
  getToken: () => string | null,
): RealtimeClient => {
  type Entry = { handlers: Set<RealtimeHandler>; source: EventSource | null; closed: boolean; retry?: number };
  const channels = new Map<string, Entry>();

  const open = async (channel: string, entry: Entry) => {
    if (entry.closed) return;
    try {
      const response = await fetch(config.ticketEndpoint, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${getToken() ?? ""}` },
        body: JSON.stringify({ channels: [channel] }),
      });
      if (!response.ok) throw new Error(`ticket ${response.status}`);
      const { ticket } = (await response.json()) as { ticket: string };
      if (entry.closed) return;
      const source = new EventSource(`${config.streamEndpoint}?ticket=${encodeURIComponent(ticket)}`);
      entry.source = source;
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
        entry.source = null;
        if (!entry.closed) entry.retry = window.setTimeout(() => void open(channel, entry), 3000);
      };
    } catch {
      if (!entry.closed) entry.retry = window.setTimeout(() => void open(channel, entry), 5000);
    }
  };

  return {
    provider: "stream",
    subscribe: (channel, handler) => {
      let entry = channels.get(channel);
      if (!entry) {
        entry = { handlers: new Set(), source: null, closed: false };
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
          channels.delete(channel);
        }
      };
    },
    disconnect: () => {
      for (const [channel, entry] of channels) {
        entry.closed = true;
        window.clearTimeout(entry.retry);
        entry.source?.close();
        channels.delete(channel);
      }
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
    disconnect: () => pusher.disconnect(),
  };
};

let instance: Promise<RealtimeClient | null> | null = null;

/** The realtime client, or null if the API can't be reached (callers then poll). */
export const getRealtime = (): Promise<RealtimeClient | null> => {
  instance ??= client
    .query<{ realtimeConfig: RealtimeConfig }>({ query: REALTIME_CONFIG, fetchPolicy: "cache-first" })
    .then(({ data }) => {
      const config = data?.realtimeConfig;
      if (!config?.enabled) return null;
      if (config.provider === "pusher" && config.key) return createPusherClient(config);
      return createStreamClient(config, () => currentTokenVar());
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
