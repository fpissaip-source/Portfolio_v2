import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

/**
 * Die Landingpage von Hareb Digital, zweiter Anlauf.
 *
 * Der erste war dunkel, mit Neon-Verlauf durch die Grossbuchstaben und vier
 * nachgebauten Oberflaechen an der Stelle, an der ein Bild haette stehen
 * muessen. Auf der ganzen Seite kein einziges echtes Foto. Das ist kein
 * Minimalismus, sondern unfertige Arbeit, und es sah aus wie jede zweite
 * KI-erzeugte Seite.
 *
 * Der Fehler dahinter war ein Denkfehler ueber den Besucher. Er ist kein
 * Designer. Er fuehrt eine Schreinerei oder eine Praxis und ueberlegt, ob er
 * hier fuenfstellig ausgibt. Den ueberzeugt nicht, wie die Seite leuchtet,
 * sondern ob er sieht, was schon gebaut wurde und ob es laeuft.
 *
 * Deshalb gehoert der Platz hier den echten Bildschirmfotos, und die
 * wichtigste Sektion ist nicht die Buehne, sondern die Arbeit darunter.
 *
 * Ehrlichkeit bei den Beispielen ist dabei keine Nettigkeit, sondern die
 * Grundlage: taxibbessen.de ist ein echter Kundenauftrag und laeuft. Alles
 * andere sind eigene Produkte und stehen genau so beschriftet da. Ein
 * Eigenprojekt als Kundenarbeit auszugeben, faellt beim ersten Nachfragen
 * auf und kostet den Auftrag.
 */

const title = 'Hareb Digital: Websites, die gefunden werden und Arbeit abnehmen'
const description =
  'Hareb Digital baut Websites, Webanwendungen und Automatisierungen für kleine und mittlere Unternehmen. Ein Ansprechpartner, fester Preis, Antwort in 24 Stunden.'

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
}

/** Saetze aus echten Erstgespraechen. Sie standen vorher in einem endlosen
 *  Laufband; bei Bewegungsstufe 3 hat ein Selbstlaeufer nichts zu suchen, und
 *  gelesen werden sie so ohnehin besser. */
const PROBLEME = [
  'Das Telefon klingelt nicht mehr so wie früher.',
  'Bei Google finden uns nur die, die uns sowieso kennen.',
  'Die Seite sieht aus wie 2014.',
  'Auf dem Handy ist alles verrutscht.',
  'Angebote schreiben dauert jedes Mal ewig.',
  'Die Agentur meldet sich seit Wochen nicht.',
]

const LEISTUNGEN = [
  {
    n: '01',
    titel: 'Eine neue Website',
    text: 'Von der ersten Skizze bis zu dem Tag, an dem sie läuft. Sie sieht auf dem Handy so gut aus wie am Rechner, wird bei Google gefunden und schickt dir Anfragen direkt zu.',
  },
  {
    n: '02',
    titel: 'Die bestehende überarbeiten',
    text: 'Wenn das Grundgerüst steht, aber nichts davon mehr stimmt. Neues Aussehen ohne bei null anzufangen, schneller, endlich sauber auf dem Handy.',
  },
  {
    n: '03',
    titel: 'Abläufe automatisieren',
    text: 'Alles, was du jede Woche von Hand machst und nicht müsstest. Angebote, Rechnungen, Terminerinnerungen, Anfragen sortieren und beantworten.',
  },
  {
    n: '04',
    titel: 'Nur gefunden werden',
    text: 'Die Seite bleibt, wie sie ist. Sichtbar wird sie trotzdem: ganz oben bei Google und in den Antworten von ChatGPT und Perplexity.',
  },
]

const ABLAUF = [
  { n: '01', t: 'Du erzählst', b: 'Zwei Minuten Formular oder ein Telefonat. Ich will wissen, was dich stört, nicht welche Technik du dir vorstellst.' },
  { n: '02', t: 'Ich sage, was geht', b: 'Innerhalb von 24 Stunden: was es kostet, wie lange es dauert, ob es sich lohnt. Auch wenn die Antwort nein ist.' },
  { n: '03', t: 'Du siehst es vorher', b: 'Auf Wunsch ein erster Entwurf, bevor du dich festlegst. Gefällt er nicht, hast du nichts verloren.' },
  { n: '04', t: 'Es läuft und bleibt betreut', b: 'Gebaut, online gestellt, überwacht. Klemmt etwas, schreibst du mir statt einer Hotline.' },
]

/* Vier Angaben, die stimmen. Die Vorlagen aus dem Netz setzen hier "5M+
   Customers" hin; eine erfundene Zahl kostet die Glaubwuerdigkeit aller
   uebrigen Angaben auf der Seite. */
const FAKTEN = [
  { k: '24 h', v: 'bis du eine Antwort hast' },
  { k: '1', v: 'Ansprechpartner, von Anfang bis Ende' },
  { k: '0 €', v: 'für den ersten Entwurf' },
  { k: '3', v: 'Sprachen: Deutsch, Englisch, Spanisch' },
]

