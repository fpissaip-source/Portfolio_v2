import type { Metadata, Viewport } from 'next'
import { Anton, League_Spartan, Oswald, Source_Sans_3 } from 'next/font/google'
import { LanguageProvider } from '@/components/language-context'
import { FAQ_DE, FAQ_EN, FAQ_ES } from '@/lib/faq'
import {
  alternatesFor,
  DEFAULT_LANG,
  HREFLANG,
  isLang,
  LANGS,
  langUrl,
  OG_LOCALE,
  type Lang,
} from '@/lib/i18n'

/** Die Route liefert einen beliebigen String; hier wird daraus eine der drei
 *  Sprachen oder Deutsch. */
const toLang = (value: string): Lang => (isLang(value) ? value : DEFAULT_LANG)
import '../globals.css'
import '../elegant-headings.css'

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
/* "Full-Stack & AI Engineer" stand hier auf Englisch, in einem Titel, der
   fuer deutsche Suchanfragen gedacht ist. Gemessen am 26.08.: die Wendung
   "Full-Stack-Entwickler" kam auf der ganzen Seite kein einziges Mal vor,
   "Entwickler" zweimal. Wer "fullstack entwickler essen" tippt, tippt
   deutsch, und der Titel ist die eine Stelle, an der das ohne Verrenkung
   hingehoert. Der Name bleibt vorn: er ist die Anfrage, die diese Seite
   zuerst beantworten soll, und der Anker der Person im Wissensgraphen. */
const SITE_TITLE = 'Issa Hareb | Full-Stack-Entwickler und KI-Entwickler in Essen'
/* 156 characters. It was 206, which Bing's own URL inspection flags and
   which both engines cut off around 160 anyway — the tail was being
   written for nobody. The name leads, because that is the query this page
   is trying to answer. */
const SITE_DESCRIPTION =
  'Issa Hareb entwickelt Websites, Webanwendungen, KI-Agenten und Automatisierungen. Oberfläche, Backend und Betrieb aus einer Hand. Aus Essen, deutschlandweit.'
const SITE_DESCRIPTION_EN =
  'Issa Hareb builds websites, web applications, AI agents and automations. Interface, backend and operation from one pair of hands. Based in Essen, Germany.'
const SITE_DESCRIPTION_ES =
  'Issa Hareb desarrolla webs, aplicaciones, agentes de IA y automatizaciones. Interfaz, backend y operación de una sola mano. Desde Essen, Alemania.'

/* Ein Satz pro Sprache, nicht eine Übersetzung des deutschen.
   Der Name steht in allen dreien vorn, weil das die Suchanfrage ist, die
   diese Seite beantworten soll — der Rest darf sich lesen, als wäre er in
   der jeweiligen Sprache geschrieben worden. */
const TITLES: Record<Lang, string> = {
  de: SITE_TITLE,
  en: 'Issa Hareb | Full-Stack & AI Engineer from Essen, Germany',
  es: 'Issa Hareb | Desarrollador Full-Stack e IA desde Essen',
}

const DESCRIPTIONS: Record<Lang, string> = {
  de: SITE_DESCRIPTION,
  en: SITE_DESCRIPTION_EN,
  es: SITE_DESCRIPTION_ES,
}

const FAQ_BY_LANG = { de: FAQ_DE, en: FAQ_EN, es: FAQ_ES } as const

/** Entity ids. Stable, absolute and reused by every node in the graph, so a
 *  parser links them into one description of one person instead of three
 *  unrelated fragments (the pattern the taxibbessen site scores on). */
