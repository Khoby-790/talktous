import { type FC } from "react";
import { GettingStarted } from "~/components/dashboard/getting-started";
import { Link } from "react-router";
import { Card, ErrorState } from "~/components/core";
import { ActivityFeed, ChannelStrip, Pane, StatCard, TopAgents, VolumeChart, VolumeLegend } from "~/components/dashboard";
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
  <div className="inline-flex rounded-md border border-control bg-surface p-0.5" role="group" aria-label="Date range">
    {RANGES.map((days) => (
      <button
        key={days}
        onClick={() => onChange(days)}
        aria-pressed={value === days}
        className={cn(
          "type-label rounded px-3 py-1.5 tabular-nums transition-colors duration-150",
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
        <Card>
          <ErrorState
            title={error ? "We couldn't load your dashboard" : "Nothing to show yet"}
            onRetry={() => void refetch()}
          />
        </Card>
      </div>
    );
  }

  const self = stats.scope === "self";
  const deltaLabel = `vs previous ${range} days`;
  // Four across, then the rest sharing the second row.
  const top = "sm:col-span-3";
  const rest = self ? "sm:col-span-6" : "sm:col-span-4";

  return (
    // From lg up the page fits the window: the header and metrics stay put and
    // the three panes below scroll on their own. In a window too short for
    // that (and on small screens) it falls back to scrolling as one column.
    <div className="flex flex-col lg:h-full">
      <Header
        title={self ? "My dashboard" : "Dashboard"}
        description={
          self
            ? `Your conversations over the last ${range} days, compared with the ${range} days before.`
            : `Support activity over the last ${range} days, compared with the ${range} days before.`
        }
        action={<RangePicker value={range} onChange={(d) => setRange(String(d))} />}
      />

      <div className="shrink-0 space-y-4">
        <GettingStarted />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-12">
          <StatCard
            className={top}
            label="Open"
            value={stats.openConversations}
            hint={
              <Link to="/inbox" className="hover:text-ink">
                {stats.unassignedConversations} unassigned · {stats.pendingConversations} pending
              </Link>
            }
          />
          <StatCard
            className={top}
            label="New"
            value={stats.newConversations}
            delta={percentChange(stats.newConversations, stats.newConversationsPrevious)}
            deltaLabel={deltaLabel}
          />
          <StatCard
            className={top}
            label="Resolved"
            value={stats.resolvedConversations}
            delta={percentChange(stats.resolvedConversations, stats.resolvedConversationsPrevious)}
            deltaLabel={deltaLabel}
          />
          <StatCard
            className={top}
            label="CSAT"
            value={stats.csatScore !== null ? `${stats.csatScore.toFixed(1)}/5` : "—"}
            delta={percentChange(stats.csatScore, stats.csatScorePrevious)}
            deltaLabel={deltaLabel}
            meta={`${stats.csatResponses} ${stats.csatResponses === 1 ? "rating" : "ratings"}`}
          />
          <StatCard
            className={rest}
            label="First response"
            value={formatDuration(stats.avgFirstResponseSeconds)}
            delta={percentChange(stats.avgFirstResponseSeconds, stats.avgFirstResponseSecondsPrevious)}
            lowerIsBetter
            deltaLabel={deltaLabel}
          />
          <StatCard
            className={rest}
            label="Time to resolve"
            value={formatDuration(stats.avgResolutionSeconds)}
            delta={percentChange(stats.avgResolutionSeconds, stats.avgResolutionSecondsPrevious)}
            lowerIsBetter
            deltaLabel={deltaLabel}
          />
          {!self && (
            <StatCard
              className={cn(rest, "col-span-2")}
              label="Agents online"
              value={`${stats.agentsOnline}/${stats.agentsTotal}`}
              hint={
                <Link to="/agents" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
                  View team
                </Link>
              }
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          // The panes never get shorter than 22rem; past that the page scrolls instead.
          "mt-4 grid shrink-0 grid-cols-1 gap-4 lg:min-h-[22rem] lg:flex-1 lg:basis-0 lg:grid-rows-[minmax(0,1fr)]",
          self ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        <Pane title="Conversation volume" aside={<VolumeLegend />} bodyClassName="flex flex-col overflow-hidden">
          <div className="h-56 lg:h-auto lg:min-h-0 lg:flex-1">
            <VolumeChart data={stats.volume} />
          </div>
          <ChannelStrip data={stats.channels} className="mt-4 shrink-0 border-t border-line pt-4" />
        </Pane>
        {!self && (
          <Pane title="Top agents" bodyClassName="pt-1">
            <TopAgents rows={stats.topAgents} />
          </Pane>
        )}
        <Pane title="Recent activity" bodyClassName="pt-1">
          <ActivityFeed events={activity} />
        </Pane>
      </div>
    </div>
  );
};

export default DashboardPage;
