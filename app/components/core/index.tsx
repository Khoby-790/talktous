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
      "rounded-2xl border border-line bg-surface shadow-card",
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
  open: "bg-info-soft text-info",
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
  incomplete: "bg-red-500/12 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  canceled: badgeStyles.inactive,
};

export const Badge: FC<{ status: BadgeVariant | string; label?: string; className?: string }> = ({
  status,
  label,
  className,
}) => (
  <span
    className={cn(
      "type-caption inline-flex h-[22px] items-center whitespace-nowrap rounded-md px-2 capitalize",
      badgeStyles[status as BadgeVariant] ?? extraBadgeStyles[status] ?? badgeStyles.closed,
      className
    )}
  >
    {label ?? status.replace(/_/g, " ")}
  </span>
);

// ─── StatusDot ───────────────────────────────────────────────────────────────
const dotStyles: Record<string, string> = {
  online: "bg-online",
  offline: "bg-offline",
  busy: "bg-busy",
  away: "bg-away",
};

export const StatusDot: FC<{ status: string; className?: string }> = ({
  status,
  className,
}) => (
  <span
    className={cn(
      "inline-block h-2.5 w-2.5 rounded-full",
      dotStyles[status] || "bg-offline",
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

/*
 * Initials avatars take one of four tints, chosen from the name, so the same
 * person is always the same tone and a list of people can be scanned by it as
 * well as by letters. Every tint comes from the palette's own ramp; none is
 * orange, which is kept for what needs attention.
 */
const avatarTints = [
  "bg-primary-100 text-primary-800 dark:bg-primary-400/20 dark:text-primary-200",
  "bg-primary-800 text-primary-100 dark:bg-mist/12 dark:text-mist",
  "bg-phosphor text-fuchsia-900 dark:bg-phosphor/12 dark:text-phosphor",
  "bg-surface-2 text-ink-soft",
];

const tintFor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return avatarTints[hash % avatarTints.length];
};

export const Avatar: FC<{
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}> = ({ name, src, size = "md", className }) => {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  return src ? (
    <img
      src={src}
      alt={name}
      className={cn("rounded-full object-cover", sizeMap[size], className)}
    />
  ) : (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium",
        tintFor(name),
        sizeMap[size],
        className
      )}
      title={name}
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
  /** Shows a "*" after the label. */
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /**
   * A credential from another service (an API token, an ID): masked like a
   * password but NOT a password field, and opted out of browser and password
   * manager autofill — otherwise Chrome treats the form as a login and fills
   * in the user's own email and password.
   */
  secret?: boolean;
  values?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  touched?: Record<string, unknown>;
  handleChange?: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur?: React.FocusEventHandler<HTMLInputElement>;
}

/* 36px controls with a `control` border (3:1 on every ground). Focus is the
   global ring; nothing here draws its own. */
const fieldBase =
  "type-body w-full rounded-md border bg-field px-3 text-ink transition-colors duration-150 placeholder:text-ink-muted disabled:cursor-not-allowed disabled:opacity-60";
const fieldBorder = (hasError: boolean) =>
  hasError ? "border-red-600 dark:border-red-400" : "border-control hover:border-ink-soft";
const fieldLabel = "type-label text-ink";
const fieldError = "type-caption text-red-700 dark:text-red-300";
const fieldHint = "type-caption text-ink-muted";

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
  required,
  inputMode,
  secret,
  values = {},
  errors = {},
  touched = {},
  handleChange,
  handleBlur,
}) => {
  const hasError = Boolean(touched[id] && errors[id]);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={fieldLabel}>
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type={secret ? "text" : type}
        placeholder={placeholder}
        value={(values[id] as string) || ""}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        aria-required={required || undefined}
        aria-invalid={hasError || undefined}
        aria-describedby={hasError || hint ? `${id}-help` : undefined}
        inputMode={inputMode}
        autoComplete={secret ? "off" : autoComplete}
        autoCorrect={secret ? "off" : undefined}
        autoCapitalize={secret ? "off" : undefined}
        spellCheck={secret ? false : undefined}
        data-1p-ignore={secret || undefined}
        data-lpignore={secret ? "true" : undefined}
        data-bwignore={secret || undefined}
        data-form-type={secret ? "other" : undefined}
        autoFocus={autoFocus}
        style={secret ? ({ WebkitTextSecurity: "disc" } as React.CSSProperties) : undefined}
        className={cn(
          fieldBase,
          "h-9",
          fieldBorder(hasError)
        )}
      />
      {hasError ? (
        <p id={`${id}-help`} className={fieldError}>{String(errors[id])}</p>
      ) : (
        hint && <p id={`${id}-help`} className={fieldHint}>{hint}</p>
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
      <label htmlFor={id} className={fieldLabel}>
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
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? `${id}-help` : undefined}
        className={cn(
          fieldBase,
          "py-2",
          fieldBorder(hasError)
        )}
      />
      {hasError && (
        <p id={`${id}-help`} className={fieldError}>{String(errors[id])}</p>
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
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-out",
        checked ? "bg-primary" : "bg-line-strong",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full ring-0 transition duration-150 ease-out",
          checked ? "translate-x-5 bg-on-primary" : "translate-x-0 bg-white"
        )}
      />
    </button>
    <label
      htmlFor={id}
      className={cn(fieldLabel, "cursor-pointer")}
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
    <div className="type-label flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 font-normal text-ink-soft">
      <span className="tabular-nums">
        Showing <span className="font-medium text-ink">{start}–{end}</span> of{" "}
        <span className="font-medium text-ink">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="type-label h-8 rounded-md border border-control px-3 text-ink transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
        >
          Previous
        </button>
        <span className="px-1 tabular-nums text-ink-muted">
          Page <span className="font-medium text-ink">{page}</span> of {Math.max(totalPages, 1)}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="type-label h-8 rounded-md border border-control px-3 text-ink transition-colors duration-150 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent"
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
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API is unavailable on insecure origins or when permission is
      // denied; fall back to the selection-based copy.
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      if (!ok) return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "type-caption rounded-md px-2.5 py-1 transition-colors duration-150",
        copied
          ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
          : "bg-surface-2 text-ink-soft hover:text-ink",
        className
      )}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

