import { useEffect, useMemo, useRef } from 'react';
import type { RefObject } from 'react';

const W = 1440;
const H = 320;

/**
 * Detail + frame budget. Phones/tablets get fewer lines and points and ~30fps;
 * desktops ~40fps. The motion is slow, so the lower rate is invisible but the
 * per-frame work (rebuilding every path) drops a lot.
 */
const COARSE = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const LINES = COARSE ? 18 : 28;
const STEP = COARSE ? 36 : 24;
const FRAME_MS = COARSE ? 1000 / 30 : 1000 / 40;
const ACCENT = Math.round(LINES * 0.62);

/** Pointer position shared with the parent, normalised 0..1 over the viewport. */
export type PointerRef = RefObject<{ x: number; y: number; active: boolean }>;

/** y of line `i` at horizontal position `x` (0..W), for phase `p`, with an optional pointer bulge. */
function waveY(i: number, x: number, p: number, px: number, py: number, pull: number) {
  const t = i / (LINES - 1);
  const a = (x / W) * Math.PI * 2;
  let y =
    H * 0.58 +
    Math.sin(a + t * 1.9 + p) * (26 + 92 * t) +
    Math.sin(a * 2 + t * 3.4 + 1.2 - p * 1.6) * (14 + 10 * (1 - t));
  if (pull > 0) {
    // lines swell towards the pointer, strongest right under it
    const d = x / W - px;
    y += Math.exp(-(d * d) / 0.012) * (py - 0.5) * 120 * pull * (0.4 + t);
  }
  return y;
}

function pathFor(i: number, p: number, px: number, py: number, pull: number) {
  let d = '';
  for (let x = 0; x <= W; x += STEP) d += `${x === 0 ? 'M' : 'L'}${x} ${waveY(i, x, p, px, py, pull).toFixed(1)}`;
  return d;
}

/**
 * A ribbon of thin flowing lines. Animated in JS so it can lean towards the
 * pointer; a small "data packet" travels along the blue line. Static when
 * `animate` is false. Purely decorative.
 */
export function WaveLines({
  className = '',
  animate = true,
  pointer,
}: {
  className?: string;
  animate?: boolean;
  pointer?: PointerRef;
}) {
  const initial = useMemo(() => Array.from({ length: LINES }, (_, i) => pathFor(i, 0, 0.5, 0.5, 0)), []);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const packet = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let pull = 0;
    let px = 0.5;
    let py = 0.5;
    const start = performance.now();
    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < FRAME_MS) return;
      last = now;
      const t = (now - start) / 1000;
      const ptr = pointer?.current;
      // ease pointer influence in/out so the lines never snap
      pull += ((ptr?.active ? 1 : 0) - pull) * 0.06;
      if (ptr) {
        px += (ptr.x - px) * 0.08;
        py += (ptr.y - py) * 0.08;
      }
      const p = t * 0.16;
      for (let i = 0; i < LINES; i++) paths.current[i]?.setAttribute('d', pathFor(i, p, px, py, pull));
      const x = ((t * 0.07) % 1) * W;
      const y = waveY(ACCENT, x, p, px, py, pull);
      if (packet.current) {
        packet.current.style.left = `${(x / W) * 100}%`;
        packet.current.style.top = `${(y / H) * 100}%`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, pointer]);

  return (
    <div className={`pointer-events-none relative ${className}`} aria-hidden>
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="size-full">
      {initial.map((d, i) => (
        <path
          key={i}
          ref={(el) => {
            paths.current[i] = el;
          }}
          d={d}
          fill="none"
          stroke={i === ACCENT ? 'var(--color-royal)' : 'var(--color-ink)'}
          strokeOpacity={i === ACCENT ? 0.6 : 0.09}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
    {animate && (
      <span
        ref={packet}
        className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal shadow-[0_0_0_5px_rgb(36_87_255/0.14)]"
      />
    )}
    </div>
  );
}
