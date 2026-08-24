'use client'

import { useEffect, useRef } from 'react'

/**
 * ClickSpark, portiert von React Bits (reactbits.dev).
 *
 * Ein Funkenkranz an der Stelle, an der geklickt wurde. Was es mitteilt: der
 * Klick ist angekommen.
 *
 * Zwei Abweichungen von der Vorlage, die erste davon zwingend:
 *
 * 1. Die Vorlage umschliesst ihre Kinder und spannt eine Leinwand in der
 *    Groesse des Elternteils auf. Hier waere das eine Leinwand von rund 27.000
 *    Pixeln Hoehe: die Seite ist so lang. Browser deckeln Leinwaende (Safari
 *    bei 4096 Pixeln je Kante, andere hoeher), darueber liefern sie gar nichts
 *    mehr. Die Leinwand ist deshalb fest am Bildschirm und genau so gross wie
 *    das Fenster, und der Klick wird am Dokument abgehoert.
 *
 * 2. Die Zeichenschleife laeuft nur, solange Funken da sind. Die Vorlage haelt
 *    eine leere Schleife dauerhaft am Laufen, also sechzig Mal je Sekunde ein
 *    Loeschen einer leeren Flaeche, den ganzen Besuch lang.
 *
 * Bei abgeschalteter Bewegung passiert nichts.
 */

type Funke = { x: number; y: number; winkel: number; start: number }

export type ClickSparkProps = {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  easing?: 'linear' | 'ease-in' | 'ease-in-out' | 'ease-out'
  extraScale?: number
}

export function ClickSpark({
  sparkColor = '#fff',
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
  easing = 'ease-out',
  extraScale = 1,
}: ClickSparkProps) {
  const leinwand = useRef<HTMLCanvasElement>(null)
  const funken = useRef<Funke[]>([])
  const bild = useRef<number | null>(null)

  useEffect(() => {
    const el = leinwand.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    const messen = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2)
      el.width = Math.floor(window.innerWidth * d)
      el.height = Math.floor(window.innerHeight * d)
      ctx.setTransform(d, 0, 0, d, 0, 0)
    }
    messen()
    window.addEventListener('resize', messen)

    const kurve = (t: number) => {
      if (easing === 'linear') return t
      if (easing === 'ease-in') return t * t
      if (easing === 'ease-in-out') return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
      return t * (2 - t)
    }

    const zeichnen = (jetzt: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      funken.current = funken.current.filter((f) => {
        const vergangen = jetzt - f.start
        if (vergangen >= duration) return false

        const e = kurve(vergangen / duration)
        const weg = e * sparkRadius * extraScale
        const laenge = sparkSize * (1 - e)

        ctx.strokeStyle = sparkColor
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(f.x + weg * Math.cos(f.winkel), f.y + weg * Math.sin(f.winkel))
        ctx.lineTo(
          f.x + (weg + laenge) * Math.cos(f.winkel),
          f.y + (weg + laenge) * Math.sin(f.winkel),
        )
        ctx.stroke()
        return true
      })

      /* Nur solange es etwas zu zeichnen gibt. Die Vorlage laesst die
         Schleife den ganzen Besuch lang leer weiterlaufen. */
      bild.current = funken.current.length ? requestAnimationFrame(zeichnen) : null
    }

    const beiKlick = (e: MouseEvent) => {
      const jetzt = performance.now()
      for (let i = 0; i < sparkCount; i += 1) {
        funken.current.push({
          x: e.clientX,
          y: e.clientY,
          winkel: (2 * Math.PI * i) / sparkCount,
          start: jetzt,
        })
      }
      if (bild.current === null) bild.current = requestAnimationFrame(zeichnen)
    }

    document.addEventListener('pointerdown', beiKlick)

    return () => {
      document.removeEventListener('pointerdown', beiKlick)
      window.removeEventListener('resize', messen)
      if (bild.current) cancelAnimationFrame(bild.current)
      bild.current = null
      funken.current = []
    }
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale])

  return (
    <canvas
      ref={leinwand}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] h-full w-full select-none"
    />
  )
}
