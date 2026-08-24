'use client'

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { animate, useIsomorphicLayoutEffect, useMotionValue, useReducedMotion } from 'motion/react'

/**
 * useSnapCarousel, uebernommen von 21st.dev (@ddoemonn, "Snap Carousel").
 *
 * Nur der kopflose Teil: die Physik, die Tastatur und die Zugangsdaten. Die
 * sichtbare Huelle der Vorlage (Punkte, Rahmen, Schatten, Hell/Dunkel-Klassen)
 * bleibt draussen, die Werkschau bringt ihre eigene mit.
 *
 * Was er besser kann als die Handarbeit davor:
 *
 * - Wurfphysik mit Deckel. Er rechnet aus der Geschwindigkeit den
 *   Landepunkt und begrenzt ihn auf eine Karte je Wurf. Vorher war es ein
 *   fester Faktor ohne Deckel: ein kraeftiger Wurf sprang ueber mehrere
 *   Karten hinweg.
 * - `target` und `shown`. Waehrend des Ziehens steht schon die Karte in der
 *   Beschriftung, auf der es landen wird. Vorher wechselte der Titel erst
 *   beim Loslassen und hinkte der Bewegung hinterher.
 * - Ein Federstoss an den Enden statt eines harten Anschlags.
 * - dragDirectionLock: ein schraeg begonnener Zug nimmt der Seite nicht
 *   mehr das senkrechte Scrollen weg.
 * - onScroll setzt scrollLeft zurueck. Bekommt ein Element in der Spur den
 *   Fokus, scrollt der Browser den Kasten seitlich, und eine Spur, die per
 *   transform steht, verrutscht dabei dauerhaft.
 * - Home und Ende zusaetzlich zu den Pfeiltasten.
 *
 * Eine Aenderung an der Vorlage: sie misst die Kartenbreite am Fenster und
 * setzt damit voraus, dass eine Karte so breit ist wie das Fenster. Hier ist
 * die Karte gut zwei Drittel davon, damit die Nachbarn hereinragen. Deshalb
 * nimmt der Haken jetzt einen Ref auf die erste Karte entgegen und misst die.
 */

const GLEITEN = { type: 'spring', stiffness: 260, damping: 34, mass: 0.8 } as const
const WAND = { type: 'spring', stiffness: 700, damping: 30, mass: 0.5 } as const
const WANDSTOSS = 900

const klemm = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))

type Zugdaten = {
  offset: { x: number; y: number }
  velocity: { x: number; y: number }
}

export type SnapCarouselOptionen = {
  count: number
  /** Ref auf die erste Karte. Fehlt er, wird das Fenster gemessen. */
  slideRef?: RefObject<HTMLElement | null>
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  gap?: number
  momentum?: number
  maxFlick?: number
  disabled?: boolean
}

