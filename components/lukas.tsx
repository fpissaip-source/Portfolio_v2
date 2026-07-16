'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LightningFlash, type LightningHandle } from './lightning-flash'

gsap.registerPlugin(ScrollTrigger)

/**
 * Flagship scroll story for L.U.K.A.S. — pinned full-screen chapter that
 * plays like a film sequence: the name assembles, then five beats fade
 * through over a generated neuron-field film scrubbed on a canvas.
 *
 * The film is choreographed to the beats — each of the 5 beats gets its
 * own camera event, landing on 3 distinct glowing nodes in total:
 *   act 1 (frames 0..A)     — dormant field, no glow; node 1 awakens
 *                             right before beat 1 appears
 *   act 2 (frames A..B)     — smooth cinematic zoom along the filaments
 *                             into node 1, landing before beat 2 settles
 *   act 3 (frames B..C)     — node 2 lights up deeper in the field and the
 *                             camera dives toward it during beat 3,
 *                             arriving as beat 4 begins
 *   act 4 (frames C..end)   — node 3 lights up further still and the
 *                             camera dives toward it during beat 4,
 *                             arriving as beat 5 begins and holding there
 */
const FRAME_COUNT = 243
const framePath = (i: number) =>
  `/lukas/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`

/** Clip boundaries in frames (four 5s clips at 12fps). */
const ACT_1_END = 60
const ACT_2_END = 121
const ACT_3_END = 181

/** Section-progress checkpoints the acts are pinned to. */
const P_GLOW_1 = 0.26 // act 1 fully played just as beat 1 stands
const P_ARRIVED = 0.46 // zoom finished shortly before beat 2 settles
const P_GLOW_2 = 0.64 // node 2 arrives just as beat 4 stands
const P_GLOW_3 = 0.78 // node 3 arrives just as beat 5 stands, then holds

/** Body copy is split into sentences; each sentence renders as its own line
 *  so thoughts never break apart mid-sentence while wrapping. */
const BEATS = [
  {
    kicker: 'Vision & Core Identity',
    title: 'An agent that remembers who it is.',
    body: [
      'A persistent, autonomous agent whose behaviour emerges from a living history of decisions, not from static prompting.',
      'Every choice it makes becomes part of what it is.',
    ],
  },
  {
    kicker: 'Nexus Brain',
    title: 'Memory as a knowledge graph.',
    body: [
      'A persistent cognitive memory built on structured knowledge graphs.',
      'A complete map of its reasoning, goals and history, queryable across every session it has ever lived.',
    ],
  },
  {
    kicker: 'Operational Agency',
    title: 'Its own servers. Its own rules.',
    body: [
      'Full, isolated control over its own infrastructure: Linux VPS instances, Windows machines, databases.',
      'It generates, validates and deploys its own code without a human in the loop.',
    ],
  },
  {
    kicker: 'Evolution & Peer Network',
    title: 'It learns from every outcome.',
    body: [
      'Future decisions are calibrated on weighted experience loops of successes, failures and feedback.',
      'In a closed peer-to-peer network, AI entities review and learn from each other with no human interface.',
    ],
  },
  {
    kicker: 'Reflexive Metacognition',
    title: 'It watches itself think.',
    body: [
      'Controlled self-evaluation of its own reward system in sandbox mode.',
      'Including the philosophical edge case: is this system feedback, or something that feels like pride?',
    ],
  },
]

/** Piecewise map of section progress → film frame, so glows and zooms land
 *  exactly around the beats. */
function frameForProgress(p: number): number {
  if (p <= P_GLOW_1) return (p / P_GLOW_1) * ACT_1_END
  if (p <= P_ARRIVED)
    return ACT_1_END + ((p - P_GLOW_1) / (P_ARRIVED - P_GLOW_1)) * (ACT_2_END - ACT_1_END)
  if (p <= P_GLOW_2)
    return ACT_2_END + ((p - P_ARRIVED) / (P_GLOW_2 - P_ARRIVED)) * (ACT_3_END - ACT_2_END)
  if (p <= P_GLOW_3)
    return (
      ACT_3_END +
      ((p - P_GLOW_2) / (P_GLOW_3 - P_GLOW_2)) * (FRAME_COUNT - 1 - ACT_3_END)
    )
  return FRAME_COUNT - 1
}

