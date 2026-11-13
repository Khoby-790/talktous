import { useApolloClient, useReactiveVar } from "@apollo/client/react";
import { useRef } from "react";
import { currentUserVar } from "~/_graphql/cache/auth";
import { CONVERSATION } from "~/_graphql/queries";
import type { ConversationDetail } from "~/utils/types";
import { useConversationSubscription, type OrgEvent, type OrgEventPayload } from "./use-conversation-subscription";

/** A short two-tone chime, synthesized so there's no audio file to ship. */
const chime = () => {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    [880, 1320].forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      const start = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.15, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => void ctx.close(), 800);
  } catch {
    /* audio blocked until the user has interacted with the page — fine */
  }
};

/**
 * Desktop notification + sound for things that need this member's attention,
 * honouring their Profile preferences:
 *   - a new conversation,
 *   - a conversation assigned to them (by someone else),
 *   - a customer message in a conversation that's theirs or unassigned.
 * Desktop notifications only show while the tab is in the background; the
 * sound plays either way.
 */
export const useDesktopNotifications = () => {
  const user = useReactiveVar(currentUserVar);
  const apollo = useApolloClient();
  const recent = useRef(new Set<string>());

  const notify = (key: string, title: string, body: string, conversationId?: string) => {
    if (recent.current.has(key)) return;
    recent.current.add(key);
    setTimeout(() => recent.current.delete(key), 10_000);

    const prefs = user?.preferences;
    if (prefs?.soundEnabled !== false) chime();
    const canShow =
      prefs?.desktopNotifications !== false &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      document.visibilityState !== "visible";
    if (!canShow) return;
    const notification = new Notification(title, { body, tag: key, icon: "/icon-512.png" });
    notification.onclick = () => {
      window.focus();
      if (conversationId) window.location.assign(`/inbox?conversation=${conversationId}`);
      notification.close();
    };
  };

  useConversationSubscription(
    ["conversation.created", "conversation.assigned", "message.created"],
    (event: OrgEvent, data: OrgEventPayload) => {
      if (!user) return;
      const conversationId = data.conversationId;
      if (event === "conversation.created") {
        notify(`new-${conversationId}`, "New conversation", `${String(data.customerName ?? "A customer")} started a conversation`, conversationId);
        return;
      }
      if (event === "conversation.assigned") {
        if (data.assignedAgentId === user.id && data.actorName !== user.name) {
          notify(`assigned-${conversationId}`, "Assigned to you", `${String(data.actorName ?? "Someone")} assigned you a conversation`, conversationId);
        }
        return;
      }
      if (event === "message.created" && data.senderType === "customer" && !data.isInternal && conversationId) {
        // A new conversation already notified for its first message.
        if (recent.current.has(`new-${conversationId}`)) return;
        void apollo
          .query<{ conversation: ConversationDetail }>({
            query: CONVERSATION,
            variables: { id: conversationId, limit: 1 },
            fetchPolicy: "network-only",
          })
          .then(({ data: result }) => {
            const conversation = result?.conversation;
            if (!conversation) return;
            if (conversation.assignedAgentId && conversation.assignedAgentId !== user.id) return;
            notify(
              `msg-${String(data.messageId)}`,
              conversation.customer.name,
              conversation.lastMessagePreview ?? "New message",
              conversationId,
            );
          })
          .catch(() => undefined);
      }
    },
  );
};
