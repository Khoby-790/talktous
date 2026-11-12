import { type FC, type ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app p-4">
    {/* Soft brand glow */}
    <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-primary-500/15 blur-3xl" />
    <div className="relative w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-aurora">
          <span className="text-sm font-medium tracking-[0.08em] text-[#222222]">TU</span>
        </div>
        <h1 className="text-4xl font-medium leading-none tracking-display text-ink">Talk To Us</h1>
        <p className="label-caps mt-3 text-ink-soft">Customer support platform</p>
      </div>
      <div className="rounded-2xl border border-line bg-surface p-8">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
