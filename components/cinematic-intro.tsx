'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NeonLine, type NeonLineHandle } from './neon-name'
import { LightningFlash, type LightningHandle } from './lightning-flash'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-scrubbed cinematic intro. A generated 3-shot flythrough (city →
 * glowing purple window → room → green-screen monitor) is a 4K All-Intra
 * MP4 used as a pure frame source: scroll seeks a hidden <video>, and each
 * decoded frame is drawn onto the <canvas> — the same Apple-style canvas
 * pipeline as before, but fed by hardware video decode instead of 182
 * separate JPEG requests. All-Intra (every frame a keyframe) means every
 * seek resolves in a single decode, which keeps scrubbing responsive even
 * on iOS Safari, where video seeking during scroll is historically fragile.
 *
 * The final shot ends on an ultrawide monitor. The footage is pre-processed
 * so the screen carries the website's dark blue→purple tones; SCREEN_FRAC
 * below is the measured screen area of the last frame as fractions of the
 * source frame (measured on the 1536×864 master — fractions survive the 4K
 * upscale). The website preview is projected into it and the whole stage
 * scales until the monitor swallows the viewport — that zoom IS the
 * transition onto the real site.
 */
const VIDEO_SRC = '/videos/intro.mp4'
const POSTER_SRC = '/intro/cinematic-poster.jpg'

/** Scroll share reserved for the flythrough; the rest is the monitor zoom. */
const FLIGHT_END = 0.82

/** Monitor screen area in the last frame, as fractions of the frame. */
const SCREEN_FRAC = { x: 0, y: 95 / 864, w: 1, h: 660 / 864 }

type PhraseAnim = 'blurScale' | 'wipe' | 'flip3D' | 'maskUp' | 'zoomOut'

const PHRASES: { text: string; anim: PhraseAnim }[] = [
  { text: 'Building Intelligent Systems', anim: 'blurScale' },
  { text: 'AI Automation', anim: 'wipe' },
  { text: 'Full Stack Development', anim: 'flip3D' },
  { text: 'I built everything entirely on iPhone. No PC. No Laptop!', anim: 'maskUp' },
  { text: 'Software That Solves Real Problems', anim: 'zoomOut' },
]

/** Distinct, premium enter/exit keyframes per phrase (all scrub-interpolatable). */
const PHRASE_ANIMS: Record<
  PhraseAnim,
  { from: gsap.TweenVars; exit: gsap.TweenVars }
> = {
  blurScale: {
    from: { opacity: 0, scale: 0.82, filter: 'blur(16px)', letterSpacing: '0.35em' },
    exit: { opacity: 0, scale: 1.12, filter: 'blur(16px)', letterSpacing: '0.1em' },
  },
  wipe: {
    from: { opacity: 0, xPercent: -8, clipPath: 'inset(0 100% 0 0)', filter: 'blur(4px)' },
    exit: { opacity: 0, xPercent: 8, clipPath: 'inset(0 0 0 100%)', filter: 'blur(4px)' },
  },
  flip3D: {
    from: { opacity: 0, rotateX: -82, yPercent: 40, filter: 'blur(6px)', transformPerspective: 800 },
    exit: { opacity: 0, rotateX: 82, yPercent: -40, filter: 'blur(6px)', transformPerspective: 800 },
  },
  maskUp: {
    from: { opacity: 0, yPercent: 30, clipPath: 'inset(0 0 100% 0)' },
    exit: { opacity: 0, yPercent: -30, clipPath: 'inset(100% 0 0 0)' },
  },
  zoomOut: {
    from: { opacity: 0, scale: 1.45, filter: 'blur(22px)' },
    exit: { opacity: 0, scale: 0.9, filter: 'blur(16px)' },
  },
}

