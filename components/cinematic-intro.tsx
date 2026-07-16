'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ShimmerTitle, type ShimmerTitleHandle } from './shimmer-title'
import { LightningFlash, type LightningHandle } from './lightning-flash'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-scrubbed cinematic intro. A generated 3-shot flythrough (city →
 * glowing purple window → room → green-screen monitor) is exported as an image
 * sequence and drawn on a <canvas> — the Apple-style approach, since <video>
 * currentTime seeking freezes on iOS Safari while scrolling.
 *
 * The final shot ends on an ultrawide monitor. The frames are pre-processed so
 * the screen carries the website's dark blue→purple tones; SCREEN_RECT below is
 * the measured screen area of the last frame (image px). The website preview is
 * projected into it and the whole stage scales until the monitor swallows the
 * viewport — that zoom IS the transition onto the real site.
 */
const FRAME_COUNT = 182
const framePath = (i: number) =>
  `/intro/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`
const POSTER_SRC = '/intro/cinematic-poster.jpg'

/** Scroll share reserved for the flythrough; the rest is the monitor zoom. */
const FLIGHT_END = 0.82

/** Monitor screen area in the last frame, in image pixels (1536×864). */
const SCREEN_RECT = { x: 0, y: 95, w: 1536, h: 660 }

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
  const screenRef = useRef<HTMLDivElement>(null)
  const iamRef = useRef<ShimmerTitleHandle>(null)
  const nameRef = useRef<ShimmerTitleHandle>(null)
  const lightningRef = useRef<LightningHandle>(null)

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

    const images: HTMLImageElement[] = new Array(FRAME_COUNT)
    const loaded = new Array<boolean>(FRAME_COUNT).fill(false)
    let currentIndex = -1

    // object-fit: cover mapping of the frame onto the canvas.
    const coverTransform = (img: HTMLImageElement) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      return {
        scale,
        dx: (cw - img.naturalWidth * scale) / 2,
        dy: (ch - img.naturalHeight * scale) / 2,
      }
    }

    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (!cw || !ch || !img.naturalWidth) return
      const { scale, dx, dy } = coverTransform(img)
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale)
    }

    // Render the closest already-loaded frame so we never blank out while
    // frames are still streaming in.
    const renderIndex = (index: number) => {
      const clamped = Math.max(0, Math.min(FRAME_COUNT - 1, index))
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

    // Keep the website preview glued to the monitor screen and set the zoom
    // origin so scaling the stage dives straight into the screen.
    const placeScreen = () => {
      const last = images[FRAME_COUNT - 1]
      if (!last || !loaded[FRAME_COUNT - 1]) return
      const { scale, dx, dy } = coverTransform(last)
      const x = dx + SCREEN_RECT.x * scale
      const y = dy + SCREEN_RECT.y * scale
      const w = SCREEN_RECT.w * scale
      const h = SCREEN_RECT.h * scale
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
      renderIndex(currentIndex >= 0 ? currentIndex : 0)
      placeScreen()
    }

    // Kick off loading. Draw as soon as frame 0 arrives; place the website
    // preview as soon as the last frame arrives.
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
        if (i === FRAME_COUNT - 1) placeScreen()
      }
      img.src = framePath(i)
      images[i] = img
    }

    window.addEventListener('resize', sizeCanvas)

    const ctxAnim = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const st = {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: prefersReduced ? (false as const) : 0.8,
      }

      // Frame scrubbing — the flythrough completes at FLIGHT_END; the last
      // stretch is reserved for the dive into the monitor.
      let raf = 0
      ScrollTrigger.create({
        ...st,
        onUpdate: (self) => {
          const p = Math.min(self.progress / FLIGHT_END, 1)
          const index = Math.round(p * (FRAME_COUNT - 1))
          if (index !== currentIndex) {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => renderIndex(index))
          }
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

      // "I AM" then "ISSA HAREB" — a single sentence assembling at the top:
      // "I AM" writes in first and holds fully lit (ShimmerTitle's own life
      // cycle only fades past p=0.78, so parking each proxy at 0.6 keeps it
      // written-and-held), then "ISSA HAREB" writes in below it and holds
      // too — both parts stay on screen together until a shared dissolve
      // right at the end of the flight, instead of each fading on its own.
      const HOLD = 0.6
      const iamProxy = { p: 0 }
      const nameProxy = { p: 0 }
      tl.to(
        iamProxy,
        {
          p: HOLD,
          duration: 0.16,
          ease: 'none',
          onUpdate: () => iamRef.current?.setProgress(iamProxy.p),
        },
        0.04,
      )
      tl.to(
        nameProxy,
        {
          p: HOLD,
          duration: 0.16,
          ease: 'none',
          onUpdate: () => nameRef.current?.setProgress(nameProxy.p),
        },
        0.22,
      )
      // Shared dissolve — both parts fade and blur away together.
      tl.to(
        iamProxy,
        {
          p: 1,
          duration: 0.08,
          ease: 'none',
          onUpdate: () => iamRef.current?.setProgress(iamProxy.p),
        },
        0.72,
      )
      tl.to(
        nameProxy,
        {
          p: 1,
          duration: 0.08,
          ease: 'none',
          onUpdate: () => nameRef.current?.setProgress(nameProxy.p),
        },
        0.72,
      )
    }, root)

    // Ensure ScrollTrigger measures correctly once mounted.
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('resize', sizeCanvas)
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
        </div>

        {/* "I AM" / "ISSA HAREB" — a persistent title stacked at the top of
            the screen. Each part writes in, then holds fully lit while the
            next writes below it; both stay until a shared dissolve at the
            very end of the flight. */}
        <ShimmerTitle
          ref={iamRef}
          text="I AM"
          className="pointer-events-none absolute inset-x-0 top-[9%] z-[16] flex h-[15vh] w-full items-center justify-center text-center font-sans text-4xl font-bold tracking-tight sm:top-[11%] sm:h-[13vh] sm:text-6xl md:text-7xl"
        />
        <ShimmerTitle
          ref={nameRef}
          text="ISSA HAREB"
          className="pointer-events-none absolute inset-x-0 top-[24%] z-[16] flex h-[17vh] w-full items-center justify-center px-4 text-center font-sans text-4xl font-bold tracking-tight sm:top-[25%] sm:h-[15vh] sm:text-7xl md:text-9xl"
        />

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
