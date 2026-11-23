import { useEffect, useState } from 'react';

const CELL = 72; // must match the body::before grid in index.css

/** Lit grid areas: [x, y] as a fraction of the viewport, radius in px. */
const AREAS: [number, number, number][] = [
  [0.82, 0.22, 340],
  [0.12, 0.78, 280],
];

/** Lit nodes: [x, y] as a fraction of the viewport, breathing delay (s). */
const NODES: [number, number, number][] = [
  [0.78, 0.16, 0],
  [0.9, 0.34, 3.2],
  [0.18, 0.7, 1.6],
  [0.06, 0.86, 5],
  [0.5, 0.08, 2.4],
];

/** Snap a viewport fraction to the nearest grid line so a node sits exactly on an intersection. */
const snap = (f: number, size: number) => Math.max(1, Math.round((f * size) / CELL)) * CELL;

/**
 * Quiet "powered" spots in the page grid: two areas where the hairlines glow
 * faint electric blue, plus a handful of intersections holding a soft light.
 * Nodes breathe very slowly (opacity only); nothing blinks. Fixed behind content.
 */
export function GridGlow() {
  const [vp, setVp] = useState(() => ({ w: window.innerWidth, h: window.innerHeight }));

  useEffect(() => {
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setVp({ w: window.innerWidth, h: window.innerHeight }));
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const mobile = vp.w < 768;
  const nodes = mobile ? NODES.slice(0, 3) : NODES;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {AREAS.map(([fx, fy, r], i) => {
        const x = snap(fx, vp.w);
        const y = snap(fy, vp.h);
        const mask = `radial-gradient(${r}px circle at ${x}px ${y}px, black, transparent 72%)`;
        return (
          <div
            key={i}
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgb(36 87 255 / 0.16) 1px, transparent 1px), linear-gradient(to bottom, rgb(36 87 255 / 0.16) 1px, transparent 1px)',
              backgroundSize: `${CELL}px ${CELL}px`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
      {nodes.map(([fx, fy, delay], i) => (
        <span
          key={i}
          className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 animate-node-breathe rounded-full bg-royal shadow-[0_0_0_3px_rgb(117_167_255/0.14),0_0_14px_2px_rgb(36_87_255/0.28)]"
          style={{ left: snap(fx, vp.w) + 0.5, top: snap(fy, vp.h) + 0.5, animationDelay: `${-delay}s` }}
        />
      ))}
    </div>
  );
}
