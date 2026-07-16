'use client'

import { forwardRef, useImperativeHandle, useRef } from 'react'

export type ShimmerTitleHandle = { setProgress: (p: number) => void }

/**
 * Real bold site-typography title with a slow ambient shimmer sweep along
 * the letters (a `background-clip: text` gradient band, animated via CSS —
 * runs continuously and independently of scroll). A single progress value
 * 0→1 still drives the write-on/hold/dissolve life cycle exactly like the
 * generated GlowTitle it replaces, so the caller's scroll-scrubbed timeline
 * doesn't need to change:
 *   0 → WRITE_END : letters ease/blur into place
 *   WRITE_END → FADE_START : hold, fully written
 *   FADE_START → 1 : dissolve (fade + soft blur)
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
      <span className="shimmer-text">{text}</span>
    </span>
  )
})
