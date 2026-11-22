import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { WaveLines } from './visuals/WaveLines';

/**
 * The flowing-lines ribbon as a site-wide backdrop: pinned to the bottom of the
 * viewport behind all content, so it accompanies every section while scrolling.
 * Lines lean towards the mouse; static for reduced motion. Sections with their
 * own solid background (e.g. Contact) simply cover it.
 */
export function AmbientWaves({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const layer = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, active: false });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !layer.current) return;
      const r = layer.current.getBoundingClientRect();
      pointer.current = {
        x: e.clientX / window.innerWidth,
        y: (e.clientY - r.top) / r.height,
        // only bend the lines when the pointer is near the ribbon
        active: e.clientY > r.top - r.height * 0.35,
      };
    };
    const leave = () => {
      pointer.current.active = false;
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <motion.div
      ref={layer}
      className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[36vh] min-h-[200px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: ready ? 0.85 : 0 }}
      transition={{ duration: 1.6, delay: reduce ? 0 : 0.4 }}
      aria-hidden
    >
      <WaveLines className="size-full" animate={!reduce} pointer={pointer} />
    </motion.div>
  );
}
