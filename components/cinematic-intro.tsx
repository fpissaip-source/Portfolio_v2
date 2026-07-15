'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PixelText, type PixelTextHandle } from './pixel-text'

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
  const iRef = useRef<PixelTextHandle>(null)
  const amRef = useRef<PixelTextHandle>(null)
  const nameRef = useRef<PixelTextHandle>(null)

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
          if (index === currentIndex) return
          cancelAnimationFrame(raf)
          raf = requestAnimationFrame(() => renderIndex(index))
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

      // Giant pixel "I" — assembles from dust, holds behind phrases 1–4, then
      // dusts away (Thanos snap). A single 0→1 proxy runs its whole life.
      const iProxy = { p: 0 }
      tl.to(
        iProxy,
        {
          p: 1,
          duration: 0.36,
          ease: 'none',
          onUpdate: () => iRef.current?.setProgress(iProxy.p),
        },
        0.05,
      )

      // Giant pixel "AM" — same dusting life behind the final phrase.
      const amProxy = { p: 0 }
      tl.to(
        amProxy,
        {
          p: 1,
          duration: 0.13,
          ease: 'none',
          onUpdate: () => amRef.current?.setProgress(amProxy.p),
        },
        0.38,
      )

      // "Issa Hareb" assembles centered over the room once the camera has
      // arrived inside — same pixel-dust language as the I/AM letters — then
      // dusts away as the camera pushes toward the monitor.
      const nameProxy = { p: 0 }
      tl.to(
        nameProxy,
        {
          p: 1,
          duration: 0.17,
          ease: 'none',
          onUpdate: () => nameRef.current?.setProgress(nameProxy.p),
        },
        0.57,
      )
    }, root)

    // Ensure ScrollTrigger measures correctly once mounted.
    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('resize', sizeCanvas)
      ctxAnim.revert()
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

        {/* Pixel-dust letters behind the phrases. */}
        <PixelText
          ref={iRef}
          text="I"
          heightFactor={0.42}
          widthFactor={0.4}
          className="pointer-events-none absolute inset-0 z-[6] h-full w-full"
        />
        <PixelText
          ref={amRef}
          text="AM"
          heightFactor={0.3}
          widthFactor={0.56}
          className="pointer-events-none absolute inset-0 z-[6] h-full w-full"
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

        {/* Name reveal — same pixel-dust style, centered, swallowed by the zoom. */}
        <PixelText
          ref={nameRef}
          text="ISSA HAREB"
          heightFactor={0.14}
          widthFactor={0.86}
          className="pointer-events-none absolute inset-0 z-[22] h-full w-full"
        />

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
