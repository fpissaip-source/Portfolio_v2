'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // This site opens with a long (~600vh) cinematic scroll intro that's
    // meant to play from the start every time. Left to the browser's
    // default scroll restoration, a plain reload — or Safari restoring a
    // page from its back-forward cache — resumes at whatever scroll
    // position was last recorded, and ScrollTrigger immediately computes
    // its progress from that position, dropping the video mid-flight
    // instead of at frame 0.
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    // Respect reduced motion
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

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

    // Children (CinematicIntro, Hero, Lukas, ...) mount their own
    // ScrollTrigger.create() calls in their own effects, which — since
    // this component wraps them — run BEFORE this one and so can compute
    // their first progress reading from the stale restored position, prior
    // to the reset above. One global refresh here, after that reset has
    // landed, makes every trigger on the page recompute cleanly against
    // scroll position 0.
    requestAnimationFrame(() => ScrollTrigger.refresh())

    // A bfcache restore resumes the whole page exactly as it was frozen —
    // no component effects re-run, so this listener (registered once here
    // and still alive across the freeze/thaw, since the JS environment is
    // suspended rather than destroyed) is the only hook that still fires
    // on that specific path. Force the same reset there too.
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      window.scrollTo(0, 0)
      lenis.scrollTo(0, { immediate: true })
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
    window.addEventListener('pageshow', onPageShow)

    return () => {
      window.removeEventListener('pageshow', onPageShow)
      gsap.ticker.remove(raf)
      lenis.destroy()
      ;(window as unknown as { __lenis?: Lenis }).__lenis = undefined
    }
  }, [])

  return <>{children}</>
}
