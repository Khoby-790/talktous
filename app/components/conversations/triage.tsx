import type { FC } from "react";
import { FaceFrownIcon, LanguageIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import type { ConversationTriage } from "~/utils/types";

const chip = "inline-flex items-center gap-1 rounded-md px-1.5 py-0 text-[10px] font-medium leading-4";

/** Small flags for the inbox list: upset customers and non-English conversations. */
export const TriageBadges: FC<{ triage: ConversationTriage | null; className?: string }> = ({ triage, className }) => {
  if (!triage) return null;
  const upset = triage.sentiment === "negative";
  const foreign = triage.language && !/^english$/i.test(triage.language);
  if (!upset && !foreign) return null;
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {upset && (
        <span className={cn(chip, "bg-red-500/12 text-red-700 dark:bg-red-500/15 dark:text-red-300")} title="The customer seems upset">
          <FaceFrownIcon className="h-3 w-3" /> Upset
        </span>
      )}
      {foreign && (
        <span className={cn(chip, "bg-surface-2 text-ink-soft")} title={`Written in ${triage.language}`}>
          <LanguageIcon className="h-3 w-3" /> {triage.language}
        </span>
      )}
    </span>
  );
};

const URGENCY_LABEL = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" } as const;

/** One line under the conversation header: what the customer wants, as the AI read it. */
export const TriageLine: FC<{ triage: ConversationTriage | null }> = ({ triage }) => {
  if (!triage) return null;
  const changes = [
    triage.appliedPriority && `set priority to ${URGENCY_LABEL[triage.urgency]}`,
    triage.appliedTags.length > 0 && `tagged ${triage.appliedTags.join(", ")}`,
  ].filter(Boolean);
  return (
    <p
      className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-soft"
      title={`AI triage ${formatRelative(triage.at)}${changes.length ? ` — ${changes.join(" and ")}` : ""}. Check before relying on it.`}
    >
      <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-fuchsia-700 dark:text-phosphor" />
      <span className="min-w-0 break-words">{triage.intent}</span>
      <TriageBadges triage={triage} />
      {changes.length > 0 && <span className="text-[11px] text-ink-muted">· AI set {changes.length > 1 ? "priority & tags" : triage.appliedPriority ? "priority" : "tags"}</span>}
    </p>
  );
};
