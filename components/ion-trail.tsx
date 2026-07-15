'use client'

import { useEffect, useRef } from 'react'

/**
 * A glowing blue ion that travels across the viewport as the site scrolls —
 * it swings on a gentle sine path, leaves a fading luminous trail and keeps
 * breathing slightly even when scrolling pauses. Lives behind the content
 * (same sticky-layer trick as EdgeGlow), pointer-events off.
 */
export function IonTrail() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size)

    const trail: { x: number; y: number }[] = []
    const MAX_TRAIL = 34
    let raf = 0
    let running = false

    const head = (t: number) => {
      const rect = wrap.getBoundingClientRect()
      const vh = window.innerHeight
      // progress of the site content through the viewport
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - vh)))
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const wander = Math.sin(t * 0.00035) * 0.04
      const x = cw * (0.5 + 0.4 * Math.sin(p * Math.PI * 2 * 2.2 + t * 0.0001) + wander)
      const y = ch * (0.12 + 0.74 * (0.5 - 0.5 * Math.cos(p * Math.PI * 2 * 1.4)) )
      return { x, y }
    }

    const loop = (t: number) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      ctx.clearRect(0, 0, cw, ch)

      const h = head(t)
      trail.push(h)
      if (trail.length > MAX_TRAIL) trail.shift()

      // trail — fading glow beads along the recent path
      for (let i = 0; i < trail.length; i++) {
        const pt = trail[i]
        const f = (i + 1) / trail.length
        const r = 2 + f * 7
        const g = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 4)
        g.addColorStop(0, `rgba(125,170,240,${0.12 * f})`)
        g.addColorStop(1, 'rgba(125,170,240,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, r * 4, 0, Math.PI * 2)
        ctx.fill()
      }
      // head — soft ion core
      const g = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, 34)
      g.addColorStop(0, 'rgba(214,232,255,0.55)')
      g.addColorStop(0.25, 'rgba(125,170,240,0.28)')
      g.addColorStop(1, 'rgba(125,170,240,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(h.x, h.y, 34, 0, Math.PI * 2)
      ctx.fill()

      if (running) raf = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting
      cancelAnimationFrame(raf)
      if (running) raf = requestAnimationFrame(loop)
    })
    io.observe(wrap)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', size)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="sticky top-0 h-[100svh] w-full"
        style={{
          // Keep the central reading column clean: the trail only glows
          // toward the edges of the viewport, never under centered text.
          WebkitMaskImage:
            'radial-gradient(ellipse 58% 56% at 50% 50%, transparent 34%, black 76%)',
          maskImage:
            'radial-gradient(ellipse 58% 56% at 50% 50%, transparent 34%, black 76%)',
        }}
      />
    </div>
  )
}
