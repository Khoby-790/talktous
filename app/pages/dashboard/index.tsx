import { type FC } from "react";
import { Header } from "~/components/layouts";
import { mockDashboardStats, mockAgents, mockConversations, mockCustomers } from "~/mock/data";
import { Avatar, Badge, StatusDot, Card } from "~/components/core";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/20/solid";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatRelative } from "~/utils/date";
import { cn } from "~/lib/utils";

const StatCard: FC<{
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down";
  accent?: string;
}> = ({ label, value, delta, trend, accent = "var(--color-primary-600)" }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">{label}</p>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)` }}>
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
      </span>
    </div>
    <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
    {delta && (
      <div className="mt-1.5 flex items-center gap-1 text-xs">
        <span className={cn("inline-flex items-center gap-0.5 font-semibold", trend === "down" ? "text-red-500" : "text-emerald-600 dark:text-emerald-400")}>
          {trend === "down" ? <ArrowTrendingDownIcon className="h-3.5 w-3.5" /> : <ArrowTrendingUpIcon className="h-3.5 w-3.5" />}
          {delta}
        </span>
        <span className="text-ink-muted">vs last week</span>
      </div>
    )}
  </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs shadow-[var(--shadow-pop)]">
      <p className="font-semibold text-ink">{label}</p>
      <p className="text-primary-600 dark:text-primary-400">{payload[0].value} conversations</p>
    </div>
  );
};

const DashboardPage: FC = () => {
  const stats = mockDashboardStats;
  const onlineAgents = mockAgents.filter((a) => a.status === "online" || a.status === "busy");
  const recentConversations = mockConversations.slice(0, 4);

  return (
    <div className="space-y-6">
      <Header title="Dashboard" description="Overview of your support operations" />

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open" value={stats.openConversations} delta="12%" trend="up" accent="#1a5cff" />
        <StatCard label="Pending" value={stats.pendingConversations} delta="4%" trend="down" accent="#f59e0b" />
        <StatCard label="Resolved today" value={stats.resolvedToday} delta="18%" trend="up" accent="#10b981" />
        <StatCard label="CSAT Score" value={`${stats.csatScore}/5`} delta="0.3" trend="up" accent="#8b5cf6" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">Conversations This Week</h3>
            <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium text-ink-soft">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.conversationsByDay} barSize={26}>
              <CartesianGrid vertical={false} stroke="var(--line)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--surface-2)" }} />
              <Bar dataKey="count" fill="var(--color-primary-600)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Online agents */}
        <Card className="p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink">
            Online Agents
            <span className="rounded-full bg-emerald-500/12 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
              {onlineAgents.length} live
            </span>
          </h3>
          <div className="space-y-3.5">
            {onlineAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={agent.name} size="sm" />
                  <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">{agent.name}</p>
                  <p className="text-[11px] capitalize text-ink-muted">{agent.status}</p>
                </div>
                <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary-700 dark:text-primary-300">
                  {agent.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent conversations */}
      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="text-sm font-semibold text-ink">Recent Conversations</h3>
          <a href="/conversations" className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">View all</a>
        </div>
        {recentConversations.map((conv) => {
          const customer = mockCustomers.find((c) => c.id === conv.customerId);
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <div
              key={conv.id}
              className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-2/50"
            >
              <Avatar name={customer?.name || "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink">{customer?.name}</p>
                <p className="truncate text-xs text-ink-soft">{lastMsg?.content}</p>
              </div>
              <Badge status={conv.status} />
              <span className="text-[11px] text-ink-muted">{formatRelative(conv.updatedAt)}</span>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

export default DashboardPage;
