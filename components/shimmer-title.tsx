'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

export type ShimmerTitleHandle = { setProgress: (p: number) => void }

/**
 * Bold site-typography title with two layered effects:
 *
 * 1. Ambient shimmer sweep — a bright blue/white/purple gradient band drifts
 *    across a vivid blue→purple gradient text (background-clip: text). The
 *    sweep is CSS-driven and independent of scroll.
 *
 * 2. Per-letter glow wave — each letter has a pulsing text-shadow keyed to
 *    `--i` (its index), creating a ripple of energy flowing left → right
 *    across the word.
 *
 * A single progress value 0→1 still drives the write-on/hold/dissolve life
 * cycle via setProgress, so the scroll-scrubbed timeline in cinematic-intro
 * does not need to change:
 *   0 → WRITE_END  : letters rise into place (translateY + blur)
 *   WRITE_END → FADE_START : hold, fully written
 *   FADE_START → 1 : dissolve (fade + soft blur)
 *
 * Letter spans keep `display: inline` (the default) so the parent's
 * background-clip: text gradient spans the full word correctly.
 */
const WRITE_END = 0.6
const FADE_START = 0.78

export const ShimmerTitle = forwardRef<
  ShimmerTitleHandle,
  { text: string; className?: string }
>(function ShimmerTitle({ text, className }, ref) {
  const rootRef = useRef<HTMLSpanElement>(null)

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      const el = rootRef.current
      if (!el) return
      if (p <= 0.001 || p >= 0.999) {
        el.style.opacity = '0'
        return
      }
      const writeT = Math.min(1, p / WRITE_END)
      const fade = p <= FADE_START ? 1 : Math.max(0, 1 - (p - FADE_START) / (1 - FADE_START))
      el.style.opacity = String(Math.min(writeT, fade))
      const blurPx = fade < 1 ? (1 - fade) * 10 : (1 - writeT) * 6
      el.style.filter = blurPx > 0.05 ? `blur(${blurPx}px)` : 'none'
      el.style.transform = `translateY(${(1 - writeT) * 10}px)`
      el.style.letterSpacing = `${(1 - writeT) * 0.15}em`
    },
  }))

  return (
    <span ref={rootRef} className={className} style={{ opacity: 0 }}>
      {/*
       * shimmer-text: background-clip gradient spans all letters at once.
       * aria-label on this span provides the accessible text; the individual
       * shimmer-letter spans are aria-hidden to avoid character-by-character
       * screen reader output.
       */}
      <span className="shimmer-text" aria-label={text}>
        {text.split('').map((ch, i) =>
          ch === ' ' ? (
            // Non-breaking space keeps word gaps; no animation needed.
            <span key={i} aria-hidden className="shimmer-letter-space">
              {'\u00A0'}
            </span>
          ) : (
            <span
              key={i}
              aria-hidden
              className="shimmer-letter"
              style={{ '--i': i } as React.CSSProperties}
            >
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  )
})
