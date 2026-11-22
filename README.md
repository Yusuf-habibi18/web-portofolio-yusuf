# Web Portofolio — Yusuf Habibi Herbin

Personal portfolio of **Yusuf Habibi Herbin**, Information Systems student at Institut Teknologi PLN (ITPLN), interested in **Web Development** and **Data Engineering**.

Design direction: bold editorial minimalism and Swiss grid, with a restrained cyber layer (electric blue `#2457FF`, monospace technical labels, HUD details).

## Sections

- **Hero**: oversized name behind the portrait, with a periodic glitch.
- **About**: introduction, background and quick stats.
- **Expertise**: Web Development and Data Engineering.
- **Projects**: freelance, personal and data projects, filterable by category.
- **Education**: ITPLN, GPA.
- **Contact**: email, WhatsApp, GitHub, LinkedIn.

## Interaction details

- Decoding (scramble) text, scroll-triggered reveals and magnetic buttons
- HUD cursor with live coordinates and a pointer-lit technical grid
- Flowing line backdrop that leans towards the cursor
- 3D tilt and spotlight on cards; screenshots open the live project
- Section progress rail
- Optional generative ambient soundtrack and UI sounds built with the Web Audio API (no audio files), off by default
- Every motion effect respects `prefers-reduced-motion`

## Tech stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Motion · Lenis

## Run locally

```bash
npm install
npm run dev      # development server at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
```

## Structure

```
src/
  components/      page sections (Hero, About, Expertise, Projects, Education, Contact)
  components/ui/   reusable pieces (ScrambleText, Spotlight, Magnetic, Hud, Reveal, Button…)
  components/visuals/  WaveLines and the data project visuals
  data/content.ts  all site copy and project data
  lib/             smooth scroll and the sound engine
```
