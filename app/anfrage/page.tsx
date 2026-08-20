import type { Metadata } from 'next'
import Link from 'next/link'
import { EnquiryForm } from '@/components/enquiry-form'
import { SiteFooter } from '@/components/site-footer'

const title = 'Projekt anfragen'
const description =
  'Anfrage an Issa Hareb: Website, Webanwendung, KI-Agent oder Automatisierung. Kurz beschreiben, Antwort innerhalb von 24 Stunden.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/anfrage' },
  openGraph: {
    title: `${title} | Issa Hareb`,
    description,
    url: '/anfrage',
    type: 'website',
  },
  twitter: { card: 'summary', title: `${title} | Issa Hareb`, description },
}

/**
 * The page Google Ads asks for: somewhere a customer fills something in.
 *
 * Deliberately plain. Every other surface on this site is a stage; this one
 * has a single job, and a scroll-scrubbed film between a visitor and a form
 * field only costs conversions. No 3D, no scrubbing, no smooth-scroll
 * hijacking — the form is above the fold and the page is done in one screen.
 */
export default function AnfrageRoute() {
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="mx-auto max-w-3xl px-6 pb-24 pt-16 sm:pt-24">
        <Link
          href="/"
          className="font-label text-[13px] uppercase tracking-[0.17em] text-foreground/72 transition-colors hover:text-foreground"
        >
          ← Issa Hareb
        </Link>

        <h1 className="mt-8 max-w-[18ch] font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-5xl">
          Erzähl mir kurz, was du vorhast.
        </h1>
        <p className="mt-5 max-w-[54ch] text-pretty text-[18px] leading-[1.6] text-foreground/85 sm:text-[19px]">
          Ich antworte innerhalb von 24 Stunden mit einer ehrlichen Einschätzung zu
          Umfang, Vorgehen und dem nächsten sinnvollen Schritt. Auf Wunsch bekommst
          du vorab einen kostenlosen Design-Entwurf.
        </p>

        <div className="mt-12 border-t border-white/10 pt-12">
          <EnquiryForm />
        </div>

        <p className="mt-10 max-w-[54ch] text-[16px] leading-[1.6] text-foreground/60">
          Lieber direkt schreiben?{' '}
          <a
            href="mailto:info@hareb.org"
            className="underline decoration-white/30 underline-offset-4 transition-colors hover:text-foreground"
          >
            info@hareb.org
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
