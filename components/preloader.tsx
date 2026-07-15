'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * Opening curtain, written from scratch for this site. Classic loader
 * grammar - a large live percentage, a drifting marquee of roles, and a
 * click-to-enter moment - implemented in our own design language. The
 * percentage is real: it tracks preloading of the intro's opening frames.
 */
const ROLES = [
  'AI Engineer',
  'Full-Stack Developer',
  'Automation Architect',
  'Built on iPhone',
]

const PRELOAD = [
  '/intro/cinematic-poster.jpg',
  ...Array.from(
    { length: 36 },
    (_, i) => `/intro/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`,
  ),
]

const MIN_SHOW_MS = 1400

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [percent, setPercent] = useState(0)
  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState(false)

  // preload + progress
  useEffect(() => {
    document.documentElement.classList.add('preloading')
    const started = performance.now()
    let loadedCount = 0
    let cancelled = false

    for (const src of PRELOAD) {
      const img = new Image()
      const done = () => {
        if (cancelled) return
        loadedCount++
        setPercent(Math.round((loadedCount / PRELOAD.length) * 100))
      }
      img.onload = done
      img.onerror = done
      img.src = src
    }

    const tryReady = () => {
      if (cancelled) return
      const elapsed = performance.now() - started
      if (loadedCount >= PRELOAD.length && elapsed >= MIN_SHOW_MS) {
        setReady(true)
        return
      }
      window.setTimeout(tryReady, 120)
    }
    window.setTimeout(tryReady, 250)

    return () => {
      cancelled = true
      document.documentElement.classList.remove('preloading')
    }
  }, [])

  const enter = () => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.to(root, {
      yPercent: -100,
      duration: reduced ? 0.3 : 1.05,
      ease: 'power3.inOut',
      onStart: () => {
        gsap.to(root, {
          borderBottomLeftRadius: '50% 12vh',
          borderBottomRightRadius: '50% 12vh',
          duration: 0.5,
          ease: 'power2.out',
        })
      },
      onComplete: () => {
        document.documentElement.classList.remove('preloading')
        setGone(true)
      },
    })
  }

  // once ready, also allow keyboard / wheel to enter
  useEffect(() => {
    if (!ready || gone) return
    const go = () => enter()
    window.addEventListener('wheel', go, { once: true, passive: true })
    window.addEventListener('touchmove', go, { once: true, passive: true })
    window.addEventListener('keydown', go, { once: true })
    return () => {
      window.removeEventListener('wheel', go)
      window.removeEventListener('touchmove', go)
      window.removeEventListener('keydown', go)
    }
  }, [ready, gone])

  if (gone) return null

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-background"
    >
      {/* faint ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 55%, color-mix(in oklch, var(--purple) 10%, transparent), transparent 75%)',
        }}
      />

      {/* drifting marquee of roles */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[18%] overflow-hidden opacity-25">
        <div className="preloader-marquee flex w-max items-center gap-10 whitespace-nowrap font-sans text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {[...ROLES, ...ROLES, ...ROLES].map((r, i) => (
            <span key={i} className="flex items-center gap-10">
              {r}
              <span className="h-1.5 w-1.5 rounded-full bg-purple/70" />
            </span>
          ))}
        </div>
      </div>

      {/* center: enter moment */}
      <div className="relative flex flex-col items-center gap-4 px-6 text-center">
        {ready ? (
          <button
            onClick={enter}
            className="group relative rounded-full border border-white/15 px-10 py-4 font-sans text-xl font-semibold tracking-tight text-foreground transition-colors hover:border-purple/60 sm:text-2xl"
          >
            <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 [box-shadow:0_0_50px_-8px_var(--purple)]" />
            Enter
            <span className="text-purple">.</span>
          </button>
        ) : (
          <span className="font-sans text-xl font-semibold tracking-tight text-muted-foreground sm:text-2xl">
            Loading the film
            <span className="text-purple">…</span>
          </span>
        )}
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Issa Hareb · Portfolio
        </span>
      </div>

      {/* large live percentage, bottom left */}
      <div className="pointer-events-none absolute bottom-6 left-6 flex items-end gap-2 sm:bottom-10 sm:left-10">
        <span className="font-sans text-7xl font-bold leading-none tracking-tight text-foreground/90 tabular-nums sm:text-9xl">
          {percent}
        </span>
        <span className="pb-2 font-mono text-base text-purple sm:pb-3">%</span>
      </div>
    </div>
  )
}
