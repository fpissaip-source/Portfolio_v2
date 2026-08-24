import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { HdLanding } from '@/components/hd-landing'
import { HD_TEXTE, sprachAusKopf } from '@/lib/hd-texte'

/**
 * Die Landingpage von Hareb Digital.
 *
 * Die Seite selbst ist ein Server-Bauteil und trägt nur die Metadaten und die
 * Sprachwahl; alles Bewegte liegt in einem Client-Blatt daneben. Das ist keine
 * Formsache: die Scroll-Kopplung und die hochzählenden Zahlen brauchen den
 * Browser, die Metadaten nicht.
 *
 * Die Sprache kommt aus dem Accept-Language-Kopf, also aus der Einstellung des
 * Browsers, und nicht aus der Adresse. Auf einer indexierten Seite wäre das
 * falsch, weil ein Crawler unter derselben Adresse mal die eine und mal die
 * andere Fassung bekäme. Diese Seite trägt `noindex` und bekommt ihren Verkehr
 * aus Anzeigen: für sie zählt, dass der Besucher ohne einen weiteren Klick in
 * seiner Sprache ankommt.
 *
 * Der Kopf ist ein Anfrageheader, die Seite wird damit bei jedem Aufruf
 * gerendert statt einmal vorab. Für eine Seite ohne Datenbankzugriff ist das
 * eine Handvoll Millisekunden.
 */

export async function generateMetadata(): Promise<Metadata> {
  const t = HD_TEXTE[sprachAusKopf((await headers()).get('accept-language'))]
  return {
    title: t.meta.titel,
    description: t.meta.beschreibung,
    robots: { index: false, follow: false },
  }
}

export default async function HarebDigitalLanding() {
  const lang = sprachAusKopf((await headers()).get('accept-language'))
  return <HdLanding lang={lang} />
}
