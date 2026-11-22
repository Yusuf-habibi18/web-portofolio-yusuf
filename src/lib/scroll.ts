import Lenis from 'lenis';

let lenis: Lenis | null = null;

/** Starts Lenis smooth scrolling unless the user prefers reduced motion. */
export function initSmoothScroll(): () => void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  lenis = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 1 });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
}

/** Scrolls to a section id ("top" scrolls to the page start). */
export function scrollToId(id: string) {
  const target = id === 'top' ? 0 : document.getElementById(id);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: id === 'top' ? 0 : -72, duration: 1.3 });
    return;
  }
  if (target === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
  else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
