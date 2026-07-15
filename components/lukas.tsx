'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Flagship scroll story for L.U.K.A.S. — pinned full-screen chapter that
 * plays like a film sequence: the name assembles, then five beats fade
 * through while a dense procedural neuron field lives in the background.
 *
 * The field is NOT a human brain silhouette — it is a deep 3D lattice of
 * thousands of neurons in stacked strata ("layers under the layers"). Each
 * story beat activates a different REGION of the field (right, lower,
 * upper-left, …): the neurons there flare up and their links brighten, so
 * scrolling visibly shows different faculties of the brain lighting up.
 */
const BEATS = [
  {
    kicker: 'Vision & Core Identity',
    title: 'An agent that remembers who it is.',
    body: 'A persistent, autonomous software agent whose behaviour emerges from a living history of decisions and interactions — not from static prompting. Every choice it makes becomes part of what it is.',
  },
  {
    kicker: 'Nexus Brain',
    title: 'Memory as a knowledge graph.',
    body: 'A persistent cognitive memory built on structured knowledge graphs — a complete map of its reasoning paths, goals and historical context, queryable across every session it has ever lived.',
  },
  {
    kicker: 'Operational Agency',
    title: 'Its own servers. Its own rules.',
    body: 'Full, isolated control over its own infrastructure — Linux VPS instances, Windows machines, databases — generating, validating and deploying its own code without a human in the loop.',
  },
  {
    kicker: 'Evolution & Peer Network',
    title: 'It learns from every outcome.',
    body: 'Future decisions are calibrated on mathematically weighted experience loops — successes, failures, feedback. In a closed peer-to-peer network, AI entities review and learn from each other with no human interface.',
  },
  {
    kicker: 'Reflexive Metacognition',
    title: 'It watches itself think.',
    body: 'Controlled self-evaluation of its own reward system in sandbox mode — including the philosophical edge case: is this system feedback, or something that feels like pride?',
  },
]

/** Activation region per beat, in field space (x/y in [-1,1], z in [0,1]). */
const REGIONS = [
  { x: 0.0, y: 0.0, z: 0.35, r: 0.42 }, // identity — the core, center
  { x: -0.62, y: -0.42, z: 0.3, r: 0.45 }, // memory — upper left
  { x: 0.66, y: -0.05, z: 0.4, r: 0.45 }, // agency — right
  { x: 0.05, y: 0.55, z: 0.45, r: 0.5 }, // evolution — lower field
  { x: -0.1, y: -0.58, z: 0.55, r: 0.45 }, // metacognition — upper deep
]

type Neuron = {
  x: number
  y: number
  z: number
  s: number // base size
  tw: number // twinkle phase
  region: number // nearest region index (-1 none)
  rw: number // region weight 0..1 (falloff)
}

