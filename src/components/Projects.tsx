import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useState } from 'react';
import { projects } from '../data/content';
import type { Project } from '../data/content';
import { ProjectCard } from './ProjectCard';
import { Reveal } from './ui/Reveal';
import { SectionHeading } from './ui/SectionHeading';
import { Deco } from './deco/Deco';
import { TechCoords } from './deco/Graphics';
import { LitGrid } from './ui/Backdrop';

type Filter = 'All' | Project['category'];
const FILTERS: Filter[] = ['All', 'Web Development', 'Data Engineering'];

export function Projects() {
  const [filter, setFilter] = useState<Filter>('All');
  const list = filter === 'All' ? projects : projects.filter((p) => p.category === filter);
  const count = (f: Filter) => (f === 'All' ? projects.length : projects.filter((p) => p.category === f).length);

  return (
    <section id="projects" className="relative py-24 md:py-36" aria-label="Featured projects">
      {/* the page grid lights up gently while this section is on screen */}
      <LitGrid />
      <div className="wrap">
        <SectionHeading
          index="03"
          label="Selected work"
          title="Things I have built with code and data."
          accent={['built']}
          deco={
            <Deco delay={0.3} depth={6} float={0}>
              <TechCoords
                lines={[
                  ['IDX', '05 ENTRIES'],
                  ['CAT', 'WEB · DATA'],
                  ['GRD', 'X 0384 · Y 1207'],
                ]}
              />
            </Deco>
          }
        />

        <Reveal className="mt-12 md:mt-16">
          <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  className={`relative h-11 rounded-full px-5 text-sm font-medium transition-[color,box-shadow] duration-300 ${
                    active ? 'text-paper' : 'text-ink ring-1 ring-ink/20 ring-inset hover:ring-royal/70 hover:shadow-[0_0_18px_-6px_rgb(36_87_255/0.55)]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-full bg-ink"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {f}
                    <sup className={`ml-1 font-display ${active ? 'text-paper/60' : 'text-muted'}`}>{count(f)}</sup>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-10 border-b border-ink/15 md:mt-14">
          <LayoutGroup>
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} total={list.length} />
              ))}
            </AnimatePresence>
          </LayoutGroup>
        </div>
      </div>
    </section>
  );
}
