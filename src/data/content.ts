/**
 * All site copy lives here so it can be updated without touching components.
 * Every claim below comes from a verified project — keep it that way.
 * Values marked `null` render as clearly labelled placeholders.
 */
import asuransi from '../assets/projects/asuransi.webp';
import asuransiCalc from '../assets/projects/asuransi-kalkulator.webp';
import kaseraDashboard from '../assets/projects/kasera-dashboard.webp';
import kaseraKasir from '../assets/projects/kasera-kasir.webp';
import iotDashboard from '../assets/projects/iot-dashboard.webp';

export const profile = {
  firstName: 'Yusuf',
  fullName: 'Yusuf Habibi Herbin',
  initials: 'YH',
  role: 'Information Systems Student',
  positioning: 'Web Developer & Aspiring Data Engineer',
  headline: 'Building Digital Experiences & Data Solutions.',
  location: 'Jakarta, Indonesia',
  status: 'Open to internship opportunities',
};

export const contact = {
  email: 'yusufhbbherbin@gmail.com',
  phone: { label: '+62 813-6430-0718', href: 'tel:+6281364300718' },
  /** Same number on WhatsApp, with a short opening message pre-filled. */
  whatsapp: { label: 'WhatsApp', href: 'https://wa.me/6281364300718?text=Halo%20Yusuf%2C%20saya%20melihat%20portofolio%20Anda%20dan%20ingin%20berdiskusi.' },
  github: { label: 'github.com/Yusuf-habibi18', href: 'https://github.com/Yusuf-habibi18' },
  linkedin: {
    label: 'linkedin.com/in/yusufhabibiherbin',
    href: 'https://www.linkedin.com/in/yusufhabibiherbin',
  },
};

export const about = {
  statement:
    'I build web applications and data pipelines — from the database schema to the screen a user actually touches.',
  paragraphs: [
    'I am a fifth-semester Information Systems student at Institut Teknologi PLN. Most of what I know I learned by building: a paid website for a real client, a full-stack point-of-sale system for a working café, and data pipelines in Python and SQL.',
    'I enjoy the moment a messy dataset becomes something reliable, and the moment an interface finally feels obvious to use. I am looking for an internship where I can learn from experienced engineers and contribute to real systems.',
  ],
  stats: [
    { value: 3.81, decimals: 2, suffix: '', label: 'GPA, semesters 1–4' },
    { value: 5, decimals: 0, suffix: '', label: 'Projects in this portfolio' },
    { value: 1, decimals: 0, suffix: '', label: 'Paid freelance client' },
  ],
};

export type ExpertiseItem = { title: string; detail: string; tools: string[] };
export type ExpertiseGroup = {
  id: 'web' | 'data';
  index: string;
  title: string;
  intro: string;
  items: ExpertiseItem[];
};

export const expertise: ExpertiseGroup[] = [
  {
    id: 'web',
    index: '01',
    title: 'Web Development',
    intro: 'Interfaces, APIs and the databases behind them.',
    items: [
      {
        title: 'Frontend Development',
        detail: 'Responsive, accessible pages and dashboards that work from 320px phones to laptops.',
        tools: ['HTML', 'CSS', 'JavaScript', 'React (basic)', 'Tailwind CSS'],
      },
      {
        title: 'Backend Development',
        detail: 'REST APIs with authentication, role-based access and server-side validation.',
        tools: ['Node.js', 'Express', 'REST API', 'JWT', 'bcrypt'],
      },
      {
        title: 'Database Management',
        detail: 'Relational schemas with foreign keys, indexes and transactions.',
        tools: ['MySQL', 'SQL Server', 'Relational design'],
      },
    ],
  },
  {
    id: 'data',
    index: '02',
    title: 'Data Engineering',
    intro: 'Collecting, cleaning and validating data so it can be trusted.',
    items: [
      {
        title: 'Python',
        detail: 'Web scraping and data wrangling in notebooks.',
        tools: ['requests', 'BeautifulSoup', 'Pandas', 'Jupyter'],
      },
      {
        title: 'Data Processing',
        detail: 'Type validation, duplicate and missing-value checks, data quality flags.',
        tools: ['Data cleaning', 'Data quality checks'],
      },
      {
        title: 'ETL Concepts',
        detail: 'Layered bronze → silver → gold pipelines that can be re-run safely.',
        tools: ['Medallion architecture', 'Validation logs'],
      },
      {
        title: 'SQL',
        detail: 'Aggregations and reconciliation checks between pipeline layers.',
        tools: ['T-SQL', 'MySQL', 'Aggregations'],
      },
    ],
  },
];

