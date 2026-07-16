'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { gsap } from 'gsap'

type Hue = 'purple' | 'blue' | 'mixed'

export type LightningHandle = {
  /** Fire a one-shot bolt — draws in, flickers, decays. Fresh geometry each call. */
  strike: (opts?: {
    originX?: number
    originY?: number
    targetX?: number
    targetY?: number
    intensity?: number
    hue?: Hue
    duration?: number
    /** 'bolt' (default) is the point-to-point circuit streak used by the
     *  preloader/hero/handoff. 'network' is a small pseudo-3D cluster of
     *  glowing nodes connected by edges — used by the cinematic intro so
     *  the recurring sparks read as the same visual language as the
     *  L.U.K.A.S. neuron field they eventually become. */
    style?: 'bolt' | 'network'
    /** 'network' style only — radius of the cluster, in 0..1 canvas units. */
    spread?: number
  }) => void
  /** A single fixed, pre-seeded bolt whose reveal/decay is a pure function of
   *  p (0→1) — no internal timer, so it can be driven by the same scroll
   *  progress as everything else and never drift out of sync. */
  setHandoffProgress: (p: number) => void
}

type Segment = { x1: number; y1: number; x2: number; y2: number; w: number }
type Node = { x: number; y: number; r: number }
type LinearBolt = { kind: 'bolt'; segments: Segment[]; nodes: Node[]; hue: Hue }

type NetNode = { x: number; y: number; z: number; r: number }
type NetEdge = { a: number; b: number }
type NetworkBolt = { kind: 'network'; nodes: NetNode[]; edges: NetEdge[]; hue: Hue }

type Bolt = LinearBolt | NetworkBolt

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
  hue: Hue,
): LinearBolt {
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
  return { kind: 'bolt', segments, nodes, hue }
}

/** A small pseudo-3D cluster: nodes scattered around (cx, cy) each with a
 *  random depth z (0=far, 1=near), connected into a minimum-spanning tree
 *  (plus one extra edge for a circuit-like loop) rather than a single
 *  directional streak — reads as a miniature neuron-field fragment. */
function generateNetwork(
  rand: () => number,
  cx: number,
  cy: number,
  spreadX: number,
  spreadY: number,
  hue: Hue,
): NetworkBolt {
  const count = 6 + Math.floor(rand() * 3)
  const nodes: NetNode[] = []
  for (let i = 0; i < count; i++) {
    const x = cx + (rand() - 0.5) * 2 * spreadX
    const y = cy + (rand() - 0.5) * 2 * spreadY
    const z = rand()
    nodes.push({ x, y, z, r: 1.4 + z * 1.6 })
  }
  const dist = (i: number, j: number) =>
    Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
  const inTree = new Set<number>([0])
  const edges: NetEdge[] = []
  while (inTree.size < nodes.length) {
    let bestA = -1
    let bestB = -1
    let bestD = Infinity
    for (const a of inTree) {
      for (let b = 0; b < nodes.length; b++) {
        if (inTree.has(b)) continue
        const d = dist(a, b)
        if (d < bestD) {
          bestD = d
          bestA = a
          bestB = b
        }
      }
    }
    if (bestB === -1) break
    edges.push({ a: bestA, b: bestB })
    inTree.add(bestB)
  }
  if (nodes.length > 3 && rand() > 0.3) {
    const a = Math.floor(rand() * nodes.length)
    const b = Math.floor(rand() * nodes.length)
    if (a !== b && !edges.some((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a))) {
      edges.push({ a, b })
    }
  }
  return { kind: 'network', nodes, edges, hue }
}

function colorFor(hue: Hue, mix: number) {
  const purple = '167,139,250'
  const blue = '125,165,235'
  if (hue === 'purple') return purple
  if (hue === 'blue') return blue
  return mix > 0.5 ? purple : blue
}

export const LightningFlash = forwardRef<
  LightningHandle,
  { className?: string; blend?: 'screen' | 'multiply' }
