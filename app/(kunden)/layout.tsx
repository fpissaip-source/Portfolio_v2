import type { Metadata, Viewport } from 'next'
import { Anton, League_Spartan, Oswald, Source_Sans_3 } from 'next/font/google'
import '../globals.css'

/**
 * Die Kundenseite — und ein eigenes Wurzel-Layout, kein geschachteltes.
 *
 * Seit die Sprachen eigene Adressen haben, liegt das bisherige Wurzel-Layout
 * unter `app/[lang]/`. Damit gibt es kein `app/layout.tsx` mehr, das `<html>`
 * und `<body>` für alle Zweige aufspannt, und jeder oberste Zweig muss es
 * selbst tun. Ohne das lieferte /start ein Dokument ohne html- und
 * body-Element aus — gemessen, nicht vermutet.
 *
 * Das ist kein Umweg, sondern der Grund, warum die Trennung überhaupt gewollt
 * ist: Hareb Digital soll nicht den Graphen, die Metadaten und die Sprachlogik
 * des Portfolios erben. Es teilt sich die Schriften und die Farbtoken, sonst
 * nichts.
 *
 * `noindex`, solange die eigene Domain fehlt. Eine Seite, die erst unter
 * issahareb.me Bewertungen sammelt und danach umzieht, träte gegen sich
 * selbst an.
 */

const bodyFace = Source_Sans_3({ subsets: ['latin'], variable: '--font-body-face' })
const headingFace = League_Spartan({ subsets: ['latin'], variable: '--font-heading-face' })
const posterFace = Anton({ subsets: ['latin'], weight: ['400'], variable: '--font-poster-face' })
const labelFace = Oswald({ subsets: ['latin'], variable: '--font-label-face' })

export const metadata: Metadata = {
  metadataBase: new URL('https://issahareb.me'),
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  /* Hell, und das ist die Entscheidung, die den zweiten Anlauf traegt. Die
     Kundenseite soll nicht aussehen wie das Portfolio, und ein Besucher, der
     eine Schreinerei fuehrt, liest auf Papier besser als auf Schwarz. */
  colorScheme: 'light',
  themeColor: '#fbfaf8',
  width: 'device-width',
  initialScale: 1,
}

export default function KundenLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${bodyFace.variable} ${headingFace.variable} ${posterFace.variable} ${labelFace.variable}`}
    >
      <body className="hd antialiased">{children}</body>
    </html>
  )
}