/*
 * Die Bezeichner der Entitaeten, und sie muessen genau so lauten.
 *
 * taxibbessen.de traegt in seinen strukturierten Daten einen Person- und
 * einen Organization-Knoten, die auf diese Seite zeigen — die einzige
 * Fremdquelle im Graphen, die nicht Issa selbst gehoert. Sie nennt dabei
 * `#issa-hareb` und `#hareb-digital`. Hier standen `#person` und
 * `#organization`.
 *
 * In verknuepften Daten ist die @id der Schluessel der Identitaet. Zwei
 * verschiedene @id sind zwei verschiedene Dinge, und die Referenz von aussen
 * zeigte damit auf einen Knoten, den es hier gar nicht gibt — statt auf den,
 * der ihn bestaetigen soll.
 *
 * Angeglichen wurde diese Seite, nicht die andere: das kostet zwei Zeilen
 * statt eines Deploys auf einer Kundenseite, und die sprechenden Namen sind
 * ohnehin die besseren. Alle internen Verweise laufen ueber diese Konstanten
 * und folgen von selbst.
 */
const PERSON_ID = `${SITE_URL}/#issa-hareb`
const WEBSITE_ID = `${SITE_URL}/#website`
const PAGE_ID = `${SITE_URL}/#webpage`
const FAQ_ID = `${SITE_URL}/#faq`
const ORGANIZATION_ID = `${SITE_URL}/#hareb-digital`

/**
 * Titel, Beschreibung und vor allem die Sprachverweise.
 *
 * Bis hierher stand in `alternates.languages` dreimal derselbe Pfad, mit dem
 * ehrlichen Kommentar: eine URL bedient beide Sprachen, der Wechsel passiert
 * im Browser. Das war korrekt beschrieben und trotzdem wertlos — hreflang
 * ohne unterschiedliche Adressen sagt einem Crawler nichts.
 *
 * Jetzt hat jede Sprache ihre eigene Adresse, und jede Seite nennt alle drei
 * plus x-default. Damit weiss eine Suchmaschine, dass es dieselbe Seite in
 * drei Fassungen ist, statt drei Seiten mit verdaechtig aehnlichem Inhalt.
 */
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

/* Alles ausserhalb der drei bekannten Sprachen ist keine Seite. Ohne diese
   Zeile wuerde `[lang]` jeden beliebigen ersten Pfadteil annehmen und eine
   deutsche Seite unter einer erfundenen Adresse ausliefern. */
export const dynamicParams = false

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  /* Next typisiert den Parameter als string, nicht als Vereinigung der drei
     Sprachen — die Route weiss nicht, was generateStaticParams zurueckgibt.
     Also hier einengen statt die Signatur zu erzwingen: `dynamicParams =
     false` sorgt dafuer, dass nie etwas anderes ankommt, und der Rueckfall
     auf Deutsch macht daraus trotzdem keinen Absturz. */
  const lang = toLang((await params).lang)
  return {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLES[lang],
    template: '%s | Issa Hareb',
  },
  description: DESCRIPTIONS[lang],
  applicationName: 'Issa Hareb',
  authors: [{ name: 'Issa Hareb', url: SITE_URL }],
  creator: 'Issa Hareb',
  publisher: 'Issa Hareb',
  category: 'technology',
  /* Liefert "https://issahareb.me" ohne Schrägstrich am Ende: Next
     normalisiert absolute Metadaten-URLs und streift ihn ab. Harmlos — ein
     leerer Pfad ist dieselbe URL wie "/" nach RFC 3986 —, aber die Sitemap
     muss dieselbe Schreibweise verwenden, sonst reden beide über
     verschiedene Adressen. */
  alternates: alternatesFor(lang),
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
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
    url: langUrl(lang),
    siteName: 'Issa Hareb',
    type: 'profile',
    locale: OG_LOCALE[lang],
    alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLES[lang],
    description: DESCRIPTIONS[lang],
  },
  /* The icon files were in /public and served fine, but nothing in the
     document pointed at them. With no declaration a browser falls back to
     requesting /favicon.ico, which this site does not have, so every visit
     spent a request on a 404 and every tab showed a blank page icon. */
  /* Ownership proofs for the webmaster tools.
     Bing accepts either the meta tag or /BingSiteAuth.xml; both are in
     place, because a verification that drops out silently is the kind of
     thing nobody notices until an index goes stale. Bing's own note is
     explicit that the tag has to stay after verification succeeds.
     Google's token goes in beside it as `google:` once the Search Console
     property is created. */
  verification: {
    other: {
      'msvalidate.01': '9BFD7C2DBC8998DFAC0198132F9FB5B9',
    },
  },
  /* Das Zeichen von Hareb Digital. Hier stand bis zuletzt das v0-Logo aus
     dem Projekt-Gerüst — sichtbar auf jedem Browser-Tab und, wie die
     Namenssuche zeigte, auch neben dem Suchergebnis.

     /favicon.ico ist trotz dieser Liste unverzichtbar: Googles
     Favicon-Crawler fragt genau diesen Pfad ab und liest die Deklarationen
     hier gar nicht erst. Die Datei ist eine echte Multi-Size-ICO von 16 bis
     256, damit jede Oberfläche die Größe bekommt, die sie braucht, statt
     eine einzige herunterzurechnen.

     Hell und dunkel zeigen dasselbe Bild: die Marke bringt ihren eigenen
     dunklen Grund mit, sie braucht also keine zweite Fassung.

     Kein icon.svg mehr. Dort lag ein Nachbau der Marke, solange die
     Originaldatei fehlte; jetzt liegt sie vor. Beides nebeneinander haette
     bedeutet, dass ein Browser mit SVG-Unterstuetzung ein anderes Zeichen
     zeigt als einer ohne — zwei Marken fuer dieselbe Firma, je nach
     Browser. Ein Zeichen, in mehreren Groessen.

     Das -v2 im Dateinamen ist kein Schmuck. Diese Pfade tragen ein Jahr
     `immutable`, und die Begruendung dafuer lautet ausdruecklich: eine neue
     Fassung ist eine neue Datei. Beim ersten Austausch wurde genau dagegen
     verstossen — ueberschrieben statt umbenannt —, und Cloudflare lieferte
     danach tagelang weiter das alte Zeichen aus, gemessen mit
     cf-cache-status HIT und einem Alter von 30 Stunden. Wer diese Bilder
     wieder aendert, aendert den Namen mit. */
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon-32-v2.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-512-v2.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon-v2.png', sizes: '180x180', type: 'image/png' }],
  },
  }
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

