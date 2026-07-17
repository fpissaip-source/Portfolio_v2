'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const lenis = new Lenis({
      // Heavier than before on purpose: a longer settle duration plus a
      // reduced wheelMultiplier means even a burst of aggressive scroll
      // input can't out-run the smoothing and skip past content — each
      // wheel tick contributes less raw distance, so the page can only
      // move so fast no matter how hard someone spins the wheel.
      duration: 1.5,
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
  }, [])

  return <>{children}</>
}
