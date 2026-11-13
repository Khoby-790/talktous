import { type FC } from "react";
import { GettingStarted } from "~/components/dashboard/getting-started";
import { Link } from "react-router";
import { Card } from "~/components/core";
import { ActivityFeed, ChannelChart, StatCard, TopAgents, VolumeChart } from "~/components/dashboard";
import { Header, PageShimmer } from "~/components/layouts";
import { useDashboardStats, useRecentActivity } from "~/hooks/data";
import { useLiveRefetch } from "~/hooks/ui/use-conversation-subscription";
import { cn } from "~/lib/utils";
import { formatDuration, percentChange } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";

export function meta() {
  return [{ title: "Dashboard — Asotie" }];
}

const RANGES = [7, 14, 30, 90];

const RangePicker: FC<{ value: number; onChange: (days: number) => void }> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-line bg-surface p-0.5" role="group" aria-label="Date range">
    {RANGES.map((days) => (
      <button
        key={days}
        onClick={() => onChange(days)}
        aria-pressed={value === days}
        className={cn(
          "rounded px-3 py-1.5 text-xs font-medium transition",
          value === days ? "bg-surface-2 text-ink" : "text-ink-muted hover:text-ink",
        )}
      >
        {days}d
      </button>
    ))}
  </div>
);

const DashboardPage: FC = () => {
  const [rangeParam, setRange] = useUrlState("range");
  const range = RANGES.includes(Number(rangeParam)) ? Number(rangeParam) : 30;
  const { stats, loading, error, refetch } = useDashboardStats(range);
  const { activity, refetch: refetchActivity } = useRecentActivity(12);
  useLiveRefetch(() => {
    void refetch();
    void refetchActivity();
  });

  if (loading && !stats) return <PageShimmer rows={2} />;
  if (!stats) {
    return (
      <div className="space-y-6">
        <Header title="Dashboard" />
        <Card className="p-8 text-center text-sm text-ink-soft">
          {error ? "We couldn't load your dashboard. " : ""}
          <button onClick={() => void refetch()} className="font-medium text-primary-600 dark:text-primary-300">
            Try again
          </button>
        </Card>
      </div>
    );
  }

  const self = stats.scope === "self";
  const deltaLabel = `vs previous ${range} days`;

  return (
    <div className="space-y-6">
      <Header
        title={self ? "My dashboard" : "Dashboard"}
        description={
          self
            ? "Your conversations and performance"
            : `Support activity over the last ${range} days`
        }
        action={<RangePicker value={range} onChange={(d) => setRange(String(d))} />}
      />

      <GettingStarted />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Open"
          value={stats.openConversations}
          accent="var(--color-status-open)"
          hint={
            <Link to="/inbox" className="hover:text-ink">
              {stats.unassignedConversations} unassigned · {stats.pendingConversations} pending
            </Link>
          }
        />
        <StatCard
          label="New"
          value={stats.newConversations}
          delta={percentChange(stats.newConversations, stats.newConversationsPrevious)}
          deltaLabel={deltaLabel}
          accent="var(--color-primary-400)"
        />
        <StatCard
          label="Resolved"
          value={stats.resolvedConversations}
          delta={percentChange(stats.resolvedConversations, stats.resolvedConversationsPrevious)}
          deltaLabel={deltaLabel}
          accent="var(--color-status-resolved)"
        />
        <StatCard
          label="CSAT"
          value={stats.csatScore !== null ? `${stats.csatScore.toFixed(1)}/5` : "—"}
          delta={percentChange(stats.csatScore, stats.csatScorePrevious)}
          deltaLabel={deltaLabel}
          hint={`${stats.csatResponses} ratings`}
          accent="#f0b8f7"
        />
      </div>

      <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", !self && "lg:grid-cols-3")}>
        <StatCard
          label="First response"
          value={formatDuration(stats.avgFirstResponseSeconds)}
          delta={percentChange(stats.avgFirstResponseSeconds, stats.avgFirstResponseSecondsPrevious)}
          lowerIsBetter
          deltaLabel={deltaLabel}
          accent="var(--color-status-pending)"
        />
        <StatCard
          label="Time to resolve"
          value={formatDuration(stats.avgResolutionSeconds)}
          delta={percentChange(stats.avgResolutionSeconds, stats.avgResolutionSecondsPrevious)}
          lowerIsBetter
          deltaLabel={deltaLabel}
          accent="var(--color-status-closed)"
        />
        {!self && (
          <StatCard
            label="Agents online"
            value={`${stats.agentsOnline}/${stats.agentsTotal}`}
            accent="var(--color-online)"
            hint={
              <Link to="/agents" className="hover:text-ink">
                View team
              </Link>
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="label-caps text-ink-soft">Conversation volume</h3>
            <span className="rounded-md bg-surface-2 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-ink-soft">
              Last {range} days
            </span>
          </div>
          <VolumeChart data={stats.volume} />
        </Card>
        <Card className="p-5">
          <h3 className="label-caps mb-4 text-ink-soft">By channel</h3>
          <ChannelChart data={stats.channels} />
        </Card>
      </div>

      <div className={cn("grid grid-cols-1 gap-5", !self && "lg:grid-cols-2")}>
        {!self && (
          <Card className="p-5">
            <h3 className="label-caps mb-2 text-ink-soft">Top agents</h3>
            <TopAgents rows={stats.topAgents} />
          </Card>
        )}
        <Card className="p-5">
          <h3 className="label-caps mb-4 text-ink-soft">Live activity</h3>
          <ActivityFeed events={activity} />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
