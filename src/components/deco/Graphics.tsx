import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { ScrambleText } from '../ui/ScrambleText';

/**
 * 2D "cyber editorial" graphics: thin SVG line work in ink/gray with sparing
 * electric-blue accents. Reusable, decorative only (wrap them in <Deco>).
 *
 * Motion: strokes draw themselves in when scrolled into view (Motion pathLength);
 * after that each graphic keeps at most one or two slow CSS loops
 * (rotation, light moving along a path, node pulse, radar sweep), transform /
 * opacity / dash-offset only. Reduced motion: drawn and static.
 */

const INK = '#111216';
const ROYAL = '#2457ff';
const SIGNAL = '#75a7ff';

/** Props that make an SVG shape draw itself in once it scrolls into view. */
function useDraw() {
  const reduce = useReducedMotion();
  return (delay = 0, duration = 1.6) =>
    ({
      initial: reduce ? false : { pathLength: 0, opacity: 0 },
      whileInView: { pathLength: 1, opacity: 1 },
      viewport: { once: true, margin: '-5% 0px' },
      transition: {
        pathLength: { duration, delay, ease: [0.65, 0, 0.35, 1] },
        opacity: { duration: 0.3, delay },
      },
    }) as const;
}

/** Fade-in for small fills/dots that shouldn't "draw". */
function useAppear() {
  const reduce = useReducedMotion();
  return (delay = 0) =>
    ({
      initial: reduce ? false : { opacity: 0 },
      whileInView: { opacity: 1 },
      viewport: { once: true, margin: '-5% 0px' },
      transition: { duration: 0.8, delay },
    }) as const;
}

const spin = (seconds: number, reverse = false, origin = '50px 50px'): CSSProperties => ({
  transformOrigin: origin,
  animationDuration: `${seconds}s`,
  animationDirection: reverse ? 'reverse' : 'normal',
});

/* ── Wireframe sphere: meridians turning, latitudes fixed ─────────────────── */
export function WireSphere({ s = 120 }: { s?: number }) {
  const draw = useDraw();
  const appear = useAppear();
  const R = 44;
  const tilt = 0.26; // seen slightly from above
  const lats = [-50, -25, 0, 25, 50];
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} className="overflow-visible">
      <motion.circle cx="50" cy="50" r={R} fill="none" stroke={INK} strokeOpacity="0.5" strokeWidth="0.7" {...draw(0)} />
      {lats.map((lat, i) => {
        const rad = (lat * Math.PI) / 180;
        const rx = R * Math.cos(rad);
        return (
          <motion.ellipse
            key={lat}
            cx="50"
            cy={50 - R * Math.sin(rad) * 0.97}
            rx={rx}
            ry={rx * tilt}
            fill="none"
            stroke={lat === 0 ? ROYAL : INK}
            strokeOpacity={lat === 0 ? 0.7 : 0.22}
            strokeWidth="0.6"
            {...draw(0.15 + i * 0.08)}
          />
        );
      })}
      {/* meridians: an ellipse squashing 1 → 0 → 1 reads as a line of longitude turning round */}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={i}
          cx="50"
          cy="50"
          rx={R}
          ry={R}
          fill="none"
          stroke={i === 0 ? ROYAL : INK}
          strokeOpacity={i === 0 ? 0.55 : 0.2}
          strokeWidth="0.6"
          className="animate-gfx-meridian"
          style={{ transformOrigin: '50px 50px', animationDelay: `${-i * 2}s` }}
        />
      ))}
      <motion.g {...appear(0.9)}>
        <circle cx={50 + R} cy="50" r="1.6" fill={ROYAL} />
        <line x1={50 + R + 3} y1="50" x2={50 + R + 12} y2="50" stroke={INK} strokeOpacity="0.4" strokeWidth="0.5" />
      </motion.g>
    </svg>
  );
}

