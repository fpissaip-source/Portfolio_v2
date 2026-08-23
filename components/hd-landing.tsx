'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'

/**
 * Die bewegte Fassung der Landingpage.
 *
 * Der Regler stand auf Bewegungsstufe 3, aus einem Argument über die
 * Zielgruppe: Handwerksbetriebe kaufen Vertrauen, nicht Schauwerte. Das
 * Gegenargument ist stärker und kam vom Auftraggeber: wer Websites verkauft,
 * dessen eigene Seite IST die Arbeitsprobe. Eine ruhige Seite untergräbt
 * genau das, was hier angeboten wird. Stufe 8.
 *
 * Was die Stufe nicht bedeutet: Bewegung überall. TasteSkill §5 verlangt für
 * jede Animation einen Satz, der sagt, was sie mitteilt. Jede hier hat einen,
 * und er steht darüber. Wo mir keiner eingefallen ist, steht nichts.
 *
 * Alles ist an `useReducedMotion` gehängt. Das ist keine Nettigkeit: bei
 * dieser Dichte an Bewegung wäre die Seite ohne den Schalter für einen Teil
 * der Besucher unbenutzbar.
 */

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

const FAKTEN = [
  { zahl: 24, suffix: ' h', v: 'bis du eine Antwort hast' },
  { zahl: 1, suffix: '', v: 'Ansprechpartner, von Anfang bis Ende' },
  { zahl: 0, suffix: ' €', v: 'für den ersten Entwurf' },
  { zahl: 3, suffix: '', v: 'Sprachen: Deutsch, Englisch, Spanisch' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/* Ein Abschnitt fährt beim Eintreten auf. Was es mitteilt: hier fängt etwas
   Neues an. Einmalig, nicht bei jedem Vorbeiscrollen — ein Element, das bei
   jedem Richtungswechsel neu aufblendet, wirkt kaputt, nicht lebendig. */
function Auf({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/* Die Zahlen zählen hoch. Was es mitteilt: hin zu den einzigen vier Angaben
   auf der Seite, die man nachrechnen kann. Genau ein Element pro Zahl, keine
   Zustandsänderung in React pro Bild. */
function Zahl({ ziel, suffix }: { ziel: number; suffix: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const sichtbar = useInView(ref, { once: true, amount: 0.6 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce || !sichtbar) {
      if (reduce) el.textContent = String(ziel) + suffix
      return
    }
    const controls = animate(0, ziel, {
      duration: 1.1,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v)) + suffix
      },
    })
    return () => controls.stop()
  }, [sichtbar, ziel, suffix, reduce])

  return <span ref={ref}>{reduce ? ziel + suffix : '0' + suffix}</span>
}

/* Jeder Satz wird durchgestrichen, sobald er in den Blick kommt. Was es
   mitteilt: das sind die Probleme, die weggehen. Es ist die einzige Stelle
   der Seite, an der die Bewegung selbst das Argument trägt. */
function Problem({ text, index }: { text: string; index: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLLIElement>(null)
  const sichtbar = useInView(ref, { once: true, amount: 0.9 })

  return (
    <li
      ref={ref}
      className="relative border-l-2 py-1 pl-4 text-[17px] leading-[1.55]"
      style={{ borderColor: 'var(--hd-line)' }}
    >
      <span className="relative inline-block text-[color:var(--hd-ink-soft)]">
        {text}
        <motion.span
          aria-hidden
          className="absolute left-0 top-1/2 h-[2px] w-full origin-left"
          style={{ background: 'var(--hd-accent)' }}
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          animate={sichtbar || reduce ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.45, delay: reduce ? 0 : 0.08 * index, ease: EASE }}
        />
      </span>
    </li>
  )
}

export function HdLanding() {
  const reduce = useReducedMotion()

  /* Die Bühne: das Bild liegt eine Spur hinter dem Text und zieht beim
     Scrollen nach. Was es mitteilt: Tiefe. Ein einziger Wert, über einen
     Motion-Wert geführt statt über React-Zustand — sonst rendert der Baum
     bei jedem Bild neu. */
  const buehne = useRef<HTMLElement>(null)
  const { scrollYProgress: buehneP } = useScroll({
    target: buehne,
    offset: ['start start', 'end start'],
  })
  const bildY = useTransform(buehneP, [0, 1], [0, reduce ? 0 : 70])
  const bildWeich = useSpring(bildY, { stiffness: 120, damping: 26, mass: 0.4 })

  /* Der Beleg im Arbeitsteil richtet sich beim Hereinscrollen auf: von leicht
     nach hinten gekippt auf gerade. Was es mitteilt: hier liegt etwas auf dem
     Tisch, das man ansehen soll. */

  /* Hier war ein scrollgekoppelter Film geplant: die Kundenseite läuft beim
     Scrollen durch. Die Idee war gut, das Material trägt sie nicht. Ein Blick
     in taxibb.mp4 zeigte keinen Mitschnitt der Website, sondern einen
     Werbeclip mit einer Hand am Handy, schwarzen Balken links und rechts und
     Text, der auf dieser Grösse unlesbar ist. Dazu kam: die Datei hat zwei
     Schlüsselbilder auf 494 Bilder, ist also fürs Abspielen kodiert, nicht
     fürs Springen — jeder Sprung hätte bis zu 490 Bilder weit dekodieren
     müssen.

     Neu kodieren hätte das zweite Problem gelöst, nicht das erste. Eine
     Bildunterschrift, die einen Werbeclip als Rundgang durch die Seite
     ausgibt, wäre schlicht falsch gewesen. Das Bewegungsbudget liegt
     stattdessen dort, wo es etwas mitteilt: bei den durchgestrichenen
     Sätzen, den hochzählenden Zahlen und dem Aufbau der Abschnitte. */
  const film = useRef<HTMLDivElement>(null)
  const { scrollYProgress: filmP } = useScroll({
    target: film,
    offset: ['start end', 'center center'],
  })
  const bildKippen = useTransform(filmP, [0, 1], [reduce ? 0 : 9, 0])

  return (
    <div>
      {/* ── Kopfzeile ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ borderColor: 'var(--hd-line)', background: 'color-mix(in oklch, var(--hd-paper) 82%, transparent)' }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/start" className="flex items-center gap-2.5">
            <Image src="/icon-32-v2.png" alt="" width={30} height={30} className="rounded-lg" />
            <span className="font-display text-[19px] font-bold tracking-tight">Hareb Digital</span>
          </Link>
          <Link href="/anfrage" className="hd-cta hd-cta-pulse px-5 py-2.5 text-[15px]">
            Projekt anfragen
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      {/* ── Bühne ───────────────────────────────────────────────────────── */}
      <section ref={buehne} className="mx-auto max-w-6xl px-6 pb-24 pt-12 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <motion.h1
              className="max-w-[16ch] font-display text-[2.7rem] font-bold leading-[1.03] tracking-[-0.025em] sm:text-[3.6rem]"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              Gefunden werden. Arbeit loswerden.
            </motion.h1>
            <motion.p
              className="mt-6 max-w-[46ch] text-[19px] leading-[1.6] text-[color:var(--hd-ink-soft)]"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
            >
              Websites und Programme für Betriebe ohne IT-Abteilung. Du sagst
              mir, was dich stört. Ich sage dir, was es kostet.
            </motion.p>
            <motion.div
              className="mt-9 flex flex-wrap items-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.22, ease: EASE }}
            >
              <Link href="/anfrage" className="hd-cta hd-cta-pulse px-7 py-3.5 text-[17px]">
                Projekt anfragen
                <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
              </Link>
              <a href="#arbeiten" className="hd-cta-ghost px-6 py-3.5 text-[17px]">
                Arbeiten ansehen
              </a>
            </motion.div>
          </div>

          <motion.figure
            style={{ y: bildWeich }}
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
          >
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
              taxibbessen.de, gebaut für Taxi B&amp;B in Essen. Läuft seit 2026.
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ── Wiedererkennung ─────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <h2 className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
              Kommt dir einer dieser Sätze bekannt vor?
            </h2>
          </Auf>
          <ul className="mt-9 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {PROBLEME.map((p, i) => (
              <Problem key={p} text={p} index={i % 3} />
            ))}
          </ul>
          <Auf delay={0.15}>
            <p className="mt-9 text-[17px] font-medium">Genau das ist die Arbeit.</p>
          </Auf>
        </div>
      </section>

      {/* ── Arbeiten ────────────────────────────────────────────────────── */}
      <section id="arbeiten" className="hd-rule scroll-mt-16" style={{ background: 'var(--hd-paper-2)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <span className="hd-label">Arbeiten</span>
            <h2 className="mt-4 max-w-[22ch] font-display text-3xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-[2.6rem]">
              Gebaut, online gestellt, im Betrieb.
            </h2>
          </Auf>

          <div ref={film} className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Auf>
              <span className="hd-label">Kundenprojekt</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em]">
                Taxi B&amp;B Essen
              </h3>
              <p className="mt-3 max-w-[44ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
                Buchungen sofort oder auf Termin, ein Verwaltungsbereich mit
                eigener Datenbank, automatische E-Mails und technisches SEO bis
                hinunter zu den strukturierten Daten.
              </p>

              <dl className="mt-7 grid max-w-sm grid-cols-2 gap-x-8 gap-y-5">
                {[['92', 'Onpage'], ['99', 'Technik'], ['97', 'Struktur'], ['80', 'Inhalt']].map(
                  ([wert, name]) => (
                    <div key={name}>
                      <dt className="sr-only">{name}</dt>
                      <dd className="font-display text-3xl font-bold tabular-nums tracking-tight">
                        {wert}
                        <span className="text-[color:var(--hd-ink-soft)]">/100</span>
                      </dd>
                      <p className="mt-1 text-[15px] text-[color:var(--hd-ink-soft)]">{name}</p>
                    </div>
                  ),
                )}
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
            </Auf>

            {/* Das Bild kippt beim Scrollen leicht auf und richtet sich
                gerade. Was es mitteilt: hier liegt der Beleg. */}
            <motion.div
              style={{ rotateX: bildKippen, transformPerspective: 1200 }}
              initial={reduce ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <div className="hd-shot">
                <Image
                  src="/projects/taxibb.png"
                  alt="Buchungsstrecke und Startseite von taxibbessen.de"
                  width={1320}
                  height={808}
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="h-auto w-full"
                />
              </div>
            </motion.div>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            {[
              {
                bild: '/projects/guardiangrid-login.jpg',
                name: 'GuardianGrid',
                alt: 'Anmeldebereich von guardiangrid.io',
                text: 'Eigenes Produkt: Anmeldung über einen fremden Anbieter, Auswertung großer Datenmengen, laufender Betrieb auf eigener Infrastruktur.',
                url: 'https://www.guardiangrid.io',
              },
              {
                bild: '/projects/lukas.png',
                name: 'L.U.K.A.S.',
                alt: 'Oberfläche des KI-Agenten L.U.K.A.S.',
                text: 'Eigenes Produkt: ein KI-Agent mit dauerhaftem Gedächtnis, der echte Aufgaben übernimmt statt nur zu antworten.',
                url: null,
              },
            ].map((p, i) => (
              <Auf key={p.name} delay={i * 0.1}>
                <article className="group flex flex-col">
                  <div className="hd-shot relative aspect-[16/10] w-full">
                    <Image
                      src={p.bild}
                      alt={p.alt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, 460px"
                      /* Der Bildausschnitt zieht beim Zeigen leicht auf. Was
                         es mitteilt: das ist anklickbar. */
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
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
              </Auf>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leistungen ──────────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <h2 className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
              Such dir aus, was gerade drückt.
            </h2>
            <p className="mt-5 max-w-[54ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              Du musst nicht alles auf einmal machen. Meistens ist es einer
              dieser vier Punkte, und der bringt schon den Unterschied.
            </p>
          </Auf>

          <div className="mt-12">
            {LEISTUNGEN.map((l, i) => (
              <Auf key={l.n} delay={i * 0.06}>
                {/* Die Zeile bekommt beim Zeigen einen hellen Grund und rückt
                    ein Stück nach rechts. Was es mitteilt: das hier ist eine
                    Auswahl, keine Aufzählung. */}
                <div className="hd-rule grid gap-x-10 gap-y-3 py-8 transition-[background-color,padding] duration-300 hover:bg-white hover:pl-4 sm:grid-cols-[8rem_1fr] lg:grid-cols-[10rem_22rem_1fr]">
                  <span className="hd-num">{l.n}</span>
                  <h3 className="font-display text-xl font-bold tracking-[-0.015em] sm:text-[22px]">
                    {l.titel}
                  </h3>
                  <p className="max-w-[56ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)] sm:col-span-2 lg:col-span-1">
                    {l.text}
                  </p>
                </div>
              </Auf>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ablauf ──────────────────────────────────────────────────────── */}
      <section className="hd-rule" style={{ background: 'var(--hd-paper-2)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <span className="hd-label">So läuft es</span>
            <h2 className="mt-4 max-w-[18ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
              Vier Schritte, kein Kleingedrucktes.
            </h2>
          </Auf>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {ABLAUF.map((s, i) => (
              <Auf key={s.n} delay={i * 0.09}>
                <li>
                  <span className="hd-num">{s.n}</span>
                  <div className="hd-rule mt-4 pt-4">
                    <h3 className="font-display text-lg font-bold tracking-[-0.015em]">{s.t}</h3>
                    <p className="mt-2 text-[16px] leading-[1.55] text-[color:var(--hd-ink-soft)]">
                      {s.b}
                    </p>
                  </div>
                </li>
              </Auf>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Zahlen ──────────────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {FAKTEN.map((f, i) => (
            <Auf key={f.v} delay={i * 0.08}>
              <div className="font-display text-[2.6rem] font-bold leading-none tabular-nums tracking-tight">
                <Zahl ziel={f.zahl} suffix={f.suffix} />
              </div>
              <p className="mt-2.5 max-w-[24ch] text-[16px] leading-[1.5] text-[color:var(--hd-ink-soft)]">
                {f.v}
              </p>
            </Auf>
          ))}
        </div>
      </section>

      {/* ── Schluss ─────────────────────────────────────────────────────── */}
      <section className="hd-rule" style={{ background: 'var(--hd-accent-soft)' }}>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
          <Auf>
            <h2 className="mx-auto max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.025em] sm:text-[2.7rem]">
              Zwei Minuten, dann weißt du, woran du bist.
            </h2>
            <p className="mx-auto mt-5 max-w-[48ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              Fünf Felder, eines davon freiwillig. Innerhalb von 24 Stunden
              hast du eine ehrliche Einschätzung zu Umfang, Dauer und Preis.
            </p>
            <Link href="/anfrage" className="hd-cta hd-cta-pulse mt-9 px-8 py-4 text-[17px]">
              Projekt anfragen
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </Auf>
        </div>
      </section>

      {/* ── Fusszeile ───────────────────────────────────────────────────── */}
      <footer className="hd-rule px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <span className="text-[15px] text-[color:var(--hd-ink-soft)]">
            <strong className="font-semibold text-[color:var(--hd-ink)]">Hareb Digital</strong>,
            Inhaber Issa Hareb
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
