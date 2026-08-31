'use client'

import { useEffect, useState, type RefObject } from 'react'

/**
 * Ist dieses Element gerade sichtbar, und schaut ueberhaupt jemand hin?
 *
 * Der Grund fuer diese Datei: die schweren Schichten dieser Seite sind
 * WebGL-Leinwaende, und eine WebGL-Leinwand hoert nicht von selbst auf zu
 * rechnen, wenn sie aus dem Bild scrollt. Gemessen am 30.08. lagen auf der
 * Startseite siebzehn Leinwaende, davon sieben mit eigenem WebGL-Zustand,
 * zusammen rund siebenundsiebzig Megabyte Bildspeicher. Die
 * 2D-Hintergruende (scene-backdrop.tsx) hielten ihre Schleife brav an,
 * sobald ihr Abschnitt weg war; die WebGL-Schichten rechneten
 * zwanzigtausend Pixel weiter unten unveraendert weiter.
 *
 * Zwei Bedingungen, nicht eine:
 *
 * 1. `IntersectionObserver` mit grosszuegigem Rand. Der Rand ist Absicht:
 *    genau an der Kante anzuhalten heisst, beim Zurueckscrollen ein
 *    schwarzes Rechteck zu zeigen, bis das erste Bild wieder steht. Eine
 *    halbe Bildschirmhoehe Vorlauf kostet fast nichts und verhindert das.
 *
 * 2. `document.visibilityState`. Ein Browser drosselt rAF in einem
 *    Hintergrund-Reiter zwar, raeumt den GPU-Zustand aber nicht ab, und auf
 *    einem Telefon mit wenig Speicher ist genau das der Unterschied
 *    zwischen "Reiter ist noch da" und "Seite laedt beim Zurueckkommen neu".
 *
 * Rueckgabe ist bewusst `true`, solange nichts gemessen wurde: die erste
 * Darstellung soll vollstaendig sein, nicht leer.
 */
export function useImBild(ref: RefObject<Element | null>, rand = '50%'): boolean {
  const [imBild, setImBild] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let sichtbar = true
    let imVordergrund = document.visibilityState !== 'hidden'
    const melde = () => setImBild(sichtbar && imVordergrund)

    const blick = new IntersectionObserver(
      ([eintrag]) => {
        sichtbar = eintrag.isIntersecting
        melde()
      },
      { rootMargin: `${rand} 0px` },
    )
    blick.observe(el)

    const reiter = () => {
      imVordergrund = document.visibilityState !== 'hidden'
      melde()
    }
    document.addEventListener('visibilitychange', reiter)

    return () => {
      blick.disconnect()
      document.removeEventListener('visibilitychange', reiter)
    }
  }, [ref, rand])

  return imBild
}