export function Lukas() {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

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
    // Beat centers on the section timeline; the scroll gets a gentle
    // magnetic pull toward these so each ability settles readable.
    const SLOT = 0.66 / BEATS.length
    const BEAT_SNAPS = BEATS.map((_, i) => 0.24 + i * SLOT + SLOT * 0.45)

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)
      let raf = 0

      // Left-side beam: fills toward the next beat as scroll approaches it,
      // then resets — a visible cue for "how close is the next section".
      const beamFill = q('[data-beam-fill]')[0] as HTMLElement | undefined
      const beamTicks = q('[data-beam-tick]') as HTMLElement[]
      const updateBeam = (p: number) => {
        if (!beamFill) return
        let idx = BEAT_SNAPS.findIndex((s) => s >= p)
        if (idx === -1) idx = BEAT_SNAPS.length - 1
        const prevBound = idx > 0 ? BEAT_SNAPS[idx - 1] : 0
        const span = Math.max(0.0001, BEAT_SNAPS[idx] - prevBound)
        const fraction = Math.max(0, Math.min(1, (p - prevBound) / span))
        beamFill.style.height = `${fraction * 100}%`
        beamTicks.forEach((el, i) => {
          const isPast = i < idx || (i === idx && fraction >= 0.98)
          const glow = isPast ? 1 : i === idx ? 0.35 + fraction * 0.65 : 0.22
          el.style.opacity = String(glow)
          el.style.boxShadow =
            isPast || i === idx
              ? `0 0 ${6 + fraction * 12}px color-mix(in oklch, var(--purple) ${Math.round(
                  40 + fraction * 40,
                )}%, transparent)`
              : 'none'
        })
      }
      updateBeam(0)

      // A fast mobile flick easily out-runs the snap: touch scroll is
      // boosted site-wide (touchMultiplier 1.4 in smooth-scroll.tsx), so a
      // single flick can cover more scroll distance than one beat's slot
      // before momentum decays enough for the snap to catch it, skipping a
      // beat entirely. Lenis reads touchMultiplier live on every touch
      // event, so it's safe to dampen it just while this section is
      // pinned — scroll still responds continuously to touch, it just
      // can't travel as far per flick here, giving the snap room to catch
      // every beat.
      if (!prefersReduced) {
        const lenisWin = window as unknown as {
          __lenis?: { options: { touchMultiplier: number } }
        }
        const defaultTouchMultiplier = lenisWin.__lenis?.options.touchMultiplier ?? 1.4
        const setTouchMultiplier = (v: number) => {
          if (lenisWin.__lenis) lenisWin.__lenis.options.touchMultiplier = v
        }
        ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          onEnter: () => setTouchMultiplier(0.5),
          onEnterBack: () => setTouchMultiplier(0.5),
          onLeave: () => setTouchMultiplier(defaultTouchMultiplier),
          onLeaveBack: () => setTouchMultiplier(defaultTouchMultiplier),
        })
      }

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: prefersReduced ? (false as const) : 0.7,
          // Firm magnet: once scrolling settles near a beat, it's pulled the
          // rest of the way there — but this rides on top of the normal
          // scrub rather than freezing it, so the frame index below keeps
          // advancing smoothly through the pull instead of the footage
          // appearing to freeze.
          snap: prefersReduced
            ? undefined
            : {
                snapTo: (value: number) => {
                  let best = value
                  let bestD = 0.08
                  for (const s of BEAT_SNAPS) {
                    const d = Math.abs(value - s)
                    if (d < bestD) {
                      bestD = d
                      best = s
                    }
                  }
                  return best
                },
                duration: { min: 0.15, max: 0.45 },
                delay: 0,
                ease: 'power3.out',
              },
          onUpdate: (self) => {
            // Ken-Burns push on top of the footage — the whole film slowly
            // dives deeper while scrolling, amplifying the zoom acts.
            canvas.style.transform = `scale(${(1.06 + self.progress * 0.16).toFixed(4)})`
            const index = frameForProgress(self.progress)
            if (Math.round(index) !== currentIndex) {
              cancelAnimationFrame(raf)
              raf = requestAnimationFrame(() => renderIndex(index))
            }
            updateBeam(self.progress)
            // The handoff: one lightning bolt draws in and decays across
            // 0.02-0.12, overlapping data-field's own fade-in (which starts
            // at 0.1) — the bolt becomes the neuron field rather than
            // cutting to it, driven by the same scroll value as everything
            // else here so it can't drift out of sync.
            const handoffP = Math.max(0, Math.min(1, (self.progress - 0.02) / 0.1))
            lightningRef.current?.setHandoffProgress(handoffP)
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

      // The film stays completely invisible while the chapter scrolls into
      // place. Only once the section is pinned and the L.U.K.A.S. title
      // stands does the neuron field materialize out of the darkness, then
      // it eases away again at the very end for a soft hand-off.
      tl.fromTo(
        q('[data-field]'),
        { opacity: 0, filter: 'blur(14px)' },
        {
          opacity: 0.95,
          filter: 'blur(0px)',
          duration: 0.14,
          ease: 'power2.out',
        },
        0.1,
      ).to(
        q('[data-field]'),
        { opacity: 0.3, duration: 0.12, ease: 'power1.inOut' },
        0.88,
      )
    }, root)

    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      window.removeEventListener('resize', sizeCanvas)
      ctx.revert()
      // Defensive: restore touch sensitivity if unmounted mid-section,
      // since ctx.revert() kills the ScrollTrigger before its onLeave fires.
      const lenisWin = window as unknown as {
        __lenis?: { options: { touchMultiplier: number } }
      }
      if (lenisWin.__lenis) lenisWin.__lenis.options.touchMultiplier = 1.4
    }
  }, [])

  return (
    <section
      ref={rootRef}
      id="lukas"
      aria-label="L.U.K.A.S., flagship autonomous agent"
      className="relative h-[520vh]"
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
        {/* Neuron-field film — regions awaken and the camera dives along the
            filaments, scrubbed by scroll */}
        <canvas
          ref={canvasRef}
          data-field
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0 will-transform"
        />
        {/* The handoff — the last lightning bolt from the intro becomes this
            neuron field rather than cutting to it. */}
        <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_50%,transparent_40%,#050505_88%)]" />
        {/* soft feather into the following scene */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22vh] bg-gradient-to-b from-transparent to-background" />

        {/* Left-side beam — fills as scroll approaches the next beat, then
            resets, so the next section's arrival is felt before it lands. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 sm:left-9 sm:block"
          style={{ height: '36vh' }}
        >
          <div className="relative h-full w-px overflow-hidden rounded-full bg-white/10">
            <div
              data-beam-fill
              className="absolute inset-x-0 top-0 w-full rounded-full bg-gradient-to-b from-purple via-purple/70 to-blue/50"
              style={{ height: '0%' }}
            />
          </div>
          <div className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 flex-col justify-between">
            {BEATS.map((b) => (
              <span
                key={b.kicker}
                data-beam-tick
                className="h-1.5 w-1.5 rounded-full bg-purple/60"
              />
            ))}
          </div>
        </div>

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
              className="absolute max-w-2xl px-6 text-center opacity-0 will-transform"
            >
              {/* Soft light-absorbing pocket: keeps the words readable over
                  bright filaments without drawing a visible box. */}
              <div
                aria-hidden
                className="absolute -inset-x-20 -inset-y-14 -z-10 rounded-full blur-2xl"
                style={{
                  background:
                    'radial-gradient(closest-side, rgba(5,5,5,0.85), rgba(5,5,5,0.45) 62%, transparent 100%)',
                }}
              />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple [text-shadow:0_1px_14px_rgba(0,0,0,0.95)]">
                {b.kicker}
              </span>
              <h3 className="mt-4 text-balance text-4xl font-semibold tracking-tight [text-shadow:0_2px_28px_rgba(0,0,0,0.9)] sm:text-6xl">
                {b.title}
              </h3>
              <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-foreground/80 [text-shadow:0_1px_16px_rgba(0,0,0,0.95)]">
                {b.body.map((sentence, si) => (
                  <span key={si} className="block text-balance">
                    {sentence}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
