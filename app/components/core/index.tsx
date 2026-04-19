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
  open: "bg-blue-500/15 text-blue-400",
  pending: "bg-amber-500/15 text-amber-400",
  resolved: "bg-green-500/15 text-green-400",
  closed: "bg-slate-500/15 text-slate-400",
  online: "bg-green-500/15 text-green-400",
  offline: "bg-slate-500/15 text-slate-400",
  busy: "bg-red-500/15 text-red-400",
  away: "bg-amber-500/15 text-amber-400",
  active: "bg-green-500/15 text-green-400",
  inactive: "bg-slate-500/15 text-slate-400",
  draft: "bg-violet-500/15 text-violet-400",
};

export const Badge: FC<{ status: BadgeVariant; className?: string }> = ({
  status,
  className,
}) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      badgeStyles[status],
      className
    )}
  >
    {status}
  </span>
);

// ─── StatusDot ───────────────────────────────────────────────────────────────
const dotStyles: Record<string, string> = {
  online: "bg-green-500",
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
        "inline-flex items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700",
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
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
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
          "h-[38px] w-full rounded-md border px-3 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50",
          hasError ? "border-red-400" : "border-gray-300"
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
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
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
          "w-full rounded-md border px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50",
          hasError ? "border-red-400" : "border-gray-300"
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
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
        checked ? "bg-primary-600" : "bg-gray-200",
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
      className="cursor-pointer text-sm font-medium text-gray-700"
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
    <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
      <span>
        Showing {start}–{end} of {total} results
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded px-3 py-1 transition disabled:opacity-40 hover:bg-gray-100"
        >
          Previous
        </button>
        <span className="font-medium text-gray-800">
          {page} / {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded px-3 py-1 transition disabled:opacity-40 hover:bg-gray-100"
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
        "rounded px-2 py-1 text-xs font-medium transition",
        copied
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200",
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
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--color-surface-elevated)" }}>
      <svg
        className="h-8 w-8 text-slate-600"
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
    <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
    {description && (
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    )}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── SelectInput ─────────────────────────────────────────────────────────────
export { default as SelectInput } from "./SelectInput";
