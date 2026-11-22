/**
 * Small HUD-style details. They are decorative only (aria-hidden) and stay
 * deliberately quiet: thin strokes, no glow, colour from `currentColor`.
 */

type CornersProps = {
  /** Corner arm length in px. */
  size?: number;
  /** Stroke width in px. */
  thickness?: number;
  /** Extra classes on the wrapper, e.g. colour or group-hover transitions. */
  className?: string;
  /** Inset utility for the frame relative to its parent (default: flush). */
  inset?: string;
};

const CORNERS = [
  { pos: 'top-0 left-0', sides: ['Top', 'Left'] },
  { pos: 'top-0 right-0', sides: ['Top', 'Right'] },
  { pos: 'bottom-0 left-0', sides: ['Bottom', 'Left'] },
  { pos: 'bottom-0 right-0', sides: ['Bottom', 'Right'] },
] as const;

/** Four L-shaped viewfinder corners that frame their (relative) parent. */
export function Corners({ size = 12, thickness = 1, className = '', inset = 'inset-0' }: CornersProps) {
  return (
    <span className={`pointer-events-none absolute ${inset} ${className}`} aria-hidden>
      {CORNERS.map(({ pos, sides }) => (
        <span
          key={pos}
          className={`absolute border-0 border-solid border-current ${pos}`}
          style={{
            width: size,
            height: size,
            ...Object.fromEntries(sides.map((s) => [`border${s}Width`, thickness])),
          }}
        />
      ))}
    </span>
  );
}

/** A thin "+" registration mark. */
export function Crosshair({ className = '', size = 11 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 11 11"
      width={size}
      height={size}
      className={`pointer-events-none ${className}`}
      aria-hidden
    >
      <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
