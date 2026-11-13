import { type FC, useEffect, useState } from "react";
import { Link } from "react-router";
import { Menu, MenuButton, MenuItem, MenuItems, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ArrowUturnLeftIcon, ChevronDownIcon, LanguageIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { Spinner } from "~/components/core";
import { useAiDraftReply, useAiRewrite, useAiStatus, useAiSummarize } from "~/hooks/data";
import { toast } from "~/hooks/ui/use-toast";
import { getErrorMessage } from "~/lib/errors";
import { cn } from "~/lib/utils";
import { formatRelative } from "~/utils/date";
import { useHasRole } from "~/utils/with-roles";
import type { AiRewriteStyle, ConversationDetail } from "~/utils/types";

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "German",
  "Arabic",
  "Swahili",
  "Twi",
  "Hausa",
  "Yoruba",
  "Chinese",
];

const REWRITES: { style: Exclude<AiRewriteStyle, "translate">; label: string }[] = [
  { style: "friendlier", label: "Friendlier" },
  { style: "shorter", label: "Shorter" },
  { style: "formal", label: "More formal" },
  { style: "fix", label: "Fix spelling & grammar" },
];

const menuItem =
  "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-soft data-[focus]:bg-surface-2 data-[focus]:text-ink";

/**
 * AI tools above the reply box. The agent always reviews and sends: drafts
 * and rewrites only change the text in the box, and every change can be undone.
 */