export function useSnapCarousel({
  count,
  slideRef,
  index: gesteuert,
  defaultIndex = 0,
  onIndexChange,
  gap = 12,
  momentum = 0.14,
  maxFlick = 1,
  disabled = false,
}: SnapCarouselOptionen) {
  const gesamt = Math.max(1, Math.floor(count))

  const [ungesteuert, setUngesteuert] = useState(() => klemm(defaultIndex, 0, gesamt - 1))
  const [kartenbreite, setKartenbreite] = useState(0)
  const [zieht, setZieht] = useState(false)

  const index = klemm(gesteuert ?? ungesteuert, 0, gesamt - 1)
  const [ziel, setZiel] = useState(index)
  const schritt = kartenbreite + gap

  const fensterRef = useRef<HTMLDivElement>(null)
  const lauf = useRef<{ stop: () => void } | null>(null)
  const gewollt = useRef<number | null>(null)
  const letzterSchritt = useRef(0)

  const jetzt = useRef(index)
  jetzt.current = index
  const masse = useRef({ schritt, gesamt, momentum, maxFlick })
  masse.current = { schritt, gesamt, momentum, maxFlick }
  const gewechselt = useRef(onIndexChange)
  gewechselt.current = onIndexChange

  const x = useMotionValue(0)
  const reduce = useReducedMotion()

  const gleiten = useCallback(
    (nach: number, velocity = 0) => {
      gewollt.current = nach
      lauf.current?.stop()
      lauf.current = animate(x, nach, reduce ? { duration: 0 } : { ...GLEITEN, velocity })
    },
    [x, reduce],
  )

  const springeZu = useCallback(
    (naechster: number, velocity = 0) => {
      const m = masse.current
      const nach = klemm(Math.round(naechster), 0, m.gesamt - 1)
      setZiel(nach)
      if (nach !== jetzt.current) {
        jetzt.current = nach
        setUngesteuert(nach)
        gewechselt.current?.(nach)
      }
      gleiten(-nach * m.schritt, velocity)
    },
    [gleiten],
  )

  const abprallen = useCallback(
    (richtung: 1 | -1) => {
      const m = masse.current
      const nach = -jetzt.current * m.schritt
      gewollt.current = nach
      lauf.current?.stop()
      lauf.current = animate(
        x,
        nach,
        reduce ? { duration: 0 } : { ...WAND, velocity: -richtung * WANDSTOSS },
      )
    },
    [x, reduce],
  )

  const gehe = useCallback(
    (richtung: 1 | -1) => {
      const nach = jetzt.current + richtung
      if (nach < 0 || nach > masse.current.gesamt - 1) abprallen(richtung)
      else springeZu(nach)
    },
    [abprallen, springeZu],
  )

  const weiter = useCallback(() => gehe(1), [gehe])
  const zurueck = useCallback(() => gehe(-1), [gehe])

  /* Der Landepunkt aus der Geschwindigkeit, gedeckelt auf maxFlick Karten. */
  const waehlen = useCallback(
    (velocity: number) => {
      const m = masse.current
      if (m.schritt === 0) return jetzt.current
      const bei = -x.get() / m.schritt
      const anker = klemm(Math.round(bei), 0, m.gesamt - 1)
      const geworfen = bei - (velocity * m.momentum) / m.schritt
      return klemm(
        klemm(Math.round(geworfen), anker - m.maxFlick, anker + m.maxFlick),
        0,
        m.gesamt - 1,
      )
    },
    [x],
  )

  useIsomorphicLayoutEffect(() => {
    const el = slideRef?.current ?? fensterRef.current
    if (!el) return
    const beobachter = new ResizeObserver((eintraege) => {
      const breite = eintraege[0]?.contentRect.width ?? 0
      setKartenbreite((alt) => (Math.abs(alt - breite) < 0.5 ? alt : breite))
    })
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [slideRef])

  useIsomorphicLayoutEffect(() => {
    if (schritt === 0) return
    const nach = -index * schritt

    if (letzterSchritt.current !== schritt) {
      letzterSchritt.current = schritt
      gewollt.current = nach
      lauf.current?.stop()
      x.set(nach)
      return
    }
    if (zieht || gewollt.current === nach) return
    gleiten(nach)
  }, [index, schritt, zieht, gleiten, x])

  useEffect(() => () => lauf.current?.stop(), [])

  const beiZugStart = useCallback(() => {
    lauf.current?.stop()
    setZieht(true)
    setZiel(jetzt.current)
  }, [])

  const beiZug = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: Zugdaten) => {
      const nach = waehlen(info.velocity.x)
      setZiel((alt) => (alt === nach ? alt : nach))
    },
    [waehlen],
  )

  const beiZugEnde = useCallback(
    (_e: MouseEvent | TouchEvent | PointerEvent, info: Zugdaten) => {
      setZieht(false)
      springeZu(waehlen(info.velocity.x), info.velocity.x)
    },
    [springeZu, waehlen],
  )

  const beiTaste = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        weiter()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        zurueck()
      } else if (e.key === 'Home') {
        e.preventDefault()
        springeZu(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        springeZu(masse.current.gesamt - 1)
      }
    },
    [springeZu, weiter, zurueck],
  )

  /* Bekommt ein Element in der Spur den Fokus, scrollt der Browser den Kasten
     seitlich. Eine Spur, die per transform steht, verrutscht dabei dauerhaft. */
  const beiScrollen = useCallback((e: React.UIEvent<HTMLElement>) => {
    e.currentTarget.scrollLeft = 0
    e.currentTarget.scrollTop = 0
  }, [])

  return {
    index,
    count: gesamt,
    ziel,
    /** Waehrend des Ziehens die Karte, auf der es landen wird. */
    gezeigt: zieht ? ziel : index,
    zieht,
    kartenbreite,
    schritt,
    x,
    springeZu,
    weiter,
    zurueck,
    fensterRef,
    fensterProps: {
      tabIndex: 0,
      role: 'group' as const,
      'aria-roledescription': 'carousel',
      onKeyDown: beiTaste,
      onScroll: beiScrollen,
    },
    spurProps: {
      drag: (disabled || gesamt < 2 ? false : 'x') as false | 'x',
      dragDirectionLock: true,
      dragMomentum: false,
      dragElastic: 0.14,
      dragConstraints: { left: -(gesamt - 1) * schritt, right: 0 },
      onDragStart: beiZugStart,
      onDrag: beiZug,
      onDragEnd: beiZugEnde,
      style: { x, gap: `${gap}px`, touchAction: 'pan-y' as const },
    },
  }
}
