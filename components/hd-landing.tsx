'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
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

/* Eine Überschrift baut sich Wort für Wort auf, hinter einer Kante hervor.
   Was es mitteilt: hier beginnt ein Akt, und er nimmt sich die Zeit dafür.
   Das ist der Vorspann-Trick: nicht die Bewegung ist der Punkt, sondern die
   Kante, die sie freigibt.

   Der Satz steht als gewöhnlicher Text im Dokument, nur in Wortstücke
   zerlegt. Ein Crawler liest ihn also einmal und vollständig. Die schmale
   Fusszone am Maskenrand ist kein Zierrat: ohne sie schneidet die Kante die
   Unterlängen von g, j und p ab. */
function Titel({ children, className }: { children: string; className?: string }) {
  const reduce = useReducedMotion()
  const woerter = children.split(' ')

  return (
    <motion.h2
      className={className}
      initial={reduce ? false : 'aus'}
      whileInView="an"
      viewport={{ once: true, amount: 0.4 }}
      variants={{ an: { transition: { staggerChildren: 0.055 } } }}
    >
      {woerter.map((wort, i) => (
        <Fragment key={`${wort}-${i}`}>
          <span
            data-wortmaske
            className="inline-block overflow-hidden pb-[0.14em] align-bottom -mb-[0.14em]"
          >
            <motion.span
              className="inline-block"
              variants={
                reduce ? undefined : { aus: { y: '108%', opacity: 0 }, an: { y: 0, opacity: 1 } }
              }
              transition={{ duration: 0.75, ease: EASE }}
            >
              {wort}
            </motion.span>
          </span>
          {/* Das Leerzeichen steht zwischen den Masken, nicht in ihnen. In
              einem inline-block fiele es am Rand weg, die Wörter klebten
              zusammen, und kopierter Text trüge geschützte Leerzeichen. */}
          {i < woerter.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </motion.h2>
  )
}

/* Ein Satz, der sich beim Scrollen selbst liest: Wort für Wort geht von
   fast unsichtbar auf volle Deckkraft, gebunden an den Scrollweg statt an
   eine Uhr. Was es mitteilt: lies langsam, das hier ist die Behauptung, auf
   der alles andere steht.

   Der Trick liegt in der Bindung. Eine Uhr würde den Satz abspulen, egal wie
   schnell jemand scrollt; so bestimmt der Leser das Tempo und hält an, wenn
   er anhält. Das Wort bleibt gewöhnlicher Text mit einem Leerzeichen darin,
   deshalb ein inline-Element und kein inline-block: bei inline-block würde
   das schliessende Leerzeichen wegfallen und die Wörter kleben zusammen. */
function LeuchtWort({
  fortschritt,
  von,
  bis,
  aus,
  children,
}: {
  fortschritt: MotionValue<number>
  von: number
  bis: number
  aus: boolean
  children: string
}) {
  const deckung = useTransform(fortschritt, [von, bis], [0.15, 1])
  return <motion.span style={aus ? undefined : { opacity: deckung }}>{children}</motion.span>
}

function LeuchtSatz({ text, className }: { text: string; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.6'] })
  const woerter = text.split(' ')

  return (
    <p ref={ref} data-lesesatz className={className}>
      {woerter.map((wort, i) => (
        <LeuchtWort
          key={`${wort}-${i}`}
          fortschritt={scrollYProgress}
          von={i / woerter.length}
          bis={(i + 1) / woerter.length}
          aus={!!reduce}
        >
          {i < woerter.length - 1 ? `${wort} ` : wort}
        </LeuchtWort>
      ))}
    </p>
  )
}

/* Der Knopf zieht den Zeiger an: er folgt ihm ein Stück weit, federt zurück,
   sobald der Zeiger geht. Was es mitteilt: hier will etwas angefasst werden.

   Nur bei einem feinen Zeiger. Auf einem Touchscreen gibt es kein Schweben,
   und ein Element, das erst beim Antippen wegrutscht, ist kein Effekt,
   sondern ein Ziel, das ausweicht. */
function Magnet({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const fx = useSpring(x, { stiffness: 240, damping: 18, mass: 0.3 })
  const fy = useSpring(y, { stiffness: 240, damping: 18, mass: 0.3 })
  const [fein, setFein] = useState(false)

  useEffect(() => {
    const m = window.matchMedia('(pointer: fine)')
    const setzen = () => setFein(m.matches)
    setzen()
    m.addEventListener('change', setzen)
    return () => m.removeEventListener('change', setzen)
  }, [])

  const an = fein && !reduce

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className ?? ''}`}
      style={an ? { x: fx, y: fy } : undefined}
      onPointerMove={(e) => {
        if (!an || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * 0.28)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.34)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

/* Ob die Seite breit genug für das gepinnte Laufwerk ist. Der erste Durchlauf
   meldet immer false, auf dem Server gibt es kein matchMedia: die Liste ist
   damit der Grundzustand und das Laufwerk die Zutat, nicht umgekehrt. */
function useBreit(abfrage = '(min-width: 1024px)') {
  const [an, setAn] = useState(false)
  useEffect(() => {
    const m = window.matchMedia(abfrage)
    const setzen = () => setAn(m.matches)
    setzen()
    m.addEventListener('change', setzen)
    return () => m.removeEventListener('change', setzen)
  }, [abfrage])
  return an
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
    if (reduce) {
      el.textContent = String(ziel) + suffix
      return
    }
    if (!sichtbar) {
      el.textContent = '0' + suffix
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

  /* Im Dokument steht die richtige Zahl, nicht die Null. Zwei Gründe: ein
     Crawler liest "24 h" und nicht "0 h", und der Server rendert dasselbe wie
     der Browser im ersten Durchgang, egal ob dort Bewegung abgeschaltet ist.
     Auf null gesetzt wird erst danach, im Effekt, lange bevor der Abschnitt
     überhaupt in den Blick kommt. */
  return <span ref={ref}>{ziel + suffix}</span>
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

/* Das Laufwerk: die vier Leistungen liegen nebeneinander und fahren quer
   durchs Bild, während man senkrecht scrollt. Was es mitteilt: das ist eine
   Auswahl zum Durchsehen, kein Stapel Text zum Durchlesen.

   Eigene Komponente, nicht bloss ein Zweig im Baum darüber. useScroll misst
   seinen Ref beim Einhängen; steht der Zweig beim ersten Rendern noch nicht
   da, weil matchMedia erst nach dem Einhängen antwortet, greift die Messung
   ins Leere und startet nie wieder. Als eigene Komponente wird sie erst
   erzeugt, wenn ihr Element auch entsteht.

   Der Weg wird gemessen statt geschätzt: sonst bleibt am Ende entweder eine
   Lücke stehen oder die letzte Karte hängt halb aus dem Bild. */
function Laufwerk() {
  const bahn = useRef<HTMLDivElement>(null)
  const spur = useRef<HTMLOListElement>(null)
  const [weg, setWeg] = useState(0)
  const [karte, setKarte] = useState(0)
  const { scrollYProgress } = useScroll({ target: bahn, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, [0, 1], [0, -weg])
  const weich = useSpring(x, { stiffness: 200, damping: 34, mass: 0.5 })

  useEffect(() => {
    const messen = () => {
      const el = spur.current
      if (!el) return
      setWeg(Math.max(0, el.scrollWidth - window.innerWidth + 24))
    }
    messen()
    const beobachter = new ResizeObserver(messen)
    if (spur.current) beobachter.observe(spur.current)
    window.addEventListener('resize', messen)
    return () => {
      beobachter.disconnect()
      window.removeEventListener('resize', messen)
    }
  }, [])

  /* Der Zähler oben rechts. Er hängt am selben Fortschritt wie die Fahrt,
     rendert aber nur, wenn die Karte wechselt: vier Zustände auf der ganzen
     Strecke statt einer Zustandsänderung pro Bild. */
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.min(LEISTUNGEN.length - 1, Math.floor(v * LEISTUNGEN.length + 0.0001))
    setKarte(i < 0 ? 0 : i)
  })

  return (
    <div ref={bahn} className="relative h-[280vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-[min(72rem,calc(100vw-3rem))] items-baseline justify-between pb-8">
          <span className="hd-label">Leistungen</span>
          <span className="font-display text-[15px] font-bold tabular-nums tracking-tight">
            {LEISTUNGEN[karte].n}
            <span className="text-[color:var(--hd-ink-soft)]"> / 0{LEISTUNGEN.length}</span>
          </span>
        </div>

        <motion.ol ref={spur} style={{ x: weich }} className="flex gap-7 px-6">
          {LEISTUNGEN.map((l, i) => (
            <li
              key={l.n}
              className="hd-surface flex min-h-[21rem] w-[min(82vw,34rem)] shrink-0 flex-col justify-between p-10"
              /* Die Karte, die gerade dran ist, steht vorn: volle Deckkraft,
                 die anderen treten zurück. Was es mitteilt: eine nach der
                 anderen, nicht alle auf einmal. */
              style={{ opacity: i === karte ? 1 : 0.55, transition: 'opacity 0.45s ease' }}
            >
              <span className="hd-num">{l.n}</span>
              <div>
                <h3 className="font-display text-[28px] font-bold leading-[1.12] tracking-[-0.02em]">
                  {l.titel}
                </h3>
                <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
                  {l.text}
                </p>
              </div>
            </li>
          ))}
        </motion.ol>

        {/* Der zurückgelegte Weg als Balken. Was es mitteilt: es sind vier,
            und du bist bei der zweiten. */}
        <div
          aria-hidden
          className="mx-auto mt-10 h-px w-[min(72rem,calc(100vw-3rem))]"
          style={{ background: 'var(--hd-line)' }}
        >
          <motion.div
            className="h-full origin-left"
            style={{ scaleX: scrollYProgress, background: 'var(--hd-accent)' }}
          />
        </div>
      </div>
    </div>
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
  /* Das Bild wächst beim Scrollen ein Stück über seinen Rahmen hinaus. Was es
     mitteilt: die Kamera fährt heran. Ein Prozent Maßstab pro Scrollweg reicht
     dafür; mehr sieht nach Effekt aus statt nach Bewegung. */
  const bildZoom = useTransform(buehneP, [0, 1], [1, reduce ? 1 : 1.06])

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
  /* Die Kopfzeile kippt mit, solange der dunkle Akt hinter ihr liegt. Was es
     mitteilt: die Seite hat den Raum gewechselt, nicht nur die Farbe. Ein
     heller Balken über einer schwarzen Einstellung sieht aus wie ein Fehler
     im Vorführraum, nicht wie eine Entscheidung.

     Gemessen wird gegen die tatsächliche Höhe der Leiste statt gegen eine
     abgeschriebene Zahl, und der Zustand ist ein Wahrheitswert: React rendert
     nur beim Umschlag neu, nicht bei jedem Scrollschritt. */
  const kopf = useRef<HTMLElement>(null)
  const akt = useRef<HTMLElement>(null)
  const [imAkt, setImAkt] = useState(false)

  useEffect(() => {
    const abschnitt = akt.current
    if (!abschnitt) return
    const pruefen = () => {
      const kante = kopf.current?.getBoundingClientRect().height ?? 64
      const r = abschnitt.getBoundingClientRect()
      setImAkt(r.top <= kante && r.bottom > kante)
    }
    pruefen()
    window.addEventListener('scroll', pruefen, { passive: true })
    window.addEventListener('resize', pruefen)
    return () => {
      window.removeEventListener('scroll', pruefen)
      window.removeEventListener('resize', pruefen)
    }
  }, [])

  /* Ein Band unter der Kopfzeile zeigt, wie weit die Seite gelesen ist. Was
     es mitteilt: wie viel noch kommt. Es ist die einzige Bewegung der Seite,
     die auch bei abgeschalteter Bewegung bleibt, weil sie keine ist: es zeigt
     eine Position an, es animiert nichts von allein. Die Feder nimmt dem
     Zeiger nur das Zucken bei ruckeligem Scrollen. */
  const { scrollYProgress: seiteP } = useScroll()
  const band = useSpring(seiteP, { stiffness: 140, damping: 30, mass: 0.3 })

  const laufwerk = useBreit() && !reduce

  /* Die Linie unter dem Ablauf zeichnet sich mit dem Scrollen. Was es
     mitteilt: die vier Schritte sind ein Weg und keine vier Kästen. */
  const ablauf = useRef<HTMLDivElement>(null)
  const { scrollYProgress: ablaufP } = useScroll({
    target: ablauf,
    offset: ['start 0.85', 'end 0.65'],
  })
  const linie = useSpring(ablaufP, { stiffness: 120, damping: 28, mass: 0.4 })

  const film = useRef<HTMLDivElement>(null)
  const { scrollYProgress: filmP } = useScroll({
    target: film,
    offset: ['start end', 'center center'],
  })
  const bildKippen = useTransform(filmP, [0, 1], [reduce ? 0 : 9, 0])
  /* Die Kamera fährt auf das Standbild zu, während es in den Blick kommt, und
     kommt genau dann zur Ruhe, wenn es mittig steht. Was es mitteilt: das ist
     die Einstellung, auf die der Abschnitt hinauswollte. */
  const kamera = useTransform(filmP, [0, 1], [reduce ? 1 : 1.14, 1])

  return (
    <div>
      {/* ── Kopfzeile ───────────────────────────────────────────────────── */}
      <header
        ref={kopf}
        className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-500 ${imAkt ? 'hd-akt' : ''} relative`}
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
        <motion.div
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left"
          style={{ scaleX: band, background: 'var(--hd-accent)' }}
        />
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
              <Magnet>
                <Link href="/anfrage" className="hd-cta hd-cta-pulse px-7 py-3.5 text-[17px]">
                  Projekt anfragen
                  <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
                </Link>
              </Magnet>
              <a href="#arbeiten" className="hd-cta-ghost px-6 py-3.5 text-[17px]">
                Arbeiten ansehen
              </a>
            </motion.div>
          </div>

          <motion.figure
            style={{ y: bildWeich }}
            /* Die Blende öffnet sich von der Mitte nach oben und unten, wie
               ein Vorhang. Der Maßstab dahinter gehört dem Scrollen, die
               Blende dem Laden — zwei getrennte Bewegungen auf demselben
               Element, sonst kämpfen sie um dasselbe Bild. */
            initial={reduce ? false : { clipPath: 'inset(46% 0% 46% 0%)', opacity: 0 }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)', opacity: 1 }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE }}
          >
            <motion.div className="hd-shot" style={{ scale: bildZoom }}>
              <Image
                src="/projects/taxibb.png"
                alt="Startseite von taxibbessen.de, gebaut für Taxi B&B in Essen"
                width={1320}
                height={808}
                priority
                sizes="(max-width: 1024px) 100vw, 560px"
                className="h-auto w-full"
              />
            </motion.div>
            <figcaption className="mt-3 text-[15px] text-[color:var(--hd-ink-soft)]">
              taxibbessen.de, gebaut für Taxi B&amp;B in Essen. Läuft seit 2026.
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ── Wiedererkennung ─────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Titel className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl">
            Kommt dir einer dieser Sätze bekannt vor?
          </Titel>
          <ul className="mt-9 grid gap-x-12 gap-y-4 sm:grid-cols-2">
            {PROBLEME.map((p, i) => (
              <Problem key={p} text={p} index={i % 3} />
            ))}
          </ul>
        </div>
      </section>

      {/* ── Behauptung ──────────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-36">
          <LeuchtSatz
            className="font-display text-[1.75rem] font-bold leading-[1.28] tracking-[-0.02em] text-[color:var(--hd-ink)] sm:text-[2.4rem] sm:leading-[1.25]"
            text="Genau das ist die Arbeit. Du bekommst keine Präsentation, sondern eine Seite, die läuft. Kein Baukasten, kein Abo, keine Warteschleife. Klemmt etwas, schreibst du mir und nicht einer Hotline."
          />
        </div>
      </section>

      {/* ── Arbeiten ────────────────────────────────────────────────────── */}
      <section ref={akt} id="arbeiten" className="hd-akt scroll-mt-16">
        {/* Der Schnitt. Eine Haarlinie im Akzent an der Kante, an der die Seite
            ins Dunkle kippt: sie macht aus dem Farbwechsel eine Absicht. */}
        <div
          aria-hidden
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--hd-accent), transparent)',
          }}
        />
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-32">
          <Auf className="text-center">
            <span className="hd-label">Arbeiten</span>
          </Auf>
          <Titel className="mx-auto mt-4 max-w-[20ch] text-center font-display text-[2.1rem] font-bold leading-[1.08] tracking-[-0.025em] sm:text-[3.1rem]">
            Gebaut, online gestellt, im Betrieb.
          </Titel>

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
              <div className="hd-kino hd-shot">
                <motion.div className="relative h-full w-full" style={{ scale: kamera }}>
                  <Image
                    src="/projects/taxibb.png"
                    alt="Buchungsstrecke und Startseite von taxibbessen.de"
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 680px"
                    className="object-cover object-top"
                  />
                </motion.div>
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
        <div className="mx-auto max-w-6xl px-6 pb-4 pt-16 sm:pt-24">
          <Titel className="max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
            Such dir aus, was gerade drückt.
          </Titel>
          <Auf delay={0.1}>
            <p className="mt-5 max-w-[54ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              Du musst nicht alles auf einmal machen. Meistens ist es einer
              dieser vier Punkte, und der bringt schon den Unterschied.
            </p>
          </Auf>
        </div>

        {laufwerk ? (
          <Laufwerk />
        ) : (
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-24">
            {LEISTUNGEN.map((l, i) => (
              <Auf key={l.n} delay={i * 0.06}>
                {/* Die Zeile bekommt beim Zeigen einen hellen Grund und rückt
                    ein Stück nach rechts. Was es mitteilt: das hier ist eine
                    Auswahl, keine Aufzählung. */}
                <div className="hd-rule grid gap-x-10 gap-y-3 py-8 transition-[background-color,padding] duration-300 hover:bg-white hover:pl-4 sm:grid-cols-[8rem_1fr]">
                  <span className="hd-num">{l.n}</span>
                  <h3 className="font-display text-xl font-bold tracking-[-0.015em] sm:text-[22px]">
                    {l.titel}
                  </h3>
                  <p className="max-w-[56ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)] sm:col-span-2">
                    {l.text}
                  </p>
                </div>
              </Auf>
            ))}
          </div>
        )}
      </section>

      {/* ── Ablauf ──────────────────────────────────────────────────────── */}
      <section className="hd-rule" style={{ background: 'var(--hd-paper-2)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <span className="hd-label">So läuft es</span>
          </Auf>
          <Titel className="mt-4 max-w-[18ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-[2.6rem]">
            Vier Schritte, kein Kleingedrucktes.
          </Titel>

          <div ref={ablauf}>
            <div aria-hidden className="mt-12 h-px w-full" style={{ background: 'var(--hd-line)' }}>
              <motion.div
                className="h-full origin-left"
                style={{ scaleX: reduce ? 1 : linie, background: 'var(--hd-accent)' }}
              />
            </div>
            <ol className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
          <Titel className="mx-auto max-w-[20ch] font-display text-3xl font-bold leading-[1.1] tracking-[-0.025em] sm:text-[2.7rem]">
            Zwei Minuten, dann weißt du, woran du bist.
          </Titel>
          <Auf delay={0.1}>
            <p className="mx-auto mt-5 max-w-[48ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              Fünf Felder, eines davon freiwillig. Innerhalb von 24 Stunden
              hast du eine ehrliche Einschätzung zu Umfang, Dauer und Preis.
            </p>
            <Magnet className="mt-9">
              <Link href="/anfrage" className="hd-cta hd-cta-pulse px-8 py-4 text-[17px]">
                Projekt anfragen
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Magnet>
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
