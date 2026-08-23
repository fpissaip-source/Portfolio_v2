import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

/**
 * The Hareb Digital landing page.
 *
 * The portfolio and this page have opposite jobs. The portfolio has to
 * impress: loud, three-dimensional, cinematic, built to make an engineer
 * stop scrolling. This one has to explain and sell, to somebody who runs a
 * workshop or a practice and does not care what a shader is. Trying to do
 * both on one page is exactly why the existing copy kept landing as "too
 * complicated".
 *
 * So the rules here are different, and deliberately narrow:
 *
 *   Every sentence in the language a customer uses. "Deine Seite wird bei
 *   Google gefunden", not "technisches SEO mit strukturierten Daten".
 *
 *   Every claim checkable. The numbers below are four things that are
 *   actually true — a response time, three languages, one contact, a free
 *   first draft — and not the invented "5M+ Customers" that the reference
 *   designs put in that slot. A stranger being sold to can smell a made-up
 *   number, and one of them poisons the rest of the page.
 *
 *   No 3D, no scroll hijacking, no library that has to boot before a word is
 *   readable. Every animation here is CSS on a compositor property.
 *
 * The visual signature is the logo's own gradient — cyan through magenta to
 * orange. The portfolio owns violet and blue; this owns the full span. Two
 * brands, two palettes, one hand.
 */

const title = 'Hareb Digital: Websites, die gefunden werden und Arbeit abnehmen'
const description =
  'Hareb Digital baut Websites, Webanwendungen und Automatisierungen für kleine und mittlere Unternehmen. Ein Ansprechpartner, fester Preis, Antwort in 24 Stunden.'

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
}

/** The four things that can be bought, in the same order and wording as the
 *  enquiry form's dropdown. A visitor who picks one here should find the same
 *  words waiting on the next page, or they will wonder if they clicked wrong. */
const SERVICES = [
  {
    n: '01',
    title: 'Eine komplett neue Website',
    lead: 'Von der ersten Skizze bis zu dem Tag, an dem sie läuft.',
    points: [
      'Sieht auf dem Handy so gut aus wie am Rechner',
      'Wird bei Google gefunden und von ChatGPT, Gemini und Claude zitiert',
      'Anfragen landen direkt bei dir, nicht in einem Formular-Nirvana',
      'Du kannst Texte und Bilder selbst ändern',
    ],
  },
  {
    n: '02',
    title: 'Deine bestehende Seite überarbeiten',
    lead: 'Wenn das Grundgerüst steht, aber nichts davon mehr stimmt.',
    points: [
      'Neues Aussehen, ohne bei null anzufangen',
      'Schneller. Die meisten Seiten laden dreimal so lang wie nötig',
      'Endlich sauber auf dem Handy',
      'Technik auf Stand, damit sie nicht in zwei Jahren wieder fällig ist',
    ],
  },
  {
    n: '03',
    title: 'Abläufe automatisieren',
    lead: 'Alles, was du jede Woche von Hand machst und nicht müsstest.',
    points: [
      'Angebote und Rechnungen entstehen von selbst',
      'Anfragen werden sortiert, beantwortet und eingetragen',
      'Termine, Erinnerungen und Nachfassen, ohne dass du daran denkst',
      'KI-Assistenten, die deine Abläufe kennen, nicht nur plaudern',
    ],
  },
  {
    n: '04',
    title: 'Nur gefunden werden',
    lead: 'Die Seite bleibt, wie sie ist. Sichtbar wird sie trotzdem.',
    points: [
      'Ganz oben bei Google für das, wonach deine Kunden suchen',
      'In den Antworten von ChatGPT, Gemini und Perplexity auftauchen',
      'Google-Unternehmensprofil, Karten, Bewertungen',
      'Monatlich nachgemessen, nicht einmal eingerichtet und vergessen',
    ],
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Du erzählst',
    body: 'Zwei Minuten Formular oder ein Telefonat. Ich will wissen, was dich stört, nicht welche Technik du dir vorstellst.',
  },
  {
    n: '02',
    title: 'Ich sage ehrlich, was geht',
    body: 'Innerhalb von 24 Stunden: was es kostet, wie lange es dauert, und ob es sich für dich überhaupt lohnt. Auch wenn die Antwort nein ist.',
  },
  {
    n: '03',
    title: 'Du siehst es, bevor du zahlst',
    body: 'Auf Wunsch bekommst du einen ersten Entwurf, ohne dass du dich festgelegt hast. Gefällt er nicht, hast du nichts verloren.',
  },
  {
    n: '04',
    title: 'Es läuft und bleibt betreut',
    body: 'Gebaut, online gestellt, überwacht. Wenn etwas klemmt, rufst du nicht bei einer Hotline an, sondern schreibst mir.',
  },
]

