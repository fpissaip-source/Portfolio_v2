'use client'

import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

/**
 * Outline-only neon lettering that assembles itself from "nodes":
 *
 *   1. flashing dots appear scattered along the letter outlines (a dotted
 *      stroke — round caps + tiny dashes — flickering like loose network
 *      nodes),
 *   2. a thin neon line then draws through them (stroke-dash reveal),
 *      connecting the nodes into the actual letterform,
 *   3. a soft blue glow (a wide, blurred copy of the same stroke) settles
 *      in, bleeding both inward and outward across the outline.
 *
 * No fills anywhere — only the outline. Everything is driven imperatively
 * through a handle (no React re-renders per frame) so a scroll-scrubbed
 * GSAP timeline can feed it directly.
 */

export type NeonLineHandle = {
  /** Word formation: 0 = absent, ~0.45 = nodes flickered in, 1 = outline lit. */
  setWord: (index: number, p: number) => void
  /** 1 = first word alone, centered; 0 = whole line assembled + centered. */
  setSolo: (t: number) => void
  /** Dissolve: 0 = fully visible, 1 = gone (opacity + blur). */
  setFade: (t: number) => void
  /** 0 = hollow neon outline (default), 1 = solid filled ink, same glyphs/
   *  position/tracking throughout — no blur, so a handoff to a solid-fill
   *  target can happen without ever looking like "a different font." */
  setSolidify: (t: number) => void
}

