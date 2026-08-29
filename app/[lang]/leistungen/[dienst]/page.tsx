import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteFooter } from '@/components/site-footer'
import { LEISTUNGEN, leistungFuer } from '@/lib/leistungen'
import { SITE_URL } from '@/lib/i18n'

/**
 * Eine Leistungsseite pro Suchabsicht.
 *
 * Vorher hatte die Seite genau eine Inhaltsseite: die Startseite. Eine Seite
 * kann nicht für zwei verschiedene Absichten ranken, und "Webdesigner Essen"
 * und "Fullstack Entwickler Essen" sind zwei verschiedene — die eine sucht
 * jemanden, der eine Website schön macht, die andere jemanden, der ein System
 * baut. Also zwei Adressen, jede mit eigenem Titel, eigener Überschrift,
 * eigenem Text und eigenen Fragen.
 *
 * Nur Deutsch. `generateStaticParams` gibt ausschliesslich `de` zurück, und
 * weil das Sprachsegment darüber `dynamicParams = false` setzt, laufen
 * /en/leistungen/… und /es/leistungen/… ins 404. Das ist Absicht: eine
 * spanische Fassung von "Webdesigner Essen" wäre eine Adresse, die niemand
 * sucht — und drei Sprachfassungen einer Seite, von denen zwei niemand will,
 * sind für Google dünner Inhalt und kein Vorteil.
 *
 * Was hier NICHT passiert: keine Wiederholung derselben Seite mit
 * ausgetauschtem Ortsnamen. Zwei Seiten, zwei verschiedene Texte, beide mit
 * Inhalt, den man auch ohne Suchmaschine lesen würde. Alles andere ist eine
 * Brückenseite, und die kostet mehr, als sie bringt.
 */

export const dynamicParams = false

export function generateStaticParams() {
  return LEISTUNGEN.map((l) => ({ lang: 'de', dienst: l.slug }))
}

type Props = { params: Promise<{ lang: string; dienst: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dienst } = await params
  const l = leistungFuer(dienst)
  if (!l) return {}

  const pfad = `/leistungen/${l.slug}`
  return {
    title: l.metaTitel,
    description: l.metaText,
    /* Kein `languages`: diese Seite gibt es nur auf Deutsch. Ein hreflang auf
       Adressen, die 404 liefern, ist schlimmer als gar keines. */
    alternates: { canonical: pfad },
    openGraph: {
      title: l.metaTitel,
      description: l.metaText,
      url: pfad,
      type: 'website',
      locale: 'de_DE',
    },
    twitter: { card: 'summary', title: l.metaTitel, description: l.metaText },
  }
}

