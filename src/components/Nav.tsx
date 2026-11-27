import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { contact, cv, navLinks, profile } from '../data/content';
import { useActiveSection } from '../hooks/useActiveSection';
import { lockScroll, scrollToId } from '../lib/scroll';
import { ArrowUpRight, WhatsApp } from './ui/Icons';
import { SoundToggle } from './SoundToggle';
import { ScrambleText } from './ui/ScrambleText';

const EASE = [0.16, 1, 0.3, 1] as const;
const ids = navLinks.map((l) => l.id);
const mobileLinks = [...navLinks, { id: 'contact', label: 'Let’s Talk' }];

export function Nav({ ready }: { ready: boolean }) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection(ids);
  const { scrollY } = useScroll();

  // Hide while scrolling down, reveal on scroll up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !open);
  });

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    const wasOpen = open;
    setOpen(false);
    // Let the menu close (and unlock scrolling) before moving.
    window.setTimeout(() => scrollToId(id), wasOpen ? 380 : 0);
  };

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50"
        initial={{ y: -110 }}
        animate={{ y: ready && !hidden ? 0 : -110 }}
        transition={{ duration: 0.7, ease: EASE, delay: ready && !scrolled ? 0.6 : 0 }}
      >
        <nav aria-label="Main" className="wrap flex items-center justify-between gap-4 pt-4 md:pt-5">
          <a
            href="#top"
            onClick={go('top')}
            className="relative z-[60] grid size-12 place-items-center rounded-full bg-ink font-display text-[0.95rem] font-bold tracking-tight text-paper transition-colors duration-300 hover:bg-royal"
            aria-label={`${profile.fullName}, back to top`}
          >
            {profile.initials}
          </a>

          <ul
            className={`hidden items-center gap-1 rounded-full p-1.5 transition-[background-color,box-shadow] duration-500 md:flex ${
              scrolled
                ? 'bg-surface/80 shadow-[0_10px_30px_-14px_rgba(17,18,22,0.35)] backdrop-blur-xl'
                : 'bg-surface/45 backdrop-blur-md'
            }`}
          >
            {navLinks.map((link) => (
              <li key={link.id} className="relative">
                {active === link.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  >
                    <span
                      className="absolute bottom-[5px] left-1/2 size-[3px] -translate-x-1/2 rounded-full bg-signal shadow-[0_0_6px_1px_rgb(117_167_255/0.7)]"
                      aria-hidden
                    />
                  </motion.span>
                )}
                <a
                  href={`#${link.id}`}
                  onClick={go(link.id)}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={`relative z-10 block rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                    active === link.id ? 'text-paper' : 'text-ink hover:text-royal-ink'
                  }`}
                >
                  <ScrambleText text={link.label} replayOnHover duration={450} pendingClassName="text-royal/60" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <SoundToggle />
            <a
              href={cv.en.href}
              download
              className="hidden h-12 items-center gap-1.5 rounded-full bg-surface/60 px-4 font-mono text-xs font-medium tracking-[0.08em] text-ink backdrop-blur-md transition-colors duration-300 hover:bg-ink hover:text-paper md:inline-flex"
              aria-label="Download CV (PDF)"
            >
              CV <span aria-hidden>↓</span>
            </a>
            <a
              href="#contact"
              onClick={go('contact')}
              className="group hidden h-12 items-center gap-2 rounded-full bg-royal pr-4 pl-6 text-sm font-medium text-surface transition-[background-color,box-shadow] duration-300 hover:bg-royal-deep hover:shadow-[0_0_34px_-2px_rgba(36,87,255,0.8)] md:inline-flex"
            >
              Let&rsquo;s Talk
              <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={`relative z-[60] grid size-12 place-items-center rounded-full transition-colors duration-300 md:hidden ${
                open ? 'bg-paper text-ink' : 'bg-ink text-paper'
              }`}
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-ink px-4 pt-28 pb-8 text-paper md:hidden"
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-col gap-1">
              {mobileLinks.map((link, i) => (
                <li key={`${link.id}-${i}`} className="overflow-hidden">
                  <motion.a
                    href={`#${link.id}`}
                    onClick={go(link.id)}
                    className={`flex items-baseline gap-4 font-display text-[clamp(2.75rem,13vw,4.5rem)] leading-[1.08] font-bold tracking-[-0.03em] ${
                      i === navLinks.length ? 'text-royal' : ''
                    }`}
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.06 }}
                  >
                    <span className="eyebrow text-slate">0{i + 1}</span>
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              className="flex flex-col gap-2 text-sm text-slate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              <a href={`mailto:${contact.email}`} className="text-paper">
                {contact.email}
              </a>
              <span className="flex flex-wrap gap-x-4">
                <a href={contact.phone.href} className="text-paper">
                  {contact.phone.label}
                </a>
                <a
                  href={contact.whatsapp.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-paper"
                >
                  <WhatsApp size={15} />
                  WhatsApp ↗
                </a>
              </span>
              <span className="flex flex-wrap gap-x-4">
                <a href={cv.en.href} download className="text-paper">
                  CV (EN) ↓
                </a>
                <a href={cv.id.href} download className="text-paper">
                  CV (ID) ↓
                </a>
                <a href={contact.github.href} target="_blank" rel="noreferrer" className="text-paper">
                  GitHub ↗
                </a>
              </span>
              <span>{profile.location}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
