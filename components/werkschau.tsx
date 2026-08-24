'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useSnapCarousel } from './snap-carousel'

/**
 * Die Werkschau.
 *
 * Eine waagerechte Schau, in der das Bildschirmfoto die Hauptsache ist und
 * nicht die Karte darum. Das aktive Projekt steht mittig und gross, die
 * Nachbarn ragen links und rechts herein, kleiner und ein Stück
 * zurückgesetzt: damit ist ohne Beschriftung klar, dass man ziehen kann.
 *
 * Die Physik kommt aus useSnapCarousel (21st.dev, @ddoemonn) — Wurf mit
 * Deckel, Federstoss an den Enden, Tastatur, Fokusfalle beim Scrollen. Das
 * Aussehen kommt von hier: die Vorlage setzt eine Karte so breit wie das
 * Fenster und blendet die Nachbarn hinter einer Maske aus, hier ragen sie
 * wirklich herein.
 *
 * Groesse, Deckkraft und Tiefe jeder Karte haengen am gezogenen Wert selbst
 * und nicht an ihrem Index: waehrend des Ziehens waechst die kommende Karte
 * Bild fuer Bild, statt am Ende umzuspringen.
 *
 * Das Hochscrollen im Rahmen: faehrt der Zeiger ueber das aktive Projekt,
 * wandert das Bild langsam nach oben und zeigt die Seite weiter unten. Der
 * Rahmen steht dabei still. Es rechnet den Ueberstand aus den natuerlichen
 * Massen des Bildes und schaltet sich ab, wenn es nichts zu zeigen gibt — ein
 * bildschirmhoher Screenshot in einem 16:10-Rahmen hat keinen Ueberstand, ein
 * ganzseitiger hat mehrere Tausend Pixel. Auf Touchgeraeten passiert nichts
 * davon: dort gibt es kein Schweben, und ein Bild, das beim Wischen losfaehrt,
 * waere ein Fehler.
 */

