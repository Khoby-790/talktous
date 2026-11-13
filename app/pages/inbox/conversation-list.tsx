import { type FC, useState } from "react";
import { AutoReplyBadge, TriageBadges } from "~/components/conversations/triage";
import { Avatar, ChannelBadge, EmptyState, PriorityBadge } from "~/components/core";
import { Shimmer } from "~/components/shimmer";
import { SearchInput } from "~/components/conversations/search-input";
import { useConversations, useInboxCounts } from "~/hooks/data";
import { useLiveRefetch } from "~/hooks/ui/use-conversation-subscription";
import { cn } from "~/lib/utils";
import { formatShort } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import type { ConversationFilter, ConversationStatus, ConversationSummary } from "~/utils/types";

export type InboxView = "mine" | "unassigned" | "all";
export type InboxStatus = "active" | "open" | "pending" | "resolved";

const VIEWS: { value: InboxView; label: string }[] = [
  { value: "mine", label: "Mine" },
  { value: "unassigned", label: "Unassigned" },
  { value: "all", label: "All" },
];

const STATUSES: { value: InboxStatus; label: string }[] = [
  { value: "active", label: "Open & pending" },
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
];

const STATUS_FILTER: Record<InboxStatus, ConversationStatus[]> = {
  active: ["open", "pending"],
  open: ["open"],
  pending: ["pending"],
  resolved: ["resolved", "closed"],
};

const PAGE = 30;

const ListItem: FC<{ conversation: ConversationSummary; active: boolean; onSelect: () => void }> = ({
  conversation: c,
  active,
  onSelect,
}) => {
  const unread = c.unreadCount > 0;
  const preview =
    (c.lastMessageSenderType === "agent" ? "You: " : c.lastMessageSenderType === "bot" ? "AI: " : "") +
    (c.lastMessagePreview ?? c.subject ?? "No messages yet");
  return (
    <button
      onClick={onSelect}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex w-full gap-3 border-b border-line px-4 py-3 text-left transition",
        active ? "bg-primary-500/10 dark:bg-kelp" : "hover:bg-surface-2/60",
      )}
    >
      <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={cn("truncate text-sm", unread ? "font-medium text-ink" : "text-ink-soft")}>{c.customer.name}</p>
          <span className={cn("shrink-0 text-[11px]", unread ? "text-primary-600 dark:text-primary-300" : "text-ink-muted")}>
            {formatShort(c.lastMessageAt)}
          </span>
        </div>
        <p className={cn("mt-0.5 truncate text-xs", unread ? "text-ink" : "text-ink-muted")}>{preview}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <ChannelBadge channel={c.channel} appName={c.app?.name} className="px-1.5 py-0 text-[10px]" />
          {(c.priority === "high" || c.priority === "urgent") && <PriorityBadge priority={c.priority} className="text-[10px]" />}
          <AutoReplyBadge autoReply={c.aiAutoReply} />
          <TriageBadges triage={c.aiTriage} />
          <span className="flex-1" />
          {c.assignedAgent && (
            <Avatar name={c.assignedAgent.name} src={c.assignedAgent.avatarUrl} size="sm" className="h-5 w-5 text-[9px]" />
          )}
          {unread && (
            <span className="rounded-full bg-primary-600 px-1.5 text-[10px] font-medium leading-4 text-white">
              {c.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

const ConversationList: FC<ConversationListProps> = ({ activeId, onSelect, className }) => {
  const [viewParam, setView] = useUrlState("view");
  const [statusParam, setStatus] = useUrlState("status");
  const [search, setSearch] = useUrlState("q");
  const [limit, setLimit] = useState(PAGE);

  const view: InboxView = VIEWS.some((v) => v.value === viewParam) ? (viewParam as InboxView) : "all";
  const status: InboxStatus = STATUSES.some((s) => s.value === statusParam) ? (statusParam as InboxStatus) : "active";

  const filter: ConversationFilter = {
    status: STATUS_FILTER[status],
    assignee: view === "mine" ? "me" : view === "unassigned" ? "unassigned" : null,
    search: search || null,
  };
  const { conversations, count, loading, refetch } = useConversations(filter, { limit });
  const { counts, refetch: refetchCounts } = useInboxCounts();
  useLiveRefetch(() => {
    void refetch();
    void refetchCounts();
  });

  const viewCount = (v: InboxView) =>
    !counts ? undefined : v === "mine" ? counts.mine : v === "unassigned" ? counts.unassigned : counts.open + counts.pending;

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-surface", className)}>
      <div className="space-y-3 border-b border-line p-3">
        <div className="flex items-center justify-between">
          <h2 className="label-caps text-ink-muted">Inbox</h2>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value === "active" ? null : e.target.value);
              setLimit(PAGE);
            }}
            aria-label="Status"
            className="h-8 rounded-md border border-line bg-field px-2 text-xs text-ink outline-none focus:border-primary-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-md bg-surface-2 p-1" role="tablist">
          {VIEWS.map((v) => {
            const n = viewCount(v.value);
            return (
              <button
                key={v.value}
                role="tab"
                aria-selected={view === v.value}
                onClick={() => {
                  setView(v.value === "all" ? null : v.value);
                  setLimit(PAGE);
                }}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition",
                  view === v.value ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink",
                )}
              >
                {v.label}
                {n !== undefined && status === "active" && (
                  <span className="tabular-nums text-ink-muted">{n}</span>
                )}
              </button>
            );
          })}
        </div>
        <SearchInput value={search ?? ""} onChange={(v) => setSearch(v || null)} placeholder="Search name, email, message" />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading && conversations.length === 0 ? (
          <div className="space-y-px">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex gap-3 border-b border-line px-4 py-3">
                <Shimmer className="h-9 w-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Shimmer className="h-3.5 w-1/2" />
                  <Shimmer className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            title={search ? "No matches" : view === "mine" ? "Nothing assigned to you" : "All caught up"}
            description={search ? "Try a different search." : "New conversations will appear here."}
          />
        ) : (
          <>
            {conversations.map((c) => (
              <ListItem key={c.id} conversation={c} active={c.id === activeId} onSelect={() => onSelect(c.id)} />
            ))}
            {count > conversations.length && (
              <div className="p-3 text-center">
                <button
                  onClick={() => setLimit((l) => Math.min(l + PAGE, 100))}
                  disabled={limit >= 100}
                  className="text-xs font-medium text-primary-600 hover:underline disabled:text-ink-muted disabled:no-underline dark:text-primary-300"
                >
                  {limit >= 100 ? `Showing 100 of ${count} — refine your search` : `Load more (${count - conversations.length})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