export default async function LeistungsRoute({ params }: Props) {
  const { dienst } = await params
  const l = leistungFuer(dienst)
  if (!l) notFound()

  const url = `${SITE_URL}/leistungen/${l.slug}`

  /* Drei Graphen, jeder mit einer eigenen Aufgabe: was hier angeboten wird,
     wo die Seite in der Struktur hängt, und die Fragen — letztere nur, weil
     die Antworten unten auch sichtbar auf der Seite stehen. Markup, das etwas
     behauptet, was die Seite nicht zeigt, ist der schnellste Weg, sich die
     Auszeichnung ganz zu verderben. */
  const daten = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${url}#dienst`,
        name: l.dienstName,
        description: l.dienstText,
        serviceType: l.kurz,
        provider: { '@id': `${SITE_URL}/#issa-hareb` },
        areaServed: [
          { '@type': 'City', name: 'Essen' },
          { '@type': 'AdministrativeArea', name: 'Ruhrgebiet' },
          { '@type': 'Country', name: 'Germany' },
        ],
        url,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#pfad`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Issa Hareb', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: l.kurz, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#fragen`,
        mainEntity: l.fragen.map((f) => ({
          '@type': 'Question',
          name: f.frage,
          acceptedAnswer: { '@type': 'Answer', text: f.antwort },
        })),
      },
    ],
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(daten) }}
      />

      {/* Dasselbe Streulicht wie auf der Anfrageseite: zwei weiche Verläufe,
          keine Bilder, kein JavaScript. Es kostet nichts und nimmt der Seite
          das Aussehen eines blanken Dokuments. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] opacity-70"
        style={{
          background:
            'radial-gradient(60% 50% at 22% 0%, color-mix(in oklch, var(--purple) 22%, transparent) 0%, transparent 70%), radial-gradient(45% 40% at 88% 8%, color-mix(in oklch, var(--blue) 16%, transparent) 0%, transparent 72%)',
        }}
      />

      <main id="main-content" className="relative mx-auto max-w-3xl px-6 pb-24 pt-14 sm:pt-20">
        <nav aria-label="Brotkrume">
          <Link
            href="/"
            className="inline-flex min-h-[24px] items-center gap-2 font-label text-[13px] uppercase tracking-[0.17em] text-foreground/70 transition-colors hover:text-foreground"
          >
            <span aria-hidden>←</span> Issa Hareb
          </Link>
        </nav>

        <span className="mt-12 flex items-center gap-2.5 font-label text-sm font-medium uppercase tracking-[0.16em] text-accent-tint sm:text-base">
          <span
            aria-hidden
            className="h-px w-7 shrink-0 bg-gradient-to-r from-purple/10 to-purple sm:w-9"
          />
          {l.kurz}
        </span>

        <h1 className="mt-4 max-w-[20ch] font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.025em] sm:text-6xl">
          {l.h1}
        </h1>

        <p className="mt-6 max-w-[56ch] text-pretty text-[19px] leading-[1.6] text-foreground/85 sm:text-[20px]">
          {l.vorspann}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/anfrage"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-6 py-3 text-[16px] font-semibold text-background transition-transform duration-150 hover:-translate-y-px"
          >
            Projekt anfragen <span aria-hidden>→</span>
          </Link>
          <a
            href="mailto:info@hareb.org"
            className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-6 py-3 text-[16px] font-medium text-foreground/85 transition-colors hover:border-white/40 hover:text-foreground"
          >
            info@hareb.org
          </a>
        </div>

        {l.abschnitte.map((a) => (
          <section key={a.titel} className="mt-12 border-t border-white/10 pt-10">
            <h2 className="max-w-[26ch] font-display text-2xl font-semibold leading-[1.15] tracking-tight sm:text-[1.75rem]">
              {a.titel}
            </h2>
            <p className="mt-4 max-w-[58ch] text-pretty text-[17px] leading-[1.65] text-foreground/80">
              {a.text}
            </p>
            {a.punkte && (
              <ul className="mt-6 flex flex-col gap-3">
                {a.punkte.map((p) => (
                  <li key={p} className="flex gap-3 text-[17px] leading-[1.55] text-foreground/80">
                    <span aria-hidden className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-purple/80" />
                    <span className="max-w-[54ch]">{p}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-12 border-t border-white/10 pt-10">
          <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight sm:text-[1.75rem]">
            Häufige Fragen
          </h2>
          <dl className="mt-7 flex flex-col gap-7">
            {l.fragen.map((f) => (
              <div key={f.frage}>
                <dt className="text-[17px] font-semibold tracking-tight text-foreground">
                  {f.frage}
                </dt>
                <dd className="mt-2 max-w-[58ch] text-pretty text-[17px] leading-[1.65] text-foreground/80">
                  {f.antwort}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Der Weg zurück in die Seite. Ohne ihn wäre das hier eine
            Sackgasse — und eine Adresse, von der aus es nicht weitergeht,
            liest sich für einen Crawler wie für einen Menschen als etwas,
            das nur für die Suchmaschine da steht. */}
        <nav aria-label="Weitere Leistungen" className="mt-12 border-t border-white/10 pt-10">
          <span className="font-label text-[13px] uppercase tracking-[0.14em] text-accent-tint">
            Weiter
          </span>
          <ul className="mt-4 flex flex-col gap-2.5 text-[17px]">
            {LEISTUNGEN.filter((a) => a.slug !== l.slug).map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/leistungen/${a.slug}`}
                  className="inline-flex min-h-[24px] items-center underline decoration-purple/50 underline-offset-4 transition-colors hover:text-foreground"
                >
                  {a.h1}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/"
                className="inline-flex min-h-[24px] items-center underline decoration-purple/50 underline-offset-4 transition-colors hover:text-foreground"
              >
                Alle Arbeiten und Leistungen im Überblick
              </Link>
            </li>
          </ul>
        </nav>
      </main>
      <SiteFooter />
    </div>
  )
}
