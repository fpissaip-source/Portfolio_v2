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
    lukas: string
    work: string
    about: string
    stack: string
    process: string
    contact: string
  }
  scene: {
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
    chooseLanguage: string
    welcome: string
    loading: string
    caption: string
    pcHint: string
  }
  cinematicIntro: {
    scrollToMeet: string
    introTitle: string
    phrases: string[]
    scroll: string
    screenSubtitle: string
  }
  hero: {
    kicker: string
    line1: string
    line2: string
    line3: string
    body: string
  }
  lukas: {
    subtitle: string
    beats: { kicker: string; title: string; body: string[] }[]
  }
  projects: {
    kicker: string
    heading: string
    subtitle: string
    dragHint: string
    registerLabel: string
    projects: Record<string, ProjectCopy>
    register: { name: string; category: string; status: string }[]
    liveProject: string
    github: string
    hobbyProject: string
    close: string
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
    phoneBadge: string
    phoneBodyPre: string
    phoneBodyBold: string
    phoneBodyPost: string
    stat1Label: string
    stat2Label: string
    stat3Label: string
    storyLabel: string
    storyHeading: string
    story: { flag: string; title: string; body: string }[]
    pillars: { title: string; body: string }[]
  }
  techStack: {
    kicker: string
    heading: string
    subtitle: string
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
  }
  footer: {
    tagline: string
    copyright: string
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
      'A transport & logistics platform delivered end-to-end for a real client, the first B2B/B2C deployment. Instant and scheduled bookings, a PostgreSQL-backed admin area, Resend email workflows, and uncompromising technical SEO with JSON-LD Answer Engine Optimization.',
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
      'Eine Transport- & Logistikplattform, End-to-End für einen echten Kunden umgesetzt, das erste B2B/B2C-Deployment. Sofort- und geplante Buchungen, ein PostgreSQL-basierter Admin-Bereich, Resend-E-Mail-Workflows und kompromisslose technische SEO mit JSON-LD Answer Engine Optimization.',
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
    lukas: 'L.U.K.A.S.',
    work: 'Work',
    about: 'About',
    stack: 'Stack',
    process: 'Process',
    contact: 'Contact',
  },
  scene: {
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
      'I build automations',
      'I build intelligent systems',
      'I ship on iPhone',
      'I build products end to end',
    ],
    chooseLanguage: 'Choose your language',
    welcome: 'Welcome',
    loading: 'Loading',
    caption: 'Issa Hareb · Portfolio',
    pcHint: 'Best experienced on a PC or laptop',
  },
  cinematicIntro: {
    scrollToMeet: 'Scroll to meet',
    introTitle: 'Let me introduce myself.',
    phrases: [
      'Building Intelligent Systems',
      'AI Automation',
      'Full Stack Development',
      'I built everything entirely on iPhone. No PC. No Laptop!',
      'Software That Solves Real Problems',
    ],
    scroll: 'Scroll',
    screenSubtitle: 'Building intelligent systems',
  },
  hero: {
    kicker: 'Issa Hareb · Curriculum Vitae',
    line1: 'Building',
    line2: 'Intelligent',
    line3: 'Systems.',
    body: "I build with AI as a genuine engineering partner. What makes that unusual: I don't own a PC or a laptop. Every system I design, build and ship is created entirely from my iPhone, end to end.",
  },
  lukas: {
    subtitle: 'Logical Universal Knowledge Agent System',
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
  },
  projects: {
    kicker: 'Featured Work',
    heading: 'Selected Systems',
    subtitle: 'A connected ecosystem of platforms, agents and automation systems.',
    dragHint: 'Drag to explore · Select a node to inspect',
    registerLabel: 'Complete Project Register',
    projects: projectsEN,
    register: [
      { name: 'Polymarket / Trading Automation', category: 'Automation & Data R&D', status: 'Research Prototype' },
      { name: 'Financial Transaction Tracker', category: 'FinTech UI', status: 'App Prototype' },
      { name: 'TENSA. Digital Production System', category: 'Brand Operations', status: 'Active Brand Project' },
      { name: 'MoncyDev / Portfolio Web Systems', category: 'Web Experience', status: 'Web Portfolio Work' },
      { name: '3D Character & Rigging Preparation', category: 'Creative Pipeline', status: 'Visual Development' },
      { name: 'Motion, Gaming & Interface Experiments', category: 'Prototype Lab', status: 'Ongoing Lab' },
    ],
    liveProject: 'Live Project ↗',
    github: 'GitHub ↗',
    hobbyProject: 'Hobby Project',
    close: 'Close',
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
      'My work connects technical architecture, product thinking, visual design, automation and commercial deployment. From autonomous agents to live client systems: I ship the whole loop, not just the demo.',
    phoneBadge: 'No PC. No laptop. Just an iPhone.',
    phoneBodyPre: "Here's what I'm most proud of: I've ",
    phoneBodyBold: 'built all of this without a computer',
    phoneBodyPost:
      '. Every architecture decision, every line of code and every deployment happens entirely from my iPhone. It forced me to think sharper, lean on AI as a real engineering partner, and prove that great software is about how you think, not the hardware you own.',
    stat1Label: 'Systems built',
    stat2Label: 'Product domains',
    stat3Label: 'Built on iPhone',
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
        body: 'This is where I go deepest. I build AI into real systems, with proper retrieval, tooling and guardrails, not just an API wrapper. The goal is always the same: make it dependable enough to ship.',
      },
      {
        title: 'System Thinking',
        body: 'I design for the whole loop, from inputs and feedback to failure and recovery, not just the happy path.',
      },
    ],
  },
  techStack: {
    kicker: 'Toolkit',
    heading: 'The stack behind the systems.',
    subtitle: 'The tools I use to design, build and ship complete systems, end to end.',
    matrix: [
      { layer: 'Core & Logic', items: 'TypeScript, JavaScript, Node.js, Express.js, Python, rule engines' },
      { layer: 'Frontend & Motion', items: 'React, Vite, Tailwind CSS, Three.js, Framer Motion, GSAP' },
      { layer: 'Data & APIs', items: 'PostgreSQL, Drizzle ORM, Zod, REST APIs, OAuth2, Bungie API' },
      { layer: 'AI & Memory', items: 'Autonomous agents, knowledge graphs, Nexus Brain, weighted experience loops' },
      { layer: 'Infrastructure', items: 'Linux/Ubuntu VPS, Windows instances, Railway, Render, Replit, Cloudflare' },
      { layer: 'Messaging & Delivery', items: 'Telegram bots, Resend e-mail, webhooks, automated processing pipelines' },
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
    subtitle: 'Currently open to engineering and AI-focused roles and collaborations.',
    emailLabel: 'Email',
    phoneLabel: 'Phone',
    locationLabel: 'Location',
    locationValue: 'Germany',
  },
  footer: {
    tagline: 'Autonomous systems & full-stack architecture',
    copyright: 'Directed, written & built by Issa Hareb. On a phone.',
  },
}

