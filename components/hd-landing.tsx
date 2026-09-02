'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { ClickSpark } from './click-spark'
import { Galerie, type Schaustueck } from './galerie'
import { HdHeld } from './hd-held'
import { HdSprachschalter } from './hd-sprachschalter'
import { HdKartenmenue } from './hd-kartenmenue'
import { HD_TEXTE, type HdLang, type HdTexte } from '@/lib/hd-texte'
import { langPath } from '@/lib/i18n'
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

const EASE = [0.22, 1, 0.36, 1] as const

/* Die Flugbahn des Rufs zur Tat.
   ------------------------------------------------------------------------
   Der Knopf steht zuerst nur in der Bühne. Verschwindet er beim Scrollen
   unter der Kopfzeile, fliegt er dort hinauf und schrumpft dabei auf seinen
   Pfeil zusammen. Was es mitteilt: der Weg zum Formular geht nicht verloren,
   nur weil man weiterliest.

   Warum von Hand und nicht mit layoutId, wofür Motion genau diesen Fall
   vorsieht: nachgemessen. Dasselbe Markup fliegt sauber, wenn der Wechsel von
   einem Klick kommt, und springt ohne jede Bewegung, wenn er aus einem
   Scroll-Ereignis kommt. Motion rechnet Scrollversätze aus seinen
   Layoutmessungen heraus — sinnvoll, sonst würde jedes klebende Element bei
   jedem Scrollschritt animieren, hier aber genau das Gegenteil von dem, was
   gebraucht wird. Der Wechsel kommt hier immer aus dem Scrollen.

   Deshalb: klassisches FLIP. Vor dem Wechsel den Kasten messen, nach dem
   Wechsel den Zielkasten, und die Strecke dazwischen selbst abfahren.

   Zwei Dinge, die das besser macht als eine Bibliothek es könnte:
   Der Zielkasten wird in jedem Bild neu gelesen. Fliegt der Knopf zurück in
   die Bühne, während weitergescrollt wird, wandert sein Ziel mit — ein
   einmal gemessener Endpunkt hätte am Ende einen sichtbaren Versatz.
   Und er fliegt fest am Bildschirm (position: fixed), also unbeeinflusst
   davon, wie weit während des Flugs gescrollt wird.

   In Ruhe steht der Knopf dagegen ganz gewöhnlich im Fluss. Ein dauerhaft
   fest positionierter Knopf müsste bei jedem Scrollschritt per Skript
   nachgeführt werden, und genau das ist auf dem Telefon das Zittern, das
   hier nicht vorkommen soll. */

/* Die Galerie. Nur Medien, keine Beschriftung: Titel, Kategorie und Verweis
   sind bewusst weg — die Schau soll zeigen und nicht erzaehlen. Die Reihenfolge
   wechselt zwischen Standbild und Bewegtbild, damit beim Ziehen etwas passiert.

   Die Videos liegen auf 16:10 beschnitten und ohne Tonspur bereit: in jedem
   steckt ein Browserfenster mittig im Bild, der Beschnitt trifft genau dieses
   Fenster, und stumm laufen sie ohnehin.

   Vorne steht ein Video und kein Standbild: es laeuft an, sobald die Schau
   ins Bild kommt, und Bewegung sagt schneller als jede Beschriftung, dass
   hier etwas zu sehen ist.

   Nachlegen heisst: eine Zeile hier. Bei Bildern muessen die Masse stimmen,
   sie halten den Platz frei. */
const SCHAU: Schaustueck[] = [
  { art: 'video', id: 'schau-1', quelle: '/videos/schau-1.mp4', standbild: '/videos/schau-1.jpg' },
  { art: 'bild', id: 'guardiangrid', quelle: '/projects/guardiangrid-login.jpg', breite: 1280, hoehe: 800 },
  { art: 'video', id: 'schau-2', quelle: '/videos/schau-2.mp4', standbild: '/videos/schau-2.jpg' },
  { art: 'video', id: 'schau-3', quelle: '/videos/schau-3.mp4', standbild: '/videos/schau-3.jpg' },
]

const FLUGDAUER = 520

type Flug = {
  von: { left: number; top: number; breite: number; hoehe: number }
  ziel: 'buehne' | 'kopf'
}

function kasten(el: HTMLElement) {
  const r = el.getBoundingClientRect()
  return { left: r.left, top: r.top, breite: r.width, hoehe: r.height }
}

const misch = (a: number, b: number, t: number) => a + (b - a) * t

