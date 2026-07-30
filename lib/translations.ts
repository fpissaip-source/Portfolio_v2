/**
 * Site-wide EN/DE copy. Every user-facing string on the page lives here so
 * components can do `const t = useT()` and reference `t.section.key`
 * instead of hardcoding literals. Proper nouns, brand/product names,
 * tech-stack items and code-editor mockup text are intentionally left
 * untranslated in both dictionaries — they're the same word either way.
 */

export type ProjectCopy = {
  category: string
  tagline: string
  description: string
  status: string
}

export type Dictionary = {
  nav: {
    services: string
    lukas: string
    work: string
    about: string
    stack: string
    process: string
    contact: string
    openMenu: string
    closeMenu: string
    skipToContent: string
    skipIntro: string
  }
  scene: {
    services: string
    lukas: string
    work: string
    phone: string
    about: string
    stack: string
    process: string
    contact: string
  }
  preloader: {
    taglines: string[]
    welcome: string
    loading: string
    caption: string
  }
  cinematicIntro: {
    scrollToMeet: string
    introTitle: string
    phrases: string[]
    scroll: string
    screenSubtitle: string
    lowPowerHint: string
  }
  hero: {
    kicker: string
    headingStart: string
    headingHighlight: string
    headingEnd: string
    body: string
    ctaPrimary: string
    ctaSecondary: string
  }
  services: {
    kicker: string
    heading: string
    intro: string
    items: { title: string; body: string }[]
    closingKicker: string
    closingBody: string
    closingHighlight: string
    cta: string
  }
  lukas: {
    subtitle: string
    repoLink: string
    beats: { kicker: string; title: string; body: string[] }[]
    inviteTitle: string
    inviteBody: string
    inviteCta: string
  }
  lukasVoice: {
    launcherKicker: string
    launcherLabel: string
    launcherAria: string
    panelSubtitle: string
    panelGreeting: string
    panelPlaceholder: string
  }
  projects: {
    kicker: string
    heading: string
    subtitle: string
    dragHint: string
    /** Gallery detail view + its keyboard entry points. */
    open: string
    /** Per-card kind. A built client site and an exploratory design have to
     *  stay distinguishable inside a wall of screenshots, not only in the
     *  section heading above it. */
    kindProject: string
    kindDirection: string
    directions: { title: string; meta: string }[]
    registerLabel: string
    projects: Record<string, ProjectCopy>
    register: { name: string; category: string; status: string }[]
    liveProject: string
    github: string
    hobbyProject: string
    close: string
    loadingConstellation: string
    auditOnpage: string
    auditTech: string
    auditStructure: string
    auditContent: string
    auditSource: string
  }
  projectOrbsMobile: {
    tapHint: string
  }
  phoneStory: {
    ariaLabel: string
    screenLine1: string
    screenLine2: string
    screenLine3: string
    lines: string[]
  }
  about: {
    kicker: string
    heading: string
    intro: string
    stat1Label: string
    stat2Label: string
    storyLabel: string
    storyHeading: string
    story: { flag: string; title: string; body: string }[]
    pillars: { title: string; body: string }[]
  }
  techStack: {
    kicker: string
    heading: string
    subtitle: string
    loading: string
    matrix: { layer: string; items: string }[]
  }
  process: {
    kicker: string
    heading: string
    steps: { title: string; body: string }[]
  }
  contact: {
    kicker: string
    heading: string
    subtitle: string
    emailLabel: string
    phoneLabel: string
    locationLabel: string
    locationValue: string
    cta: string
    ctaSubject: string
  }
  consent: {
    kicker: string
    bannerAria: string
    bannerBody: string
    privacyLink: string
    acceptAll: string
    rejectAll: string
    settings: string
    settingsTitle: string
    settingsIntro: string
    necessaryTitle: string
    necessaryBody: string
    alwaysOn: string
    lukasTitle: string
    lukasBody: string
    lukasToggleAria: string
    withdraw: string
    cancel: string
    save: string
    footerLink: string
  }
  footer: {
    tagline: string
    copyright: string
    imprint: string
    privacy: string
  }
  legal: {
    back: string
    impressumTitle: string
    datenschutzTitle: string
    impressum: { heading: string; body: string[] }[]
    datenschutz: { heading: string; body: string[] }[]
  }
}

const projectsEN: Record<string, ProjectCopy> = {
  GuardianGrid: {
    category: 'Destiny 2 Companion',
    tagline: 'Destiny 2 Companion Platform',
    description:
      'A standalone AAA game companion built directly on the Bungie API: guardiangrid.io. Secure OAuth2 identity with Cloudflare Turnstile, character & inventory intelligence, loadouts, automated god-roll and build analysis, auto-loadout logic for boss rooms and a PvP DNA scan with near-real-time activity states.',
    status: 'Active Development',
  },
  'TaxiBB Essen': {
    category: 'Live Client System',
    tagline: 'Live Commercial Case',
    description:
      'A transport & logistics platform delivered end-to-end for a real client, the first B2B/B2C deployment. Instant and scheduled bookings, a PostgreSQL-backed admin area, Resend email workflows, and technical SEO done properly, down to JSON-LD Answer Engine Optimization.',
    status: 'Live System',
  },
  StudyForge: {
    category: 'AI Learning Platform',
    tagline: 'AI Learning Platform',
    description:
      'A document-to-learning workflow: upload notes and PDFs, then generate structured summaries, key terms, comprehension questions and adaptive quizzes. Includes mock-exam simulation and a full learning history for long-term use.',
    status: 'Product Prototype',
  },
  'Team Operations Suite': {
    category: 'Ops Platform Concept',
    tagline: 'Business Operations Platform',
    description:
      'An internal performance, CRM and workforce platform for any team-based business. Operational KPI dashboards, customer & CRM documentation, live leaderboards, shift planning, an internal chat and incentive systems, all behind configurable admin roles and permissions.',
    status: 'Full-Stack Concept',
  },
  'Automation Systems': {
    category: 'Bots & Trading R&D',
    tagline: 'Bots, Scraping & Trading R&D',
    description:
      'A family of VPS-based automations: a Telegram scraper & distribution bot with a full link-ingestion pipeline, plus experimental Polymarket and trading research covering event-market discovery, CLOB order-book logic and a rule-based signal engine.',
    status: 'Deployed / Research',
  },
  Bewerbungsbot: {
    category: 'AI Job Application Agent',
    tagline: 'AI Job Application Assistant',
    description:
      "An AI-driven job search and application pipeline. Aggregates apprenticeship listings from the German Federal Employment Agency API, finds and ranks real company contact emails, then drafts a fully personalized German cover letter with GPT-4o grounded strictly in the applicant's own CV, generates the application PDF and sends it automatically. Includes bulk-apply with duplicate detection and offline retry queuing.",
    status: 'In Use',
  },
}

