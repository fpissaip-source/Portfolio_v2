'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Flagship scroll story for L.U.K.A.S. — pinned full-screen chapter that
 * plays like a film sequence: the name assembles, then five beats fade
 * through over a generated neuron-field film scrubbed on a canvas.
 *
 * The film is choreographed to the beats:
 *   act 1 (frames 0..A)   — dormant field, no glow; a first neuron region
 *                           awakens right before beat 1 appears
 *   act 2 (frames A..B)   — smooth cinematic zoom along the filaments into
 *                           that glowing region, landing before beat 2
 *   act 3 (frames B..end) — a second region lights up deeper in the field
 *                           and the camera dives toward it
 */
const FRAME_COUNT = 182
const framePath = (i: number) =>
  `/lukas/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`

/** Clip boundaries in frames (three 5s clips at 12fps). */
const ACT_1_END = 60
const ACT_2_END = 121

/** Section-progress checkpoints the acts are pinned to. */
const P_GLOW_1 = 0.26 // act 1 fully played just as beat 1 stands
const P_ARRIVED = 0.46 // zoom finished shortly before beat 2 settles
const P_GLOW_2 = 0.78 // second light-up + dive play across beats 3–4

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

/** Piecewise map of section progress → film frame, so glows and zooms land
 *  exactly around the beats. */
function frameForProgress(p: number): number {
  if (p <= P_GLOW_1) return (p / P_GLOW_1) * ACT_1_END
  if (p <= P_ARRIVED)
    return ACT_1_END + ((p - P_GLOW_1) / (P_ARRIVED - P_GLOW_1)) * (ACT_2_END - ACT_1_END)
  if (p <= P_GLOW_2)
    return (
      ACT_2_END +
      ((p - P_ARRIVED) / (P_GLOW_2 - P_ARRIVED)) * (FRAME_COUNT - 1 - ACT_2_END)
    )
  return FRAME_COUNT - 1
}

export function Lukas() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // --- frame sequence scrubbing --------------------------------------
    const images: HTMLImageElement[] = new Array(FRAME_COUNT)
    const loaded = new Array<boolean>(FRAME_COUNT).fill(false)
    let currentIndex = -1

    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (!cw || !ch || !img.naturalWidth) return
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      ctx2d.clearRect(0, 0, cw, ch)
      ctx2d.drawImage(
        img,
        (cw - img.naturalWidth * scale) / 2,
        (ch - img.naturalHeight * scale) / 2,
        img.naturalWidth * scale,
        img.naturalHeight * scale,
      )
    }

    const renderIndex = (index: number) => {
      const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(index)))
      let img = images[clamped]
      if (!loaded[clamped]) {
        let lo = clamped
        let hi = clamped
        let found: HTMLImageElement | null = null
        while (lo >= 0 || hi < FRAME_COUNT) {
          if (lo >= 0 && loaded[lo]) {
            found = images[lo]
            break
          }
          if (hi < FRAME_COUNT && loaded[hi]) {
            found = images[hi]
            break
          }
          lo--
          hi++
        }
        if (!found) return
        img = found
      }
      currentIndex = clamped
      drawCover(img)
    }

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)
      renderIndex(currentIndex >= 0 ? currentIndex : 0)
    }

    let firstDrawn = false
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => {
        loaded[i] = true
        if (i === 0 && !firstDrawn) {
          firstDrawn = true
          sizeCanvas()
        } else if (i === currentIndex) {
          renderIndex(i)
        }
      }
      img.src = framePath(i)
      images[i] = img
    }
    window.addEventListener('resize', sizeCanvas)

    // --- scroll choreography -------------------------------------------
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      let raf = 0
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: prefersReduced ? (false as const) : 0.7,
          onUpdate: (self) => {
            const index = frameForProgress(self.progress)
            if (Math.round(index) === currentIndex) return
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => renderIndex(index))
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

      // The film fades up as the chapter opens.
      tl.fromTo(
        q('[data-field]'),
        { opacity: 0.35 },
        { opacity: 0.95, duration: 0.9 },
        0.06,
      )
    }, root)

    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
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
        {/* Neuron-field film — regions awaken and the camera dives along the
            filaments, scrubbed by scroll */}
        <canvas
          ref={canvasRef}
          data-field
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_50%,transparent_40%,#050505_88%)]" />

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
