import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { MouseEvent } from 'react';
import { contact, cv, profile } from '../data/content';
import { scrollToId } from '../lib/scroll';
import { ArrowUp, ArrowUpRight, Chat, Check, Copy, FileText, Github, Linkedin } from './ui/Icons';
import { GlowOrb } from './ui/Light';
import { Magnetic } from './ui/Magnetic';
import { Reveal, WordsReveal } from './ui/Reveal';
import { ScrambleText } from './ui/ScrambleText';

export function Contact() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  const toTop = (e: MouseEvent) => {
    e.preventDefault();
    scrollToId('top');
  };

  const socials = [
    { label: 'WhatsApp', value: contact.phone.label, href: contact.whatsapp.href, icon: <Chat size={22} /> },
    { label: 'GitHub', value: contact.github.label, href: contact.github.href, icon: <Github size={22} /> },
    { label: 'LinkedIn', value: contact.linkedin.label, href: contact.linkedin.href, icon: <Linkedin size={22} /> },
    { label: 'Curriculum Vitae', value: 'PDF · English', href: cv.en.href, icon: <FileText size={22} /> },
  ];

  return (
    <section id="contact" className="grid-dark relative overflow-hidden bg-ink text-paper" aria-label="Contact">
      {/* aurora: blue light pooling behind the heading and along the bottom */}
      <GlowOrb className="top-[24%] left-[64%] size-[min(120vw,960px)]" strength={0.34} />
      <GlowOrb className="top-[88%] left-[10%] size-[min(110vw,760px)]" strength={0.2} delay={4.5} />
      <div className="wrap pt-24 pb-10 md:pt-36">
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-slate">
            <span className="mono text-royal-soft">[05]</span>
            <span className="h-px w-8 bg-gradient-to-r from-signal to-signal/0" aria-hidden />
            <ScrambleText text="Contact" trigger="view" delay={150} duration={600} pendingClassName="text-royal-soft/60" />
          </p>
        </Reveal>

        <h2 className="mt-8 font-display text-[clamp(3.5rem,15vw,13rem)] leading-[0.85] font-bold tracking-[-0.055em]">
          <WordsReveal text="Let's talk." accent={['talk']} />
        </h2>

        <div className="mt-12 grid gap-12 md:mt-16 md:grid-cols-12 md:gap-8">
          <Reveal className="md:col-span-5">
            <p className="text-lg leading-relaxed text-paper/70">
              I am {profile.status.toLowerCase()} in web development and data engineering. Email or WhatsApp is the best way to
              reach me.
            </p>
          </Reveal>

          <div className="md:col-span-7">
            <Reveal delay={0.1}>
              <div className="flex flex-wrap items-center gap-3 border-b border-paper/20 pb-6">
                <a
                  href={`mailto:${contact.email}`}
                  className="group relative font-display text-[clamp(1.35rem,3.6vw,2.6rem)] font-medium tracking-[-0.02em] break-all"
                >
                  <ScrambleText text={contact.email} replayOnHover duration={700} pendingClassName="text-royal-soft/70" />
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-right scale-x-0 bg-royal transition-transform duration-500 ease-out-expo group-hover:origin-left group-hover:scale-x-100" />
                </a>
                <button
                  type="button"
                  onClick={copy}
                  className="relative grid size-11 shrink-0 place-items-center rounded-full border border-paper/25 transition-colors hover:border-paper hover:bg-paper hover:text-ink"
                  aria-label={copied ? 'Email copied' : 'Copy email address'}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      role="status"
                      className="mono text-royal-soft"
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Copied
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>

            <ul>
              {socials.map((s, i) => (
                <Reveal as="li" key={s.label} delay={0.15 + i * 0.08}>
                  <a
                    href={s.href}
                    {...(s.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : s.href.endsWith('.pdf') ? { download: '' } : {})}
                    className="group flex items-center justify-between gap-4 border-b border-paper/20 py-6"
                  >
                    <span className="flex items-center gap-4">
                      <span className="text-paper/60 transition-colors group-hover:text-royal">{s.icon}</span>
                      <span>
                        <span className="block font-display text-2xl font-medium tracking-[-0.02em] transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                          {s.label}
                        </span>
                        <span className="block font-mono text-xs text-slate">{s.value}</span>
                      </span>
                    </span>
                    <Magnetic strength={0.4}>
                      <span className="grid size-11 place-items-center rounded-full bg-paper/10 transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:bg-royal">
                        <ArrowUpRight size={18} />
                      </span>
                    </Magnetic>
                  </a>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>

        <footer className="mt-24 flex flex-col-reverse items-start justify-between gap-6 border-t border-paper/15 pt-8 text-sm text-slate sm:flex-row sm:items-center md:mt-36">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {profile.fullName}. Designed &amp; built with React and Tailwind CSS.
            </p>
            <p className="flex flex-wrap gap-x-4 gap-y-1">
              <a href={`mailto:${contact.email}`} className="text-paper/80 transition-colors hover:text-royal">
                {contact.email}
              </a>
              <a href={contact.phone.href} className="text-paper/80 transition-colors hover:text-royal">
                {contact.phone.label}
              </a>
              <a
                href={contact.whatsapp.href}
                target="_blank"
                rel="noreferrer"
                className="text-paper/80 transition-colors hover:text-royal"
              >
                WhatsApp ↗
              </a>
            </p>
          </div>
          <a href="#top" onClick={toTop} className="group inline-flex items-center gap-2 text-paper">
            Back to top
            <span className="grid size-9 place-items-center rounded-full border border-paper/25 transition-colors group-hover:border-royal group-hover:bg-royal">
              <ArrowUp size={16} />
            </span>
          </a>
        </footer>
      </div>
    </section>
  );
}