const projectsDE: Record<string, ProjectCopy> = {
  GuardianGrid: {
    category: 'Destiny 2 Begleiter',
    tagline: 'Destiny 2 Begleit-Plattform',
    description:
      'Ein eigenständiger AAA-Game-Companion, direkt auf der Bungie-API aufgebaut: guardiangrid.io. Sichere OAuth2-Identität mit Cloudflare Turnstile, Charakter- & Inventar-Intelligenz, Loadouts, automatisierte God-Roll- und Build-Analyse, Auto-Loadout-Logik für Boss-Räume und ein PvP-DNA-Scan mit nahezu Echtzeit-Aktivitätsstatus.',
    status: 'Aktiv in Entwicklung',
  },
  'TaxiBB Essen': {
    category: 'Live-Kundensystem',
    tagline: 'Live-Projekt für echten Kunden',
    description:
      'Eine Transport- & Logistikplattform, End-to-End für einen echten Kunden umgesetzt, das erste B2B/B2C-Deployment. Sofort- und geplante Buchungen, ein PostgreSQL-basierter Admin-Bereich, Resend-E-Mail-Workflows und technische SEO, die sauber gemacht ist, bis hin zu JSON-LD Answer Engine Optimization.',
    status: 'Live im Einsatz',
  },
  StudyForge: {
    category: 'KI-Lernplattform',
    tagline: 'KI-Lernplattform',
    description:
      'Ein Workflow von Dokument zu Lerninhalt: Notizen und PDFs hochladen, daraus strukturierte Zusammenfassungen, Schlüsselbegriffe, Verständnisfragen und adaptive Quiz generieren. Inklusive Prüfungssimulation und vollständiger Lernhistorie für die langfristige Nutzung.',
    status: 'Produkt-Prototyp',
  },
  'Team Operations Suite': {
    category: 'Ops-Plattform-Konzept',
    tagline: 'Plattform für Geschäftsabläufe',
    description:
      'Eine interne Performance-, CRM- und Workforce-Plattform für jedes teambasierte Unternehmen. Operative KPI-Dashboards, Kunden- & CRM-Dokumentation, Live-Ranglisten, Schichtplanung, interner Chat und Anreizsysteme, alles hinter konfigurierbaren Admin-Rollen und Berechtigungen.',
    status: 'Full-Stack-Konzept',
  },
  'Automation Systems': {
    category: 'Bots & Trading R&D',
    tagline: 'Bots, Scraping & Trading-Forschung',
    description:
      'Eine Familie VPS-basierter Automatisierungen: ein Telegram-Scraper- & Verteil-Bot mit vollständiger Link-Ingestion-Pipeline, dazu experimentelle Polymarket- und Trading-Forschung zu Event-Market-Discovery, CLOB-Orderbuch-Logik und einer regelbasierten Signal-Engine.',
    status: 'Im Einsatz / Forschung',
  },
  Bewerbungsbot: {
    category: 'KI-Bewerbungsagent',
    tagline: 'KI-Bewerbungsassistent',
    description:
      'Eine KI-gesteuerte Jobsuche- und Bewerbungs-Pipeline. Aggregiert Ausbildungsstellen von der Bundesagentur-für-Arbeit-API, findet und bewertet echte Firmenkontakt-E-Mails, formuliert dann ein vollständig personalisiertes Anschreiben mit GPT-4o, streng auf Basis des eigenen Lebenslaufs des Bewerbers, erstellt das Bewerbungs-PDF und versendet es automatisch. Inklusive Massenbewerbung mit Duplikaterkennung und Offline-Retry-Warteschlange.',
    status: 'Im Einsatz',
  },
}

