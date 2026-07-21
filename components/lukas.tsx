'use client'

import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useT } from './language-context'

gsap.registerPlugin(ScrollTrigger)

// Dynamically imported (like project-orbs.tsx / tech-orbs.tsx) so its
// Three.js-heavy JS is only fetched once the section is near-viewport
// (gated below via `brainNear`), not bundled into the eagerly-loaded
// chunk just because it's a static import.
const LukasBrain = dynamic(() => import('./lukas-brain').then((mod) => mod.LukasBrain), {
  ssr: false,
})

/**
 * Flagship scroll story for L.U.K.A.S. — pinned full-screen chapter that
 * places the visitor INSIDE the agent's brain: a real-time WebGL volume of
 * neurons above, below and all around the camera (lukas-brain.tsx), flown
 * through on a scroll-scrubbed spline. Each ability beat has its own neural
 * region that flares up while the camera dwells on it — nodes ignite,
 * synapses brighten, signal pulses stream along glowing highways to the
 * other regions — then the camera rushes to the next region in a hard zoom.
 *
 * Scroll progress is shared with the scene through a single mutable ref, so
 * the flight, the region glow and the copy can never drift apart.
 *
 * Devices without WebGL fall back to the previous pre-rendered network film
 * (All-Intra MP4, scroll-scrubbed via the hardened seek queue below).
 */
const VIDEO_DESKTOP = '/videos/lukas-desktop.mp4'
const VIDEO_MOBILE = '/videos/lukas-mobile.mp4'

/** Fallback film only: it plays across section progress 0 → P_FILM_END,
 *  then holds its final composition while beat 5 stands. */
const P_FILM_END = 0.78

/** Fixed beat count driving the section's scroll-progress layout math (the
 *  scroll snap, progress beam and 3D flight camera dwells) — decoupled
 *  from the translated beat copy (`useT().lukas.beats`, same 5 entries in
 *  either language) so the layout doesn't depend on which dictionary is
 *  active. */
const BEAT_COUNT = 5

/** Beat centers on the section timeline — shared by the scroll snap, the
 *  progress beam AND the 3D flight (each camera dwell is anchored on one),
 *  so every system agrees on where an ability "is". */
const SLOT = 0.66 / BEAT_COUNT
const BEAT_SNAPS = Array.from({ length: BEAT_COUNT }, (_, i) => 0.24 + i * SLOT + SLOT * 0.45)

/** Last-resort net: if the WebGL2 probe passed but the renderer still fails
 *  to initialise (blocked/exhausted contexts), swap to the film instead of
 *  leaving a black hole where the brain should be. */
class BrainBoundary extends Component<{ onFail: () => void; children: ReactNode }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function Lukas() {
  const t = useT()
  const BEATS = t.lukas.beats
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lightningRef = useRef<LightningHandle>(null)
  /** Raw section progress, written by ScrollTrigger, read by the 3D scene
   *  every frame — the one channel that keeps flight and copy in sync. */
  const progressRef = useRef({ p: 0 })
  /** The site-wide touchMultiplier as it was before this section dampened
   *  it — read once when the dampening engages, restored both on normal
   *  leave AND on unmount, so the two paths can never disagree with each
   *  other (or with whatever smooth-scroll.tsx actually has it set to). */
  const defaultTouchMultiplierRef = useRef(1.1)
  /** '3d' on any WebGL-capable device (the intended experience); 'video'
   *  keeps the old pre-rendered film as a rare-device fallback. */
  const [mode, setMode] = useState<'3d' | 'video' | null>(null)
  // The brain is the heaviest WebGL scene on the page — don't create its
  // context until the section is actually close to scrolling into view,
  // rather than the moment the page hydrates (Lukas sits well below the
  // fold behind the entire cinematic intro + hero).
  const [brainNear, setBrainNear] = useState(false)

  useEffect(() => {
    let ok = false
    try {
      // three r185 requires WebGL2 — a WebGL1-only context would make the
      // renderer throw, so anything less than webgl2 goes to the film.
      const c = document.createElement('canvas')
      ok = !!c.getContext('webgl2')
    } catch {
      ok = false
    }
    setMode(ok ? '3d' : 'video')
  }, [])

