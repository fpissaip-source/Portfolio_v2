'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'

/**
 * EchoText, portiert von React Bits (reactbits.dev), JavaScript + CSS.
 *
 * Der Text steht mehrfach übereinander: eine scharfe Kopie vorn, dahinter eine
 * Reihe nachziehender Schatten, die beim Laden zusammenlaufen und am Rechner
 * dem Zeiger folgen. Was es mitteilt: die Schlagzeile ist gerade erst zur Ruhe
 * gekommen.
 *
 * Zwei Abweichungen von der Vorlage, beide aus Gründen, die hier schon einmal
 * teuer waren:
 *
 * 1. Die Schatten tragen ihren Text nicht als Textknoten, sondern als
 *    data-text, aus dem CSS ihn per ::before zeichnet. In der Vorlage steht die
 *    Schlagzeile dreizehnmal im Dokument. `aria-hidden` hilft dagegen nicht:
 *    das gilt für Vorleseprogramme, nicht für Crawler. Erzeugter Inhalt wird
 *    gerendert und gemessen, gehört aber nicht zum Dokumenttext.
 *
 * 2. Die Vorlage bringt ihre eigene .css-Datei mit. Hier steht sie in
 *    globals.css, wo alle anderen Klassen der Seite auch stehen.
 *
 * Die Namen der Eigenschaften bleiben englisch wie in der Bibliothek, damit
 * die Dokumentation dort weiter passt.
 */

type Richtung = 'right' | 'left' | 'up' | 'down' | 'diagonal'
type Kurve = 'linear' | 'ease-out' | 'ease-in-out' | 'snappy'
type Modus = 'entrance' | 'pointer' | 'both'

const klemm = (wert: number, min: number, max: number) => Math.min(Math.max(wert, min), max)

const RICHTUNGEN: Record<Richtung, { x: number; y: number }> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  diagonal: { x: 0.72, y: 0.72 },
}

