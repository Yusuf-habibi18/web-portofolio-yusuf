import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'p';
};

/** Fades and lifts content in once it enters the viewport. */
export function Reveal({ children, delay = 0, y = 32, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

type WordsRevealProps = {
  text: string;
  className?: string;
  delay?: number;
  /** Words (case-insensitive, punctuation ignored) to render in the accent colour. */
  accent?: string[];
};

/** Heading whose words slide up from behind a mask, one after another.
 *  The in-view trigger sits on the unclipped wrapper; the masked words follow via variants. */
export function WordsReveal({ text, className, delay = 0, accent = [] }: WordsRevealProps) {
  const reduce = useReducedMotion();
  const words = text.split(' ');
  const accentSet = new Set(accent.map((w) => w.toLowerCase()));
  return (
    <motion.span
      className={className}
      aria-label={text}
      role="text"
      initial={reduce ? false : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ staggerChildren: 0.045, delayChildren: delay }}
    >
      {words.map((word, i) => {
        const isAccent = accentSet.has(word.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase());
        return (
          <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
            <motion.span
              className={`inline-block ${isAccent ? 'text-royal' : ''}`}
              variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
              transition={{ duration: 0.85, ease: EASE }}
            >
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        );
      })}
    </motion.span>
  );
}