  useEffect(() => {
    if (brainNear) return
    const root = rootRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBrainNear(true)
          obs.disconnect()
        }
      },
      { rootMargin: '400px' },
    )
    obs.observe(root)
    return () => obs.disconnect()
  }, [brainNear])

  useEffect(() => {
    const root = rootRef.current
    if (!root || mode === null) return
    const video = videoRef.current
    if (mode === 'video' && !video) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    // --- fallback film: scroll-scrubbed video --------------------------
    // Only wired up when WebGL is unavailable; WebGL devices never touch
    // (or download) the MP4s.
    let seekTo: (t: number) => void = () => {}
    let cleanupVideo = () => {}
    if (mode === 'video' && video) {
      // Source is picked once on mount: the 9:16 crop keeps the dense heart
      // of the network centered on portrait screens instead of letting
      // object-cover slice an arbitrary window out of the 16:9 master —
      // and phones download a third of the bytes.
      const isPortraitPhone = window.matchMedia('(max-width: 768px)').matches

      // Seek queue — never issue overlapping seeks; the newest target wins.
      // With All-Intra encoding every frame is a keyframe, so each seek
      // resolves in one decode already — no need for `video.fastSeek()`,
      // whose whole point is trading precision for speed on long-GOP
      // footage by snapping to the nearest keyframe. Here that trade buys
      // nothing but inherits fastSeek's non-standard, historically flaky
      // WebKit behavior (silently landing on the wrong frame or dropping
      // `seeked` entirely), so a plain `currentTime` assignment is used
      // unconditionally instead.
      const SEEK_EPS = 1 / 48 // half a frame @24fps — treat as "already there"
      let pendingTime: number | null = null
      let seekBusy = false
      let seekWatchdog = 0
      seekTo = (t: number) => {
        const d = video.duration
        if (!d || Number.isNaN(d)) return
        const clamped = Math.max(0, Math.min(d - 1 / 24, t))
        if (seekBusy) {
          pendingTime = clamped
          return
        }
        // No-op guard: WebKit may swallow `seeked` for same-position seeks,
        // which would wedge the queue. The hold region past P_FILM_END maps
        // to a constant end time, so this also skips redundant seek storms.
        if (Math.abs(video.currentTime - clamped) < SEEK_EPS) return
        seekBusy = true
        // Watchdog: if `seeked` never arrives (dropped/interrupted seek),
        // release the queue so scrubbing can't lock onto a stale frame.
        window.clearTimeout(seekWatchdog)
        seekWatchdog = window.setTimeout(releaseSeek, 300)
        video.currentTime = clamped
      }
      const releaseSeek = () => {
        window.clearTimeout(seekWatchdog)
        seekBusy = false
        if (pendingTime !== null) {
          const t = pendingTime
          pendingTime = null
          seekTo(t)
        }
      }
      const onSeeked = () => releaseSeek()
      video.addEventListener('seeked', onSeeked)
      video.addEventListener('error', releaseSeek)

      // A muted inline play/pause primes the decode pipeline — allowed
      // without a gesture, and it makes iOS actually buffer the file.
      const onLoadedMeta = () => {
        seekTo(0)
        const p = video.play()
        if (p) p.then(() => video.pause()).catch(() => {})
      }
      video.addEventListener('loadedmetadata', onLoadedMeta)
      video.src = isPortraitPhone ? VIDEO_MOBILE : VIDEO_DESKTOP

      cleanupVideo = () => {
        window.clearTimeout(seekWatchdog)
        video.removeEventListener('seeked', onSeeked)
        video.removeEventListener('error', releaseSeek)
        video.removeEventListener('loadedmetadata', onLoadedMeta)
      }
    }

    // --- scroll choreography -------------------------------------------
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
      // boosted site-wide (touchMultiplier 1.1 in smooth-scroll.tsx), so a
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
        defaultTouchMultiplierRef.current = lenisWin.__lenis?.options.touchMultiplier ?? 1.1
        const setTouchMultiplier = (v: number) => {
          if (lenisWin.__lenis) lenisWin.__lenis.options.touchMultiplier = v
        }
        ScrollTrigger.create({
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          onEnter: () => setTouchMultiplier(0.5),
          onEnterBack: () => setTouchMultiplier(0.5),
          onLeave: () => setTouchMultiplier(defaultTouchMultiplierRef.current),
          onLeaveBack: () => setTouchMultiplier(defaultTouchMultiplierRef.current),
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
          // Gentle magnet: once scrolling settles very near a beat, it's
          // eased the rest of the way there — but this rides on top of the
          // normal scrub rather than freezing it, so the camera flight
          // below keeps advancing smoothly through the pull instead of the
          // scene appearing to freeze. A short capture radius plus fully
          // snap-free margins past the first/last beat keep this from
          // fighting anyone trying to scroll straight through the section
          // or out of it into a neighbor — a wider radius here used to
          // read as the page aggressively "snapping back" whenever a
          // scroll gesture happened to settle anywhere near the last beat,
          // which sits well before the section's actual bottom edge.
          snap: prefersReduced
            ? undefined
            : {
                snapTo: (value: number) => {
                  const first = BEAT_SNAPS[0]
                  const last = BEAT_SNAPS[BEAT_SNAPS.length - 1]
                  if (value < first - 0.05 || value > last + 0.05) return value
                  let best = value
                  let bestD = 0.058
                  for (const s of BEAT_SNAPS) {
                    const d = Math.abs(value - s)
                    if (d < bestD) {
                      bestD = d
                      best = s
                    }
                  }
                  return best
                },
                duration: { min: 0.12, max: 0.28 },
                delay: 0,
                ease: 'power3.out',
              },
          onUpdate: (self) => {
            // One write per scroll tick — the 3D flight reads this ref every
            // frame, so camera, region glow and copy share one clock.
            progressRef.current.p = self.progress
            if (mode === 'video' && video) {
              // Fallback film only: Ken-Burns push + frame scrub.
              video.style.transform = `scale(${(1.06 + self.progress * 0.16).toFixed(4)})`
              seekTo(Math.min(self.progress / P_FILM_END, 1) * (video.duration || 0))
            }
            updateBeam(self.progress)
            // The handoff: a cluster of glowing nodes draws in across
            // 0.02-0.11, fully formed right as data-field's own fade-in
            // begins (0.1), then fades out across 0.11-0.24 — matching
            // data-field's fade-in window almost exactly, so the cluster
            // and the real neuron field are both visible for a long,
            // genuine crossfade instead of the cluster vanishing first and
            // leaving a gap before the field appears.
            const handoffP = Math.max(0, Math.min(1, (self.progress - 0.02) / 0.22))
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

      // The brain stays completely invisible while the chapter scrolls into
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
        // Zoom-out dissolve, not a settle-and-cut: the field pushes past
        // the camera (scale up) as it fades fully away, so the handoff
        // into Projects' own node backdrop reads as flying through the
        // glow and out the other side rather than the brain scene just
        // dimming and stopping.
        { opacity: 0, scale: 1.35, duration: 0.16, ease: 'power2.in' },
        0.84,
      )
    }, root)

    requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cleanupVideo()
      ctx.revert()
      // Defensive: restore touch sensitivity if unmounted mid-section,
      // since ctx.revert() kills the ScrollTrigger before its onLeave fires.
      const lenisWin = window as unknown as {
        __lenis?: { options: { touchMultiplier: number } }
      }
      if (lenisWin.__lenis) lenisWin.__lenis.options.touchMultiplier = defaultTouchMultiplierRef.current
    }
  }, [mode])

  return (
    <section
      ref={rootRef}
      id="lukas"
      aria-label="L.U.K.A.S., flagship autonomous agent"
      className="relative h-[520vh]"
    >
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden">
        {/* Brain interior — a live 3D neuron volume flown through by scroll.
            Devices without WebGL get the old pre-rendered film instead. */}
        <div
          data-field
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 will-transform"
        >
          {mode === '3d' && brainNear && (
            <BrainBoundary onFail={() => setMode('video')}>
              <LukasBrain progress={progressRef} snaps={BEAT_SNAPS} />
            </BrainBoundary>
          )}
          {mode === 'video' && (
            <video
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              className="h-full w-full object-cover will-transform"
            />
          )}
        </div>
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

        {/* Repo link — small, persistent chrome (not part of the beat
            timeline), tucked in the corner so it never competes with the
            choreography. */}
        <a
          href="https://github.com/fpissaip-source/Lukas_autonom"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-6 right-5 z-20 hidden items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm transition-colors hover:border-purple/50 hover:text-foreground sm:right-9 sm:flex"
        >
          {t.lukas.repoLink} ↗
        </a>

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
            {t.lukas.subtitle}
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