type Layout = {
  fs: number
  xs: number[]
  widths: number[]
  lineW: number
  soloShift: number
  w: number
  h: number
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

const FLICKER_CSS = `
@keyframes neonFlick {
  0%, 100% { opacity: 1 }
  7% { opacity: .45 }
  11% { opacity: .95 }
  23% { opacity: .6 }
  29% { opacity: 1 }
  47% { opacity: .78 }
  53% { opacity: 1 }
  71% { opacity: .5 }
  77% { opacity: .92 }
}
.neon-flick { animation: neonFlick 2.8s steps(1, end) infinite; }
@media (prefers-reduced-motion: reduce) { .neon-flick { animation: none; } }
`

export const NeonLine = forwardRef<
  NeonLineHandle,
  { words: string[]; className?: string; gapEm?: number; trackingEm?: number }
>(function NeonLine({ words, className, gapEm = 0.42, trackingEm = 0 }, ref) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(SVGGElement | null)[]>([])
  const progRef = useRef<number[]>(words.map(() => 0))
  const soloRef = useRef(1)
  const fadeRef = useRef(0)
  const solidifyRef = useRef(0)
  const layoutRef = useRef<Layout | null>(null)
  const [layout, setLayout] = useState<Layout | null>(null)

  const applyWord = useCallback((i: number) => {
    const lay = layoutRef.current
    const g = wordRefs.current[i]
    if (!lay || !g) return
    const p = clamp01(progRef.current[i] ?? 0)
    const nodes = clamp01(p / 0.45)
    const draw = clamp01((p - 0.28) / 0.62)
    const lit = clamp01((p - 0.8) / 0.2)
    const s = clamp01(solidifyRef.current)
    const L = lay.fs * 6
    const dots = g.querySelector<SVGTextElement>('[data-dots]')
    const main = g.querySelector<SVGTextElement>('[data-main]')
    const glow = g.querySelector<SVGTextElement>('[data-glow]')
    const solid = g.querySelector<SVGTextElement>('[data-solid]')
    // Nodes flash up first, then recede a little once the line takes over,
    // then fully retire as the word solidifies into solid ink.
    if (dots) dots.style.opacity = String(nodes * (1 - 0.35 * draw) * (1 - s))
    if (main) {
      main.style.strokeDashoffset = String(L * (1 - draw))
      main.style.opacity = String((draw > 0.002 ? 1 : 0) * (1 - s))
    }
    if (glow) {
      glow.style.strokeDashoffset = String(L * (1 - draw))
      glow.style.opacity = String(draw * (0.4 + 0.5 * lit) * (1 - s))
    }
    // Solid fill only ever appears once the word is essentially fully lit
    // (setSolidify is only ever driven once draw/lit have already settled
    // at 1), so it's safe to key its opacity on solidify progress alone.
    if (solid) solid.style.opacity = String(s)
  }, [])

  const applySolo = useCallback(() => {
    const lay = layoutRef.current
    const g = wordRefs.current[0]
    if (!lay || !g) return
    g.style.transform = `translate(${lay.soloShift * soloRef.current}px, 0px)`
  }, [])

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
        progRef.current[i] = p
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

  const measure = useCallback(() => {
    const el = rootRef.current
    if (!el) return
    const cs = window.getComputedStyle(el)
    // The child <svg width="100%" height="100%"> only ever occupies the
    // CONTENT box, not the padding — but both clientWidth/clientHeight and
    // getBoundingClientRect() report the padding-INCLUSIVE box (they only
    // differ from each other by border width, which this element has
    // none of). Sizing/centering the layout against either of those would
    // compute positions for a wider area than the SVG actually draws
    // into, skewing everything off-center whenever this element has
    // horizontal padding — subtract the real padding to get the content
    // box the SVG is actually laid out in.
    const w = el.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0')
    const h = el.clientHeight - parseFloat(cs.paddingTop || '0') - parseFloat(cs.paddingBottom || '0')
    if (w < 10 || h < 10) return
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return
    // Measure at a fixed 100px and scale — keeps the math font-load-proof
    // (document.fonts.ready re-runs this once the real font is in).
    ctx.font = `${cs.fontWeight || '700'} 100px ${cs.fontFamily || 'sans-serif'}`
    // ctx.measureText doesn't account for letter-spacing, so add it back
    // per word (n-1 gaps of trackingEm, at the same 100px reference size).
    const trackingPad = Math.max(0, trackingEm) * 100
    const unit = words.map(
      (word) => Math.max(1, ctx.measureText(word).width) + Math.max(0, word.length - 1) * trackingPad,
    )
    const lineUnit =
      unit.reduce((a, b) => a + b, 0) + gapEm * 100 * (words.length - 1)
    const fs = Math.max(
      12,
      Math.min(h * 0.66, (w * 0.92 * 100) / lineUnit),
    )
    const widths = unit.map((u) => (u * fs) / 100)
    const lineW = (lineUnit * fs) / 100
    let cx = (w - lineW) / 2
    const xs = widths.map((wd) => {
      const x = cx
      cx += wd + gapEm * fs
      return x
    })
    const next: Layout = {
      fs,
      xs,
      widths,
      lineW,
      soloShift: (lineW - widths[0]) / 2,
      w,
      h,
    }
    layoutRef.current = next
    setLayout(next)
  }, [words, gapEm, trackingEm])

  useLayoutEffect(() => {
    measure()
    const el = rootRef.current
    if (!el) return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    let alive = true
    document.fonts?.ready?.then(() => {
      if (alive) measure()
    })
    return () => {
      alive = false
      ro.disconnect()
    }
  }, [measure])

  // Re-apply the imperative state after every declarative re-render —
  // a re-measure swaps the SVG contents and resets all inline styles.
  useLayoutEffect(() => {
    if (!layout) return
    words.forEach((_, i) => applyWord(i))
    applySolo()
    applyFade()
  }, [layout, words, applyWord, applySolo, applyFade])

  const strokeMain = 'color-mix(in oklch, var(--blue) 55%, white)'
  const strokeGlow = 'color-mix(in oklch, var(--blue) 78%, white)'
  const strokeDots = 'color-mix(in oklch, var(--blue) 40%, white)'
  const fillSolid = 'color-mix(in oklch, var(--purple) 55%, white)'

  return (
    <div ref={rootRef} className={className} aria-hidden>
      <style>{FLICKER_CSS}</style>
      {layout && (
        <svg
          width="100%"
          height="100%"
          style={{ overflow: 'visible', display: 'block' }}
        >
          <defs>
            <filter
              id={`ng${uid}`}
              x="-60%"
              y="-60%"
              width="220%"
              height="220%"
            >
              <feGaussianBlur stdDeviation={Math.max(2, layout.fs * 0.05)} />
            </filter>
          </defs>
          <g data-neon-text>
            {words.map((word, i) => {
              const common = {
                x: layout.xs[i],
                y: layout.h / 2,
                fontSize: layout.fs,
                fill: 'none' as const,
                dominantBaseline: 'central' as const,
              }
              const tracking = trackingEm ? `${trackingEm}em` : undefined
              const L = layout.fs * 6
              return (
                <g
                  key={`${word}-${i}`}
                  ref={(el) => {
                    wordRefs.current[i] = el
                  }}
                >
                  {/* wide blurred stroke — glow bleeding inward + outward */}
                  <text
                    {...common}
                    data-glow
                    stroke={strokeGlow}
                    strokeWidth={layout.fs * 0.1}
                    strokeDasharray={`${L} ${L}`}
                    strokeDashoffset={L}
                    opacity={0}
                    filter={`url(#ng${uid})`}
                    style={{ letterSpacing: tracking }}
                  >
                    {word}
                  </text>
                  {/* flashing nodes dotted along the letter outlines */}
                  <g
                    className="neon-flick"
                    style={{ animationDelay: `${(i * 0.9 + 0.3).toFixed(2)}s` }}
                  >
                    <text
                      {...common}
                      data-dots
                      stroke={strokeDots}
                      strokeWidth={layout.fs * 0.052}
                      strokeLinecap="round"
                      strokeDasharray={`0.01 ${(layout.fs * 0.165).toFixed(1)}`}
                      opacity={0}
                      style={{
                        letterSpacing: tracking,
                        filter: `drop-shadow(0 0 ${(layout.fs * 0.045).toFixed(1)}px color-mix(in oklch, var(--blue) 85%, transparent))`,
                      }}
                    >
                      {word}
                    </text>
                  </g>
                  {/* the crisp line that connects the nodes */}
                  <text
                    {...common}
                    data-main
                    stroke={strokeMain}
                    strokeWidth={Math.max(1.4, layout.fs * 0.02)}
                    strokeDasharray={`${L} ${L}`}
                    strokeDashoffset={L}
                    opacity={0}
                    style={{
                      letterSpacing: tracking,
                      filter: `drop-shadow(0 0 ${(layout.fs * 0.03).toFixed(1)}px color-mix(in oklch, var(--blue) 80%, transparent))`,
                    }}
                  >
                    {word}
                  </text>
                  {/* solid filled ink — same glyphs/position/tracking as the
                      layers above, purple to match the site-title target
                      this line eventually hands off to. setSolidify fades
                      this in as the outline fades out: a same-glyph,
                      no-blur crossfade instead of a fade into a visibly
                      different font/color/fill-style. */}
                  <text
                    {...common}
                    data-solid
                    fill={fillSolid}
                    opacity={0}
                    style={{
                      letterSpacing: tracking,
                      filter: `drop-shadow(0 0 ${(layout.fs * 0.12).toFixed(1)}px color-mix(in oklch, var(--purple) 90%, transparent))`,
                    }}
                  >
                    {word}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      )}
    </div>
  )
})