/** Four numbers that are true. The reference designs put "5M+ Customers"
 *  here; a stranger being sold to can smell an invented number, and one of
 *  them costs the credibility of everything else on the page. */
const FACTS = [
  { k: '24 h', v: 'bis du eine Antwort hast' },
  { k: '1', v: 'Ansprechpartner, von Anfang bis Ende' },
  { k: '0 €', v: 'für den ersten Entwurf' },
  { k: '3', v: 'Sprachen: Deutsch, Englisch, Spanisch' },
]

const MARQUEE = [
  'Das Telefon klingelt nicht',
  'Bei Google finden uns nur die, die uns eh kennen',
  'Die Seite sieht aus wie 2014',
  'Auf dem Handy ist alles verrutscht',
  'Angebote schreiben dauert jedes Mal ewig',
  'ChatGPT kennt uns nicht',
  'Die Agentur meldet sich seit Wochen nicht',
  'Anfragen gehen im Postfach unter',
]

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="hd-label">
      <span className="hd-bracket" aria-hidden>
        &lt;
      </span>
      {children}
      <span className="hd-bracket" aria-hidden>
        /&gt;
      </span>
    </span>
  )
}

/**
 * The right half of the hero.
 *
 * All three reference designs carry a photograph or a 3D render there, and
 * neither is available or honest here: a stock photo of somebody pointing at
 * a laptop says nothing, and a rendered abstract shape says less. So instead
 * of decorating the promise, this shows it. "Gefunden werden" is abstract
 * until you see the search result and the AI answer that the sentence is
 * actually about.
 *
 * Deliberately generic and unbranded. These are illustrations of an outcome,
 * not reproductions of anybody's product — no search engine's marks, no
 * assistant's name, no invented company being quoted as if it were real. A
 * marketing page that fakes a screenshot of a real service is doing the same
 * thing it is asking the visitor to trust it not to do.
 */
function HeroProof() {
  return (
    <div aria-hidden className="relative mx-auto w-full max-w-[440px] lg:mx-0">
      {/* Suchergebnis */}
      <div className="hd-card p-6 sm:p-7">
        <span className="hd-label text-[12px]">Suchergebnis</span>

        <div className="mt-4 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-full border-2"
            style={{ borderColor: 'color-mix(in oklch, var(--hd-cyan) 70%, transparent)' }}
          />
          <span className="text-[15px] text-white/70">schreinerei essen</span>
        </div>

        <div className="mt-6 flex gap-3.5">
          <span
            className="mt-0.5 h-7 w-7 shrink-0 rounded-lg"
            style={{
              background: 'linear-gradient(140deg, var(--hd-cyan), var(--hd-magenta))',
            }}
          />
          <div className="min-w-0">
            <p className="text-[13px] leading-none text-white/45">deine-schreinerei.de</p>
            <p className="mt-2 text-[17px] font-medium leading-snug">
              <span className="hd-gradient-text">Schreinerei in Essen</span>
            </p>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-white/55">
              Möbel nach Maß, Einbauschränke, Küchen. Termin in 48 Stunden.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2.5">
          <span
            className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
            style={{
              background: 'color-mix(in oklch, var(--hd-cyan) 18%, transparent)',
              color: 'var(--hd-cyan)',
            }}
          >
            Platz 1
          </span>
          <span className="text-[13px] text-white/40">von 3.400 Ergebnissen</span>
        </div>
      </div>

      {/* KI-Antwort, versetzt darunter — die zweite Hälfte derselben Aussage:
          gefunden werden heisst heute auch, zitiert zu werden. */}
      <div className="hd-card mt-4 p-6 sm:ml-10 sm:p-7">
        <span className="hd-label text-[12px]">KI-Antwort</span>
        <p className="mt-4 text-[16px] leading-[1.6] text-white/80">
          „Für Möbel nach Maß in Essen wird häufig{' '}
          <span className="font-medium text-white">deine Schreinerei</span>{' '}
          genannt, bekannt für Einbauschränke und kurze Termine.“
        </p>
        <div className="mt-5 flex items-center gap-2">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--hd-orange)' }}
          />
          <span className="text-[13px] text-white/45">Quelle: deine-schreinerei.de</span>
        </div>
      </div>
    </div>
  )
}

