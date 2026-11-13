import { makeVar } from "@apollo/client";
import { useReactiveVar } from "@apollo/client/react";
import { useMemo } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

/** One global stack, rendered by <Toaster/> in the root, so any component can notify. */
export const toastsVar = makeVar<Toast[]>([]);

const remove = (id: string) => toastsVar(toastsVar().filter((t) => t.id !== id));

const push = (message: string, type: ToastType = "info", durationMs = 4500) => {
  const id = Math.random().toString(36).slice(2);
  toastsVar([...toastsVar().slice(-4), { id, message, type }]);
  if (durationMs > 0) setTimeout(() => remove(id), durationMs);
  return id;
};

/** Imperative API, usable outside components too. */
export const toast = {
  success: (message: string) => push(message, "success"),
  error: (message: string) => push(message, "error", 7000),
  info: (message: string) => push(message, "info"),
  warning: (message: string) => push(message, "warning", 6000),
  dismiss: remove,
};

export const useToast = () => {
  const toasts = useReactiveVar(toastsVar);
  return useMemo(
    () => ({ toasts, toast, addToast: push, removeToast: remove }),
    [toasts],
  );
};
