import { useEffect, useState } from 'react';
import { About } from './components/About';
import { AmbientWaves } from './components/AmbientWaves';
import { Contact } from './components/Contact';
import { CyberCursor } from './components/CyberCursor';
import { Education } from './components/Education';
import { Expertise } from './components/Expertise';
import { Hero } from './components/Hero';
import { Marquee } from './components/Marquee';
import { Nav } from './components/Nav';
import { Projects } from './components/Projects';
import { ScrollHud } from './components/ScrollHud';
import { initSmoothScroll } from './lib/scroll';

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => initSmoothScroll(), []);

  // No intro screen: start the entrance animations once the fonts are in
  // (so the big type doesn't jump), with a short cap so it never waits long.
  useEffect(() => {
    let off = false;
    const go = () => !off && setReady(true);
    const cap = window.setTimeout(go, 700);
    document.fonts?.ready.then(go);
    return () => {
      off = true;
      window.clearTimeout(cap);
    };
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>
      <AmbientWaves ready={ready} />
      <Nav ready={ready} />
      {ready && <CyberCursor />}
      <ScrollHud ready={ready} />
      <main id="main">
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Expertise />
        <Projects />
        <Education />
        <Contact />
      </main>
    </>
  );
}