/**
 * Der Graph, jetzt in der Sprache der Seite.
 *
 * Vorher lag hier ein fester deutscher Graph, der auch unter einer
 * englischen Fassung ausgeliefert worden wäre. Eine FAQPage, deren Antworten
 * in einer anderen Sprache stehen als die Seite, ist für eine Antwortmaschine
 * kein Gewinn, sondern ein Widerspruch — und Google wertet FAQ-Auszeichnung
 * ohnehin nur, wenn derselbe Text sichtbar auf der Seite steht.
 *
 * Person, Anschrift und Bezeichner bleiben in allen drei Fassungen identisch.
 * Sie sind die Entität, und eine Entität wechselt nicht die Identität, nur
 * weil jemand die Sprache umstellt.
 */
function buildJsonLd(lang: Lang) {
  const faq = FAQ_BY_LANG[lang]
  return {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Issa Hareb',
      /* Split out so a parser can resolve the person rather than treating
         the name as one opaque string. */
      givenName: 'Issa',
      familyName: 'Hareb',
      /* The spellings the name is actually searched and written in. This is
         the same device taxibbessen.de uses to hold "Taxi Essen", "Taxi BB
         Essen" and "BB Taxi Essen" as one entity instead of three. */
      alternateName: ['Hareb, Issa'],
      url: `${SITE_URL}/`,
      jobTitle: 'Full-Stack & AI Engineer',
      description: SITE_DESCRIPTION,
      /* schema.org has a property for exactly this situation: telling one
         entity apart from others that share its name. Searching "Issa
         Hareb" currently surfaces a takeaway owner of the same name in
         Berlin and a footballer spelled "Issa Harb" in Essen, and Google's
         summary offers both because nothing distinguishes them from this
         one. The sentence names what is different — the field, the work,
         the site — rather than repeating the description. */
      disambiguatingDescription:
        'Issa Hareb aus Essen ist Full-Stack- und KI-Entwickler und betreibt issahareb.me. Nicht zu verwechseln mit gleichnamigen Personen in anderen Branchen oder mit dem ähnlich geschriebenen Namen Issa Harb.',
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Full-Stack- und KI-Entwickler',
        occupationalCategory: '15-1252.00',
        responsibilities:
          'Entwicklung von Websites, Webanwendungen, KI-Agenten und Automatisierungen einschließlich Backend, Datenbank, Deployment und Betrieb.',
      },
      email: 'mailto:info@hareb.org',
      telephone: '+49-1525-9559708',
      /* The sole trader and the name he trades under, stated in both
         directions. Google verified "Hareb Digital" itself when it verified
         the business profile, so that entity carries weight this page cannot
         claim on its own — but only if the graph says the two are the same
         operation. Without this edge they are two strangers who happen to
         share an address. */
      worksFor: { '@id': ORGANIZATION_ID },
      nationality: { '@type': 'Country', name: 'Germany' },
      knowsLanguage: ['de', 'en', 'es'],
      /* The registered address, matching the imprint exactly.
         It used to say Essen while the imprint said Sankt Augustin, 90km
         apart. Google cross-checks the imprint against structured data, and
         a contradiction there is a reason it cannot resolve the entity at
         all — which is precisely what a knowledge panel needs it to do.
         Seat and market are now stated separately, the way a real business
         entity is modelled: `address` is where the business is registered,
         `homeLocation`/`workLocation` is where the person actually is, and
         the offers below carry `areaServed`. */
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Europaring 90',
        postalCode: '53757',
        addressLocality: 'Sankt Augustin',
        addressRegion: 'Nordrhein-Westfalen',
        addressCountry: 'DE',
      },
      homeLocation: {
        '@type': 'Place',
        name: 'Essen, Nordrhein-Westfalen',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Essen',
          addressRegion: 'Nordrhein-Westfalen',
          addressCountry: 'DE',
        },
      },
      workLocation: {
        '@type': 'Place',
        name: 'Essen und Ruhrgebiet',
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
      /* The corroboration list, and the weakest part of this graph.
         A knowledge panel is not granted by markup: Google builds it when
         several independent sources agree on one identity. taxibbessen.de
         carries seven (Instagram, Google Maps, Gelbe Seiten, Das Örtliche,
         GoLocal, taxi.de, Creditreform); this carries three, plus the
         verified business profile on the organisation node. Add each further
         profile here as it goes live — one line, and the name, location and
         role on it must match this file word for word, or it weakens the
         entity instead of confirming it.
         Every URL here is also a visible link in the footer: a claim of
         identity that the page itself does not make is the weaker kind. */
      sameAs: [
        'https://github.com/fpissaip-source',
        'https://www.linkedin.com/in/issa-hareb-10a61642b',
        'https://www.xing.com/profile/Issa_Hareb02082',
      ],
    },
    /**
     * Hareb Digital: the business, as distinct from the person running it.
     *
     * This node exists because a verified Google business profile does. That
     * profile already resolved to a Knowledge Graph entity of its own
     * (kgmid /g/11zw_y65ct), which is the thing this site has been trying to
     * earn for months — except Google filed it under the company name, not
     * under "Issa Hareb". Modelling only the person would leave that entity
     * floating unattached, and a strong signal pointing at nothing helps
     * nobody.
     *
     * ProfessionalService rather than plain Organization: it is the type
     * Google's own documentation pairs with a business profile, and it is
     * what this actually is — a service business with a seat, an area it
     * serves, and a person behind it.
     *
     * Name, address and phone are copied from the imprint character for
     * character, because that is the comparison Google runs. The address is
     * the registered seat in Sankt Augustin; Essen and the Ruhrgebiet are
     * areaServed, which is how a service-area business is meant to be
     * expressed.
     */
    {
      '@type': 'ProfessionalService',
      '@id': ORGANIZATION_ID,
      name: 'Hareb Digital',
      /* The legal form is a sole proprietorship, so the person's own name is
         the second name this business is found under. */
      alternateName: 'Issa Hareb',
      url: `${SITE_URL}/`,
      description:
        'Hareb Digital ist das Einzelunternehmen von Issa Hareb: Websites, Webanwendungen, KI-Agenten und Automatisierungen, entwickelt vom Entwurf bis zum laufenden Betrieb.',
      founder: { '@id': PERSON_ID },
      employee: { '@id': PERSON_ID },
      email: 'mailto:info@hareb.org',
      telephone: '+49-1525-9559708',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Europaring 90',
        postalCode: '53757',
        addressLocality: 'Sankt Augustin',
        addressRegion: 'Nordrhein-Westfalen',
        addressCountry: 'DE',
      },
      /* Work is delivered remotely, so the seat is an address rather than a
         shopfront. Stating the served area explicitly keeps the profile and
         the markup telling the same story. */
      areaServed: [
        { '@type': 'City', name: 'Essen' },
        { '@type': 'City', name: 'Sankt Augustin' },
        { '@type': 'AdministrativeArea', name: 'Ruhrgebiet' },
        { '@type': 'Country', name: 'Germany' },
      ],
      knowsLanguage: ['de', 'en', 'es'],
      /* Not a schema.org core property but a legitimate use of `identifier`:
         it hands a parser the exact Knowledge Graph node this business
         already occupies, instead of asking it to infer one from the name. */
      identifier: {
        '@type': 'PropertyValue',
        propertyID: 'Google Knowledge Graph',
        value: 'kg:/g/11zw_y65ct',
      },
      /* The verified business profile. Google checked these details itself
         before publishing them, which makes this the only entry in the whole
         graph that is not simply this site vouching for itself. */
      sameAs: ['https://share.google/EUZlSQOOkoXIK0AMM'],
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: 'Issa Hareb',
      alternateName: ['Issa Hareb Portfolio', 'issahareb.me'],
      description: SITE_DESCRIPTION,
      inLanguage: ['de-DE', 'en', 'es'],
      publisher: { '@id': PERSON_ID },
    },
    {
      '@type': 'ProfilePage',
      '@id': PAGE_ID,
      url: langUrl(lang),
      name: TITLES[lang],
      description: DESCRIPTIONS[lang],
      inLanguage: HREFLANG[lang],
      isPartOf: { '@id': WEBSITE_ID },
      about: { '@id': PERSON_ID },
      mainEntity: { '@id': PERSON_ID },
      /* Ties the answers below to this page and to the person they are
         about, so the FAQ is not a free-floating block a parser has to
         guess the subject of. */
      hasPart: { '@id': FAQ_ID },
    },
    {
      /* The part an answer engine can quote verbatim.
         Every question and answer here is rendered as visible text by
         components/faq.tsx from the same source (lib/faq.ts) — Google only
         honours FAQ markup the page actually shows, and an answer that
         cannot be checked against the page is worse than none.
         In der Sprache der Seite: eine FAQPage, deren Antworten anders
         lauten als der sichtbare Text darunter, ist kein Gewinn, sondern
         ein Widerspruch. */
      '@type': 'FAQPage',
      '@id': FAQ_ID,
      inLanguage: HREFLANG[lang],
      isPartOf: { '@id': PAGE_ID },
      about: { '@id': PERSON_ID },
      mainEntity: faq.map((entry) => ({
        '@type': 'Question',
        name: entry.question,
        acceptedAnswer: { '@type': 'Answer', text: entry.answer },
      })),
    },
  ],
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ lang: string }>
}>) {
  const lang = toLang((await params).lang)
  return (
    <html
      /* Stand fest auf "de", auch wenn der Besucher auf Englisch umgestellt
         hatte. Ein falsches lang-Attribut betrifft nicht nur Suchmaschinen:
         ein Screenreader spricht den Text dann mit deutscher Aussprache
         vor. Jetzt kommt es aus der Adresse und ist im ersten ausgelieferten
         HTML schon richtig. */
      lang={HREFLANG[lang]}
      className={`${bodyFace.variable} ${headingFace.variable} ${posterFace.variable} ${labelFace.variable} bg-background`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(lang)) }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider lang={lang}>{children}</LanguageProvider>
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
