import { type ReactNode } from "react";
import { cn } from "~/lib/utils";
import { TableShimmer } from "~/components/shimmer";
import { EmptyState, ErrorState } from "~/components/core";

interface Column {
  label: string;
  key: string;
  width?: string;
}

interface TableComponentProps<T> {
  title?: string;
  columns: Column[];
  data: T[];
  loading: boolean;
  /** A failed request: shown instead of the empty state, with a retry. */
  error?: unknown;
  onRetry?: () => void;
  renderItem: (item: T, index: number) => ReactNode;
  renderFilter?: ReactNode;
  renderLoader?: ReactNode;
  pagination?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  className?: string;
}

export function TableComponent<T>({
  title,
  columns,
  data,
  loading,
  error,
  onRetry,
  renderItem,
  renderFilter,
  renderLoader,
  pagination,
  emptyTitle = "No data",
  emptyDescription,
  emptyAction,
  className,
}: TableComponentProps<T>) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface",
        className
      )}
    >
      {(title || renderFilter) && (
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3">
          {title && <h3 className="type-title-sm text-ink">{title}</h3>}
          {renderFilter && <div>{renderFilter}</div>}
        </div>
      )}
      {/* The body is its own pane: the header row stays put while rows scroll. */}
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="type-body w-full">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="bg-surface-2/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    // (An inset shadow, not a border: collapsed borders don't travel with a sticky header.)
                    "h-10 whitespace-nowrap px-4 text-left text-xs font-medium uppercase tracking-[0.08em] text-ink-muted shadow-[inset_0_-1px_0_var(--line)]",
                    col.width
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  {renderLoader || <TableShimmer cols={columns.length} />}
                </td>
              </tr>
            ) : error && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <ErrorState onRetry={onRetry} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <tr
                  key={i}
                  className="h-11 border-t border-line transition-colors duration-150 first:border-t-0 hover:bg-surface-2/40"
                >
                  {renderItem(item, i)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && <div className="shrink-0 border-t border-line">{pagination}</div>}
    </div>
  );
}
