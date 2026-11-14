import { type FC } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Avatar, EmptyState, EmptyValue, ErrorState, Paginator } from "~/components/core";
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

  const { customers, count, loading, error, refetch } = useCustomers(
    { search: search || null },
    { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE },
    sort,
  );

  return (
    // From md up the page fits the window; the table scrolls as its own pane.
    <div className="flex flex-col md:h-full">
      <Header title="Customers" description="Everyone who has talked to your team, across every channel." />

      <div className="md:min-h-[24rem] md:flex-1 md:basis-0">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface md:max-h-full">
          <div className="flex shrink-0 flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end">
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
          ) : error && customers.length === 0 ? (
            <ErrorState title="We couldn't load customers." onRetry={() => void refetch()} />
          ) : customers.length === 0 ? (
            <EmptyState
              title={search ? "No customers match this search" : "No customers yet"}
              description={
                search
                  ? "Try a different name, email or phone number."
                  : "Customers are added automatically when they first message one of your apps."
              }
            />
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="type-body w-full">
                  <thead className="sticky top-0 z-10 bg-surface text-left">
                    <tr className="bg-surface-2/40">
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)]">Customer</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] hidden w-full md:table-cell">Email</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] hidden lg:table-cell">Phone</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] text-right">Conversations</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] hidden text-right sm:table-cell">First seen</th>
                      <th className="h-10 whitespace-nowrap px-4 text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)] text-right">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr
                        key={c.id}
                        tabIndex={0}
                        onClick={() => navigate(`/customers/${c.id}`)}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/customers/${c.id}`)}
                        className="h-11 cursor-pointer border-t border-line transition-colors duration-150 first:border-t-0 hover:bg-surface-2/40 focus-visible:-outline-offset-2"
                      >
                        <td className="px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.name} src={c.avatarUrl} size="sm" className="shrink-0" />
                            <span className="max-w-[14rem] truncate font-medium text-ink">{c.name}</span>
                          </div>
                        </td>
                        <td className="hidden max-w-0 truncate px-4 text-ink-muted md:table-cell">
                          {c.email ?? c.externalId ?? <EmptyValue />}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 tabular-nums text-ink-soft lg:table-cell">{c.phone ?? <EmptyValue />}</td>
                        <td className="whitespace-nowrap px-4 text-right tabular-nums text-ink">
                          {c.openConversationCount > 0 && (
                            <span className="type-caption mr-2 font-normal text-ink-muted">{c.openConversationCount} open</span>
                          )}
                          {c.conversationCount}
                        </td>
                        <td className="hidden whitespace-nowrap px-4 text-right tabular-nums text-ink-soft sm:table-cell">{formatDate(c.firstSeenAt)}</td>
                        <td className="type-caption whitespace-nowrap px-4 text-right font-normal tabular-nums text-ink-muted">{formatRelative(c.lastSeenAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default CustomersPage;
