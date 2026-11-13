import { type FC, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

/**
 * Bioluminescent data orb — a slowly rotating Fibonacci sphere of particles.
 * Near particles glow pale aqua, far ones sink into canvas teal, and the
 * upper-right rim warms to brand ember, the orange at the heart of the logo.
 *
 * Plain 2D canvas: ~1.5k arcs per frame, paused when off-screen, and drawn
 * once (static) when the user prefers reduced motion.
 */

type Point = { x: number; y: number; z: number; seed: number };

const TEAL = [0, 130, 124];
const AQUA = [203, 255, 252];
const EMBER = [255, 138, 51];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function buildSphere(count: number): Point[] {
  const pts: Point[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r, seed: Math.random() * Math.PI * 2 });
  }
  return pts;
}

export const ParticleSphere: FC<{ className?: string; density?: number }> = ({
  className,
  density = 1500,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const points = buildSphere(density);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tilt = 0.38;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const rot = t * 0.08;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);
      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.42;

      ctx.clearRect(0, 0, width, height);

      for (const p of points) {
        // Breathing surface: each particle drifts a little off the shell.
        const wobble = 1 + 0.035 * Math.sin(p.seed + t * 0.9);
        // Rotate around Y, then tilt around X.
        const x1 = p.x * cosR + p.z * sinR;
        const z1 = -p.x * sinR + p.z * cosR;
        const y2 = p.y * cosT - z1 * sinT;
        const z2 = p.y * sinT + z1 * cosT;

        const depth = (z2 + 1) / 2; // 0 = far, 1 = near
        const persp = 0.82 + depth * 0.28;
        const sx = cx + x1 * R * wobble * persp;
        const sy = cy + y2 * R * wobble * persp;

        // Teal → aqua by depth, then ember on the upper-right rim.
        const rim = Math.max(0, x1 * 0.8 - y2 * 0.6);
        const warm = Math.min(1, rim * rim * 1.8) * (0.5 + depth * 0.5);
        const r = lerp(lerp(TEAL[0], AQUA[0], depth), EMBER[0], warm);
        const g = lerp(lerp(TEAL[1], AQUA[1], depth), EMBER[1], warm);
        const b = lerp(lerp(TEAL[2], AQUA[2], depth), EMBER[2], warm);
        const alpha = 0.12 + depth * 0.78;
        const size = 0.45 + depth * 1.35;

        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now: number) => {
      draw(now);
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    resize();
    draw(performance.now());
    if (!reduceMotion) raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      const wasVisible = visible;
      visible = entry.isIntersecting;
      if (visible && !wasVisible && !reduceMotion) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [density]);

  return <canvas ref={canvasRef} aria-hidden className={cn("block h-full w-full", className)} />;
};

export default ParticleSphere;