export type ProjectLink = { label: string; href: string | null; note?: string };
export type Project = {
  id: string;
  title: string;
  category: 'Web Development' | 'Data Engineering';
  kind: string;
  year: string;
  summary: string;
  highlights: string[];
  tech: string[];
  image?: { src: string; alt: string; secondary?: string };
  visual?: 'medallion' | 'wti';
  github: ProjectLink;
  /** Omit when a live demo does not apply. */
  live?: ProjectLink;
  /** Recruiter-facing story. Facts only: taken from the CV and verified project notes. */
  caseStudy: {
    role: string;
    problem: string;
    solution: string;
    build: string[];
    result: string;
  };
};

/** Downloadable CVs (static files in public/cv). */
export const cv = {
  en: { label: 'CV (English)', href: 'cv/Yusuf-Habibi-Herbin-CV-EN.pdf' },
  id: { label: 'CV (Bahasa Indonesia)', href: 'cv/Yusuf-Habibi-Herbin-CV-ID.pdf' },
};

export const projects: Project[] = [
  {
    id: 'insurance',
    title: 'Insurance Consultant Website',
    category: 'Web Development',
    kind: 'Freelance · Paid client',
    year: 'Nov 2026',
    summary:
      'A bilingual website for an independent insurance consultant that introduces their services and routes prospective clients to a WhatsApp consultation.',
    highlights: [
      '20+ pages in Indonesian and English',
      'Protection-gap calculator and validated consultation form',
      '200+ internal links checked by my own QA script before handover',
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'SEO basics'],
    image: {
      src: asuransi,
      secondary: asuransiCalc,
      alt: 'Homepage of the insurance consultant website',
    },
    github: { label: 'Source', href: null, note: 'Client project, source not public' },
    live: { label: 'aritsirham.com', href: 'https://aritsirham.com' },
    caseStudy: {
      role: 'Solo freelance developer: requirements, build, QA and handover',
      problem:
        'An independent insurance consultant needed a professional website in Indonesian and English that explains the services and leads visitors to a consultation.',
      solution:
        'A bilingual, responsive website that explains each service, lets visitors estimate their protection gap, and routes them to a WhatsApp consultation.',
      build: [
        'Gathered requirements from client documents and wrote a proposal with scope, deliverables, out-of-scope items and a six-phase timeline',
        '20+ pages in Indonesian and English, built with HTML, CSS and JavaScript',
        'Protection-gap calculator and a validated consultation form that hands off to WhatsApp',
        'Handled change requests across revision rounds and reviewed content against insurance marketing compliance guidelines',
      ],
      result:
        'Delivered, paid and live at aritsirham.com. Before handover a custom script checked 200+ internal links, plus 15 form-validation test cases and layouts from 320 to 1366 px; handed over with technical documentation.',
    },
  },
  {
    id: 'kasera',
    title: 'Kasera POS',
    category: 'Web Development',
    kind: 'Personal project',
    year: 'Jul 2026',
    summary:
      'A full-stack ordering and cashier system modelled on the workflow of a working café: customer menu and cart, cashier screen, table management and sales reports.',
    highlights: [
      '29 REST API endpoints, 6 relational MySQL tables',
      'JWT + bcrypt authentication with two user roles',
      'Orders, items and table status saved in a single transaction',
    ],
    tech: ['Node.js', 'Express', 'MySQL', 'JWT', 'Chart.js'],
    image: {
      src: kaseraDashboard,
      secondary: kaseraKasir,
      alt: 'Kasera POS admin dashboard with demo orders',
    },
    github: {
      label: 'GitHub',
      href: 'https://github.com/Yusuf-habibi18/project-basuo-coffee',
    },
    live: { label: 'Live demo', href: null, note: 'Not hosted yet' },
    caseStudy: {
      role: 'Solo: database design, REST API and front end',
      problem:
        'A working café has three people on one order: the customer ordering, the cashier working the queue and the owner tracking sales. An order must never be half-saved.',
      solution:
        'A web-based ordering and point-of-sale system: customer menu and cart, cashier queue, table management and an admin dashboard with sales reports.',
      build: [
        'Relational MySQL schema: 6 tables with foreign keys and indexes',
        'REST API with 29 endpoints in Node.js + Express, using parameterized queries',
        'Atomic order processing with database transactions (commit / rollback)',
        'JWT authentication, bcrypt password hashing and role-based access for Administrator and Cashier',
        'Sales reports with daily revenue charts, best sellers, date filter and CSV export',
      ],
      result:
        'The end-to-end flow works: an order placed from the customer menu lands in the cashier queue. It runs locally and is not hosted yet; the code is on GitHub.',
    },
  },
  {
    id: 'smart-socket',
    title: 'Smart Socket Energy Monitoring',
    category: 'Web Development',
    kind: 'Team project · My part: web dashboard',
    year: 'Jul 2026',
    summary:
      'A real-time electricity monitoring dashboard for an ESP32 smart socket. I built the web dashboard; teammates built the firmware, sensors, Flask/MQTT backend and database.',
    highlights: [
      'Real-time charts of electrical readings via REST API',
      'Demo mode so the dashboard works without hardware',
      'Wired up unused login/config endpoints and fixed the history table',
    ],
    tech: ['React', 'JavaScript', 'REST API', 'IndexedDB'],
    image: { src: iotDashboard, alt: 'Smart Socket energy monitoring dashboard' },
    github: { label: 'GitHub', href: 'https://github.com/Yusuf-habibi18/UAS-IoT' },
    live: { label: 'Live demo', href: 'https://yusuf-habibi18.github.io/UAS-IoT/' },
    caseStudy: {
      role: 'Web dashboard only, in a team project for an IoT course. Firmware, sensors, the Flask/MQTT backend and the database were built by teammates.',
      problem:
        'The team’s ESP32 smart socket recorded electrical readings, but there was no clear way to watch them live or to present the system without the hardware.',
      solution:
        'A web dashboard that shows voltage, current, power, energy (kWh) and estimated electricity cost in real time, with a demo mode.',
      build: [
        'Real-time charts fed by the team’s Flask REST API',
        'Connected the previously unused authentication and device-configuration endpoints',
        'Fixed a bug that stopped logged data from displaying',
        'Client-side data simulator (demo mode), so the system runs without hardware or a server',
      ],
      result:
        'The system can be presented without any hardware, and the live demo on GitHub Pages runs in demo mode.',
    },
  },
  {
    id: 'medallion',
    title: 'Titanic Medallion Pipeline',
    category: 'Data Engineering',
    kind: 'Personal project',
    year: 'Nov 2026',
    summary:
      'A layered T-SQL pipeline in SQL Server that moves 891 raw rows from bronze to silver to gold, with automated data quality checks at every layer.',
    highlights: [
      '11/11 silver and gold checks pass',
      'Every run logged in validation_log with a run_id',
      'Expected values computed from the previous layer, never typed by hand',
    ],
    tech: ['SQL Server', 'T-SQL', 'Medallion architecture'],
    visual: 'medallion',
    github: { label: 'GitHub', href: null, note: 'Repository coming soon' },
    caseStudy: {
      role: 'Solo learning project',
      problem: 'Raw data is messy, and a pipeline is only useful if you can prove that every layer is correct.',
      solution: 'A bronze → silver → gold pipeline in SQL Server with automated data quality checks between layers.',
      build: [
        '891 raw Titanic rows loaded into the bronze layer',
        'Silver and gold layers built in T-SQL',
        'Quality checks at every layer, with expected values computed from the previous layer instead of typed by hand',
        'Every run logged in validation_log with a run_id',
      ],
      result: 'All 11 silver and gold checks pass, and every run can be traced through validation_log.',
    },
  },
  {
    id: 'wti',
    title: 'WTI Energy Price Pipeline',
    category: 'Data Engineering',
    kind: 'Coursework',
    year: 'Jul 2026',
    summary:
      'Scraped daily WTI crude oil prices from the U.S. EIA, cleaned them into an analysis-ready series and fitted an ARIMA(2,1,2) model for a 7-day forecast.',
    highlights: [
      '10,200 rows scraped with requests + BeautifulSoup',
      '250 clean observations after type, duplicate and missing-value checks',
      'Honest result: MAPE 26%, so the value here is the pipeline, not the forecast',
    ],
    tech: ['Python', 'Pandas', 'BeautifulSoup', 'statsmodels'],
    visual: 'wti',
    github: { label: 'GitHub', href: null, note: 'Notebook not published yet' },
    caseStudy: {
      role: 'Solo, Big Data course project',
      problem:
        'Daily WTI crude oil prices are published on the U.S. EIA website as a web page, not as an analysis-ready dataset.',
      solution:
        'An end-to-end Python pipeline that scrapes, validates and stores the prices, then forecasts the next 7 days.',
      build: [
        'Scraped 10,200 daily records with requests + BeautifulSoup',
        'Validated data types, checked duplicates and missing values, and stored raw and cleaned data separately',
        'ADF stationarity test and AIC-based model selection, resulting in ARIMA(2,1,2) with statsmodels',
      ],
      result:
        'A reproducible pipeline and a 7-day forecast. The forecast itself is weak (MAPE 26%), so the value of this project is the pipeline, and I report that honestly.',
    },
  },
];

export const education = {
  school: 'Institut Teknologi PLN (ITPLN)',
  degree: "Bachelor's Degree in Information Systems",
  period: 'Expected graduation 2028',
  location: 'Jakarta, Indonesia',
  gpa: '3.81 / 4.00',
  gpaNote: 'Semesters 1–4',
  /** Empty lists render as labelled placeholders. Add entries when you have them. */
  achievements: [] as string[],
  certifications: [] as string[],
};

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'expertise', label: 'Expertise' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
] as const;
