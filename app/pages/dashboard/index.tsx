import { type FC } from "react";
import { Header } from "~/components/layouts";
import { mockDashboardStats, mockAgents, mockConversations, mockCustomers } from "~/mock/data";
import { Avatar, Badge, StatusDot } from "~/components/core";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { formatRelative } from "~/utils/date";

const StatCard: FC<{ label: string; value: string | number; sub?: string; accent?: string }> = ({
  label, value, sub, accent = "#8b5cf6",
}) => (
  <div
    className="rounded-xl border p-5"
    style={{ background: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
  >
    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${accent}20` }}>
      <div className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
    </div>
    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
    <p className="mt-1.5 text-3xl font-bold text-slate-100">{value}</p>
    {sub && <p className="mt-1 text-xs text-slate-600">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-xl"
      style={{ background: "var(--color-surface-elevated)", borderColor: "var(--color-surface-border)" }}
    >
      <p className="font-semibold text-slate-200">{label}</p>
      <p className="text-blue-400">{payload[0].value} conversations</p>
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
        <StatCard label="Open" value={stats.openConversations} sub="Needs attention" accent="#3b82f6" />
        <StatCard label="Pending" value={stats.pendingConversations} sub="Awaiting reply" accent="#f59e0b" />
        <StatCard label="Resolved today" value={stats.resolvedToday} sub="Great work!" accent="#10b981" />
        <StatCard label="CSAT Score" value={`${stats.csatScore}/5`} sub="This week" accent="#8b5cf6" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Chart */}
        <div
          className="col-span-2 rounded-xl border p-5"
          style={{ background: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
        >
          <h3 className="mb-5 text-sm font-semibold text-slate-200">Conversations This Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.conversationsByDay} barSize={24}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Online agents */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-200">
            Online Agents
            <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">
              {onlineAgents.length} live
            </span>
          </h3>
          <div className="space-y-3">
            {onlineAgents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar name={agent.name} size="sm" />
                  <StatusDot status={agent.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-surface-card" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{agent.name}</p>
                  <p className="text-[10px] capitalize text-slate-500">{agent.status}</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium capitalize text-blue-400">
                  {agent.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      <div
        className="rounded-xl border"
        style={{ background: "var(--color-surface-card)", borderColor: "var(--color-surface-border)" }}
      >
        <div className="border-b px-5 py-4" style={{ borderColor: "var(--color-surface-border)" }}>
          <h3 className="text-sm font-semibold text-slate-200">Recent Conversations</h3>
        </div>
        {recentConversations.map((conv) => {
          const customer = mockCustomers.find((c) => c.id === conv.customerId);
          const lastMsg = conv.messages[conv.messages.length - 1];
          return (
            <div
              key={conv.id}
              className="flex items-center gap-4 border-b px-5 py-3.5 last:border-0 transition-colors hover:bg-white/3"
              style={{ borderColor: "var(--color-surface-border)" }}
            >
              <Avatar name={customer?.name || "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200">{customer?.name}</p>
                <p className="truncate text-xs text-slate-500">{lastMsg?.content}</p>
              </div>
              <Badge status={conv.status} />
              <span className="text-[11px] text-slate-600">{formatRelative(conv.updatedAt)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
