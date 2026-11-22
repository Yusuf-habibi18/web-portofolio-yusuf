import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { useRef } from 'react';
import type { MouseEvent } from 'react';
import { useActiveSection } from '../hooks/useActiveSection';
import { scrollToId } from '../lib/scroll';

const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'projects', label: 'Projects' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;
const IDS = SECTIONS.map((s) => s.id);

/**
 * Right-edge scroll readout (wide screens only): a progress rail, one tick per
 * section that jumps there on click, and the scroll percentage in mono.
 */
export function ScrollHud({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const active = useActiveSection(IDS);
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });
  const pct = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (pct.current) pct.current.textContent = `${Math.round(v * 100).toString().padStart(3, '0')}%`;
  });

  const dark = active === 'contact';
  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <motion.nav
      aria-label="Section progress"
      className={`fixed top-1/2 right-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 transition-colors duration-500 xl:flex 2xl:right-6 ${
        dark ? 'text-paper/70' : 'text-ink/60'
      }`}
      initial={{ opacity: 0, x: 12 }}
      animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
      transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : 1 }}
    >
      <ol className="flex flex-col items-center gap-3">
        {SECTIONS.map((s, i) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={go(s.id)}
                aria-current={on ? 'true' : undefined}
                className="group relative flex items-center"
              >
                <span className="sr-only">{s.label}</span>
                <span
                  className={`mono text-[0.625rem] transition-colors duration-300 ${
                    on ? (dark ? 'text-royal-soft' : 'text-royal-ink') : 'group-hover:text-current'
                  }`}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* label slides out on hover */}
                <span
                  className={`mono pointer-events-none absolute right-full mr-3 translate-x-1 text-[0.625rem] whitespace-nowrap opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 ${
                    dark ? 'text-paper' : 'text-ink'
                  }`}
                  aria-hidden
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <div className={`relative h-28 w-px ${dark ? 'bg-paper/20' : 'bg-ink/15'}`} aria-hidden>
        <motion.div className="absolute inset-0 origin-top bg-royal" style={{ scaleY: fill }} />
      </div>
      <span ref={pct} className="mono w-9 text-center text-[0.625rem] tabular-nums" aria-hidden>
        000%
      </span>
    </motion.nav>
  );
}
