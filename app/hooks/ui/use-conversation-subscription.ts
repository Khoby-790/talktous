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
 * Subscribe to the organization's realtime channel. Returns whether realtime
 * is live, so callers can fall back to polling when it isn't.
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
    void getRealtime().then((realtime) => {
      if (cancelled || !realtime) return;
      cleanup = realtime.subscribe(`private-org-${org.id}`, (event, data) => {
        if (events.includes(event as OrgEvent)) handlerRef.current(event as OrgEvent, data as OrgEventPayload);
      });
      setRealtime(true);
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
 * Keep a view fresh: refetch on matching realtime events (debounced), or poll
 * every `pollInterval` when realtime isn't available.
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

  useEffect(() => {
    if (realtime) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void refetchRef.current();
    }, pollInterval);
    return () => clearInterval(id);
  }, [realtime, pollInterval]);

  return { realtime };
};
