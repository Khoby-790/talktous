import { type FC } from "react";
import { Link } from "react-router";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Avatar, Badge, ChannelBadge, EmptyValue } from "~/components/core";
import { Shimmer } from "~/components/shimmer";
import { AiSummaryCard } from "~/components/conversations/ai-assist";
import { useConversations } from "~/hooks/data";
import { cn } from "~/lib/utils";
import { formatDate, formatDuration, formatRelative, formatShort } from "~/utils/date";
import type { ConversationDetail } from "~/utils/types";

const Row: FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
    <span className="shrink-0 text-ink-muted">{label}</span>
    <span className="min-w-0 break-words text-right text-ink">{children}</span>
  </div>
);

interface CustomerSidebarProps {
  conversation: ConversationDetail;
  onClose?: () => void;
  /** Link other conversations to the inbox (?conversation=) instead of /conversations/:id. */
  linkToInbox?: boolean;
  className?: string;
}

/** Who the customer is and what else they've asked, next to the thread. */
const CustomerSidebar: FC<CustomerSidebarProps> = ({ conversation, onClose, linkToInbox, className }) => {
  const customer = conversation.customer;
  const { conversations, loading } = useConversations({ customerId: customer.id }, { limit: 6 });
  const others = conversations.filter((c) => c.id !== conversation.id).slice(0, 5);
  const metadata = Object.entries(customer.metadata ?? {});

  return (
    <aside className={cn("flex h-full min-h-0 w-full flex-col overflow-y-auto bg-surface", className)}>
      <div className="flex items-start gap-3 border-b border-line p-5">
        <Avatar name={customer.name} src={customer.avatarUrl} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium text-ink">{customer.name}</p>
          <p className="truncate text-xs text-ink-muted">{customer.email ?? customer.phone ?? "Anonymous visitor"}</p>
          <Link
            to={`/customers/${customer.id}`}
            className="mt-1.5 inline-block text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
          >
            View profile →
          </Link>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
            aria-label="Close customer details"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <AiSummaryCard conversation={conversation} className="m-4 mb-0" />

      <section className="border-b border-line px-5 py-4">
        <p className="label-caps mb-2 text-ink-muted">Contact</p>
        <Row label="Email">{customer.email ?? <EmptyValue />}</Row>
        <Row label="Phone">{customer.phone ?? <EmptyValue />}</Row>
        {customer.externalId && <Row label="External ID">{customer.externalId}</Row>}
        <Row label="First seen">{formatDate(customer.firstSeenAt)}</Row>
        <Row label="Last seen">{formatRelative(customer.lastSeenAt)}</Row>
        <Row label="Conversations">{customer.conversationCount}</Row>
      </section>

      <section className="border-b border-line px-5 py-4">
        <p className="label-caps mb-2 text-ink-muted">This conversation</p>
        <Row label="Channel">
          <ChannelBadge channel={conversation.channel} appName={conversation.app?.name} />
        </Row>
        <Row label="App">{conversation.app?.name ?? <EmptyValue />}</Row>
        <Row label="First response">
          {conversation.firstResponseAt
            ? formatDuration(
                (new Date(conversation.firstResponseAt).getTime() - new Date(conversation.createdAt).getTime()) / 1000,
              )
            : <EmptyValue />}
        </Row>
        {conversation.csatScore && <Row label="CSAT">{conversation.csatScore}/5</Row>}
      </section>

      {metadata.length > 0 && (
        <section className="border-b border-line px-5 py-4">
          <p className="label-caps mb-2 text-ink-muted">Attributes</p>
          {metadata.map(([key, value]) => (
            <Row key={key} label={key}>
              {String(value)}
            </Row>
          ))}
        </section>
      )}

      <section className="px-5 py-4">
        <p className="label-caps mb-2 text-ink-muted">Other conversations</p>
        {loading && others.length === 0 ? (
          <div className="space-y-2">
            <Shimmer className="h-10" />
            <Shimmer className="h-10" />
          </div>
        ) : others.length === 0 ? (
          <p className="text-sm text-ink-muted">None yet.</p>
        ) : (
          <div className="space-y-1">
            {others.map((c) => (
              <Link
                key={c.id}
                to={linkToInbox ? `/inbox?conversation=${c.id}` : `/conversations/${c.id}`}
                className="block rounded-md px-2 py-2 hover:bg-surface-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge status={c.status} />
                  <span className="text-[11px] text-ink-muted">{formatShort(c.lastMessageAt)}</span>
                </div>
                <p className="mt-1 truncate text-xs text-ink-soft">{c.subject ?? c.lastMessagePreview ?? "—"}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
};

export default CustomerSidebar;
