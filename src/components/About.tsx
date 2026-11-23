import { animate, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { about, contact, cv, profile } from '../data/content';
import { AboutIntro } from './AboutIntro';
import { Corners, Crosshair } from './ui/Hud';
import { GlowOrb } from './ui/Light';
import { ArrowDown, ArrowUpRight } from './ui/Icons';
import { Reveal } from './ui/Reveal';
import { ScrambleText } from './ui/ScrambleText';

/** Quick facts for recruiters: everything needed to shortlist, plus the CV and code links. */
function AtAGlance() {
  const facts = [
    { k: 'Program', v: 'S1 Information Systems, ITPLN' },
    { k: 'Graduation', v: '2028 (expected)' },
    { k: 'Based in', v: profile.location },
    { k: 'Looking for', v: 'Internship in web development or data engineering' },
  ];
  const links = [
    { label: 'CV · EN', href: cv.en.href, download: true },
    { label: 'CV · ID', href: cv.id.href, download: true },
    { label: 'GitHub', href: contact.github.href },
    { label: 'LinkedIn', href: contact.linkedin.href },
  ];
  return (
    <Reveal className="relative mt-14 md:mt-20">
      <section aria-labelledby="glance-title" className="relative rounded-2xl bg-surface/70 p-5 ring-1 ring-ink/10 backdrop-blur-sm md:p-8">
        <Corners size={12} inset="-inset-1.5" className="text-royal/60" />
        <h3 id="glance-title" className="mono flex items-center gap-2 text-muted">
          <span className="text-royal-ink">//</span> At a glance
        </h3>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {facts.map((f) => (
            <div key={f.k} className="border-t border-ink/10 pt-3">
              <dt className="mono text-[0.625rem] text-muted">{f.k}</dt>
              <dd className="mt-1.5 font-display text-[1.0625rem] leading-snug font-medium tracking-[-0.01em]">{f.v}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-7 flex flex-wrap gap-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                {...(l.download ? { download: '' } : { target: '_blank', rel: 'noreferrer' })}
                className="mono inline-flex h-10 items-center gap-2 rounded-full border border-ink/25 px-4 text-ink transition-colors duration-300 hover:border-royal hover:bg-royal hover:text-surface"
              >
                {l.label}
                {l.download ? <ArrowDown size={14} /> : <ArrowUpRight size={14} />}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}

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
      <GlowOrb className="top-[18%] left-[88%] size-[620px]" strength={0.2} />
      <GlowOrb className="top-[70%] left-[8%] size-[520px]" strength={0.12} delay={4} />
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
          <AtAGlance />

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
