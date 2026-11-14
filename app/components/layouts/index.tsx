import { type FC, type ReactNode, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { cn } from "~/lib/utils";
import { PrimaryButton } from "~/components/buttons";

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
        enter="ease-out duration-[250ms]"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-out duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-deep/45 backdrop-blur-[3px] dark:bg-deep/75" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-[250ms] motion-reduce:transform-none"
            enterFrom="opacity-0 translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="ease-out duration-150 motion-reduce:transform-none"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Dialog.Panel
              className={cn(
                "w-full rounded-2xl border border-[var(--pop-border)] bg-surface shadow-pop",
                sizeClasses[size]
              )}
            >
              <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4">
                <Dialog.Title className="type-title-md text-ink">
                  {title}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="-mr-1.5 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-5">
                {loading ? (
                  // Skeleton, not a spinner: content is on its way.
                  <div className="space-y-3 py-2" role="status" aria-label="Loading">
                    <div className="skeleton h-4 w-1/3 rounded-md" />
                    <div className="skeleton h-9 w-full rounded-md" />
                    <div className="skeleton h-9 w-full rounded-md" />
                    <div className="skeleton h-9 w-2/3 rounded-md" />
                  </div>
                ) : (
                  children
                )}
              </div>
              {footer && (
                <div className="flex justify-end gap-2.5 rounded-b-2xl border-t border-line bg-surface-2/30 px-6 py-3.5">
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
        enter="ease-out duration-[250ms]"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-out duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-deep/45 backdrop-blur-[3px] dark:bg-deep/75" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-[250ms]"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-out duration-150"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                <div className="flex h-full flex-col border-l border-line bg-surface shadow-pop">
                  <div className="flex items-center justify-between border-b border-line px-6 py-4">
                    <Dialog.Title className="type-title-md text-ink">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="-mr-1.5 rounded-md p-1.5 text-ink-muted transition hover:bg-surface-2 hover:text-ink"
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
  <div className="mb-5 flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-3">
    <div className="min-w-0">
      {breadcrumb && (
        <p className="label-caps mb-2 text-ink-muted">{breadcrumb.join(" / ")}</p>
      )}
      <h1 className="type-title-lg text-ink">{title}</h1>
      {description && (
        <p className="type-body mt-1 max-w-2xl text-ink-muted">{description}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ─── ConfirmModal ────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  loading?: boolean;
}

/** "Are you sure?" dialog for destructive or hard-to-reverse actions. */
export const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  loading,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    size="md"
    footer={
      <>
        <PrimaryButton variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </PrimaryButton>
        <PrimaryButton variant={variant} onClick={() => void onConfirm()} loading={loading}>
          {confirmLabel}
        </PrimaryButton>
      </>
    }
  >
    <div className="type-body text-ink-soft">{description}</div>
  </Modal>
);

// ─── PageShimmer ─────────────────────────────────────────────────────────────
/** Page-level loading skeleton (never a bare spinner for page loads). */
export const PageShimmer: FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-6" role="status" aria-label="Loading">
    <div className="space-y-3">
      <div className="skeleton h-8 w-56 rounded-md" />
      <div className="skeleton h-3.5 w-80 max-w-full rounded-md" />
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="skeleton h-[124px] rounded-2xl" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton h-44 rounded-2xl" />
    ))}
  </div>
);
