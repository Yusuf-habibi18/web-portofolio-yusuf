import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
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

// The 3D portrait (WebGL) loads separately, after the hero is on screen.
const Portrait3D = lazy(() => import('./Portrait3D'));

const EASE = [0.16, 1, 0.3, 1] as const;
/** Phones: the two hero buttons sit side by side, each half the width. */
const phoneBtn =
  'whitespace-nowrap max-sm:w-full max-sm:justify-between max-sm:gap-2 max-sm:pl-4 max-sm:text-sm max-[380px]:gap-1 max-[380px]:pr-1.5 max-[380px]:pl-3.5 max-[380px]:text-[0.8125rem]';
const NAME = profile.firstName.toUpperCase().split('');

const nameClass =
  'pointer-events-none relative select-none whitespace-nowrap text-center font-display font-bold leading-[0.8] tracking-[-0.065em] ' +
  'text-[30.5vw] lg:absolute lg:inset-x-0 lg:top-[21%] lg:text-[min(27vw,50svh)]';

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

  // 3D portrait: mounted once the entrance animation has finished, then it replaces the flat photo.
  const [imgEl, setImgEl] = useState<HTMLImageElement | null>(null);
  const focusRef = useRef<HTMLSpanElement>(null);
  const [want3D, setWant3D] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [no3D, setNo3D] = useState(false);
  useEffect(() => {
    if (!ready || reduce || !imgEl) return;
    const go3D = () => setWant3D(true);
    let t = 0;
    const start = () => (t = window.setTimeout(go3D, 1900));
    if (imgEl.complete) start();
    else imgEl.addEventListener('load', start, { once: true });
    return () => {
      window.clearTimeout(t);
      imgEl.removeEventListener('load', start);
    };
  }, [ready, reduce, imgEl]);

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

  /** Rotating "scroll to explore" badge (laptop: bottom-right; phones: bottom-right of the portrait frame). */
  const badge = (id: string, size: string, inner: string, arrow: number) => (
    <a
      href="#about"
      onClick={go('about')}
      className={`group relative grid place-items-center rounded-full ${size}`}
      aria-label="Scroll to About section"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_16s_linear_infinite]" aria-hidden>
        <defs>
          <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        {/* outer orbit with a small blue marker travelling round */}
        <circle cx="50" cy="50" r="47" fill="none" className="stroke-royal/25" strokeWidth="0.6" />
        <circle cx="50" cy="3" r="1.8" className="fill-royal" />
        <text className="fill-ink font-display text-[9.2px] font-medium tracking-[0.22em] uppercase">
          <textPath href={`#${id}`}>Scroll to explore · Web &amp; Data ·</textPath>
        </text>
      </svg>
      <span className={`grid place-items-center rounded-full bg-ink text-paper transition-colors duration-300 group-hover:bg-royal ${inner}`}>
        <ArrowDown size={arrow} className="transition-transform duration-500 group-hover:translate-y-0.5" />
      </span>
    </a>
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
      <div className="wrap pointer-events-none absolute inset-0 grid grid-cols-4" aria-hidden>
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
            className="absolute top-[62%] -translate-x-1/2 -translate-y-1/2 text-royal/50"
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
          className="mono flex basis-full items-center gap-2 text-muted lg:basis-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: EASE, delay: 0.65 }}
        >
          <span className="text-royal-ink">Status:</span>
          <ScrambleText text={profile.status} start={ready} delay={650} duration={900} pendingClassName="text-royal/50" />
          <span className="h-3 w-[0.45em] bg-royal animate-blink" aria-hidden />
        </motion.p>
      </motion.div>

      {/* Stage: on phones the name and portrait share one frame (like the laptop); on desktop everything is positioned on the section */}
      <div className="relative mt-4 min-h-[420px] flex-1 lg:static lg:mt-0">
      {/* Oversized name behind the portrait: stays put (no scroll drift / pointer parallax); only the glitch bursts move it */}
      <div className="absolute inset-x-0 top-[2%] z-0 lg:static">
        <h1 className={`${nameClass} text-ink`}>
          <span className="sr-only">{profile.fullName}</span>
          <span aria-hidden className={`relative inline-block ${glitch ? 'animate-glitch-base' : ''}`}>
            {letters()}
          </span>
          {/* white shine inside the black letters: a glossy top sheen + a light streak that sweeps across */}
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-0 transition-opacity duration-[1600ms] ${ready ? 'opacity-100' : 'opacity-0'}`}
          >
            {ghost('name-gloss')}
            {ghost('name-shine animate-name-shine')}
          </span>
          {/* cyber glitch burst every 5s; at rest the name is clean black */}
          {glitch && (
            <>
              {ghost('text-royal animate-glitch-a')}
              {ghost('text-paper animate-glitch-b')}
            </>
          )}
        </h1>
      </div>

      {/* Portrait */}
      <motion.div
        style={{ y: portraitY, x: is3D ? 0 : portraitX, rotate: is3D ? 0 : portraitTilt }}
        className="absolute bottom-0 left-1/2 z-10 h-full w-auto origin-bottom -translate-x-1/2 lg:h-[88%]"
        onClick={() => setScanKey((k) => k + 1)}
      >
        {/* gentle float on phones/tablets so the portrait never sits still */}
        <div className={`relative h-full ${reduce ? '' : 'max-lg:animate-float'}`}>
        {/* rim light: a thin signal-blue edge + soft halo following the silhouette */}
        <div className={`rim-light h-full transition-opacity duration-500 ${is3D ? 'opacity-0' : ''}`}>
        <motion.img
          ref={setImgEl}
          src={portrait}
          srcSet={`${portraitSm} 640w, ${portrait} 1000w, ${portraitLg} 1400w`}
          sizes="(min-width: 1024px) 520px, 70vw"
          width={1000}
          height={1811}
          alt={`Portrait of ${profile.fullName}`}
          fetchPriority="high"
          decoding="async"
          className="block h-full w-auto max-w-none [mask-image:linear-gradient(to_bottom,black_74%,transparent)] lg:[mask-image:none]"
          initial={reduce ? false : { opacity: 0, y: 80, filter: 'blur(14px)' }}
          animate={ready ? { opacity: 1, y: 0, filter: 'blur(0px)' } : undefined}
          transition={{ duration: 1.4, ease: EASE, delay: 0.25 }}
        />
        </div>

        {/* the same photo as a 3D relief: follows the pointer / sway, drag to rotate */}
        {want3D && imgEl && !no3D && (
          <Suspense fallback={null}>
            <div className={`transition-opacity duration-500 ${is3D ? 'opacity-100' : 'opacity-0'}`}>
              <Portrait3D
                img={imgEl}
                sx={sx}
                sy={sy}
                focus={focusRef.current}
                onReady={() => setIs3D(true)}
                onFail={() => {
                  setIs3D(false);
                  setNo3D(true);
                }}
              />
            </div>
          </Suspense>
        )}

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
          className="pointer-events-none absolute -inset-x-[7%] top-[2%] bottom-[9%] text-royal/55"
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
          ref={focusRef}
          className="pointer-events-none absolute top-[32.3%] left-[45.9%] z-10 aspect-square w-[13%] -translate-x-1/2 -translate-y-1/2 text-royal"
          initial={{ opacity: 0, scale: 1.8 }}
          animate={ready ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.7, ease: EASE, delay: 1.6 }}
          aria-hidden
        >
          <Corners size={7} thickness={1.5} />
        </motion.span>
        </div>
      </motion.div>

      {/* phones: scroll badge sits bottom-right of the frame, as on the laptop */}
      <motion.div
        className="wrap pointer-events-none absolute inset-x-0 bottom-14 z-20 flex justify-end lg:hidden"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={ready ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 1, ease: EASE, delay: 0.9 }}
      >
        {badge('badge-circle-m', 'pointer-events-auto size-[84px]', 'size-9', 16)}
      </motion.div>
      </div>

      {/* Bottom content */}
      <div className="wrap relative z-30 -mt-12 flex flex-col gap-8 pb-7 lg:absolute lg:inset-x-0 lg:bottom-10 lg:mt-0 lg:flex-row lg:items-end lg:justify-between lg:pb-0">
        <motion.div
          className="max-w-[24rem] xl:max-w-[26rem]"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.75 }}
        >
          <p className="eyebrow mb-4 text-royal-ink max-[400px]:text-[0.6875rem] max-[400px]:tracking-[0.12em]">{profile.positioning}</p>
          <p className="font-display text-[clamp(1.6rem,3.2vw,2.35rem)] leading-[1.05] font-medium tracking-[-0.025em] text-ink">
            {profile.headline}
          </p>
          <div className="mt-6 grid grid-cols-[1.15fr_1fr] gap-2.5 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
            <Button href="#projects" onClick={go('projects')} icon={<ArrowDown size={18} />} className={phoneBtn}>
              Explore Projects
            </Button>
            <Button href={cv.en.href} download variant="outline" icon={<ArrowDown size={18} />} className={phoneBtn}>
              Download CV
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="hidden items-end justify-between gap-6 lg:flex lg:flex-col lg:items-end"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 0.9 }}
        >
          {badge('badge-circle', 'size-28 lg:size-32', 'size-12', 20)}
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
