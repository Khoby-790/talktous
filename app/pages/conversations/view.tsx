import { type FC } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon, InboxIcon } from "@heroicons/react/24/outline";
import { useConversation } from "~/hooks/data";
import ConversationThread from "~/pages/inbox/conversation-thread";
import CustomerSidebar from "~/pages/inbox/customer-sidebar";

export function meta() {
  return [{ title: "Conversation — Asotie" }];
}

const ConversationViewPage: FC = () => {
  const { id = "" } = useParams();
  const { conversation } = useConversation(id);

  return (
    <div className="space-y-4">
      <Link
        to="/conversations"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" /> All conversations
      </Link>
      <div className="flex h-[calc(100dvh-10rem)] min-h-[32rem] overflow-hidden rounded-2xl border border-line">
        <ConversationThread
          key={id}
          conversationId={id}
          className="min-w-0 flex-1"
          headerExtra={
            <Link
              to={`/inbox?conversation=${id}`}
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-surface-2 hover:text-ink sm:inline-flex"
            >
              <InboxIcon className="h-4 w-4" /> Open in inbox
            </Link>
          }
        />
        {conversation && (
          <div className="hidden w-80 shrink-0 border-l border-line lg:block">
            <CustomerSidebar conversation={conversation} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationViewPage;
