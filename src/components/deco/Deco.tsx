import { motion, motionValue, useInView, useReducedMotion, useSpring, useTransform } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { useRef } from 'react';

/**
 * Wrapper for the small 3D accent objects ("detail pemanis").
 * - entrance: fades/rises in once when its section scrolls into view (staggered by `delay`);
 * - float: slow 8–15px vertical drift (CSS, transform only);
 * - parallax: drifts a few px with the mouse on desktop (one shared listener for all objects);
 * - pauses every animation inside while off-screen, so only what you see is moving;
 * - always decorative: pointer-events none, aria-hidden. Reduced motion: static.
 */

// one shared pointer for every decoration (-1..1 across the viewport), fine pointers only
const pointerX = motionValue(0);
const pointerY = motionValue(0);
let listening = false;
function listen() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  if (!window.matchMedia('(pointer: fine)').matches) return;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

type Props = {
  children: ReactNode;
  className?: string;
  /** entrance delay (s), used to stagger objects in the same section */
  delay?: number;
  /** parallax travel in px at the edge of the screen */
  depth?: number;
  /** float amplitude in px (8–15) and cycle length in s */
  float?: number;
  floatDuration?: number;
  style?: CSSProperties;
};

export function Deco({ children, className = '', delay = 0, depth = 10, float = 10, floatDuration = 7, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const onScreen = useInView(ref, { margin: '15% 0px 15% 0px' });
  listen();
  const sx = useSpring(pointerX, { stiffness: 40, damping: 16 });
  const sy = useSpring(pointerY, { stiffness: 40, damping: 16 });
  const x = useTransform(sx, (v) => (reduce ? 0 : v * depth));
  const y = useTransform(sy, (v) => (reduce ? 0 : v * depth * 0.6));

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none select-none ${onScreen ? '' : 'deco-paused'} ${className}`}
      style={style}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 28, scale: 0.86 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay }}
      >
        <motion.div style={{ x, y }}>
          <div
            className="animate-deco-float"
            style={
              {
                '--amp': `${-float}px`,
                animationDuration: `${floatDuration}s`,
                animationDelay: `${-delay * 2.3}s`,
              } as CSSProperties
            }
          >
            {children}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