>(function LightningFlash({ className, blend = 'screen' }, ref) {
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

      const drawLinear = (bolt: LinearBolt, alpha: number, growT: number, cw: number, ch: number) => {
        const visibleSegCount = Math.max(1, Math.round(bolt.segments.length * growT))
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
      }

      // Depth (z) drives size/brightness only (no hard occlusion, since the
      // 'lighter' composite is additive) — enough to read as pseudo-3D
      // parallax without needing an actual 3D renderer.
      const drawNetwork = (bolt: NetworkBolt, alpha: number, growT: number, cw: number, ch: number) => {
        const visibleEdges = Math.max(0, Math.round(bolt.edges.length * growT))
        for (let i = 0; i < visibleEdges; i++) {
          const e = bolt.edges[i]
          const na = bolt.nodes[e.a]
          const nb = bolt.nodes[e.b]
          const avgZ = (na.z + nb.z) / 2
          const col = colorFor(bolt.hue, avgZ)
          const x1 = na.x * cw
          const y1 = na.y * ch
          const x2 = nb.x * cw
          const y2 = nb.y * ch
          ctx.strokeStyle = `rgba(${col},${(0.12 + avgZ * 0.18) * alpha})`
          ctx.lineWidth = (2 + avgZ * 3) * 1.4
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
          ctx.strokeStyle = `rgba(${col},${(0.45 + avgZ * 0.4) * alpha})`
          ctx.lineWidth = Math.max(0.6, 0.5 + avgZ * 1.3)
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.stroke()
        }
        const visibleNodes = Math.max(1, Math.round(bolt.nodes.length * growT))
        // Painter's algorithm — draw far nodes first so nearer ones overlap.
        const order = bolt.nodes
          .map((_, i) => i)
          .slice(0, visibleNodes)
          .sort((i, j) => bolt.nodes[i].z - bolt.nodes[j].z)
        for (const i of order) {
          const n = bolt.nodes[i]
          const col = colorFor(bolt.hue, n.z)
          const px = n.x * cw
          const py = n.y * ch
          const radius = n.r * (3.2 + n.z * 4.5)
          const g = ctx.createRadialGradient(px, py, 0, px, py, radius)
          g.addColorStop(0, `rgba(${col},${(0.35 + n.z * 0.45) * alpha})`)
          g.addColorStop(1, `rgba(${col},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, radius, 0, Math.PI * 2)
          ctx.fill()
          if (n.z > 0.4) {
            ctx.fillStyle = `rgba(${col},${(0.5 + n.z * 0.4) * alpha})`
            ctx.beginPath()
            ctx.arc(px, py, 1 + n.z * 1.4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      const drawBolt = (bolt: Bolt, alpha: number, growT: number) => {
        const cw = canvas.clientWidth
        const ch = canvas.clientHeight
        const prevOp = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = 'lighter'
        if (bolt.kind === 'network') {
          drawNetwork(bolt, alpha, growT, cw, ch)
        } else {
          drawLinear(bolt, alpha, growT, cw, ch)
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
        let bolt: Bolt
        if (opts.style === 'network') {
          const originX = opts.originX ?? 0.1 + rand() * 0.8
          const originY = opts.originY ?? 0.15 + rand() * 0.7
          const spread = opts.spread ?? 0.07
          bolt = generateNetwork(rand, originX, originY, spread, spread * 1.3, opts.hue ?? 'mixed')
        } else {
          const originX = opts.originX ?? 0.2 + rand() * 0.6
          const originY = opts.originY ?? 0.1 + rand() * 0.2
          const targetX = opts.targetX ?? originX + (rand() - 0.5) * 0.3
          const targetY = opts.targetY ?? originY + 0.35 + rand() * 0.25
          bolt = generateBolt(rand, originX, originY, targetX, targetY, opts.hue ?? 'mixed')
        }
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
        // canvas is a replaced element with an intrinsic size (300x150) —
        // `absolute inset-0` alone does NOT stretch a replaced element to
        // fill its container the way it does a <div>, so an explicit
        // h-full w-full is required or it silently renders tiny and
        // pinned to the top-left, invisible on anything but a lucky
        // aspect ratio.
        className={`h-full w-full ${className ?? ''}`}
        style={{ mixBlendMode: blend }}
      />
    )
  },
)