function useFliegenderRuf(
  kopf: React.RefObject<HTMLElement | null>,
  reduce: boolean,
  held: React.RefObject<HTMLElement | null>,
) {
  const buehneAnker = useRef<HTMLSpanElement>(null)
  const kopfAnker = useRef<HTMLSpanElement>(null)
  /* Beide Knöpfe teilen sich einen Ref: es ist immer nur einer eingehängt,
     und der Flug muss den messen, der gerade dasteht. */
  const sichtbar = useRef<HTMLAnchorElement>(null)
  const flieger = useRef<HTMLAnchorElement>(null)

  const [ort, setOrt] = useState<'buehne' | 'kopf'>('buehne')
  const [flug, setFlug] = useState<Flug | null>(null)
  const ortRef = useRef(ort)
  const flugRef = useRef<Flug | null>(null)
  ortRef.current = ort
  flugRef.current = flug

  useEffect(() => {
    const anker = buehneAnker.current
    if (!anker) return

    const pruefen = () => {
      if (flugRef.current) return

      /* Der Abflug hängt am Fortschritt der Bühne und nicht mehr daran, ob
         der Knopf unter die Kopfzeile gerutscht ist.

         Der Grund: die Bühne klebt oben fest. Der Knopf steht darin zwei
         Bildschirme lang an derselben Stelle und rutscht nirgendwohin — er
         wäre also nie abgeflogen, und wenn doch, dann erst, nachdem der Text
         längst ausgeblendet war. Ein Knopf, der aus dem Nichts hervorkommt
         und nach oben fliegt, sieht aus wie ein Fehler.

         Jetzt fliegt er in dem Moment, in dem der Text anfängt zu gehen.
         Zwei Schwellen statt einer, sonst flackert er auf der Kante. */
      const el = held.current
      if (!el) return
      const weg = Math.max(el.offsetHeight - window.innerHeight, 1)
      const p = (window.scrollY - (el.getBoundingClientRect().top + window.scrollY)) / weg
      const soll: 'buehne' | 'kopf' =
        ortRef.current === 'kopf' ? (p > 0.26 ? 'kopf' : 'buehne') : p > 0.34 ? 'kopf' : 'buehne'
      if (soll === ortRef.current) return

      if (reduce || !sichtbar.current) {
        setOrt(soll)
        return
      }
      setFlug({ von: kasten(sichtbar.current), ziel: soll })
    }

    pruefen()
    window.addEventListener('scroll', pruefen, { passive: true })
    window.addEventListener('resize', pruefen)
    return () => {
      window.removeEventListener('scroll', pruefen)
      window.removeEventListener('resize', pruefen)
    }
  }, [kopf, reduce, held])

  useEffect(() => {
    if (!flug) return
    const el = flieger.current
    const ziel = flug.ziel === 'kopf' ? kopfAnker.current : buehneAnker.current
    if (!el || !ziel) {
      setOrt(flug.ziel)
      setFlug(null)
      return
    }

    const beginn = performance.now()
    let raf = 0
    /* Die natürliche Breite der Beschriftung, einmal gemessen. Sie muss beim
       Flug mitschrumpfen und nicht nur ausblenden: eine unsichtbare
       Beschriftung nimmt weiter Platz ein und schiebt den Pfeil aus dem
       schmaler werdenden Kasten heraus. Genau so war der Knopf unterwegs eine
       leere schwarze Scheibe. */
    let wortbreite = 0
    const schritt = () => {
      const p = Math.min(1, (performance.now() - beginn) / FLUGDAUER)
      const e = 1 - Math.pow(1 - p, 3)
      const nach = kasten(ziel)
      el.style.left = `${misch(flug.von.left, nach.left, e)}px`
      el.style.top = `${misch(flug.von.top, nach.top, e)}px`
      el.style.width = `${misch(flug.von.breite, nach.breite, e)}px`
      el.style.height = `${misch(flug.von.hoehe, nach.hoehe, e)}px`
      /* Die Beschriftung geht früh weg und kommt spät wieder. Sie soll
         verschwunden sein, bevor der Kasten so schmal ist, dass sie
         angeschnitten aussieht. */
      const wort = el.querySelector<HTMLElement>('[data-beschriftung]')
      if (wort) {
        if (!wortbreite) wortbreite = wort.scrollWidth
        const k = Math.max(0, Math.min(1, flug.ziel === 'kopf' ? 1 - e * 1.8 : e * 1.8 - 0.8))
        wort.style.opacity = String(k)
        wort.style.width = `${wortbreite * k}px`
        wort.style.marginRight = `${9.6 * k}px`
      }
      if (p < 1) {
        raf = requestAnimationFrame(schritt)
      } else {
        setOrt(flug.ziel)
        setFlug(null)
      }
    }
    raf = requestAnimationFrame(schritt)
    return () => cancelAnimationFrame(raf)
  }, [flug])

  return { buehneAnker, kopfAnker, sichtbar, flieger, ort, flug }
}

