import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { about } from '../data/content';
import { AboutIntro } from './AboutIntro';
import { Crosshair } from './ui/Hud';
import { Reveal } from './ui/Reveal';
import { ScrambleText } from './ui/ScrambleText';

function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 1.6, ease: [0.16, 1, 0.3, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(decimals)}
    </span>
  );
}

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-36" aria-labelledby="about-title">
      {/* Same editorial grid as every other section: label left (3 cols), content right (9 cols) */}
      <div className="wrap grid gap-10 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-3">
          <Reveal className="md:sticky md:top-28">
            <p id="about-title" className="eyebrow flex items-center gap-3 text-muted">
              <span className="mono text-royal-ink">[01]</span>
              <span className="h-px w-8 bg-current opacity-50" aria-hidden />
              <ScrambleText text="About me" trigger="view" delay={150} duration={700} pendingClassName="text-royal/50" />
            </p>
            <p className="mono mt-3 hidden items-center gap-2 text-muted opacity-70 md:flex" aria-hidden>
              <Crosshair size={9} />
              <ScrambleText text="Sec_01 / 05" trigger="view" delay={350} duration={600} pendingClassName="text-royal/50" />
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-9">
          <AboutIntro />

          <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-2 md:gap-12">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <p className="text-[1.0625rem] leading-relaxed text-muted">{p}</p>
              </Reveal>
            ))}
          </div>

          <dl className="mt-16 grid grid-cols-3 border-t border-ink/15 md:mt-24">
            {about.stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08} className="group/stat relative flex flex-col border-ink/15 pt-6 pr-3 [&:not(:first-child)]:border-l [&:not(:first-child)]:pl-4 md:pt-8 md:[&:not(:first-child)]:pl-8">
                <dt className="order-2 mt-2 text-xs leading-snug text-muted md:text-sm">{s.label}</dt>
                <span className="pointer-events-none absolute top-0 left-0 h-px w-0 bg-royal transition-all duration-700 ease-out-expo group-hover/stat:w-full" aria-hidden />
                <dd className="order-1 font-display text-[clamp(2.5rem,7vw,6rem)] leading-none font-bold tracking-[-0.05em] text-ink transition-colors duration-300 group-hover/stat:text-royal">
                  <CountUp value={s.value} decimals={s.decimals} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
