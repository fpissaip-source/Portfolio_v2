'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

/**
 * A cursor-decode title reveal. A left-to-right scan head sweeps through each
 * word; letters just ahead of it flicker through random glyphs, and each one
 * locks into its real character with a bright spark as the head passes it.
 * The reveal uses the same Space Grotesk glyphs and tracking as the final
 * monitor title, so the handoff remains one continuous piece of typography
 * rather than visibly changing into a second font at the end.
 */

export type NeonLineHandle = {
  /** Word formation: 0 = not started, 1 = fully decoded/locked. */
  setWord: (index: number, p: number) => void
  /** How much space a word past the first takes up in the line: 0 = collapsed
   *  to nothing (the line centers on the words already there), 1 = its full
   *  natural width. Driving each word separately is what lets the line build
   *  up one beat at a time and re-center itself as each word joins. */
  setJoin: (index: number, t: number) => void
  /** 0 = decoded blue glow (default), 1 = solid site-title purple ink, same
   *  glyphs/position throughout — a same-glyph crossfade, never a blur. */
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
  const joinRef = useRef<number[]>(words.map((_, i) => (i === 0 ? 1 : 0)))
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

  const applyJoin = useCallback(
    (wi: number) => {
      if (wi === 0) return
      const el = wordRefs.current[wi]
      if (!el) return
      const t = clamp01(joinRef.current[wi] ?? 0)
      // The leading gap has to open in lockstep with the width — a flex
      // `gap` would otherwise still reserve its full space next to a
      // zero-width word, leaving the line sitting off-center by half that
      // gap instead of dead-center while the word is still collapsed.
      const fontSize = parseFloat(window.getComputedStyle(el).fontSize) || 0
      el.style.marginLeft = `${gapEm * fontSize * t}px`
      el.style.width = `${naturalWidths.current[wi] * t}px`
      el.style.opacity = String(t)
      // Clipping is what makes the word arrive as a wipe rather than a
      // stretch — but a clip box also cuts the letters' glow into a hard
      // rectangle, which is glaring once the word is standing still. So it
      // is only on while the word is actually moving.
      el.style.overflow = t >= 1 ? 'visible' : 'hidden'
    },
    [gapEm],
  )

  const applyAllJoins = useCallback(() => {
    words.forEach((_, wi) => applyJoin(wi))
  }, [words, applyJoin])

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
      setJoin: (i, t) => {
        joinRef.current[i] = clamp01(t)
        applyJoin(i)
      },
      setSolidify: (t) => {
        solidifyRef.current = clamp01(t)
        applySolidify()
      },
    }),
    [applyWord, applyJoin, applySolidify],
  )

  // Measure each secondary word's natural width once, for the solo collapse.
  // Re-measures once the real site font is ready so the collapse/expand target
  // is always based on the same glyph metrics used by the final title.
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
      applyAllJoins()
    }
    measure()
    let alive = true
    document.fonts?.ready?.then(() => {
      if (alive) measure()
    })
    window.addEventListener('resize', measure)
    return () => {
      alive = false
      window.removeEventListener('resize', measure)
    }
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
    <div ref={rootRef} className={`${className ?? ''} select-none`} aria-hidden>
      <div data-neon-text className="flex h-full items-center justify-center">
        {words.map((word, wi) => (
          <span
            key={`${word}-${wi}`}
            ref={(el) => {
              wordRefs.current[wi] = el
            }}
            // shrink-0: these are flex items with an explicit pixel width,
            // and without it the row silently shrinks them to fit instead of
            // overflowing — the text gets clipped and any width the caller
            // measures comes back as "it fits" when it does not.
            className="inline-flex shrink-0 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-poster-face)',
              letterSpacing: '0.05em',
              marginLeft: wi === 0 ? undefined : 0,
            }}
          >
            {word.split('').map((ch, li) => (
              <span key={li} className="relative inline-grid">
                {/* Drei Ebenen pro Buchstabe — Platzhalter, Glitch, Leuchtend
                    — und bis eben jede davon mit einem eigenen Textknoten.
                    Im Dokument stand deshalb IIICCCHHH statt ICH. aria-hidden
                    am Wurzelelement half nicht: das gilt für Screenreader,
                    nicht für Crawler. Alle drei zeichnen den Buchstaben jetzt
                    per ::before aus data-ch. Erzeugter Inhalt wird gerendert
                    und gemessen, gehört aber nicht zum DOM-Text — und da die
                    Überschrift daneben ohnehin als sr-only sauber dasteht,
                    darf diese Ebene aus dem Text vollständig verschwinden. */}
                <span
                  aria-hidden
                  data-ch={ch}
                  className="lit-char pointer-events-none [grid-area:1/1]"
                  style={{ opacity: 0 }}
                />
                <span
                  ref={(el) => {
                    letterRefs.current[wi][li] = {
                      ...letterRefs.current[wi][li],
                      glitch: el,
                    }
                  }}
                  data-ch={ch}
                  className="lit-char [grid-area:1/1]"
                  style={{ opacity: 0 }}
                />
                <span
                  ref={(el) => {
                    letterRefs.current[wi][li] = {
                      ...letterRefs.current[wi][li],
                      solid: el,
                    }
                  }}
                  data-ch={ch}
                  className="lit-char [grid-area:1/1]"
                  style={{
                    opacity: 0,
                    color: 'color-mix(in oklch, var(--purple) 55%, white)',
                    textShadow: '0 0 14px color-mix(in oklch, var(--purple) 85%, transparent)',
                  }}
                />
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  )
})
