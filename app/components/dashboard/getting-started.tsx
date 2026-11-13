import { type FC, useState } from "react";
import { Link } from "react-router";
import { useReactiveVar } from "@apollo/client/react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
 * drift from what's actually set up. Hidden once done, or when dismissed.
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

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-base font-medium text-ink">Getting started</h2>
          <p className="mt-0.5 text-sm text-ink-soft">
            {completed} of {required.length} essentials done — finish these and you&apos;re ready for customers.
          </p>
        </div>
        <button
          onClick={dismiss}
          className="rounded-md p-1 text-ink-muted hover:bg-surface-2 hover:text-ink"
          aria-label="Hide getting started"
          title="Hide"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="h-1 bg-surface-2">
        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(completed / required.length) * 100}%` }} />
      </div>
      <ul className="divide-y divide-line">
        {items.map((item, i) => (
          <li key={item.id} className="flex items-center gap-4 px-5 py-3.5">
            {item.done ? (
              <CheckCircleIcon className="h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium",
                  item.optional ? "border-dashed border-line-strong text-ink-muted" : "border-primary-500/40 text-primary-700 dark:text-primary-300",
                )}
              >
                {i + 1}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", item.done ? "text-ink-muted line-through" : "text-ink")}>
                {item.title}
                {item.optional && !item.done && <span className="ml-2 text-xs font-normal text-ink-muted no-underline">Optional</span>}
              </p>
              {!item.done && <p className="text-xs text-ink-soft">{item.detail}</p>}
            </div>
            {!item.done && (
              <Link
                to={item.to}
                className="shrink-0 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-2"
              >
                {item.cta}
              </Link>
            )}
          </li>
        ))}
      </ul>
      {!g.emailSendingConfigured && (
        <div className="border-t border-line px-5 py-4">
          <Callout tone="warning" title="Emails aren't being sent yet">
            Invitations, password resets and email-channel replies need an email account configured on the server
            (<code className="font-mono text-xs">SMTP_*</code> in <code className="font-mono text-xs">talktous-api/.env</code>).
            Until then, invite links are shown on screen so you can share them yourself.
          </Callout>
        </div>
      )}
    </section>
  );
};