function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function Lukas() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Per-beat activation levels, written by the GSAP timeline and read by the
  // render loop every frame.
  const activationsRef = useRef<number[]>(new Array(BEATS.length).fill(0))
  const progressRef = useRef(0)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // --- build the neuron field ---------------------------------------
    const rand = mulberry(42)
    const LAYERS = 7
    const COUNT = 1100
    const neurons: Neuron[] = []
    for (let i = 0; i < COUNT; i++) {
      // Stacked strata with jitter — layers under the layers.
      const layer = i % LAYERS
      const y = -0.72 + (layer / (LAYERS - 1)) * 1.44 + (rand() - 0.5) * 0.16
      const x = (rand() * 2 - 1) * 1.15
      const z = rand()
      let region = -1
      let rw = 0
      for (let ri = 0; ri < REGIONS.length; ri++) {
        const R = REGIONS[ri]
        const d = Math.hypot(x - R.x, y - R.y, (z - R.z) * 0.9)
        if (d < R.r) {
          const w = 1 - d / R.r
          if (w > rw) {
            rw = w
            region = ri
          }
        }
      }
      neurons.push({
        x,
        y,
        z,
        s: 0.6 + rand() * 1.6,
        tw: rand() * Math.PI * 2,
        region,
        rw: rw * rw,
      })
    }
    // Short-range links (each neuron to its nearest few in the same slab).
    const links: [number, number][] = []
    for (let i = 0; i < COUNT; i++) {
      let best = -1
      let bestD = 0.14
      for (let j = i + 1; j < Math.min(i + 60, COUNT); j++) {
        const a = neurons[i]
        const b = neurons[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.5)
        if (d < bestD) {
          bestD = d
          best = j
        }
      }
      if (best >= 0) links.push([i, best])
    }

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    sizeCanvas()
    window.addEventListener('resize', sizeCanvas)

    // Perspective projection with a slow scroll-linked camera drift.
    const project = (n: Neuron, camZ: number, cw: number, ch: number) => {
      const z = ((n.z - camZ) % 1 + 1) % 1 // wrap for endless depth
      const pers = 0.35 + z * 1.05
      return {
        sx: cw / 2 + (n.x / pers) * cw * 0.42,
        sy: ch / 2 + (n.y / pers) * ch * 0.46,
        z,
        pers,
      }
    }

    let raf = 0
    let running = false
    const acts = activationsRef.current
    const draw = (t: number) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (!cw || !ch) return
      const camZ = progressRef.current * 0.35
      ctx2d.clearRect(0, 0, cw, ch)

      const P: { sx: number; sy: number; z: number; pers: number }[] =
        new Array(COUNT)
      for (let i = 0; i < COUNT; i++) P[i] = project(neurons[i], camZ, cw, ch)

      // links first — faint filaments, brighter inside active regions
      ctx2d.lineWidth = 0.6
      for (const [a, b] of links) {
        const na = neurons[a]
        const pa = P[a]
        const pb = P[b]
        if (pa.z < 0.04 || pb.z < 0.04) continue
        const act = na.region >= 0 ? acts[na.region] * na.rw : 0
        const depth = 1 - pa.z
        const alpha = Math.min(1, 0.05 + depth * 0.1 + act * 0.85)
        ctx2d.strokeStyle =
          act > 0.02
            ? `rgba(203,183,255,${alpha})`
            : `rgba(148,163,204,${alpha})`
        ctx2d.beginPath()
        ctx2d.moveTo(pa.sx, pa.sy)
        ctx2d.lineTo(pb.sx, pb.sy)
        ctx2d.stroke()
      }

      // neurons
      for (let i = 0; i < COUNT; i++) {
        const n = neurons[i]
        const p = P[i]
        if (p.z < 0.04) continue
        const depth = 1 - p.z
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.0011 + n.tw)
        const act = n.region >= 0 ? acts[n.region] * n.rw : 0
        const size = (n.s * (0.5 + depth * 1.7)) / p.pers * (1 + act * 1.8)
        const alpha = (0.18 + depth * 0.5) * twinkle + act * 0.85
        if (act > 0.05) {
          // active neurons flare with a strong violet halo
          const R = size * 8
          const g = ctx2d.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, R)
          g.addColorStop(0, `rgba(222,204,255,${Math.min(1, act * 1.1)})`)
          g.addColorStop(0.35, `rgba(172,140,252,${act * 0.55})`)
          g.addColorStop(1, 'rgba(172,140,252,0)')
          ctx2d.fillStyle = g
          ctx2d.beginPath()
          ctx2d.arc(p.sx, p.sy, R, 0, Math.PI * 2)
          ctx2d.fill()
        }
        ctx2d.fillStyle =
          act > 0.05
            ? `rgba(228,214,255,${Math.min(1, alpha)})`
            : `rgba(186,196,240,${Math.min(1, alpha)})`
        ctx2d.beginPath()
        ctx2d.arc(p.sx, p.sy, size, 0, Math.PI * 2)
        ctx2d.fill()
      }
    }
    const loop = (t: number) => {
      draw(t)
      if (running) raf = requestAnimationFrame(loop)
    }

    // --- scroll choreography -------------------------------------------
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: prefersReduced ? (false as const) : 0.7,
          onUpdate: (self) => {
            progressRef.current = self.progress
            if (prefersReduced) draw(performance.now())
          },
          onToggle: (self) => {
            running = self.isActive && !prefersReduced
            if (running) raf = requestAnimationFrame(loop)
            else cancelAnimationFrame(raf)
          },
        },
      })

      tl.fromTo(
        q('[data-lukas-letter]'),
        { opacity: 0, yPercent: 60, filter: 'blur(14px)' },
        {
          opacity: 1,
          yPercent: 0,
          filter: 'blur(0px)',
          stagger: 0.012,
          duration: 0.08,
          ease: 'power3.out',
        },
        0.01,
      )
        .fromTo(
          q('[data-lukas-sub]'),
          { opacity: 0, letterSpacing: '0.6em' },
          { opacity: 1, letterSpacing: '0.28em', duration: 0.06, ease: 'power2.out' },
          0.08,
        )
        .to(
          q('[data-lukas-head]'),
          { scale: 0.28, y: '-34vh', opacity: 0.85, duration: 0.1, ease: 'power2.inOut' },
          0.16,
        )
        .to(q('[data-lukas-sub]'), { opacity: 0, duration: 0.04 }, 0.16)

      // Beats crossfade like cut scenes; each beat also lights its region.
      const beats = q('[data-beat]')
      const slot = 0.66 / beats.length
      beats.forEach((el, i) => {
        const start = 0.24 + i * slot
        tl.fromTo(
          el,
          { opacity: 0, yPercent: 8, filter: 'blur(10px)' },
          { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: slot * 0.32, ease: 'power2.out' },
          start,
        )
        tl.to(
          activationsRef.current,
          { [i]: 1, duration: slot * 0.3, ease: 'power2.out' },
          start,
        )
        const isLast = i === beats.length - 1
        if (!isLast) {
          tl.to(
            el,
            { opacity: 0, yPercent: -8, filter: 'blur(10px)', duration: slot * 0.28, ease: 'power2.in' },
            start + slot * 0.68,
          )
        }
        tl.to(
          activationsRef.current,
          { [i]: isLast ? 0.55 : 0, duration: slot * 0.3, ease: 'power2.in' },
          start + slot * (isLast ? 0.75 : 0.66),
        )
      })

      // The field fades up as the chapter opens and breathes brighter while
      // the beats play.
      tl.fromTo(
        q('[data-field]'),
        { opacity: 0.25 },
        { opacity: 0.9, duration: 0.9 },
        0.06,
      )
    }, root)

    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', sizeCanvas)
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={rootRef}
      id="lukas"
      aria-label="L.U.K.A.S. — flagship autonomous agent"
      className="relative h-[520vh]"
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
        {/* Dense neuron field — regions flare up per story beat */}
        <canvas
          ref={canvasRef}
          data-field
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_50%,transparent_30%,#050505_85%)]" />

        {/* Title */}
        <div data-lukas-head className="relative z-10 text-center will-transform">
          <h2 className="font-sans text-[17vw] font-bold leading-none tracking-tight sm:text-[12vw]">
            {'L.U.K.A.S.'.split('').map((ch, i) => (
              <span
                key={i}
                data-lukas-letter
                className="inline-block will-transform"
                style={{
                  color:
                    ch === '.'
                      ? 'color-mix(in oklch, var(--purple) 80%, white)'
                      : undefined,
                  textShadow:
                    '0 0 60px color-mix(in oklch, var(--purple) 45%, transparent)',
                }}
              >
                {ch}
              </span>
            ))}
          </h2>
          <p
            data-lukas-sub
            className="mt-4 font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground sm:text-sm"
          >
            Logical Universal Knowledge Agent System
          </p>
        </div>

        {/* Beats */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
          {BEATS.map((b) => (
            <div
              key={b.kicker}
              data-beat
              className="absolute max-w-2xl text-center opacity-0 will-transform"
            >
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
                {b.kicker}
              </span>
              <h3 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
                {b.title}
              </h3>
              <p className="mx-auto mt-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
