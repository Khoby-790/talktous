import { type FC, useState } from "react";
import { Link } from "react-router";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  DocumentPlusIcon,
  FaceFrownIcon,
  LightBulbIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { PrimaryButton } from "~/components/buttons";
import { Card, EmptyState } from "~/components/core";
import { StatCard } from "~/components/dashboard";
import { Header, PageShimmer } from "~/components/layouts";
import { useAiStatus, useInsights, useSummarizeInsights } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { requireRoles } from "~/lib/session";
import { cn } from "~/lib/utils";
import { formatRelative, percentChange } from "~/utils/date";
import { useUrlState } from "~/utils/use-url-state";
import { useHasRole } from "~/utils/with-roles";
import type { InsightTopic, KnowledgeGap } from "~/utils/types";
import type { Route } from "./+types/index";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  await requireRoles(request, ["admin", "supervisor"]);
  return null;
}

export function meta() {
  return [{ title: "Insights — Asotie" }];
}

const RANGES = [7, 30, 90];

const RangePicker: FC<{ value: number; onChange: (days: number) => void }> = ({ value, onChange }) => (
  <div className="inline-flex rounded-md border border-line bg-surface p-0.5" role="group" aria-label="Period">
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

/* ─────────────────────────────── AI briefing ─────────────────────────────── */

const Briefing: FC<{ rangeDays: number }> = ({ rangeDays }) => {
  const { aiStatus } = useAiStatus();
  const { summarize, loading } = useSummarizeInsights();
  const [briefing, setBriefing] = useState<{ text: string; rangeDays: number; generatedAt: string } | null>(null);
  if (!aiStatus?.available) return null;
  const current = briefing?.rangeDays === rangeDays ? briefing : null;

  const run = async () => {
    try {
      setBriefing((await summarize(rangeDays)) ?? null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="border-fuchsia-500/20 bg-fuchsia-500/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 font-medium text-ink">
          <SparklesIcon className="h-4 w-4 text-fuchsia-700 dark:text-phosphor" /> AI briefing
        </p>
        <PrimaryButton size="sm" variant="secondary" loading={loading} onClick={() => void run()}>
          {current ? "Write again" : `Summarise the last ${rangeDays} days`}
        </PrimaryButton>
      </div>
      {current ? (
        <>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink">{current.text}</p>
          <p className="mt-2 text-[11px] text-ink-muted">
            Written {formatRelative(current.generatedAt)} from the figures on this page · check before acting on it
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">
          Your AI reads the figures below and tells you what&apos;s driving conversations, what&apos;s rising, and which
          articles to write next.
        </p>
      )}
    </Card>
  );
};

/* ─────────────────────────────── Topics ─────────────────────────────── */

const Trend: FC<{ count: number; previous: number }> = ({ count, previous }) => {
  if (!previous) return <span className="text-[11px] font-medium text-primary-700 dark:text-primary-300">New</span>;
  const change = percentChange(count, previous) ?? 0;
  if (Math.abs(change) < 10) return <span className="text-[11px] text-ink-muted">Steady</span>;
  const up = change > 0;
  const Icon = up ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5 text-[11px] font-medium", up ? "text-amber-700 dark:text-amber-300" : "text-ink-muted")}
      title={`${previous} in the previous period`}
    >
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {Math.round(change)}%
    </span>
  );
};

const Topics: FC<{ topics: InsightTopic[]; total: number }> = ({ topics, total }) => {
  const isAdmin = useHasRole(["admin"]);
  const max = Math.max(1, ...topics.map((t) => t.count));
  return (
    <Card className="p-5">
      <p className="font-medium text-ink">What customers contacted you about</p>
      <p className="mt-0.5 text-xs text-ink-muted">By conversation tag — auto-triage tags new conversations for you.</p>
      {topics.length === 0 ? (
        <EmptyState
          className="py-10"
          title="No topics yet"
          description="Topics come from conversation tags. Turn on auto-triage and your AI tags every new conversation."
          action={
            isAdmin ? (
              <Link to="/settings/ai" className="text-sm font-medium text-primary-700 hover:underline dark:text-primary-300">
                Turn on auto-triage
              </Link>
            ) : undefined
          }
        />
      ) : (
        <ul className="mt-4 space-y-3.5">
          {topics.map((topic) => (
            <li key={topic.tag}>
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">#{topic.tag}</span>
                {topic.negative > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] text-red-700 dark:text-red-300" title="From upset customers">
                    <FaceFrownIcon className="h-3.5 w-3.5" /> {topic.negative}
                  </span>
                )}
                <Trend count={topic.count} previous={topic.previous} />
                <span className="w-16 text-right text-sm tabular-nums text-ink">
                  {topic.count}
                  <span className="text-[11px] text-ink-muted"> · {Math.round((topic.count / Math.max(total, 1)) * 100)}%</span>
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.max((topic.count / max) * 100, 3)}%` }} />
              </div>
              {topic.examples.length > 0 && (
                <p className="mt-1 truncate text-xs text-ink-muted">e.g. {topic.examples.join(" · ")}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

/* ─────────────────────────────── Gaps ─────────────────────────────── */

const SOURCE_LABEL = { assistant: "AI assistant handed over", draft: "Draft had nothing to go on" } as const;

const Gaps: FC<{ gaps: KnowledgeGap[]; count: number; canEdit: boolean }> = ({ gaps, count, canEdit }) => (
  <Card className="overflow-hidden">
    <div className="border-b border-line p-5">
      <p className="flex items-center gap-1.5 font-medium text-ink">
        <LightBulbIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" /> What your knowledge base is missing
      </p>
      <p className="mt-0.5 text-xs text-ink-muted">
        Real questions your AI couldn&apos;t answer from your knowledge base
        {count > gaps.length ? ` (latest ${gaps.length} of ${count})` : ""}. Each article you add means one less to answer by
        hand.
      </p>
    </div>
    {gaps.length === 0 ? (
      <EmptyState
        className="py-10"
        title="No gaps in this period"
        description="Every AI draft and answer found something in your knowledge base — or AI hasn't been asked yet."
      />
    ) : (
      <ul className="divide-y divide-line">
        {gaps.map((gap) => {
          const title = (gap.intent ?? gap.question).slice(0, 120);
          return (
            <li key={gap.conversationId} className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink">“{gap.question || gap.intent}”</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {gap.intent && gap.question ? <span className="text-ink-soft">{gap.intent} · </span> : null}
                  {gap.customerName} · {SOURCE_LABEL[gap.source]} · {formatRelative(gap.at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  to={`/inbox?conversation=${gap.conversationId}`}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-muted hover:bg-surface-2 hover:text-ink"
                >
                  <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" /> Open
                </Link>
                {canEdit && (
                  <Link
                    to={`/knowledge?modal=article&title=${encodeURIComponent(title)}`}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary-700 hover:bg-surface-2 dark:text-primary-300"
                  >
                    <DocumentPlusIcon className="h-3.5 w-3.5" /> Write article
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);

/* ─────────────────────────────── Page ─────────────────────────────── */

const InsightsPage: FC = () => {
  const [rangeParam, setRange] = useUrlState("range");
  const range = RANGES.includes(Number(rangeParam)) ? Number(rangeParam) : 7;
  const { insights, loading } = useInsights(range);

  if (!insights && loading) return <PageShimmer />;
  const i = insights;

  return (
    <div className="space-y-6">
      <Header
        title="Insights"
        description="What your customers ask about, how they feel, and what your knowledge base should cover next."
        action={<RangePicker value={range} onChange={(days) => setRange(String(days), { replace: true })} />}
      />
      {i && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Conversations"
              value={i.conversations}
              delta={percentChange(i.conversations, i.previousConversations)}
              deltaLabel={`vs previous ${range} days`}
            />
            <StatCard
              label="Upset customers"
              value={i.triaged ? `${Math.round((i.negative / i.triaged) * 100)}%` : "—"}
              hint={i.triaged ? `${i.negative} of ${i.triaged} classified by auto-triage` : "Turn on auto-triage to see this"}
              accent="var(--color-busy)"
              lowerIsBetter
            />
            <StatCard
              label="Answered by AI"
              value={i.answeredByAi}
              hint={`${i.handedOffByAi} handed to your team`}
              accent="#c026d3"
            />
            <StatCard
              label="Not in knowledge base"
              value={i.gapCount}
              hint="Questions AI couldn't answer"
              accent="var(--color-away)"
              lowerIsBetter
            />
          </div>

          <Briefing rangeDays={range} />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Topics topics={i.topics} total={i.conversations} />
            </div>
            <Card className="p-5">
              <p className="font-medium text-ink">Languages</p>
              <p className="mt-0.5 text-xs text-ink-muted">From auto-triage.</p>
              {i.languages.length === 0 ? (
                <p className="mt-4 text-sm text-ink-soft">No data yet.</p>
              ) : (
                <ul className="mt-4 space-y-2.5">
                  {i.languages.map((l) => (
                    <li key={l.language} className="flex items-center justify-between text-sm">
                      <span className="text-ink">{l.language}</span>
                      <span className="tabular-nums text-ink-muted">
                        {l.count} · {Math.round((l.count / Math.max(i.triaged, 1)) * 100)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Gaps gaps={i.gaps} count={i.gapCount} canEdit />
        </>
      )}
    </div>
  );
};

export default InsightsPage;
