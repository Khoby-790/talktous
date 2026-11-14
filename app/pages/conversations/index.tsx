import { type FC } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Avatar, Badge, ChannelBadge, EmptyState, ErrorState, Paginator, PriorityBadge } from "~/components/core";
import { Header } from "~/components/layouts";
import { TableShimmer } from "~/components/shimmer";
import {
  CHANNEL_OPTIONS,
  FilterSelect,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  withAll,
} from "~/components/conversations/filter-select";
import { SearchInput } from "~/components/conversations/search-input";
import { useAgents, useApps, useConversations, useConversationTags } from "~/hooks/data";
import { formatDateTime, formatShort } from "~/utils/date";
import type {
  ConversationChannel,
  ConversationFilter,
  ConversationPriority,
  ConversationSort,
  ConversationStatus,
} from "~/utils/types";

export function meta() {
  return [{ title: "Conversations — Asotie" }];
}

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { value: "last_message_desc", label: "Latest activity" },
  { value: "created_desc", label: "Newest first" },
  { value: "created_asc", label: "Oldest first" },
  { value: "priority_desc", label: "Priority" },
];

const ConversationsPage: FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const get = (key: string) => params.get(key) ?? "";

  /** Change one filter and go back to the first page. */
  const set = (key: string, value: string) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        if (key !== "page") next.delete("page");
        return next;
      },
      { replace: key !== "page" },
    );

  const page = Math.max(1, Number(params.get("page")) || 1);
  const sort = (SORT_OPTIONS.some((o) => o.value === get("sort")) ? get("sort") : "last_message_desc") as ConversationSort;

  const filter: ConversationFilter = {
    search: get("search") || null,
    status: get("status") ? [get("status") as ConversationStatus] : null,
    channel: (get("channel") as ConversationChannel) || null,
    priority: (get("priority") as ConversationPriority) || null,
    assignee: get("assignee") || null,
    appId: get("app") || null,
    tag: get("tag") || null,
  };

  const { conversations, count, loading, error, refetch } = useConversations(
    filter,
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    sort,
  );
  const { agents } = useAgents({ includePending: false });
  const { apps } = useApps();
  const { tags } = useConversationTags();

  const activeFilters = ["status", "channel", "priority", "assignee", "app", "tag", "search"].filter((k) => get(k)).length;

  return (
    // From md up the page fits the window: the filters stay put and the table
    // is a pane that scrolls on its own, with its header row pinned.
    <div className="flex flex-col md:h-full">
      <Header title="Conversations" description="Every conversation across your apps and channels." />

      <div className="md:min-h-[26rem] md:flex-1 md:basis-0">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface md:max-h-full">
          <div className="shrink-0 space-y-3 border-b border-line p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={get("search")}
                onChange={(v) => set("search", v)}
                placeholder="Search customers, subjects and messages"
                className="sm:max-w-md sm:flex-1"
              />
              <div className="flex items-center gap-3 sm:ml-auto">
                {activeFilters > 0 && (
                  <button
                    onClick={() => setParams(new URLSearchParams(), { replace: true })}
                    className="type-label text-primary-700 hover:underline dark:text-primary-300"
                  >
                    Clear filters ({activeFilters})
                  </button>
                )}
                <FilterSelect label="Sort" value={sort} options={SORT_OPTIONS} onChange={(v) => set("sort", v === "last_message_desc" ? "" : v)} className="w-40" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <FilterSelect label="Status" value={get("status")} options={withAll(STATUS_OPTIONS)} onChange={(v) => set("status", v)} />
              <FilterSelect label="Channel" value={get("channel")} options={withAll(CHANNEL_OPTIONS)} onChange={(v) => set("channel", v)} />
              <FilterSelect label="Priority" value={get("priority")} options={withAll(PRIORITY_OPTIONS)} onChange={(v) => set("priority", v)} />
              <FilterSelect
                label="Assignee"
                value={get("assignee")}
                options={[
                  { value: "", label: "Anyone" },
                  { value: "me", label: "Me" },
                  { value: "unassigned", label: "Unassigned" },
                  ...agents.map((a) => ({ value: a.id, label: a.name })),
                ]}
                onChange={(v) => set("assignee", v)}
              />
              <FilterSelect
                label="App"
                value={get("app")}
                options={withAll(apps.map((a) => ({ value: a.id, label: a.name })))}
                onChange={(v) => set("app", v)}
              />
              <FilterSelect
                label="Tag"
                value={get("tag")}
                options={withAll(tags.map((t) => ({ value: t, label: `#${t}` })))}
                onChange={(v) => set("tag", v)}
              />
            </div>
          </div>

          {loading && conversations.length === 0 ? (
            <TableShimmer rows={8} cols={5} />
          ) : error && conversations.length === 0 ? (
            <ErrorState title="We couldn't load conversations." onRetry={() => void refetch()} />
          ) : conversations.length === 0 ? (
            <EmptyState
              title={activeFilters ? "No conversations match these filters" : "No conversations yet"}
              description={
                activeFilters
                  ? "Remove a filter to see more."
                  : "Conversations appear here as soon as customers reach out through one of your apps."
              }
            />
          ) : (
            <>
              {/* Table on wide screens: 44px rows, one line each */}
              <div className="hidden min-h-0 flex-1 overflow-auto md:block">
                <table className="type-body w-full">
                  <thead className="sticky top-0 z-10 bg-surface text-left">
                    <tr className="bg-surface-2/40">
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)]">Customer</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] w-full">Last message</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)]">Status</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)]">Channel</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)]">Priority</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] hidden lg:table-cell">Assignee</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] text-right">Last activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/conversations/${c.id}`)}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/conversations/${c.id}`)}
                        tabIndex={0}
                        className="h-11 cursor-pointer border-t border-line transition-colors duration-150 first:border-t-0 hover:bg-surface-2/40 focus-visible:-outline-offset-2"
                      >
                        <td className="px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="sm" className="shrink-0" />
                            <span className="max-w-[12rem] truncate font-medium text-ink">{c.customer.name}</span>
                          </div>
                        </td>
                        {/* max-w-0 lets this column take the leftover width and truncate. */}
                        <td className="max-w-0 truncate px-4 text-ink-muted">{c.subject ?? c.lastMessagePreview ?? "—"}</td>
                        <td className="px-4">
                          <Badge status={c.status} />
                        </td>
                        <td className="px-4">
                          <ChannelBadge channel={c.channel} />
                        </td>
                        <td className="px-4">
                          <PriorityBadge priority={c.priority} />
                        </td>
                        <td className="hidden whitespace-nowrap px-4 text-ink-soft lg:table-cell">
                          {c.assignedAgent?.name ?? <span className="text-ink-muted">Unassigned</span>}
                        </td>
                        <td className="type-caption whitespace-nowrap px-4 text-right font-normal tabular-nums text-ink-muted" title={formatDateTime(c.lastMessageAt)}>
                          {formatShort(c.lastMessageAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rows on phones: two lines, then the status */}
              <div className="md:hidden">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate(`/conversations/${c.id}`)}
                    className="flex w-full gap-3 border-t border-line px-4 py-3 text-left transition-colors duration-150 first:border-t-0 hover:bg-surface-2/40 focus-visible:-outline-offset-2"
                  >
                    <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="sm" className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="type-body truncate font-medium text-ink">{c.customer.name}</p>
                        <span className="type-caption shrink-0 font-normal text-ink-muted">{formatShort(c.lastMessageAt)}</span>
                      </div>
                      <p className="type-body truncate text-ink-muted">{c.subject ?? c.lastMessagePreview ?? "—"}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <Badge status={c.status} />
                        <ChannelBadge channel={c.channel} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="shrink-0 border-t border-line">
                <Paginator total={count} page={page} pageSize={PAGE_SIZE} onPageChange={(p) => set("page", p > 1 ? String(p) : "")} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