/* ── Glitch geometry: square + triangle with displaced slices ─────────────── */
export function GlitchGeometry({ s = 88 }: { s?: number }) {
  const draw = useDraw();
  const shape = (
    <>
      <rect x="18" y="24" width="46" height="46" fill="none" strokeWidth="0.8" />
      <path d="M44 16 L82 80 L6 80 Z" fill="none" strokeWidth="0.8" />
    </>
  );
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} className="overflow-visible">
      <defs>
        <clipPath id="gl-a">
          <rect x="0" y="30" width="100" height="9" />
          <rect x="0" y="62" width="100" height="5" />
        </clipPath>
        <clipPath id="gl-b">
          <rect x="0" y="46" width="100" height="6" />
        </clipPath>
      </defs>
      <motion.rect x="18" y="24" width="46" height="46" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.8" {...draw(0)} />
      <motion.path d="M44 16 L82 80 L6 80 Z" fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.8" {...draw(0.2)} />
      {/* displaced slices: settle near 0, jump briefly every few seconds */}
      <g clipPath="url(#gl-a)" stroke={ROYAL} strokeOpacity="0.8" className="animate-gfx-glitch-a">
        {shape}
      </g>
      <g clipPath="url(#gl-b)" stroke={SIGNAL} className="animate-gfx-glitch-b">
        {shape}
      </g>
      <rect x="70" y="30" width="14" height="1.6" fill={ROYAL} className="animate-gfx-glitch-a" />
      <rect x="2" y="58" width="9" height="1.2" fill={INK} fillOpacity="0.5" className="animate-gfx-glitch-b" />
    </svg>
  );
}

/* ── Orbital rings around a core ──────────────────────────────────────────── */
export function OrbitalRings({ s = 130 }: { s?: number }) {
  const draw = useDraw();
  const appear = useAppear();
  const rings = [
    { rot: -24, rx: 46, ry: 15, dur: 14, blue: true },
    { rot: 34, rx: 40, ry: 12, dur: 12, blue: false },
    { rot: 82, rx: 30, ry: 10, dur: 15, blue: false },
  ];
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} className="overflow-visible">
      {rings.map((r, i) => (
        <g key={i} className="animate-gfx-spin" style={spin(r.dur, i % 2 === 1)}>
          <g transform={`rotate(${r.rot} 50 50)`}>
            <motion.ellipse
              cx="50"
              cy="50"
              rx={r.rx}
              ry={r.ry}
              fill="none"
              stroke={r.blue ? ROYAL : INK}
              strokeOpacity={r.blue ? 0.6 : 0.25}
              strokeWidth="0.6"
              {...draw(i * 0.2)}
            />
            <motion.circle cx={50 + r.rx} cy="50" r={r.blue ? 1.8 : 1.3} fill={r.blue ? ROYAL : INK} fillOpacity={r.blue ? 1 : 0.55} {...appear(0.9 + i * 0.15)} />
          </g>
        </g>
      ))}
      <motion.g {...appear(0.6)}>
        <circle cx="50" cy="50" r="7" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="2.6" fill={ROYAL} className="animate-gfx-pulse" style={{ transformOrigin: '50px 50px' }} />
      </motion.g>
    </svg>
  );
}

/* ── Technical coordinates: mono read-out with a ruler ────────────────────── */
export function TechCoords({ lines, align = 'left' }: { lines: [string, string][]; align?: 'left' | 'right' }) {
  const draw = useDraw();
  return (
    <div className={`mono flex flex-col gap-1.5 text-[0.625rem] tracking-[0.14em] text-muted ${align === 'right' ? 'items-end text-right' : ''}`}>
      <svg viewBox="0 0 120 12" width="120" height="12" className="mb-1 overflow-visible">
        <motion.line x1="0" y1="6" x2="120" y2="6" stroke={INK} strokeOpacity="0.35" strokeWidth="0.6" {...draw(0, 1.2)} />
        {Array.from({ length: 13 }, (_, i) => (
          <motion.line
            key={i}
            x1={i * 10}
            y1={i % 4 === 0 ? 1 : 4}
            x2={i * 10}
            y2="6"
            stroke={i === 4 ? ROYAL : INK}
            strokeOpacity={i === 4 ? 1 : 0.35}
            strokeWidth="0.6"
            {...draw(0.3 + i * 0.03, 0.4)}
          />
        ))}
        <circle cx="40" cy="6" r="1.6" fill={ROYAL} />
      </svg>
      {lines.map(([k, v], i) => (
        <p key={k} className="flex gap-3 whitespace-nowrap">
          <span className="text-royal-ink">{k}</span>
          <ScrambleText text={v} trigger="view" delay={250 + i * 140} duration={700} pendingClassName="text-royal/50" />
        </p>
      ))}
    </div>
  );
}

