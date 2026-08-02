'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useT } from './language-context'

gsap.registerPlugin(ScrollTrigger)

/**
 * The sentence the hero no longer has room for, assembled out of the air.
 *
 * Every word starts somewhere else — scattered around the viewer and well
 * in front of the screen — and is carried back into its place in the
 * paragraph as the section is scrolled. By the time the section lets go,
 * the words have settled into an ordinary, perfectly legible paragraph.
 *
 * Two things make that safe rather than clever:
 *
 * The paragraph is real text in normal flow. Only `transform`, `opacity`
 * and `filter` are animated, never layout — so the resting state is
 * whatever the browser would have laid out anyway, at any width, in either
 * language, and a crawler or a screen reader reading the DOM gets the
 * sentence in one piece with no idea any of this happened.
 *
 * The scatter is generated on the client, after mount. Random offsets
 * produced during render would differ between the server's HTML and the
 * browser's first paint — a hydration mismatch — and doing it in an effect
 * also means the no-JS and reduced-motion states are simply the finished
 * paragraph.
 */

/** How far a word can start from its place, as a share of the viewport. */
const SPREAD_X = 0.42
const SPREAD_Y = 0.3
/** Depth range toward the viewer. Large on purpose: this is the part that
 *  reads as "flying past you" rather than "sliding in". */
const DEPTH_MIN = 420
const DEPTH_MAX = 1400

/** Deterministic pseudo-random in [0, 1) — same word, same seat, every
 *  time, including between two renders of the same page. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export function Statement() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const paraRef = useRef<HTMLParagraphElement>(null)
  const [reduced, setReduced] = useState(false)
  const words = t.statement.text.split(' ')

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const para = paraRef.current
    if (!section || !para || reduced) return

    const items = Array.from(para.querySelectorAll<HTMLElement>('[data-word]'))
    if (!items.length) return

    // Each word gets a seat in space and its own slice of the scroll, so
    // they arrive over a stretch rather than snapping into place together.
    const plan = items.map((el, i) => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      return {
        el,
        dx: (rand(i + 1) - 0.5) * 2 * SPREAD_X * vw,
        dy: (rand(i + 7.3) - 0.5) * 2 * SPREAD_Y * vh,
        dz: DEPTH_MIN + rand(i + 13.7) * (DEPTH_MAX - DEPTH_MIN),
        rot: (rand(i + 21.1) - 0.5) * 34,
        // Words land roughly in reading order, but not exactly — a strict
        // left-to-right arrival looks like a typewriter, not like a swarm
        // settling.
        start: (i / items.length) * 0.55 + rand(i + 31.3) * 0.12,
      }
    })

    const apply = (p: number) => {
      for (const w of plan) {
        const e = Math.max(0, Math.min(1, (p - w.start) / 0.34))
        // easeOutCubic: fast approach, soft landing.
        const k = 1 - Math.pow(1 - e, 3)
        const away = 1 - k
        w.el.style.transform = `translate3d(${(w.dx * away).toFixed(1)}px, ${(w.dy * away).toFixed(1)}px, ${(w.dz * away).toFixed(1)}px) rotate(${(w.rot * away).toFixed(2)}deg)`
        w.el.style.opacity = (0.18 + 0.82 * k).toFixed(3)
        w.el.style.filter = away > 0.01 ? `blur(${(away * 7).toFixed(2)}px)` : 'none'
      }
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(0)
    return () => st.kill()
  }, [reduced, words.length])

  return (
    <section
      ref={sectionRef}
      id="statement"
      className={`relative ${reduced ? '' : 'h-[220vh]'}`}
      aria-label={t.statement.label}
    >
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-6">
        <p
          ref={paraRef}
          // The perspective lives on the paragraph, so every word's depth is
          // measured from the same vanishing point — set per word, they
          // would each have their own and the swarm would read as flat.
          style={{ perspective: '900px', transformStyle: 'preserve-3d' }}
          className="max-w-4xl text-balance text-center font-display font-semibold leading-[1.25] tracking-tight text-foreground/90"
        >
          <span
            className="block"
            style={{ fontSize: 'clamp(1.35rem, 4.4vw, 2.6rem)' }}
          >
            {words.map((word, i) => (
              <span
                key={i}
                data-word
                className="inline-block will-change-transform"
                style={reduced ? undefined : { opacity: 0.18 }}
              >
                {word}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </span>
        </p>
      </div>
    </section>
  )
}
