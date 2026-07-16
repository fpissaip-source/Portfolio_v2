'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from 'gsap'

export type LightningHandle = {
  /** Fire a one-shot bolt — draws in, flickers, decays. Fresh geometry each call. */
  strike: (opts?: {
    originX?: number
    originY?: number
    targetX?: number
    targetY?: number
    intensity?: number
    hue?: 'purple' | 'blue' | 'mixed'
    duration?: number
  }) => void
  /** A single fixed, pre-seeded bolt whose reveal/decay is a pure function of
   *  p (0→1) — no internal timer, so it can be driven by the same scroll
   *  progress as everything else and never drift out of sync. */
  setHandoffProgress: (p: number) => void
}

type Segment = { x1: number; y1: number; x2: number; y2: number; w: number }
type Node = { x: number; y: number; r: number }
type Bolt = { segments: Segment[]; nodes: Node[]; hue: 'purple' | 'blue' | 'mixed' }

const COMPASS = [0, 45, 90, 135, 180, 225, 270, 315]

/** Circuit-like branching, not fractal weather-lightning: directions snap to
 *  a coarse compass with only small perpendicular jitter, and 1-2 joints
 *  spawn a short tapering secondary branch. */
function generateBolt(
  rand: () => number,
  originX: number,
  originY: number,
  targetX: number,
  targetY: number,
  hue: 'purple' | 'blue' | 'mixed',
): Bolt {
  const segments: Segment[] = []
  const nodes: Node[] = []
  const steps = 6 + Math.floor(rand() * 3)
  let x = originX
  let y = originY
  const dx = targetX - originX
  const dy = targetY - originY
  const mainAngle = (Math.atan2(dy, dx) * 180) / Math.PI
  const branchAt = new Set<number>()
  branchAt.add(1 + Math.floor(rand() * (steps - 2)))
  if (steps > 5 && rand() > 0.4) branchAt.add(1 + Math.floor(rand() * (steps - 2)))

  for (let i = 0; i < steps; i++) {
    const t = (i + 1) / steps
    const targetAngle =
      COMPASS.reduce((best, a) => {
        const d = Math.abs(((a - mainAngle + 540) % 360) - 180)
        const bestD = Math.abs(((best - mainAngle + 540) % 360) - 180)
        return d < bestD ? a : best
      }, COMPASS[0]) + (rand() - 0.5) * 18
    const rad = (targetAngle * Math.PI) / 180
    const stepLen = Math.hypot(dx, dy) / steps
    const nx = x + Math.cos(rad) * stepLen
    const ny = y + Math.sin(rad) * stepLen
    // ease toward the true target so it still lands precisely
    const bx = originX + dx * t
    const by = originY + dy * t
    const fx = nx * 0.55 + bx * 0.45
    const fy = ny * 0.55 + by * 0.45
    segments.push({ x1: x, y1: y, x2: fx, y2: fy, w: 1 - t * 0.5 })
    if (branchAt.has(i)) {
      nodes.push({ x: fx, y: fy, r: 2.2 })
      const branchAngle = rad + (rand() > 0.5 ? 1 : -1) * (Math.PI / 2 + (rand() - 0.5) * 0.5)
      let bx2 = fx
      let by2 = fy
      const branchSteps = 2 + Math.floor(rand() * 2)
      for (let j = 0; j < branchSteps; j++) {
        const len = stepLen * 0.6 * (1 - j / branchSteps)
        const nbx = bx2 + Math.cos(branchAngle + (rand() - 0.5) * 0.4) * len
        const nby = by2 + Math.sin(branchAngle + (rand() - 0.5) * 0.4) * len
        segments.push({ x1: bx2, y1: by2, x2: nbx, y2: nby, w: 0.5 * (1 - j / branchSteps) })
        bx2 = nbx
        by2 = nby
      }
    }
    x = fx
    y = fy
  }
  nodes.push({ x: originX, y: originY, r: 2.6 }, { x, y, r: 3 })
  return { segments, nodes, hue }
}

function colorFor(hue: 'purple' | 'blue' | 'mixed', mix: number) {
  const purple = '167,139,250'
  const blue = '125,165,235'
  if (hue === 'purple') return purple
  if (hue === 'blue') return blue
  return mix > 0.5 ? purple : blue
}

