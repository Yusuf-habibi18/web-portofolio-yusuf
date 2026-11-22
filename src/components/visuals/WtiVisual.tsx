import { motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { wtiSeries } from '../../data/wti';

const W = 600;
const H = 260;
const PAD = { top: 16, bottom: 8 };
const TICKS = [60, 80, 100];

const monthFmt = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' });
const dayFmt = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' });

/** Line chart of the real cleaned WTI series, with a hover crosshair. */
export function WtiVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, y } = useMemo(() => {
    const prices = wtiSeries.map((d) => d[1]);
    const min = 50;
    const max = 120;
    const x = (i: number) => (i / (wtiSeries.length - 1)) * W;
    const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * (H - PAD.top - PAD.bottom);
    const path = prices.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join('');
    return { path, area: `${path}L${W},${H}L0,${H}Z`, y };
  }, []);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setHover(Math.round(t * (wtiSeries.length - 1)));
  };

  const point = hover !== null ? wtiSeries[hover] : null;
  const first = wtiSeries[0];
  const last = wtiSeries[wtiSeries.length - 1];
  const peak = wtiSeries.reduce((a, b) => (b[1] > a[1] ? b : a));

  return (
    <div className="flex h-full flex-col gap-4 bg-surface p-5 text-ink sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow text-muted">WTI spot price · USD / barrel</p>
          <p className="mt-1 text-xs text-muted">Source: U.S. EIA · {wtiSeries.length} clean daily observations</p>
        </div>
        <p className="font-display text-2xl leading-none font-bold tracking-tight tabular-nums">
          {point ? `$${point[1].toFixed(2)}` : `$${last[1].toFixed(2)}`}
          <span className="mt-1 block text-right font-sans text-[0.6875rem] font-normal tracking-normal text-muted">
            {dayFmt.format(new Date(point ? point[0] : last[0]))}
          </span>
        </p>
      </div>

      <div
        ref={ref}
        className="relative min-h-[150px] flex-1 cursor-crosshair touch-none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
        role="img"
        aria-label={`Line chart of WTI crude oil spot price from ${monthFmt.format(new Date(first[0]))} to ${monthFmt.format(
          new Date(last[0]),
        )}, ranging from about $55 to a peak of $${peak[1].toFixed(2)}.`}
      >
        {/* grid + y labels */}
        {TICKS.map((t) => (
          <div key={t} className="absolute inset-x-0 border-t border-dashed border-ink/10" style={{ top: `${(y(t) / H) * 100}%` }}>
            <span className="absolute -top-2.5 left-0 bg-surface pr-1 text-[0.6875rem] text-muted tabular-nums">${t}</span>
          </div>
        ))}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" aria-hidden>
          <defs>
            <linearGradient id="wti-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#2457FF" stopOpacity="0.16" />
              <stop offset="1" stopColor="#2457FF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={area}
            fill="url(#wti-fill)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 1.9 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke="#2457FF"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
          />
        </svg>
        {point && hover !== null && (
          <>
            <span
              className="pointer-events-none absolute inset-y-0 w-px bg-ink/40"
              style={{ left: `${(hover / (wtiSeries.length - 1)) * 100}%` }}
            />
            <span
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-royal shadow"
              style={{
                left: `${(hover / (wtiSeries.length - 1)) * 100}%`,
                top: `${(y(point[1]) / H) * 100}%`,
              }}
            />
          </>
        )}
      </div>

      <div className="flex justify-between text-[0.6875rem] text-muted">
        <span>{monthFmt.format(new Date(first[0]))}</span>
        <span className="hidden sm:inline">Hover to inspect a day</span>
        <span>{monthFmt.format(new Date(last[0]))}</span>
      </div>
    </div>
  );
}
