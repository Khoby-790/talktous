import { type ReactNode } from "react";
import { cn } from "~/lib/utils";
import { TableShimmer } from "~/components/shimmer";
import { EmptyState } from "~/components/core";

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
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]",
        className
      )}
    >
      {(title || renderFilter) && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
          {renderFilter && <div>{renderFilter}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-2/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-ink-muted",
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
                  className="border-t border-line transition-colors hover:bg-surface-2/50"
                >
                  {renderItem(item, i)}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {pagination && <div className="border-t border-line">{pagination}</div>}
    </div>
  );
}
