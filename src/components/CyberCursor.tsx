import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

const pad4 = (n: number) => Math.round(n).toString().padStart(4, '0');

/**
 * Site-wide pointer layer (mouse only, off for reduced motion):
 *  - a ring + dot that follow the cursor with live X/Y coordinates;
 *    the ring grows over links/buttons and shows a label over [data-cursor] elements;
 *  - the page grid lights up in electric blue around the pointer (behind content).
 * The native cursor is kept, so nothing about usability changes.
 */
export function CyberCursor() {
  const reduce = useReducedMotion();
  const [fine] = useState(() => window.matchMedia('(pointer: fine)').matches);
  const enabled = fine && !reduce;
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<'idle' | 'link' | 'label'>('idle');
  const [label, setLabel] = useState('');
  const spot = useRef<HTMLDivElement>(null);
  const coord = useRef<HTMLSpanElement>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 480, damping: 36, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 480, damping: 36, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      spot.current?.style.setProperty('--mx', `${e.clientX}px`);
      spot.current?.style.setProperty('--my', `${e.clientY}px`);
      if (coord.current) coord.current.textContent = `X ${pad4(e.clientX)} · Y ${pad4(e.clientY)}`;
      setVisible(true);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as Element | null;
      const tagged = t?.closest<HTMLElement>('[data-cursor]');
      if (tagged) {
        setMode('label');
        setLabel(tagged.dataset.cursor ?? '');
        return;
      }
      setMode(t?.closest('a, button, [role="button"]') ? 'link' : 'idle');
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Lit grid: same 72px rhythm as the page grid, painted behind all content */}
      <div
        ref={spot}
        className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-500"
        style={{
          opacity: visible ? 1 : 0,
          backgroundImage:
            'radial-gradient(circle at 0 0, rgb(36 87 255 / 0.8) 1.5px, transparent 2.5px), linear-gradient(to right, rgb(36 87 255 / 0.32) 1px, transparent 1px), linear-gradient(to bottom, rgb(36 87 255 / 0.32) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(260px circle at var(--mx, -999px) var(--my, -999px), black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(260px circle at var(--mx, -999px) var(--my, -999px), black, transparent 75%)',
        }}
        aria-hidden
      />
      {/* Cursor */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[90] transition-opacity duration-300"
        style={{ x: rx, y: ry, opacity: visible ? 1 : 0 }}
        aria-hidden
      >
        <motion.span
          className="absolute -top-4 -left-4 size-8 rounded-full border border-royal/70"
          animate={{
            scale: mode === 'link' ? 1.55 : mode === 'label' ? 0 : 1,
            backgroundColor: mode === 'link' ? 'rgba(36,87,255,0.08)' : 'rgba(36,87,255,0)',
          }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        />
        <motion.span
          className="mono absolute top-0 left-0 rounded-full bg-royal px-3 py-1.5 text-[0.6875rem] whitespace-nowrap text-surface"
          style={{ translateX: '-50%', translateY: '-50%' }}
          initial={false}
          animate={{ scale: mode === 'label' ? 1 : 0, opacity: mode === 'label' ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        >
          {label}
        </motion.span>
        <span
          className={`absolute -top-[3px] -left-[3px] size-1.5 rounded-full bg-royal transition-opacity ${mode === 'label' ? 'opacity-0' : ''}`}
        />
        <span
          ref={coord}
          className={`mono absolute top-5 left-6 text-[0.625rem] whitespace-nowrap text-royal-ink transition-opacity duration-300 ${
            mode === 'idle' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </motion.div>
    </>
  );
}
