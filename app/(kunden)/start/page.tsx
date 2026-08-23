import type { Metadata } from 'next'
import { HdLanding } from '@/components/hd-landing'

/**
 * Die Landingpage von Hareb Digital.
 *
 * Die Seite selbst ist ein Server-Bauteil und trägt nur die Metadaten; alles
 * Bewegte liegt in einem Client-Blatt daneben. Das ist keine Formsache: die
 * Scroll-Kopplung, der gescrubbte Film und die hochzählenden Zahlen brauchen
 * den Browser, die Metadaten nicht.
 */

const title = 'Hareb Digital: Websites, die gefunden werden und Arbeit abnehmen'
const description =
  'Hareb Digital baut Websites, Webanwendungen und Automatisierungen für kleine und mittlere Unternehmen. Ein Ansprechpartner, fester Preis, Antwort in 24 Stunden.'

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
}

export default function HarebDigitalLanding() {
  return <HdLanding />
}