export default function HarebDigitalLanding() {
  return (
    <div className="relative overflow-hidden">
      {/* ── Kopfzeile ───────────────────────────────────────────────────── */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <span className="flex items-baseline gap-2">
          <span className="hd-bracket text-xl" aria-hidden>
            &lt;H/D&gt;
          </span>
          <span className="font-display text-[19px] font-bold tracking-tight">
            Hareb Digital
          </span>
        </span>
        <Link
          href="/anfrage"
          className="hd-cta hidden px-6 py-2.5 text-[15px] sm:inline-flex sm:items-center sm:gap-2"
        >
          Projekt anfragen
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </header>

      {/* ── Bühne ───────────────────────────────────────────────────────── */}
      <section className="relative">
        {/* Two blurred radials, no images and no JavaScript. The whole
            atmosphere of the reference pages for the price of a gradient. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[120vh]"
          style={{
            background:
              'radial-gradient(52% 42% at 18% 12%, color-mix(in oklch, var(--hd-blue) 34%, transparent) 0%, transparent 68%), radial-gradient(44% 38% at 82% 4%, color-mix(in oklch, var(--hd-magenta) 26%, transparent) 0%, transparent 70%), radial-gradient(40% 34% at 62% 46%, color-mix(in oklch, var(--hd-orange) 14%, transparent) 0%, transparent 72%)',
          }}
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-28 pt-16 sm:pt-24 lg:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)] lg:gap-12">
        <div>
          <Label>Websites · Software · KI-Automatisierung</Label>

          {/* One idea, three lines, no orphans. `max-w` in ch rather than
              pixels so it holds at every step of the type scale. */}
          <h1 className="mt-7 font-poster text-[3.1rem] uppercase leading-[0.9] tracking-[-0.02em] sm:text-[4.6rem] lg:text-[4.5rem] xl:text-[5.4rem]">
            <span className="hd-gradient-text">Gefunden werden.</span>
            <br />
            Arbeit loswerden.
          </h1>

          <p className="mt-8 max-w-[54ch] text-[19px] leading-[1.62] text-white/78 sm:text-[21px]">
            Websites und Programme für Betriebe ohne IT-Abteilung. Du sagst
            mir, was dich stört. Ich sage dir, was es kostet.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/anfrage"
              className="hd-cta inline-flex items-center gap-2.5 px-8 py-4 text-[17px]"
            >
              Projekt anfragen
              <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
            </Link>
            <a
              href="#leistungen"
              className="hd-cta-ghost inline-flex items-center gap-2.5 px-7 py-4 text-[17px] font-medium"
            >
              Was ich mache
              <ArrowUpRight className="h-[18px] w-[18px]" aria-hidden />
            </a>
          </div>


        </div>

          <HeroProof />
        </div>

        {/* Der Geister-Schriftzug, der unten aus dem Bild läuft. */}
        <div
          aria-hidden
          className="pointer-events-none relative -mb-4 select-none overflow-hidden"
        >
          <div className="hd-ghost whitespace-nowrap text-[19vw]">
            HAREB DIGITAL
          </div>
        </div>
      </section>

      {/* Die drei Zusagen standen als Kleinzeile unter den Schaltflächen — der
          Ort, an dem eine Bühne aufhört, eine Bühne zu sein. Sie sind richtig
          und wichtig, also stehen sie jetzt als eigene Zeile, mit Trennlinien
          statt Mittelpunkten. */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <ul className="grid gap-y-4 text-[15px] text-white/60 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
          <li className="sm:pr-6">Antwort in 24 Stunden</li>
          <li className="sm:px-6">Fester Preis, keine Überraschungen</li>
          <li className="sm:pl-6">Sitz in Sankt Augustin, zuhause in Essen</li>
        </ul>
      </section>

      {/* ── Laufband ────────────────────────────────────────────────────── */}
      <section
        aria-label="Sätze, die ich in Erstgesprächen höre"
        className="hd-marquee-mask border-y border-white/8 py-5"
      >
        <div className="hd-marquee">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {MARQUEE.map((line) => (
                <span
                  key={line}
                  className="flex items-center whitespace-nowrap px-7 text-[17px] text-white/62"
                >
                  <span
                    className="mr-7 text-[13px]"
                    style={{ color: 'var(--hd-magenta)' }}
                    aria-hidden
                  >
                    ✦
                  </span>
                  {line}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Leistungen ──────────────────────────────────────────────────── */}
      <section id="leistungen" className="mx-auto max-w-7xl scroll-mt-8 px-6 py-24 sm:py-32">
        <Label>Vier Wege</Label>
        <h2 className="mt-6 max-w-[19ch] font-display text-4xl font-bold leading-[1.04] tracking-[-0.025em] sm:text-6xl">
          Such dir aus, was gerade drückt.
        </h2>
        <p className="mt-6 max-w-[58ch] text-[19px] leading-[1.6] text-white/72">
          Du musst nicht alles auf einmal machen. Meistens ist es einer dieser
          vier Punkte, und der bringt schon den Unterschied.
        </p>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.n} className="hd-card p-8 sm:p-10">
              <span className="hd-num" aria-hidden>
                {s.n}
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-[26px]">
                {s.title}
              </h3>
              <p className="mt-3 text-[17px] leading-[1.55] text-white/70">{s.lead}</p>
              <ul className="mt-6 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3.5 text-[16px] leading-[1.5] text-white/80">
                    <span
                      aria-hidden
                      className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        background:
                          'linear-gradient(140deg, var(--hd-cyan), var(--hd-magenta))',
                      }}
                    />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Zahlen ──────────────────────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.k}>
              <div className="font-poster text-[3.2rem] leading-none tracking-[-0.02em] sm:text-[3.8rem]">
                <span className="hd-gradient-text">{f.k}</span>
              </div>
              <p className="mt-3 max-w-[24ch] text-[16px] leading-[1.5] text-white/65">
                {f.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Ablauf ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32">
        <Label>So läuft es</Label>
        <h2 className="mt-6 max-w-[18ch] font-display text-4xl font-bold leading-[1.04] tracking-[-0.025em] sm:text-6xl">
          Vier Schritte, kein Kleingedrucktes.
        </h2>

        <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.n}>
              <span className="hd-num opacity-60" aria-hidden>
                {s.n}
              </span>
              <div className="hd-rule mt-5" />
              <h3 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em]">
                {s.title}
              </h3>
              <p className="mt-3 max-w-[46ch] text-[17px] leading-[1.6] text-white/72">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Der Unterschied ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:pb-32">
        <div className="hd-card p-9 sm:p-14">
          <Label>Warum ich</Label>
          <h2 className="mt-6 max-w-[22ch] font-display text-3xl font-bold leading-[1.06] tracking-[-0.025em] sm:text-5xl">
            Bei einer Agentur bist du ein Ticket. Hier bist du ein Gespräch.
          </h2>
          <div className="mt-9 grid gap-8 sm:grid-cols-3">
            {[
              {
                t: 'Du redest mit dem, der es baut',
                b: 'Kein Vertrieb, der etwas verspricht, und kein Projektleiter, der es weitergibt. Was ich dir zusage, mache ich selbst.',
              },
              {
                t: 'Preis steht vorher fest',
                b: 'Du bekommst eine Zahl, bevor es losgeht. Keine Stundenzettel, keine Nachforderung, weil etwas länger gedauert hat.',
              },
              {
                t: 'Ehrlich auch gegen mich selbst',
                b: 'Wenn dein Vorhaben sich nicht lohnt oder du es günstiger anders lösen kannst, sage ich das. Ein schlechter Auftrag kostet uns beide mehr.',
              },
            ].map((c) => (
              <div key={c.t}>
                <h3 className="font-display text-xl font-bold tracking-[-0.015em]">{c.t}</h3>
                <p className="mt-2.5 text-[16px] leading-[1.55] text-white/70">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Schluss ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(50% 90% at 50% 100%, color-mix(in oklch, var(--hd-magenta) 22%, transparent) 0%, transparent 70%)',
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
          <h2 className="mx-auto max-w-[17ch] font-poster text-[2.9rem] uppercase leading-[0.94] tracking-[-0.02em] sm:text-[4.4rem]">
            <span className="hd-gradient-text">Zwei Minuten.</span>
            <br />
            Dann weißt du, woran du bist.
          </h2>
          <p className="mx-auto mt-7 max-w-[48ch] text-[19px] leading-[1.6] text-white/75">
            Fünf Felder, eines davon freiwillig. Innerhalb von 24 Stunden hast
            du eine ehrliche Einschätzung zu Umfang, Dauer und Preis.
          </p>
          <Link
            href="/anfrage"
            className="hd-cta mt-10 inline-flex items-center gap-2.5 px-9 py-4 text-[18px]"
          >
            Projekt anfragen
            <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </section>

      {/* ── Fusszeile ───────────────────────────────────────────────────── */}
      <footer className="border-t border-white/8 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <span className="flex items-baseline gap-2">
            <span className="hd-bracket text-lg" aria-hidden>
              &lt;H/D&gt;
            </span>
            <span className="font-display text-[16px] font-bold tracking-tight">
              Hareb Digital
            </span>
            <span className="text-[15px] text-white/50">· Inhaber Issa Hareb</span>
          </span>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-1 text-[15px] text-white/60 [&_a]:inline-flex [&_a]:min-h-[24px] [&_a]:items-center">
            <a href="mailto:info@hareb.org" className="transition-colors hover:text-white">
              info@hareb.org
            </a>
            <Link href="/impressum" className="transition-colors hover:text-white">
              Impressum
            </Link>
            <Link href="/datenschutz" className="transition-colors hover:text-white">
              Datenschutz
            </Link>
            <Link href="/" className="transition-colors hover:text-white">
              Portfolio ↗
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
