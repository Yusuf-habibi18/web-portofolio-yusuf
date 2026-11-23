import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { lazy, Suspense, useId, useState } from 'react';
import type { ReactNode } from 'react';
import type { Project, ProjectLink } from '../data/content';
import { Corners } from './ui/Hud';
import { ArrowUpRight, Github } from './ui/Icons';
import { Spotlight } from './ui/Spotlight';
// Data-project visuals (incl. the WTI series) load only when the Projects section needs them.
const MedallionVisual = lazy(() => import('./visuals/MedallionVisual').then((m) => ({ default: m.MedallionVisual })));
const WtiVisual = lazy(() => import('./visuals/WtiVisual').then((m) => ({ default: m.WtiVisual })));
const VisualFallback = () => <div className="aspect-[16/10] size-full animate-pulse bg-ink/90" aria-hidden />;

const EASE = [0.16, 1, 0.3, 1] as const;

function LinkPill({ link, icon }: { link: ProjectLink; icon: 'github' | 'live' }) {
  if (!link.href) {
    // Clearly labelled placeholder: no fake URL.
    return (
      <span className="inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-ink/25 px-4 text-sm text-muted">
        {link.note ?? 'Coming soon'}
      </span>
    );
  }
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className={`group/link inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors duration-300 ${
        icon === 'live' ? 'bg-ink text-paper hover:bg-royal' : 'border border-ink/80 text-ink hover:border-royal hover:bg-royal hover:text-surface'
      }`}
    >
      {icon === 'github' && <Github size={16} />}
      {link.label}
      <ArrowUpRight size={16} className="transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
    </a>
  );
}

function Media({ project }: { project: Project }) {
  if (project.visual === 'medallion')
    return (
      <Suspense fallback={<VisualFallback />}>
        <MedallionVisual />
      </Suspense>
    );
  if (project.visual === 'wti')
    return (
      <Suspense fallback={<VisualFallback />}>
        <WtiVisual />
      </Suspense>
    );
  if (!project.image) return null;
  const { src, secondary, alt } = project.image;
  return (
    <div className="relative size-full overflow-hidden bg-surface">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={1280}
        height={800}
        className="size-full object-cover object-top transition-transform duration-[1.2s] ease-out-expo group-hover/card:scale-[1.04]"
      />
      {secondary && (
        <img
          src={secondary}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          width={1280}
          height={800}
          className="absolute inset-0 size-full object-cover object-top opacity-0 transition-opacity duration-700 group-hover/card:opacity-100"
        />
      )}
    </div>
  );
}

/** Makes the screenshot a link when there is somewhere to go; otherwise renders it as-is. */
function MediaLink({ href, label, title, children }: { href: string | null; label: string; title: string; children: ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noreferrer" data-cursor={label} aria-label={`${title}: ${label.replace(' ↗', '')}`} className="block rounded-2xl">
      {children}
    </a>
  );
}

/** Role · Problem · Solution · How I built it · Result, laid out on the editorial grid. */
function CaseStudy({ project, id }: { project: Project; id: string }) {
  const c = project.caseStudy;
  const block = (n: string, label: string, body: ReactNode) => (
    <div className="border-t border-ink/15 pt-4">
      <p className="mono flex items-center gap-2 text-muted">
        <span className="text-royal-ink">{n}</span> {label}
      </p>
      <div className="mt-3 text-[0.9375rem] leading-relaxed text-ink/85">{body}</div>
    </div>
  );
  return (
    <div id={id} className="relative mt-2 rounded-2xl bg-surface/70 p-5 ring-1 ring-ink/10 backdrop-blur-sm md:p-8">
      <Corners size={12} inset="-inset-1.5" className="text-royal/60" />
      <p className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
        <span className="mono shrink-0 text-royal-ink">Role</span>
        <span className="text-[0.9375rem] leading-snug text-ink/85">{c.role}</span>
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 md:gap-x-10 lg:grid-cols-4">
        {block('01', 'Problem', <p>{c.problem}</p>)}
        {block('02', 'Solution', <p>{c.solution}</p>)}
        {block(
          '03',
          'How I built it',
          <ul className="space-y-2">
            {c.build.map((b) => (
              <li key={b} className="flex gap-2.5">
                <span className="mt-[0.5em] size-1.5 shrink-0 bg-royal" aria-hidden />
                {b}
              </li>
            ))}
          </ul>,
        )}
        {block('04', 'Result', <p>{c.result}</p>)}
      </div>
    </div>
  );
}

