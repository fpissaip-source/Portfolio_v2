'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PixelText, type PixelTextHandle } from './pixel-text'

gsap.registerPlugin(ScrollTrigger)

/**
 * Scroll-scrubbed cinematic intro driven by the user's own 5s clip, exported to
 * an image sequence (/public/intro/frames/f_001.jpg ... f_121.jpg) and drawn on
 * a <canvas>. This is the Apple-style approach: HTML5 <video> currentTime
 * seeking is unreliable while scrolling (it freezes on the first frame on iOS
 * Safari), whereas swapping decoded images on a canvas scrubs smoothly on every
 * device, including iPhone.
 */
const FRAME_COUNT = 121
const framePath = (i: number) =>
  `/intro/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`
const POSTER_SRC = '/intro/cinematic-poster.jpg'

type PhraseAnim = 'blurScale' | 'wipe' | 'flip3D' | 'maskUp' | 'zoomOut'

const PHRASES: { text: string; anim: PhraseAnim }[] = [
  { text: 'Building Intelligent Systems', anim: 'blurScale' },
  { text: 'AI Automation', anim: 'wipe' },
  { text: 'Full Stack Development', anim: 'flip3D' },
  { text: 'Turning Ideas Into Products', anim: 'maskUp' },
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const iRef = useRef<PixelTextHandle>(null)
  const amRef = useRef<PixelTextHandle>(null)

  // Preload frames + draw the current one based on scroll progress.
  useEffect(() => {
    const root = rootRef.current
    const canvas = canvasRef.current
    if (!root || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const images: HTMLImageElement[] = new Array(FRAME_COUNT)
    const loaded = new Array<boolean>(FRAME_COUNT).fill(false)
    let currentIndex = -1

    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (!cw || !ch || !img.naturalWidth) return
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const dw = img.naturalWidth * scale
      const dh = img.naturalHeight * scale
      const dx = (cw - dw) / 2
      const dy = (ch - dh) / 2
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, dx, dy, dw, dh)
    }

    // Render the closest already-loaded frame to the requested index so we
    // never blank out while frames are still streaming in.
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

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const idx = currentIndex >= 0 ? currentIndex : 0
      renderIndex(idx)
    }

    // Kick off loading. Draw as soon as frame 0 arrives for an instant image.
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

    const ctxAnim = gsap.context(() => {
      const q = gsap.utils.selector(root)
      const st = {
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: prefersReduced ? (false as const) : 0.8,
      }

      // Frame scrubbing — the flythrough completes at ~90% so the last stretch
      // is reserved for the screen take-over.
      let raf = 0
      ScrollTrigger.create({
        ...st,
        onUpdate: (self) => {
          const p = Math.min(self.progress / 0.9, 1)
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

      // End sequence — the flythrough hands off to the real studio photo
      // (Bild 1) BEFORE the video reaches its green-screen frames, so the raw
      // green-screen monitor is never seen. Then we dolly toward the monitor,
      // cross-fade into the closer monitor shot (Bild 2), and finally punch
      // fast into the screen to land on the actual website.

      // Bild 1 fades in over the video, covering the green-screen frames.
      // Snappy fade so the cross-over moment stays clean.
      tl.fromTo(
        q('[data-room]'),
        { opacity: 0, scale: 1.05 },
        { opacity: 1, duration: 0.035, ease: 'power2.out' },
        0.6,
      )
        // Smooth dolly-in toward the monitor in the wide shot.
        .to(
          q('[data-room]'),
          { scale: 1.85, duration: 0.24, ease: 'power1.in' },
          0.66,
        )
        // Cross-fade into the close monitor shot (Bild 2), continuing the push.
        .fromTo(
          q('[data-monitor]'),
          { opacity: 0, scale: 1.02 },
          { opacity: 1, duration: 0.05, ease: 'power1.inOut' },
          0.82,
        )
        // Fast zoom straight into the screen.
        .to(
          q('[data-monitor]'),
          { scale: 2.7, duration: 0.09, ease: 'power3.in' },
          0.88,
        )
        // Land on the real site.
        .to(q('[data-handoff]'), { opacity: 1, duration: 0.05 }, 0.96)

      // Scene 2 — text phrases, each with its own premium animation.
      const phrases = q('[data-phrase]')
      phrases.forEach((el, i) => {
        const { from, exit } = PHRASE_ANIMS[PHRASES[i].anim]
        const start = 0.08 + i * 0.108
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
          { ...settled, duration: 0.055, ease: 'power3.out' },
          start,
        ).to(el, { ...exit, duration: 0.05, ease: 'power2.in' }, start + 0.062)
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
          duration: 0.38,
          ease: 'none',
          onUpdate: () => iRef.current?.setProgress(iProxy.p),
        },
        0.05,
      )

      // Giant pixel "AM" — same dusting life behind the final phrase; finishes
      // dusting away before Bild 1 covers the screen.
      const amProxy = { p: 0 }
      tl.to(
        amProxy,
        {
          p: 1,
          duration: 0.14,
          ease: 'none',
          onUpdate: () => amRef.current?.setProgress(amProxy.p),
        },
        0.4,
      )

      // "Issa Hareb" lights up on the studio wall in the photo, then recedes as
      // the camera pushes toward the monitor.
      tl.fromTo(
        q('[data-wall-name]'),
        { opacity: 0, scale: 0.96, yPercent: -8, filter: 'blur(16px)' },
        { opacity: 1, scale: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.05, ease: 'power2.out' },
        0.63,
      ).to(
        q('[data-wall-name]'),
        { opacity: 0, scale: 1.1, filter: 'blur(10px)', duration: 0.05, ease: 'power2.in' },
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

  return (
    <section
      ref={rootRef}
      aria-label="Cinematic introduction"
      className="relative h-[600vh] bg-background"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full origin-center will-transform"
          style={{
            backgroundImage: `url(${POSTER_SRC})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

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

        {/* Giant "Thanos snap" pixel letters behind the phrases — they
            assemble from dust, hold, then dust away, spelling "I" then "AM"
            and leading into the name reveal. */}
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

        {/* Name reveal on the studio wall — lights up bright above the monitor
            as the headline appears, then is swallowed by the zoom. */}
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

        {/* Scene 5a — the real studio photo (Bild 1). Fades in over the video
            before the green-screen frames, then the camera dollies toward the
            monitor. transform-origin sits on the monitor. */}
        <img
          data-room
          src="/intro/room-wide.jpg"
          alt="Issa Hareb at his studio desk, the monitor reading “i Build intelligent Systems”"
          className="pointer-events-none absolute inset-0 z-[18] h-full w-full object-cover opacity-0 will-transform"
          style={{ transformOrigin: '50% 58%' }}
        />

        {/* Scene 5b — the close monitor shot (Bild 2). Cross-fades in to
            continue the zoom, then punches fast into the screen. */}
        <img
          data-monitor
          src="/intro/monitor-zoom.jpg"
          alt="Close-up of the monitor reading “Build intelligent Systems”"
          className="pointer-events-none absolute inset-0 z-[19] h-full w-full object-cover opacity-0 will-transform"
          style={{ transformOrigin: '50% 44%' }}
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