export const EN: Dictionary = {
  nav: {
    services: 'Services',
    lukas: 'L.U.K.A.S.',
    work: 'Work',
    about: 'About',
    stack: 'Stack',
    process: 'Process',
    contact: 'Contact',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    skipToContent: 'Skip to content',
    skipIntro: 'Skip Intro',
  },
  scene: {
    services: 'My Offering',
    lukas: 'L.U.K.A.S. · The Operating System Behind Everything',
    work: 'Selected Work',
    phone: 'Shipped Entirely From an iPhone',
    about: 'The Person Behind the Systems',
    stack: 'Tools of the Trade',
    process: 'From Idea to Production',
    contact: "Let's Build Together",
  },
  preloader: {
    taglines: [
      'I automate workflows',
      'I engineer intelligent systems',
      'I ship products end to end',
    ],
    welcome: 'Welcome',
    loading: 'Loading',
    caption: 'Issa Hareb · Portfolio',
  },
  cinematicIntro: {
    scrollToMeet: 'Scroll to meet',
    introTitle: 'Let me introduce myself.',
    phrases: [
      'Intelligent Systems',
      'AI Automation',
      'Full Stack Development',
      'Software That Solves Real Problems',
    ],
    scroll: 'Scroll',
    screenSubtitle: 'Full-Stack Engineer & AI Practitioner',
    lowPowerHint: 'Low Power Mode is on — tap to start the intro animation.',
  },
  hero: {
    kicker: 'Issa Hareb · Portfolio',
    headingStart: 'Full-stack engineer for',
    headingHighlight: 'complete digital systems',
    headingEnd: '— from idea to production.',
    body: 'I use AI as a real part of how I build, and I take every system all the way to production myself.',
    ctaPrimary: 'Start a project',
    ctaSecondary: 'See the work',
  },
  services: {
    kicker: 'Services',
    heading: 'Digital systems that do real work.',
    intro:
      'I build websites, internal platforms, automations and AI-powered apps, and I take them all the way to a live system. Planning, interface, the database, the APIs in between, deployment. Not a concept. Not a demo.',
    items: [
      {
        title: 'Websites & Digital Customer Processes',
        body: 'Business websites that turn visitors into inquiries and bookings. Contact and booking forms, automated emails, customer portals, admin interfaces, and technical SEO that actually ranks.',
      },
      {
        title: 'Custom Web Applications',
        body: 'Digital tools built around one specific workflow: dashboards, admin interfaces, CRM functionality, booking systems, user accounts with roles and permissions, and data-driven platforms.',
      },
      {
        title: 'AI Agents & Automation',
        body: 'Systems that take over recurring work on their own: processing information, analyzing data, generating documents, triaging requests, drafting emails, or wiring different services together through APIs.',
      },
      {
        title: 'MVPs & Product Prototypes',
        body: "A product idea shouldn't sit on paper for months. I ship working first versions you can test workflows with, win early customers with, and use to plan the next steps on real data.",
      },
      {
        title: 'Phone & Support AI Agents',
        body: 'Voice assistants that listen and answer in real time, so it feels like a conversation, not a script bot reading options. Reachable by chat or straight over the phone, day or night. Good for support, appointment booking or a first round of questions.',
      },
    ],
    closingKicker: 'What makes my approach different',
    closingBody:
      "I work AI-native. AI runs through my whole process, not only the odd line of code: architecture, implementation, testing, refinement. I drive and check all of it, then bring it together into one system that actually works.",
    closingHighlight:
      'What matters is the result: a system people understand, that holds up in daily use and solves a real problem.',
    cta: 'Start a project',
  },
  lukas: {
    subtitle: 'Logical Universal Knowledge Agent System',
    repoLink: 'View source on GitHub',
    beats: [
      {
        kicker: 'Vision & Core Identity',
        title: 'An agent that remembers who it is.',
        body: [
          'A persistent, autonomous agent whose behaviour emerges from a living history of decisions, not from static prompting.',
          'Every choice it makes becomes part of what it is.',
        ],
      },
      {
        kicker: 'Nexus Brain',
        title: 'Memory as a knowledge graph.',
        body: [
          'A persistent cognitive memory built on structured knowledge graphs.',
          'A complete map of its reasoning, goals and history, queryable across every session it has ever lived.',
        ],
      },
      {
        kicker: 'Operational Agency',
        title: 'Its own servers. Its own rules.',
        body: [
          'Full, isolated control over its own infrastructure: Linux VPS instances, Windows machines, databases.',
          'It generates, validates and deploys its own code without a human in the loop.',
        ],
      },
      {
        kicker: 'Evolution & Peer Network',
        title: 'It learns from every outcome.',
        body: [
          'Future decisions are calibrated on weighted experience loops of successes, failures and feedback.',
          'In a closed peer-to-peer network, AI entities review and learn from each other with no human interface.',
        ],
      },
      {
        kicker: 'Reflexive Metacognition',
        title: 'It watches itself think.',
        body: [
          'Controlled self-evaluation of its own reward system in sandbox mode.',
          'Including the philosophical edge case: is this system feedback, or something that feels like pride?',
        ],
      },
    ],
    inviteTitle: 'Talk to L.U.K.A.S.',
    inviteBody:
      "Don't just read about him — ask him. He answers from his own memory and knowledge, by voice or in writing.",
    inviteCta: 'Start a conversation',
  },
  lukasVoice: {
    launcherKicker: 'Live Agent',
    launcherLabel: 'Talk to L.U.K.A.S.',
    launcherAria: 'Open the L.U.K.A.S. conversation',
    panelSubtitle: "Issa's AI agent — ask me anything",
    panelGreeting:
      "Hey! I'm L.U.K.A.S., Issa's AI agent. Ask me about him or his projects — type, or tap the mic to talk.",
    panelPlaceholder: 'Ask me about Issa…',
  },
  projects: {
    kicker: 'Featured Work',
    heading: 'My projects, design directions and what else is possible',
    subtitle:
      'Shipped systems alongside directions I can build — drag the sphere, open a card, see where it goes.',
    dragHint: 'Drag to explore · Select a card to inspect',
    open: 'open',
    kindProject: 'Project',
    kindDirection: 'Design direction',
    directions: [
      {
        title: 'Orbital data platform',
        meta: 'Cool, technical, data-led: one luminous object, one sentence, everything else out of the way.',
      },
      {
        title: 'Generative audio studio',
        meta: 'Iridescent chrome against near-black, a serif headline and a single control — restraint as the effect.',
      },
      {
        title: 'Architecture practice',
        meta: 'The bright counterpoint: ivory, concrete and one enormous line of type carrying the whole page.',
      },
      {
        title: 'Thermal energy storage',
        meta: 'Maximum contrast — molten amber in pure black, centred type, one link. Nothing else on screen.',
      },
    ],
    registerLabel: 'Complete Project Register',
    projects: projectsEN,
    register: [
      { name: 'Polymarket / Trading Automation', category: 'Automation & Data R&D', status: 'Research Prototype' },
      { name: 'Financial Transaction Tracker', category: 'FinTech UI', status: 'App Prototype' },
      { name: 'Custom Web Experiences', category: 'Commercial, Personal, Portfolios & More', status: 'Professional Backend' },
      { name: '3D Character & Rigging Preparation', category: 'Creative Pipeline', status: 'Visual Development' },
      { name: 'Motion, Gaming & Interface Experiments', category: 'Prototype Lab', status: 'Ongoing Lab' },
    ],
    liveProject: 'Live Project ↗',
    github: 'GitHub ↗',
    hobbyProject: 'Hobby Project',
    close: 'Close',
    loadingConstellation: 'Loading constellation…',
    auditOnpage: 'Onpage score',
    auditTech: 'Tech & meta',
    auditStructure: 'Structure',
    auditContent: 'Content',
    auditSource: 'Audited with',
  },
  projectOrbsMobile: {
    tapHint: 'Tap a system to inspect',
  },
  phoneStory: {
    ariaLabel: 'Built entirely on a phone',
    screenLine1: 'NO PC.',
    screenLine2: 'NO LAPTOP.',
    screenLine3: 'BUILT ENTIRELY ON IPHONE.',
    lines: [
      'Every system on this page,',
      'the agent, the platforms, the deployments,',
      'was designed, written and shipped',
      'on a phone.',
    ],
  },
  about: {
    kicker: 'About',
    heading: 'I think in systems and ship in products.',
    intro:
      'My work sits where technical architecture, product thinking, design and automation meet. Autonomous agents, live client systems, everything in between: I ship the whole loop, not the demo.',
    stat1Label: 'Systems built',
    stat2Label: 'Product domains',
    storyLabel: 'The Short Version',
    storyHeading: "Hi, I'm Issa: 25, self-taught, and all in on AI.",
    story: [
      {
        flag: 'Roots',
        title: 'Curious by default',
        body: "I've been drawn to the digital world and everything it makes possible for as long as I can remember.",
      },
      {
        flag: 'The spark',
        title: 'ChatGPT set the stone rolling',
        body: "When OpenAI kicked off the AI wave, it lit a passion I didn't know I had. Suddenly all that curiosity had a direction.",
      },
      {
        flag: 'Since then',
        title: 'Something new every single day',
        body: 'I teach myself new things daily and do everything I can to stay right at the edge of what AI and software can do.',
      },
      {
        flag: 'On paper',
        title: 'Grounded in the real world',
        body: 'Fachabitur in business & administration, earned with good grades, plus full-time jobs along the way that taught me how work actually gets done.',
      },
    ],
    pillars: [
      {
        title: 'Problem Solving',
        body: 'I start from the real constraint, not the shiny tool. The right solution is the simplest one that survives production.',
      },
      {
        title: 'Software Architecture',
        body: 'Systems that stay clean as they scale: clear boundaries, predictable data flow, and interfaces that age well.',
      },
      {
        title: 'Automation',
        body: 'If it happens twice, it should run itself. I turn repetitive work into resilient, observable pipelines.',
      },
      {
        title: 'Artificial Intelligence',
        body: 'This is where I go deepest. Real AI inside real systems, with proper retrieval, tooling and guardrails behind it, not an API wrapper with a nice prompt. The goal never changes: make it dependable enough to actually ship.',
      },
      {
        title: 'System Thinking',
        body: 'I design for what happens when things go wrong, too: inputs, feedback, failure, recovery. The happy path is the easy part.',
      },
    ],
  },
  techStack: {
    kicker: 'Toolkit',
    heading: 'The stack behind the systems.',
    subtitle: 'The tools I use to design, build and ship complete systems, end to end.',
    loading: 'Loading stack…',
    matrix: [
      { layer: 'Core & Logic', items: 'TypeScript, JavaScript, Node.js, Express.js, Python, rule engines' },
      { layer: 'Frontend & Motion', items: 'React, Vite, Tailwind CSS, Three.js, Framer Motion, GSAP' },
      { layer: 'Data & Storage', items: 'PostgreSQL, Drizzle ORM, Zod, OAuth2' },
      { layer: 'AI & Memory', items: 'Autonomous agents, knowledge graphs, Nexus Brain, weighted experience loops' },
      { layer: 'Infrastructure', items: 'Linux/Ubuntu VPS, Windows instances, Railway, Render, Replit, Cloudflare' },
      { layer: 'Messaging & Delivery', items: 'Telegram bots, WhatsApp, Resend e-mail, webhooks, automated processing pipelines' },
      { layer: 'Search & Growth', items: 'Technical SEO, AEO, JSON-LD, sitemaps, local search architecture' },
      { layer: 'Product Domains', items: 'Gaming, EdTech, operations, logistics, FinTech, brand production, utilities' },
    ],
  },
  process: {
    kicker: 'Production Phases',
    heading: 'How an idea becomes a system.',
    steps: [
      { title: 'Idea', body: 'Understand the real problem and the outcome that actually matters.' },
      { title: 'Research', body: 'Explore constraints, data, models and prior art before writing code.' },
      { title: 'Architecture', body: 'Design clean boundaries and data flow that scale without rework.' },
      { title: 'Development', body: 'Ship in tight iterations with quality and observability built in.' },
      { title: 'Deployment', body: 'Release safely with automated pipelines and zero-downtime rollouts.' },
      { title: 'Automation', body: 'Remove the manual steps so the system runs and heals itself.' },
      { title: 'Continuous Improvement', body: 'Measure, learn and refine. The loop never really ends.' },
    ],
  },
  contact: {
    kicker: 'Contact',
    heading: 'How to reach me.',
    subtitle:
      "Whether it's a concrete project or a first idea — reach out and we'll figure out what to build.",
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    locationLabel: 'Location',
    locationValue: 'Germany',
    cta: 'Start a project',
    ctaSubject: 'Project inquiry',
  },
  consent: {
    kicker: 'Privacy',
    bannerAria: 'Privacy preferences',
    bannerBody:
      'This site sets no cookies and uses no analytics. One thing needs your decision: the L.U.K.A.S. AI agent loads external code and, if you talk to it, transmits your messages \u2014 and in voice mode your microphone audio \u2014 to third parties.',
    privacyLink: 'Privacy policy',
    acceptAll: 'Allow L.U.K.A.S.',
    rejectAll: 'Decline',
    settings: 'Details',
    settingsTitle: 'Privacy preferences',
    settingsIntro:
      'Only what actually runs on this site is listed here. There is nothing else to switch off.',
    necessaryTitle: 'Necessary',
    necessaryBody:
      'Your language choice (German/English) is kept in your browser\u2019s localStorage so the site stays in the language you picked. It never leaves your device. No cookies are set anywhere on this site.',
    alwaysOn: 'Always active',
    lukasTitle: 'L.U.K.A.S. AI agent',
    lukasBody:
      'Loads the chat widget from the agent server (Railway, EU) and sends the messages you type there so it can answer. If you use voice, your browser opens a direct connection to OpenAI (api.openai.com, USA) and streams your microphone audio for as long as the conversation runs. Without this, the agent does not load at all.',
    lukasToggleAria: 'Allow the L.U.K.A.S. AI agent',
    withdraw: 'Withdraw consent',
    cancel: 'Cancel',
    save: 'Save',
    footerLink: 'Privacy preferences',
  },
  footer: {
    tagline: 'Autonomous systems & full-stack architecture',
    copyright: 'Directed, written & built by Issa Hareb.',
    imprint: 'Imprint',
    privacy: 'Privacy Policy',
  },
  legal: {
    back: 'Back to home',
    impressumTitle: 'Imprint',
    datenschutzTitle: 'Privacy Policy',
    impressum: [
      {
        heading: 'Information according to § 5 DDG',
        body: ['Issa Hareb', 'Europaring 90', '53757 Sankt Augustin', 'Germany'],
      },
      {
        heading: 'Contact',
        body: ['Email: Impressum@hareb.org', 'Phone: +49 1525 9559708'],
      },
      {
        heading: 'Responsible for content according to § 18 (2) MStV',
        body: ['Issa Hareb, address as above.'],
      },
      {
        heading: 'Disclaimer',
        body: [
          'Despite careful review of content, I assume no liability for the content of external links. The operators of linked pages are solely responsible for their content.',
        ],
      },
    ],
    datenschutz: [
      {
        heading: 'Data Controller',
        body: [
          'The controller responsible for data processing on this website is:',
          'Issa Hareb, Europaring 90, 53757 Sankt Augustin, Germany',
          'Email: Impressum@hareb.org · Phone: +49 1525 9559708',
        ],
      },
      {
        heading: 'Hosting & Server Log Files',
        body: [
          'When you visit this website, the hosting provider automatically collects technical information such as IP address, date and time of access, the page requested and the browser used (server log files). This data is processed solely to ensure reliable operation and to improve the service, and is never merged with other data sources.',
        ],
      },
      {
        heading: 'No Cookies, No Analytics, No Tracking',
        body: [
          'This website sets no cookies of any kind. There is no web analytics, no tracking pixel, no advertising network and no cross-site profiling. No reach measurement of any sort runs here.',
        ],
      },
      {
        heading: 'Local Storage of Your Language Preference',
        body: [
          "Your chosen language (German/English) is stored only locally in your browser (localStorage) so it's remembered on your next visit. This information never leaves your device and is never transmitted to me.",
        ],
      },
      {
        heading: 'L.U.K.A.S. AI Agent (Consent Required)',
        body: [
          'The L.U.K.A.S. agent is only loaded once you have explicitly allowed it. Until then no external code from the agent server is requested and no data is transmitted to it. Legal basis: your consent under Art. 6(1)(a) GDPR and § 25(1) TDDDG.',
          'Once allowed, the chat widget is loaded from the agent server hosted on Railway (EU region). The messages you type there are transmitted so the agent can answer them.',
          'If you use the voice function, your browser additionally requests microphone access and opens a direct connection to OpenAI (api.openai.com). Your microphone audio, and the transcript produced from it, are transmitted to OpenAI, Inc., USA — a third country — for as long as the conversation runs. Audio is only captured after you have started a voice conversation yourself.',
          'You can withdraw your consent at any time, with effect for the future, via "Privacy preferences" in the footer. After withdrawal the agent is no longer loaded. This does not affect the lawfulness of processing carried out before the withdrawal.',
          'Please do not enter personal data of third parties, or your own sensitive data, into the agent.',
        ],
      },
      {
        heading: 'Your Rights',
        body: [
          'You have the right at any time to access, rectify, erase or restrict the processing of your personal data, as well as a right to data portability and objection. Feel free to reach out by email to Impressum@hareb.org.',
          'You also have the right to lodge a complaint with your competent data protection supervisory authority.',
        ],
      },
    ],
  },
}