export function ProjectCard({ project, index, total }: { project: Project; index: number; total: number }) {
  const reduce = useReducedMotion();
  const flip = index % 2 === 1;
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  // Screenshots open the live site (or the code) directly; interactive charts stay as they are.
  const open = project.image ? project.live?.href || project.github.href || null : null;
  const openLabel = project.live?.href ? 'Open live ↗' : 'View code ↗';
  return (
    <motion.article
      layout={!reduce}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      transition={{ layout: { duration: 0.6, ease: EASE } }}
      className="group/card grid gap-6 border-t border-ink/15 py-10 md:grid-cols-12 md:gap-10 md:py-14"
      aria-labelledby={`project-${project.id}`}
    >
      <Spotlight className={`rounded-2xl md:col-span-7 ${flip ? 'md:order-2' : ''}`} tilt={3}>
        <MediaLink href={open} label={openLabel} title={project.title}>
        <motion.div
          className={`relative overflow-hidden rounded-2xl shadow-[0_24px_60px_-35px_rgba(17,18,22,0.45)] ring-1 ring-ink/10 transition-shadow duration-500 group-hover/card:ring-royal/40 md:aspect-[16/10] ${
            project.image ? 'aspect-[16/10]' : ''
          }`}
          initial={reduce ? false : { clipPath: 'inset(12% 6% 12% 6% round 1rem)', opacity: 0.4 }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 1rem)', opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -15% 0px' }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          <Media project={project} />
          {/* Hover: faint scanlines plus a single sweep, never looping */}
          <span
            className="scanlines pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
            aria-hidden
          />
          <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <span className="absolute inset-x-0 top-0 h-full -translate-y-full bg-gradient-to-b from-transparent via-royal/10 to-transparent group-hover/card:animate-scan" />
          </span>
          <span className="mono pointer-events-none absolute top-3 left-3 rounded-[4px] bg-ink/85 px-2 py-1 text-[0.625rem] text-paper opacity-0 backdrop-blur transition-opacity duration-300 group-hover/card:opacity-100">
            Fig.{String(index + 1).padStart(2, '0')} — {project.category === 'Web Development' ? 'Web' : 'Data'}
          </span>
        </motion.div>
        </MediaLink>
        <Corners
          size={14}
          inset="-inset-2.5"
          className="text-royal opacity-0 transition-all duration-500 ease-out-expo group-hover/card:opacity-100 md:-inset-3"
          thickness={1.5}
        />
      </Spotlight>

      <motion.div
        className={`flex flex-col md:col-span-5 ${flip ? 'md:order-1' : ''}`}
        initial={reduce ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
      >
        <div className="mono flex items-center justify-between gap-4 text-muted">
          <span>
            <span className="text-ink">PRJ_{String(index + 1).padStart(2, '0')}</span> / {String(total).padStart(2, '0')}
          </span>
          <span>{project.year}</span>
        </div>

        <p className="eyebrow mt-6 text-royal-ink">{project.category}</p>
        <h3
          id={`project-${project.id}`}
          className="mt-3 font-display text-[clamp(1.9rem,3.4vw,3rem)] leading-[0.98] font-bold tracking-[-0.035em]"
        >
          {project.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-ink/70">{project.kind}</p>
        <p className="mt-5 text-[1.0625rem] leading-relaxed text-muted">{project.summary}</p>

        <ul className="mt-5 space-y-2">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[0.9375rem] leading-snug text-ink/85">
              <span className="mt-[0.45em] size-1.5 shrink-0 rounded-[1px] bg-royal" aria-hidden />
              {h}
            </li>
          ))}
        </ul>

        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies">
          {project.tech.map((t) => (
            <li key={t} className="chip text-ink/70">
              {t}
            </li>
          ))}
        </ul>

        <div className="mt-7 flex flex-wrap gap-2">
          {project.live && <LinkPill link={project.live} icon="live" />}
          <LinkPill link={project.github} icon="github" />
        </div>

        <button
          type="button"
          onClick={() => setExpanded((o) => !o)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="group/cs mono mt-6 inline-flex w-fit items-center gap-2 text-ink transition-colors hover:text-royal-ink"
        >
          <span className="grid size-6 place-items-center rounded-[4px] border border-current transition-transform duration-300">
            {expanded ? '−' : '+'}
          </span>
          {expanded ? 'Hide case study' : 'Read case study'}
          <span className="h-px w-8 bg-current opacity-40 transition-all duration-300 group-hover/cs:w-12" aria-hidden />
        </button>
      </motion.div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="case"
            className="overflow-hidden md:col-span-12 md:order-3"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <CaseStudy project={project} id={panelId} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
