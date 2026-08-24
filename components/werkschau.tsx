'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react'

/**
 * Die Werkschau.
 *
 * Eine waagerechte Schau, in der das Bildschirmfoto die Hauptsache ist und
 * nicht die Karte darum. Das aktive Projekt steht mittig und gross, die
 * Nachbarn ragen links und rechts herein, kleiner und ein Stück
 * zurückgesetzt: damit ist ohne Beschriftung klar, dass man ziehen kann.
 *
 * Warum ohne Bibliothek. Embla und Swiper bringen ihre eigene Physik mit, und
 * beide gehen davon aus, dass alle Karten gleich aussehen. Hier haengen
 * Groesse, Deckkraft und Tiefe jeder Karte am gezogenen Wert selbst, Bild fuer
 * Bild. Das sind vierzig Zeilen ueber einem Motion-Wert und keine
 * Abhaengigkeit, die man dafuer verbiegen muss.
 *
 * Das Hochscrollen im Rahmen: faehrt der Zeiger ueber das aktive Projekt,
 * wandert das Bild langsam nach oben und zeigt die Seite weiter unten. Der
 * Rahmen steht dabei still. Es rechnet den Ueberstand aus den natuerlichen
 * Massen des Bildes aus und schaltet sich ab, wenn es nichts zu zeigen gibt —
 * ein bildschirmhoher Screenshot in einem 16:10-Rahmen hat keinen Ueberstand,
 * ein ganzseitiger hat mehrere Tausend Pixel. Auf Touchgeraeten passiert
 * nichts davon: dort gibt es kein Schweben, und ein Bild, das beim Wischen
 * losfaehrt, waere ein Fehler.
 */

export type Werk = {
  /** Stabiler Schluessel, auch fuer die Kategorie in der jeweiligen Sprache. */
  id: string
  titel: string
  kategorie: string
  bild: string
  /** Natuerliche Masse des Bildes. Ohne sie kann Next kein Bild ohne
      Sprung ausliefern, und der Ueberstand waere nicht berechenbar. */
  breite: number
  hoehe: number
  url?: string | null
}

type Props = {
  werke: Werk[]
  label: string
  ansehen: string
  ziehen: string
  vorher: string
  weiter: string
}

/* Das Fenster, in dem ein Bildschirmfoto sitzt. 16:10 wie ein Browserfenster,
   nicht wie ein Kinoformat: es soll nach Website aussehen. */
const FENSTER = '16 / 10'

const FEDER = { type: 'spring' as const, stiffness: 210, damping: 34, mass: 0.9 }

