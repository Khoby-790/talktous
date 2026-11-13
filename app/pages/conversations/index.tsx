import { type FC } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Avatar, Badge, ChannelBadge, EmptyState, Paginator, PriorityBadge } from "~/components/core";
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

  const { conversations, count, loading } = useConversations(
    filter,
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    sort,
  );
  const { agents } = useAgents({ includePending: false });
  const { apps } = useApps();
  const { tags } = useConversationTags();

  const activeFilters = ["status", "channel", "priority", "assignee", "app", "tag", "search"].filter((k) => get(k)).length;

  return (
    <div className="space-y-6">
      <Header title="Conversations" description="Every conversation across your apps and channels." />

      <div className="rounded-2xl border border-line bg-surface">
        <div className="space-y-3 border-b border-line p-4">
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
                  className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-300"
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
        ) : conversations.length === 0 ? (
          <EmptyState
            title={activeFilters ? "No conversations match" : "No conversations yet"}
            description={
              activeFilters
                ? "Try removing some filters."
                : "Conversations appear here as soon as customers reach out through one of your apps."
            }
          />
        ) : (
          <>
            {/* Table on wide screens */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2/60 text-left text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Channel</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Assignee</th>
                    <th className="px-5 py-3 text-right">Last activity</th>
                  </tr>
                </thead>
                <tbody>
                  {conversations.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/conversations/${c.id}`)}
                      onKeyDown={(e) => e.key === "Enter" && navigate(`/conversations/${c.id}`)}
                      tabIndex={0}
                      className="cursor-pointer border-t border-line transition-colors hover:bg-surface-2/50 focus:bg-surface-2/50 focus:outline-none"
                    >
                      <td className="max-w-xs px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="sm" className="shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{c.customer.name}</p>
                            <p className="truncate text-xs text-ink-muted">{c.subject ?? c.lastMessagePreview ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge status={c.status} />
                      </td>
                      <td className="px-5 py-3">
                        <ChannelBadge channel={c.channel} />
                      </td>
                      <td className="px-5 py-3">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{c.assignedAgent?.name ?? <span className="text-ink-muted">Unassigned</span>}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-ink-muted" title={formatDateTime(c.lastMessageAt)}>
                        {formatShort(c.lastMessageAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards on phones */}
            <div className="md:hidden">
              {conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/conversations/${c.id}`)}
                  className="flex w-full gap-3 border-t border-line px-4 py-3 text-left hover:bg-surface-2/50"
                >
                  <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="sm" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-ink">{c.customer.name}</p>
                      <span className="shrink-0 text-[11px] text-ink-muted">{formatShort(c.lastMessageAt)}</span>
                    </div>
                    <p className="truncate text-xs text-ink-muted">{c.subject ?? c.lastMessagePreview ?? "—"}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <Badge status={c.status} />
                      <ChannelBadge channel={c.channel} />
                      <PriorityBadge priority={c.priority} />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-line">
              <Paginator total={count} page={page} pageSize={PAGE_SIZE} onPageChange={(p) => set("page", p > 1 ? String(p) : "")} />
            </div>
          </>
        )}
      </div>
      {activeFilters > 0 && !loading && (
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <FunnelIcon className="h-3.5 w-3.5" /> {count} conversation{count === 1 ? "" : "s"} match your filters
        </p>
      )}
    </div>
  );
};

export default ConversationsPage;
