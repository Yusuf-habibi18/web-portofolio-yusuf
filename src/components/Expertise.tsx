import { motion, useReducedMotion } from 'motion/react';
import { expertise } from '../data/content';
import type { ExpertiseGroup } from '../data/content';
import { Corners } from './ui/Hud';
import { GlowOrb } from './ui/Light';
import { CircuitFlow } from './ui/Backdrop';
import { ArrowUpRight } from './ui/Icons';
import { Reveal } from './ui/Reveal';
import { Spotlight } from './ui/Spotlight';
import { SectionHeading } from './ui/SectionHeading';
import { Deco } from './deco/Deco';
import { CircuitPattern, GeoCube, HudRadar, NetworkNodes } from './deco/Graphics';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Small animated browser window: the "web" identity mark. */
function WebMotif() {
  const reduce = useReducedMotion();
  return (
    <div className="w-40 rounded-lg border border-ink/15 bg-paper/60 p-2" aria-hidden>
      <div className="mb-2 flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="size-1.5 rounded-full bg-ink/25" />
        ))}
      </div>
      <div className="space-y-1.5">
        {[70, 100, 45].map((w, i) => (
          <motion.span
            key={i}
            className={`block h-1.5 rounded-full ${i === 0 ? 'bg-royal' : 'bg-ink/20'}`}
            initial={{ width: '0%' }}
            whileInView={{ width: `${w}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.15 }}
          />
        ))}
        <div className="flex gap-1.5 pt-0.5">
          <span className="h-5 flex-1 rounded bg-ink/10" />
          <span className="h-5 flex-1 rounded bg-ink/10" />
          <motion.span
            className="h-5 w-1 rounded-full bg-royal"
            animate={reduce ? undefined : { opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
        </div>
      </div>
    </div>
  );
}

/** Bronze → Silver → Gold with a packet travelling along: the "data" identity mark. */
function DataMotif() {
  const reduce = useReducedMotion();
  return (
    <div className="relative flex w-44 items-center justify-between" aria-hidden>
      <span className="absolute inset-x-3 top-1/2 h-px -translate-y-1/2 bg-paper/25" />
      {!reduce && (
        <motion.span
          className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-royal shadow-[0_0_8px_1px_rgba(36,87,255,0.55)]"
          animate={{ left: ['8%', '88%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
      {['B', 'S', 'G'].map((l) => (
        <span
          key={l}
          className="relative grid size-9 place-items-center rounded-md border border-paper/30 bg-ink font-display text-xs font-bold text-paper"
        >
          {l}
        </span>
      ))}
    </div>
  );
}

function Panel({ group, delay }: { group: ExpertiseGroup; delay: number }) {
  const dark = group.id === 'data';
  return (
    <Reveal delay={delay} className="h-full">
      <Spotlight className="h-full rounded-[1.75rem]" tilt={3.5} tone={dark ? 'dark' : 'light'}>
      <article
        className={`group/panel relative flex h-full flex-col rounded-[1.75rem] p-6 transition-shadow duration-500 md:p-10 ${
          dark
            ? 'bg-[#1a2130] text-paper ring-1 ring-paper/10 ring-inset hover:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]'
            : 'bg-surface text-ink hover:shadow-[0_30px_60px_-30px_rgba(17,18,22,0.35)]'
        }`}
      >
        {dark && (
          // blue light pooling in the dark panel's corner
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
            <GlowOrb className="top-[6%] left-[88%] size-[560px]" strength={0.42} />
          </span>
        )}
        <Corners
          size={16}
          inset="-inset-2"
          className="text-royal opacity-0 transition-opacity duration-500 group-hover/panel:opacity-100"
          thickness={1.5}
        />
        <p className={`mono mb-6 flex items-center justify-between ${dark ? 'text-slate' : 'text-muted'}`} aria-hidden>
          <span>Module_{group.index}</span>
          <span className={dark ? 'text-royal-soft' : 'text-royal-ink'}>{dark ? 'Pipeline' : 'Interface'}</span>
        </p>
        <header className="flex items-start justify-between gap-6">
          <span className={`font-display text-[clamp(4rem,9vw,7.5rem)] leading-[0.8] font-bold tracking-[-0.06em] ${dark ? 'text-paper/15' : 'text-ink/10'}`}>
            {group.index}
          </span>
          {dark ? <DataMotif /> : <WebMotif />}
        </header>

        <h3 className="mt-8 font-display text-[clamp(2rem,3.6vw,3rem)] leading-none font-bold tracking-[-0.035em]">
          {group.title}
        </h3>
        <p className={`mt-3 text-base ${dark ? 'text-slate' : 'text-muted'}`}>{group.intro}</p>

        <ul className={`mt-8 border-t ${dark ? 'border-paper/15' : 'border-ink/10'}`}>
          {group.items.map((item) => (
            <li
              key={item.title}
              className={`group/item border-b py-5 transition-colors duration-300 ${
                dark ? 'border-paper/15' : 'border-ink/10'
              }`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h4 className="font-display text-xl font-medium tracking-[-0.015em] transition-transform duration-500 ease-out-expo group-hover/item:translate-x-2 md:text-2xl">
                  {item.title}
                </h4>
                <ArrowUpRight
                  size={20}
                  className="shrink-0 text-royal opacity-40 transition-all duration-500 ease-out-expo group-hover/item:rotate-45 group-hover/item:opacity-100"
                />
              </div>
              <p className={`mt-2 text-[0.9375rem] leading-relaxed ${dark ? 'text-paper/65' : 'text-muted'}`}>
                {item.detail}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`${item.title} tools`}>
                {item.tools.map((t) => (
                  <li key={t} className={`chip ${dark ? 'text-paper/70' : 'text-ink/70'}`}>
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {!dark && (
          // the web panel is shorter than the data panel on wide screens: its spare space holds a circuit + cube
          <div className="mt-auto hidden items-end justify-end gap-8 pt-10 pr-2 lg:flex" aria-hidden>
            <Deco delay={0.3} depth={8} float={0}>
              <CircuitPattern w={210} />
            </Deco>
            <Deco delay={0.55} depth={12} float={10} floatDuration={8}>
              <GeoCube s={84} />
            </Deco>
          </div>
        )}
      </article>
      </Spotlight>
    </Reveal>
  );
}

export function Expertise() {
  return (
    <section id="expertise" className="grid-dark relative isolate overflow-hidden bg-navy py-24 text-paper md:py-36" aria-label="Expertise">
      {/* dark navy band: circuit lines with light flowing along them + a soft blue light in the corner */}
      <CircuitFlow />
      <span className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <GlowOrb className="top-[8%] left-[12%] size-[min(110vw,760px)]" strength={0.2} drift />
      </span>
      <div className="wrap">
        <SectionHeading
          index="02"
          label="Expertise"
          title="Two disciplines, one way of working."
          accent={['disciplines']}
          tone="dark"
          deco={
            <div className="flex items-end gap-5 [--gfx-fill:#11151d] [--gfx-ink:#dde0e2]">
              <Deco delay={0.2} depth={8} float={8} floatDuration={9}>
                <NetworkNodes w={150} />
              </Deco>
              <Deco delay={0.45} depth={12} float={10} floatDuration={8}>
                <HudRadar s={78} />
              </Deco>
            </div>
          }
          decoMobile={
            <Deco delay={0.3} depth={0} float={8} className="[--gfx-fill:#11151d] [--gfx-ink:#dde0e2]">
              <HudRadar s={48} />
            </Deco>
          }
        />
        <div className="relative mt-14 grid gap-4 md:mt-20 lg:grid-cols-2 lg:gap-5">
          {expertise.map((g, i) => (
            <Panel key={g.id} group={g} delay={i * 0.12} />
          ))}
          {/* Thin link between the two disciplines */}
          <span
            className="pointer-events-none absolute top-[5.25rem] left-1/2 z-10 hidden w-24 -translate-x-1/2 items-center lg:flex"
            aria-hidden
          >
            <span className="size-1.5 shrink-0 bg-royal" />
            <span className="h-px flex-1 bg-royal/70" />
            <span className="size-2.5 shrink-0 rounded-full border border-royal bg-paper" />
            <span className="h-px flex-1 bg-royal/70" />
            <span className="size-1.5 shrink-0 bg-royal" />
          </span>
        </div>
      </div>
    </section>
  );
}
