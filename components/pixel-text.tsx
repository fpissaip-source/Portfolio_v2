'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'

export type PixelTextHandle = { setProgress: (p: number) => void }

type Particle = {
  tx: number
  ty: number
  nx: number
  ox: number
  oy: number
  size: number
  hue: number
  drift: number
}

/**
 * Canvas-based "Thanos snap" pixel text. A single progress value 0→1 drives a
 * three-phase life: assemble from scattered dust (fade-in as pixels), hold
 * fully formed, then disintegrate in a fine left→right wave of drifting pixels
 * — exactly like the Infinity War dusting effect. Scrub-safe: fully derived
 * from `progress`, so scrolling back reverses it.
 */
export const PixelText = forwardRef<
  PixelTextHandle,
  {
    text: string
    /** Font size as a fraction of canvas height. */
    heightFactor?: number
    /** Max letter width as a fraction of canvas width. */
    widthFactor?: number
    className?: string
  }
>(function PixelText(
  { text, heightFactor = 0.78, widthFactor = 0.86, className },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const apiRef = useRef<PixelTextHandle>({ setProgress: () => {} })

  useImperativeHandle(ref, () => ({
    setProgress: (v: number) => apiRef.current.setProgress(v),
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: Particle[] = []
    let progress = 0
    let rafPending = false

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const build = () => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (!cw || !ch) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)

      const off = document.createElement('canvas')
      off.width = cw
      off.height = ch
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return
      octx.textAlign = 'center'
      octx.textBaseline = 'middle'
      const font = (s: number) =>
        (octx.font = `900 ${s}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`)

      let size = Math.round(ch * heightFactor)
      font(size)
      const w = octx.measureText(text).width
      const maxW = cw * widthFactor
      if (w > maxW) {
        size = Math.floor(size * (maxW / w))
        font(size)
      }
      octx.fillStyle = '#fff'
      octx.fillText(text, cw / 2, ch / 2)

      const data = octx.getImageData(0, 0, cw, ch).data
      const gap = cw < 560 ? 5 : 6
      const list: Particle[] = []
      for (let y = 0; y < ch; y += gap) {
        for (let x = 0; x < cw; x += gap) {
          if (data[(y * cw + x) * 4 + 3] > 128) {
            list.push({
              tx: x,
              ty: y,
              nx: x / cw,
              ox: (Math.random() - 0.5) * 260,
              oy: (Math.random() - 0.5) * 260,
              size: gap * (0.5 + Math.random() * 0.45),
              hue: Math.random(),
              drift: 0.6 + Math.random() * 0.8,
            })
          }
        }
      }
      particles = list
      draw()
    }

    const draw = () => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cw, ch)
      const p = progress
      if (p <= 0.001 || p >= 0.999) return

      const A = 0.26 // assemble ends
      const B = 0.6 // hold ends → disintegrate begins
      const spread = 0.55 // width of the left→right dusting wave

      for (let i = 0; i < particles.length; i++) {
        const pt = particles[i]
        let px = pt.tx
        let py = pt.ty
        let alpha = 1
        let grow = 0

        if (p < A) {
          const l = easeOut(p / A)
          px = lerp(pt.tx + pt.ox, pt.tx, l)
          py = lerp(pt.ty + pt.oy, pt.ty, l)
          alpha = l
        } else if (p > B) {
          const d = (p - B) / (1 - B)
          const pd = Math.min(
            Math.max((d - pt.nx * spread) / (1 - spread), 0),
            1,
          )
          const e = pd * pd
          px = pt.tx + e * (34 * pt.drift + pt.ox * 0.35)
          py = pt.ty - e * (70 * pt.drift)
          alpha = 1 - pd
          grow = e * 1.4
        }

        if (alpha <= 0.01) continue
        const r = Math.round(lerp(124, 168, pt.hue))
        const g = Math.round(lerp(152, 90, pt.hue))
        const b = Math.round(lerp(255, 247, pt.hue))
        ctx.globalAlpha = alpha
        ctx.fillStyle = `rgb(${r},${g},${b})`
        const s = pt.size + grow
        ctx.fillRect(px, py, s, s)
      }
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

    build()
    const onResize = () => build()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [text, heightFactor, widthFactor])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        filter:
          'drop-shadow(0 0 40px rgba(139,92,246,0.6)) drop-shadow(0 0 16px rgba(96,165,250,0.45))',
      }}
    />
  )
})
