'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

/**
 * Opening curtain, written from scratch for this site: a full-screen plate in
 * the page background cycles through greetings while the intro's first frames
 * actually preload (the percentage is real). When everything is ready a short
 * "Welcome." beat plays, then the curtain lifts with a curved lower edge and
 * hands over to the cinematic intro underneath.
 */
const GREETINGS = [
  'Hello',
  'Hallo',
  'Bonjour',
  'Ciao',
  'Olá',
  'こんにちは',
  '안녕하세요',
  'مرحبا',
  'Merhaba',
]

/** Assets that gate the reveal: poster + the intro's opening frames. */
const PRELOAD = [
  '/intro/cinematic-poster.jpg',
  ...Array.from(
    { length: 36 },
    (_, i) => `/intro/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`,
  ),
]

const MIN_SHOW_MS = 1800

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [greetIdx, setGreetIdx] = useState(0)
  const [percent, setPercent] = useState(0)
  const [welcome, setWelcome] = useState(false)
  const [gone, setGone] = useState(false)

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

    // Greeting carousel — quick at first, settling toward the end.
    let gi = 0
    const cycle = () => {
      gi++
      setGreetIdx(gi % GREETINGS.length)
    }
    const interval = window.setInterval(cycle, 200)

    // Reveal once everything is loaded AND the minimum beat has played.
    const tryReveal = () => {
      if (cancelled) return
      const ready = loadedCount >= PRELOAD.length
      const elapsed = performance.now() - started
      if (!ready || elapsed < MIN_SHOW_MS) {
        window.setTimeout(tryReveal, 120)
        return
      }
      window.clearInterval(interval)
      setWelcome(true)
      const root = rootRef.current
      if (!root) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.to(root, {
        yPercent: -100,
        delay: reduced ? 0.3 : 0.85,
        duration: reduced ? 0.3 : 1.1,
        ease: 'power3.inOut',
        onStart: () => {
          // curved lower edge while the curtain lifts
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
    window.setTimeout(tryReveal, 300)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      document.documentElement.classList.remove('preloading')
    }
  }, [])

  if (gone) return null

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-background"
    >
      {/* faint ambient glow so the plate isn't dead black */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 55%, color-mix(in oklch, var(--purple) 10%, transparent), transparent 75%)',
        }}
      />

      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        {welcome ? (
          <span className="font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
            Welcome<span className="text-purple">.</span>
          </span>
        ) : (
          <span
            key={greetIdx}
            className="font-sans text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
            style={{ animation: 'preloader-greet 200ms ease-out' }}
          >
            <span className="mr-3 inline-block h-2 w-2 -translate-y-1 rounded-full bg-purple align-middle" />
            {GREETINGS[greetIdx]}
          </span>
        )}
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Issa Hareb · Portfolio
        </span>
      </div>

      <span className="absolute bottom-8 right-8 font-mono text-sm tabular-nums text-muted-foreground">
        {percent}%
      </span>
    </div>
  )
}
