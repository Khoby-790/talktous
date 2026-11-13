import { type FC } from "react";
import { Link } from "react-router";
import { Avatar, Badge, Card, ChannelBadge, EmptyState } from "~/components/core";
import { TableShimmer } from "~/components/shimmer";
import { useConversations } from "~/hooks/data";
import { formatDuration, formatRelative } from "~/utils/date";
import type { SupportApp } from "~/utils/types";

const Stat: FC<{ label: string; value: string | number; hint?: string }> = ({ label, value, hint }) => (
  <Card className="p-5">
    <p className="label-caps text-ink-soft">{label}</p>
    <p className="mt-3 text-3xl font-medium leading-none tracking-display text-figure tabular-nums">{value}</p>
    {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
  </Card>
);

const OverviewTab: FC<{ app: SupportApp }> = ({ app }) => {
  const { conversations, loading } = useConversations({ appId: app.id }, { limit: 8 });
  const { stats } = app;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Open" value={stats.openConversations} hint="Open or pending" />
        <Stat label="Total" value={stats.totalConversations} hint={`${stats.resolvedConversations} resolved`} />
        <Stat label="First response" value={formatDuration(stats.avgFirstResponseSeconds)} hint="Average" />
        <Stat label="CSAT" value={stats.csatScore !== null ? `${stats.csatScore}/5` : "—"} hint="Average rating" />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="label-caps text-ink-soft">Recent conversations</h3>
          <Link
            to={`/conversations?app=${app.id}`}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            View all
          </Link>
        </div>
        {loading && !conversations.length ? (
          <TableShimmer rows={4} cols={3} />
        ) : conversations.length === 0 ? (
          <EmptyState
            title="No conversations yet"
            description="Once customers reach out through this app, their conversations show up here."
            action={
              <Link to="?tab=setup" className="text-sm font-medium text-primary-600 dark:text-primary-300">
                Finish setup →
              </Link>
            }
          />
        ) : (
          conversations.map((c) => (
            <Link
              key={c.id}
              to={`/conversations/${c.id}`}
              className="flex items-center gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-2/50"
            >
              <Avatar name={c.customer.name} src={c.customer.avatarUrl} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{c.customer.name}</p>
                <p className="truncate text-xs text-ink-soft">{c.subject || c.lastMessagePreview}</p>
              </div>
              <ChannelBadge channel={c.channel} className="hidden sm:inline-flex" />
              <Badge status={c.status} />
              <span className="hidden w-24 text-right text-[11px] text-ink-muted sm:block">
                {formatRelative(c.lastMessageAt)}
              </span>
            </Link>
          ))
        )}
      </Card>
    </div>
  );
};

export default OverviewTab;