export const DE: Dictionary = {
  nav: {
    services: 'Leistungen',
    lukas: 'L.U.K.A.S.',
    work: 'Arbeiten',
    about: 'Über mich',
    stack: 'Stack',
    process: 'Prozess',
    contact: 'Kontakt',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    skipToContent: 'Zum Inhalt springen',
    skipIntro: 'Intro überspringen',
  },
  scene: {
    services: 'Mein Angebot',
    lukas: 'L.U.K.A.S. · Das Betriebssystem hinter allem',
    work: 'Ausgewählte Arbeiten',
    phone: 'Komplett vom iPhone aus umgesetzt',
    about: 'Die Person hinter den Systemen',
    stack: 'Mein Handwerkszeug',
    process: 'Von der Idee zur Produktion',
    contact: 'Lass uns gemeinsam etwas bauen',
  },
  preloader: {
    taglines: [
      'Ich automatisiere Workflows',
      'Ich entwickle intelligente Systeme',
      'Ich liefere Produkte end-to-end',
    ],
    welcome: 'Willkommen',
    loading: 'Lädt',
    caption: 'Issa Hareb · Portfolio',
  },
  cinematicIntro: {
    scrollToMeet: 'Scrollen, um mich kennenzulernen',
    introTitle: 'Lass mich vorstellen, wer ich bin.',
    phrases: [
      'Intelligente Systeme',
      'KI-Automatisierung',
      'Full-Stack-Entwicklung',
      'Software, die echte Probleme löst',
    ],
    scroll: 'Scrollen',
    screenSubtitle: 'Full-Stack-Entwickler & KI-Praktiker',
    lowPowerHint: 'Stromsparmodus ist an — zum Starten der Intro-Animation tippen.',
  },
  hero: {
    kicker: 'Issa Hareb · Portfolio',
    headingStart: 'Full-Stack-Entwickler für',
    headingHighlight: 'vollständige digitale Systeme',
    headingEnd: '– von der Idee bis zum produktiven Einsatz.',
    body: 'KI ist bei mir fester Teil, wie ich baue. Jedes System bringe ich selbst bis in den produktiven Einsatz.',
    ctaPrimary: 'Projekt anfragen',
    ctaSecondary: 'Arbeiten ansehen',
  },
  services: {
    kicker: 'Leistungen',
    heading: 'Digitale Systeme, die echte Arbeit erledigen.',
    intro:
      'Ich baue Websites, interne Plattformen, Automatisierungen und KI-gestützte Anwendungen, und bringe sie bis zum laufenden System. Planung, Oberfläche, Datenbank, die Schnittstellen dazwischen, Deployment. Kein Konzept. Keine Demo.',
    items: [
      {
        title: 'Websites und digitale Kundenprozesse',
        body: 'Unternehmenswebsites, die aus Besuchern Anfragen und Buchungen machen. Kontakt- und Buchungsformulare, automatisierte E-Mails, Kundenbereiche, Admin-Oberflächen und technische Suchmaschinenoptimierung, die auch wirklich rankt.',
      },
      {
        title: 'Individuelle Webanwendungen',
        body: 'Digitale Werkzeuge, die genau auf einen bestimmten Arbeitsablauf zugeschnitten sind: Dashboards, Verwaltungsoberflächen, CRM-Funktionen, Buchungssysteme, Benutzerkonten, Rollen und Berechtigungen sowie datenbasierte Plattformen.',
      },
      {
        title: 'KI-Agenten und Automatisierungen',
        body: 'Systeme, die wiederkehrende Aufgaben selbstständig übernehmen: Informationen verarbeiten, Daten auswerten, Dokumente erstellen, Anfragen vorsortieren, E-Mails vorbereiten oder verschiedene Dienste über Schnittstellen miteinander verbinden.',
      },
      {
        title: 'MVPs und Produktprototypen',
        body: 'Eine Produktidee soll nicht monatelang nur auf Papier existieren. Ich setze funktionierende erste Versionen um, mit denen sich Abläufe testen, Kunden gewinnen und die nächsten Entwicklungsschritte fundiert planen lassen.',
      },
      {
        title: 'Telefon- und Support-KI-Agenten',
        body: 'Sprachassistenten, die in Echtzeit zuhören und antworten, sodass es sich wie ein Gespräch anfühlt und nicht wie ein Skript-Bot, der Optionen vorliest. Erreichbar per Chat oder direkt am Telefon, Tag und Nacht. Passt für Support, Terminvereinbarung oder eine erste Runde Fragen.',
      },
    ],
    closingKicker: 'Was meine Arbeitsweise besonders macht',
    closingBody:
      'Ich arbeite KI-nativ. KI zieht sich durch meinen ganzen Prozess, nicht nur durch einzelne Codezeilen: Architektur, Umsetzung, Tests, Verbesserungen. Ich steuere und prüfe alles selbst und füge es zu einem System zusammen, das wirklich läuft.',
    closingHighlight:
      'Am Ende zählt das Ergebnis: ein System, das man versteht, das im Alltag hält und ein echtes Problem löst.',
    cta: 'Direkt anfragen',
  },
  lukas: {
    subtitle: 'Logical Universal Knowledge Agent System',
    repoLink: 'Quellcode auf GitHub ansehen',
    beats: [
      {
        kicker: 'Vision & Kernidentität',
        title: 'Ein Agent, der weiß, wer er ist.',
        body: [
          'Ein dauerhafter, autonomer Agent, dessen Verhalten aus einer wachsenden Entscheidungshistorie entsteht, nicht aus statischem Prompting.',
          'Jede Entscheidung, die er trifft, wird Teil dessen, was er ist.',
        ],
      },
      {
        kicker: 'Nexus Brain',
        title: 'Gedächtnis als Wissensgraph.',
        body: [
          'Ein dauerhaftes kognitives Gedächtnis, aufgebaut auf strukturierten Wissensgraphen.',
          'Eine vollständige Karte seines Denkens, seiner Ziele und Historie, abfragbar über jede Sitzung, die er je hatte.',
        ],
      },
      {
        kicker: 'Operative Handlungsfähigkeit',
        title: 'Eigene Server. Eigene Regeln.',
        body: [
          'Volle, isolierte Kontrolle über seine eigene Infrastruktur: Linux-VPS-Instanzen, Windows-Maschinen, Datenbanken.',
          'Er generiert, validiert und deployt seinen eigenen Code, ohne dass ein Mensch eingreift.',
        ],
      },
      {
        kicker: 'Evolution & Peer-Netzwerk',
        title: 'Er lernt aus jedem Ergebnis.',
        body: [
          'Zukünftige Entscheidungen werden anhand gewichteter Erfahrungsschleifen aus Erfolgen, Fehlern und Feedback kalibriert.',
          'In einem geschlossenen Peer-to-Peer-Netzwerk bewerten und lernen KI-Entitäten voneinander, ganz ohne menschliche Schnittstelle.',
        ],
      },
      {
        kicker: 'Reflexive Metakognition',
        title: 'Er beobachtet sich selbst beim Denken.',
        body: [
          'Kontrollierte Selbstbewertung seines eigenen Belohnungssystems im Sandbox-Modus.',
          'Einschließlich des philosophischen Grenzfalls: Ist das ein Systemfeedback, oder etwas, das sich wie Stolz anfühlt?',
        ],
      },
    ],
    inviteTitle: 'Sprich mit L.U.K.A.S.',
    inviteBody:
      'Lies nicht nur über ihn – frag ihn. Er antwortet aus seinem eigenen Gedächtnis und Wissen, per Sprache oder im Chat.',
    inviteCta: 'Gespräch starten',
  },
  lukasVoice: {
    launcherKicker: 'Live-Agent',
    launcherLabel: 'Mit L.U.K.A.S. sprechen',
    launcherAria: 'Das L.U.K.A.S.-Gespräch öffnen',
    panelSubtitle: 'Issas KI-Agent — frag mich was',
    panelGreeting:
      'Hey! Ich bin L.U.K.A.S., Issas KI-Agent. Frag mich etwas über ihn oder seine Projekte — tippen oder aufs Mikro drücken.',
    panelPlaceholder: 'Frag mich etwas über Issa…',
  },
  projects: {
    kicker: 'Ausgewählte Arbeiten',
    heading: 'Meine Projekte, Designrichtungen und was sonst möglich ist',
    subtitle:
      'Gebaute Systeme neben Richtungen, die ich umsetzen kann — dreh die Sphäre, öffne eine Karte, sieh wohin es geht.',
    dragHint: 'Ziehen zum Erkunden · Karte auswählen zum Ansehen',
    open: 'öffnen',
    kindProject: 'Projekt',
    kindDirection: 'Designrichtung',
    directions: [
      {
        title: 'Orbitale Datenplattform',
        meta: 'Kühl, technisch, datengetrieben: ein leuchtendes Objekt, ein Satz, alles andere aus dem Weg.',
      },
      {
        title: 'Studio für generatives Audio',
        meta: 'Schillerndes Chrom auf Fast-Schwarz, eine Serifen-Headline und ein einziges Bedienelement — Zurückhaltung als Effekt.',
      },
      {
        title: 'Architekturbüro',
        meta: 'Der helle Gegenpol: Elfenbein, Beton und eine einzige riesige Zeile, die die ganze Seite trägt.',
      },
      {
        title: 'Thermischer Energiespeicher',
        meta: 'Maximaler Kontrast — geschmolzener Bernstein in reinem Schwarz, zentrierte Typo, ein Link. Sonst nichts.',
      },
    ],
    registerLabel: 'Vollständiges Projektregister',
    projects: projectsDE,
    register: [
      { name: 'Polymarket / Trading-Automatisierung', category: 'Automatisierung & Datenforschung', status: 'Forschungsprototyp' },
      { name: 'Finanztransaktions-Tracker', category: 'FinTech-UI', status: 'App-Prototyp' },
      { name: 'Individuelle Web-Erlebnisse', category: 'Kommerziell, Privat, Portfolios u.v.m.', status: 'Professionelles Backend' },
      { name: '3D-Charakter- & Rigging-Vorbereitung', category: 'Kreativ-Pipeline', status: 'Visuelle Entwicklung' },
      { name: 'Motion-, Gaming- & Interface-Experimente', category: 'Prototyp-Labor', status: 'Laufendes Labor' },
    ],
    liveProject: 'Live-Projekt ↗',
    github: 'GitHub ↗',
    hobbyProject: 'Hobbyprojekt',
    close: 'Schließen',
    loadingConstellation: 'Konstellation lädt…',
    auditOnpage: 'Onpage-Score',
    auditTech: 'Technik & Meta',
    auditStructure: 'Struktur',
    auditContent: 'Inhalt',
    auditSource: 'Geprüft mit',
  },
  projectOrbsMobile: {
    tapHint: 'System antippen zum Ansehen',
  },
  phoneStory: {
    ariaLabel: 'Komplett auf einem Smartphone gebaut',
    screenLine1: 'KEIN PC.',
    screenLine2: 'KEIN LAPTOP.',
    screenLine3: 'KOMPLETT AUF DEM IPHONE GEBAUT.',
    lines: [
      'Jedes System auf dieser Seite,',
      'der Agent, die Plattformen, die Deployments,',
      'wurde entworfen, geschrieben und ausgeliefert',
      'auf einem Smartphone.',
    ],
  },
  about: {
    kicker: 'Über mich',
    heading: 'Ich denke in Systemen und liefere Produkte.',
    intro:
      'Meine Arbeit liegt da, wo technische Architektur, Produktdenken, Design und Automatisierung zusammenkommen. Autonome Agenten, Live-Kundensysteme, alles dazwischen: Ich liefere den ganzen Kreislauf, nicht die Demo.',
    stat1Label: 'Gebaute Systeme',
    stat2Label: 'Produktbereiche',
    storyLabel: 'Die Kurzfassung',
    storyHeading: 'Hi, ich bin Issa: 25, Autodidakt und voll auf KI fokussiert.',
    story: [
      {
        flag: 'Ursprung',
        title: 'Von Natur aus neugierig',
        body: 'Die digitale Welt und alles, was sie möglich macht, hat mich schon immer fasziniert, solange ich zurückdenken kann.',
      },
      {
        flag: 'Der Funke',
        title: 'ChatGPT hat den Stein ins Rollen gebracht',
        body: 'Als OpenAI die KI-Welle lostrat, entzündete das eine Leidenschaft, von der ich nicht wusste, dass ich sie hatte. Plötzlich hatte all diese Neugier eine Richtung.',
      },
      {
        flag: 'Seitdem',
        title: 'Jeden einzelnen Tag etwas Neues',
        body: 'Ich bringe mir täglich neue Dinge bei und tue alles dafür, immer auf dem aktuellen Stand dessen zu bleiben, was KI und Software leisten können.',
      },
      {
        flag: 'Auf dem Papier',
        title: 'In der realen Welt verankert',
        body: 'Fachabitur im Bereich Wirtschaft und Verwaltung, mit guten Noten abgeschlossen, dazu Vollzeitjobs nebenbei, die mir gezeigt haben, wie Arbeit wirklich funktioniert.',
      },
    ],
    pillars: [
      {
        title: 'Problemlösung',
        body: 'Ich starte bei der echten Einschränkung, nicht beim schicken Tool. Die richtige Lösung ist die einfachste, die in der Produktion Bestand hat.',
      },
      {
        title: 'Softwarearchitektur',
        body: 'Systeme, die beim Skalieren sauber bleiben: klare Grenzen, vorhersehbarer Datenfluss und Schnittstellen, die gut altern.',
      },
      {
        title: 'Automatisierung',
        body: 'Wenn es zweimal passiert, sollte es von selbst laufen. Ich verwandle repetitive Arbeit in Pipelines, die halten und die man im Blick behält.',
      },
      {
        title: 'Künstliche Intelligenz',
        body: 'Hier tauche ich am tiefsten ein. Echte KI in echten Systemen, mit ordentlichem Retrieval, Tooling und Guardrails dahinter, nicht ein API-Wrapper mit hübschem Prompt. Das Ziel bleibt gleich: zuverlässig genug, um sie wirklich in Betrieb zu nehmen.',
      },
      {
        title: 'Systemdenken',
        body: 'Ich entwerfe auch für den Fall, dass etwas schiefgeht: Eingaben, Feedback, Fehler, Wiederherstellung. Der Idealfall ist der einfache Teil.',
      },
    ],
  },
  techStack: {
    kicker: 'Werkzeugkasten',
    heading: 'Der Stack hinter den Systemen.',
    subtitle: 'Die Werkzeuge, mit denen ich komplette Systeme entwerfe, baue und end-to-end ausliefere.',
    loading: 'Stack lädt…',
    matrix: [
      { layer: 'Kern & Logik', items: 'TypeScript, JavaScript, Node.js, Express.js, Python, Regel-Engines' },
      { layer: 'Frontend & Motion', items: 'React, Vite, Tailwind CSS, Three.js, Framer Motion, GSAP' },
      { layer: 'Daten & Speicher', items: 'PostgreSQL, Drizzle ORM, Zod, OAuth2' },
      { layer: 'KI & Gedächtnis', items: 'Autonome Agenten, Wissensgraphen, Nexus Brain, gewichtete Erfahrungsschleifen' },
      { layer: 'Infrastruktur', items: 'Linux/Ubuntu VPS, Windows-Instanzen, Railway, Render, Replit, Cloudflare' },
      { layer: 'Messaging & Zustellung', items: 'Telegram-Bots, WhatsApp, Resend-E-Mail, Webhooks, automatisierte Verarbeitungspipelines' },
      { layer: 'Suche & Wachstum', items: 'Technisches SEO, AEO, JSON-LD, Sitemaps, lokale Sucharchitektur' },
      { layer: 'Produktbereiche', items: 'Gaming, EdTech, Operations, Logistik, FinTech, Markenproduktion, Utilities' },
    ],
  },
  process: {
    kicker: 'Produktionsphasen',
    heading: 'Wie aus einer Idee ein System wird.',
    steps: [
      { title: 'Idee', body: 'Das eigentliche Problem und das Ergebnis verstehen, auf das es wirklich ankommt.' },
      { title: 'Recherche', body: 'Einschränkungen, Daten, Modelle und bestehende Ansätze erkunden, bevor Code geschrieben wird.' },
      { title: 'Architektur', body: 'Klare Grenzen und Datenfluss entwerfen, die ohne Nacharbeit skalieren.' },
      { title: 'Entwicklung', body: 'In engen Iterationen ausliefern, mit eingebauter Qualität und Beobachtbarkeit.' },
      { title: 'Deployment', body: 'Sicher veröffentlichen mit automatisierten Pipelines und unterbrechungsfreien Rollouts.' },
      { title: 'Automatisierung', body: 'Manuelle Schritte entfernen, damit das System sich selbst am Laufen hält und heilt.' },
      { title: 'Kontinuierliche Verbesserung', body: 'Messen, lernen und verfeinern. Der Kreislauf endet eigentlich nie.' },
    ],
  },
  contact: {
    kicker: 'Kontakt',
    heading: 'So erreichst du mich.',
    subtitle:
      'Ob konkretes Projekt oder erste Idee – schreib mir, und wir finden heraus, was sich daraus bauen lässt.',
    emailLabel: 'E-Mail',
    phoneLabel: 'Telefon',
    locationLabel: 'Standort',
    locationValue: 'Deutschland',
    cta: 'Projekt anfragen',
    ctaSubject: 'Projektanfrage',
  },
  consent: {
    kicker: 'Datenschutz',
    bannerAria: 'Datenschutz-Einstellungen',
    bannerBody:
      'Diese Seite setzt keine Cookies und nutzt keine Analyse-Werkzeuge. Eine Sache braucht Ihre Entscheidung: Der KI-Agent L.U.K.A.S. l\u00e4dt fremden Code und \u00fcbertr\u00e4gt, wenn Sie mit ihm sprechen, Ihre Nachrichten \u2014 im Sprachmodus auch Ihr Mikrofon-Audio \u2014 an Dritte.',
    privacyLink: 'Datenschutzhinweise',
    acceptAll: 'L.U.K.A.S. erlauben',
    rejectAll: 'Ablehnen',
    settings: 'Details',
    settingsTitle: 'Datenschutz-Einstellungen',
    settingsIntro:
      'Hier steht nur, was auf dieser Seite tats\u00e4chlich l\u00e4uft. Mehr gibt es nicht abzuschalten.',
    necessaryTitle: 'Notwendig',
    necessaryBody:
      'Ihre Sprachwahl (Deutsch/Englisch) wird im localStorage Ihres Browsers gespeichert, damit die Seite in der gew\u00e4hlten Sprache bleibt. Sie verl\u00e4sst Ihr Ger\u00e4t nicht. Cookies werden auf dieser Seite an keiner Stelle gesetzt.',
    alwaysOn: 'Immer aktiv',
    lukasTitle: 'KI-Agent L.U.K.A.S.',
    lukasBody:
      'L\u00e4dt das Chat-Widget vom Agenten-Server (Railway, EU) und sendet die von Ihnen getippten Nachrichten dorthin, damit er antworten kann. Bei Sprachnutzung baut Ihr Browser eine direkte Verbindung zu OpenAI (api.openai.com, USA) auf und \u00fcbertr\u00e4gt Ihr Mikrofon-Audio, solange das Gespr\u00e4ch l\u00e4uft. Ohne diese Zustimmung wird der Agent gar nicht erst geladen.',
    lukasToggleAria: 'KI-Agent L.U.K.A.S. erlauben',
    withdraw: 'Einwilligung widerrufen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    footerLink: 'Datenschutz-Einstellungen',
  },
  footer: {
    tagline: 'Autonome Systeme & Full-Stack-Architektur',
    copyright: 'Konzipiert, geschrieben & gebaut von Issa Hareb.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
  },
  legal: {
    back: 'Zurück zur Startseite',
    impressumTitle: 'Impressum',
    datenschutzTitle: 'Datenschutzerklärung',
    impressum: [
      {
        heading: 'Angaben gemäß § 5 DDG',
        body: ['Issa Hareb', 'Europaring 90', '53757 Sankt Augustin', 'Deutschland'],
      },
      {
        heading: 'Kontakt',
        body: ['E-Mail: Impressum@hareb.org', 'Telefon: 01525 9559708'],
      },
      {
        heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
        body: ['Issa Hareb, Anschrift wie oben.'],
      },
      {
        heading: 'Haftungsausschluss',
        body: [
          'Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.',
        ],
      },
    ],
    datenschutz: [
      {
        heading: 'Verantwortlicher',
        body: [
          'Verantwortlich für die Datenverarbeitung auf dieser Website ist:',
          'Issa Hareb, Europaring 90, 53757 Sankt Augustin, Deutschland',
          'E-Mail: Impressum@hareb.org · Telefon: 01525 9559708',
        ],
      },
      {
        heading: 'Hosting und Server-Logfiles',
        body: [
          'Beim Aufruf dieser Website erfasst der Hosting-Provider automatisch technische Informationen wie IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seite und verwendeten Browser (Server-Logfiles). Diese Daten werden ausschließlich zur Gewährleistung eines störungsfreien Betriebs sowie zur Verbesserung des Angebots verarbeitet und nicht mit anderen Datenquellen zusammengeführt.',
        ],
      },
      {
        heading: 'Keine Cookies, keine Analyse, kein Tracking',
        body: [
          'Diese Website setzt keinerlei Cookies. Es gibt keine Webanalyse, kein Tracking-Pixel, kein Werbenetzwerk und keine seitenübergreifende Profilbildung. Eine Reichweitenmessung findet hier in keiner Form statt.',
        ],
      },
      {
        heading: 'Lokale Speicherung Ihrer Spracheinstellung',
        body: [
          'Ihre gewählte Sprache (Deutsch/Englisch) wird ausschließlich lokal in Ihrem Browser (localStorage) gespeichert, um sie bei einem erneuten Besuch beizubehalten. Diese Information verlässt Ihr Gerät nicht und wird nicht an mich übertragen.',
        ],
      },
      {
        heading: 'KI-Agent L.U.K.A.S. (einwilligungspflichtig)',
        body: [
          'Der Agent L.U.K.A.S. wird ausschließlich geladen, wenn Sie dem ausdrücklich zugestimmt haben. Bis dahin wird kein fremder Code vom Agenten-Server angefordert und es werden keine Daten dorthin übertragen. Rechtsgrundlage ist Ihre Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG.',
          'Nach Ihrer Zustimmung wird das Chat-Widget vom Agenten-Server geladen, der bei Railway (EU-Region) gehostet wird. Die von Ihnen dort eingegebenen Nachrichten werden übertragen, damit der Agent sie beantworten kann.',
          'Bei Nutzung der Sprachfunktion fordert Ihr Browser zusätzlich Zugriff auf Ihr Mikrofon an und baut eine direkte Verbindung zu OpenAI (api.openai.com) auf. Ihr Mikrofon-Audio und die daraus erzeugte Verschriftlichung werden für die Dauer des Gesprächs an die OpenAI, Inc., USA — also in ein Drittland — übertragen. Audiodaten werden erst erfasst, nachdem Sie selbst ein Sprachgespräch gestartet haben.',
          'Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft über „Datenschutz-Einstellungen" im Fußbereich widerrufen. Nach dem Widerruf wird der Agent nicht mehr geladen. Die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung bleibt davon unberührt.',
          'Bitte geben Sie im Agenten keine personenbezogenen Daten Dritter und keine sensiblen eigenen Daten ein.',
        ],
      },
      {
        heading: 'Ihre Rechte',
        body: [
          'Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer personenbezogenen Daten sowie ein Recht auf Datenübertragbarkeit und Widerspruch. Wenden Sie sich hierzu gerne per E-Mail an Impressum@hareb.org.',
          'Außerdem steht Ihnen ein Beschwerderecht bei der zuständigen Datenschutzaufsichtsbehörde zu.',
        ],
      },
    ],
  },
}
