import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { LanguageProvider } from '@/components/language-context'
import './globals.css'
import './loader-transition.css'
import './elegant-headings.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

// Headline face. A contemporary grotesque with real character in the
// letterforms — narrow apertures, a hard-cut 'a' and 'g', an optical-size
// axis that keeps large settings from going soft. It carries the same
// machined feel as the subject matter, where an editorial serif read
// literary, and it still separates cleanly from Geist in the interface and
// the mono kickers, which is the whole job of a display face here.
const displayFace = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display-face',
})

// Distinctive display face used only for the "I AM ISSA HAREB" name reveal
// in the cinematic intro — deliberately not the site's default Geist Sans,
// so the name reads as a designed title moment rather than body type.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
})

const SITE_URL = 'https://issahareb.me'
const SITE_TITLE = 'Issa Hareb | Full-Stack & AI Engineer aus Essen'
const SITE_DESCRIPTION =
  'Issa Hareb entwickelt intelligente Systeme aus Essen: Websites, Webanwendungen, KI-Agenten und Automatisierungen — Oberfläche, Backend und Deployment aus einer Hand, von der ersten Idee bis zum Livebetrieb.'
const SITE_DESCRIPTION_EN =
  'Issa Hareb builds intelligent systems from Essen, Germany: websites, web applications, AI agents and automations — interface, backend and deployment from one pair of hands.'

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
      'Dashboards, CRM, Buchungssysteme, Rollen und Rechte, Datenplattformen — zugeschnitten auf den vorhandenen Ablauf.',
  },
  {
    name: 'KI-Agenten und Automatisierungen',
    description:
      'Agenten mit dauerhaftem Gedächtnis, die echte Aufgaben übernehmen und an bestehende Werkzeuge angebunden sind.',
  },
  {
    name: 'Backend, Datenbank und Deployment',
    description:
      'Datenmodell, APIs, Authentifizierung, Deployment und Monitoring — der Teil, der ein Projekt zu einem laufenden System macht.',
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
      className={`${geistSans.variable} ${geistMono.variable} ${displayFace.variable} ${spaceGrotesk.variable} bg-background`}
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