export const AiComposerTools: FC<{
  conversationId: string;
  text: string;
  setText: (value: string) => void;
  /** Called with the draft id when a draft fills the box (null when the agent rewrites/undoes). */
  onDraft: (draftId: string | null) => void;
  note: boolean;
}> = ({ conversationId, text, setText, onDraft, note }) => {
  const { aiStatus } = useAiStatus();
  const isAdmin = useHasRole(["admin"]);
  const { draftReply, loading: drafting } = useAiDraftReply();
  const { rewrite, loading: rewriting } = useAiRewrite();
  const [undo, setUndo] = useState<{ text: string; draftId: string | null } | null>(null);
  const [instruction, setInstruction] = useState("");
  const busy = drafting || rewriting;

  // Once the box is emptied (message sent, conversation switched), there's nothing to undo.
  useEffect(() => {
    if (!text) setUndo(null);
  }, [text]);

  if (!aiStatus) return null;
  if (!aiStatus.available) {
    // Admins get a nudge to set it up; agents see nothing until it's ready.
    if (!isAdmin) return null;
    return (
      <Link
        to="/settings/ai"
        className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-medium text-ink-muted hover:text-primary-600 dark:hover:text-primary-300"
      >
        <SparklesIcon className="h-3.5 w-3.5" /> {aiStatus.configured ? "Turn on AI assist" : "Set up AI assist"}
      </Link>
    );
  }

  const apply = (next: string, draftId: string | null) => {
    setUndo({ text, draftId: null });
    setText(next);
    onDraft(draftId);
  };

  const draft = async (guidance?: string) => {
    try {
      const result = await draftReply(conversationId, guidance);
      if (result) apply(result.text, result.draftId);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const doRewrite = async (style: AiRewriteStyle, language?: string) => {
    if (!text.trim()) return;
    try {
      const result = await rewrite({ text, style, language, conversationId });
      // A rewritten draft no longer counts as "the AI's draft" for quality tracking.
      if (result) apply(result, null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="flex items-center gap-1 whitespace-nowrap">
      {!note && (
        <div className="inline-flex overflow-hidden rounded-md border border-fuchsia-500/25 bg-fuchsia-500/8">
          <button
            type="button"
            disabled={busy}
            onClick={() => void draft()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-fuchsia-800 transition hover:bg-fuchsia-500/10 disabled:opacity-50 dark:text-phosphor"
            title="Draft a reply with AI"
          >
            {drafting ? <Spinner className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5" />}
            {drafting ? "Writing…" : "Draft reply"}
          </button>
          <Popover className="relative">
            <PopoverButton
              disabled={busy}
              className="border-l border-fuchsia-500/25 px-1.5 py-1 text-fuchsia-800 outline-none hover:bg-fuchsia-500/10 disabled:opacity-50 dark:text-phosphor"
              aria-label="Draft with instructions"
              title="Draft with instructions"
            >
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </PopoverButton>
            <PopoverPanel
              anchor="top start"
              className="z-50 w-80 rounded-xl border border-[var(--pop-border)] bg-surface p-3 shadow-lg [--anchor-gap:6px]"
            >
              {({ close }) => (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    close();
                    void draft(instruction);
                  }}
                  className="space-y-2"
                >
                  <label htmlFor="ai-instruction" className="text-xs font-medium text-ink">
                    What should the reply say?
                  </label>
                  <textarea
                    id="ai-instruction"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="e.g. Apologise, offer a 10% discount code, and say it ships Friday"
                    className="w-full rounded-md border border-line bg-field px-2.5 py-2 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-primary-600 py-1.5 text-xs font-medium text-white hover:bg-primary-700"
                  >
                    Draft reply
                  </button>
                </form>
              )}
            </PopoverPanel>
          </Popover>
        </div>
      )}

      <Menu as="div" className="relative">
        <MenuButton
          disabled={busy || !text.trim()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-muted outline-none transition hover:bg-surface-2 hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent"
          title={text.trim() ? "Rewrite with AI" : "Write something to rewrite it"}
        >
          {rewriting ? <Spinner className="h-3.5 w-3.5" /> : <SparklesIcon className="h-3.5 w-3.5" />}
          Rewrite
          <ChevronDownIcon className="h-3 w-3" />
        </MenuButton>
        <MenuItems
          anchor="top start"
          className="z-50 max-h-80 w-56 overflow-y-auto rounded-xl border border-[var(--pop-border)] bg-surface p-1.5 shadow-lg outline-none [--anchor-gap:6px]"
        >
          {REWRITES.map((r) => (
            <MenuItem key={r.style}>
              <button type="button" onClick={() => void doRewrite(r.style)} className={menuItem}>
                {r.label}
              </button>
            </MenuItem>
          ))}
          <div className="my-1 h-px bg-line" />
          <p className="label-caps flex items-center gap-1 px-2.5 py-1 text-ink-muted">
            <LanguageIcon className="h-3.5 w-3.5" /> Translate to
          </p>
          {LANGUAGES.map((language) => (
            <MenuItem key={language}>
              <button type="button" onClick={() => void doRewrite("translate", language)} className={menuItem}>
                {language}
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>

      {undo && !busy && (
        <button
          type="button"
          onClick={() => {
            setText(undo.text);
            onDraft(undo.draftId);
            setUndo(null);
          }}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-ink-muted hover:bg-surface-2 hover:text-ink"
        >
          <ArrowUturnLeftIcon className="h-3.5 w-3.5" /> Undo
        </button>
      )}
    </div>
  );
};

/** A short AI summary of the conversation, for whoever picks it up. Generated only on request. */
export const AiSummaryCard: FC<{ conversation: ConversationDetail; className?: string }> = ({
  conversation,
  className,
}) => {
  const { aiStatus } = useAiStatus();
  const { summarize, loading } = useAiSummarize();
  const summary = conversation.aiSummary;

  if (!summary?.text && !aiStatus?.available) return null;

  const run = async (refresh: boolean) => {
    try {
      await summarize(conversation.id, refresh);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <section className={cn("rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-4", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-fuchsia-800 dark:text-phosphor">
          <SparklesIcon className="h-3.5 w-3.5" /> AI summary
        </p>
        {summary?.text && aiStatus?.available && (
          <button
            type="button"
            onClick={() => void run(true)}
            disabled={loading}
            className="text-[11px] font-medium text-ink-muted hover:text-ink disabled:opacity-50"
          >
            {loading ? "Updating…" : summary.stale ? "Update" : "Refresh"}
          </button>
        )}
      </div>
      {summary?.text ? (
        <>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{summary.text}</p>
          <p className="mt-2 text-[11px] text-ink-muted">
            {summary.stale ? "New messages since this summary · " : ""}
            {summary.generatedAt ? `Written ${formatRelative(summary.generatedAt)}` : ""} · check before relying on it
          </p>
        </>
      ) : (
        <button
          type="button"
          onClick={() => void run(false)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fuchsia-800 hover:underline disabled:opacity-50 dark:text-phosphor"
        >
          {loading ? <Spinner className="h-3.5 w-3.5" /> : null}
          {loading ? "Summarising…" : "Summarise this conversation"}
        </button>
      )}
    </section>
  );
};
