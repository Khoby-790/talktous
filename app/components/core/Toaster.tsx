import { type FC } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useToast, type ToastType } from "~/hooks/ui/use-toast";
import { cn } from "~/lib/utils";

const icons: Record<ToastType, typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const tones: Record<ToastType, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  info: "text-primary-600 dark:text-primary-300",
  warning: "text-amber-600 dark:text-amber-400",
};

/** Renders the global toast stack (see hooks/ui/use-toast). Mounted once in root.tsx. */
export const Toaster: FC = () => {
  const { toasts, removeToast } = useToast();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            role={t.type === "error" ? "alert" : "status"}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-[var(--pop-border)] bg-surface px-4 py-3 text-sm text-ink shadow-lg"
          >
            <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tones[t.type])} />
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="rounded p-0.5 text-ink-muted transition hover:text-ink"
              aria-label="Dismiss"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
