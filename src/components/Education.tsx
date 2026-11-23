import { education } from '../data/content';
import { Corners } from './ui/Hud';
import { Reveal } from './ui/Reveal';
import { ScrambleText } from './ui/ScrambleText';
import { Spotlight } from './ui/Spotlight';
import { Grain, Tint } from './ui/Backdrop';
import { SectionHeading } from './ui/SectionHeading';

function Slot({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={`rounded-2xl p-6 ${items.length ? 'bg-surface' : 'border border-dashed border-ink/25'}`}>
      <p className="mono text-muted">{title}</p>
      {items.length ? (
        <ul className="mt-4 space-y-2 text-[0.9375rem]">
          {items.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 font-mono text-sm text-muted">// To be added</p>
      )}
    </div>
  );
}

export function Education() {
  return (
    <section id="education" className="relative isolate py-24 md:py-36" aria-label="Education">
      {/* light gray band with a fine grain */}
      <Tint />
      <Grain />
      <div className="wrap">
        <SectionHeading index="04" label="Education" title="Where I study." accent={['study.']} />

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-12 md:gap-5">
          <Reveal className="md:col-span-8">
            <Spotlight className="h-full rounded-[1.75rem]" tilt={2.5}>
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-surface p-6 md:p-10">
              <span
                className="pointer-events-none absolute -right-4 -bottom-[0.32em] font-display text-[clamp(7rem,18vw,16rem)] leading-none font-bold tracking-[-0.06em] text-ink/[0.035] select-none"
                aria-hidden
              >
                ITPLN
              </span>
              <div className="relative">
                <p className="eyebrow text-royal-ink">{education.period}</p>
                <h3 className="mt-4 font-display text-[clamp(1.9rem,4vw,3.5rem)] leading-[0.98] font-bold tracking-[-0.035em]">
                  {education.school}
                </h3>
                <p className="mt-3 text-lg text-ink/80">{education.degree}</p>
              </div>
              <p className="relative mt-10 text-sm text-muted">{education.location}</p>
            </article>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-4">
            <Spotlight className="h-full rounded-[1.75rem]" tilt={4} tone="dark">
            <article className="relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] bg-royal p-6 text-surface shadow-[0_26px_70px_-24px_rgba(36,87,255,0.85)] md:p-10">
              <Corners size={14} inset="inset-4 md:inset-5" className="text-surface/45" />
              <p className="mono flex justify-between text-surface/80">
                <span>GPA</span>
                <span>Sem 1–4</span>
              </p>
              <p className="mt-10 font-display text-[clamp(3.5rem,8vw,6.5rem)] leading-none font-bold tracking-[-0.05em] tabular-nums">
                <ScrambleText text={education.gpa.split(' ')[0]} trigger="view" delay={250} duration={900} pendingClassName="text-surface/45" />
                <span className="ml-1 text-[0.35em] font-medium tracking-normal text-surface/70">/ 4.00</span>
              </p>
              <p className="mt-3 text-sm text-surface/80">{education.gpaNote}</p>
            </article>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.15} className="md:col-span-6">
            <Slot title="Academic achievements" items={education.achievements} />
          </Reveal>
          <Reveal delay={0.2} className="md:col-span-6">
            <Slot title="Certifications" items={education.certifications} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
