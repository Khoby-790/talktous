import { type FC, type ReactNode } from "react";

/** Display title + subtitle at the top of an auth screen. Titles can carry a <Voice> accent. */
export const AuthHeading: FC<{ title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode }> = ({ title, subtitle, eyebrow }) => (
  <div className="mb-9">
    {eyebrow && (
      <p className="label-caps mb-5 flex items-center gap-2.5 text-silver">
        <span className="h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_10px_rgba(255,122,26,0.8)]" />
        {eyebrow}
      </p>
    )}
    <h2 className="text-[clamp(2.4rem,5vw,3.25rem)] leading-[0.98] tracking-display text-white">{title}</h2>
    {subtitle && <p className="mt-4 text-[15px] leading-[1.6] text-silver">{subtitle}</p>}
  </div>
);

/** Small footer line under an auth form ("Don't have an account? …"). */
export const AuthFooter: FC<{ children: ReactNode }> = ({ children }) => (
  <p className="mt-8 text-center text-sm text-silver">{children}</p>
);

export const authLinkClass = "font-medium text-[#ffa25e] underline-offset-4 transition hover:text-ember hover:underline";
