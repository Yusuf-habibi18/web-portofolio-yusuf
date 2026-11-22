import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useRef } from 'react';
import type { PointerEvent, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Max tilt in degrees (0 = no tilt). */
  tilt?: number;
  /** Glow strength suited to the surface underneath. */
  tone?: 'light' | 'dark';
};

/**
 * Wraps a card: an electric-blue glow follows the mouse inside it and, if
 * `tilt` is set, the card leans slightly towards the pointer. Mouse only;
 * nothing happens on touch or with reduced motion.
 */
export function Spotlight({ children, className = '', tilt = 0, tone = 'light' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 18 });
  const sry = useSpring(ry, { stiffness: 140, damping: 18 });

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--sx', `${x}px`);
    el.style.setProperty('--sy', `${y}px`);
    if (tilt && !reduce) {
      ry.set((x / r.width - 0.5) * tilt);
      rx.set(-(y / r.height - 0.5) * tilt);
    }
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
  };

  const glow = tone === 'dark' ? 'rgb(36 87 255 / 0.24)' : 'rgb(36 87 255 / 0.11)';

  return (
    <motion.div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`group/spot relative ${className}`}
      style={tilt && !reduce ? { rotateX: srx, rotateY: sry, transformPerspective: 1200 } : undefined}
    >
      {children}
      {!reduce && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
          style={{ background: `radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), ${glow}, transparent 65%)` }}
          aria-hidden
        />
      )}
    </motion.div>
  );
}
