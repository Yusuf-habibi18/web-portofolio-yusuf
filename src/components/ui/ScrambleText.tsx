import { useInView, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>/_#%&*+=';

type Cell = { ch: string; done: boolean };

type Props = {
  text: string;
  /** ms before decoding starts */
  delay?: number;
  /** ms for the whole string to resolve */
  duration?: number;
  className?: string;
  /** Classes for characters that are still scrambling. */
  pendingClassName?: string;
  /** Re-run the decode when hovered. */
  replayOnHover?: boolean;
  /** 'mount' decodes right away; 'view' waits until the text scrolls into view. */
  trigger?: 'mount' | 'view';
  /** Extra gate, e.g. wait until an intro screen has closed. */
  start?: boolean;
};

const settled = (text: string): Cell[] => [...text].map((ch) => ({ ch, done: true }));

/**
 * Text that "decodes" from random glyphs into the real string. The real text is
 * kept (invisible) for layout and exposed to assistive tech, so nothing shifts
 * and screen readers read it normally.
 */
export function ScrambleText({
  text,
  delay = 0,
  duration = 900,
  className = '',
  pendingClassName = 'text-royal/70',
  replayOnHover = false,
  trigger = 'mount',
  start = true,
}: Props) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLSpanElement>(null);
  const inView = useInView(root, { once: true, margin: '0px 0px -8% 0px' });
  const go = start && (trigger === 'mount' || inView);
  const [cells, setCells] = useState<Cell[]>(() =>
    reduce ? settled(text) : [...text].map((ch) => ({ ch: ch === ' ' ? ' ' : '', done: ch === ' ' })),
  );
  const raf = useRef(0);
  const running = useRef(false);

  const run = useCallback(
    (wait: number) => {
      if (reduce) {
        setCells(settled(text));
        return;
      }
      cancelAnimationFrame(raf.current);
      running.current = true;
      const chars = [...text];
      // each character resolves at its own moment, left to right with a little jitter
      const at = chars.map((_, i) => wait + (i / Math.max(1, chars.length - 1)) * duration * 0.75 + Math.random() * duration * 0.25);
      const start = performance.now();
      let last = 0;
      const tick = (now: number) => {
        const t = now - start;
        if (now - last > 45) {
          last = now;
          setCells(
            chars.map((ch, i) => {
              if (ch === ' ' || t >= at[i]) return { ch, done: true };
              if (t < wait) return { ch: '', done: false };
              return { ch: GLYPHS[(Math.random() * GLYPHS.length) | 0], done: false };
            }),
          );
        }
        if (t < Math.max(...at) + 50) raf.current = requestAnimationFrame(tick);
        else {
          setCells(settled(text));
          running.current = false;
        }
      };
      raf.current = requestAnimationFrame(tick);
    },
    [text, duration, reduce],
  );

  useEffect(() => {
    if (!go) return;
    run(delay);
    return () => cancelAnimationFrame(raf.current);
  }, [run, delay, go]);

  return (
    <span
      ref={root}
      className={`relative inline-block whitespace-nowrap ${className}`}
      aria-label={text}
      onMouseEnter={replayOnHover ? () => !running.current && run(0) : undefined}
    >
      <span className="invisible" aria-hidden>
        {text}
      </span>
      <span className="absolute inset-0" aria-hidden>
        {cells.map((c, i) => (
          <span key={i} className={c.done ? undefined : pendingClassName}>
            {c.ch}
          </span>
        ))}
      </span>
    </span>
  );
}
