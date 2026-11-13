import React, { type FC, type ReactNode } from "react";
import { cn } from "~/lib/utils";

// ─── Show ───────────────────────────────────────────────────────────────────
interface ShowProps {
  if: boolean;
  children: ReactNode;
}
export const Show: FC<ShowProps> = ({ if: condition, children }) =>
  condition ? <>{children}</> : null;

// ─── Spinner ─────────────────────────────────────────────────────────────────
export const Spinner: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent",
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

// ─── Card ────────────────────────────────────────────────────────────────────
export const Card: FC<{
  className?: string;
  children: ReactNode;
  as?: React.ElementType;
}> = ({ className, children, as: Tag = "div" }) => (
  <Tag
    className={cn(
      "rounded-2xl border border-line bg-surface",
      className
    )}
  >
    {children}
  </Tag>
);

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeVariant =
  | "open"
  | "pending"
  | "resolved"
  | "closed"
  | "online"
  | "offline"
  | "busy"
  | "away"
  | "active"
  | "inactive"
  | "draft";

const badgeStyles: Record<BadgeVariant, string> = {
  open: "bg-primary-500/10 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300",
  pending: "bg-amber-500/12 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  resolved: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  closed: "bg-slate-500/12 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  online: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  offline: "bg-slate-500/12 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  busy: "bg-red-500/12 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  away: "bg-amber-500/12 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  active: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  inactive: "bg-slate-500/12 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  draft: "bg-fuchsia-500/10 text-fuchsia-800 dark:bg-phosphor/10 dark:text-phosphor",
};

const extraBadgeStyles: Record<string, string> = {
  connected: badgeStyles.active,
  disconnected: badgeStyles.inactive,
  error: "bg-red-500/12 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  invited: badgeStyles.pending,
  admin: "bg-fuchsia-500/10 text-fuchsia-800 dark:bg-phosphor/10 dark:text-phosphor",
  supervisor: badgeStyles.open,
  agent: badgeStyles.closed,
  past_due: "bg-red-500/12 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  trialing: badgeStyles.pending,
  canceled: badgeStyles.inactive,
};

export const Badge: FC<{ status: BadgeVariant | string; label?: string; className?: string }> = ({
  status,
  label,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
      badgeStyles[status as BadgeVariant] ?? extraBadgeStyles[status] ?? badgeStyles.closed,
      className
    )}
  >
    {label ?? status.replace(/_/g, " ")}
  </span>
);

// ─── StatusDot ───────────────────────────────────────────────────────────────
const dotStyles: Record<string, string> = {
  online: "bg-emerald-500",
  offline: "bg-gray-400",
  busy: "bg-red-500",
  away: "bg-amber-400",
};

export const StatusDot: FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => (
  <span
    className={cn(
      "inline-block h-2.5 w-2.5 rounded-full",
      dotStyles[status] || "bg-gray-400",
      className
    )}
  />
);

// ─── Avatar ──────────────────────────────────────────────────────────────────
const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-11 w-11 text-base",
  xl: "h-14 w-14 text-lg",
};

export const Avatar: FC<{
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}> = ({ name, src, size = "md", className }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      className={cn("rounded-full object-cover", sizeMap[size], className)}
    />
  ) : (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary-100 font-medium text-primary-700 dark:bg-primary-500/20 dark:text-primary-300",
        sizeMap[size],
        className
      )}
    >
      {initials}
    </span>
  );
};

// ─── TextInput ───────────────────────────────────────────────────────────────
interface InputProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  disabled?: boolean;
  values?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  touched?: Record<string, unknown>;
  handleChange?: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const fieldBase =
  "w-full rounded-md border bg-field px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export const TextInput: FC<InputProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  hint,
  autoComplete,
  autoFocus,
  className,
  disabled,
  values = {},
  errors = {},
  touched = {},
  handleChange,
  handleBlur,
}) => {
  const hasError = Boolean(touched[id] && errors[id]);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={(values[id] as string) || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={cn(
          fieldBase,
          "h-[42px]",
          hasError ? "border-red-400 focus:border-red-400 focus:ring-red-500/15" : "border-line"
        )}
      />
      {hasError ? (
        <p className="text-xs text-red-500">{String(errors[id])}</p>
      ) : (
        hint && <p className="text-xs text-ink-muted">{hint}</p>
      )}
    </div>
  );
};

// ─── TextArea ────────────────────────────────────────────────────────────────
interface TextAreaProps extends Omit<InputProps, "type" | "handleChange" | "handleBlur"> {
  rows?: number;
  handleChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  handleBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}

export const TextArea: FC<TextAreaProps> = ({
  id,
  label,
  placeholder,
  rows = 4,
  className,
  disabled,
  values = {},
  errors = {},
  touched = {},
  handleChange,
  handleBlur,
}) => {
  const hasError = Boolean(touched[id] && errors[id]);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-soft">
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        placeholder={placeholder}
        value={(values[id] as string) || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        className={cn(
          fieldBase,
          "py-2.5",
          hasError ? "border-red-400 focus:border-red-400 focus:ring-red-500/15" : "border-line"
        )}
      />
      {hasError && (
        <p className="text-xs text-red-500">{String(errors[id])}</p>
      )}
    </div>
  );
};

