import { type FC, type ReactNode, useEffect, useState } from "react";
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { CodeBlock } from "~/components/core";
import { useEnvironment } from "~/hooks/data";
import { cn } from "~/lib/utils";

/* ─────────────────────────────── Bits ─────────────────────────────── */

/** Link to another site (Meta, Slack, …): opens in a new tab, marked as external. */
export const ExternalLink: FC<{ href: string; children: ReactNode; className?: string }> = ({ href, children, className }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className={cn(
      "inline-flex items-center gap-1 font-medium text-primary-700 underline decoration-primary-500/40 underline-offset-2 hover:decoration-primary-500 dark:text-primary-300",
      className,
    )}
  >
    {children}
    <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" />
  </a>
);

/** A menu path in someone else's UI, e.g. <MenuPath items={["WhatsApp", "API Setup"]} />. */
export const MenuPath: FC<{ items: string[] }> = ({ items }) => (
  <span className="inline-flex flex-wrap items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-ink">
    {items.map((item, i) => (
      <span key={item} className="inline-flex items-center gap-1">
        {i > 0 && <span className="text-ink-muted">›</span>}
        {item}
      </span>
    ))}
  </span>
);

const calloutTones = {
  info: { icon: InformationCircleIcon, box: "border-primary-500/25 bg-primary-500/8", icon_: "text-primary-600 dark:text-primary-300" },
  tip: { icon: LightBulbIcon, box: "border-fuchsia-500/20 bg-fuchsia-500/8", icon_: "text-fuchsia-700 dark:text-phosphor" },
  warning: { icon: ExclamationTriangleIcon, box: "border-amber-500/30 bg-amber-500/10", icon_: "text-amber-600 dark:text-amber-400" },
  error: { icon: XCircleIcon, box: "border-red-500/30 bg-red-500/10", icon_: "text-red-600 dark:text-red-400" },
  success: { icon: CheckCircleIcon, box: "border-emerald-500/30 bg-emerald-500/10", icon_: "text-emerald-600 dark:text-emerald-400" },
} as const;

export const Callout: FC<{
  tone?: keyof typeof calloutTones;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}> = ({ tone = "info", title, children, className }) => {
  const t = calloutTones[tone];
  const Icon = t.icon;
  return (
    <div className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm", t.box, className)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", t.icon_)} />
      <div className="min-w-0 flex-1 space-y-1.5 text-ink-soft">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children}
      </div>
    </div>
  );
};

/** Collapsible "Where do I find this?" help under a form field. */
export const FieldHelp: FC<{ label?: string; children: ReactNode; className?: string; defaultOpen?: boolean }> = ({
  label = "Where do I find this?",
  children,
  className,
  defaultOpen,
}) => (
  <details className={cn("group text-xs", className)} open={defaultOpen}>
    <summary className="inline-flex cursor-pointer list-none items-center gap-1 font-medium text-primary-700 hover:underline dark:text-primary-300">
      <InformationCircleIcon className="h-3.5 w-3.5" />
      {label}
    </summary>
    <div className="mt-2 space-y-1.5 rounded-lg bg-surface-2 px-3 py-2.5 leading-relaxed text-ink-soft">{children}</div>
  </details>
);

/** Numbered sub-steps inside a checklist step. */
export const Instructions: FC<{ children: ReactNode }> = ({ children }) => (
  <ol className="list-decimal space-y-2 pl-5 marker:text-ink-muted">{children}</ol>
);

export const Copyable: FC<{ label: string; value: string | null | undefined; secret?: boolean }> = ({
  label,
  value,
  secret,
}) => (
  <div className="space-y-1">
    <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">{label}</p>
    {value ? <CodeBlock value={value} secret={secret} /> : <p className="text-sm text-ink-muted">Not available yet</p>}
  </div>
);

/* ─────────────────────────── Live checklist ─────────────────────────── */

export type StepStatus = "done" | "todo" | "error" | "optional";

export interface GuideStep {
  id: string;
  title: string;
  status: StepStatus;
  /** One line shown under the title (e.g. what was detected). */
  summary?: ReactNode;
  body: ReactNode;
}

