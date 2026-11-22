const ITEMS = [
  'Web Development',
  'Data Engineering',
  'Node.js',
  'MySQL',
  'Python',
  'SQL Server',
  'REST API',
  'Pandas',
  'Data Quality',
];

/**
 * Quiet editorial ticker between the hero and the content: hairline rules,
 * small tracked caps, royal blue only on the separators. Pauses on hover.
 */
export function Marquee() {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <li key={item} className="flex items-center">
          <span className="px-6 font-mono text-xs font-medium tracking-[0.14em] whitespace-nowrap text-ink uppercase md:px-9 md:text-[0.8125rem]">
            {item}
          </span>
          <span className="size-1.5 shrink-0 bg-royal" aria-hidden />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="wrap relative z-10">
      <div className="group overflow-hidden border-y border-line py-4 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] md:py-5">
        <div className="flex w-max animate-marquee [animation-duration:48s] group-hover:[animation-play-state:paused]">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