/* ── Circuit pattern: traces + vias, light travelling along three of them ─── */
export function CircuitPattern({ w = 200 }: { w?: number }) {
  const draw = useDraw();
  const appear = useAppear();
  const traces = [
    'M2 14 H52 L64 26 H118',
    'M2 44 H34 L46 32 H86 L98 44 H150 L162 32 H176',
    'M2 74 H70 L82 62 H128 L140 74 H176',
    'M118 26 H150',
    'M86 32 V8 H140',
  ];
  const lit = [0, 1, 2];
  const vias: [number, number][] = [
    [118, 26],
    [150, 26],
    [176, 32],
    [176, 74],
    [140, 8],
    [52, 14],
    [70, 74],
  ];
  return (
    <svg viewBox="0 0 200 90" width={w} height={(w * 90) / 200} className="overflow-visible">
      {traces.map((d, i) => (
        <motion.path key={i} d={d} fill="none" stroke={INK} strokeOpacity="0.22" strokeWidth="0.8" {...draw(i * 0.12)} />
      ))}
      {/* moving light */}
      {lit.map((k, i) => (
        <path
          key={k}
          d={traces[k]}
          fill="none"
          stroke={ROYAL}
          strokeWidth="1.3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="10 100"
          className="animate-gfx-light"
          style={{ animationDelay: `${-i * 1.4}s`, animationDuration: `${4 + i * 0.7}s` }}
        />
      ))}
      <motion.g {...appear(1)}>
        {vias.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.4" fill="#ffffff" stroke={INK} strokeOpacity="0.45" strokeWidth="0.7" />
        ))}
        {/* chip pad the traces run into */}
        <rect x="178" y="22" width="20" height="60" rx="1.5" fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="0.8" />
        {[30, 42, 54, 66].map((y) => (
          <line key={y} x1="176" y1={y} x2="180" y2={y} stroke={INK} strokeOpacity="0.4" strokeWidth="0.8" />
        ))}
        <rect x="183" y="44" width="10" height="16" fill={ROYAL} fillOpacity="0.12" stroke={ROYAL} strokeOpacity="0.6" strokeWidth="0.6" />
      </motion.g>
    </svg>
  );
}

/* ── Geometric cube: isometric line cube with a hidden inner cube ─────────── */
export function GeoCube({ s = 84 }: { s?: number }) {
  const draw = useDraw();
  const iso = (cx: number, cy: number, r: number) => {
    const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)] as const;
    const [t, tr, br, b, bl, tl] = [p(-90), p(-30), p(30), p(90), p(150), p(210)];
    const c = [cx, cy] as const;
    return { t, tr, br, b, bl, tl, c };
  };
  const o = iso(50, 50, 40);
  const n = iso(50, 50, 18);
  const P = (...pts: (readonly [number, number])[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} className="overflow-visible">
      {/* top face lit */}
      <motion.path d={`${P(o.t, o.tr, o.c, o.tl)} Z`} fill={ROYAL} className="animate-gfx-face" {...useAppear()(1.1)} />
      <motion.path d={`${P(o.t, o.tr, o.br, o.b, o.bl, o.tl)} Z`} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.8" {...draw(0)} />
      <motion.path d={`${P(o.tl, o.c, o.tr)} M${o.c[0]} ${o.c[1]} L${o.b[0]} ${o.b[1]}`} fill="none" stroke={INK} strokeOpacity="0.55" strokeWidth="0.8" {...draw(0.4)} />
      {/* inner cube, hidden edges dashed */}
      <motion.path
        d={`${P(n.t, n.tr, n.br, n.b, n.bl, n.tl)} Z ${P(n.tl, n.c, n.tr)} M${n.c[0]} ${n.c[1]} L${n.b[0]} ${n.b[1]}`}
        fill="none"
        stroke={ROYAL}
        strokeOpacity="0.65"
        strokeWidth="0.7"
        {...draw(0.8)}
      />
      <line x1={o.c[0]} y1={o.c[1]} x2={n.c[0]} y2={n.c[1]} stroke={INK} strokeOpacity="0.3" strokeDasharray="1.5 2" strokeWidth="0.6" />
      {/* corner ticks */}
      {[o.t, o.br, o.bl].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.4" fill={i === 0 ? ROYAL : INK} fillOpacity={i === 0 ? 1 : 0.5} />
      ))}
    </svg>
  );
}

