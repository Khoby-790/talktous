import { type FC, useState } from "react";
import { Link } from "react-router";
import { useReactiveVar } from "@apollo/client/react";
import { CheckCircleIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { currentOrgVar } from "~/_graphql/cache/auth";
import { Callout } from "~/components/guides";
import { useGettingStarted } from "~/hooks/data";
import { cn } from "~/lib/utils";
import { useHasRole } from "~/utils/with-roles";

type Item = { id: string; title: string; detail: string; to: string; cta: string; done: boolean; optional?: boolean };

const storageKey = (orgId: string) => `talktous:getting-started:dismissed:${orgId}`;

/**
 * First-run checklist for admins. Every item is checked against real data
 * (a channel exists, a message arrived, someone was invited…), so it can't
 * drift from what's actually set up. While essentials are outstanding it's the
 * full checklist; once they're done it folds down to one line (the optional
 * extras open on request) so the numbers below get the page back. Hidden when
 * everything is done, or when dismissed.
 */
export const GettingStarted: FC = () => {
  const isAdmin = useHasRole(["admin"]);
  const org = useReactiveVar(currentOrgVar);
  const { gettingStarted: g } = useGettingStarted();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return Boolean(org && localStorage.getItem(storageKey(org.id)));
    } catch {
      return false;
    }
  });
  const [expanded, setExpanded] = useState(false);

  if (!isAdmin || !g || !org || dismissed) return null;

  const items: Item[] = [
    {
      id: "channel",
      title: "Add a support channel",
      detail: "Live chat on your website, an email inbox, WhatsApp, or your own app.",
      to: "/apps?modal=create",
      cta: "Add channel",
      done: g.channelCreated,
    },
    {
      id: "connect",
      title: "Connect it and receive your first message",
      detail: "Each channel's Setup tab walks you through it step by step.",
      to: "/apps",
      cta: "Open setup",
      done: g.channelReceivedMessage,
    },
    {
      id: "reply",
      title: "Reply to a customer",
      detail: "Answer from the Inbox. Internal notes let you discuss without the customer seeing.",
      to: "/inbox",
      cta: "Open inbox",
      done: g.firstReplySent,
    },
    {
      id: "team",
      title: "Invite your team",
      detail: "Add agents and choose which channels they answer.",
      to: "/agents?modal=invite",
      cta: "Invite",
      done: g.teammateInvited,
    },
    {
      id: "brand",
      title: "Add your logo",
      detail: "Shown in the dashboard and the chat widget.",
      to: "/settings/general",
      cta: "Settings",
      done: g.brandingAdded,
      optional: true,
    },
    {
      id: "integrations",
      title: "Get notified in Slack or another tool",
      detail: "Send new conversations to Slack, Discord, Zapier or your own systems.",
      to: "/integrations",
      cta: "Integrations",
      done: g.integrationConnected,
      optional: true,
    },
  ];

  const required = items.filter((i) => !i.optional);
  const completed = required.filter((i) => i.done).length;
  if (completed === required.length && items.every((i) => i.done)) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(storageKey(org.id), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  const ready = completed === required.length;
  const pending = items.filter((i) => !i.done);
  const shown = ready ? pending : items;
  const listOpen = !ready || expanded;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="flex items-center gap-3.5 px-5 py-4">
        {ready && (
          <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600 sm:flex dark:text-emerald-400">
            <CheckCircleIcon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-medium text-ink">{ready ? "You're ready for customers" : "Getting started"}</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            {ready
              ? `All ${required.length} essentials are done. ${pending.length} optional ${pending.length === 1 ? "extra" : "extras"} left.`
              : `${completed} of ${required.length} essentials done — finish these and you're ready for customers.`}
          </p>
        </div>
        {ready && (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-label={expanded ? "Hide optional extras" : "Show optional extras"}
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-line px-2 text-xs font-medium text-ink transition hover:bg-surface-2 sm:px-3"
          >
            <span className="hidden sm:inline">{expanded ? "Hide extras" : "Show extras"}</span>
            <ChevronDownIcon className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="-mr-1.5 shrink-0 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
          aria-label="Hide getting started"
          title="Hide"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      {!ready && (
        <div
          className="h-1 bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={required.length}
          aria-valuenow={completed}
          aria-label="Essentials completed"
        >
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(completed / required.length) * 100}%` }} />
        </div>
      )}
      {listOpen && (
        <ul className="divide-y divide-line border-t border-line">
          {shown.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
              {item.done ? (
                <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium tabular-nums",
                    item.optional ? "border-dashed border-line-strong text-ink-muted" : "border-primary-500/40 text-primary-700 dark:text-primary-300",
                  )}
                >
                  {items.indexOf(item) + 1}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-medium", item.done ? "text-ink-muted line-through" : "text-ink")}>
                  {item.title}
                  {item.optional && !item.done && <span className="ml-2 text-xs font-normal text-ink-muted no-underline">Optional</span>}
                </p>
                {!item.done && <p className="mt-0.5 text-xs text-ink-soft">{item.detail}</p>}
              </div>
              {!item.done && (
                <Link
                  to={item.to}
                  className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-surface-2"
                >
                  {item.cta}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {!g.emailSendingConfigured && (
        <div className="border-t border-line px-5 py-4">
          <Callout tone="warning" title="Emails aren't being sent yet">
            Asotie hasn&apos;t switched on email for your workspace yet, so invitations, password resets and email
            replies aren&apos;t emailed. Invite links are shown on screen so you can share them yourself. Contact Asotie
            support to switch email on — there&apos;s nothing for you to set up.
          </Callout>
        </div>
      )}
    </section>
  );
};
