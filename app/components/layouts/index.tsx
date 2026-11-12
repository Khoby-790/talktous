import { type FC, type ReactNode, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { Spinner } from "~/components/core";

// ─── Modal ───────────────────────────────────────────────────────────────────
const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: keyof typeof sizeClasses;
  loading?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: FC<ModalProps> = ({
  open,
  onClose,
  title,
  size = "md",
  loading,
  children,
  footer,
}) => (
  <Transition appear show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-deep/50 backdrop-blur-sm dark:bg-deep/80" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel
              className={cn(
                "w-full rounded-2xl border border-[var(--pop-border)] bg-surface",
                sizeClasses[size]
              )}
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <Dialog.Title className="text-xl font-medium tracking-tight text-ink">
                  {title}
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="rounded-md p-1 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Spinner />
                  </div>
                ) : (
                  children
                )}
              </div>
              {footer && (
                <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
                  {footer}
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// ─── Drawer ──────────────────────────────────────────────────────────────────
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Drawer: FC<DrawerProps> = ({ open, onClose, title, children }) => (
  <Transition show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in-out duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-deep/50 backdrop-blur-sm dark:bg-deep/80" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col border-l border-line bg-surface">
                  <div className="flex items-center justify-between border-b border-line px-6 py-4">
                    <Dialog.Title className="text-base font-medium text-ink">
                      {title}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-md p-1 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition>
);

// ─── Header ──────────────────────────────────────────────────────────────────
interface HeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: string[];
}

export const Header: FC<HeaderProps> = ({
  title,
  description,
  action,
  breadcrumb,
}) => (
  <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-5">
    <div>
      {breadcrumb && (
        <p className="label-caps mb-2 text-ink-muted">{breadcrumb.join(" / ")}</p>
      )}
      <h1 className="text-3xl font-medium leading-none tracking-display text-ink md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-2 text-sm text-ink-soft">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);
