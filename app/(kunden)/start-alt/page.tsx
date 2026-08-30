import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { HdLanding } from '@/components/hd-landing'
import { HD_KEKS, HD_TEXTE, hdSprache } from '@/lib/hd-texte'

/**
 * Die Landingpage von Hareb Digital.
 *
 * Die Seite selbst ist ein Server-Bauteil und trägt nur die Metadaten und die
 * Sprachwahl; alles Bewegte liegt in einem Client-Blatt daneben. Das ist keine
 * Formsache: die Scroll-Kopplung und die hochzählenden Zahlen brauchen den
 * Browser, die Metadaten nicht.
 *
 * Die Sprache kommt aus der Wahl im Schalter, sonst aus dem
 * Accept-Language-Kopf, sonst aus dem Land, und in keinem Fall aus der
 * Adresse. Auf einer indexierten Seite wäre das
 * falsch, weil ein Crawler unter derselben Adresse mal die eine und mal die
 * andere Fassung bekäme. Diese Seite trägt `noindex` und bekommt ihren Verkehr
 * aus Anzeigen: für sie zählt, dass der Besucher ohne einen weiteren Klick in
 * seiner Sprache ankommt.
 *
 * Der Kopf ist ein Anfrageheader, die Seite wird damit bei jedem Aufruf
 * gerendert statt einmal vorab. Für eine Seite ohne Datenbankzugriff ist das
 * eine Handvoll Millisekunden.
 */

/* Eine Stelle, drei Quellen: Keks, Browser, Land. Das Land steht in dem Kopf,
   den Cloudflare setzt; der zweite ist fuer den Fall, dass die Seite einmal
   woanders liegt. */
async function sprache() {
  const [kopf, keks] = await Promise.all([headers(), cookies()])
  return hdSprache({
    gewaehlt: keks.get(HD_KEKS)?.value,
    akzeptiert: kopf.get('accept-language'),
    land: kopf.get('cf-ipcountry') ?? kopf.get('x-vercel-ip-country'),
  })
}

export async function generateMetadata(): Promise<Metadata> {
  const t = HD_TEXTE[await sprache()]
  return {
    title: t.meta.titel,
    description: t.meta.beschreibung,
    robots: { index: false, follow: false },
  }
}

export default async function HarebDigitalLanding() {
  return <HdLanding lang={await sprache()} />
}
