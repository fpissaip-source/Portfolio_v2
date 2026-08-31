'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePerfTier } from './perf-probe'

gsap.registerPlugin(ScrollTrigger)

/**
 * Weiches Scrollen, aber nicht ueberall.
 *
 * Lenis faengt das Scrollen ab und rechnet die Position pro Bild selbst
 * aus. Auf einem Rechner, der seine Bildrate haelt, fuehlt sich das
 * geschmeidiger an als der Browser. Auf einem Geraet, das sie nicht haelt,
 * ist es das Gegenteil: das Scrollen haengt jetzt an derselben Schleife,
 * die schon ueberlastet ist, und jeder verpasste Frame wird zu einem
 * sichtbaren Ruckler. Genau das ist die Beschwerde, mit der diese Aenderung
 * angefangen hat.
 *
 * Zwei Faelle bekommen deshalb das Scrollen des Browsers zurueck:
 *
 *   1. Geraete, die die Sonde (lib/perf-tier.ts) als `low` gemessen hat.
 *   2. Beruehrungsbedienung. Dort ist das Scrollen Sache des
 *      Betriebssystems, laeuft ausserhalb des Haupt-Threads und ist damit
 *      selbst dann fluessig, wenn JavaScript gerade beschaeftigt ist. Es
 *      durch eine JavaScript-Schleife zu ersetzen, kann nur verlieren.
 *
 * ScrollTrigger braucht Lenis nicht: ohne den Proxy hoert es auf die
 * Scroll-Ereignisse des Browsers, so wie es das ohne diese Datei auch
 * taete. Es geht also nur die Glaettung verloren, keine Animation.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const tier = usePerfTier()

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const coarse = window.matchMedia('(pointer: coarse)').matches
    if (tier === 'low' || coarse) return

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !prefersReduced,
      wheelMultiplier: 0.75,
      touchMultiplier: 1.1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    // expose for anchor navigation
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      ;(window as unknown as { __lenis?: Lenis }).__lenis = undefined
    }
  }, [tier])

  return <>{children}</>
}
