import { type FC, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon } from "@heroicons/react/20/solid";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Avatar, Card, channelLabel, StatusDot } from "~/components/core";
import { cn } from "~/lib/utils";
import { formatDuration, formatRelative } from "~/utils/date";
import type { ActivityEvent, DashboardStats } from "~/utils/types";

export const StatCard: FC<{
  label: string;
  value: ReactNode;
  /** % change vs the previous period; null hides the delta. */
  delta?: number | null;
  /** True when a decrease is the good direction (e.g. response time). */
  lowerIsBetter?: boolean;
  deltaLabel?: string;
  hint?: ReactNode;
  accent?: string;
}> = ({ label, value, delta, lowerIsBetter, deltaLabel, hint, accent = "var(--color-primary-600)" }) => {
  const good = delta === null || delta === undefined ? null : lowerIsBetter ? delta <= 0 : delta >= 0;
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="label-caps text-ink-soft">{label}</p>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md"
          style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        </span>
      </div>
      <p className="mt-4 text-4xl font-medium leading-none tracking-display text-figure tabular-nums sm:text-5xl">
        {value}
      </p>
      <div className="mt-3 flex min-h-[18px] flex-wrap items-center gap-1 text-xs">
        {delta !== null && delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              good ? "text-emerald-600 dark:text-emerald-400" : "text-red-500",
            )}
          >
            {delta < 0 ? <ArrowTrendingDownIcon className="h-3.5 w-3.5" /> : <ArrowTrendingUpIcon className="h-3.5 w-3.5" />}
            {Math.abs(delta)}%
          </span>
        )}
        {delta !== null && delta !== undefined && deltaLabel && <span className="text-ink-muted">{deltaLabel}</span>}
        {hint && <span className="text-ink-muted">{hint}</span>}
      </div>
    </Card>
  );
};

const tooltipStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line-strong)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--ink)",
};

export const VolumeChart: FC<{ data: DashboardStats["volume"] }> = ({ data }) => {
  const rows = data.map((d) => ({ ...d, label: format(parseISO(d.date), data.length > 31 ? "dd MMM" : "EEE d") }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={rows} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--ink-muted)" }}
          axisLine={false}
          tickLine={false}
          minTickGap={20}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: "var(--ink)" }} cursor={{ stroke: "var(--line-strong)" }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: "var(--ink-soft)" }} />
        <Line
          type="monotone"
          dataKey="created"
          name="New"
          stroke="var(--color-primary-500)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="resolved"
          name="Resolved"
          stroke="var(--color-status-resolved)"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ChannelChart: FC<{ data: DashboardStats["channels"] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (!total) return <p className="py-10 text-center text-sm text-ink-muted">No conversations in this period.</p>;
  const rows = data.map((d) => ({ name: channelLabel(d.channel), count: d.count }));
  return (
    <div>
      <ResponsiveContainer width="100%" height={Math.max(120, rows.length * 44)}>
        <BarChart data={rows} layout="vertical" margin={{ left: 0, right: 16 }}>
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 12, fill: "var(--ink-soft)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)" }} />
          <Bar dataKey="count" name="Conversations" fill="var(--color-primary-600)" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-ink-muted">{total} conversations</p>
    </div>
  );
};

export const TopAgents: FC<{ rows: DashboardStats["topAgents"] }> = ({ rows }) => {
  if (!rows.length) return <p className="py-6 text-center text-sm text-ink-muted">No assigned conversations yet.</p>;
  return (
    <div className="divide-y divide-line">
      {rows.map((row, i) => (
        <div key={row.agent?.id ?? i} className="flex items-center gap-3 py-3">
          <span className="w-4 text-xs tabular-nums text-ink-muted">{i + 1}</span>
          <div className="relative shrink-0">
            <Avatar name={row.agent?.name ?? "?"} src={row.agent?.avatarUrl} size="sm" />
            {row.agent && (
              <StatusDot status={row.agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            {row.agent ? (
              <Link to={`/agents/${row.agent.id}`} className="truncate text-sm font-medium text-ink hover:underline">
                {row.agent.name}
              </Link>
            ) : (
              <span className="text-sm text-ink-muted">Removed agent</span>
            )}
            <p className="text-xs text-ink-muted">
              First reply {formatDuration(row.avgFirstResponseSeconds)}
              {row.csatScore !== null && ` · CSAT ${row.csatScore.toFixed(1)}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium tabular-nums text-figure">{row.resolved}</p>
            <p className="text-[11px] text-ink-muted">resolved</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ActivityFeed: FC<{ events: ActivityEvent[] }> = ({ events }) => {
  if (!events.length) return <p className="py-6 text-center text-sm text-ink-muted">No activity yet.</p>;
  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const body = (
          <>
            <p className="text-sm text-ink">{event.summary}</p>
            <p className="text-xs text-ink-muted">{formatRelative(event.createdAt)}</p>
          </>
        );
        return (
          <li key={event.id} className="flex gap-3">
            <span
              className={cn(
                "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                event.type === "conversation.resolved"
                  ? "bg-status-resolved"
                  : event.type === "conversation.created"
                    ? "bg-status-open"
                    : event.type === "agent.status_changed"
                      ? "bg-status-pending"
                      : "bg-primary-400",
              )}
            />
            {event.conversationId ? (
              <Link to={`/conversations/${event.conversationId}`} className="min-w-0 flex-1 hover:opacity-80">
                {body}
              </Link>
            ) : (
              <div className="min-w-0 flex-1">{body}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
};