// ─── EmptyState ──────────────────────────────────────────────────────────────
/**
 * Nothing here yet: one sentence saying what will appear, and one action to
 * make it happen. No illustration — the page stays quiet.
 */
export const EmptyState: FC<{
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}> = ({ title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
    <h3 className="type-body font-medium text-ink">{title}</h3>
    {description && <div className="type-body mt-1 max-w-md text-ink-muted">{description}</div>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── ErrorState ──────────────────────────────────────────────────────────────
/**
 * A request failed: an inline banner saying what failed, with a retry. Never
 * show an EmptyState for this — "No apps yet" on a failed request tells people
 * their data is gone.
 */
export const ErrorState: FC<{
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
  className?: string;
}> = ({ title = "We couldn't load this.", description = "Check your connection and try again.", onRetry, className }) => (
  <div
    role="alert"
    className={cn(
      "m-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-md border border-red-500/25 bg-red-500/10 px-4 py-3",
      className
    )}
  >
    <div className="type-body min-w-0">
      <p className="font-medium text-ink">{title}</p>
      <div className="text-ink-soft">{description}</div>
    </div>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="type-label inline-flex h-9 shrink-0 items-center rounded-md border border-control bg-surface px-4 text-ink transition-colors duration-150 hover:bg-surface-2"
      >
        Try again
      </button>
    )}
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
          "min-w-0 flex-1 font-mono text-[13px] leading-5 text-ink",
          multiline ? "overflow-x-auto whitespace-pre" : "truncate",
          !revealed && "select-none blur-[3px]"
        )}
      >
        {value}
      </code>
      {secret && (
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          className="type-caption rounded-md bg-surface-2 px-2.5 py-1 text-ink-soft transition-colors duration-150 hover:text-ink"
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

/**
 * The channel, plus which app it came in on when known: with two WhatsApp
 * numbers (or two inboxes) "WhatsApp" alone doesn't tell agents which one.
 */
export const ChannelBadge: FC<{ channel: string; appName?: string | null; className?: string }> = ({
  channel,
  appName,
  className,
}) => {
  const text = appName ? `${channelLabel(channel)} · ${appName}` : channelLabel(channel);
  return (
    <span
      title={text}
      className={cn(
        "inline-flex max-w-[14rem] items-center truncate rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-soft",
        className
      )}
    >
      {text}
    </span>
  );
};

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
          "type-label -mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 transition-colors duration-150",
          tab.value === value
            ? "border-primary-600 text-ink dark:border-primary-300"
            : "border-transparent text-ink-muted hover:text-ink"
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className="type-caption rounded-md bg-surface-2 px-1.5 tabular-nums text-ink-soft">{tab.count}</span>
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
