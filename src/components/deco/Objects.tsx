import type { CSSProperties } from 'react';

/**
 * Small 3D accent objects, built from CSS 3D transforms + SVG only (no 3D library).
 * Materials live in index.css (.deco-*). Each object moves in at most one or two
 * slow ways (10–15s rotations, gentle pulses) so they read as accents, not features.
 */

const size = (s: number) => ({ '--s': `${s}px` }) as CSSProperties;

/* ── Hero: holographic orb with three gyroscope rings ─────────────────────── */
export function HoloOrb({ s = 120 }: { s?: number }) {
  return (
    <div className="relative size-[var(--s)] [perspective:640px]" style={size(s)}>
      <span className="absolute -inset-[35%] animate-deco-pulse rounded-full bg-[radial-gradient(circle,rgb(36_87_255/0.2),transparent_62%)]" />
      <span className="deco-orb absolute inset-[14%] rounded-full" />
      {/* latitude / longitude wireframe on the glass */}
      <svg viewBox="0 0 100 100" className="absolute inset-[14%] size-[72%] opacity-60">
        <g fill="none" stroke="white" strokeWidth="0.7" strokeOpacity="0.55">
          <ellipse cx="50" cy="50" rx="49" ry="16" />
          <ellipse cx="50" cy="50" rx="49" ry="34" strokeOpacity="0.3" />
          <ellipse cx="50" cy="50" rx="18" ry="49" />
          <ellipse cx="50" cy="50" rx="36" ry="49" strokeOpacity="0.3" />
        </g>
      </svg>
      <div className="absolute inset-0 animate-deco-spin-y [transform-style:preserve-3d]" style={{ animationDuration: '14s' }}>
        {[0, 60, 120].map((r, i) => (
          <span
            key={r}
            className={`absolute inset-0 rounded-full border ${i === 0 ? 'border-signal/70' : 'border-royal/35'}`}
            style={{ transform: `rotateY(${r}deg) rotateX(74deg)` }}
          >
            {i === 0 && <span className="absolute top-1/2 -left-[3px] size-[6px] -translate-y-1/2 rounded-full bg-royal shadow-[0_0_8px_rgb(36_87_255/0.6)]" />}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── About: metallic glass cube with a wireframe core ─────────────────────── */
function CubeFaces({ s, cls }: { s: number; cls: string }) {
  const h = s / 2;
  const faces = [
    `rotateY(0deg) translateZ(${h}px)`,
    `rotateY(90deg) translateZ(${h}px)`,
    `rotateY(180deg) translateZ(${h}px)`,
    `rotateY(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
  ];
  return (
    <>
      {faces.map((t) => (
        <span key={t} className={`absolute inset-0 ${cls}`} style={{ transform: t }} />
      ))}
    </>
  );
}

export function GlassCube({ s = 104 }: { s?: number }) {
  const core = Math.round(s * 0.42);
  return (
    <div className="relative size-[var(--s)] [perspective:720px]" style={size(s)}>
      <span className="absolute -inset-[30%] animate-deco-pulse rounded-full bg-[radial-gradient(circle,rgb(117_167_255/0.22),transparent_62%)]" />
      <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(-24deg)_rotateZ(4deg)]">
        <div className="absolute inset-0 animate-deco-spin-y [transform-style:preserve-3d]" style={{ animationDuration: '15s' }}>
          <CubeFaces s={s} cls="deco-glass" />
          <div
            className="absolute [transform-style:preserve-3d]"
            style={{ width: core, height: core, left: (s - core) / 2, top: (s - core) / 2 }}
          >
            <CubeFaces s={core} cls="border border-royal/55 bg-royal/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Web Development: isometric microchip with a pulsing die ─────────────── */
export function Microchip({ s = 96 }: { s?: number }) {
  const pins = [0.2, 0.36, 0.52, 0.68, 0.84];
  return (
    <div className="relative size-[var(--s)] [perspective:800px]" style={size(s)}>
      {/* ground shadow */}
      <span className="absolute inset-x-[12%] -bottom-[18%] h-[22%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(17_18_22/0.18),transparent)]" />
      <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(56deg)_rotateZ(-40deg)]">
        {/* thickness */}
        {[4, 3, 2, 1].map((z) => (
          <span key={z} className="absolute inset-0 rounded-[10%] bg-[#0b0d13]" style={{ transform: `translateZ(${-z * 1.6}px)` }} />
        ))}
        {/* pins */}
        <svg viewBox="-20 -20 140 140" className="absolute top-[-20%] left-[-20%] size-[140%] overflow-visible">
          <g stroke="url(#chip-pin)" strokeWidth="3.2" strokeLinecap="round">
            {pins.map((p) => (
              <g key={p}>
                <line x1={p * 100} y1="-2" x2={p * 100} y2="-13" />
                <line x1={p * 100} y1="102" x2={p * 100} y2="113" />
                <line x1="-2" y1={p * 100} x2="-13" y2={p * 100} />
                <line x1="102" y1={p * 100} x2="113" y2={p * 100} />
              </g>
            ))}
          </g>
          <defs>
            <linearGradient id="chip-pin" gradientUnits="userSpaceOnUse" x1="-20" y1="-20" x2="120" y2="120">
              <stop offset="0" stopColor="#f2f5fb" />
              <stop offset="0.5" stopColor="#8a94a8" />
              <stop offset="1" stopColor="#dfe5ef" />
            </linearGradient>
          </defs>
        </svg>
        {/* body */}
        <span className="deco-chip absolute inset-0 rounded-[10%]" />
        {/* traces: one data pulse travelling to the die */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full">
          <g fill="none" stroke="#75a7ff" strokeOpacity="0.35" strokeWidth="1">
            <path d="M8 20 H24 V34" />
            <path d="M92 80 H76 V66" />
            <path d="M80 8 V24 H66" />
            <path d="M20 92 V76 H34" />
          </g>
          <path d="M8 20 H24 V34" fill="none" stroke="#75a7ff" strokeWidth="1.6" className="animate-deco-dash" strokeDasharray="6 60" />
        </svg>
        {/* die */}
        <span className="absolute inset-[30%] rounded-[12%] bg-[linear-gradient(135deg,#75a7ff,#2457ff_55%,#1a3fd0)] [transform:translateZ(3px)]">
          <span className="absolute inset-[18%] rounded-[10%] border border-white/45" />
          <span className="absolute inset-0 animate-deco-pulse rounded-[inherit] bg-[radial-gradient(circle,rgb(255_255_255/0.55),transparent_70%)]" />
        </span>
      </div>
    </div>
  );
}

/* ── Web Development: extruded "</>" that turns slowly ───────────────────── */
export function CodeGlyph({ s = 56 }: { s?: number }) {
  const layers = 7;
  return (
    <div className="relative [perspective:600px]" style={{ fontSize: s }}>
      <div className="animate-deco-swing [transform-style:preserve-3d]" style={{ animationDuration: '12s' }}>
        {Array.from({ length: layers }, (_, i) => (
          <span
            key={i}
            className="absolute inset-0 font-display leading-none font-bold tracking-[-0.06em] text-royal-deep"
            style={{ transform: `translateZ(${-(i + 1) * 1.3}px)`, opacity: 1 - i * 0.06 }}
          >
            &lt;/&gt;
          </span>
        ))}
        <span className="deco-chrome-text relative block font-display leading-none font-bold tracking-[-0.06em]">&lt;/&gt;</span>
      </div>
    </div>
  );
}

/* ── Data Engineering: holographic database cylinder ─────────────────────── */
export function DataCylinder({ s = 78 }: { s?: number }) {
  const disk = (y: number, i: number) => (
    <g key={y}>
      <path d={`M4 ${y} v18 a46 13 0 0 0 92 0 v-18`} fill="url(#cyl-side)" stroke="#75a7ff" strokeOpacity="0.7" strokeWidth="1" />
      <ellipse cx="50" cy={y} rx="46" ry="13" fill="url(#cyl-top)" stroke="#75a7ff" strokeOpacity="0.85" strokeWidth="1" />
      <circle cx="80" cy={y + 22} r="2.2" fill="#2457ff" className="animate-deco-blink" style={{ animationDelay: `${i * -0.9}s` }} />
    </g>
  );
  return (
    <div className="relative" style={{ width: s, height: s * 1.25 }}>
      <span className="absolute -inset-[30%] animate-deco-pulse rounded-full bg-[radial-gradient(circle,rgb(36_87_255/0.16),transparent_62%)]" />
      <svg viewBox="0 0 100 125" className="relative size-full overflow-visible">
        <defs>
          <linearGradient id="cyl-side" x1="0" x2="1">
            <stop offset="0" stopColor="#2457ff" stopOpacity="0.3" />
            <stop offset="0.45" stopColor="#75a7ff" stopOpacity="0.12" />
            <stop offset="1" stopColor="#2457ff" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="cyl-top" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#75a7ff" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {[82, 52, 22].map(disk)}
        {/* scan ring sweeping up the stack */}
        <ellipse cx="50" cy="104" rx="48" ry="14" fill="none" stroke="#2457ff" strokeWidth="1.4" className="animate-deco-scan" />
      </svg>
    </div>
  );
}

/* ── Data Engineering: small neural network with signals passing through ─── */
export function NeuralNet({ w = 168 }: { w?: number }) {
  const H = 62; // viewBox height (width 100) -> same aspect as the box, so nodes stay round
  const L = [
    [14, 31, 48],
    [7, 23, 39, 55],
    [20, 42],
  ];
  const xs = [8, 50, 92];
  const edges: [number, number, number, number][] = [];
  for (let c = 0; c < 2; c++) for (const a of L[c]) for (const b of L[c + 1]) edges.push([xs[c], a, xs[c + 1], b]);
  const live = [1, 6, 12, 17];
  return (
    <div className="[perspective:700px]" style={{ width: w, height: (w * H) / 100 }}>
      <div className="size-full animate-deco-sway" style={{ animationDuration: '13s' }}>
        <svg viewBox={`0 0 100 ${H}`} className="size-full overflow-visible">
          <g stroke="#2457ff" strokeOpacity="0.22" strokeWidth="0.45">
            {edges.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
          {live.map((k, i) => {
            const [x1, y1, x2, y2] = edges[k];
            return (
              <line
                key={k}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#2457ff"
                strokeWidth="1.1"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="14 100"
                className="animate-deco-signal"
                style={{ animationDelay: `${i * -0.85}s` }}
              />
            );
          })}
          {L.flatMap((col, c) =>
            col.map((y) => (
              <g key={`${c}-${y}`}>
                <circle cx={xs[c]} cy={y} r="3.4" fill="#ffffff" stroke="#2457ff" strokeOpacity="0.55" strokeWidth="0.8" />
                <circle cx={xs[c]} cy={y} r="1.4" fill="#2457ff" />
              </g>
            )),
          )}
        </svg>
      </div>
    </div>
  );
}

/* ── Projects: small chrome cyber ring spinning in perspective ────────────── */
export function CyberRing({ s = 76 }: { s?: number }) {
  return (
    <div className="relative size-[var(--s)] [perspective:520px]" style={size(s)}>
      <span className="absolute -inset-[25%] animate-deco-pulse rounded-full bg-[radial-gradient(circle,rgb(36_87_255/0.16),transparent_62%)]" />
      <div className="absolute inset-0 [transform-style:preserve-3d] [transform:rotateX(62deg)_rotateY(-14deg)]">
        <div className="absolute inset-0 animate-deco-spin-z [transform-style:preserve-3d]" style={{ animationDuration: '12s' }}>
          {[3, 2, 1].map((z) => (
            <span key={z} className="deco-ring-edge absolute inset-0 rounded-full" style={{ transform: `translateZ(${-z * 1.4}px)` }} />
          ))}
          <span className="deco-ring absolute inset-0 rounded-full" />
          <svg viewBox="0 0 100 100" className="absolute inset-[16%] size-[68%]">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#2457ff" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="3 6" />
          </svg>
          {[0, 120, 240].map((a) => (
            <span
              key={a}
              className="absolute top-1/2 left-1/2 size-[5px] rounded-full bg-signal shadow-[0_0_6px_rgb(117_167_255/0.8)]"
              style={{ transform: `translate(-50%,-50%) rotate(${a}deg) translateX(${s / 2 - 4}px)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Contact: holographic cloud with data rising into it ─────────────────── */
export function HoloCloud({ w = 170 }: { w?: number }) {
  const cloud =
    'M30 72 C14 72 6 62 8 52 C10 42 20 37 29 39 C31 25 44 16 58 18 C70 20 78 28 80 38 C92 37 100 46 98 56 C96 66 88 72 78 72 Z';
  return (
    <div className="relative" style={{ width: w, height: w * 0.8 }}>
      <span className="absolute -inset-[20%] animate-deco-pulse rounded-full bg-[radial-gradient(circle,rgb(36_87_255/0.26),transparent_62%)]" />
      <svg viewBox="0 0 106 100" className="relative size-full overflow-visible">
        <defs>
          <linearGradient id="cloud-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#75a7ff" stopOpacity="0.38" />
            <stop offset="1" stopColor="#2457ff" stopOpacity="0.06" />
          </linearGradient>
          <pattern id="cloud-scan" width="4" height="3.2" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0.5" x2="4" y2="0.5" stroke="#75a7ff" strokeOpacity="0.28" strokeWidth="0.5" />
          </pattern>
          <clipPath id="cloud-clip">
            <path d={cloud} />
          </clipPath>
        </defs>
        {/* back copy offset for depth */}
        <path d={cloud} transform="translate(3 3)" fill="none" stroke="#2457ff" strokeOpacity="0.35" strokeWidth="0.8" />
        <path d={cloud} fill="url(#cloud-fill)" />
        <rect x="0" y="0" width="106" height="100" fill="url(#cloud-scan)" clipPath="url(#cloud-clip)" />
        <path d={cloud} fill="none" stroke="#75a7ff" strokeWidth="1" />
        {/* uplinks */}
        {[36, 53, 70].map((x, i) => (
          <g key={x}>
            <line x1={x} y1="76" x2={x} y2="98" stroke="#75a7ff" strokeOpacity="0.3" strokeWidth="0.7" strokeDasharray="2 2" />
            <rect
              x={x - 1.6}
              y="92"
              width="3.2"
              height="3.2"
              rx="0.6"
              fill="#75a7ff"
              className="animate-deco-rise"
              style={{ animationDelay: `${i * -1.1}s` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
