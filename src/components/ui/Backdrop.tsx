import { useInView } from 'motion/react';
import { useRef } from 'react';
import { Crosshair } from './Hud';

/**
 * Section background layers. Each one is absolutely positioned at -z-10 inside a
 * section that has `relative isolate`, so it sits above the section's own
 * background and below its content. Decorative only (aria-hidden, no pointer
 * events); animations are transform / opacity / dash-offset and pause off-screen.
 */

/** Lighter gray band with soft top/bottom edges (About, Education). */
export function Tint({ className = 'bg-mist/75' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_120px,black_calc(100%-120px),transparent)] ${className}`}
    />
  );
}

/** A slightly stronger, very fine grain for one section (on top of the global one). */
export function Grain() {
  return <div aria-hidden className="grain pointer-events-none absolute inset-0 -z-10" />;
}

type Mark = { at: 'tr' | 'bl' | 'br'; label: string; sub?: string; phone?: boolean };

/** Blueprint corner marks: crosshair + mono label + a short ruled line. */
export function Blueprint({ marks }: { marks: Mark[] }) {
  // top marks sit below the fixed nav; top-left is left free for the section label
  const pos = {
    tr: 'top-[104px] right-0 items-end text-right',
    bl: 'bottom-8 left-0 md:bottom-12',
    br: 'bottom-8 right-0 items-end text-right md:bottom-12',
  } as const;
  return (
    <div aria-hidden className="wrap pointer-events-none absolute inset-0 -z-10">
      <div className="relative size-full">
        {marks.map((m) => (
          <div
            key={m.at}
            className={`mono absolute flex-col gap-1.5 text-[0.625rem] tracking-[0.16em] text-muted/80 ${pos[m.at]} ${
              m.phone ? 'flex' : 'hidden md:flex'
            }`}
          >
            <span className={`flex items-center gap-2 ${m.at.endsWith('r') ? 'flex-row-reverse' : ''}`}>
              <Crosshair size={9} className="text-royal/60" />
              <span className="h-px w-10 bg-gradient-to-r from-ink/30 to-ink/0" />
            </span>
            <span>
              <span className="text-royal-ink">{m.label}</span>
              {m.sub && <span className="ml-2">{m.sub}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Circuit-like data lines for a dark section, with light flowing slowly along three of them.
 * Drawn in a 1440×900 space that covers the section (slice), kept to the edges so the
 * content in the middle stays clear.
 */
export function CircuitFlow() {
  const ref = useRef<SVGSVGElement>(null);
  const onScreen = useInView(ref, { margin: '10% 0px' });
  const paths = [
    'M-20 120 H250 L290 160 H560 L600 120 H760',
    'M1460 250 H1210 L1170 290 H1030 L990 250 H900',
    'M-20 640 H150 L190 680 H420',
    'M1460 760 H1260 L1220 720 H1060 L1020 760 H900',
    'M1120 -20 V70 L1160 110 V200',
    'M60 920 V840 L100 800 H230',
  ];
  const lit = [0, 1, 3];
  const ends: [number, number][] = [
    [760, 120],
    [900, 250],
    [420, 680],
    [900, 760],
    [1160, 200],
    [230, 800],
  ];
  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 -z-10 size-full ${onScreen ? '' : 'deco-paused'}`}
    >
      <g fill="none" stroke="#75a7ff" strokeOpacity="0.13" strokeWidth="1">
        {paths.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {lit.map((k, i) => (
        <path
          key={k}
          d={paths[k]}
          fill="none"
          stroke="#75a7ff"
          strokeOpacity="0.75"
          strokeWidth="1.5"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="7 100"
          className="animate-gfx-light"
          style={{ animationDuration: `${10 + i * 2.5}s`, animationDelay: `${-i * 3.3}s` }}
        />
      ))}
      <g fill="#11151d" stroke="#75a7ff" strokeOpacity="0.4" strokeWidth="1">
        {ends.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" />
        ))}
      </g>
    </svg>
  );
}

const CELL = 72; // matches the page grid (body::before)

/**
 * "Gentle grid illumination" for a light section: two patches of the page grid light up
 * in faint blue, slowly trading places, but only while the section is on screen.
 * Fixed to the viewport (like the page grid) so the lit lines line up with it.
 */
export function LitGrid() {
  const ref = useRef<HTMLSpanElement>(null);
  const onScreen = useInView(ref, { amount: 0.15 });
  const patch = (x: string, y: string, delay: number) => {
    const mask = `radial-gradient(360px circle at ${x} ${y}, black, transparent 72%)`;
    return (
      <div
        className="absolute inset-0 animate-grid-lit"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(36 87 255 / 0.13) 1px, transparent 1px), linear-gradient(to bottom, rgb(36 87 255 / 0.13) 1px, transparent 1px)',
          backgroundSize: `${CELL}px ${CELL}px`,
          maskImage: mask,
          WebkitMaskImage: mask,
          animationDelay: `${-delay}s`,
        }}
      />
    );
  };
  return (
    <>
      <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000 ${
          onScreen ? 'opacity-100' : 'deco-paused opacity-0'
        }`}
      >
        {patch('18%', '30%', 0)}
        {patch('84%', '72%', 7)}
      </div>
    </>
  );
}

