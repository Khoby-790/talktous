import { useEffect } from "react";
import { getPusher } from "~/utils/pusher";
import { useReactiveVar } from "@apollo/client/react";
import { currentOrgVar } from "~/_graphql/cache/auth";
import config from "~/config";

type ConversationEvent =
  | "conversation.created"
  | "conversation.assigned"
  | "conversation.resolved"
  | "message.received"
  | "agent.status_changed";

type Handler = (data: unknown) => void;

export const useConversationSubscription = (
  events: ConversationEvent[],
  handler: Handler
) => {
  const org = useReactiveVar(currentOrgVar);

  useEffect(() => {
    if (!org?.id) return;

    const pusher = getPusher();
    const channelName = `${config.pusherChannelPrefix}${org.id}`;
    const channel = pusher.subscribe(channelName);

    events.forEach((event) => channel.bind(event, handler));

    return () => {
      events.forEach((event) => channel.unbind(event, handler));
      pusher.unsubscribe(channelName);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org?.id]);
};
