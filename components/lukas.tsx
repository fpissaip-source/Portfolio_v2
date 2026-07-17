'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LightningFlash, type LightningHandle } from './lightning-flash'

gsap.registerPlugin(ScrollTrigger)

/**
 * Flagship scroll story for L.U.K.A.S. — pinned full-screen chapter that
 * plays like a film sequence: the name assembles, then five beats fade
 * through over a generated 3D node-network film scrubbed by scroll.
 *
 * The film is one continuous shot — a slow camera pull-back through a
 * rigid network of glowing nodes. Depth layers keep revealing, nodes
 * ignite one after another, and electric arcs travel the straight
 * connection lines in the second half. It ships as an All-Intra MP4
 * (every frame a keyframe), so scrubbing `currentTime` from scroll lands
 * instantly on exact frames — no GOP seeking stalls.
 */
const VIDEO_DESKTOP = '/videos/lukas-desktop.mp4'
const VIDEO_MOBILE = '/videos/lukas-mobile.mp4'

/** The film plays across section progress 0 → P_FILM_END, then holds its
 *  final composition while beat 5 stands — the same hold the old frame
 *  sequence had from 0.78 onward. */
const P_FILM_END = 0.78

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

export function Lukas() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

  useEffect(() => {
    const root = rootRef.current
    const video = videoRef.current
    if (!root || !video) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // --- scroll-scrubbed video -----------------------------------------
    // Source is picked once on mount: the 9:16 crop keeps the dense heart
    // of the network centered on portrait screens instead of letting
    // object-cover slice an arbitrary window out of the 16:9 master —
    // and phones download a third of the bytes.
    const isPortraitPhone = window.matchMedia('(max-width: 768px)').matches

    // Seek queue — never issue overlapping seeks; the newest target wins.
    // With All-Intra encoding every frame is a keyframe, so each seek
    // resolves in one decode and `fastSeek` (where available) is exact.
    const fastSeek = (
      video as HTMLVideoElement & { fastSeek?: (time: number) => void }
    ).fastSeek?.bind(video)
    let pendingTime: number | null = null
    let seekBusy = false
    const seekTo = (t: number) => {
      const d = video.duration
      if (!d || Number.isNaN(d)) return
      const clamped = Math.max(0, Math.min(d - 1 / 24, t))
      if (seekBusy) {
        pendingTime = clamped
        return
      }
      seekBusy = true
      if (fastSeek) fastSeek(clamped)
      else video.currentTime = clamped
    }
    const onSeeked = () => {
      seekBusy = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        seekTo(t)
      }
    }
    video.addEventListener('seeked', onSeeked)

    // A muted inline play/pause primes the decode pipeline — allowed
    // without a gesture, and it makes iOS actually buffer the file.
    const onLoadedMeta = () => {
      seekTo(0)
      const p = video.play()
      if (p) p.then(() => video.pause()).catch(() => {})
    }
    video.addEventListener('loadedmetadata', onLoadedMeta)
    video.src = isPortraitPhone ? VIDEO_MOBILE : VIDEO_DESKTOP

    // --- scroll choreography -------------------------------------------
    // Beat centers on the section timeline; the scroll gets a gentle
    // magnetic pull toward these so each ability settles readable.
    const SLOT = 0.66 / BEATS.length
    const BEAT_SNAPS = BEATS.map((_, i) => 0.24 + i * SLOT + SLOT * 0.45)

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root)

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
          // See cinematic-intro.tsx: Lenis already smooths raw scroll input,
          // so a heavy scrub here double-lags the frame sequence behind the
          // mouse wheel specifically (a notched desktop wheel arrives in
          // discrete bursts, unlike a continuous touch/trackpad stream).
          scrub: prefersReduced ? (false as const) : 0.25,
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
            // dives deeper while scrolling, amplifying the pull-back.
            video.style.transform = `scale(${(1.06 + self.progress * 0.16).toFixed(4)})`
            seekTo(Math.min(self.progress / P_FILM_END, 1) * (video.duration || 0))
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
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onLoadedMeta)
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
        {/* Node-network film — a continuous pull-back through the glowing
            network, scrubbed by scroll. object-cover + the Ken-Burns scale
            replace the old canvas cover-draw. */}
        <video
          ref={videoRef}
          data-field
          aria-hidden
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 will-transform"
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
