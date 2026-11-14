import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "~/lib/utils";

/*
 * Cinema — the footage layer of the marketing site.
 *
 * Every clip in /public/landing comes as three files with one base name:
 *   <name>.mp4      1080p loop, no audio
 *   <name>-sm.mp4   540p loop for phones
 *   <name>.jpg      its first frame, used as the poster
 *
 * The still paints first and the clip fades in over it once it is playing, so
 * there is never an empty frame. Each clip ends on the frame it starts on, so
 * the loop has no seam. A clip plays only while it is on screen, and not at
 * all for people who ask for reduced motion or data saving — they get the
 * still, which is the same picture.
 */

/** Whether it is fair to play video at this visitor without being asked. */
const mayAutoplay = () => {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !connection?.saveData;
};

export const Footage: FC<{
  /** Base name under /landing, e.g. "hero". */
  name: string;
  /** Load straight away (the opening shot); everything else waits until it is near the screen. */
  priority?: boolean;
  /** Where the subject sits, as an object-position, so narrow screens crop around them. */
  focus?: string;
  className?: string;
}> = ({ name, priority, focus = "center", className }) => {
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setEnabled(mayAutoplay()), []);

  useEffect(() => {
    const el = video.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void el.play().catch(() => undefined);
        else el.pause();
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  return (
    <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* A slow push-in, done here rather than in the footage so the loop stays seamless. */}
      <div className="kenburns absolute inset-0">
        {/* (`loading` comes before `src` on purpose: set the other way round,
            the download starts before the browser knows it may wait.) */}
        <img
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          src={`/landing/${name}.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: focus }}
        />
        {enabled && (
          <video
            ref={video}
            muted
            loop
            playsInline
            disablePictureInPicture
            preload={priority ? "auto" : "none"}
            onPlaying={() => setPlaying(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
              playing ? "opacity-100" : "opacity-0",
            )}
            style={{ objectPosition: focus }}
          >
            <source src={`/landing/${name}-sm.mp4`} type="video/mp4" media="(max-width: 767px)" />
            <source src={`/landing/${name}.mp4`} type="video/mp4" />
          </video>
        )}
      </div>
    </div>
  );
};

/** Film grain over a scene, so footage, stills and flat colour share one texture. */
export const Grain: FC<{ className?: string }> = ({ className }) => (
  <div aria-hidden="true" className={cn("grain pointer-events-none absolute inset-0", className)} />
);

/** Chapter marker: the scene's number, a rule, and its name. */
export const Slate: FC<{ n: string; children: ReactNode; className?: string }> = ({ n, children, className }) => (
  <p className={cn("flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.2em] text-white/70", className)}>
    <span className="tabular-nums text-ember">{n}</span>
    <span aria-hidden="true" className="h-px w-8 bg-white/30" />
    {children}
  </p>
);

/** A line of dialogue set the way a film sets a subtitle. */
export const Subtitle: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <p
    className={cn(
      "font-serif italic leading-snug text-white/90 [text-shadow:0_1px_18px_rgba(0,0,0,0.65)]",
      className,
    )}
  >
    {children}
  </p>
);

/** A still in a wide frame, with room for a caption over its darker side. */
export const Still: FC<{
  src: string;
  alt: string;
  /** Which side the caption sits on; the scrim darkens that side. */
  caption?: ReactNode;
  className?: string;
  focus?: string;
}> = ({ src, alt, caption, className, focus = "center" }) => (
  <figure
    className={cn(
      "relative aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-black ring-1 ring-white/[0.06] sm:aspect-[21/9]",
      className,
    )}
  >
    <img
      loading="lazy"
      decoding="async"
      src={src}
      alt={alt}
      className="kenburns absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: focus }}
    />
    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/25 to-transparent" />
    <Grain />
    {caption && <figcaption className="absolute inset-x-0 bottom-0 p-7 md:p-10">{caption}</figcaption>}
  </figure>
);
