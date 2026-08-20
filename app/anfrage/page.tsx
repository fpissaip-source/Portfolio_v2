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
 * It carries the site's vocabulary — the violet accent, the label with its
 * rule, the display face at full size — but none of its machinery. No 3D,
 * no scroll scrubbing, no smooth-scroll hijacking. Those are what make the
 * portfolio worth looking at, and they are exactly what stands between a
 * visitor and a form field. Belonging to a site is a matter of type,
 * colour and spacing, not of shipping the same three megabytes.
 *
 * The one ornament is the glow behind the headline: two blurred radial
 * gradients, no images, no JavaScript. It costs nothing and it stops the
 * page reading as a bare document.
 */

const PROMISES = [
  { k: '24 h', v: 'Antwort, mit ehrlicher Einschätzung zu Umfang und Preis.' },
  { k: 'Kostenlos', v: 'Auf Wunsch ein erster Design-Entwurf, bevor du dich festlegst.' },
  { k: 'Direkt', v: 'Du schreibst mit mir, nicht mit einem Vertrieb.' },
]

export default function AnfrageRoute() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient light. `pointer-events-none` so it can never intercept a
          click meant for the form underneath it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-70"
        style={{
          background:
            'radial-gradient(60% 50% at 22% 0%, color-mix(in oklch, var(--purple) 22%, transparent) 0%, transparent 70%), radial-gradient(45% 40% at 88% 8%, color-mix(in oklch, var(--blue) 16%, transparent) 0%, transparent 72%)',
        }}
      />

      <main
        id="main-content"
        className="relative mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-20"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-label text-[13px] uppercase tracking-[0.17em] text-foreground/70 transition-colors hover:text-foreground"
        >
          <span aria-hidden>←</span> Issa Hareb
        </Link>

        {/* The same label device as every section on the home page: accent
            rule, Oswald, letterspaced. It is the cheapest way to say "this
            is the same site" before a single word is read. */}
        <span className="mt-12 flex items-center gap-2.5 font-label text-sm font-medium uppercase tracking-[0.16em] text-accent-tint sm:text-base">
          <span
            aria-hidden
            className="h-px w-7 shrink-0 bg-gradient-to-r from-purple/10 to-purple sm:w-9"
          />
          Anfrage
        </span>

        <h1 className="mt-4 max-w-[20ch] font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.025em] sm:text-6xl">
          Erzähl mir kurz, was du vorhast.
        </h1>

        <p className="mt-6 max-w-[56ch] text-pretty text-[19px] leading-[1.6] text-foreground/85 sm:text-[20px]">
          Vier Fragen, zwei Minuten. Danach weiß ich genug, um dir zu sagen, was
          dein Vorhaben realistisch kostet, wie lange es dauert und ob es sich
          überhaupt lohnt.
        </p>

        <ul className="mt-9 grid gap-x-8 gap-y-4 sm:grid-cols-3">
          {PROMISES.map((p) => (
            <li key={p.k}>
              <span className="font-label text-[13px] uppercase tracking-[0.14em] text-accent-tint">
                {p.k}
              </span>
              <p className="mt-1.5 text-[15px] leading-[1.5] text-foreground/70">{p.v}</p>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t border-white/10 pt-12">
          <EnquiryForm />
        </div>

        <p className="mt-12 max-w-[54ch] text-[16px] leading-[1.6] text-foreground/60">
          Lieber direkt schreiben?{' '}
          <a
            href="mailto:info@hareb.org"
            className="underline decoration-purple/50 underline-offset-4 transition-colors hover:text-foreground"
          >
            info@hareb.org
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  )
}