/* Ein Bildschirmfoto aus einer fremden App.
 *
 * AVIF mit WebP daneben, handgeschrieben statt next/image: die Dateien
 * liegen bereits in beiden Formaten vor, und der Optimierer wuerde fertige
 * Bilder ein zweites Mal umrechnen.
 *
 * Weisser Grund im Rahmen: die Bilder kommen aus Instagram und TikTok und
 * sind dort hell. Frei auf der dunklen Seite wuerden sie leuchten; im
 * Rahmen sind sie erkennbar ein Zitat aus einer anderen Anwendung. */
function SocialBild({
  name,
  alt,
  breite,
  hoehe,
}: {
  name: string
  alt: string
  breite: number
  hoehe: number
}) {
  return (
    <picture>
      <source srcSet={`/social/${name}.avif`} type="image/avif" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/social/${name}.webp`}
        alt={alt}
        width={breite}
        height={hoehe}
        loading="lazy"
        decoding="async"
        className="w-full rounded-lg bg-white"
      />
    </picture>
  )
}

/* Wert oben, Wort darunter, im Dokument aber Begriff vor Wert.
 * `flex-col-reverse` dreht nur die Darstellung. Sonst muesste die
 * Beschriftung zweimal dastehen, einmal sichtbar und einmal versteckt, und
 * ein Vorlesegeraet laese sie doppelt. */
function Zahlenliste({
  zahlen,
  spalten,
}: {
  zahlen: { wert: string; label: string }[]
  spalten: string
}) {
  return (
    <dl className={`grid gap-x-5 gap-y-4 ${spalten}`}>
      {zahlen.map((z) => (
        <div key={z.label} className="flex flex-col-reverse">
          <dt className="mt-1 text-[13px] leading-snug text-[color:var(--hd-ink-soft)]">
            {z.label}
          </dt>
          <dd className="font-display text-[1.6rem] font-bold leading-none tabular-nums tracking-tight text-[color:var(--hd-accent)]">
            {z.wert}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* Ein Abschnitt fährt beim Eintreten auf./* Ein Abschnitt fährt beim Eintreten auf. Was es mitteilt: hier fängt etwas
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
      /* text-balance verteilt die Zeilen gleichmaessig, statt jede bis zur
         Kante zu fuellen und den Rest fallen zu lassen. Ohne das stand hier
         "Gebaut, online gestellt, im / Betrieb." — ein Waisenwort in der
         zweiten Zeile, weil "im" gerade noch in die erste passte. */
      className={`text-balance ${className ?? ''}`}
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
function Laufwerk({ t }: { t: HdTexte }) {
  const bahn = useRef<HTMLDivElement>(null)
  const spur = useRef<HTMLOListElement>(null)
  const [weg, setWeg] = useState(0)
  const [karte, setKarte] = useState(0)
  const punkte = t.leistungen.punkte
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
    const i = Math.min(punkte.length - 1, Math.floor(v * punkte.length + 0.0001))
    setKarte(i < 0 ? 0 : i)
  })

  return (
    /* 210vh statt 280vh.
       Die Strecke bestimmt, wie schnell die Karten seitlich fahren: 280vh
       waren siebzig Bildschirmhoehen Scrollen pro Karte, und das las sich
       als "hier passiert nichts". Kuerzer ist dieselbe Bewegung, nur mit
       Antrieb. */
    <div ref={bahn} className="relative h-[210vh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto flex w-[min(72rem,calc(100vw-3rem))] items-baseline justify-between pb-8">
          <span className="hd-label">{t.leistungen.label}</span>
          <span className="font-display text-[15px] font-bold tabular-nums tracking-tight">
            {punkte[karte].n}
            <span className="text-[color:var(--hd-ink-soft)]"> / 0{punkte.length}</span>
          </span>
        </div>

        <motion.ol ref={spur} style={{ x: weich }} className="flex gap-7 px-6">
          {punkte.map((l, i) => (
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

export function HdLanding({ lang }: { lang: HdLang }) {
  const t = HD_TEXTE[lang]
  /* Die beiden Zielseiten liegen im Portfolio und tragen dessen Sprachpfade.
     Wer die englische Fassung liest, soll nicht im deutschen Formular landen. */
  const zumFormular = langPath(lang, '/anfrage')
  const reduce = useReducedMotion()

  /* Die Heldenbühne. Der Abschnitt gehört dem Bauteil, der Verweis darauf
     steht hier: die Kopfzeile und der fliegende Knopf müssen wissen, wie weit
     die Bühne durchgescrollt ist. */
  const held = useRef<HTMLElement>(null)

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
  /* Die Kopfzeile ist durchsichtig, solange der Film hinter ihr läuft, und
     bekommt ihren Grund erst danach. Was es mitteilt: oben ist Bild, unten
     ist Seite. Ein Balken mit Milchglas über einem formatfüllenden Film sieht
     aus wie ein vergessenes Bedienfeld.

     Der Zustand ist ein Wahrheitswert und kein Messwert: React rendert nur
     beim Umschlag neu, nicht bei jedem Scrollschritt.

     Früher stand hier dieselbe Mechanik für den dunklen Akt — die Kopfzeile
     kippte auf Schwarz, sobald er hinter ihr lag. Seit die ganze Seite dunkel
     ist, hat sie nichts mehr zu kippen. */
  const kopf = useRef<HTMLElement>(null)
  const akt = useRef<HTMLElement>(null)
  const [ueberDemFilm, setUeberDemFilm] = useState(true)

  useEffect(() => {
    const abschnitt = held.current
    if (!abschnitt) return
    const pruefen = () => {
      const kante = kopf.current?.getBoundingClientRect().height ?? 64
      setUeberDemFilm(abschnitt.getBoundingClientRect().bottom > kante)
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

  const ruf = useFliegenderRuf(kopf, !!reduce, held)

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
      {/* Funken am Zeiger, bei jedem Klick. Warmes Licht, die Seite ist
          dunkel. */}
      <ClickSpark sparkColor="#e8a765" sparkSize={10} sparkRadius={16} sparkCount={8} duration={420} />

      {/* ── Kopfzeile ───────────────────────────────────────────────────── */}
      <header
        ref={kopf}
        /* Fest und nicht klebend. Eine klebende Leiste bleibt im Fluss und
           schiebt den Film um ihre Höhe nach unten — dann steht oben ein
           schwarzer Balken und darunter fängt das Bild an. Fest liegt sie
           darüber, und der Film beginnt bei Null.

           `relative` steht nicht mehr dabei: es setzte dieselbe Eigenschaft
           ein zweites Mal, und der Fortschrittsbalken darunter braucht es
           nicht — eine feste Leiste ist selbst schon der Bezugsrahmen für
           alles, was absolut darin liegt. */
        /* Der Grund sitzt nicht mehr hier, sondern an der Leiste selbst:
           die faehrt beim Oeffnen auf, und ein zweiter Grund darunter waere
           ein Rechteck, das mit ihr nicht mitwaechst. */
        className="fixed inset-x-0 top-0 z-40"
      >
        {/* Ein Schleier hinter der schwebenden Leiste.
            Seit die Leiste nicht mehr die volle Breite hat, laeuft der Text
            der Seite oben an ihr vorbei und steht angeschnitten darueber.
            Der Verlauf blendet ihn weg, statt ihn abzuschneiden — dieselbe
            Loesung wie im Portfolio (components/top-scrim.tsx). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[104px] transition-opacity duration-500"
          style={{
            opacity: ueberDemFilm ? 0 : 1,
            background:
              'linear-gradient(to bottom, var(--hd-paper) 0%, color-mix(in oklch, var(--hd-paper) 70%, transparent) 55%, transparent 100%)',
          }}
        />

        {/* Die Leiste ist jetzt das Kartenmenue (components/hd-kartenmenue.tsx,
            nach React Bits' CardNav). Sprachschalter und der Anker, auf dem
            der Anfrage-Knopf landet, wandern hinein statt daneben: sie
            muessen ueber der aufgefahrenen Flaeche bleiben, sonst
            verschwinden sie unter den Karten. */}
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
          <HdKartenmenue
            t={t}
            formular={zumFormular}
            ueberDemFilm={ueberDemFilm}
            ankerRef={ruf.kopfAnker}
            rechts={<HdSprachschalter lang={lang} />}
            kinder={
              ruf.ort === 'kopf' && !ruf.flug ? (
                <Link
                  ref={ruf.sichtbar}
                  href={zumFormular}
                  aria-label={t.ctaHaupt}
                  title={t.ctaHaupt}
                  className="hd-cta hd-cta-pulse absolute inset-0 justify-center p-0"
                >
                  <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
                </Link>
              ) : null
            }
          />
        </div>

        <motion.div
          aria-hidden
          className="absolute inset-x-0 -bottom-px h-[2px] origin-left"
          style={{ scaleX: band, background: 'var(--hd-accent)' }}
        />
      </header>

      {/* ── Heldenbühne ─────────────────────────────────────────────────── */}
      <HdHeld
        sektion={held}
        titelOben={t.buehne.titelOben}
        titelUnten={t.buehne.titelUnten}
        vorspann={t.buehne.vorspann}
        bildAlt={t.buehne.bildAlt}
        hinweis={t.buehne.hinweis}
      >
        {/* Der Anker haelt Breite und Höhe, waehrend der Knopf oben in der
            Kopfzeile sitzt. Ohne ihn ruecke "Arbeiten ansehen" in genau dem
            Moment nach links, in dem der Knopf abhebt.

            Kein Magnet um diesen Knopf: der Magnet legt eine verschobene
            Huelle darum, und die Flugbahn wird in Bildschirmkoordinaten
            gemessen. Eine Verschiebung dazwischen macht aus der ruhigen Bahn
            einen Sprung. */}
        <span ref={ruf.buehneAnker} className="relative inline-flex">
          <span aria-hidden className="hd-cta invisible px-7 py-3.5 text-[17px]">
            {t.ctaHaupt}
            <ArrowRight className="h-[18px] w-[18px]" />
          </span>
          {ruf.ort === 'buehne' && !ruf.flug && (
            <Link
              ref={ruf.sichtbar}
              href={zumFormular}
              className="hd-cta hd-cta-pulse absolute inset-0 justify-center px-7 text-[17px]"
            >
              {t.ctaHaupt}
              <ArrowRight className="h-[18px] w-[18px] shrink-0" aria-hidden />
            </Link>
          )}
        </span>
        <a href="#arbeiten" className="hd-cta-ghost px-6 py-3.5 text-[17px]">
          {t.buehne.arbeitenAnsehen}
        </a>
      </HdHeld>


      {/* ── Wiedererkennung ─────────────────────────────────────────────── */}
      <section className="hd-rule hd-glanz">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Titel className="hd-titel max-w-[20ch] font-display font-bold">
            {t.probleme.titel}
          </Titel>
          {/* Zitate, keine Liste mit Strichen.
              Vorher stand hier je ein Satz mit einer Linie am linken Rand und
              einem Strich mitten hindurch. Der Strich sass auf halber Hoehe
              des Kastens: bei einem Satz, der ueber zwei Zeilen laeuft, ging
              er quer durch die erste und liess die zweite unberuehrt stehen.
              Das sah nicht nach Durchstreichen aus, sondern nach Fehler.

              Jetzt klappt jeder Satz beim Hereinscrollen auf wie ein Blatt,
              das gefaltet war. Was es mitteilt: das hier sind Saetze, die
              jemand gesagt hat, und sie werden gerade aufgeschlagen. Die
              Anfuehrungszeichen sind Typografie und keine Linien. */}
          {/* Jeder Satz in einer eigenen Fassung.
              Vorher standen sechs graue Einzeiler frei im Schwarz, mit einer
              halben Bildschirmhöhe Leere darunter — auf Papier trägt so viel
              Weissraum, im Dunkeln ist er einfach leer. In Kästen sind es
              sechs Stimmen und nicht sechs Zeilen. */}
        </div>

        {/* Ein laufendes Band statt acht gleicher Kaesten.
            Vorher stand hier ein Raster: zweimal vier Zitate, alle gleich
            gross, alle gleich grau, und beim Scrollen klappte jedes einzeln
            auf. Das war Bewegung ohne Rhythmus — die Flaeche stand still und
            zuckte nur.

            Jetzt laufen die Saetze in zwei Reihen gegeneinander. Das nimmt
            die volle Breite statt eines Rasters mit Rand, und es sagt
            nebenbei etwas Richtiges: das sind keine acht abgehakten Punkte,
            das ist ein Strom von Saetzen, den jeder schon einmal gehoert hat.

            Bewegt wird nur `transform`. Die Liste steht zweimal da, damit die
            zweite Haelfte genau dann anfaengt, wenn die erste durch ist; der
            Schnitt liegt bei -50 %, deshalb ist er unsichtbar. Die Kopie
            traegt `aria-hidden`, sonst laese ein Vorlesegeraet alles doppelt. */}
        <div className="hd-band">
          {[0, 1].map((reihe) => (
            <div key={reihe} className={`hd-band__reihe hd-band__reihe--${reihe}`}>
              {[0, 1].map((halb) => (
                <ul key={halb} className="hd-band__spur" aria-hidden={halb === 1 || undefined}>
                  {t.probleme.punkte
                    .filter((_, i) => i % 2 === reihe)
                    .map((satz) => (
                      <li key={satz} className="hd-band__satz">
                        <span aria-hidden className="text-[color:var(--hd-accent)]">&bdquo;</span>
                        {satz}
                        <span aria-hidden className="text-[color:var(--hd-accent)]">&ldquo;</span>
                      </li>
                    ))}
                </ul>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Behauptung ──────────────────────────────────────────────────── */}
      <section className="hd-rule">
        <div className="mx-auto max-w-5xl px-6 py-24 sm:py-36">
          <LeuchtSatz
            className="font-display text-[1.75rem] font-bold leading-[1.28] tracking-[-0.02em] text-[color:var(--hd-ink)] sm:text-[2.4rem] sm:leading-[1.25]"
            text={t.behauptung}
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
            <span className="hd-label">{t.arbeiten.label}</span>
          </Auf>
          <Titel className="hd-titel mx-auto mt-4 max-w-[20ch] text-center font-display font-bold">
            {t.arbeiten.titel}
          </Titel>

          <div ref={film} className="mt-12 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <Auf>
              <span className="hd-label">{t.arbeiten.kundeLabel}</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em]">
                {t.arbeiten.kundeName}
              </h3>
              <p className="mt-3 max-w-[44ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
                {t.arbeiten.kundeText}
              </p>

              <dl className="mt-7 grid max-w-sm grid-cols-2 gap-x-8 gap-y-5">
                {t.arbeiten.werte.map(({ wert, name }) => (
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
                {t.arbeiten.quelle}
              </p>

              <a
                href="https://taxibbessen.de"
                target="_blank"
                rel="noreferrer"
                className="hd-cta-ghost mt-7 px-5 py-2.5 text-[16px]"
              >
                {t.arbeiten.seiteAnsehen}
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
                    alt={t.arbeiten.belegAlt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 100vw, 680px"
                    className="object-cover object-top"
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Die Galerie steht ausserhalb des Textcontainers und nimmt die
            volle Breite: der Stapel kippt nach hinten weg und braucht links
            und rechts Luft fuer die zurueckgesetzten Nachbarn. */}
        <div className="pb-20 sm:pb-32">
          <Galerie
            stuecke={SCHAU}
            label={t.werkschau.label}
            vorher={t.werkschau.vorher}
            weiter={t.werkschau.weiter}
            folie={t.werkschau.folie}
          />
        </div>
      </section>

      {/* ── Leistungen ──────────────────────────────────────────────────── */}
      <section id="leistungen" className="hd-rule">
        <div className="mx-auto max-w-6xl px-6 pb-4 pt-16 sm:pt-24">
          <Titel className="hd-titel max-w-[20ch] font-display font-bold">
            {t.leistungen.titel}
          </Titel>
          <Auf delay={0.1}>
            <p className="mt-5 max-w-[54ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              {t.leistungen.vorspann}
            </p>
          </Auf>
        </div>

        {laufwerk ? (
          <Laufwerk t={t} />
        ) : (
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-24">
            {t.leistungen.punkte.map((l, i) => (
              <Auf key={l.n} delay={i * 0.06}>
                {/* Die Zeile bekommt beim Zeigen einen hellen Grund und rückt
                    ein Stück nach rechts. Was es mitteilt: das hier ist eine
                    Auswahl, keine Aufzählung. */}
                <div className="hd-zeile hd-rule grid gap-x-10 gap-y-3 py-8 sm:grid-cols-[8rem_1fr]">
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

      {/* ── Social Media ────────────────────────────────────────────────── */}
      <section id="social" className="hd-rule hd-glanz">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <span className="hd-label">{t.social.label}</span>
          </Auf>
          <Titel className="hd-titel mt-4 max-w-[22ch] font-display font-bold">
            {t.social.titel}
          </Titel>
          <Auf delay={0.1}>
            <p className="mt-5 max-w-[56ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              {t.social.vorspann}
            </p>
          </Auf>
          <Auf delay={0.16}>
            {/* Der Einordnungssatz steht VOR den Konten, nicht danach. Ohne
                ihn liest ein Betrieb hier eine Leistung, die er nicht
                bestellen will. */}
            <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.55] text-[color:var(--hd-ink-soft)] opacity-80">
              {t.social.einordnung}
            </p>
          </Auf>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {t.social.konten.map((k, i) => (
              <Auf key={k.handle} delay={i * 0.08}>
                <article className="hd-kasten h-full px-6 py-6">
                  <div className="rounded-xl p-1.5" style={{ background: 'var(--hd-line)' }}>
                    <SocialBild name={k.bild} alt={k.alt} breite={1125} hoehe={689} />
                  </div>
                  <p className="hd-num mt-5">{k.netz}</p>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-[-0.015em]">
                    {k.name}{' '}
                    <span className="font-normal text-[color:var(--hd-ink-soft)]">{k.handle}</span>
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[1.45] text-[color:var(--hd-ink-soft)]">
                    {k.art}
                  </p>
                  <div className="mt-6">
                    <Zahlenliste zahlen={k.zahlen} spalten="grid-cols-3" />
                  </div>
                </article>
              </Auf>
            ))}
          </div>

          {/* Die Belege. Sie tragen die eigentliche Aussage: nicht das Konto
              ist gross, sondern einzelne Beitraege gehen weit ueber es
              hinaus. Deshalb stehen sie unter den Konten und nicht darin. */}
          <div className="mt-16 flex flex-col gap-12">
            {t.social.belege.map((b, i) => (
              <Auf key={b.titel} delay={i * 0.06}>
                <div className="grid items-start gap-8 md:grid-cols-[minmax(0,280px)_1fr] md:gap-12">
                  <div className="rounded-xl p-1.5" style={{ background: 'var(--hd-line)' }}>
                    <SocialBild
                      name={b.bild}
                      alt={b.alt}
                      breite={820}
                      hoehe={b.bild === 'drh-beitrag' ? 1467 : 933}
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold tracking-[-0.015em] sm:text-[22px]">
                      {b.titel}
                    </h3>
                    <p className="mt-3 max-w-[56ch] text-[17px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
                      {b.text}
                    </p>
                    <div className="mt-7">
                      <Zahlenliste zahlen={b.zahlen} spalten="grid-cols-2 sm:grid-cols-3" />
                    </div>
                  </div>
                </div>
              </Auf>
            ))}
          </div>

          {/* Zweispaltig wie die Belege darueber: die Ueberschrift links, der
              Text rechts. Untereinander stand der Absatzblock mit seinen
              62 Zeichen Zeilenlaenge in einem Kasten von 1100 Pixeln, und die
              rechte Haelfte war leer. */}
          <div className="hd-kasten mt-16 grid gap-8 px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-12">
            <h3 className="max-w-[20ch] font-display text-[1.4rem] font-bold leading-[1.2] tracking-[-0.015em] sm:text-[1.75rem]">
              {t.social.hookTitel}
            </h3>
            <div className="flex flex-col gap-4">
              {t.social.hookAbsaetze.map((a) => (
                <p
                  key={a}
                  className="max-w-[62ch] text-[17px] leading-[1.62] text-[color:var(--hd-ink-soft)]"
                >
                  {a}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Ablauf ──────────────────────────────────────────────────────── */}
      <section id="ablauf" className="hd-rule hd-glanz" style={{ background: 'var(--hd-paper-2)' }}>
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <Auf>
            <span className="hd-label">{t.ablauf.label}</span>
          </Auf>
          <Titel className="hd-titel mt-4 max-w-[18ch] font-display font-bold">
            {t.ablauf.titel}
          </Titel>

          <div ref={ablauf}>
            <div aria-hidden className="mt-12 h-px w-full" style={{ background: 'var(--hd-line)' }}>
              <motion.div
                className="h-full origin-left"
                style={{ scaleX: reduce ? 1 : linie, background: 'var(--hd-accent)' }}
              />
            </div>
            <ol className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {t.ablauf.schritte.map((s, i) => (
              <Auf key={s.n} delay={i * 0.09}>
                {/* Die Ziffer sitzt in der Fassung und nicht darüber: vier
                    Textblöcke mit einer Haarlinie darüber lasen sich auf
                    Schwarz als vier Absätze, nicht als vier Schritte. */}
                <li className="hd-kasten h-full px-6 py-6">
                  <span className="hd-num">{s.n}</span>
                  <h3 className="mt-3 font-display text-lg font-bold tracking-[-0.015em]">{s.t}</h3>
                  <p className="mt-2 text-[16px] leading-[1.55] text-[color:var(--hd-ink-soft)]">
                    {s.b}
                  </p>
                </li>
              </Auf>
            ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Zahlen ──────────────────────────────────────────────────────── */}
      <section className="hd-rule">
        {/* Drei Angaben, drei Spalten. Die vierte war "3 Sprachen: Deutsch,
            Englisch, Spanisch" — die sagt die Seite jetzt selbst, indem sie in
            der Sprache des Browsers dasteht. */}
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-16 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {t.fakten.map((f, i) => (
            <Auf key={f.v} delay={i * 0.08}>
              <div className="hd-kasten h-full px-7 py-7">
                <div className="font-display text-[2.9rem] font-bold leading-none tabular-nums tracking-tight text-[color:var(--hd-accent)]">
                  <Zahl ziel={f.zahl} suffix={f.suffix} />
                </div>
                <p className="mt-2.5 max-w-[24ch] text-[16px] leading-[1.5] text-[color:var(--hd-ink-soft)]">
                  {f.v}
                </p>
              </div>
            </Auf>
          ))}
        </div>
      </section>

      {/* ── Schluss ─────────────────────────────────────────────────────── */}
      <section className="hd-rule hd-schluss" style={{ background: 'var(--hd-accent-soft)' }}>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
          <Titel className="hd-titel mx-auto max-w-[20ch] font-display font-bold">
            {t.schluss.titel}
          </Titel>
          <Auf delay={0.1}>
            <p className="mx-auto mt-5 max-w-[48ch] text-[18px] leading-[1.6] text-[color:var(--hd-ink-soft)]">
              {t.schluss.text}
            </p>
            <Magnet className="mt-9">
              <Link href={zumFormular} className="hd-cta hd-cta-pulse px-8 py-4 text-[17px]">
                {t.ctaHaupt}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Magnet>
          </Auf>
        </div>
      </section>

      {/* Der Knopf waehrend des Flugs. Fest am Bildschirm, damit
          Weiterscrollen die Bahn nicht verzieht, und ohne Tastaturziel: er
          existiert nur eine halbe Sekunde, und in dieser Zeit gibt es keinen
          zweiten Knopf, der ihn vertreten müsste. */}
      {ruf.flug && (
        <Link
          ref={ruf.flieger}
          href={zumFormular}
          tabIndex={-1}
          aria-hidden
          className="hd-cta hd-cta-pulse fixed z-50 justify-center gap-0 overflow-hidden whitespace-nowrap px-0 text-[17px]"
          style={{
            left: ruf.flug.von.left,
            top: ruf.flug.von.top,
            width: ruf.flug.von.breite,
            height: ruf.flug.von.hoehe,
          }}
        >
          <span
            data-beschriftung
            className="inline-block overflow-hidden whitespace-nowrap"
            style={{ opacity: ruf.flug.ziel === 'kopf' ? 1 : 0 }}
          >
            Projekt anfragen
          </span>
          <ArrowRight className="h-[18px] w-[18px] shrink-0" aria-hidden />
        </Link>
      )}

      {/* ── Fusszeile ───────────────────────────────────────────────────── */}
      <footer className="hd-rule px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <span className="text-[15px] text-[color:var(--hd-ink-soft)]">
            <strong className="font-semibold text-[color:var(--hd-ink)]">Hareb Digital</strong>,{' '}
            {t.fuss.inhaber}
          </span>
          <nav className="flex flex-wrap items-center gap-x-7 gap-y-1 text-[15px] text-[color:var(--hd-ink-soft)] [&_a]:inline-flex [&_a]:min-h-[24px] [&_a]:items-center [&_a:hover]:text-[color:var(--hd-ink)]">
            <a href="mailto:info@hareb.org">info@hareb.org</a>
            <Link href={langPath(lang, '/impressum')}>{t.fuss.impressum}</Link>
            <Link href={langPath(lang, '/datenschutz')}>{t.fuss.datenschutz}</Link>
            <Link href={langPath(lang, '/')}>{t.fuss.portfolio}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