const KURVEN: Record<Kurve, (t: number) => number> = {
  linear: (t) => t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  'ease-in-out': (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  snappy: (t) => 1 - Math.pow(1 - t, 5),
}

export type EchoTextProps = {
  text: string
  echoes?: number
  lag?: number
  offset?: number
  direction?: Richtung
  fade?: number
  blur?: number
  tint?: string | false
  mode?: Modus
  cursorRadius?: number
  duration?: number
  ease?: Kurve
  fontSize?: string | number
  fontWeight?: string | number
  color?: string
  className?: string
  style?: CSSProperties
}

export function EchoText({
  text,
  echoes = 12,
  lag = 0.24,
  offset = 36,
  direction = 'right',
  fade = 0.72,
  blur = 3,
  tint = '#7dd3fc',
  mode = 'both',
  cursorRadius = 320,
  duration = 900,
  ease = 'ease-out',
  fontSize = 'clamp(3rem, 9vw, 7rem)',
  fontWeight = 800,
  color = '#f8fafc',
  className = '',
  style,
}: EchoTextProps) {
  const wurzel = useRef<HTMLSpanElement>(null)
  const kopien = useRef<(HTMLSpanElement | null)[]>([])
  const bild = useRef<number | null>(null)
  const zustand = useRef<{
    zielX: number
    zielY: number
    letztesZielX: number
    letztesZielY: number
    regung: number
    orte: { x: number; y: number }[]
    beginn: number
  } | null>(null)
  const [ruhig, setRuhig] = useState(false)

  const zahl = ruhig ? 0 : klemm(Math.round(echoes), 0, 24)
  const indizes = useMemo(() => Array.from({ length: zahl + 1 }, (_, i) => i), [zahl])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const abfrage = window.matchMedia('(prefers-reduced-motion: reduce)')
    const setzen = () => setRuhig(abfrage.matches)
    setzen()
    abfrage.addEventListener('change', setzen)
    return () => abfrage.removeEventListener('change', setzen)
  }, [])

  useEffect(() => {
    const el = wurzel.current
    if (!el || ruhig) return

    const richtung = RICHTUNGEN[direction] ?? RICHTUNGEN.right
    const weg = klemm(Number(offset) || 0, 0, 120)
    const reichweite = klemm(Number(cursorRadius) || 320, 40, 1200)
    const traegheit = klemm(Number(lag) || 0.16, 0.02, 0.5)
    const schwund = klemm(Number(fade) || 0.64, 0.1, 0.95)
    const unschaerfe = klemm(Number(blur) || 0, 0, 16)
    const dauer = Math.max(0, Number(duration) || 0)
    const kurve = KURVEN[ease] ?? KURVEN['ease-out']
    const mitEinlauf = mode === 'entrance' || mode === 'both'
    const mitZeiger = mode === 'pointer' || mode === 'both'

    zustand.current = {
      zielX: 0,
      zielY: 0,
      letztesZielX: 0,
      letztesZielY: 0,
      regung: mitEinlauf ? 1 : 0,
      orte: Array.from({ length: zahl + 1 }, (_, i) => {
        const anfang = mitEinlauf ? weg * (i + 0.35) : 0
        return { x: richtung.x * anfang, y: richtung.y * anfang }
      }),
      beginn: performance.now(),
    }

    let schwebt = false
    let zeigerAb = () => {}

    if (mitZeiger && window.matchMedia) {
      schwebt = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    }

    const beiBewegung = (e: PointerEvent) => {
      const z = zustand.current
      if (!z) return
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const abstand = Math.hypot(dx, dy)
      const anteil = abstand > 0 ? klemm(abstand / reichweite, 0, 1) : 0
      z.zielX = (abstand > 0 ? dx / abstand : 0) * anteil * weg
      z.zielY = (abstand > 0 ? dy / abstand : 0) * anteil * weg * 0.72
    }

    const beiVerlassen = () => {
      const z = zustand.current
      if (!z) return
      z.zielX = 0
      z.zielY = 0
    }

    if (schwebt) {
      window.addEventListener('pointermove', beiBewegung, { passive: true })
      document.addEventListener('pointerleave', beiVerlassen)
      zeigerAb = () => {
        window.removeEventListener('pointermove', beiBewegung)
        document.removeEventListener('pointerleave', beiVerlassen)
      }
    }

    const schritt = (jetzt: number) => {
      const z = zustand.current
      if (!z) return

      const lauf = mitEinlauf && dauer > 0 ? klemm((jetzt - z.beginn) / dauer, 0, 1) : 1
      const rest = mitEinlauf ? 1 - kurve(lauf) : 0
      const tempo = Math.hypot(z.zielX - z.letztesZielX, z.zielY - z.letztesZielY)
      z.letztesZielX = z.zielX
      z.letztesZielY = z.zielY

      let weiteste = 0

      for (let i = 0; i <= zahl; i += 1) {
        const kopie = kopien.current[i]
        const ort = z.orte[i]
        if (!kopie || !ort) continue

        const anfang = rest * weg * (i + 0.35)
        const sollX = z.zielX + richtung.x * anfang
        const sollY = z.zielY + richtung.y * anfang
        const naehe = klemm(0.34 / (1 + i * traegheit * 4.2), 0.018, 0.36)

        ort.x += (sollX - ort.x) * naehe
        ort.y += (sollY - ort.y) * naehe
        kopie.style.transform = `translate3d(${ort.x.toFixed(3)}px, ${ort.y.toFixed(3)}px, 0)`

        if (i > 0) {
          const vorn = z.orte[0]
          const abstand = vorn ? Math.hypot(ort.x - vorn.x, ort.y - vorn.y) : 0
          weiteste = Math.max(weiteste, abstand)
          const tiefe = zahl ? i / zahl : 0
          kopie.style.filter = unschaerfe > 0 ? `blur(${(unschaerfe * tiefe).toFixed(2)}px)` : 'none'
        }
      }

      const ausSpreizung = weg > 0 ? klemm(weiteste / (weg * 2.25), 0, 1) : 0
      const ausTempo = weg > 0 ? klemm(tempo / (weg * 0.35), 0, 1) : 0
      z.regung += (Math.max(rest, ausSpreizung, ausTempo) - z.regung) * 0.18

      for (let i = 1; i <= zahl; i += 1) {
        const kopie = kopien.current[i]
        if (!kopie) continue
        kopie.style.opacity = String(Math.pow(schwund, i) * z.regung)
      }

      const laeuftNoch =
        z.regung > 0.002 || Math.abs(z.zielX) > 0.01 || Math.abs(z.zielY) > 0.01 || lauf < 1 || schwebt

      bild.current = laeuftNoch ? requestAnimationFrame(schritt) : null
    }

    bild.current = requestAnimationFrame(schritt)

    return () => {
      zeigerAb()
      if (bild.current) cancelAnimationFrame(bild.current)
      bild.current = null
      zustand.current = null
    }
  }, [blur, cursorRadius, direction, duration, ease, zahl, fade, lag, mode, offset, ruhig])

  return (
    <span
      ref={wurzel}
      className={`echo-text ${className}`.trim()}
      style={{ fontSize, fontWeight, color, ...style }}
    >
      {indizes
        .slice(1)
        .reverse()
        .map((i) => (
          <span
            key={`echo-${i}`}
            aria-hidden
            data-text={text}
            className="echo-text__echo"
            ref={(element) => {
              kopien.current[i] = element
            }}
            style={{
              color: tint
                ? `color-mix(in srgb, ${tint} ${Math.min(72, 18 + i * 5)}%, ${color})`
                : color,
              opacity: 0,
            }}
          />
        ))}
      <span
        className="echo-text__echo echo-text__echo--front"
        ref={(element) => {
          kopien.current[0] = element
        }}
      >
        {text}
      </span>
    </span>
  )
}
