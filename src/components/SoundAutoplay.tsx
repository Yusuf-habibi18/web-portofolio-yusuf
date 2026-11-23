import { useEffect } from 'react';
import { sound } from '../lib/sound';

const SELECTOR = 'a, button, [role="button"], [data-cursor]';

/**
 * Always-on backsound (no UI). It tries to start as soon as the page opens; when
 * the browser blocks audio until a gesture (most do), it starts on the visitor's
 * first click / tap / key press anywhere. While it plays, hovering interactive
 * elements gives a soft blip and pressing them a short click.
 */
export function SoundAutoplay() {
  // Autostart, falling back to the first gesture.
  useEffect(() => {
    let done = false;
    const first = () => {
      if (done) return;
      done = true;
      sound.setOn(true);
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener('pointerdown', first, true);
      window.removeEventListener('keydown', first, true);
      window.removeEventListener('touchend', first, true);
    };
    window.addEventListener('pointerdown', first, true);
    window.addEventListener('keydown', first, true);
    window.addEventListener('touchend', first, true);
    sound.tryAutostart().then((ok) => {
      if (ok) {
        done = true;
        cleanup();
      }
    });
    return cleanup;
  }, []);

  // UI sounds
  useEffect(() => {
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest(SELECTOR) ?? null;
      if (el && el !== last) sound.blip();
      last = el;
    };
    const press = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest(SELECTOR)) sound.click();
    };
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('click', press, { passive: true });
    return () => {
      window.removeEventListener('pointerover', over);
      window.removeEventListener('click', press);
    };
  }, []);

  return null;
}
