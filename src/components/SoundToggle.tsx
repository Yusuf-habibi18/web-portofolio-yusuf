import { useEffect, useState } from 'react';
import { sound } from '../lib/sound';

const SELECTOR = 'a, button, [role="button"], [data-cursor]';

/**
 * Sound on/off button (equalizer bars). Off by default. If the visitor switched
 * it on during an earlier visit, sound resumes on their first click/key press
 * (browsers don't allow it before a gesture). While on, hovering interactive
 * elements gives a soft blip and pressing them a short click.
 */
export function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(sound.isOn());

  useEffect(() => sound.subscribe(setOn), []);

  // Resume a remembered "on" preference at the first gesture (not on the toggle itself).
  useEffect(() => {
    if (!sound.wanted()) return;
    const first = (e: Event) => {
      const t = e.target as Element | null;
      if (t?.closest('[data-sound-toggle]')) return;
      sound.setOn(true);
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener('pointerdown', first);
      window.removeEventListener('keydown', first);
    };
    window.addEventListener('pointerdown', first);
    window.addEventListener('keydown', first);
    return cleanup;
  }, []);

  // UI sounds
  useEffect(() => {
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as Element | null)?.closest(SELECTOR) ?? null;
      if (el && el !== last && !el.closest('[data-sound-toggle]')) sound.blip();
      last = el;
    };
    const press = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest(SELECTOR);
      if (el && !el.closest('[data-sound-toggle]')) sound.click();
    };
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('click', press, { passive: true });
    return () => {
      window.removeEventListener('pointerover', over);
      window.removeEventListener('click', press);
    };
  }, []);

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => sound.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      className={`group relative grid size-12 place-items-center rounded-full bg-surface/60 backdrop-blur-md transition-colors duration-300 hover:bg-surface ${className}`}
    >
      <span className="flex h-4 items-end gap-[3px]" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-[3px] origin-bottom rounded-full transition-colors duration-300 ${
              on ? 'animate-eq bg-royal' : 'bg-ink/45'
            }`}
            style={{
              height: on ? '100%' : `${[35, 55, 45, 30][i]}%`,
              animationDelay: `${i * -0.27}s`,
              animationDuration: `${0.9 + i * 0.17}s`,
            }}
          />
        ))}
      </span>
      {/* small slash when muted */}
      {!on && <span className="absolute h-[1.5px] w-6 rotate-[-35deg] rounded-full bg-ink/60" aria-hidden />}
    </button>
  );
}