export type Werk = {
  /** Stabiler Schluessel, auch fuer die Kategorie in der jeweiligen Sprache. */
  id: string
  titel: string
  kategorie: string
  bild: string
  /** Natuerliche Masse des Bildes. Ohne sie kann Next kein Bild ohne Sprung
      ausliefern, und der Ueberstand waere nicht berechenbar. */
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

/* Ein Abstand fuer alle Breiten. Er steht in der Physik und im Kasten, und
   zwei Quellen fuer dieselbe Zahl waeren eine zu viel.

   Klein gehalten, weil er zweimal vom Guckloch abgeht: der Nachbar steht um
   den Abstand weiter aussen und ist zusaetzlich auf 87 Prozent verkleinert,
   seine sichtbare Kante rutscht also noch einmal um sechs Prozent seiner
   Breite nach innen. Mit 24 Pixeln blieb auf dem Telefon nichts uebrig. */
const ABSTAND = 12

function Karte({
  werk,
  index,
  x,
  schritt,
  aktiv,
  nah,
  zeigerFein,
  reduce,
  schmal,
  kartenRef,
}: {
  werk: Werk
  index: number
  x: MotionValue<number>
  schritt: number
  aktiv: boolean
  nah: boolean
  zeigerFein: boolean
  reduce: boolean
  schmal: boolean
  kartenRef?: React.Ref<HTMLLIElement>
}) {
  const rahmen = useRef<HTMLDivElement>(null)
  const bildY = useMotionValue(0)
  const [ueberstand, setUeberstand] = useState(0)

  /* Der Abstand dieser Karte zur Mitte, in Karten gerechnet: 0 mittig, ±1 bei
     den Nachbarn. Die Schrittweite steht in einem Ref, weil sie sich bei jeder
     Groessenaenderung aendert und die Umrechnung sie sonst einfrieren wuerde. */
  const schrittRef = useRef(schritt)
  schrittRef.current = schritt || 1
  const abstand = useTransform(x, (v) => (v + index * schrittRef.current) / schrittRef.current)

  /* Auf schmalen Bildschirmen faellt der Nachbar kaum zurueck. Nicht aus
     Geschmack, sondern aus Arithmetik: seine Verkleinerung zieht seine
     sichtbare Kante nach innen, und bei 390 Pixeln frisst sie genau das
     Guckloch auf, an dem man erkennt, dass hier etwas zu ziehen ist. */
  const klein = schmal ? 0.94 : 0.87
  const scale = useTransform(abstand, [-1, 0, 1], [klein, 1, klein], { clamp: true })
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
      ref={kartenRef}
      className="relative shrink-0"
      style={{ width: 'var(--werk-breite)', scale, opacity, y }}
      role="group"
      aria-roledescription="slide"
      aria-label={werk.titel}
      inert={!aktiv}
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
            sizes="(max-width: 640px) 76vw, (max-width: 1024px) 72vw, 64vw"
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
  const spur = useRef<HTMLUListElement>(null)
  const ersteKarte = useRef<HTMLLIElement>(null)

  const schau = useSnapCarousel({
    count: werke.length,
    slideRef: ersteKarte,
    gap: ABSTAND,
    momentum: 0.16,
    maxFlick: 1,
  })

  const [rand, setRand] = useState(0)
  const [zeigerFein, setZeigerFein] = useState(false)
  const [schmal, setSchmal] = useState(false)
  const [zeigt, setZeigt] = useState(false)
  const zeigerX = useMotionValue(0)
  const zeigerY = useMotionValue(0)

  useEffect(() => {
    const zeiger = window.matchMedia('(hover: hover) and (pointer: fine)')
    const eng = window.matchMedia('(max-width: 639px)')
    const setzen = () => {
      setZeigerFein(zeiger.matches)
      setSchmal(eng.matches)
    }
    setzen()
    zeiger.addEventListener('change', setzen)
    eng.addEventListener('change', setzen)
    return () => {
      zeiger.removeEventListener('change', setzen)
      eng.removeEventListener('change', setzen)
    }
  }, [])

  /* Der Innenabstand zentriert die erste und die letzte Karte im Fenster,
     damit x = 0 wirklich "erste Karte mittig" heisst. */
  useEffect(() => {
    const messen = () => {
      const f = schau.fensterRef.current
      const k = ersteKarte.current
      if (!f || !k) return
      setRand(Math.max(0, (f.clientWidth - k.getBoundingClientRect().width) / 2))
    }
    messen()
    const beobachter = new ResizeObserver(messen)
    if (schau.fensterRef.current) beobachter.observe(schau.fensterRef.current)
    return () => beobachter.disconnect()
  }, [schau.fensterRef, schau.kartenbreite])

  /* Waagerechtes Rad und Trackpad. Senkrechtes Rad bleibt der Seite: wer durch
     die Seite scrollt, will nicht in der Schau haengen bleiben. */
  const radSperre = useRef(0)
  const beiRad = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 14) return
      const jetzt = performance.now()
      if (jetzt < radSperre.current) return
      radSperre.current = jetzt + 420
      if (e.deltaX > 0) schau.weiter()
      else schau.zurueck()
    },
    [schau],
  )

  /* Waehrend des Ziehens steht schon die Karte in der Beschriftung, auf der es
     landen wird. Sonst hinkt der Titel der Bewegung hinterher. */
  const werk = werke[schau.gezeigt]

  return (
    <section aria-label={label} className="relative">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6">
        <span className="hd-label">{label}</span>
        <span className="font-display text-[15px] font-bold tabular-nums tracking-tight">
          {String(schau.gezeigt + 1).padStart(2, '0')}
          <span className="text-[color:var(--hd-ink-soft)]">
            {' '}
            / {String(werke.length).padStart(2, '0')}
          </span>
        </span>
      </div>

      <div
        {...schau.fensterProps}
        ref={schau.fensterRef}
        aria-label={label}
        onWheel={beiRad}
        onPointerMove={(e) => {
          zeigerX.set(e.clientX)
          zeigerY.set(e.clientY)
        }}
        onPointerEnter={() => setZeigt(true)}
        onPointerLeave={() => setZeigt(false)}
        /* Die Kartenbreite je Bildschirm. Auf dem Telefon 80vw und nicht die
           88vw aus dem Entwurf: gemessen bei 390 Pixeln steht die naechste
           Karte bei 88vw plus Abstand exakt hinter der rechten Kante, es ragt
           also nichts herein — und genau daran erkennt man, dass man ziehen
           kann. Auf dem Rechner gut zwei Drittel, damit beide Nachbarn
           sichtbar sind. */
        className={`mt-8 overflow-hidden [--werk-breite:76vw] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--hd-accent)] sm:[--werk-breite:72vw] lg:[--werk-breite:min(64vw,1040px)] ${
          zeigerFein ? 'cursor-none' : ''
        }`}
      >
        <motion.ul
          {...schau.spurProps}
          ref={spur}
          style={{ ...schau.spurProps.style, paddingLeft: rand, paddingRight: rand }}
          className="flex items-center"
        >
          {werke.map((w, i) => (
            <Karte
              key={w.id}
              kartenRef={i === 0 ? ersteKarte : undefined}
              werk={w}
              index={i}
              x={schau.x}
              schritt={schau.schritt}
              aktiv={i === schau.index}
              nah={Math.abs(i - schau.index) <= 1}
              zeigerFein={zeigerFein}
              reduce={reduce}
              schmal={schmal}
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
            onClick={schau.zurueck}
            disabled={schau.index === 0}
            aria-label={vorher}
            className="hd-cta-ghost h-11 w-11 justify-center p-0 disabled:opacity-35"
          >
            <span aria-hidden>&larr;</span>
          </button>
          <button
            type="button"
            onClick={schau.weiter}
            disabled={schau.index === werke.length - 1}
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

      <span aria-live="polite" aria-atomic className="sr-only">
        {schau.index + 1} / {werke.length}: {werke[schau.index]?.titel}
      </span>
    </section>
  )
}
