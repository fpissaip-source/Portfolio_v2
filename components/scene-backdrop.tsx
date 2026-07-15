'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export type BackdropVariant = 'ions' | 'dust' | 'aurora' | 'rain' | 'orbits'

/**
 * Subtle cinematic background animation for a scene. A sticky full-viewport
 * canvas lives behind the section content and moves with scroll:
 *
 *  - 'ions'   — a few glowing ion trails drifting across the frame
 *  - 'dust'   — slow luminous dust particles with scroll parallax
 *  - 'aurora' — soft blue/purple light fields breathing at the edges
 *  - 'rain'   — sparse vertical light streaks falling like code
 *  - 'orbits' — thin elliptical paths with points of light riding them
 *
 * Deliberately restrained: low alpha, few elements, no attention-grabbing.
 */
export function SceneBackdrop({ variant }: { variant: BackdropVariant }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let running = false
    let progress = 0

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size)

    // deterministic per-variant seeds
    let s =
      variant === 'ions' ? 7 : variant === 'dust' ? 21 : variant === 'rain' ? 33 : variant === 'orbits' ? 44 : 55
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }

    const ions = Array.from({ length: 4 }, () => ({
      y: 0.15 + rand() * 0.7,
      amp: 0.05 + rand() * 0.1,
      f: 0.6 + rand() * 0.9,
      speed: 0.02 + rand() * 0.025,
      hue: rand(),
      phase: rand() * Math.PI * 2,
    }))
    const dust = Array.from({ length: 70 }, () => ({
      x: rand(),
      y: rand(),
      z: 0.3 + rand() * 0.7,
      tw: rand() * Math.PI * 2,
      r: 0.6 + rand() * 1.3,
    }))
    const drops = Array.from({ length: 18 }, () => ({
      x: rand(),
      y: rand(),
      speed: 0.06 + rand() * 0.12,
      len: 0.05 + rand() * 0.1,
      hue: rand(),
    }))
    const orbits = Array.from({ length: 3 }, (_, i) => ({
      cy: 0.25 + i * 0.25,
      rx: 0.3 + rand() * 0.25,
      ry: 0.05 + rand() * 0.05,
      tilt: (rand() - 0.5) * 0.5,
      speed: (0.05 + rand() * 0.06) * (i % 2 ? 1 : -1),
      phase: rand() * Math.PI * 2,
    }))

    const draw = (t: number) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      ctx.clearRect(0, 0, cw, ch)

      if (variant === 'ions') {
        for (const ion of ions) {
          const head = ((t * 0.00003 * ion.f + ion.phase / 8 + progress * 0.25) % 1.3) - 0.15
          const grad = (x: number) =>
            ion.y + Math.sin(x * Math.PI * 2 * ion.f + ion.phase) * ion.amp
          // fading trail
          for (let k = 0; k < 26; k++) {
            const x = head - k * 0.012
            if (x < -0.05 || x > 1.05) continue
            const fade = (1 - k / 26) ** 2
            const px = x * cw
            const py = grad(x) * ch + progress * ch * 0.06
            const rr = (3.2 - k * 0.09) * (0.7 + ion.hue * 0.5)
            const g = ctx.createRadialGradient(px, py, 0, px, py, rr * 4)
            const col = ion.hue > 0.5 ? '167,139,250' : '125,165,235'
            g.addColorStop(0, `rgba(${col},${0.28 * fade})`)
            g.addColorStop(1, `rgba(${col},0)`)
            ctx.fillStyle = g
            ctx.beginPath()
            ctx.arc(px, py, rr * 4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      } else if (variant === 'dust') {
        for (const d of dust) {
          const y = ((d.y + t * 0.0000045 / d.z + 1) % 1)
          const px = d.x * cw + Math.sin(t * 0.0002 + d.tw) * 14 * d.z
          const py = (y - progress * 0.12 * d.z + 1) % 1 * ch
          const a = (0.1 + 0.16 * Math.sin(t * 0.0009 + d.tw) ** 2) * d.z
          ctx.fillStyle = `rgba(190,200,235,${a})`
          ctx.beginPath()
          ctx.arc(px, py, d.r * d.z, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (variant === 'rain') {
        for (const d of drops) {
          const y = (d.y + t * 0.00004 * d.speed * 10 + progress * 0.1) % 1.2 - 0.1
          const px = d.x * cw
          const col = d.hue > 0.5 ? '167,139,250' : '125,165,235'
          const grad = ctx.createLinearGradient(px, y * ch, px, (y + d.len) * ch)
          grad.addColorStop(0, `rgba(${col},0)`)
          grad.addColorStop(0.8, `rgba(${col},0.22)`)
          grad.addColorStop(1, `rgba(${col},0.4)`)
          ctx.strokeStyle = grad
          ctx.lineWidth = 1.1
          ctx.beginPath()
          ctx.moveTo(px, y * ch)
          ctx.lineTo(px, (y + d.len) * ch)
          ctx.stroke()
        }
      } else if (variant === 'orbits') {
        for (const o of orbits) {
          const cx = cw / 2
          const cy = (o.cy + (progress - 0.5) * 0.08) * ch
          // faint elliptical path
          ctx.strokeStyle = 'rgba(160,170,215,0.07)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.ellipse(cx, cy, o.rx * cw, o.ry * ch, o.tilt, 0, Math.PI * 2)
          ctx.stroke()
          // light riding the path
          const a = t * 0.001 * o.speed * 6 + o.phase + progress * 2
          const ex = Math.cos(a) * o.rx * cw
          const ey = Math.sin(a) * o.ry * ch
          const px = cx + ex * Math.cos(o.tilt) - ey * Math.sin(o.tilt)
          const py = cy + ex * Math.sin(o.tilt) + ey * Math.cos(o.tilt)
          const g = ctx.createRadialGradient(px, py, 0, px, py, 26)
          g.addColorStop(0, 'rgba(196,181,253,0.5)')
          g.addColorStop(1, 'rgba(196,181,253,0)')
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, 26, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        // aurora — two soft breathing light fields
        const cx1 = cw * (0.22 + 0.06 * Math.sin(t * 0.00012))
        const cy1 = ch * (0.75 - progress * 0.2)
        const cx2 = cw * (0.8 - 0.05 * Math.sin(t * 0.00009))
        const cy2 = ch * (0.25 + progress * 0.18)
        for (const [cx, cy, col, r] of [
          [cx1, cy1, '109,140,220', ch * 0.55],
          [cx2, cy2, '150,120,230', ch * 0.5],
        ] as const) {
          const breathe = 0.75 + 0.25 * Math.sin(t * 0.00025 + cx)
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * breathe)
          g.addColorStop(0, `rgba(${col},0.10)`)
          g.addColorStop(1, `rgba(${col},0)`)
          ctx.fillStyle = g
          ctx.fillRect(0, 0, cw, ch)
        }
      }
    }

    const loop = (t: number) => {
      draw(t)
      if (running) raf = requestAnimationFrame(loop)
    }

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        progress = self.progress
      },
      onToggle: (self) => {
        running = self.isActive
        if (running) raf = requestAnimationFrame(loop)
        else cancelAnimationFrame(raf)
      },
    })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      st.kill()
    }
  }, [variant])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        className="sticky top-0 h-[100svh] w-full"
        style={{
          // Same treatment as the ion trail: backdrops live at the frame
          // edges and stay out of the central reading column.
          WebkitMaskImage:
            'radial-gradient(ellipse 62% 60% at 50% 50%, transparent 28%, black 74%)',
          maskImage:
            'radial-gradient(ellipse 62% 60% at 50% 50%, transparent 28%, black 74%)',
        }}
      />
    </div>
  )
}
