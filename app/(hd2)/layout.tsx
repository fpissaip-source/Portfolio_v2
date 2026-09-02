import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { marke, navigation, pfad, start } from '@/lib/hd2-site'
import '../globals.css'

/**
 * Die neue Hareb-Digital-Seite, als Vorschau unter /start-alt.
 *
 * Ein eigenes Wurzel-Layout, das dritte in diesem Projekt: das Portfolio hat
 * seins unter `app/[lang]/`, die alte Kundenseite unter `app/(kunden)/`. Der
 * Grund ist derselbe wie dort — diese Seite soll nichts erben. Keine Schrift,
 * keine Farbmarken, keinen Graphen, keine Sprachlogik. Sie ist eine fremde
 * Anwendung zu Gast, und je weniger sie mit dem Rest teilt, desto einfacher
 * zieht sie wieder aus, wenn harebdigital.de steht.
 *
 * Geteilt wird genau eines: `globals.css`, und zwar wegen Tailwind. Die
 * sechs Farben der neuen Seite (tinte, kohle, nebel, kreide, signal,
 * leuchten) stehen dort im `@theme`-Block, weil Tailwind 4 seine Klassen aus
 * genau dieser Stelle erzeugt. Im Ursprung steht dasselbe in einer
 * `tailwind.config.ts` nach Art von Tailwind 3.
 *
 * `noindex`: die Seite gehoert auf harebdigital.de. Unter issahareb.me/start-alt
 * waere sie eine zweite Fassung derselben Texte auf einer fremden Domain, und
 * Google entscheidet dann selbst, welche es behaelt. Genau das soll es nicht.
 * Der Metadaten-Grund (`metadataBase`) zeigt trotzdem schon auf die
 * Zieldomain, damit die kanonischen Adressen die richtigen sind.
 */

const inter = Inter({ subsets: ['latin'], variable: '--font-hd2', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(marke.domain),
  title: {
    default: `${start.titel} | ${marke.name}`,
    template: `%s | ${marke.name}`,
  },
  description: start.beschreibung,
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#07090D',
  width: 'device-width',
  initialScale: 1,
}

/*
 * Strukturierte Daten fuer ein lokales Dienstleistungsunternehmen.
 *
 * Uebernommen aus dem Ursprung — mit einer Ausnahme: Felder, in denen noch
 * ein PLATZHALTER steht (E-Mail, Telefon, Strasse, Postleitzahl), werden
 * weggelassen statt mit dem Wort "PLATZHALTER" ausgeliefert. Eine
 * Telefonnummer, die "PLATZHALTER" heisst, ist keine fehlende Angabe, sondern
 * eine falsche.
 */
function strukturierteDaten() {
  const echt = (wert: string) => (wert.includes('PLATZHALTER') ? undefined : wert)
  const adresse: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: marke.ort,
    addressCountry: marke.land,
  }
  if (echt(marke.strasse)) adresse.streetAddress = marke.strasse
  if (echt(marke.plz)) adresse.postalCode = marke.plz

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: marke.name,
    description: start.beschreibung,
    url: marke.domain,
    ...(echt(marke.email) ? { email: marke.email } : {}),
    ...(echt(marke.telefon) ? { telephone: marke.telefon } : {}),
    founder: { '@type': 'Person', name: marke.inhaber, url: marke.portfolio },
    address: adresse,
    areaServed: marke.gebiet.map((ort) => ({ '@type': 'City', name: ort })),
    knowsAbout: [
      'Webdesign',
      'Webentwicklung',
      'Landingpages',
      'SEO',
      'Barrierefreiheit',
      'KI-Agenten',
      'Social Media Marketing',
      'Organische Reichweite',
    ],
    sameAs: [marke.portfolio],
  }
}

export default function Hd2Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="hd2">
        <a
          href="#inhalt"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-signal focus:px-4 focus:py-2"
        >
          Zum Inhalt springen
        </a>

        <header className="sticky top-0 z-40 border-b border-white/10 bg-tinte/80 backdrop-blur">
          <nav
            className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"
            aria-label="Hauptnavigation"
          >
            <Link href={pfad('/')} className="text-base font-semibold tracking-tight">
              {marke.name}
            </Link>
            <ul className="hidden gap-7 text-sm text-nebel md:flex">
              {navigation.map((n) => (
                <li key={n.href}>
                  <Link href={pfad(n.href)} className="transition-colors hover:text-kreide">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={pfad('/kontakt')}
              className="rounded-lg bg-signal px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Anfragen
            </Link>
          </nav>
        </header>

        <main id="inhalt">{children}</main>

        <footer className="mt-24 border-t border-white/10 px-5 py-12">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm text-nebel md:flex-row md:items-start md:justify-between">
            <div>
              <p className="font-semibold text-kreide">{marke.name}</p>
              <p className="mt-1">
                {marke.claim} · Inhaber {marke.inhaber}
              </p>
              <p className="mt-1">Tätig in {marke.gebiet.join(', ')}</p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <Link href={pfad('/referenzen')} className="hover:text-kreide">
                  Referenzen
                </Link>
              </li>
              <li>
                <Link href={pfad('/kontakt')} className="hover:text-kreide">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href={pfad('/impressum')} className="hover:text-kreide">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href={pfad('/datenschutz')} className="hover:text-kreide">
                  Datenschutz
                </Link>
              </li>
              <li>
                <a href={marke.portfolio} className="hover:text-kreide" rel="me">
                  Portfolio
                </a>
              </li>
            </ul>
          </div>

          {/* Steht nur in dieser Fassung: die Seite gehoert nicht hierher, und
              wer sie unter dieser Adresse findet, soll das wissen. Auf
              harebdigital.de faellt der Hinweis weg. */}
          <p className="mx-auto mt-8 max-w-6xl border-t border-white/5 pt-6 text-xs text-nebel/70">
            Vorschau unter {marke.portfolio.replace('https://', '')}/start-alt. Die Seite zieht auf{' '}
            {marke.domain.replace('https://', '')} um. Die laufende Landingpage liegt unter{' '}
            <Link href="/start" className="underline hover:text-kreide">
              /start
            </Link>
            .
          </p>
        </footer>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(strukturierteDaten()) }}
        />
      </body>
    </html>
  )
}
