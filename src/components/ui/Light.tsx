/**
 * Electric-blue lighting details. Gradients + opacity/transform only (no blur
 * filters), so they stay cheap; all decorative and frozen for reduced motion.
 */

type OrbProps = {
  /** Position/size utilities, e.g. "left-1/2 top-1/3 size-[60vw]". The orb is centred on that point. */
  className?: string;
  /** Peak opacity of the light's core (0–1). */
  strength?: number;
  /** Seconds to offset the breathing so several orbs don't pulse together. */
  delay?: number;
  /** Let the light wander slowly around its spot. */
  drift?: boolean;
};

/** A soft, slowly breathing pool of blue light, centred on its left/top point. */
export function GlowOrb({ className = '', strength = 0.35, delay = 0, drift = false }: OrbProps) {
  const orb = (
    <span
      className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow-breathe ${className}`}
      style={{
        // electric-blue core falling off through signal blue, like real light
        background: `radial-gradient(closest-side, rgb(36 87 255 / ${strength}), rgb(117 167 255 / ${strength * 0.42}) 52%, transparent 100%)`,
        animationDelay: `${-delay}s`,
      }}
      aria-hidden
    />
  );
  if (!drift) return orb;
  return (
    <span className="pointer-events-none absolute inset-0 animate-ambient-drift" style={{ animationDelay: `${-delay * 3}s` }} aria-hidden>
      {orb}
    </span>
  );
}

/** A hairline divider with a bright blue segment sweeping across it. */
export function LightBeam({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div className={`pointer-events-none relative h-px overflow-hidden bg-royal/15 ${className}`} aria-hidden>
      <span
        className="absolute inset-y-0 left-0 w-1/4 animate-beam bg-gradient-to-r from-transparent via-royal to-transparent shadow-[0_0_12px_2px_rgb(36_87_255/0.6)]"
        style={{ animationDelay: `${-delay}s` }}
      />
    </div>
  );
}
