'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { LightningFlash, type LightningHandle } from './lightning-flash'

/**
 * Opening curtain. A mouse-chasing shimmer ring, a drifting tagline field
 * behind it, and a fast percentage count with a real blinking insertion
 * caret — which, at 100%, slides left across "Loading the film" and
 * rewrites it to "Willkommen" as it passes. A black ring then expands to
 * swallow the screen and fades away, revealing the hero already waiting
 * underneath.
 */
const TAGLINES = [
  'I build automations',
  'I build intelligent systems',
  'I ship on iPhone',
  'I build products end to end',
]

const PRELOAD = [
  '/intro/cinematic-poster.jpg',
  ...Array.from(
    { length: 36 },
    (_, i) => `/intro/frames/frame-${String(i + 1).padStart(3, '0')}.jpg`,
  ),
]

const MIN_SHOW_MS = 900
const PERCENT_DURATION = 2.2

export function Preloader() {
  const ovalRef = useRef<HTMLDivElement>(null)
  const blackRef = useRef<HTMLDivElement>(null)
  const caretRef = useRef<HTMLSpanElement>(null)
  const percentGroupRef = useRef<HTMLSpanElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const oldLabelRef = useRef<HTMLSpanElement>(null)
  const newLabelRef = useRef<HTMLSpanElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

  const [percent, setPercent] = useState(0)
  const [gone, setGone] = useState(false)

  const angle = useMotionValue(0)
  const springAngle = useSpring(angle, { stiffness: 55, damping: 16, mass: 0.6 })
  const shimmerBg = useTransform(
    springAngle,
    (a) =>
      `conic-gradient(from ${a}deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.95) 16deg, color-mix(in oklch, var(--purple) 70%, white) 34deg, transparent 58deg, transparent 360deg)`,
  )

  // Shimmer chases the pointer; idles into a slow auto-rotation without one.
  useEffect(() => {
    const oval = ovalRef.current
    if (!oval) return
    let raf = 0
    let autoAngle = 0
    let lastPointer = -Infinity
    const onMove = (e: PointerEvent) => {
      lastPointer = performance.now()
      const r = oval.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90
      angle.set(deg)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    const tick = () => {
      if (performance.now() - lastPointer > 1400) {
        autoAngle = (autoAngle + 0.5) % 360
        angle.set(autoAngle)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [angle])

  useEffect(() => {
    document.documentElement.classList.add('preloading')
    let cancelled = false
    let loadedCount = 0

    for (const src of PRELOAD) {
      const img = new Image()
      const done = () => {
        if (!cancelled) loadedCount++
      }
      img.onload = done
      img.onerror = done
      img.src = src
    }

    const visualProxy = { p: 0 }
    const tween = gsap.to(visualProxy, {
      p: 100,
      duration: PERCENT_DURATION,
      ease: 'power1.inOut',
      onUpdate: () => {
        if (!cancelled) setPercent(Math.round(visualProxy.p))
      },
    })

    const started = performance.now()
    let settle: number | undefined
    const tryStart = () => {
      if (cancelled) return
      const elapsed = performance.now() - started
      const realReady = loadedCount >= PRELOAD.length
      if (realReady && visualProxy.p >= 100 && elapsed >= MIN_SHOW_MS) {
        beginTransition()
        return
      }
      settle = window.setTimeout(tryStart, 80)
    }
    settle = window.setTimeout(tryStart, 200)

    // Two ambient sparks during the climb — L.U.K.A.S. waking up, not a
    // storm — plus a larger one at the "Willkommen" moment (in beginTransition).
    // Kept in the upper third of the screen so they read clearly instead of
    // getting clipped behind the opaque oval.
    const wake1 = window.setTimeout(() => {
      lightningRef.current?.strike({
        intensity: 0.7,
        originX: 0.15 + Math.random() * 0.2,
        originY: 0.05 + Math.random() * 0.08,
        targetX: 0.15 + Math.random() * 0.2,
        targetY: 0.2 + Math.random() * 0.1,
      })
    }, 600)
    const wake2 = window.setTimeout(() => {
      lightningRef.current?.strike({
        intensity: 0.8,
        originX: 0.65 + Math.random() * 0.2,
        originY: 0.05 + Math.random() * 0.08,
        targetX: 0.65 + Math.random() * 0.2,
        targetY: 0.2 + Math.random() * 0.1,
      })
    }, 1500)

    return () => {
      cancelled = true
      tween.kill()
      if (settle) window.clearTimeout(settle)
      window.clearTimeout(wake1)
      window.clearTimeout(wake2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function beginTransition() {
    const caret = caretRef.current
    const percentGroup = percentGroupRef.current
    const oldLabel = oldLabelRef.current
    const newLabel = newLabelRef.current
    const black = blackRef.current
    const oval = ovalRef.current
    const marquee = marqueeRef.current
    if (!caret || !percentGroup || !oldLabel || !newLabel || !black) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const travel = caret.getBoundingClientRect().left - oldLabel.getBoundingClientRect().left

    // Take the percent group out of the flex flow at its current on-screen
    // spot before fading it — otherwise it keeps occupying layout width
    // while invisible, and "Willkommen" ends up sitting left-of-center in
    // the pill instead of centered once it's the only thing left.
    const parent = percentGroup.offsetParent as HTMLElement | null
    if (parent) {
      const pr = percentGroup.getBoundingClientRect()
      const or = parent.getBoundingClientRect()
      gsap.set(percentGroup, {
        position: 'absolute',
        left: pr.left - or.left,
        top: pr.top - or.top,
      })
    }

    caret.classList.remove('caret-blink')
    gsap.set(caret, { opacity: 1 })
    lightningRef.current?.strike({
      intensity: 1.15,
      duration: 380,
      originX: 0.35 + Math.random() * 0.3,
      originY: 0.06 + Math.random() * 0.08,
      targetX: 0.35 + Math.random() * 0.3,
      targetY: 0.22 + Math.random() * 0.1,
    })

    const tl = gsap.timeline()
    const rewrite = { p: 0 }
    tl.to(
      rewrite,
      {
        p: 1,
        duration: reduced ? 0.01 : 1.1,
        ease: 'power2.inOut',
        onUpdate: () => {
          const p = rewrite.p
          gsap.set(caret, { x: -travel * p })
          // Both wipes track the caret's actual right-to-left motion: the
          // old label erases starting from its right edge (clipped via the
          // right inset, growing as p increases) instead of its left edge,
          // and the new label reveals growing leftward from the right edge
          // it shares with the caret's path.
          gsap.set(oldLabel, { clipPath: `inset(0 ${p * 100}% 0 0)` })
          gsap.set(newLabel, { clipPath: `inset(0 0 0 ${(1 - p) * 100}%)` })
        },
      },
      0,
    ).to(percentGroup, { opacity: 0, duration: reduced ? 0.01 : 0.3, ease: 'power1.in' }, 0.15)

    tl.to({}, { duration: reduced ? 0 : 0.45 })

    tl.set(black, { display: 'block' })
      .to(
        [oval, marquee, caret, oldLabel, newLabel, captionRef.current].filter(Boolean),
        { opacity: 0, duration: reduced ? 0.01 : 0.22, ease: 'power1.in' },
        '<',
      )
      .to(
        black,
        {
          width: '300vmax',
          height: '300vmax',
          borderRadius: 0,
          duration: reduced ? 0.05 : 0.75,
          ease: 'power3.in',
        },
        '<',
      )
      .to(
        black,
        {
          opacity: 0,
          duration: reduced ? 0.05 : 0.5,
          ease: 'power2.out',
          onComplete: () => {
            document.documentElement.classList.remove('preloading')
            setGone(true)
          },
        },
        reduced ? '>' : '-=0.32',
      )
  }

  if (gone) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 45% at 50% 50%, color-mix(in oklch, var(--purple) 12%, transparent), transparent 75%)',
        }}
      />

      {/* drifting taglines behind the oval */}
      <div
        ref={marqueeRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.14]"
      >
        <div className="preloader-marquee flex w-max items-center gap-16 whitespace-nowrap font-sans text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
          {[...TAGLINES, ...TAGLINES, ...TAGLINES].map((t, i) => (
            <span key={i} className="flex items-center gap-16">
              {t}
              <span className="h-2 w-2 rounded-full bg-purple/70" />
            </span>
          ))}
        </div>
      </div>

      {/* signal sparks — L.U.K.A.S. waking up */}
      <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[5]" />

      {/* foreground oval, shimmer chasing the pointer around its edge —
          the loading label and percentage live inside it */}
      <div className="relative z-10 flex flex-col items-center gap-6">
      <div
        ref={ovalRef}
        className="relative flex h-[104px] w-[90vw] max-w-[620px] items-center justify-center rounded-full bg-black sm:h-[140px]"
      >
        <div className="absolute inset-0 rounded-full border border-white/10 bg-black [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06),0_30px_60px_-20px_rgba(0,0,0,0.9)]" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.04] to-transparent" />
        <motion.div
          aria-hidden
          className="absolute -inset-px rounded-full p-px"
          style={{
            background: shimmerBg,
            WebkitMask:
              'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* label / percent row — the caret travels left across it at 100% */}
        <div
          ref={rowRef}
          className="relative z-10 flex items-center justify-center gap-3 px-6 sm:gap-4"
        >
          <div className="relative h-8 w-[150px] shrink-0 sm:h-11 sm:w-[220px]">
            <span
              ref={oldLabelRef}
              className="absolute inset-y-0 right-0 flex items-center whitespace-nowrap font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl"
            >
              Loading the film
            </span>
            <span
              ref={newLabelRef}
              className="absolute inset-y-0 right-0 flex items-center whitespace-nowrap font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl"
              style={{ clipPath: 'inset(0 0 0 100%)' }}
            >
              Willkommen
            </span>
          </div>
          <span
            ref={percentGroupRef}
            className="relative flex items-center font-sans text-xl font-bold tabular-nums text-foreground sm:text-4xl"
          >
            {percent}
            <span
              ref={caretRef}
              className="caret-blink ml-1 inline-block h-[0.85em] w-[3px] translate-y-[1px] bg-white align-middle sm:w-[4px]"
            />
            <span className="ml-1 text-purple">%</span>
          </span>
        </div>
      </div>

      <span
        ref={captionRef}
        className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:text-xs"
      >
        Issa Hareb · Portfolio
      </span>
      </div>

      {/* expanding blackout — hidden until the transition begins */}
      <div
        ref={blackRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 hidden rounded-full bg-background"
        style={{ width: 132, height: 132, transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}
