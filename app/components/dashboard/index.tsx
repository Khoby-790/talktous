import { type FC, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import { Avatar, Card, channelLabel, StatusDot } from "~/components/core";
import { cn } from "~/lib/utils";
import { formatDuration, formatRelative } from "~/utils/date";
import type { ActivityEvent, DashboardStats } from "~/utils/types";

/** A metric: a label, the number, and how it moved. Nothing decorative. */
export const StatCard: FC<{
  label: string;
  value: ReactNode;
  /** % change vs the previous period; null hides the delta. */
  delta?: number | null;
  /** True when a decrease is the good direction (e.g. response time). */
  lowerIsBetter?: boolean;
  deltaLabel?: string;
  hint?: ReactNode;
  /** Small print beside the label, e.g. the sample size behind an average. */
  meta?: ReactNode;
  className?: string;
}> = ({ label, value, delta, lowerIsBetter, deltaLabel, hint, meta, className }) => {
  const hasDelta = delta !== null && delta !== undefined;
  const good = !hasDelta ? null : lowerIsBetter ? delta <= 0 : delta >= 0;
  return (
    <Card className={cn("@container flex flex-col p-4", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="label-caps truncate text-ink-soft">{label}</p>
        {meta && <span className="type-caption shrink-0 font-normal tabular-nums text-ink-muted">{meta}</span>}
      </div>
      <p className="mt-1.5 text-[1.75rem] font-medium leading-[2.125rem] tracking-[-0.02em] text-figure tabular-nums">
        {value}
      </p>
      <div className="type-caption mt-1 flex min-h-[22px] flex-wrap items-center gap-x-2 gap-y-1 font-normal text-ink-muted">
        {hasDelta && (
          // The arrow carries the direction, so colour is never the only signal.
          <span
            title={deltaLabel}
            className={cn(
              "inline-flex h-[22px] shrink-0 items-center gap-0.5 rounded-md px-1.5 font-medium tabular-nums",
              good
                ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                : "bg-red-500/12 text-red-700 dark:text-red-300",
            )}
          >
            {delta < 0 ? <ArrowTrendingDownIcon className="h-3.5 w-3.5" /> : <ArrowTrendingUpIcon className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {hasDelta && deltaLabel && <span className="hidden truncate @[13rem]:inline">{deltaLabel}</span>}
        {hint && <span className="min-w-0">{hint}</span>}
      </div>
    </Card>
  );
};

/**
 * A pane: its title stays pinned and its body scrolls on its own, so a view
 * can fit the window instead of stretching down the page.
 */
export const Pane: FC<{ title: string; aside?: ReactNode; className?: string; bodyClassName?: string; children: ReactNode }> = ({
  title,
  aside,
  className,
  bodyClassName,
  children,
}) => (
  <Card className={cn("flex min-h-0 flex-col", className)}>
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-4 pt-4">
      <h3 className="label-caps text-ink-soft">{title}</h3>
      {aside}
    </div>
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3", bodyClassName)}>{children}</div>
  </Card>
);

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--pop-border)",
  borderRadius: 6,
  boxShadow: "var(--pop-shadow)",
  padding: "8px 12px",
  fontSize: 12,
  color: "var(--ink)",
};

/** Key for the volume chart; sits in the pane header beside the title. */
export const VolumeLegend: FC = () => (
  <div className="type-caption flex items-center gap-4 font-normal text-ink-soft">
    <span className="flex items-center gap-1.5">
      <span className="h-0.5 w-4 rounded-full" style={{ background: "var(--chart-main)" }} /> New
    </span>
    <span className="flex items-center gap-1.5">
      <span className="w-4 border-t-2 border-dashed border-ink-muted" /> Resolved
    </span>
  </div>
);

/**
 * One main series (new conversations), with resolved as a muted, dashed
 * comparison. State colours stay out of charts. Fills its container's height.
 */
export const VolumeChart: FC<{ data: DashboardStats["volume"] }> = ({ data }) => {
  const rows = data.map((d) => ({ ...d, label: format(parseISO(d.date), data.length > 31 ? "dd MMM" : "EEE d") }));
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 480, height: 240 }}>
      <ComposedChart data={rows} margin={{ left: -22, right: 8, top: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="volume-new" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-main)" stopOpacity={0.2} />
            <stop offset="100%" stopColor="var(--chart-main)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 4" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--ink-muted)" }}
          axisLine={false}
          tickLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "var(--ink-muted)", marginBottom: 2 }}
          itemStyle={{ color: "var(--ink)", padding: 0 }}
          cursor={{ stroke: "var(--line-strong)" }}
        />
        <Area
          type="monotone"
          dataKey="created"
          name="New"
          stroke="var(--chart-main)"
          strokeWidth={2}
          fill="url(#volume-new)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          name="Resolved"
          stroke="var(--ink-muted)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

const SERIES = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)"];

