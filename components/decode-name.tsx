'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

/**
 * A cursor-decode title reveal — nothing like a hand-drawn outline. A
 * left-to-right "scan head" sweeps through each word; letters just ahead of
 * it flicker through random glyphs (a terminal decoding a signal), and each
 * one locks into its real character with a bright spark the instant the
 * head passes it, settling into a steady glow. Distinctive display font
 * (Space Grotesk, not the site's default), fully driven by an imperative
 * handle so a scroll-scrubbed GSAP timeline can scrub it — including
 * backwards, which un-locks letters back into the scramble.
 */

export type NeonLineHandle = {
  /** Word formation: 0 = not started, 1 = fully decoded/locked. */
  setWord: (index: number, p: number) => void
  /** 1 = first word alone, centered; 0 = whole line assembled + centered. */
  setSolo: (t: number) => void
  /** Dissolve: 0 = fully visible, 1 = gone (opacity + blur). */
  setFade: (t: number) => void
  /** 0 = decoded blue glow (default), 1 = solid site-title purple ink, same
   *  glyphs/position throughout — a same-glyph crossfade for the handoff. */
  setSolidify: (t: number) => void
}

const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/\\<>0123456789'
const randomChar = () => SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0]
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

type LetterEls = { glitch: HTMLSpanElement | null; solid: HTMLSpanElement | null }

export const DecodeName = forwardRef<
  NeonLineHandle,
  { words: string[]; className?: string; gapEm?: number }
>(function DecodeName({ words, className, gapEm = 0.55 }, ref) {
  const rootRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const letterRefs = useRef<LetterEls[][]>(words.map((w) => w.split('').map(() => ({ glitch: null, solid: null }))))
  const naturalWidths = useRef<number[]>(words.map(() => 0))

  const progressRef = useRef<number[]>(words.map(() => 0))
  const soloRef = useRef(1)
  const fadeRef = useRef(0)
  const solidifyRef = useRef(0)

  const applyWord = useCallback((wi: number) => {
    const word = words[wi]
    const N = word.length
    const p = clamp01(progressRef.current[wi] ?? 0)
    const head = p * (N + 1.5) - 1.5
    const s = clamp01(solidifyRef.current)
    for (let li = 0; li < N; li++) {
      const els = letterRefs.current[wi]?.[li]
      if (!els?.glitch || !els.solid) continue
      const dist = head - li
      const locked = dist >= 1
      if (locked) {
        // Settled — steady, with a brief bright spark right as it locks in
        // that decays over the next stretch of head movement.
        const flash = clamp01(1 - (dist - 1) / 0.5)
        els.glitch.textContent = word[li]
        els.glitch.style.opacity = String(1 - s)
        els.glitch.style.color =
          flash > 0.01
            ? `color-mix(in oklch, white ${(flash * 70).toFixed(0)}%, color-mix(in oklch, var(--blue) 55%, white))`
            : 'color-mix(in oklch, var(--blue) 55%, white)'
        els.glitch.style.textShadow = `0 0 ${(6 + flash * 14).toFixed(1)}px color-mix(in oklch, var(--blue) ${(70 + flash * 30).toFixed(0)}%, transparent)`
        els.solid.style.opacity = String(s)
      } else if (dist > -1.4) {
        // In the scramble wave — random glyph, fading in as the head
        // approaches, dim and glitchy.
        const op = clamp01((dist + 1.4) / 1.4)
        els.glitch.style.opacity = String(op * (1 - s))
        els.glitch.style.color = 'color-mix(in oklch, var(--blue) 45%, white)'
        els.glitch.style.textShadow = '0 0 4px color-mix(in oklch, var(--blue) 50%, transparent)'
        els.solid.style.opacity = '0'
      } else {
        els.glitch.style.opacity = '0'
        els.solid.style.opacity = '0'
      }
    }
  }, [words])

  const applySolo = useCallback(() => {
    words.forEach((_, wi) => {
      if (wi === 0) return
      const el = wordRefs.current[wi]
      if (!el) return
      const t = 1 - soloRef.current
      el.style.width = `${naturalWidths.current[wi] * t}px`
      el.style.opacity = String(t)
    })
  }, [words])

  const applyFade = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    const t = clamp01(fadeRef.current)
    el.style.opacity = String(1 - t)
    el.style.filter = t > 0.001 ? `blur(${(t * 12).toFixed(2)}px)` : 'none'
  }, [])

  const applySolidify = useCallback(() => {
    words.forEach((_, i) => applyWord(i))
  }, [words, applyWord])

  useImperativeHandle(
    ref,
    () => ({
      setWord: (i, p) => {
        progressRef.current[i] = p
        applyWord(i)
      },
      setSolo: (t) => {
        soloRef.current = clamp01(t)
        applySolo()
      },
      setFade: (t) => {
        fadeRef.current = t
        applyFade()
      },
      setSolidify: (t) => {
        solidifyRef.current = clamp01(t)
        applySolidify()
      },
    }),
    [applyWord, applySolo, applyFade, applySolidify],
  )

  // Measure each secondary word's natural width once, for the solo collapse.
  useEffect(() => {
    const measure = () => {
      wordRefs.current.forEach((el, i) => {
        if (!el || i === 0) return
        const prevWidth = el.style.width
        const prevOpacity = el.style.opacity
        el.style.width = 'auto'
        el.style.opacity = '0'
        naturalWidths.current[i] = el.scrollWidth
        el.style.width = prevWidth
        el.style.opacity = prevOpacity
      })
      applySolo()
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A single shared RAF loop re-rolls the scrambling glyphs — the "signal
  // decoding" feel needs continuous noise, independent of scroll position.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    let last = 0
    const tick = (t: number) => {
      if (t - last > 55) {
        last = t
        words.forEach((word, wi) => {
          const N = word.length
          const p = clamp01(progressRef.current[wi] ?? 0)
          const head = p * (N + 1.5) - 1.5
          for (let li = 0; li < N; li++) {
            const dist = head - li
            if (dist > -1.4 && dist < 1) {
              const el = letterRefs.current[wi]?.[li]?.glitch
              if (el) el.textContent = randomChar()
            }
          }
        })
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [words])

  return (
    <div ref={rootRef} className={className} aria-hidden>
      <div
        data-neon-text
        className="flex h-full items-center justify-center"
        style={{ gap: `${gapEm}em` }}
      >
        {words.map((word, wi) => (
          <span
            key={`${word}-${wi}`}
            ref={(el) => {
              wordRefs.current[wi] = el
            }}
            className="inline-flex overflow-hidden whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-space-grotesk)',
              letterSpacing: '0.01em',
            }}
          >
            {word.split('').map((ch, li) => (
              <span key={li} className="relative inline-grid">
                <span
                  aria-hidden
                  className="pointer-events-none [grid-area:1/1]"
                  style={{ opacity: 0 }}
                >
                  {ch}
                </span>
                <span
                  ref={(el) => {
                    letterRefs.current[wi][li] = {
                      ...letterRefs.current[wi][li],
                      glitch: el,
                    }
                  }}
                  className="[grid-area:1/1]"
                  style={{ opacity: 0 }}
                >
                  {ch}
                </span>
                <span
                  ref={(el) => {
                    letterRefs.current[wi][li] = {
                      ...letterRefs.current[wi][li],
                      solid: el,
                    }
                  }}
                  className="[grid-area:1/1]"
                  style={{
                    opacity: 0,
                    color: 'color-mix(in oklch, var(--purple) 55%, white)',
                    textShadow: '0 0 14px color-mix(in oklch, var(--purple) 85%, transparent)',
                  }}
                >
                  {ch}
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
})
