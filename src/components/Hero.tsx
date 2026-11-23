import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import portrait from '../assets/portrait.webp';
import portraitSm from '../assets/portrait-sm.webp';
import portraitLg from '../assets/portrait-lg.webp';
import { cv, profile } from '../data/content';
import { useJakartaTime } from '../hooks/useClock';
import { scrollToId } from '../lib/scroll';
import { Button } from './ui/Button';
import { Corners, Crosshair } from './ui/Hud';
import { GlowOrb } from './ui/Light';
import { ScrambleText } from './ui/ScrambleText';
import { ArrowDown, MapPin } from './ui/Icons';

const EASE = [0.16, 1, 0.3, 1] as const;
const NAME = profile.firstName.toUpperCase().split('');

const nameClass =
  'pointer-events-none relative select-none whitespace-nowrap text-center font-display font-bold leading-[0.8] tracking-[-0.065em] ' +
  'text-[29vw] lg:absolute lg:inset-x-0 lg:top-[21%] lg:text-[min(27vw,50svh)]';

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const time = useJakartaTime();

  // Scroll-linked drift as the hero leaves the viewport.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const portraitY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '10%']);
  const metaOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);

  // Gentle pointer parallax on desktop only.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 50, damping: 18 });
  const sy = useSpring(py, { stiffness: 50, damping: 18 });
  const portraitX = useTransform(sx, (v) => v * 10);
  const portraitTilt = useTransform(sy, (v) => v * 6);

  // Cyber glitch on the big name: short bursts, starting once the letters have landed.
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    if (!ready || reduce) return;
    const t = window.setTimeout(() => setGlitch(true), 1500);
    return () => window.clearTimeout(t);
  }, [ready, reduce]);

  // Tap / click the portrait to replay the scan.
  const [scanKey, setScanKey] = useState(0);

  // Phones/tablets have no cursor, so the laptop's mouse parallax is replaced by:
  //  - auto-parallax: a slow left-right sway + tilt, always on;
  //  - device tilt (gyroscope, Android) which takes over while the phone is moved.
  useEffect(() => {
    if (reduce || window.matchMedia('(pointer: fine)').matches) return;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));
    let lastTilt = -Infinity;
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      lastTilt = performance.now();
      px.set(clamp(e.gamma / 25));
      py.set(clamp((e.beta - 50) / 25) * 0.5);
    };
    let raf = 0;
    const t0 = performance.now();
    const sway = (now: number) => {
      raf = requestAnimationFrame(sway);
      if (now - lastTilt < 1200) return; // gyroscope is driving
      const t = (now - t0) / 1000;
      px.set(Math.sin(t * 0.7) * 0.85);
      py.set(Math.sin(t * 0.5 + 1) * 0.35);
    };
    raf = requestAnimationFrame(sway);
    window.addEventListener('deviceorientation', onTilt);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, [reduce, px, py]);

  const fine = useRef(false);
  useEffect(() => {
    fine.current = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches;
  }, []);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (!fine.current || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };

  /** Static copy of the name with identical letter boxes, used for the glitch slices. */
  const ghost = (cls: string) => (
    <span className={`pointer-events-none absolute inset-0 ${cls}`} aria-hidden>
      {NAME.map((ch, i) => (
        <span key={i} className="inline-block pb-[0.02em] align-top">
          {ch}
        </span>
      ))}
    </span>
  );

  const letters = () =>
    NAME.map((ch, i) => (
      <span key={i} className="inline-block overflow-hidden pb-[0.02em] align-top">
        <motion.span
          className="inline-block"
          initial={reduce ? false : { y: '105%' }}
          animate={ready ? { y: '0%' } : undefined}
          transition={{ duration: 1.1, ease: EASE, delay: 0.1 + i * 0.07 }}
        >
          {ch}
        </motion.span>
      </span>
    ));

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMove}
      className="relative flex min-h-[100svh] flex-col overflow-hidden pt-24 lg:block lg:h-[100svh] lg:min-h-[680px] lg:pt-0"
      aria-label="Introduction"
    >
      {/* Back-light: a soft blue pool behind the portrait, like a stage light */}
      <GlowOrb className="top-[64%] left-1/2 size-[min(120vw,900px)] lg:top-[60%]" strength={0.3} />

      {/* Swiss grid hairlines */}
      <div className="wrap pointer-events-none absolute inset-0 hidden grid-cols-4 lg:grid" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="relative overflow-hidden border-l border-line/70 last:border-r"
            initial={{ scaleY: 0 }}
            animate={ready ? { scaleY: 1 } : undefined}
            style={{ originY: 0 }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.1 * i }}
          >
            {/* light pulse travelling down the grid line, like data on a wire */}
            <span
              className="absolute top-0 -left-px h-1/6 w-px animate-line-pulse bg-gradient-to-b from-transparent via-royal to-transparent shadow-[0_0_10px_1px_rgb(36_87_255/0.55)]"
              style={{ animationDelay: `${-i * 1.6}s` }}
            />
          </motion.span>
        ))}
        {['25%', '75%'].map((left, i) => (
          <motion.span
            key={left}
            className="absolute top-[62%] -translate-x-1/2 -translate-y-1/2 text-ink/40"
            style={{ left }}
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : undefined}
            transition={{ duration: 0.6, delay: 0.9 + i * 0.08 }}
          >
            <Crosshair />
          </motion.span>
        ))}
      </div>

      {/* Top meta row */}
      <motion.div
        style={{ opacity: metaOpacity }}
        className="wrap relative z-30 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 lg:absolute lg:inset-x-0 lg:top-28"
      >
        <motion.p
          className="eyebrow flex items-center gap-2.5 text-ink"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
        >
          <span className="relative flex size-2.5" aria-hidden>
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-royal opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-royal" />
          </span>
          <ScrambleText text={profile.role} start={ready} delay={500} duration={800} pendingClassName="text-royal/50" />
        </motion.p>
        <motion.p
          className="mono hidden items-center gap-2 text-muted sm:flex"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
        >
          <span className="text-royal-ink">Status:</span>
          <ScrambleText text={profile.status} start={ready} delay={650} duration={900} pendingClassName="text-royal/50" />
          <span className="h-3 w-[0.45em] bg-royal animate-blink" aria-hidden />
        </motion.p>
      </motion.div>

      {/* Oversized name behind the portrait: stays put (no scroll drift / pointer parallax); only the glitch bursts move it */}
      <div className="relative z-0 mt-5 lg:static lg:mt-0">
        <h1 className={`${nameClass} text-ink`}>
          <span className="sr-only">{profile.fullName}</span>
          <span aria-hidden className={`inline-block ${glitch ? 'animate-glitch-base' : ''}`}>
            {letters()}
          </span>
          {/* signature glitch look: frozen at rest, with a burst every 5s (static for reduced motion) */}
          {(glitch || (reduce && ready)) && (
            <>
              {ghost(`text-royal glitch-a-rest ${reduce ? '' : 'animate-glitch-a'}`)}
              {ghost(`text-paper glitch-b-rest ${reduce ? '' : 'animate-glitch-b'}`)}
            </>
          )}
        </h1>
      </div>

      {/* Portrait */}
      <motion.div
        style={{ y: portraitY, x: portraitX, rotate: portraitTilt }}
        className="relative z-10 mx-auto -mt-[17vw] w-[min(74vw,430px)] origin-bottom lg:absolute lg:bottom-0 lg:left-1/2 lg:mt-0 lg:h-[88%] lg:w-auto lg:-translate-x-1/2"
        onClick={() => setScanKey((k) => k + 1)}
      >
        {/* gentle float on phones/tablets so the portrait never sits still */}
        <div className={`relative lg:h-full ${reduce ? '' : 'max-lg:animate-float'}`}>
        <motion.img
          src={portrait}
          srcSet={`${portraitSm} 640w, ${portrait} 1000w, ${portraitLg} 1400w`}
          sizes="(min-width: 1024px) 520px, 74vw"
          width={1000}
          height={1811}
          alt={`Portrait of ${profile.fullName}`}
          fetchPriority="high"
          decoding="async"
          className="block h-auto w-full [mask-image:linear-gradient(to_bottom,black_70%,transparent)] lg:h-full lg:w-auto lg:[mask-image:none]"
          initial={reduce ? false : { opacity: 0, y: 80, filter: 'blur(14px)' }}
          animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
          transition={{ duration: 1.4, ease: EASE, delay: 0.25 }}
        />

        {/* One scan pass over the portrait as the site opens */}
        {!reduce && (
          <motion.span
            key={scanKey}
            className="pointer-events-none absolute -inset-x-[6%] h-[2px] bg-royal shadow-[0_0_14px_2px_rgb(36_87_255/0.45)]"
            initial={{ top: '0%', opacity: 0 }}
            animate={ready ? { top: ['0%', '100%'], opacity: [0, 1, 1, 0] } : undefined}
            transition={{
              top: { duration: 1.4, ease: [0.45, 0, 0.25, 1], delay: scanKey ? 0 : 0.35 },
              opacity: { duration: 1.4, times: [0, 0.06, 0.9, 1], delay: scanKey ? 0 : 0.35 },
            }}
            aria-hidden
          />
        )}

        {/* Viewfinder frame (labels on desktop only) */}
        <motion.span
          className="pointer-events-none absolute -inset-x-[7%] top-[2%] bottom-[9%] text-ink/35"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 1.2, ease: EASE, delay: 1.1 }}
          aria-hidden
        >
          <Corners size={22} />
          <span className="mono absolute -top-6 left-0 hidden text-[0.625rem] text-muted lg:block">Fig.01 — Portrait</span>
          <span className="mono absolute right-0 -bottom-6 hidden text-[0.625rem] text-muted lg:block">
            Subj. {profile.fullName}
          </span>
        </motion.span>

        {/* Focus point locked on the blue rose: the accent colour comes from here */}
        <motion.span
          className="pointer-events-none absolute top-[32.3%] left-[45.9%] aspect-square w-[13%] -translate-x-1/2 -translate-y-1/2 text-royal"
          initial={{ opacity: 0, scale: 1.8 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.7, ease: EASE, delay: 1.6 }}
          aria-hidden
        >
          <Corners size={7} thickness={1.5} />
        </motion.span>
        </div>
      </motion.div>

      {/* Bottom content */}
      <div className="wrap relative z-30 -mt-20 flex flex-1 flex-col justify-end gap-8 pb-8 lg:absolute lg:inset-x-0 lg:bottom-10 lg:mt-0 lg:flex-row lg:items-end lg:justify-between lg:pb-0">
        <motion.div
          className="max-w-[24rem] xl:max-w-[26rem]"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.75 }}
        >
          <p className="eyebrow mb-4 text-royal-ink">{profile.positioning}</p>
          <p className="font-display text-[clamp(1.6rem,3.2vw,2.35rem)] leading-[1.05] font-medium tracking-[-0.025em] text-ink">
            {profile.headline}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button href="#projects" onClick={go('projects')} icon={<ArrowDown size={18} />}>
              Explore Projects
            </Button>
            <Button href={cv.en.href} download variant="outline" icon={<ArrowDown size={18} />}>
              Download CV
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="flex items-end justify-between gap-6 lg:flex-col lg:items-end"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
        >
          <a
            href="#about"
            onClick={go('about')}
            className="group relative grid size-28 place-items-center rounded-full lg:size-32"
            aria-label="Scroll to About section"
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_16s_linear_infinite]" aria-hidden>
              <defs>
                <path id="badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
              </defs>
              <text className="fill-ink font-display text-[9.2px] font-medium tracking-[0.22em] uppercase">
                <textPath href="#badge-circle">Scroll to explore · Web &amp; Data ·</textPath>
              </text>
            </svg>
            <span className="grid size-12 place-items-center rounded-full bg-ink text-paper transition-colors duration-300 group-hover:bg-royal">
              <ArrowDown size={20} className="transition-transform duration-500 group-hover:translate-y-0.5" />
            </span>
          </a>
          <div className="flex flex-col items-end gap-1.5 text-right">
            <p className="mono text-muted">
              06°12′S <span className="text-ink/30">/</span> 106°50′E
            </p>
            <p className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={16} className="text-royal" />
              {profile.location}
              <span className="mono text-ink/70">
                <time aria-label="Local time in Jakarta">{time}</time> WIB
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
