'use client'

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EN, DE, type Dictionary } from '@/lib/translations'

export type Lang = 'en' | 'de'

const STORAGE_KEY = 'site-lang'

type LanguageContextValue = {
  lang: Lang | null
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const EN_REFINED: Dictionary = {
  ...EN,
  hero: {
    ...EN.hero,
    headingLine1: 'I build digital products.',
    headingLine2: 'Designed, engineered and run in production.',
    headingPlain: 'I build digital products. Designed, engineered and run in production.',
    lead: 'Websites and applications with clear design, a reliable backend and a solid technical foundation.',
    body: 'Design, development and deployment from one source.',
  },
  statement: {
    ...EN.statement,
    lead: 'I design websites where 3D and motion are used *deliberately*, not as decoration.',
    proof: 'Technical SEO, structured data and performance are built in from the start and checked against real results.',
    extra: 'I also build AI agents and automations for clearly defined tasks.',
  },
  services: {
    ...EN.services,
    heading: 'Websites, applications and automation from one source.',
    intro:
      'I plan, design and build complete digital products: interface, backend, database, integrations and deployment. The result is a working system, not a presentation of one.',
    closingKicker: 'How I work',
    closingBody:
      'I use AI as a tool for research, implementation and testing. Architecture, product decisions and quality control stay with me.',
    closingHighlight:
      'The standard is simple: the result has to be understandable, stable and useful in daily work.',
  },
  projects: {
    ...EN.projects,
    heading: 'Built projects and selected design directions.',
    subtitle:
      'Open a project for its function, technology and current status. The design directions show possible visual approaches.',
  },
  about: {
    ...EN.about,
    heading: 'I connect design, software and automation.',
    intro:
      'I develop digital products from interface to live operation, working across architecture, design, backend and deployment.',
    storyHeading: "Hi, I'm Issa: a self-taught developer focused on AI and web products.",
    story: [
      {
        flag: 'Starting point',
        title: 'Curiosity for digital products',
        body: 'I am interested in how design, technology and business processes work together.',
      },
      {
        flag: 'Entry',
        title: 'AI turned interest into practice',
        body: 'My first AI projects pushed me to learn software development systematically and apply it every day.',
      },
      {
        flag: 'Today',
        title: 'Learning through real projects',
        body: 'I build products and client systems, measure what works and improve them in operation.',
      },
      {
        flag: 'Background',
        title: 'Business and practical work',
        body: 'A Fachabitur in business and administration, plus professional experience in customer service, sales and organisation.',
      },
    ],
  },
  techStack: {
    ...EN.techStack,
    heading: 'Tools used in real projects.',
    subtitle: 'A working selection across frontend, backend, data, AI, infrastructure and motion.',
  },
  process: {
    ...EN.process,
    heading: 'From the first conversation to a running product.',
    steps: [
      { title: 'Requirements', body: 'Clarify the problem, users, constraints and the result the project has to achieve.' },
      { title: 'Concept', body: 'Define scope, content, functions and the shortest sensible route to a first release.' },
      { title: 'Design & architecture', body: 'Shape the interface, data model and technical boundaries before implementation grows expensive.' },
      { title: 'Implementation', body: 'Build in focused iterations and keep progress visible instead of disappearing into a long development phase.' },
      { title: 'Testing & launch', body: 'Test the important paths, deploy safely and verify the live system on real devices.' },
      { title: 'Further development', body: 'Use feedback and operating data to decide what should be improved next.' },
    ],
  },
  contact: {
    ...EN.contact,
    heading: "Let's discuss your project.",
    subtitle:
      'Send me a brief outline. I will reply with an honest assessment of scope, approach and the next useful step.',
    offerTitle: 'A first design direction, free of charge.',
    offerBody:
      'Describe your business and goal in two sentences. I will send you an initial visual direction for the start page.',
  },
  footer: {
    ...EN.footer,
    tagline: 'Websites, software & AI automation',
  },
}

const DE_REFINED: Dictionary = {
  ...DE,
  hero: {
    ...DE.hero,
    headingLine1: 'Ich entwickle digitale Produkte.',
    headingLine2: 'Gestaltet, programmiert und live betrieben.',
    headingPlain: 'Ich entwickle digitale Produkte. Gestaltet, programmiert und live betrieben.',
    lead: 'Websites und Anwendungen mit klarer Gestaltung, belastbarem Backend und sauberem technischen Fundament.',
    body: 'Design, Entwicklung und Deployment aus einer Hand.',
  },
  statement: {
    ...DE.statement,
    lead: 'Ich gestalte Websites, in denen 3D und Bewegung *gezielt* eingesetzt werden, nicht als Dekoration.',
    proof: 'Technisches SEO, strukturierte Daten und Performance werden von Anfang an mitgebaut und anhand echter Ergebnisse geprüft.',
    extra: 'Dazu entwickle ich KI-Agenten und Automatisierungen für klar umrissene Aufgaben.',
  },
  services: {
    ...DE.services,
    heading: 'Websites, Anwendungen und Automatisierungen aus einer Hand.',
    intro:
      'Ich plane, gestalte und entwickle vollständige digitale Produkte: Oberfläche, Backend, Datenbank, Schnittstellen und Deployment. Das Ergebnis ist ein funktionierendes System, keine Präsentation davon.',
    closingKicker: 'Wie ich arbeite',
    closingBody:
      'Ich nutze KI als Werkzeug für Recherche, Umsetzung und Tests. Architektur, Produktentscheidungen und Qualitätskontrolle bleiben bei mir.',
    closingHighlight:
      'Der Maßstab ist einfach: Das Ergebnis muss verständlich, stabil und im Alltag nützlich sein.',
  },
  projects: {
    ...DE.projects,
    heading: 'Gebaute Projekte und ausgewählte Designrichtungen.',
    subtitle:
      'Öffne ein Projekt für Funktion, Technik und aktuellen Status. Die Designrichtungen zeigen mögliche visuelle Ansätze.',
  },
  about: {
    ...DE.about,
    heading: 'Ich verbinde Gestaltung, Software und Automatisierung.',
    intro:
      'Ich entwickle digitale Produkte von der Oberfläche bis zum Livebetrieb und arbeite dabei an Architektur, Design, Backend und Deployment.',
    storyHeading: 'Hi, ich bin Issa: autodidaktischer Entwickler mit Schwerpunkt KI und Webprodukte.',
    story: [
      {
        flag: 'Ausgangspunkt',
        title: 'Neugier für digitale Produkte',
        body: 'Mich interessiert, wie Gestaltung, Technik und Geschäftsabläufe zusammenwirken.',
      },
      {
        flag: 'Einstieg',
        title: 'Mit KI wurde aus Interesse Praxis',
        body: 'Die ersten eigenen KI-Projekte haben mich dazu gebracht, Softwareentwicklung systematisch zu lernen und täglich anzuwenden.',
      },
      {
        flag: 'Heute',
        title: 'Lernen durch echte Projekte',
        body: 'Ich baue eigene Produkte und Kundensysteme, messe was funktioniert und verbessere sie im Betrieb.',
      },
      {
        flag: 'Hintergrund',
        title: 'Wirtschaft und praktische Arbeit',
        body: 'Fachabitur in Wirtschaft und Verwaltung sowie Berufserfahrung in Kundenkontakt, Verkauf und Organisation.',
      },
    ],
  },
  techStack: {
    ...DE.techStack,
    heading: 'Werkzeuge, die in echten Projekten eingesetzt werden.',
    subtitle: 'Eine Arbeitsauswahl aus Frontend, Backend, Daten, KI, Infrastruktur und Motion.',
  },
  process: {
    ...DE.process,
    heading: 'Vom ersten Gespräch bis zum laufenden Produkt.',
    steps: [
      { title: 'Anforderungen', body: 'Problem, Nutzer, Rahmenbedingungen und das gewünschte Ergebnis klären.' },
      { title: 'Konzept', body: 'Umfang, Inhalte, Funktionen und den sinnvollsten Weg zur ersten Version festlegen.' },
      { title: 'Design & Architektur', body: 'Oberfläche, Datenmodell und technische Grenzen entwerfen, bevor Änderungen teuer werden.' },
      { title: 'Umsetzung', body: 'In klaren Etappen entwickeln und den Fortschritt sichtbar halten.' },
      { title: 'Tests & Launch', body: 'Wichtige Abläufe prüfen, sicher veröffentlichen und das Live-System auf echten Geräten kontrollieren.' },
      { title: 'Weiterentwicklung', body: 'Feedback und Betriebsdaten nutzen, um die nächsten Verbesserungen sinnvoll zu priorisieren.' },
    ],
  },
  contact: {
    ...DE.contact,
    heading: 'Lass uns über dein Projekt sprechen.',
    subtitle:
      'Schick mir kurz, was du vorhast. Ich antworte mit einer ehrlichen Einschätzung zu Umfang, Vorgehen und dem nächsten sinnvollen Schritt.',
    offerTitle: 'Ein erster Design-Ansatz – kostenlos.',
    offerBody:
      'Beschreibe dein Unternehmen und dein Ziel in zwei Sätzen. Ich schicke dir einen ersten visuellen Ansatz für die Startseite.',
  },
  footer: {
    ...DE.footer,
    tagline: 'Websites, Software & KI-Automatisierung',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null)

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'de' || stored === 'en') {
      setLangState(stored)
      return
    }

    const browserLanguage = navigator.languages?.[0] ?? navigator.language
    setLangState(browserLanguage.toLowerCase().startsWith('de') ? 'de' : 'en')
  }, [])

  useLayoutEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  const firstLangRef = useRef(true)
  useEffect(() => {
    if (!lang) return
    if (firstLangRef.current) {
      firstLangRef.current = false
      return
    }

    const lenisWindow = window as unknown as { __lenis?: { start: () => void } }
    lenisWindow.__lenis?.start()
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(frame)
  }, [lang])

  const setLang = (next: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider')
  return context
}

export function useT(): Dictionary {
  const { lang } = useLanguage()
  return lang === 'en' ? EN_REFINED : DE_REFINED
}
