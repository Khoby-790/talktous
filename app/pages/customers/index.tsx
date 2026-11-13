import { type FC } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Avatar, EmptyState, EmptyValue, Paginator } from "~/components/core";
import { Header } from "~/components/layouts";
import { TableShimmer } from "~/components/shimmer";
import { FilterSelect } from "~/components/conversations/filter-select";
import { SearchInput } from "~/components/conversations/search-input";
import { useCustomers, type CustomerSort } from "~/hooks/data";
import { formatDate, formatRelative } from "~/utils/date";

export function meta() {
  return [{ title: "Customers — Asotie" }];
}

const PAGE_SIZE = 20;

const SORTS: { value: CustomerSort; label: string }[] = [
  { value: "last_seen_desc", label: "Recently active" },
  { value: "first_seen_desc", label: "Newest" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "conversations_desc", label: "Most conversations" },
];

const CustomersPage: FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const sort = (SORTS.some((s) => s.value === params.get("sort")) ? params.get("sort") : "last_seen_desc") as CustomerSort;
  const page = Math.max(1, Number(params.get("page")) || 1);

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

  const { customers, count, loading } = useCustomers(
    { search: search || null },
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    sort,
  );

  return (
    <div className="space-y-6">
      <Header title="Customers" description="Everyone who has talked to your team, across every channel." />

      <div className="rounded-2xl border border-line bg-surface">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end">
          <SearchInput
            value={search}
            onChange={(v) => set("search", v)}
            placeholder="Search name, email, phone or ID"
            className="sm:max-w-md sm:flex-1"
          />
          <FilterSelect
            label="Sort"
            value={sort}
            options={SORTS}
            onChange={(v) => set("sort", v === "last_seen_desc" ? "" : v)}
            className="sm:ml-auto sm:w-48"
          />
        </div>

        {loading && customers.length === 0 ? (
          <TableShimmer rows={8} cols={4} />
        ) : customers.length === 0 ? (
          <EmptyState
            title={search ? "No customers match" : "No customers yet"}
            description={
              search
                ? "Try a different search."
                : "Customers are added automatically when they first message one of your apps."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-2/60 text-left text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                    <th className="px-5 py-3">Customer</th>
                    <th className="hidden px-5 py-3 md:table-cell">Phone</th>
                    <th className="px-5 py-3 text-right">Conversations</th>
                    <th className="hidden px-5 py-3 sm:table-cell">First seen</th>
                    <th className="px-5 py-3 text-right">Last seen</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      tabIndex={0}
                      onClick={() => navigate(`/customers/${c.id}`)}
                      onKeyDown={(e) => e.key === "Enter" && navigate(`/customers/${c.id}`)}
                      className="cursor-pointer border-t border-line transition-colors hover:bg-surface-2/50 focus:bg-surface-2/50 focus:outline-none"
                    >
                      <td className="max-w-xs px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={c.name} src={c.avatarUrl} size="sm" className="shrink-0" />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{c.name}</p>
                            <p className="truncate text-xs text-ink-muted">{c.email ?? c.externalId ?? "No email"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-3 text-ink-soft md:table-cell">{c.phone ?? <EmptyValue />}</td>
                      <td className="px-5 py-3 text-right tabular-nums text-ink">
                        {c.conversationCount}
                        {c.openConversationCount > 0 && (
                          <span className="ml-1.5 rounded-md bg-primary-500/10 px-1.5 py-0.5 text-[10px] text-primary-700 dark:text-primary-300">
                            {c.openConversationCount} open
                          </span>
                        )}
                      </td>
                      <td className="hidden whitespace-nowrap px-5 py-3 text-ink-soft sm:table-cell">{formatDate(c.firstSeenAt)}</td>
                      <td className="whitespace-nowrap px-5 py-3 text-right text-xs text-ink-muted">{formatRelative(c.lastSeenAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-line">
              <Paginator total={count} page={page} pageSize={PAGE_SIZE} onPageChange={(p) => set("page", p > 1 ? String(p) : "")} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomersPage;