const StatusIcon: FC<{ status: StepStatus; n: number }> = ({ status, n }) => {
  if (status === "done") return <CheckCircleIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />;
  if (status === "error") return <XCircleIcon className="h-7 w-7 text-red-600 dark:text-red-400" />;
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
        status === "optional" ? "border-dashed border-line-strong text-ink-muted" : "border-primary-500/40 text-primary-700 dark:text-primary-300",
      )}
    >
      {n}
    </span>
  );
};

/**
 * A setup checklist whose steps tick themselves off from real events. The
 * first unfinished step opens automatically; finished ones collapse.
 */
export const GuideChecklist: FC<{
  title: string;
  description?: ReactNode;
  steps: GuideStep[];
  onRefresh?: () => void;
  refreshing?: boolean;
  doneMessage?: ReactNode;
}> = ({ title, description, steps, onRefresh, refreshing, doneMessage }) => {
  const required = steps.filter((s) => s.status !== "optional");
  const done = required.filter((s) => s.status === "done").length;
  const firstOpen = steps.find((s) => s.status === "todo" || s.status === "error")?.id ?? null;
  const [open, setOpen] = useState<Set<string>>(() => new Set(firstOpen ? [firstOpen] : []));

  // When a step completes, move on to the next one.
  useEffect(() => {
    if (firstOpen) setOpen((current) => (current.has(firstOpen) ? current : new Set([...current, firstOpen])));
  }, [firstOpen]);

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const complete = done === required.length;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h3 className="text-base font-medium text-ink">{title}</h3>
          {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-ink-muted">
            {done} of {required.length} done
          </span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <ArrowPathIcon className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Check again
            </button>
          )}
        </div>
      </div>
      <div className="h-1 bg-surface-2">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${required.length ? (done / required.length) * 100 : 0}%` }}
        />
      </div>
      {complete && doneMessage && (
        <div className="px-5 pt-4">
          <Callout tone="success">{doneMessage}</Callout>
        </div>
      )}
      <ol className="divide-y divide-line">
        {steps.map((step, i) => {
          const isOpen = open.has(step.id);
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => toggle(step.id)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 px-5 py-4 text-left transition hover:bg-surface-2/40"
              >
                <StatusIcon status={step.status} n={i + 1} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className={cn("text-sm font-medium", step.status === "done" ? "text-ink-soft" : "text-ink")}>
                    {step.title}
                    {step.status === "optional" && <span className="ml-2 text-xs font-normal text-ink-muted">Optional</span>}
                  </p>
                  {step.summary && <div className="mt-0.5 text-xs text-ink-muted">{step.summary}</div>}
                </div>
                <ChevronDownIcon className={cn("mt-1 h-4 w-4 shrink-0 text-ink-muted transition", isOpen && "rotate-180")} />
              </button>
              {isOpen && <div className="space-y-3 px-5 pb-5 pl-[3.75rem] text-sm leading-relaxed text-ink-soft">{step.body}</div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/* ───────────────────── Deployment warnings ───────────────────── */

/**
 * Shown on any setup that needs a provider (Meta, an email service, a
 * customer's server) to call this API: they can't reach `localhost`.
 */
export const PublicUrlWarning: FC<{ who: string }> = ({ who }) => {
  const { environment } = useEnvironment();
  if (!environment?.apiPublicUrlIsLocal) return null;
  return (
    <Callout tone="warning" title={`${who} can't reach your server yet`}>
      <p>
        Your API's public address is <code className="font-mono text-xs">{environment.apiPublicUrl}</code>, which only
        works on this computer. Whoever runs the server needs to give it a public https address:
      </p>
      <Instructions>
        <li>
          On a laptop, start a tunnel: <code className="font-mono text-xs">cloudflared tunnel --url http://localhost:8001</code>{" "}
          and copy the <code className="font-mono text-xs">https://…trycloudflare.com</code> address it prints.
        </li>
        <li>
          Set <code className="font-mono text-xs">API_PUBLIC_URL</code> to that address in{" "}
          <code className="font-mono text-xs">talktous-api/.env</code> and restart the API.
        </li>
        <li>Reload this page: the URLs below will update. In production, use your real API domain instead.</li>
      </Instructions>
    </Callout>
  );
};