export default function HarebDigitalLanding() {
  return (
    <div>
      {/* ── Kopfzeile: eine Zeile, unter 80 Pixel hoch ──────────────────── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/start" className="flex items-center gap-2.5">
          <Image
            src="/icon-32-v2.png"
            alt=""
            width={30}
            height={30}
            className="rounded-lg"
          />
          <span className="font-display text-[19px] font-bold tracking-tight">
            Hareb Digital
          </span>
        </Link>
        <Link href="/anfrage" className="hd-cta px-5 py-2.5 text-[15px]">
          Projekt anfragen
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>

      {/* ── Bühne: links die Aussage, rechts die echte Arbeit ───────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pt-16">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <h1 className="max-w-[16ch] font-display text-[2.7rem] font-bold leading-[1.03] tracking-[-0.025em] sm:text-[3.6rem]">
              Gefunden werden. Arbeit loswerden.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[19px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              Websites und Programme für Betriebe ohne IT-Abteilung. Du sagst
              mir, was dich stört. Ich sage dir, was es kostet.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/anfrage" className="hd-cta px-7 py-3.5 text-[17px]">
                Projekt anfragen
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
              </Link>
              <a href="#arbeiten" className="hd-cta-ghost px-6 py-3.5 text-[17px]">
                Arbeiten ansehen
              </a>
            </div>
          </div>

          {/* Kein nachgebautes Fenster mehr, sondern die Seite, die seit
              Monaten für einen echten Kunden in Essen läuft. */}
          <figure className="lg:mt-0">
            <div className="hd-shot">
              <Image
                src="/projects/taxibb.png"
                alt="Startseite von taxibbessen.de, gebaut für Taxi B&B in Essen"
                width={1320}
                height={808}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="h-auto w-full"
              />
            </div>
            <figcaption className="mt-3 text-[15px] text-[color:var(--hd-ink-soft)]">
              taxibbessen.de, gebaut für Taxi B&amp;B in Essen. Läuft seit
              2026.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Wiedererkennung ─────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <h2 className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Kommt dir einer dieser Sätze bekannt vor?
          </h2>
          <ul className="mt-9 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {PROBLEME.map((p) => (
              /* Vorher stand hier ein farbiger Punkt vor jeder Zeile. Ein
                 Punkt, der keinen Zustand anzeigt, ist Dekoration, und
                 Dekoration vor jeder Zeile ist die Signatur, an der man
                 erzeugte Seiten erkennt. Eine Linie am linken Rand ordnet
                 dasselbe und behauptet nichts. */
              <li
                key={p}
                className="border-l-2 py-1 pl-4 text-[17px] leading-[1.55] text-[color:var(--hd-ink-soft)]"
                style={{ borderColor: 'var(--hd-line)' }}
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Arbeiten: die wichtigste Sektion der Seite ──────────────────── */}
      <section
        id="arbeiten"
        className="hd-rule scroll-mt-6"
        style={{ background: 'var(--hd-paper-2)' }}
      >
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <span className="hd-label">Arbeiten</span>
          <h2 className="mt-4 max-w-[22ch] font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.6rem]">
            Gebaut, online gestellt, im Betrieb.
          </h2>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <span className="hd-label">Kundenprojekt</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em]">
                Taxi B&amp;B Essen
              </h3>
              <p className="mt-3 max-w-[44ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
                Buchungen sofort oder auf Termin, ein Verwaltungsbereich mit
                eigener Datenbank, automatische E-Mails und technisches SEO bis
                hinunter zu den strukturierten Daten.
              </p>

              {/* Fremd gemessen, mit Datum und Quelle. Eigene Zahlen sind auf
                  einer Verkaufsseite nichts wert. */}
              <dl className="mt-7 grid max-w-sm grid-cols-2 gap-x-8 gap-y-5">
                {[
                  ['92', 'Onpage'],
                  ['99', 'Technik'],
                  ['97', 'Struktur'],
                  ['80', 'Inhalt'],
                ].map(([wert, name]) => (
                  <div key={name}>
                    <dt className="sr-only">{name}</dt>
                    <dd className="font-display text-3xl font-bold tabular-nums tracking-tight">
                      {wert}
                      <span className="text-[color:var(--hd-ink-soft)]">/100</span>
                    </dd>
                    <p className="mt-1 text-[15px] text-[color:var(--hd-ink-soft)]">
                      {name}
                    </p>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-[14px] text-[color:var(--hd-ink-soft)]">
                Gemessen von seobility.net am 28.07.2026.
              </p>

              <a
                href="https://taxibbessen.de"
                target="_blank"
                rel="noreferrer"
                className="hd-cta-ghost mt-7 px-5 py-2.5 text-[16px]"
              >
                Seite ansehen
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </div>

            <div className="hd-shot">
              <Image
                src="/projects/taxibb.png"
                alt="Buchungsstrecke und Startseite von taxibbessen.de"
                width={1320}
                height={808}
                sizes="(max-width: 1024px) 100vw, 620px"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* Eigene Produkte, und genau so beschriftet. */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {[
              {
                bild: '/projects/guardiangrid-login.jpg',
                w: 1280,
                h: 800,
                name: 'GuardianGrid',
                alt: 'Anmeldebereich von guardiangrid.io',
                text: 'Eigenes Produkt: Anmeldung über einen fremden Anbieter, Auswertung großer Datenmengen, laufender Betrieb auf eigener Infrastruktur.',
                url: 'https://www.guardiangrid.io',
              },
              {
                bild: '/projects/lukas.png',
                w: 1024,
                h: 1024,
                name: 'L.U.K.A.S.',
                alt: 'Oberfläche des KI-Agenten L.U.K.A.S.',
                text: 'Eigenes Produkt: ein KI-Agent mit dauerhaftem Gedächtnis, der echte Aufgaben übernimmt statt nur zu antworten.',
                url: null,
              },
            ].map((p) => (
              <article key={p.name} className="flex flex-col">
                {/* Festes Seitenverhaeltnis mit object-cover. Die beiden
                    Aufnahmen sind unterschiedlich geschnitten, eine quadratisch
                    und eine im Breitformat; ohne Rahmen stand die eine Karte
                    ueber zweihundert Pixel tiefer als die andere und das
                    Raster sah kaputt aus. */}
                <div className="hd-shot relative aspect-[16/10] w-full">
                  <Image
                    src={p.bild}
                    alt={p.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, 460px"
                    className="object-cover object-top"
                  />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold tracking-[-0.015em]">
                  {p.name}
                </h3>
                <p className="mt-2 max-w-[42ch] text-[16px] leading-[1.55] text-[color:var(--hd-ink-soft)]">
                  {p.text}
                </p>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex min-h-[24px] items-center gap-1.5 text-[16px] font-medium text-[color:var(--hd-accent)] hover:underline"
                  >
                    Ansehen
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leistungen: nummerierte Zeilen, keine drei gleichen Karten ──── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <h2 className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
            Such dir aus, was gerade drückt.
          </h2>
          <p className="mt-5 max-w-[54ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
            Du musst nicht alles auf einmal machen. Meistens ist es einer dieser
            vier Punkte, und der bringt schon den Unterschied.
          </p>

          <div className="mt-12">
            {LEISTUNGEN.map((l) => (
              <div
                key={l.n}
                className="hd-rule grid gap-x-10 gap-y-3 py-8 sm:grid-cols-[8rem_1fr] lg:grid-cols-[10rem_22rem_1fr]"
              >
                <span className="hd-num">{l.n}</span>
                <h3 className="font-display text-xl font-bold tracking-[-0.015em] sm:text-[22px]">
                  {l.titel}
                </h3>
                <p className="max-w-[56ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)] sm:col-span-2 lg:col-span-1">
                  {l.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ablauf ──────────────────────────────────────────────────────── */}
      <section className="hd-rule" style={{ background: 'var(--hd-paper-2)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <span className="hd-label">So läuft es</span>
          <h2 className="mt-4 max-w-[18ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
            Vier Schritte, kein Kleingedrucktes.
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ABLAUF.map((s) => (
              <li key={s.n}>
                <span className="hd-num">{s.n}</span>
                <div className="hd-rule mt-4 pt-4">
                  <h3 className="font-display text-lg font-bold tracking-[-0.015em]">
                    {s.t}
                  </h3>
                  <p className="mt-2 text-[16px] leading-[1.55] text-[color:var(--hd-ink-soft)]">
                    {s.b}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Zahlen ──────────────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {FAKTEN.map((f) => (
            <div key={f.k}>
              <div className="font-display text-[2.6rem] font-bold leading-none tracking-tight">
                {f.k}
              </div>
              <p className="mt-2.5 max-w-[24ch] text-[16px] leading-[1.5] text-[color:var(--hd-ink-soft)]">
                {f.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Schluss ─────────────────────────────────────────────────────── */}
      <section className="hd-rule" style={{ background: 'var(--hd-accent-soft)' }}>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <h2 className="mx-auto max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.025em] sm:text-[2.7rem]">
            Zwei Minuten, dann weißt du, woran du bist.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
            Fünf Felder, eines davon freiwillig. Innerhalb von 24 Stunden hast
            du eine ehrliche Einschätzung zu Umfang, Dauer und Preis.
          </p>
          <Link href="/anfrage" className="hd-cta mt-9 px-8 py-4 text-[17px]">
            Projekt anfragen
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── Fusszeile ───────────────────────────────────────────────────── */}
      <footer className="hd-rule px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <span className="text-[15px] text-[color:var(--hd-ink-soft)]">
            <strong className="font-semibold text-[color:var(--hd-ink)]">
              Hareb Digital
            </strong>
            , Inhaber Issa Hareb
          </span>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-1 text-[15px] text-[color:var(--hd-ink-soft)] [&_a]:inline-flex [&_a]:min-h-[24px] [&_a]:items-center [&_a:hover]:text-[color:var(--hd-ink)]">
            <a href="mailto:info@hareb.org">info@hareb.org</a>
            <Link href="/impressum">Impressum</Link>
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/">Portfolio</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
