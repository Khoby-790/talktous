import { type FC, type ReactNode, useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { BrandLogo } from "~/components/brand";
import { FluidBackdrop, Voice } from "~/components/fluid";
import { cn } from "~/lib/utils";
import { LEGAL } from "./company";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Paragraph, list and emphasis styles for legal prose on the dark Auros surface. */
export const P: FC<{ children: ReactNode }> = ({ children }) => <p className="mt-4 first:mt-0">{children}</p>;
export const UL: FC<{ children: ReactNode }> = ({ children }) => (
  <ul className="mt-4 space-y-2.5 pl-1 [&>li]:relative [&>li]:pl-5 [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:top-[0.7em] [&>li]:before:h-1.5 [&>li]:before:w-1.5 [&>li]:before:rounded-full [&>li]:before:bg-ember/70">
    {children}
  </ul>
);
export const B: FC<{ children: ReactNode }> = ({ children }) => <strong className="font-medium text-white">{children}</strong>;
export const Mail: FC<{ to: string }> = ({ to }) => (
  <a href={`mailto:${to}`} className="text-[#ffa25e] underline-offset-4 hover:text-ember hover:underline">
    {to}
  </a>
);

/** Highlights the section currently in view in the table of contents. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export const LegalPage: FC<{
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  sections: LegalSection[];
}> = ({ eyebrow, title, intro, sections }) => {
  const active = useActiveSection(sections.map((s) => s.id));

  // Deep links (/terms#liability): the SPA renders after the browser's own hash scroll.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, []);

  return (
    <div className="dark relative min-h-screen overflow-x-clip bg-abyss font-sans text-silver antialiased selection:bg-ember selection:text-white">
      <div className="absolute inset-x-0 top-0 h-[720px]">
        <FluidBackdrop intensity="soft" />
      </div>

      <header className="relative z-20">
        <nav className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 md:px-10">
          <Link to="/" aria-label="Asotie — home">
            <BrandLogo tone="light" className="h-8" />
          </Link>
          <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/10">
            {[
              { to: "/privacy", label: "Privacy" },
              { to: "/terms", label: "Terms" },
            ].map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-[12px] font-medium transition",
                    isActive ? "bg-ember text-white shadow-[0_0_24px_-6px_rgba(255,122,26,0.8)]" : "text-silver hover:text-white"
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-[1280px] px-5 pb-32 md:px-10">
        <div className="fade-up-2 max-w-[760px] pb-16 pt-16 md:pt-24">
          <p className="label-caps mb-6 flex items-center gap-2.5 text-silver">
            <span className="h-1.5 w-1.5 rounded-full bg-ember shadow-[0_0_10px_rgba(255,122,26,0.8)]" />
            {eyebrow}
          </p>
          <h1 className="text-[clamp(2.75rem,7vw,5rem)] leading-[0.96] tracking-display text-white">{title}</h1>
          <p className="mt-7 max-w-[620px] text-[17px] leading-[1.65] text-silver">{intro}</p>
          <p className="mt-8 text-[11px] uppercase tracking-[0.15em] text-silver/60">Last updated · {LEGAL.lastUpdated}</p>
        </div>

        <div className="grid grid-cols-1 gap-12 border-t border-white/10 pt-14 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-20">
          <aside className="hidden lg:block">
            <nav className="sticky top-8 space-y-1" aria-label="On this page">
              <p className="label-caps mb-4 text-silver/60">On this page</p>
              {sections.map((s, i) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={cn(
                    "flex gap-3 rounded-xl px-3 py-2 text-[13px] leading-snug transition",
                    active === s.id ? "bg-white/[0.05] text-white" : "text-silver/80 hover:text-white"
                  )}
                >
                  <span className={cn("tabular-nums", active === s.id ? "text-ember" : "text-silver/40")}>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="max-w-[720px] space-y-16 text-[15.5px] leading-[1.75]">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-8">
                <h2 className="mb-5 flex items-baseline gap-4 text-[clamp(1.5rem,2.4vw,1.9rem)] leading-tight tracking-display text-white">
                  <span className="font-serif text-[0.8em] italic text-ember/80">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}

            <div className="rounded-[28px] bg-deep/70 p-8 ring-1 ring-white/10 backdrop-blur-xl">
              <p className="text-[clamp(1.5rem,2.6vw,2rem)] leading-tight tracking-display text-white">
                Questions? <Voice>A person will answer.</Voice>
              </p>
              <p className="mt-3 text-silver">
                Write to <Mail to={LEGAL.privacyEmail} /> for privacy matters or <Mail to={LEGAL.legalEmail} /> for anything about these terms.
              </p>
            </div>
          </article>
        </div>
      </main>

      <footer className="relative border-t border-white/10 bg-deep px-5 py-8 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-3 text-[12px] text-silver/70 sm:flex-row">
          <span>© 2026 {LEGAL.product}</span>
          <span className="flex gap-5">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <a href={`mailto:${LEGAL.supportEmail}`} className="hover:text-white">Support</a>
          </span>
        </div>
      </footer>
    </div>
  );
};
