import { type FC } from "react";
import { cn } from "~/lib/utils";

export const Shimmer: FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse rounded-md bg-surface-2", className)} />
);

export const TableShimmer: FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2 p-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        {Array.from({ length: cols }).map((_, j) => (
          <Shimmer key={j} className="h-9 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardShimmer: FC = () => (
  <div className="space-y-3 rounded-2xl border border-line bg-surface p-5">
    <Shimmer className="h-4 w-1/3" />
    <Shimmer className="h-8 w-1/2" />
    <Shimmer className="h-3 w-2/3" />
  </div>
);

export const ProfileShimmer: FC = () => (
  <div className="flex items-center gap-3">
    <Shimmer className="h-10 w-10 rounded-full" />
    <div className="flex-1 space-y-2">
      <Shimmer className="h-4 w-1/3" />
      <Shimmer className="h-3 w-1/4" />
    </div>
  </div>
);
