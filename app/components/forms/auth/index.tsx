import { type FC, type ReactNode } from "react";

/** Title + subtitle at the top of an auth card. */
export const AuthHeading: FC<{ title: string; subtitle?: ReactNode }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-medium text-ink">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
  </div>
);

/** Small footer line under an auth form ("Don't have an account? …"). */
export const AuthFooter: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="mt-6 text-center text-sm text-ink-soft">{children}</p>
);

export const authLinkClass = "font-medium text-primary-600 hover:text-primary-700 dark:text-primary-300";
