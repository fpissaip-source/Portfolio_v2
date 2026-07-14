'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Flagship scroll story for L.U.K.A.S. — pinned full-screen chapter that
 * plays like a film sequence: the name assembles, then four beats fade
 * through while a knowledge-graph constellation breathes in the background.
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

/** Deterministic pseudo-random constellation for the Nexus Brain backdrop. */
const NODES = Array.from({ length: 26 }, (_, i) => {
  const a = (i * 137.508 * Math.PI) / 180
  const r = 8 + ((i * railed(i)) % 34)
  return {
    x: 50 + Math.cos(a) * r,
    y: 50 + Math.sin(a) * r * 0.72,
    s: 1.2 + ((i * 7) % 5) * 0.5,
  }
})
function railed(i: number) {
  return ((i * 2654435761) % 97) / 97 + 0.6
}
const EDGES = NODES.map((_, i) => [i, (i * 5 + 7) % NODES.length]).filter(
  ([a, b]) => a !== b,
)

export function Lukas() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: prefersReduced ? (false as const) : 0.7,
        },
      })

      // Title assembles from letters, holds, then compresses to the corner
      // as the beats take over.
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

      // Beats crossfade like cut scenes.
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
        if (i < beats.length - 1) {
          tl.to(
            el,
            { opacity: 0, yPercent: -8, filter: 'blur(10px)', duration: slot * 0.28, ease: 'power2.in' },
            start + slot * 0.68,
          )
        }
      })

      // Constellation slowly breathes and drifts the whole way through.
      tl.fromTo(
        q('[data-graph]'),
        { opacity: 0.25, scale: 0.94, rotate: -2 },
        { opacity: 0.75, scale: 1.06, rotate: 3, duration: 0.9 },
        0.06,
      )
      tl.fromTo(
        q('[data-graph-edges]'),
        { strokeDashoffset: 900 },
        { strokeDashoffset: 0, duration: 0.5 },
        0.2,
      )

      tl.fromTo(
        q('[data-lukas-status]'),
        { opacity: 0 },
        { opacity: 1, duration: 0.05 },
        0.24,
      )
    }, root)

    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      id="lukas"
      aria-label="L.U.K.A.S. — flagship autonomous agent"
      className="relative h-[520vh]"
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
        {/* Nexus Brain constellation */}
        <svg
          data-graph
          aria-hidden
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40 will-transform"
        >
          <g data-graph-edges strokeDasharray="900">
            {EDGES.map(([a, b], i) => (
              <line
                key={i}
                x1={NODES[a].x}
                y1={NODES[a].y}
                x2={NODES[b].x}
                y2={NODES[b].y}
                stroke="color-mix(in oklch, var(--purple) 55%, transparent)"
                strokeWidth="0.08"
              />
            ))}
          </g>
          {NODES.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={n.s * 0.22}
              fill="color-mix(in oklch, var(--purple) 80%, white)"
              opacity={0.55}
            />
          ))}
        </svg>
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

        {/* Status plate */}
        <div
          data-lukas-status
          className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 opacity-0"
        >
          <span className="glass inline-flex items-center gap-3 rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple [box-shadow:0_0_10px_var(--purple)]" />
            Inhouse R&amp;D Core — Active
          </span>
        </div>
      </div>
    </section>
  )
}
