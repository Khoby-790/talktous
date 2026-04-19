import {
  type FC,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/core";

const primaryButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white hover:bg-blue-500 focus:ring-blue-500 shadow-lg shadow-blue-900/30",
        secondary:
          "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-slate-100 focus:ring-blue-500",
        danger:
          "bg-red-600 text-white hover:bg-red-500 focus:ring-red-500",
        ghost:
          "text-slate-400 hover:bg-white/5 hover:text-slate-200 focus:ring-slate-500",
        success:
          "bg-green-600 text-white hover:bg-green-500 focus:ring-green-500",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-9 px-4",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof primaryButtonVariants> {
  loading?: boolean;
  children: ReactNode;
}

export const PrimaryButton: FC<PrimaryButtonProps> = ({
  variant,
  size,
  loading,
  disabled,
  className,
  children,
  ...props
}) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={cn(primaryButtonVariants({ variant, size }), className)}
  >
    {loading && <Spinner className="h-4 w-4" />}
    {children}
  </button>
);

type ActionType =
  | "invite"
  | "edit"
  | "view"
  | "remove"
  | "assign"
  | "copy"
  | "resend";

const actionIcons: Record<ActionType, string> = {
  invite:
    "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
  edit: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  view: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
  remove:
    "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
  assign:
    "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  copy: "M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z",
  resend:
    "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
};

const actionColors: Record<ActionType, string> = {
  invite: "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10",
  edit: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
  view: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
  remove: "text-red-400 hover:text-red-300 hover:bg-red-500/10",
  assign: "text-blue-400 hover:text-blue-300 hover:bg-blue-500/10",
  copy: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
  resend: "text-slate-400 hover:text-slate-200 hover:bg-white/5",
};

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action: ActionType;
  tooltip?: string;
}

export const ActionButton: FC<ActionButtonProps> = ({
  action,
  tooltip,
  className,
  ...props
}) => (
  <button
    {...props}
    title={tooltip || action}
    className={cn(
      "inline-flex items-center justify-center rounded-md p-1.5 transition",
      actionColors[action],
      className
    )}
  >
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={actionIcons[action]}
      />
    </svg>
  </button>
);