// ─── Toggle ──────────────────────────────────────────────────────────────────
export const Toggle: FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}> = ({ id, label, checked, onChange, disabled }) => (
  <div className="flex items-center gap-3">
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary-500/20",
        checked ? "bg-primary-600" : "bg-line-strong",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
    <label
      htmlFor={id}
      className="cursor-pointer text-sm font-medium text-ink-soft"
    >
      {label}
    </label>
  </div>
);

// ─── Paginator ───────────────────────────────────────────────────────────────
export const Paginator: FC<{
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}> = ({ total, page, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-ink-soft">
      <span>
        Showing {start}–{end} of {total} results
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md px-3 py-1.5 font-medium transition hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Previous
        </button>
        <span className="font-medium text-ink">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md px-3 py-1.5 font-medium transition hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ─── CopyButton ──────────────────────────────────────────────────────────────
export const CopyButton: FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "rounded-md px-2.5 py-1 text-xs font-medium transition",
        copied
          ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
          : "bg-surface-2 text-ink-soft hover:text-ink",
        className
      )}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

// ─── EmptyState ──────────────────────────────────────────────────────────────
export const EmptyState: FC<{
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}> = ({ title, description, action, className }) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center py-16 text-center",
      className
    )}
  >
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
      <svg
        className="h-8 w-8 text-ink-muted"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <h3 className="text-sm font-medium text-ink">{title}</h3>
    {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── SelectInput ─────────────────────────────────────────────────────────────
export { default as SelectInput } from "./SelectInput";

// ─── EmptyValue ──────────────────────────────────────────────────────────────
/** The em dash shown for missing values in detail views. */
export const EmptyValue: FC = () => <span className="text-ink-muted">—</span>;

// ─── CodeBlock ───────────────────────────────────────────────────────────────
/** Monospace value (snippet, key, URL) with a copy button. `secret` blurs until revealed. */
export const CodeBlock: FC<{ value: string; className?: string; secret?: boolean; multiline?: boolean }> = ({
  value,
  className,
  secret,
  multiline,
}) => {
  const [revealed, setRevealed] = React.useState(!secret);
  return (
    <div className={cn("flex items-start gap-2 rounded-md border border-line bg-field p-2.5", className)}>
      <code
        className={cn(
          "min-w-0 flex-1 font-mono text-xs leading-relaxed text-ink",
          multiline ? "whitespace-pre-wrap break-all" : "truncate",
          !revealed && "select-none blur-[3px]"
        )}
      >
        {value}
      </code>
      {secret && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="rounded-md bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-soft hover:text-ink"
        >
          {revealed ? "Hide" : "Show"}
        </button>
      )}
      <CopyButton text={value} />
    </div>
  );
};

// ─── ChannelBadge / PriorityBadge ────────────────────────────────────────────
const channelLabels: Record<string, string> = {
  web: "Web chat",
  email: "Email",
  whatsapp: "WhatsApp",
  api: "API",
  web_widget: "Web widget",
};

export const channelLabel = (channel: string) => channelLabels[channel] ?? channel;

export const ChannelBadge: FC<{ channel: string; className?: string }> = ({ channel, className }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-soft",
      className
    )}
  >
    {channelLabel(channel)}
  </span>
);

const priorityStyles: Record<string, string> = {
  low: "text-ink-muted",
  normal: "text-ink-soft",
  high: "text-amber-600 dark:text-amber-400",
  urgent: "text-red-600 dark:text-red-400",
};

export const PriorityBadge: FC<{ priority: string; className?: string }> = ({ priority, className }) => (
  <span className={cn("inline-flex items-center gap-1 text-xs font-medium capitalize", priorityStyles[priority], className)}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {priority}
  </span>
);

// ─── Tabs ────────────────────────────────────────────────────────────────────
/** Underline tabs. Drive `value` from URL state (`useUrlState("tab")`) per the project convention. */
export const Tabs: FC<{
  tabs: { value: string; label: string; count?: number }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ tabs, value, onChange, className }) => (
  <div className={cn("flex gap-1 overflow-x-auto border-b border-line", className)} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        role="tab"
        aria-selected={tab.value === value}
        onClick={() => onChange(tab.value)}
        className={cn(
          "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition",
          tab.value === value
            ? "border-primary-600 text-ink dark:border-primary-300"
            : "border-transparent text-ink-muted hover:text-ink"
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] tabular-nums text-ink-soft">{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

// ─── FormError ───────────────────────────────────────────────────────────────
export const FormError: FC<{ message?: string | null; className?: string }> = ({ message, className }) =>
  message ? (
    <div
      role="alert"
      className={cn("rounded-md border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-700 dark:text-red-300", className)}
    >
      {message}
    </div>
  ) : null;
