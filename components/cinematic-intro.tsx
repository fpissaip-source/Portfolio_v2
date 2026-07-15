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
 * The final shot ends on an ultrawide monitor showing a solid chroma-green
 * screen. We detect the green rectangle in the last frame at runtime, project
 * the website preview into it, and scale the whole stage so the monitor
 * swallows the viewport — that zoom IS the transition onto the real site.
 */
const FRAME_COUNT = 182
const framePath = (i: number) =>
  `/intro/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`
const POSTER_SRC = '/intro/cinematic-poster.jpg'

/** Scroll share reserved for the flythrough; the rest is the monitor zoom. */
const FLIGHT_END = 0.82

type PhraseAnim = 'blurScale' | 'wipe' | 'flip3D' | 'maskUp' | 'zoomOut'

const PHRASES: { text: string; anim: PhraseAnim }[] = [
  { text: 'Building Intelligent Systems', anim: 'blurScale' },
  { text: 'AI Automation', anim: 'wipe' },
  { text: 'Full Stack Development', anim: 'flip3D' },
  { text: 'Built entirely on a phone. No PC. No laptop.', anim: 'maskUp' },
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

/** Bounding box of the chroma-green screen in the final frame (image px). */
function detectGreenRect(img: HTMLImageElement): {
  x: number
  y: number
  w: number
  h: number
} | null {
  const c = document.createElement('canvas')
  // Downsample for speed; bbox is scaled back up.
  const scale = Math.min(1, 480 / img.naturalWidth)
  c.width = Math.round(img.naturalWidth * scale)
  c.height = Math.round(img.naturalHeight * scale)
  const cx = c.getContext('2d', { willReadFrequently: true })
  if (!cx) return null
  cx.drawImage(img, 0, 0, c.width, c.height)
  const { data } = cx.getImageData(0, 0, c.width, c.height)
  let minX = c.width
  let minY = c.height
  let maxX = -1
  let maxY = -1
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      const i = (y * c.width + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      if (g > 120 && g > r * 1.6 && g > b * 1.6) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0 || maxX - minX < c.width * 0.08) return null
  return {
    x: minX / scale,
    y: minY / scale,
    w: (maxX - minX + 1) / scale,
    h: (maxY - minY + 1) / scale,
  }
}

export function CinematicIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const iRef = useRef<PixelTextHandle>(null)
  const amRef = useRef<PixelTextHandle>(null)

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
    // Green-screen rect of the LAST frame, in image px; resolved async.
    let greenRect: { x: number; y: number; w: number; h: number } | null = null

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

    // Keep the website preview glued to the monitor's green screen and set
    // the zoom origin so scaling the stage dives straight into the screen.
    const placeScreen = () => {
      const last = images[FRAME_COUNT - 1]
      if (!greenRect || !last || !loaded[FRAME_COUNT - 1]) return
      const { scale, dx, dy } = coverTransform(last)
      const x = dx + greenRect.x * scale
      const y = dy + greenRect.y * scale
      const w = greenRect.w * scale
      const h = greenRect.h * scale
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

    // Kick off loading. Draw as soon as frame 0 arrives; detect the green
    // screen as soon as the last frame arrives.
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
        if (i === FRAME_COUNT - 1) {
          greenRect = detectGreenRect(img)
          placeScreen()
        }
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

      // "Issa Hareb" glows over the room once the camera has arrived inside,
      // then recedes as the camera pushes toward the monitor.
      tl.fromTo(
        q('[data-wall-name]'),
        { opacity: 0, scale: 0.96, yPercent: -8, filter: 'blur(16px)' },
        { opacity: 1, scale: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.05, ease: 'power2.out' },
        0.58,
      ).to(
        q('[data-wall-name]'),
        { opacity: 0, scale: 1.1, filter: 'blur(10px)', duration: 0.05, ease: 'power2.in' },
        0.68,
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

        {/* Giant "Thanos snap" pixel letters behind the phrases. */}
        <PixelText
          ref={iRef}
          text="I"
          heightFactor={0.82}
          widthFactor={0.5}
          className="pointer-events-none absolute inset-0 z-[6] h-full w-full"
        />
        <PixelText
          ref={amRef}
          text="AM"
          heightFactor={0.52}
          widthFactor={0.82}
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

        {/* Name reveal — lights up over the room, then is swallowed by the zoom. */}
        <div
          data-wall-name
          className="pointer-events-none absolute inset-x-0 top-[6%] z-[22] flex justify-center opacity-0 will-transform"
        >
          <span
            className="select-none px-6 text-center font-sans text-5xl font-bold tracking-[0.14em] sm:text-7xl md:text-8xl"
            style={{
              color: 'color-mix(in oklch, var(--purple) 55%, white)',
              textShadow:
                '0 0 18px color-mix(in oklch, var(--purple) 95%, transparent), 0 0 44px color-mix(in oklch, var(--purple) 80%, transparent), 0 0 90px color-mix(in oklch, var(--purple) 55%, transparent)',
            }}
          >
            Issa Hareb
          </span>
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
