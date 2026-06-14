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
      "rounded-2xl border border-line bg-surface shadow-[var(--shadow-card)]",
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
  draft: "bg-violet-500/12 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
};

export const Badge: FC<{ status: BadgeVariant; className?: string }> = ({
  status,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      badgeStyles[status],
      className
    )}
  >
    {status}
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
  src?: string;
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
        "inline-flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-300",
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
  className?: string;
  disabled?: boolean;
  values?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  touched?: Record<string, unknown>;
  handleChange?: React.ChangeEventHandler<HTMLInputElement>;
  handleBlur?: React.FocusEventHandler<HTMLInputElement>;
}

const fieldBase =
  "w-full rounded-xl border bg-surface px-3.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-60";

export const TextInput: FC<InputProps> = ({
  id,
  label,
  type = "text",
  placeholder,
  className,
  disabled,
  values = {},
  errors = {},
  touched = {},
  handleChange,
  handleBlur,
}) => {
  const hasError = touched[id] && errors[id];
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
        className={cn(
          fieldBase,
          "h-[42px]",
          hasError ? "border-red-400 focus:border-red-400 focus:ring-red-500/15" : "border-line"
        )}
      />
      {hasError && (
        <p className="text-xs text-red-500">{errors[id] as string}</p>
      )}
    </div>
  );
};

// ─── TextArea ────────────────────────────────────────────────────────────────
interface TextAreaProps extends Omit<InputProps, "type" | "handleChange"> {
  rows?: number;
  handleChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
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
  const hasError = touched[id] && errors[id];
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
        onBlur={handleBlur as React.FocusEventHandler<HTMLTextAreaElement>}
        disabled={disabled}
        className={cn(
          fieldBase,
          "py-2.5",
          hasError ? "border-red-400 focus:border-red-400 focus:ring-red-500/15" : "border-line"
        )}
      />
      {hasError && (
        <p className="text-xs text-red-500">{errors[id] as string}</p>
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
        checked ? "bg-primary-600" : "bg-surface-2 dark:bg-white/15",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
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
          className="rounded-lg px-3 py-1.5 font-medium transition hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Previous
        </button>
        <span className="font-medium text-ink">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg px-3 py-1.5 font-medium transition hover:bg-surface-2 disabled:opacity-40 disabled:hover:bg-transparent"
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
        "rounded-lg px-2.5 py-1 text-xs font-medium transition",
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
    <h3 className="text-sm font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── SelectInput ─────────────────────────────────────────────────────────────
export { default as SelectInput } from "./SelectInput";
