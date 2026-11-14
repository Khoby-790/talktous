import { useReactiveVar } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import { currentConfigVar } from "~/_graphql/cache/config";
import { currentOrgVar } from "~/_graphql/cache/auth";
import { getRealtime } from "~/utils/pusher";

export type OrgEvent =
  | "conversation.created"
  | "conversation.assigned"
  | "conversation.updated"
  | "conversation.resolved"
  | "message.created"
  | "agent.status_changed";

export type OrgEventPayload = {
  conversationId?: string;
  messageId?: string;
  senderType?: string;
  isInternal?: boolean;
  [key: string]: unknown;
};

/**
 * Subscribe to the organization's realtime channel. Returns whether events are
 * actually flowing right now — not merely whether we subscribed — so callers
 * can fall back to polling while the connection is down.
 *
 *   useConversationSubscription(["message.created"], (event, data) => { … })
 */
export const useConversationSubscription = (
  events: OrgEvent[],
  handler: (event: OrgEvent, data: OrgEventPayload) => void,
): { realtime: boolean } => {
  const org = useReactiveVar(currentOrgVar);
  const [realtime, setRealtime] = useState(false);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const key = events.join(",");

  useEffect(() => {
    if (!org?.id) return;
    let cancelled = false;
    let cleanup = () => {};
    void getRealtime().then((client) => {
      if (cancelled || !client) return;
      const unsubscribe = client.subscribe(`private-org-${org.id}`, (event, data) => {
        if (events.includes(event as OrgEvent)) handlerRef.current(event as OrgEvent, data as OrgEventPayload);
      });
      const unwatch = client.onStatus((connected) => {
        if (!cancelled) setRealtime(connected);
      });
      cleanup = () => {
        unsubscribe();
        unwatch();
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id, key]);

  return { realtime };
};

/**
 * Keep a view fresh: refetch on matching realtime events (debounced), poll
 * every `pollInterval` while realtime is unavailable or disconnected, and
 * refetch once when it reconnects to pick up whatever was missed.
 */
export const useLiveRefetch = (
  refetch: () => unknown,
  events: OrgEvent[] = [
    "conversation.created",
    "conversation.assigned",
    "conversation.updated",
    "conversation.resolved",
    "message.created",
  ],
  filter?: (event: OrgEvent, data: OrgEventPayload) => boolean,
) => {
  const { pollInterval } = useReactiveVar(currentConfigVar);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const { realtime } = useConversationSubscription(events, (event, data) => {
    if (filter && !filter(event, data)) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void refetchRef.current(), 250);
  });

  // Events sent while we were disconnected are gone; catch up on reconnect.
  const wasLive = useRef(false);
  useEffect(() => {
    if (!realtime) return;
    if (wasLive.current) void refetchRef.current();
    wasLive.current = true;
  }, [realtime]);

  useEffect(() => {
    if (realtime) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refetchRef.current();
    }, pollInterval);
    return () => clearInterval(id);
  }, [realtime, pollInterval]);

  return { realtime };
};
