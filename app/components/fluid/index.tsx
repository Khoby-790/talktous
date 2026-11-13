import { type FC, type ReactNode } from "react";
import { cn } from "~/lib/utils";

/*
 * Fluid — the shared motion language of the marketing site, auth and
 * onboarding: drifting aurora blobs, the bioluminescent particle orb, and the
 * human voice (serif italic in flowing ember). All of it settles to a static
 * frame under prefers-reduced-motion (see app.css).
 */

export { ParticleSphere } from "./particle-sphere";

export const IMG = {
  customer: "/landing/customer.jpg",
  customerFace: "/landing/customer-face.jpg",
  kwame: "/landing/kwame.jpg",
  mei: "/landing/mei.jpg",
  rafael: "/landing/rafael.jpg",
};

/** The human voice: serif italic in flowing ember — the orange at the heart of the logo. */
export const Voice: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <em className={cn("text-warm aurora-flow pr-[0.08em] font-serif font-normal italic tracking-normal", className)}>{children}</em>
);

/** Slow aurora blobs drifting and morphing behind a section. */
export const FluidBackdrop: FC<{ className?: string; intensity?: "soft" | "full" }> = ({ className, intensity = "full" }) => (
  <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
    <div
      className={cn(
        "blob absolute -left-[12%] top-[8%] aspect-square w-[48vw] max-w-[640px] blur-[100px]",
        intensity === "full" ? "bg-primary-600/35" : "bg-primary-600/20"
      )}
    />
    <div
      className={cn(
        "blob absolute -right-[10%] -top-[12%] aspect-square w-[42vw] max-w-[560px] blur-[110px]",
        intensity === "full" ? "bg-ember/[0.14]" : "bg-ember/[0.08]"
      )}
      style={{ animationDelay: "-8s, -5s" }}
    />
    <div
      className={cn(
        "blob absolute -bottom-[18%] left-[34%] aspect-square w-[40vw] max-w-[540px] blur-[120px]",
        intensity === "full" ? "bg-primary-300/20" : "bg-primary-300/10"
      )}
      style={{ animationDelay: "-15s, -11s" }}
    />
  </div>
);

/**
 * "Walk through the door": a teal-and-ember bloom that expands from `origin`
 * (usually the submit button) to fill the screen. Resolve, navigate, and the
 * bloom fades away once the next page has painted.
 */
export function playEnterTransition(origin?: HTMLElement | null): Promise<void> {
  if (typeof document === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return Promise.resolve();
  }
  const r = origin?.getBoundingClientRect();
  const x = r ? r.left + r.width / 2 : window.innerWidth / 2;
  const y = r ? r.top + r.height / 2 : window.innerHeight / 2;
  const el = document.createElement("div");
  el.className = "enter-bloom";
  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
  document.body.appendChild(el);
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
      window.setTimeout(() => {
        el.classList.add("is-out");
        window.setTimeout(() => el.remove(), 700);
      }, 250);
    }, 700);
  });
}