export const LightningFlash = forwardRef<LightningHandle, { className?: string }>(
  function LightningFlash({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const apiRef = useRef<LightningHandle>({ strike: () => {}, setHandoffProgress: () => {} })

    useImperativeHandle(ref, () => ({
      strike: (opts) => apiRef.current.strike(opts),
      setHandoffProgress: (p) => apiRef.current.setHandoffProgress(p),
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const size = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
        canvas.width = Math.round(canvas.clientWidth * dpr)
        canvas.height = Math.round(canvas.clientHeight * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      size()
      window.addEventListener('resize', size)

      let seed = 1
      const rand = () => {
        seed = (seed * 16807) % 2147483647
        return seed / 2147483647
      }

      const drawBolt = (bolt: Bolt, alpha: number, growT: number) => {
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        const visibleSegCount = Math.max(1, Math.round(bolt.segments.length * growT))
        const prevOp = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < visibleSegCount; i++) {
          const s = bolt.segments[i]
          const col = colorFor(bolt.hue, (i / bolt.segments.length + 0.3) % 1)
          const x1 = s.x1 * cw
          const y1 = s.y1 * ch
          const x2 = s.x2 * cw
          const y2 = s.y2 * ch
          // wide soft glow pass
          ctx.strokeStyle = `rgba(${col},${0.22 * alpha})`
          ctx.lineWidth = (3 + s.w * 4) * 1.6
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
          // thin bright core
          ctx.strokeStyle = `rgba(${col},${0.85 * alpha})`
          ctx.lineWidth = Math.max(0.8, s.w * 1.6)
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        const nodeCount = Math.max(0, Math.round(bolt.nodes.length * growT))
        for (let i = 0; i < nodeCount; i++) {
          const n = bolt.nodes[i]
          const col = colorFor(bolt.hue, i % 2)
          const px = n.x * cw
          const py = n.y * ch
          const g = ctx.createRadialGradient(px, py, 0, px, py, n.r * 5)
          g.addColorStop(0, `rgba(${col},${0.5 * alpha})`)
          g.addColorStop(1, `rgba(${col},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, n.r * 5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalCompositeOperation = prevOp
      }

      // --- fire-and-forget strikes -----------------------------------
      type ActiveStrike = { bolt: Bolt; growT: number; alpha: number }
      const active: ActiveStrike[] = []
      let raf = 0

      const renderActive = () => {
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        ctx.clearRect(0, 0, cw, ch)
        for (const a of active) drawBolt(a.bolt, a.alpha, a.growT)
        if (active.length > 0) {
          raf = requestAnimationFrame(renderActive)
        } else {
          raf = 0
        }
      }

      const strike: LightningHandle['strike'] = (opts = {}) => {
        if (reduced) return
        const originX = opts.originX ?? 0.2 + rand() * 0.6
        const originY = opts.originY ?? 0.1 + rand() * 0.2
        const targetX = opts.targetX ?? originX + (rand() - 0.5) * 0.3
        const targetY = opts.targetY ?? originY + 0.35 + rand() * 0.25
        const bolt = generateBolt(rand, originX, originY, targetX, targetY, opts.hue ?? 'mixed')
        const entry: ActiveStrike = { bolt, growT: 0, alpha: 0 }
        active.push(entry)
        const duration = (opts.duration ?? 300) / 1000
        const intensity = opts.intensity ?? 1
        const tl = gsap.timeline({
          onComplete: () => {
            const idx = active.indexOf(entry)
            if (idx >= 0) active.splice(idx, 1)
          },
        })
        tl.to(entry, { growT: 1, alpha: intensity, duration: duration * 0.3, ease: 'power4.out' })
          .to(entry, { alpha: intensity * 0.35, duration: duration * 0.12, ease: 'power1.inOut' })
          .to(entry, { alpha: intensity * 0.9, duration: duration * 0.1, ease: 'power1.inOut' })
          .to(entry, { alpha: 0, duration: duration * 0.48, ease: 'power2.in' })
        if (!raf) raf = requestAnimationFrame(renderActive)
      }

      // --- deterministic scroll-scrubbed handoff bolt ------------------
      const handoffBolt = generateBolt(rand, 0.5, 0.15, 0.5, 0.42, 'mixed')
      const setHandoffProgress: LightningHandle['setHandoffProgress'] = (p) => {
        if (reduced) return
        const growT = Math.max(0, Math.min(1, p / 0.5))
        const alpha = p <= 0.5 ? 1 : Math.max(0, 1 - (p - 0.5) / 0.5)
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        ctx.clearRect(0, 0, cw, ch)
        if (p > 0 && p < 1) drawBolt(handoffBolt, alpha, growT)
        for (const a of active) drawBolt(a.bolt, a.alpha, a.growT)
      }

      apiRef.current = { strike, setHandoffProgress }

      return () => {
        window.removeEventListener('resize', size)
        cancelAnimationFrame(raf)
      }
    }, [])

    return (
      <canvas
        ref={canvasRef}
        aria-hidden
        className={className}
        style={{ mixBlendMode: 'screen' }}
      />
    )
  },
)
