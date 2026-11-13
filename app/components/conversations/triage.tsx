import type { FC } from "react";
import { FaceFrownIcon, LanguageIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import type { ConversationAutoReply, ConversationTriage } from "~/utils/types";

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

const HANDOFF_REASON: Record<string, string> = {
  asked_for_person: "the customer asked for a person",
  not_covered: "your knowledge base doesn't cover their question",
  needs_person: "it needs a person",
  limit_reached: `it had already answered ${3} times`,
};

/**
 * Above the composer: the AI assistant is answering this customer (with a way
 * to stop it), or it handed the conversation over and why.
 */
export const AutoReplyNotice: FC<{
  autoReply: ConversationAutoReply | null;
  /** A person has already replied: nothing to say. */
  answeredByTeam: boolean;
  onStop: () => void;
  stopping: boolean;
}> = ({ autoReply, answeredByTeam, onStop, stopping }) => {
  if (!autoReply || answeredByTeam) return null;
  if (!autoReply.handedOff) {
    return (
      <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-fuchsia-500/25 bg-fuchsia-500/8 px-3 py-2 text-xs text-ink">
        <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-fuchsia-700 dark:text-phosphor" />
        <span className="flex-1">
          The AI assistant is answering this customer from your knowledge base
          {autoReply.replies ? ` (${autoReply.replies} ${autoReply.replies === 1 ? "answer" : "answers"} so far)` : ""}. Your
          reply takes over.
        </span>
        <button
          type="button"
          onClick={onStop}
          disabled={stopping}
          className="font-medium text-fuchsia-800 underline underline-offset-2 disabled:opacity-50 dark:text-phosphor"
        >
          {stopping ? "Stopping…" : "Stop AI"}
        </button>
      </div>
    );
  }
  const reason = autoReply.reason && HANDOFF_REASON[autoReply.reason];
  if (!reason) return null;
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs text-ink-soft">
      <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-fuchsia-700 dark:text-phosphor" />
      The AI assistant handed this to your team: {reason}.
    </p>
  );
};

/** Inbox list flag for conversations the assistant is currently handling. */
export const AutoReplyBadge: FC<{ autoReply: ConversationAutoReply | null }> = ({ autoReply }) =>
  autoReply && !autoReply.handedOff && autoReply.replies > 0 ? (
    <span
      className={cn(chip, "bg-fuchsia-500/12 text-fuchsia-800 dark:text-phosphor")}
      title="The AI assistant is answering this customer"
    >
      <SparklesIcon className="h-3 w-3" /> AI answering
    </span>
  ) : null;
