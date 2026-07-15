'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export type GlowTitleHandle = { setProgress: (p: number) => void }

/**
 * Scroll-scrubbed generated light-typography title. The frames are a
 * Higgsfield light-painting sequence on a pure black background; the canvas
 * is blended with `screen`, so only the glowing letters show over the film.
 *
 * A single progress value 0→1 drives its life:
 *   0 → WRITE_END : scrub the write-on frames (letters drawn from light)
 *   WRITE_END → FADE_START : hold the finished title
 *   FADE_START → 1 : dissolve (fade + soft blur)
 */
const WRITE_END = 0.6
const FADE_START = 0.78

export const GlowTitle = forwardRef<
  GlowTitleHandle,
  {
    dir: string
    count: number
    /** Max drawn width as a fraction of the canvas width. */
    widthFactor?: number
    className?: string
  }
>(function GlowTitle({ dir, count, widthFactor = 0.86, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apiRef = useRef<GlowTitleHandle>({ setProgress: () => {} })

  useImperativeHandle(ref, () => ({
    setProgress: (v: number) => apiRef.current.setProgress(v),
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const images: HTMLImageElement[] = new Array(count)
    const loaded = new Array<boolean>(count).fill(false)
    let progress = 0
    let rafPending = false

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const draw = () => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      ctx.clearRect(0, 0, cw, ch)
      const p = progress
      if (p <= 0.001 || p >= 0.999) return

      const writeT = Math.min(1, p / WRITE_END)
      let index = Math.round(writeT * (count - 1))
      // nearest loaded frame
      let lo = index
      let hi = index
      let img: HTMLImageElement | null = null
      while (lo >= 0 || hi < count) {
        if (lo >= 0 && loaded[lo]) {
          img = images[lo]
          break
        }
        if (hi < count && loaded[hi]) {
          img = images[hi]
          break
        }
        lo--
        hi++
      }
      if (!img || !img.naturalWidth) return

      const fade = p <= FADE_START ? 1 : 1 - (p - FADE_START) / (1 - FADE_START)
      // draw contained, centered, capped by widthFactor
      const scale = Math.min(
        (cw * widthFactor) / img.naturalWidth,
        (ch * 0.82) / img.naturalHeight,
      )
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      ctx.globalAlpha = Math.max(0, fade)
      ctx.filter = fade < 1 ? `blur(${(1 - fade) * 10}px)` : 'none'
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
      ctx.filter = 'none'
      ctx.globalAlpha = 1
    }

    apiRef.current.setProgress = (v: number) => {
      progress = v
      if (!rafPending) {
        rafPending = true
        requestAnimationFrame(() => {
          rafPending = false
          draw()
        })
      }
    }

    for (let i = 0; i < count; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        loaded[i] = true
        if (i === 0) size()
      }
      img.src = `${dir}/frame-${String(i + 1).padStart(3, '0')}.jpg`
      images[i] = img
    }
    window.addEventListener('resize', size)
    return () => window.removeEventListener('resize', size)
  }, [dir, count, widthFactor])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ mixBlendMode: 'screen' }}
    />
  )
})
