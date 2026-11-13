import { type FC, type ReactNode, useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { BrandMark } from "~/components/brand";
import { IMG, ParticleSphere, Voice } from "~/components/fluid";
import { cn } from "~/lib/utils";

/**
 * The visual half of the auth screens: the Asotie mark at the heart of the
 * particle orb, the people of a support team orbiting it, and a glass card
 * cycling through moments from a live inbox. People at the center, AI in orbit.
 */

type Moment = { face: string; text: ReactNode; meta: string };

const moments: Moment[] = [
  {
    face: IMG.customerFace,
    text: (
      <>
        Ama rated Kwame{" "}
        <span className="inline-flex translate-y-[2px] text-ember">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} className="h-3.5 w-3.5" />
          ))}
        </span>
      </>
    ),
    meta: "WhatsApp · just now",
  },
  { face: IMG.mei, text: "Mei picked up three conversations from the queue", meta: "Live chat · 1m" },
  { face: IMG.kwame, text: "Kwame sent an AI draft, with his own touch", meta: "Email · 2m" },
  { face: IMG.rafael, text: "Rafael added “Refund policy” to the knowledge base", meta: "Knowledge · 5m" },
];

/** People on the inner ring; customers on the outer one. Angles in degrees. */
const inner = [
  { src: IMG.kwame, angle: 20, size: "h-16 w-16", online: true },
  { src: IMG.mei, angle: 140, size: "h-14 w-14", online: true },
  { src: IMG.rafael, angle: 260, size: "h-12 w-12" },
];
const outer = [
  { src: IMG.customerFace, angle: 70, size: "h-12 w-12" },
  { initials: "JO", angle: 190, size: "h-10 w-10" },
  { initials: "LC", angle: 310, size: "h-9 w-9" },
];

const Ring: FC<{
  radius: number;
  className: string;
  items: { src?: string; initials?: string; angle: number; size: string; online?: boolean }[];
}> = ({ radius, className, items }) => (
  <div
    className={cn("absolute left-1/2 top-1/2 rounded-full border border-dashed border-white/10", className)}
    style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius }}
  >
    {items.map((it, i) => {
      const rad = (it.angle * Math.PI) / 180;
      return (
        <div
          key={i}
          className="absolute w-max"
          style={{ left: radius + Math.cos(rad) * radius, top: radius + Math.sin(rad) * radius, translate: "-50% -50%" }}
        >
          <div className="relative">
            {it.src ? (
              <img src={it.src} alt="" className={cn("rounded-full object-cover ring-2 ring-abyss", it.size)} />
            ) : (
              <span className={cn("flex items-center justify-center rounded-full bg-kelp text-[11px] text-mist ring-2 ring-abyss", it.size)}>
                {it.initials}
              </span>
            )}
            {it.online && <span className="live-dot absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-online ring-2 ring-abyss" />}
          </div>
        </div>
      );
    })}
  </div>
);

const MomentCard: FC = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % moments.length), 3800);
    return () => window.clearInterval(id);
  }, []);
  const m = moments[i];
  return (
    <div className="rounded-[22px] bg-deep/60 p-4 ring-1 ring-white/10 backdrop-blur-2xl">
      <div key={i} className="soft-in flex items-center gap-3.5">
        <img src={m.face} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-[14px] leading-snug text-white">{m.text}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-silver/70">{m.meta}</p>
        </div>
      </div>
      <div className="mt-3.5 flex gap-1.5">
        {moments.map((_, n) => (
          <span key={n} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", n === i ? "bg-ember" : "bg-white/10")} />
        ))}
      </div>
    </div>
  );
};

export const OrbitStage: FC = () => (
  <div className="relative flex h-full flex-col overflow-hidden rounded-[32px] bg-deep ring-1 ring-white/[0.06]">
    {/* Warm and cool currents */}
    <div className="blob pointer-events-none absolute -right-[20%] -top-[10%] aspect-square w-[70%] bg-ember/[0.12] blur-[110px]" />
    <div
      className="blob pointer-events-none absolute -bottom-[20%] -left-[10%] aspect-square w-[70%] bg-primary-600/25 blur-[110px]"
      style={{ animationDelay: "-9s, -6s" }}
    />

    <div className="relative flex items-center justify-between p-7">
      <span className="flex items-center gap-2.5 text-[10px] uppercase tracking-[0.15em] text-silver">
        <span className="live-dot h-2 w-2 rounded-full bg-online" /> Live across Asotie
      </span>
      <span className="text-[10px] uppercase tracking-[0.15em] text-silver/60">Chat · Email · WhatsApp · App</span>
    </div>

    {/* Orb + orbits */}
    <div className="relative min-h-[420px] flex-1">
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(92%,560px)] -translate-x-1/2 -translate-y-1/2">
        <div className="orb-glow absolute inset-[22%] rounded-full bg-primary-600/30 blur-[80px]" />
        <ParticleSphere className="absolute inset-0" density={1100} />
      </div>
      <Ring radius={150} className="orbit" items={inner} />
      <Ring radius={235} className="orbit-rev hidden xl:block" items={outer} />
      {/* The mark at the heart: the ember dot is the person */}
      <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-abyss/70 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="absolute inset-0 rounded-full bg-ember/20 blur-xl" />
        <BrandMark className="relative h-12 w-12 text-mist" />
      </div>
    </div>

    <div className="relative space-y-6 p-7 pt-0">
      <p className="max-w-[460px] text-[clamp(1.9rem,2.6vw,2.6rem)] leading-[1.02] tracking-display text-white">
        People at the center.
        <br />
        <Voice>AI in orbit.</Voice>
      </p>
      <MomentCard />
    </div>
  </div>
);
