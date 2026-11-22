import { motion } from 'motion/react';

const EASE = [0.16, 1, 0.3, 1] as const;

// Real output of gold_survival_by_class_sex (Titanic dataset, 891 passengers).
const DATA = [
  { cls: 'Class 1', female: 96.8, male: 36.9 },
  { cls: 'Class 2', female: 92.1, male: 15.7 },
  { cls: 'Class 3', female: 50.0, male: 13.5 },
];
const FEMALE = '#6E8CF0';
const MALE = '#CC7A33';

const LAYERS = [
  { name: 'Bronze', table: 'dbo.titanic', note: '891 raw rows', checks: 6 },
  { name: 'Silver', table: 'titanic_silver', note: 'cleaned + flagged', checks: 7 },
  { name: 'Gold', table: '3 aggregate tables', note: 'analysis-ready', checks: 4 },
];

const fmt = (v: number) => v.toFixed(1);

/** Pipeline diagram plus one real gold-layer result, drawn from the project's numbers. */
export function MedallionVisual() {
  return (
    <div className="flex h-full flex-col gap-5 bg-ink p-5 text-paper sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow text-slate">SQL Server · T-SQL</p>
        <p className="rounded-full border border-[#6E8CF0]/50 px-3 py-1 font-display text-xs font-medium text-[#A9BBF7]">
          11 / 11 checks pass
        </p>
      </div>

      <ol className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Pipeline layers">
        {LAYERS.map((l, i) => (
          <motion.li
            key={l.name}
            className="relative rounded-xl border border-paper/15 bg-paper/[0.04] p-3 sm:p-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.15 }}
          >
            <p className="font-display text-sm font-bold sm:text-base">{l.name}</p>
            <p className="mt-1 truncate font-mono text-[0.6875rem] text-slate">{l.table}</p>
            <p className="mt-2 hidden text-xs text-paper/70 sm:block">{l.note}</p>
            <p className="mt-2 text-[0.6875rem] text-[#A9BBF7]">{l.checks} checks</p>
            {i < LAYERS.length - 1 && (
              <span
                className="absolute top-1/2 -right-2 z-10 grid size-4 -translate-y-1/2 place-items-center rounded-full bg-royal text-[0.6rem] text-surface sm:-right-2.5 sm:size-5"
                aria-hidden
              >
                →
              </span>
            )}
          </motion.li>
        ))}
      </ol>

      <figure className="flex min-h-0 flex-1 flex-col">
        <figcaption className="flex flex-wrap items-center justify-between gap-2 text-xs text-paper/70">
          <span className="font-mono">gold_survival_by_class_sex · survival rate</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: FEMALE }} /> Female
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: MALE }} /> Male
            </span>
          </span>
        </figcaption>
        <div className="mt-3 grid min-h-[120px] flex-1 grid-cols-3 gap-4 border-b border-paper/25 sm:gap-6">
          {DATA.map((d, gi) => (
            <div key={d.cls} className="flex items-end justify-center gap-[2px]">
              {(['female', 'male'] as const).map((k, bi) => (
                <div key={k} className="group/bar flex h-full w-full max-w-12 flex-col justify-end">
                  <span className="mb-1 text-center font-display text-[0.6875rem] font-medium text-paper sm:text-xs">
                    {fmt(d[k])}%
                  </span>
                  <motion.span
                    className="block rounded-t-[4px] transition-opacity group-hover/bar:opacity-80"
                    style={{ background: k === 'female' ? FEMALE : MALE, originY: 1 }}
                    title={`${d.cls}, ${k}: ${fmt(d[k])}% survived`}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${d[k] * 0.78}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.4 + gi * 0.12 + bi * 0.06 }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-4 text-center text-xs text-paper/70 sm:gap-6">
          {DATA.map((d) => (
            <span key={d.cls}>{d.cls}</span>
          ))}
        </div>
      </figure>
    </div>
  );
}
