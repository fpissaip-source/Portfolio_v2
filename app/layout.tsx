import type { Metadata, Viewport } from 'next'
import { Anton, League_Spartan, Oswald, Source_Sans_3 } from 'next/font/google'
import { LanguageProvider } from '@/components/language-context'
import './globals.css'
import './elegant-headings.css'

/* ── Four typefaces, four jobs ────────────────────────────────────────────
   The old set was Geist + Geist Mono + Bricolage Grotesque + Space Grotesk:
   three grotesques doing nearly the same job, so nothing on the page had a
   clear rank. Each face below has exactly one role and looks unmistakably
   unlike the other three, which is what makes hierarchy readable at a
   glance rather than something you have to work out. */

// Reading face. Adobe drew Source Sans for interfaces and long screen text:
// large x-height, open apertures, unambiguous I/l/1. It is the reason body
// copy can now run at 18px and stay comfortable.
const bodyFace = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body-face',
})

// Section headings. Geometric, wide-open shapes, and a full 100–900 weight
// axis so an h2 and an h3 can differ by weight instead of by size alone.
const headingFace = League_Spartan({
  subsets: ['latin'],
  variable: '--font-heading-face',
})

// Poster face. Used only where the page is allowed to shout: the hero
// headline and the two full-bleed wordmarks. Condensed, so long German
// compounds still fit on one line, and heavy enough that nothing else on
// the site can be mistaken for it.
const posterFace = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-poster-face',
})

// Labels. Narrow uppercase for section kickers and metadata — the signpost
// layer. Replaces the old mono, which read as a terminal prop rather than
// as typography.
const labelFace = Oswald({
  subsets: ['latin'],
  variable: '--font-label-face',
})

const SITE_URL = 'https://issahareb.me'
const SITE_TITLE = 'Issa Hareb | Full-Stack & AI Engineer aus Essen'
const SITE_DESCRIPTION =
  'Issa Hareb entwickelt intelligente Systeme aus Essen: Websites, Webanwendungen, KI-Agenten und Automatisierungen. Oberfläche, Backend und Deployment aus einer Hand, von der ersten Idee bis zum Livebetrieb.'
const SITE_DESCRIPTION_EN =
  'Issa Hareb builds intelligent systems from Essen, Germany: websites, web applications, AI agents and automations. Interface, backend and deployment from one pair of hands.'

/** Entity ids. Stable, absolute and reused by every node in the graph, so a
 *  parser links them into one description of one person instead of three
 *  unrelated fragments (the pattern the taxibbessen site scores on). */
const PERSON_ID = `${SITE_URL}/#person`
const WEBSITE_ID = `${SITE_URL}/#website`
const PAGE_ID = `${SITE_URL}/#webpage`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Issa Hareb',
  },
  description: SITE_DESCRIPTION,
  applicationName: 'Issa Hareb',
  authors: [{ name: 'Issa Hareb', url: SITE_URL }],
  creator: 'Issa Hareb',
  publisher: 'Issa Hareb',
  category: 'technology',
  alternates: {
    canonical: '/',
    languages: {
      // One URL serves both languages (the switch is client-side), so both
      // hreflang values point at it rather than at pages that don't exist.
      'de-DE': '/',
      'en': '/',
      'x-default': '/',
    },
  },
  // Explicit rather than inherited: the defaults cap snippet length and
  // image previews, which is the opposite of what a site written to be
  // quoted by answer engines wants.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: 'Issa Hareb',
    type: 'profile',
    locale: 'de_DE',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION_EN,
  },
}

/**
 * Structured data as one @graph rather than a lone Person node.
 *
 * Three things are being stated, and they have to be stated as one linked
 * set: who this is (Person), what this site is (WebSite), and what this
 * page is (ProfilePage about that person). `knowsAbout` and `makesOffer`
 * are the parts an answer engine can actually quote back — "who builds AI
 * agents and complete backends near Essen" is the question this site wants
 * to be an answer to, and that answer has to be machine-readable, not only
 * legible in the services section.
 *
 * Everything here is also visible on the page. Structured data that claims
 * more than the page shows is the one way to lose the whole graph.
 */
const OFFERS = [
  {
    name: 'Websites und digitale Kundenprozesse',
    description:
      'Websites mit Buchungsformularen, automatischen E-Mails, Kundenbereich, Admin-Oberfläche und technischem SEO.',
  },
  {
    name: 'Individuelle Webanwendungen',
    description:
      'Dashboards, CRM, Buchungssysteme, Rollen und Rechte, Datenplattformen, zugeschnitten auf den vorhandenen Ablauf.',
  },
  {
    name: 'KI-Agenten und Automatisierungen',
    description:
      'Agenten mit dauerhaftem Gedächtnis, die echte Aufgaben übernehmen und an bestehende Werkzeuge angebunden sind.',
  },
  {
    name: 'Backend, Datenbank und Deployment',
    description:
      'Datenmodell, APIs, Authentifizierung, Deployment und Monitoring: der Teil, der ein Projekt zu einem laufenden System macht.',
  },
  {
    name: 'SEO, AEO und GEO',
    description:
      'Technische Suchmaschinenoptimierung, strukturierte Daten und Inhalte, die von Antwortmaschinen zitierbar sind.',
  },
]

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Issa Hareb',
      url: `${SITE_URL}/`,
      jobTitle: 'Full-Stack & AI Engineer',
      description: SITE_DESCRIPTION,
      email: 'mailto:info@hareb.org',
      telephone: '+49-1525-9559708',
      nationality: { '@type': 'Country', name: 'Germany' },
      knowsLanguage: ['de', 'en'],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Essen',
        addressRegion: 'Nordrhein-Westfalen',
        addressCountry: 'DE',
      },
      knowsAbout: [
        'Full-Stack-Entwicklung',
        'KI-Agenten',
        'Automatisierung',
        'Next.js',
        'TypeScript',
        'PostgreSQL',
        'Technisches SEO',
        'Answer Engine Optimization',
        'Generative Engine Optimization',
        'Webdesign',
        '3D im Web',
      ],
      makesOffer: OFFERS.map((offer) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: offer.name,
          description: offer.description,
          provider: { '@id': PERSON_ID },
          areaServed: [
            { '@type': 'City', name: 'Essen' },
            { '@type': 'Country', name: 'Germany' },
          ],
        },
      })),
      sameAs: ['https://github.com/fpissaip-source'],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: 'Issa Hareb',
      description: SITE_DESCRIPTION,
      inLanguage: ['de-DE', 'en'],
      publisher: { '@id': PERSON_ID },
    },
    {
      '@type': 'ProfilePage',
      '@id': PAGE_ID,
      url: `${SITE_URL}/`,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: 'de-DE',
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      mainEntity: { '@id': PERSON_ID },
    },
  ],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      className={`${bodyFace.variable} ${headingFace.variable} ${posterFace.variable} ${labelFace.variable} bg-background`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        {/* @vercel/analytics is deliberately not mounted. This site is
            deployed on Railway, not Vercel, so the script it injects —
            /_vercel/insights/script.js — is served by nothing: verified 404
            on the live domain, i.e. a failed request on every single visit
            that collected no data in return. The dependency stays in
            package.json so this is one line to restore if the site ever
            moves to Vercel. */}
      </body>
    </html>
  )
}