/**
 * Share of conversations per channel as one segmented bar with the numbers
 * beside it. Segments step in lightness, largest first.
 */
export const ChannelStrip: FC<{ data: DashboardStats["channels"]; className?: string }> = ({ data, className }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (!total) return null;
  const rows = [...data].sort((a, b) => b.count - a.count);
  return (
    <div className={className}>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Conversations by channel">
        {rows.map((row, i) => (
          <span key={row.channel} style={{ width: `${(row.count / total) * 100}%`, background: SERIES[i % SERIES.length] }} />
        ))}
      </div>
      <ul className="type-caption mt-2 flex flex-wrap gap-x-5 gap-y-1 font-normal text-ink-muted">
        {rows.map((row, i) => (
          <li key={row.channel} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: SERIES[i % SERIES.length] }} />
            <span className="text-ink-soft">{channelLabel(row.channel)}</span>
            <span className="font-medium tabular-nums text-ink">{row.count}</span>
            <span className="tabular-nums">{Math.round((row.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const TopAgents: FC<{ rows: DashboardStats["topAgents"] }> = ({ rows }) => {
  if (!rows.length) {
    return <p className="type-body py-6 text-center text-ink-muted">Agents appear here once conversations are assigned.</p>;
  }
  return (
    <div className="divide-y divide-line">
      {rows.map((row, i) => (
        <div key={row.agent?.id ?? i} className="flex h-14 items-center gap-3">
          <span className="type-caption w-4 font-normal tabular-nums text-ink-muted">{i + 1}</span>
          <div className="relative shrink-0">
            <Avatar name={row.agent?.name ?? "?"} src={row.agent?.avatarUrl} size="sm" />
            {row.agent && (
              <StatusDot status={row.agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {row.agent ? (
              <Link to={`/agents/${row.agent.id}`} className="type-body block truncate font-medium text-ink hover:underline">
                {row.agent.name}
              </Link>
            ) : (
              <span className="type-body text-ink-muted">Removed agent</span>
            )}
            <p className="type-caption truncate font-normal text-ink-muted">
              First reply {formatDuration(row.avgFirstResponseSeconds)}
              {row.csatScore !== null && ` · CSAT ${row.csatScore.toFixed(1)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="type-body font-medium tabular-nums text-figure">{row.resolved}</p>
            <p className="type-caption font-normal text-ink-muted">resolved</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ActivityFeed: FC<{ events: ActivityEvent[] }> = ({ events }) => {
  if (!events.length) {
    return <p className="type-body py-6 text-center text-ink-muted">New conversations and replies will show up here.</p>;
  }
  return (
    <ol className="divide-y divide-line">
      {events.map((event) => {
        const body = (
          <>
            <p className="type-body truncate text-ink">{event.summary}</p>
            <p className="type-caption font-normal text-ink-muted">{formatRelative(event.createdAt)}</p>
          </>
        );
        return (
          <li key={event.id} className="flex h-14 flex-col justify-center">
            {event.conversationId ? (
              <Link to={`/conversations/${event.conversationId}`} className="min-w-0 rounded-md hover:opacity-80">
                {body}
              </Link>
            ) : (
              <div className="min-w-0">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
};