export function CinematicIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const line1Ref = useRef<NeonLineHandle>(null)
  const line2Ref = useRef<NeonLineHandle>(null)
  const nameWrapRef = useRef<HTMLDivElement>(null)
  const lightningRef = useRef<LightningHandle>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    const screen = screenRef.current
    if (!root || !stage || !canvas || !screen) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const video = videoRef.current
    if (!video) return

    // object-fit: cover mapping of the video frame onto the canvas.
    const coverTransform = () => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const vw = video.videoWidth
      const vh = video.videoHeight
      const scale = Math.max(cw / vw, ch / vh)
      return {
        scale,
        dx: (cw - vw * scale) / 2,
        dy: (ch - vh * scale) / 2,
      }
    }

    const drawFrame = () => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (!cw || !ch || !video.videoWidth) return
      const { scale, dx, dy } = coverTransform()
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(
        video,
        dx,
        dy,
        video.videoWidth * scale,
        video.videoHeight * scale,
      )
    }

    // Keep the website preview glued to the monitor screen and set the zoom
    // origin so scaling the stage dives straight into the screen.
    const placeScreen = () => {
      if (!video.videoWidth) return
      const { scale, dx, dy } = coverTransform()
      const x = dx + SCREEN_FRAC.x * video.videoWidth * scale
      const y = dy + SCREEN_FRAC.y * video.videoHeight * scale
      const w = SCREEN_FRAC.w * video.videoWidth * scale
      const h = SCREEN_FRAC.h * video.videoHeight * scale
      Object.assign(screen.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      })
      const ox = ((x + w / 2) / canvas.clientWidth) * 100
      const oy = ((y + h / 2) / canvas.clientHeight) * 100
      stage.style.transformOrigin = `${ox}% ${oy}%`
      // Scale needed for the screen rect to cover the viewport.
      const target = Math.max(canvas.clientWidth / w, canvas.clientHeight / h) * 1.04
      stage.dataset.zoomTarget = String(target)
    }

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawFrame()
      placeScreen()
    }

    // Seek queue — never issue overlapping seeks; the newest target wins.
    // Painting is driven by requestVideoFrameCallback where supported (it
    // fires exactly when the seeked frame is ready to composite), with the
    // plain `seeked` event as fallback. All-Intra encoding makes each seek
    // a single-frame decode, so the queue drains at display rate.
    const vrfc = (
      video as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number
      }
    ).requestVideoFrameCallback?.bind(video)
    const fastSeek = (
      video as HTMLVideoElement & { fastSeek?: (time: number) => void }
    ).fastSeek?.bind(video)
    const SEEK_EPS = 1 / 48 // half a frame @24fps — treat as "already there"
    let pendingTime: number | null = null
    let seekBusy = false
    let seekWatchdog = 0
    const seekTo = (t: number) => {
      const d = video.duration
      if (!d || Number.isNaN(d)) return
      const clamped = Math.max(0, Math.min(d - 1 / 24, t))
      if (seekBusy) {
        pendingTime = clamped
        return
      }
      // No-op guard: WebKit may swallow `seeked` for same-position seeks,
      // which would wedge the queue behind a seekBusy that never clears.
      if (Math.abs(video.currentTime - clamped) < SEEK_EPS) return
      seekBusy = true
      // Watchdog: if `seeked` never arrives (dropped/interrupted seek),
      // release the queue so the scrub can't freeze on a stale frame.
      window.clearTimeout(seekWatchdog)
      seekWatchdog = window.setTimeout(releaseSeek, 300)
      if (vrfc) vrfc(() => drawFrame())
      if (fastSeek) fastSeek(clamped)
      else video.currentTime = clamped
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
    const onSeeked = () => {
      // Always paint here too: drawFrame() is an idempotent blit, and on
      // engines where paused-seek + rVFC is flaky this is the safety net.
      drawFrame()
      releaseSeek()
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', releaseSeek)

    // First paint + preview placement as soon as dimensions are known; a
    // muted inline play/pause primes the decode pipeline without a gesture.
    const onLoadedMeta = () => {
      sizeCanvas()
      const p = video.play()
      if (p) p.then(() => video.pause()).catch(() => {})
      seekTo(0)
    }
    const onLoadedData = () => {
      drawFrame()
      placeScreen()
    }
    video.addEventListener('loadedmetadata', onLoadedMeta)
    video.addEventListener('loadeddata', onLoadedData)
    video.src = VIDEO_SRC

    window.addEventListener('resize', sizeCanvas)

    const ctxAnim = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const st = {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        // Lenis (smooth-scroll.tsx) already eases raw scroll input with a
        // 1.1s duration; stacking a heavy scrub on top of that doubled up
        // the lag. That's barely noticeable on a continuous touch/trackpad
        // stream, but a notched desktop mouse wheel arrives in discrete
        // bursts, so the compounded delay read as the frame sequence not
        // tracking the scroll — a much lighter scrub here keeps the canvas
        // glued to Lenis's already-smooth position instead of adding a
        // second layer of catch-up.
        scrub: prefersReduced ? (false as const) : 0.25,
      }

      // A network spark punctuates each word the moment it finishes forming
      // — the nodes "discharging" into the finished letterform. Re-armed
      // when scrolling back above the gate so the moment replays.
      const sparkGates = [
        { at: 0.095, x: 0.5, y: 0.17 },
        { at: 0.167, x: 0.54, y: 0.17 },
        { at: 0.275, x: 0.5, y: 0.32 },
        { at: 0.746, x: 0.57, y: 0.32 },
      ]
      const sparkFired = sparkGates.map(() => false)

      // Frame scrubbing — the flythrough completes at FLIGHT_END; the last
      // stretch is reserved for the dive into the monitor.
      ScrollTrigger.create({
        ...st,
        onUpdate: (self) => {
          const p = Math.min(self.progress / FLIGHT_END, 1)
          seekTo(p * (video.duration || 0))
          sparkGates.forEach((g, i) => {
            if (
              !sparkFired[i] &&
              self.progress >= g.at &&
              self.progress < g.at + 0.09
            ) {
              sparkFired[i] = true
              lightningRef.current?.strike({
                style: 'network',
                intensity: 1,
                originX: g.x + (Math.random() - 0.5) * 0.05,
                originY: g.y + (Math.random() - 0.5) * 0.04,
                spread: 0.09,
              })
            } else if (sparkFired[i] && self.progress < g.at - 0.04) {
              sparkFired[i] = false
            }
          })
        },
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: st,
      })

      // The website appears on the green screen shortly before the flight
      // settles on the monitor, then the whole stage dives into it.
      tl.fromTo(
        q('[data-screen]'),
        { opacity: 0 },
        { opacity: 1, duration: 0.045, ease: 'power1.inOut' },
        FLIGHT_END - 0.045,
      )
      // Zoom target depends on the detected green rect, which resolves after
      // frames load — so interpolate a 0→1 proxy and read the target live.
      const zoomProxy = { p: 0 }
      tl.to(
        zoomProxy,
        {
          p: 1,
          duration: 0.16,
          ease: 'power2.in',
          onUpdate: () => {
            const target = Number(stage.dataset.zoomTarget || 6)
            const s = 1 + (target - 1) * zoomProxy.p
            stage.style.transform = `scale(${s})`
          },
        },
        FLIGHT_END + 0.01,
      )

      // Land on the real site.
      tl.to(q('[data-handoff]'), { opacity: 1, duration: 0.04 }, 0.965)

      // Scene 2 — text phrases, each with its own premium animation.
      const phrases = q('[data-phrase]')
      phrases.forEach((el, i) => {
        const { from, exit } = PHRASE_ANIMS[PHRASES[i].anim]
        const start = 0.07 + i * 0.1
        const settled = {
          opacity: 1,
          scale: 1,
          xPercent: 0,
          yPercent: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          letterSpacing: '0em',
          clipPath: 'inset(0 0 0 0)',
        }
        tl.fromTo(
          el,
          from,
          { ...settled, duration: 0.05, ease: 'power3.out' },
          start,
        ).to(el, { ...exit, duration: 0.046, ease: 'power2.in' }, start + 0.058)
      })

      tl.to(q('[data-hint]'), { opacity: 0, duration: 0.04 }, 0.02)

      // Opening plate fades away as soon as scrolling begins.
      tl.to(
        q('[data-intro]'),
        { opacity: 0, yPercent: -6, filter: 'blur(12px)', duration: 0.05, ease: 'power2.in' },
        0.012,
      )

      // The name sequence — "I", then "AM", then "ISSA": each word sketches
      // itself as flashing nodes dotted along the letter outlines, then a
      // thin neon line connects them (outline only, blue glow bleeding
      // inward and outward). Everything holds fully lit through the flight;
      // at the very end "HAREB" assembles next to "ISSA" — the first ISSA
      // slides into its slot inside "ISSA HAREB" — and the finished line
      // dives into the monitor screen, becoming the site's own title.
      const pI = { v: 0 }
      const pAM = { v: 0 }
      const pISSA = { v: 0 }
      const pHAREB = { v: 0 }
      const solo1 = { v: 1 }
      const solo2 = { v: 1 }
      const fade1 = { v: 0 }
      tl.to(
        pI,
        { v: 1, duration: 0.06, onUpdate: () => line1Ref.current?.setWord(0, pI.v) },
        0.035,
      )
      tl.to(
        solo1,
        { v: 0, duration: 0.05, onUpdate: () => line1Ref.current?.setSolo(solo1.v) },
        0.098,
      )
      tl.to(
        pAM,
        { v: 1, duration: 0.065, onUpdate: () => line1Ref.current?.setWord(1, pAM.v) },
        0.102,
      )
      tl.to(
        pISSA,
        { v: 1, duration: 0.1, onUpdate: () => line2Ref.current?.setWord(0, pISSA.v) },
        0.175,
      )
      // Sequenced hand-off: first ISSA glides out of its solo-centered spot
      // into its slot inside "ISSA HAREB", *then* HAREB sketches itself in
      // the space that opened up — running both at once makes the words
      // collide mid-transition.
      tl.to(
        solo2,
        { v: 0, duration: 0.045, onUpdate: () => line2Ref.current?.setSolo(solo2.v) },
        0.64,
      )
      tl.to(
        pHAREB,
        { v: 1, duration: 0.058, onUpdate: () => line2Ref.current?.setWord(1, pHAREB.v) },
        0.688,
      )
      tl.to(
        fade1,
        { v: 1, duration: 0.06, onUpdate: () => line1Ref.current?.setFade(fade1.v) },
        0.72,
      )
      // "ISSA HAREB" doesn't just fade in place — the assembled line slides
      // and shrinks down toward its exact position inside the monitor's
      // screen preview while it dissolves, landing right as the static
      // preview text (data-screen) fades in at that same spot. One
      // continuous hand-off instead of two independent pieces of text.
      let nameSlide: { dx: number; dy: number; scale: number } | null = null
      const slideP = { v: 0 }
      tl.to(
        slideP,
        {
          v: 1,
          duration: 0.075,
          ease: 'none',
          onUpdate: () => {
            const wrap = nameWrapRef.current
            if (!wrap) return
            if (!nameSlide) {
              const textEl = wrap.querySelector<SVGGElement>('[data-neon-text]')
              const targetEl = screen.querySelector<HTMLElement>('[data-screen-name]')
              if (!textEl || !targetEl) return
              const tr = textEl.getBoundingClientRect()
              const gr = targetEl.getBoundingClientRect()
              if (tr.width === 0 || gr.width === 0) return
              nameSlide = {
                dx: gr.left + gr.width / 2 - (tr.left + tr.width / 2),
                dy: gr.top + gr.height / 2 - (tr.top + tr.height / 2),
                scale: gr.height / tr.height,
              }
            }
            const slide = nameSlide
            if (!slide) return
            const t = slideP.v
            gsap.set(wrap, {
              x: slide.dx * t,
              y: slide.dy * t,
              scale: 1 + (slide.scale - 1) * t,
            })
            line2Ref.current?.setFade(Math.max(0, (t - 0.55) / 0.45))
          },
        },
        0.75,
      )
    }, root)

    // Ensure ScrollTrigger measures correctly once mounted.
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('resize', sizeCanvas)
      window.clearTimeout(seekWatchdog)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', releaseSeek)
      video.removeEventListener('loadedmetadata', onLoadedMeta)
      video.removeEventListener('loadeddata', onLoadedData)
      ctxAnim.revert()
    }
  }, [])

  // Ambient network sparks — L.U.K.A.S. staying "awake" through the flight.
  // Deliberately independent of scroll: runs on its own clock the whole time
  // the section is in view, rather than firing at fixed scroll thresholds.
  // Kept to the far left/right margins so it never sits over the centered
  // title/phrase text (and the canvas is z-[8], behind every text layer,
  // as a second line of defense if a cluster ever drifts close to the edge
  // of that margin).
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let inView = false
    let timer: number | undefined

    const scheduleNext = () => {
      const delay = 1100 + Math.random() * 1400
      timer = window.setTimeout(() => {
        if (inView) {
          const onLeft = Math.random() > 0.5
          const originX = onLeft ? 0.03 + Math.random() * 0.1 : 0.87 + Math.random() * 0.1
          const originY = 0.08 + Math.random() * 0.84
          lightningRef.current?.strike({
            style: 'network',
            intensity: 0.85,
            originX,
            originY,
            spread: 0.05 + Math.random() * 0.03,
          })
        }
        scheduleNext()
      }, delay)
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    observer.observe(root)
    scheduleNext()

    return () => {
      observer.disconnect()
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  // Cursor-follow terminal reveal — only during the opening plate (the
  // very first shot, before the flythrough starts). It lives inside
  // data-intro so it inherits that layer's own scroll-driven fade-out
  // rather than needing its own scroll logic. A small "window" that trails
  // the pointer with a soft lerp, as if a hidden code editor sits just
  // behind the footage and the cursor is peeling back a corner of it.
  useEffect(() => {
    const root = rootRef.current
    const panel = terminalRef.current
    if (!root || !panel) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let inView = false
    let active = false
    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0

    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      tx = e.clientX - r.left
      ty = e.clientY - r.top
      if (!active) {
        active = true
        cx = tx
        cy = ty
      }
    }

    const loop = () => {
      cx += (tx - cx) * 0.16
      cy += (ty - cy) * 0.16
      panel.style.transform = `translate3d(${cx + 28}px, ${cy + 28}px, 0)`
      panel.style.opacity = active && inView ? '1' : '0'
      raf = requestAnimationFrame(loop)
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
    })
    observer.observe(root)
    root.addEventListener('pointermove', onMove)
    raf = requestAnimationFrame(loop)

    return () => {
      observer.disconnect()
      root.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={rootRef}
      aria-label="Cinematic introduction"
      className="relative h-[600vh] bg-background"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Zoomable stage: frames + the website projected onto the monitor.
            Scaling this div dives the camera into the screen. */}
        <div ref={stageRef} className="absolute inset-0 will-transform">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full"
            style={{
              backgroundImage: `url(${POSTER_SRC})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          {/* Hidden frame source — decoded by the browser, painted onto the
              canvas above. Kept 1px + transparent instead of display:none so
              Safari doesn't deprioritize decoding it. */}
          <video
            ref={videoRef}
            aria-hidden
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
          />

          {/* Website preview glued onto the monitor's chroma-green screen. */}
          <div
            ref={screenRef}
            data-screen
            className="pointer-events-none absolute overflow-hidden opacity-0"
            style={{ borderRadius: '1%' }}
          >
            <div
              className="flex h-full w-full flex-col items-center justify-center gap-[6%]"
              style={{
                background:
                  'radial-gradient(120% 80% at 50% 20%, color-mix(in oklch, var(--blue) 16%, transparent), #050505 60%)',
              }}
            >
              <span
                data-screen-name
                className="font-sans font-bold tracking-[0.12em]"
                style={{
                  fontSize: 'min(4cqw, 28px)',
                  color: 'color-mix(in oklch, var(--purple) 55%, white)',
                  textShadow:
                    '0 0 12px color-mix(in oklch, var(--purple) 90%, transparent)',
                }}
              >
                ISSA HAREB
              </span>
              <span
                className="font-mono uppercase tracking-[0.3em] text-white/60"
                style={{ fontSize: 'min(1.6cqw, 12px)' }}
              >
                Building intelligent systems
              </span>
            </div>
          </div>
        </div>

        {/* cinematic vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/70" />
        <div className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_220px_60px_rgba(0,0,0,0.85)]" />

        {/* signal sparks recurring through the flight — L.U.K.A.S. staying awake */}
        <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[8]" />

        {/* Opening plate — something is on screen the moment the page loads. */}
        <div
          data-intro
          className="pointer-events-none absolute inset-0 z-[15] flex flex-col items-center justify-center gap-4 px-6 text-center will-transform"
        >
          <span className="font-mono text-xs uppercase tracking-[0.35em] text-blue">
            Scroll to meet
          </span>
          <p
            className="text-balance font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl"
            style={{ textShadow: '0 2px 40px rgba(0,0,0,0.8)' }}
          >
            Let me introduce myself.
          </p>

          {/* Cursor-follow terminal reveal — a small window trailing the
              pointer, as if the footage is hiding a code editor just
              beneath it. Desktop-only (see effect above), fades with the
              rest of this plate the moment scrolling begins. */}
          <div
            ref={terminalRef}
            aria-hidden
            className="absolute left-0 top-0 w-[280px] rounded-xl border border-white/10 bg-black/75 p-3 text-left font-mono text-[11px] leading-relaxed text-white/70 opacity-0 shadow-[0_25px_70px_-20px_rgba(0,0,0,0.85)] backdrop-blur-md will-transform"
          >
            <div className="mb-2 flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400/60" />
              <span className="h-2 w-2 rounded-full bg-yellow-400/60" />
              <span className="h-2 w-2 rounded-full bg-green-400/60" />
            </div>
            <div>
              <span className="text-purple">const</span> agent = <span className="text-blue">new</span> Agent()
            </div>
            <div>
              <span className="text-purple">await</span> agent.<span className="text-blue">deploy</span>(<span className="text-emerald-300">&apos;production&apos;</span>)
            </div>
            <div className="text-white/35">// syncing knowledge graph…</div>
            <div>
              agent.memory.<span className="text-blue">write</span>(event)
              <span className="ml-0.5 animate-pulse">▌</span>
            </div>
          </div>
        </div>

        {/* "I AM" / "ISSA HAREB" — outline-only neon titles that sketch
            themselves out of flashing nodes dotted along the letterforms;
            a thin blue line then connects the nodes and the glow settles
            in, bleeding inward and outward. "I" forms first, then "AM",
            then "ISSA" below. */}
        <NeonLine
          ref={line1Ref}
          words={['I', 'AM']}
          className="pointer-events-none absolute inset-x-0 top-[9%] z-[16] h-[15vh] w-full font-sans font-bold sm:top-[11%] sm:h-[13vh]"
        />
        {/* Wrapped separately so the whole line can be slid + scaled down
            toward the monitor screen as it dissolves — the first ISSA
            becomes the ISSA of "ISSA HAREB" sitting in the screen preview
            rather than fading away independently of it. */}
        <div
          ref={nameWrapRef}
          className="pointer-events-none absolute inset-x-0 top-[24%] z-[16] sm:top-[25%]"
        >
          <NeonLine
            ref={line2Ref}
            words={['ISSA', 'HAREB']}
            className="h-[17vh] w-full px-4 font-sans font-bold sm:h-[15vh]"
          />
        </div>

        {/* Scene 2 — text phrases */}
        <div className="pointer-events-none absolute inset-0 z-[10] flex items-center justify-center px-6">
          {PHRASES.map((p, i) => (
            <p
              key={i}
              data-phrase
              className="absolute max-w-4xl text-balance text-center font-sans text-4xl font-semibold leading-tight tracking-tight text-foreground opacity-0 will-transform sm:text-6xl md:text-7xl"
              style={{ textShadow: '0 2px 40px rgba(0,0,0,0.7)' }}
            >
              {p.text}
            </p>
          ))}
        </div>

        {/* Final hand-off plate matching the hero start */}
        <div
          data-handoff
          className="pointer-events-none absolute inset-0 z-[30] opacity-0"
          style={{
            background:
              'radial-gradient(120% 80% at 50% 20%, color-mix(in oklch, var(--blue) 16%, transparent), #050505 60%)',
          }}
        />

        {/* scroll hint */}
        <div
          data-hint
          className="absolute bottom-10 left-1/2 z-[40] flex -translate-x-1/2 flex-col items-center gap-3 text-muted-foreground"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em]">
            Scroll
          </span>
          <span className="relative flex h-10 w-6 items-start justify-center rounded-full border border-white/20 p-1.5">
            <span className="h-2 w-1 animate-bounce rounded-full bg-white/70" />
          </span>
        </div>
      </div>
    </section>
  )
}
