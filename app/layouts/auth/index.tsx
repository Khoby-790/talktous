import { type FC, type ReactNode } from "react";
import { BrandLogo } from "~/components/brand";
import { Link } from "react-router";

interface AuthLayoutProps {
  children: ReactNode;
  /** Wider card for multi-step flows (onboarding). */
  wide?: boolean;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children, wide }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app p-4">
    {/* Soft brand glow */}
    <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary-500/15 blur-3xl" />
    <div className={wide ? "relative w-full max-w-2xl" : "relative w-full max-w-md"}>
      <Link to="/" className="mb-8 flex flex-col items-center text-center">
        <h1 className="sr-only">Asotie</h1>
        <BrandLogo className="h-12" />
        <p className="label-caps mt-4 text-ink-soft">Customer support platform</p>
      </Link>
      <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">{children}</div>
    </div>
  </div>
);

export default AuthLayout;
