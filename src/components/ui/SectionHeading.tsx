import type { ReactNode } from 'react';
import { Crosshair } from './Hud';
import { Reveal, WordsReveal } from './Reveal';
import { ScrambleText } from './ScrambleText';

type Props = {
  index: string;
  label: string;
  title: string;
  accent?: string[];
  tone?: 'light' | 'dark';
  /** small 3D accent: in the empty label column on desktop */
  deco?: ReactNode;
  /** smaller accent at the end of the label row on phones/tablets */
  decoMobile?: ReactNode;
};

/** Shared "(01) — Label" eyebrow plus a large display heading. */
export function SectionHeading({ index, label, title, accent, tone = 'light', deco, decoMobile }: Props) {
  const muted = tone === 'dark' ? 'text-slate' : 'text-muted';
  const blue = tone === 'dark' ? 'text-royal-soft' : 'text-royal-ink';
  return (
    <div className="grid gap-6 md:grid-cols-12 md:gap-8">
      <Reveal className="relative md:col-span-3">
        <p className={`eyebrow flex items-center gap-3 ${muted}`}>
          <span className={`mono ${blue}`}>[{index}]</span>
          <span
            className={`h-px w-8 bg-gradient-to-r ${tone === 'dark' ? 'from-signal to-signal/0' : 'from-royal to-royal/0'}`}
            aria-hidden
          />
          <ScrambleText text={label} trigger="view" delay={150} duration={700} pendingClassName="text-royal/50" />
        </p>
        <p className={`mono mt-3 hidden items-center gap-2 opacity-70 md:flex ${muted}`} aria-hidden>
          <Crosshair size={9} />
          <ScrambleText text={`Sec_${index} / 05`} trigger="view" delay={350} duration={600} pendingClassName="text-royal/50" />
        </p>
        {deco && <div className="mt-12 hidden md:block">{deco}</div>}
        {decoMobile && <div className="absolute -top-5 right-0 md:hidden">{decoMobile}</div>}
      </Reveal>
      <h2 className="font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.95] font-bold tracking-[-0.035em] md:col-span-9">
        <WordsReveal text={title} accent={accent} />
      </h2>
    </div>
  );
}
