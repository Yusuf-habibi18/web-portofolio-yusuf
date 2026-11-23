import { useEffect, useState } from 'react';
import { sound } from '../lib/sound';

/**
 * Sound on/off button with equalizer bars. Sound starts automatically on every
 * visit (see SoundAutoplay); this button lets the visitor pause / resume it for
 * the current tab. It is not remembered, so the next visit starts with sound again.
 */
export function SoundToggle({ className = '' }: { className?: string }) {
  const [on, setOn] = useState(sound.isOn());
  useEffect(() => sound.subscribe(setOn), []);

  return (
    <button
      type="button"
      data-sound-toggle
      onClick={() => sound.toggle()}
      aria-pressed={on}
      aria-label={on ? 'Turn sound off' : 'Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      className={`group relative grid size-12 place-items-center rounded-full bg-surface/60 backdrop-blur-md transition-[background-color,box-shadow] duration-300 hover:bg-surface ${
        on ? 'shadow-[0_0_0_1px_rgb(36_87_255/0.25),0_6px_20px_-8px_rgb(36_87_255/0.6)]' : ''
      } ${className}`}
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