/* ── Data network nodes: graph with pulsing nodes and packets ─────────────── */
export function NetworkNodes({ w = 160 }: { w?: number }) {
  const draw = useDraw();
  const appear = useAppear();
  const N: [number, number, number][] = [
    // x, y, kind (2 = hub)
    [10, 40, 0],
    [34, 14, 1],
    [40, 52, 2],
    [62, 26, 1],
    [70, 62, 0],
    [92, 40, 2],
    [116, 16, 0],
    [120, 58, 1],
    [146, 36, 0],
  ];
  const E: [number, number][] = [
    [0, 1], [0, 2], [1, 2], [1, 3], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6], [5, 7], [6, 8], [7, 8], [3, 6],
  ];
  const packets = [1, 6, 9];
  return (
    <svg viewBox="0 0 156 72" width={w} height={(w * 72) / 156} className="overflow-visible">
      {E.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={N[a][0]}
          y1={N[a][1]}
          x2={N[b][0]}
          y2={N[b][1]}
          stroke={INK}
          strokeOpacity="0.22"
          strokeWidth="0.6"
          {...draw(i * 0.06, 0.9)}
        />
      ))}
      {packets.map((k, i) => {
        const [a, b] = E[k];
        return (
          <line
            key={k}
            x1={N[a][0]}
            y1={N[a][1]}
            x2={N[b][0]}
            y2={N[b][1]}
            stroke={ROYAL}
            strokeWidth="1.3"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="14 100"
            className="animate-gfx-light"
            style={{ animationDelay: `${-i * 1.2}s`, animationDuration: '3.6s' }}
          />
        );
      })}
      <motion.g {...appear(0.8)}>
        {N.map(([x, y, k], i) => (
          <g key={i}>
            {k === 2 && (
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="none"
                stroke={ROYAL}
                strokeOpacity="0.5"
                strokeWidth="0.6"
                className="animate-gfx-ping"
                style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${-i * 0.7}s` }}
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={k === 2 ? 3 : 2.2}
              fill={k === 2 ? ROYAL : '#ffffff'}
              stroke={k === 2 ? ROYAL : INK}
              strokeOpacity={k === 2 ? 1 : 0.5}
              strokeWidth="0.7"
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* ── HUD radar: rings, ticks, a slow sweep and a few blips ───────────────── */
export function HudRadar({ s = 104 }: { s?: number }) {
  const draw = useDraw();
  const appear = useAppear();
  return (
    <svg viewBox="0 0 100 100" width={s} height={s} className="overflow-visible">
      <defs>
        <linearGradient id="radar-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={ROYAL} stopOpacity="0" />
          <stop offset="1" stopColor={ROYAL} stopOpacity="0.22" />
        </linearGradient>
      </defs>
      {[46, 32, 18].map((r, i) => (
        <motion.circle key={r} cx="50" cy="50" r={r} fill="none" stroke={INK} strokeOpacity={i === 0 ? 0.45 : 0.2} strokeWidth="0.6" {...draw(i * 0.15)} />
      ))}
      <motion.path d="M50 2 V98 M2 50 H98" stroke={INK} strokeOpacity="0.15" strokeWidth="0.5" {...draw(0.3)} />
      <motion.g {...appear(0.6)}>
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i * 10 * Math.PI) / 180;
          const long = i % 9 === 0;
          const r1 = long ? 40 : 43;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * r1}
              y1={50 + Math.sin(a) * r1}
              x2={50 + Math.cos(a) * 46}
              y2={50 + Math.sin(a) * 46}
              stroke={long ? ROYAL : INK}
              strokeOpacity={long ? 0.8 : 0.3}
              strokeWidth="0.6"
            />
          );
        })}
      </motion.g>
      {/* sweep */}
      <g className="animate-gfx-spin" style={spin(7)}>
        <path d="M50 50 L96 50 A46 46 0 0 0 85.2 20.4 Z" fill="url(#radar-sweep)" />
        <line x1="50" y1="50" x2="96" y2="50" stroke={ROYAL} strokeOpacity="0.75" strokeWidth="0.8" />
      </g>
      {/* blips */}
      {[
        [66, 34, 0],
        [32, 62, 2.3],
        [58, 74, 4.6],
      ].map(([x, y, d], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill={ROYAL} className="animate-gfx-blip" style={{ animationDelay: `${-d}s` }} />
      ))}
      <circle cx="50" cy="50" r="1.5" fill={INK} fillOpacity="0.7" />
    </svg>
  );
}