export const DE: Dictionary = {
  nav: {
    lukas: 'L.U.K.A.S.',
    work: 'Arbeiten',
    about: 'Über mich',
    stack: 'Stack',
    process: 'Prozess',
    contact: 'Kontakt',
  },
  scene: {
    lukas: 'L.U.K.A.S. · Das Betriebssystem hinter allem',
    work: 'Ausgewählte Arbeiten',
    phone: 'Komplett vom iPhone aus umgesetzt',
    about: 'Die Person hinter den Systemen',
    stack: 'Werkzeuge des Handwerks',
    process: 'Von der Idee zur Produktion',
    contact: 'Lass uns etwas bauen',
  },
  preloader: {
    taglines: [
      'Ich baue Automatisierungen',
      'Ich baue intelligente Systeme',
      'Ich entwickle auf dem iPhone',
      'Ich baue Produkte end-to-end',
    ],
    chooseLanguage: 'Wähle deine Sprache',
    welcome: 'Willkommen',
    loading: 'Lädt',
    caption: 'Issa Hareb · Portfolio',
    pcHint: 'Am besten auf einem PC oder Laptop erlebbar',
  },
  cinematicIntro: {
    scrollToMeet: 'Scrollen zum Kennenlernen',
    introTitle: 'Lass mich vorstellen, wer ich bin.',
    phrases: [
      'Baue intelligente Systeme',
      'KI-Automatisierung',
      'Full-Stack-Entwicklung',
      'Alles komplett auf dem iPhone gebaut. Kein PC. Kein Laptop!',
      'Software, die echte Probleme löst',
    ],
    scroll: 'Scrollen',
    screenSubtitle: 'Baue intelligente Systeme',
  },
  hero: {
    kicker: 'Issa Hareb · Lebenslauf',
    line1: 'Baue',
    line2: 'Intelligente',
    line3: 'Systeme.',
    body: 'Ich arbeite mit KI als echtem Engineering-Partner. Das Ungewöhnliche daran: Ich besitze weder PC noch Laptop. Jedes System, das ich entwerfe, baue und ausliefere, entsteht komplett auf meinem iPhone, von Anfang bis Ende.',
  },
  lukas: {
    subtitle: 'Logical Universal Knowledge Agent System',
    beats: [
      {
        kicker: 'Vision & Kernidentität',
        title: 'Ein Agent, der weiß, wer er ist.',
        body: [
          'Ein dauerhafter, autonomer Agent, dessen Verhalten aus einer lebendigen Entscheidungshistorie entsteht, nicht aus statischem Prompting.',
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
          'Einschließlich des philosophischen Grenzfalls: Ist das Systemfeedback, oder etwas, das sich wie Stolz anfühlt?',
        ],
      },
    ],
  },
  projects: {
    kicker: 'Ausgewählte Arbeiten',
    heading: 'Ausgewählte Systeme',
    subtitle: 'Ein vernetztes Ökosystem aus Plattformen, Agenten und Automatisierungssystemen.',
    dragHint: 'Ziehen zum Erkunden · Node auswählen zum Ansehen',
    registerLabel: 'Vollständiges Projektregister',
    projects: projectsDE,
    register: [
      { name: 'Polymarket / Trading-Automatisierung', category: 'Automatisierung & Daten-R&D', status: 'Forschungsprototyp' },
      { name: 'Finanztransaktions-Tracker', category: 'FinTech-UI', status: 'App-Prototyp' },
      { name: 'TENSA. Digitales Produktionssystem', category: 'Brand-Operations', status: 'Aktives Markenprojekt' },
      { name: 'MoncyDev / Portfolio-Websysteme', category: 'Web-Erlebnis', status: 'Web-Portfolio-Arbeit' },
      { name: '3D-Charakter- & Rigging-Vorbereitung', category: 'Kreativ-Pipeline', status: 'Visuelle Entwicklung' },
      { name: 'Motion-, Gaming- & Interface-Experimente', category: 'Prototyp-Labor', status: 'Laufendes Labor' },
    ],
    liveProject: 'Live-Projekt ↗',
    github: 'GitHub ↗',
    hobbyProject: 'Hobbyprojekt',
    close: 'Schließen',
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
      'Meine Arbeit verbindet technische Architektur, Produktdenken, visuelles Design, Automatisierung und kommerzielles Deployment. Von autonomen Agenten bis zu Live-Kundensystemen: Ich liefere den ganzen Kreislauf, nicht nur die Demo.',
    phoneBadge: 'Kein PC. Kein Laptop. Nur ein iPhone.',
    phoneBodyPre: 'Darauf bin ich am meisten stolz: Ich habe ',
    phoneBodyBold: 'das alles ohne einen Computer gebaut',
    phoneBodyPost:
      '. Jede Architekturentscheidung, jede Zeile Code und jedes Deployment passiert komplett auf meinem iPhone. Es hat mich gezwungen, schärfer zu denken, KI als echten Engineering-Partner zu nutzen, und zu beweisen, dass gute Software davon abhängt, wie man denkt, nicht von der Hardware, die man besitzt.',
    stat1Label: 'Gebaute Systeme',
    stat2Label: 'Produktbereiche',
    stat3Label: 'Auf dem iPhone gebaut',
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
        body: 'Wenn es zweimal passiert, sollte es von selbst laufen. Ich verwandle repetitive Arbeit in robuste, beobachtbare Pipelines.',
      },
      {
        title: 'Künstliche Intelligenz',
        body: 'Hier gehe ich am tiefsten. Ich baue KI in echte Systeme ein, mit richtigem Retrieval, Tooling und Guardrails, nicht nur als API-Wrapper. Das Ziel ist immer dasselbe: sie zuverlässig genug für den produktiven Einsatz zu machen.',
      },
      {
        title: 'Systemdenken',
        body: 'Ich entwerfe für den ganzen Kreislauf, von Eingaben und Feedback bis zu Fehlern und Wiederherstellung, nicht nur für den Idealfall.',
      },
    ],
  },
  techStack: {
    kicker: 'Werkzeugkasten',
    heading: 'Der Stack hinter den Systemen.',
    subtitle: 'Die Werkzeuge, mit denen ich komplette Systeme entwerfe, baue und end-to-end ausliefere.',
    matrix: [
      { layer: 'Kern & Logik', items: 'TypeScript, JavaScript, Node.js, Express.js, Python, Regel-Engines' },
      { layer: 'Frontend & Motion', items: 'React, Vite, Tailwind CSS, Three.js, Framer Motion, GSAP' },
      { layer: 'Daten & APIs', items: 'PostgreSQL, Drizzle ORM, Zod, REST-APIs, OAuth2, Bungie API' },
      { layer: 'KI & Gedächtnis', items: 'Autonome Agenten, Wissensgraphen, Nexus Brain, gewichtete Erfahrungsschleifen' },
      { layer: 'Infrastruktur', items: 'Linux/Ubuntu VPS, Windows-Instanzen, Railway, Render, Replit, Cloudflare' },
      { layer: 'Messaging & Zustellung', items: 'Telegram-Bots, Resend-E-Mail, Webhooks, automatisierte Verarbeitungspipelines' },
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
    subtitle: 'Aktuell offen für Engineering- und KI-fokussierte Rollen und Kooperationen.',
    emailLabel: 'E-Mail',
    phoneLabel: 'Telefon',
    locationLabel: 'Standort',
    locationValue: 'Deutschland',
  },
  footer: {
    tagline: 'Autonome Systeme & Full-Stack-Architektur',
    copyright: 'Konzipiert, geschrieben & gebaut von Issa Hareb. Auf einem Smartphone.',
  },
}
