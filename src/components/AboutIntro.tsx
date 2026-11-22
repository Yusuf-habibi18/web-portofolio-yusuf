import { motion, useInView, useReducedMotion } from 'motion/react';
import { useRef } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { profile } from '../data/content';
import { scrollToId } from '../lib/scroll';
import { ArrowDown, ArrowUpRight } from './ui/Icons';
import { Magnetic } from './ui/Magnetic';
import { ScrambleText } from './ui/ScrambleText';

const EASE = [0.16, 1, 0.3, 1] as const;
/** Greeting + name shown in the intro. */
const GREETING = 'Helloo, I’m';
const DISPLAY_NAME = profile.fullName;

/** Highlighted term with an underline that draws itself in. */
function Term({ children, delay, go }: { children: ReactNode; delay: number; go: boolean }) {
  const reduce = useReducedMotion();
  return (
    <span className="relative whitespace-nowrap text-royal-ink">
      {children}
      <motion.span
        className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-royal"
        initial={reduce ? false : { scaleX: 0 }}
        animate={go ? { scaleX: 1 } : undefined}
        transition={{ duration: 0.9, ease: EASE, delay }}
        aria-hidden
      />
    </span>
  );
}

/**
 * The introduction at the top of About: decoding name, drawn underlines and
 * magnetic buttons. Everything starts when the block scrolls into view.
 */
export function AboutIntro() {
  const reduce = useReducedMotion();
  const block = useRef<HTMLDivElement>(null);
  const go = useInView(block, { once: true, amount: 0.4 });

  const goTo = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 28 },
          animate: go ? { opacity: 1, y: 0 } : undefined,
          transition: { duration: 1, ease: EASE, delay },
        };

  return (
    <div ref={block}>
      <motion.p className="mono relative flex items-center gap-3 text-royal-ink" {...rise(0.1)}>
        <span className="relative grid size-7 place-items-center" aria-hidden>
          <span className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full border border-dashed border-royal/50" />
          <span className="size-1.5 rounded-full bg-royal" />
        </span>
        <ScrambleText
          text={`${profile.role} · ITPLN`}
          start={go}
          delay={250}
          duration={700}
          pendingClassName="text-royal/45"
        />
      </motion.p>

      <h2 className="mt-5 font-display text-[clamp(1.85rem,6vw,5.5rem)] leading-[1.02] font-bold tracking-[-0.04em] sm:mt-6">
        <span className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={reduce ? false : { y: '105%' }}
            animate={go ? { y: '0%' } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
          >
            {GREETING}
          </motion.span>
        </span>
        <span className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block text-royal"
            initial={reduce ? false : { y: '105%' }}
            animate={go ? { y: '0%' } : undefined}
            transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
          >
            <ScrambleText text={DISPLAY_NAME} start={go} delay={420} duration={1000} pendingClassName="text-royal/35" replayOnHover />
          </motion.span>
        </span>
      </h2>

      <motion.p
        className="mt-5 max-w-[34rem] font-display text-[clamp(1.25rem,2.2vw,1.9rem)] leading-[1.25] font-medium tracking-[-0.02em]"
        {...rise(0.4)}
      >
        Interested in{' '}
        <Term delay={1.2} go={go}>
          Web Development
        </Term>{' '}
        &amp;{' '}
        <Term delay={1.4} go={go}>
          Data Engineering
        </Term>
        .
      </motion.p>
      <motion.p className="mt-4 max-w-[34rem] text-base leading-relaxed text-muted md:text-[1.0625rem]" {...rise(0.5)}>
        Information Systems student at Institut Teknologi PLN who enjoys building web applications and turning raw data
        into something reliable.
      </motion.p>

      <motion.div className="mt-7 flex flex-wrap gap-2.5 sm:mt-9 sm:gap-3" {...rise(0.6)}>
        <Magnetic>
          <a
            href="#projects"
            onClick={goTo('projects')}
            className="group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-royal pr-1.5 pl-5 text-sm font-medium text-surface transition-colors duration-300 hover:bg-ink sm:h-13 sm:pr-2 sm:pl-7 sm:text-[0.9375rem]"
          >
            <span
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
              aria-hidden
            />
            <span className="relative">View Projects</span>
            <span className="relative grid size-9 place-items-center rounded-full bg-surface/15">
              <ArrowDown size={18} className="transition-transform duration-300 group-hover:translate-y-0.5" />
            </span>
          </a>
        </Magnetic>
        <Magnetic>
          <a
            href="#contact"
            onClick={goTo('contact')}
            className="group inline-flex h-12 items-center gap-2 rounded-full border border-ink/80 px-5 text-sm font-medium transition-colors duration-300 hover:border-royal hover:bg-royal hover:text-surface sm:h-13 sm:px-7 sm:text-[0.9375rem]"
          >
            Hire Me
            <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
          </a>
        </Magnetic>
      </motion.div>
    </div>
  );
}
