import { type FC, type ReactNode } from "react";
import { Link } from "react-router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BrandLogo } from "~/components/brand";
import { FluidBackdrop } from "~/components/fluid";
import { OrbitStage } from "./stage";

/**
 * Signed-out screens: "the front door". Always Auros dark (the `dark` class
 * scopes the theme tokens to this subtree), form on the left, the orbit stage
 * on the right from lg up.
 */
const AuthLayout: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="dark relative min-h-screen overflow-hidden bg-abyss font-sans text-silver antialiased selection:bg-ember selection:text-white">
    <FluidBackdrop intensity="soft" />
    <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <main className="flex min-h-screen flex-col px-6 py-7 sm:px-12">
        <header className="flex items-center justify-between">
          <Link to="/" aria-label="Asotie — home">
            <h1 className="sr-only">Asotie</h1>
            <BrandLogo tone="light" className="h-8" />
          </Link>
          <Link to="/" className="label-caps flex items-center gap-2 text-silver transition hover:text-white">
            <ArrowLeftIcon className="h-3.5 w-3.5" strokeWidth={1.75} /> Back to site
          </Link>
        </header>
        <div className="flex flex-1 items-center py-14">
          <div className="fluid-fields fade-up-2 mx-auto w-full max-w-[420px]">{children}</div>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-silver/60">
          <span>© 2026 Asotie</span>
          <span className="flex gap-5">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
          </span>
        </footer>
      </main>
      <aside className="fade-up-3 hidden p-3 lg:block">
        <div className="sticky top-3 h-[calc(100vh-1.5rem)]">
          <OrbitStage />
        </div>
      </aside>
    </div>
  </div>
);

export default AuthLayout;