function Karte({
  werk,
  index,
  x,
  schritt,
  aktiv,
  nah,
  zeigerFein,
  reduce,
}: {
  werk: Werk
  index: number
  x: MotionValue<number>
  schritt: number
  aktiv: boolean
  nah: boolean
  zeigerFein: boolean
  reduce: boolean
}) {
  const rahmen = useRef<HTMLDivElement>(null)
  const bildY = useMotionValue(0)
  const [ueberstand, setUeberstand] = useState(0)

  /* Der Abstand dieser Karte zur Mitte, in Karten gerechnet: 0 mittig, ±1 bei
     den Nachbarn. Die Schrittweite steht in einem Ref, weil sie sich bei jeder
     Groessenaenderung aendert und die Umrechnung sie sonst einmalig
     einfrieren wuerde. */
  const schrittRef = useRef(schritt)
  schrittRef.current = schritt || 1
  const abstand = useTransform(x, (v) => (v + index * schrittRef.current) / schrittRef.current)

  const scale = useTransform(abstand, [-1, 0, 1], [0.87, 1, 0.87], { clamp: true })
  const opacity = useTransform(abstand, [-1.15, 0, 1.15], [0.3, 1, 0.3], { clamp: true })
  const y = useTransform(abstand, [-1, 0, 1], [22, 0, 22], { clamp: true })

  const messen = useCallback(() => {
    const el = rahmen.current
    if (!el) return
    const b = el.clientWidth
    const h = el.clientHeight
    if (!b || !h) return
    setUeberstand(Math.max(0, (werk.hoehe / werk.breite) * b - h))
  }, [werk.breite, werk.hoehe])

  useEffect(() => {
    messen()
    const el = rahmen.current
    if (!el) return
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [messen])

  /* Wandert die Karte aus der Mitte, faehrt das Bild zurueck nach oben: sonst
     bliebe eine halb durchgescrollte Seite als Nachbar stehen. */
  useEffect(() => {
    if (!aktiv) animate(bildY, 0, { duration: 0.5, ease: [0.22, 1, 0.36, 1] })
  }, [aktiv, bildY])

  const faehrt = zeigerFein && !reduce && aktiv && ueberstand > 24

  return (
    <motion.li
      className="relative shrink-0"
      style={{ width: 'var(--werk-breite)', scale, opacity, y }}
      aria-hidden={!aktiv}
    >
      <div
        ref={rahmen}
        className="relative overflow-hidden rounded-[14px] bg-[color:var(--hd-paper-2)] ring-1 ring-[color:var(--hd-line)]"
        style={{ aspectRatio: FENSTER }}
        onPointerEnter={() => {
          if (!faehrt) return
          /* Vier bis acht Sekunden, je nach Ueberstand: eine feste Dauer
             liesse eine kurze Seite kriechen und eine lange rasen. */
          const dauer = Math.min(8, Math.max(4, ueberstand / 260))
          animate(bildY, -ueberstand, { duration: dauer, ease: 'linear' })
        }}
        onPointerLeave={() => {
          if (!zeigerFein) return
          animate(bildY, 0, { duration: 1.1, ease: [0.22, 1, 0.36, 1] })
        }}
      >
        <motion.div style={{ y: bildY }} className="will-change-transform">
          <Image
            src={werk.bild}
            alt={werk.titel}
            width={werk.breite}
            height={werk.hoehe}
            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 78vw, 68vw"
            loading={nah ? 'eager' : 'lazy'}
            className="h-auto w-full select-none"
            draggable={false}
          />
        </motion.div>
      </div>
    </motion.li>
  )
}

export function Werkschau({ werke, label, ansehen, ziehen, vorher, weiter }: Props) {
  const reduce = !!useReducedMotion()
  const fenster = useRef<HTMLDivElement>(null)
  const spur = useRef<HTMLUListElement>(null)
  const x = useMotionValue(0)

  const [index, setIndex] = useState(0)
  const [schritt, setSchritt] = useState(0)
  const [rand, setRand] = useState(0)
  const [zeigerFein, setZeigerFein] = useState(false)
  const [zeigt, setZeigt] = useState(false)
  const zeigerX = useMotionValue(0)
  const zeigerY = useMotionValue(0)

  const letzter = werke.length - 1
  const indexRef = useRef(index)
  indexRef.current = index

  useEffect(() => {
    const m = window.matchMedia('(hover: hover) and (pointer: fine)')
    const setzen = () => setZeigerFein(m.matches)
    setzen()
    m.addEventListener('change', setzen)
    return () => m.removeEventListener('change', setzen)
  }, [])

  /* Die Schrittweite ist die Kartenbreite plus Abstand, gemessen statt
     gerechnet: beides steht in CSS und haengt an der Bildschirmbreite. */
  useEffect(() => {
    const el = spur.current
    if (!el) return
    const messen = () => {
      const erste = el.children[0] as HTMLElement | undefined
      const zweite = el.children[1] as HTMLElement | undefined
      if (!erste) return
      const s = zweite
        ? zweite.getBoundingClientRect().left - erste.getBoundingClientRect().left
        : erste.getBoundingClientRect().width
      setSchritt(s)
      /* Der Innenabstand zentriert die erste und die letzte Karte im Fenster,
         damit x = 0 wirklich "erste Karte mittig" heisst. */
      const f = fenster.current
      if (f) setRand(Math.max(0, (f.clientWidth - erste.getBoundingClientRect().width) / 2))
      x.set(-indexRef.current * s)
    }
    messen()
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    window.addEventListener('resize', messen)
    return () => {
      beobachter.disconnect()
      window.removeEventListener('resize', messen)
    }
  }, [x, werke.length])

  const zu = useCallback(
    (ziel: number) => {
      const i = Math.max(0, Math.min(letzter, ziel))
      setIndex(i)
      if (!schritt) return
      if (reduce) x.set(-i * schritt)
      else animate(x, -i * schritt, FEDER)
    },
    [letzter, schritt, reduce, x],
  )

  /* Waagerechtes Rad und Trackpad. Senkrechtes Rad bleibt der Seite: wer
     durch die Seite scrollt, will nicht in der Schau haengen bleiben. */
  const radSperre = useRef(0)
  const beiRad = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 14) return
      const jetzt = performance.now()
      if (jetzt < radSperre.current) return
      radSperre.current = jetzt + 420
      zu(indexRef.current + (e.deltaX > 0 ? 1 : -1))
    },
    [zu],
  )

  const werk = werke[index]

  return (
    <section aria-roledescription="carousel" aria-label={label} className="relative">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6">
        <span className="hd-label">{label}</span>
        <span className="font-display text-[15px] font-bold tabular-nums tracking-tight">
          {String(index + 1).padStart(2, '0')}
          <span className="text-[color:var(--hd-ink-soft)]">
            {' '}
            / {String(werke.length).padStart(2, '0')}
          </span>
        </span>
      </div>

      <div
        ref={fenster}
        tabIndex={0}
        role="group"
        aria-label={label}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            zu(index + 1)
          }
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            zu(index - 1)
          }
        }}
        onWheel={beiRad}
        onPointerMove={(e) => {
          zeigerX.set(e.clientX)
          zeigerY.set(e.clientY)
        }}
        onPointerEnter={() => setZeigt(true)}
        onPointerLeave={() => setZeigt(false)}
        /* Die Kartenbreite je Bildschirm: auf dem Telefon fast die ganze
           Breite mit einem Streifen der naechsten Karte, auf dem Rechner gut
           zwei Drittel, damit beide Nachbarn hereinragen. */
        className={`mt-8 overflow-hidden [--werk-breite:88vw] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--hd-accent)] sm:[--werk-breite:78vw] lg:[--werk-breite:min(68vw,1100px)] ${
          zeigerFein ? 'cursor-none' : ''
        }`}

      >
        <motion.ul
          ref={spur}
          drag="x"
          dragElastic={0.08}
          dragMomentum={false}
          style={{ x, paddingLeft: rand, paddingRight: rand }}
          onDragEnd={(_, info) => {
            if (!schritt) return
            const roh = (-x.get() - info.velocity.x * 0.12) / schritt
            zu(Math.round(roh))
          }}
          className="flex touch-pan-y items-center gap-5 sm:gap-7"
        >
          {werke.map((w, i) => (
            <Karte
              key={w.id}
              werk={w}
              index={i}
              x={x}
              schritt={schritt}
              aktiv={i === index}
              nah={Math.abs(i - index) <= 1}
              zeigerFein={zeigerFein}
              reduce={reduce}
            />
          ))}
        </motion.ul>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-[1.9rem] font-bold leading-[1.05] tracking-[-0.025em] sm:text-[2.6rem]">
            {werk?.titel}
          </h3>
          <p className="mt-2 text-[15px] tracking-[0.01em] text-[color:var(--hd-ink-soft)]">
            {werk?.kategorie}
          </p>
          {werk?.url && (
            <a
              href={werk.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex min-h-[24px] items-center gap-1.5 text-[16px] font-medium text-[color:var(--hd-accent)] hover:underline"
            >
              {ansehen}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => zu(index - 1)}
            disabled={index === 0}
            aria-label={vorher}
            className="hd-cta-ghost h-11 w-11 justify-center p-0 disabled:opacity-35"
          >
            <span aria-hidden>&larr;</span>
          </button>
          <button
            type="button"
            onClick={() => zu(index + 1)}
            disabled={index === letzter}
            aria-label={weiter}
            className="hd-cta-ghost h-11 w-11 justify-center p-0 disabled:opacity-35"
          >
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Der eigene Zeiger. Nur bei feinem Zeiger, und nur solange er im
          Fenster steht. */}
      {zeigerFein && (
        <motion.div
          aria-hidden
          style={{ x: zeigerX, y: zeigerY, opacity: zeigt ? 1 : 0 }}
          className="pointer-events-none fixed left-0 top-0 z-50 -ml-8 -mt-8 flex h-16 w-16 items-center justify-center rounded-full bg-[color:var(--hd-ink)] font-label text-[11px] uppercase tracking-[0.14em] text-[color:var(--hd-paper)] transition-opacity duration-200"
        >
          {ziehen}
        </motion.div>
      )}
    </section>
  )
}
