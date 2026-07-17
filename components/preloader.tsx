'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useLanguage, useT } from './language-context'

/**
 * Opening curtain. Before anything else, a language picker (DE/EN) — the
 * choice is remembered (localStorage) so returning visitors skip straight
 * to the loading sequence. Once a language is known: a mouse-chasing
 * shimmer ring, a drifting tagline field behind it, and a fast percentage
 * count — which, at 100 %, triggers a CSS clip-path wipe (right → left)
 * that swaps "Loading 100 %" for "Willkommen"/"Welcome". A background
 * expansion layer then scale()-animates to swallow the screen (GPU-only,
 * zero layout reflow), before the overlay fades and reveals the hero
 * underneath.
 *
 * Two animation phases — both layout-stable:
 *   Phase 1 (wipe):      clip-path on loader-mask + matching translateX on
 *                        loader-cursor-track, same easing, started together
 *                        → cursor stays pixel-perfect at the wipe edge.
 *   Phase 2 (expansion): transform: scale() on a separate loader-expansion
 *                        layer — the UI text is never scaled.
 */

/** The cinematic intro's own <video preload="auto"> starts fetching the
 *  film the moment the page mounts beneath this overlay — only the poster
 *  needs to be guaranteed here so the intro canvas never flashes empty. */
const PRELOAD = ['/intro/cinematic-poster.jpg']

const MIN_SHOW_MS = 900
const PERCENT_DURATION = 2.2

export function Preloader() {
  const { lang, setLang } = useLanguage()
  const t = useT()
  const rootRef = useRef<HTMLDivElement>(null)
  const ovalRef = useRef<HTMLDivElement>(null)
  const expansionRef = useRef<HTMLDivElement>(null)
  const marqueeRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

  const [percent, setPercent] = useState(0)
  const [readyForWipe, setReadyForWipe] = useState(false)
  const [wipeStarted, setWipeStarted] = useState(false)
  const [exitStarted, setExitStarted] = useState(false)
  const [gone, setGone] = useState(false)
  const [exitScale, setExitScale] = useState(100)

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

  // Compute how far the expansion circle needs to scale to cover every
  // viewport corner — derived from viewport diagonal / circle size × 1.1.
  useLayoutEffect(() => {
    const el = expansionRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      const sourceSize = Math.max(Math.min(rect.width, rect.height), 1)
      const diagonal = Math.hypot(window.innerWidth, window.innerHeight)
      setExitScale((diagonal / sourceSize) * 1.1)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Kick off image preloads and the visual percentage tween — held until a
  // language is known (either just picked, or already resolved from a
  // returning visitor's stored preference), so the language gate always
  // shows before any loading progress starts.
  useEffect(() => {
    if (!lang) return
    document.documentElement.classList.add('preloading')
    let cancelled = false
    let loadedCount = 0

    for (const src of PRELOAD) {
      const img = new Image()
      const done = () => { if (!cancelled) loadedCount++ }
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
      if (loadedCount >= PRELOAD.length && visualProxy.p >= 100 && elapsed >= MIN_SHOW_MS) {
        if (!cancelled) setReadyForWipe(true)
        return
      }
      settle = window.setTimeout(tryStart, 80)
    }
    settle = window.setTimeout(tryStart, 200)

    // Two ambient sparks during the count — L.U.K.A.S. waking up, not a storm.
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
  }, [lang])

  // 600 ms hold at Loading 100 % → begin wipe.
  useEffect(() => {
    if (!readyForWipe) return
    const timer = window.setTimeout(() => setWipeStarted(true), 600)
    return () => window.clearTimeout(timer)
  }, [readyForWipe])

  // Wipe starts → big lightning spark + schedule fullscreen expansion.
  useEffect(() => {
    if (!wipeStarted) return
    lightningRef.current?.strike({
      intensity: 1.15,
      duration: 380,
      originX: 0.35 + Math.random() * 0.3,
      originY: 0.06 + Math.random() * 0.08,
      targetX: 0.35 + Math.random() * 0.3,
      targetY: 0.22 + Math.random() * 0.1,
    })
    // 1 000 ms wipe + 200 ms pause on Willkommen = 1 200 ms
    const timer = window.setTimeout(() => setExitStarted(true), 1200)
    return () => window.clearTimeout(timer)
  }, [wipeStarted])

  // Expansion started → fade root + unmount when transitions complete.
  useEffect(() => {
    if (!exitStarted) return
    // 800 ms expansion; root fades at 0.65 s delay + 0.25 s = 0.9 s.
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove('preloading')
      setGone(true)
    }, 950)
    return () => window.clearTimeout(timer)
  }, [exitStarted])

  if (gone) return null

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-white${exitStarted ? ' loader-root-exit' : ''}`}
    >
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
        <div className="preloader-marquee flex w-max items-center gap-16 whitespace-nowrap font-sans text-5xl font-bold tracking-tight text-black/60 sm:text-7xl">
          {[...t.preloader.taglines, ...t.preloader.taglines, ...t.preloader.taglines].map((tagline, i) => (
            <span key={i} className="flex items-center gap-16">
              {tagline}
              <span className="h-2 w-2 rounded-full bg-purple/70" />
            </span>
          ))}
        </div>
      </div>

      {/* signal sparks — L.U.K.A.S. waking up */}
      <LightningFlash
        ref={lightningRef}
        className="pointer-events-none absolute inset-0 z-[5]"
        blend="multiply"
      />

      {/* foreground oval — shimmer chases the pointer around its edge */}
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

          {!lang ? (
            /* Language gate — shown before any loading progress starts.
               Picking a language commits it to localStorage and only then
               does the percent/wipe sequence below begin. */
            <div className="relative z-[2] flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setLang('de')}
                className="rounded-full border border-white/15 px-4 py-2 font-sans text-sm font-semibold text-foreground transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:py-2.5 sm:text-lg"
              >
                Deutsch
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className="rounded-full border border-white/15 px-4 py-2 font-sans text-sm font-semibold text-foreground transition-colors hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:px-6 sm:py-2.5 sm:text-lg"
              >
                English
              </button>
            </div>
          ) : (
            /*
             * ── Wipe stage ────────────────────────────────────────────────
             *
             * loader-welcome (z-1)        "Willkommen" — always centered,
             *                             never moved, revealed by the wipe.
             * loader-mask    (z-2)        "Loading XX %" on a solid black bg —
             *                             clip-path: inset(0 0%→100% 0 0)
             *                             wipes it away right → left.
             * loader-cursor-track (z-3)  translateX(0→-100%) runs on the
             *                             same easing/duration as clip-path,
             *                             keeping the cursor pixel-perfect at
             *                             the wipe edge with zero JS per frame.
             *
             * ────────────────────────────────────────────────────────────── */
            <div className={`loader-stage${wipeStarted ? ' loader-wipe-active' : ''}`}>

              {/* layer 1 — Willkommen: never moves, revealed as mask wipes */}
              <div className="loader-welcome">
                <span className="font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl">
                  {t.preloader.welcome}
                </span>
              </div>

              {/* layer 2 — Loading XX %: solid-black bg clips away right → left */}
              <div className="loader-mask">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl">
                    {t.preloader.loading}
                  </span>
                  <span className="font-sans text-xl font-bold tabular-nums leading-none text-foreground sm:text-4xl">
                    {percent}
                    <span className="ml-1 text-purple">%</span>
                  </span>
                </div>
              </div>

              {/* layer 3 — cursor track: translateX mirrors clip-path progress */}
              <div className="loader-cursor-track" aria-hidden>
                <div className={`loader-cursor${!wipeStarted ? ' caret-blink' : ''}`} />
              </div>
            </div>
          )}
        </div>

        <span
          ref={captionRef}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 sm:text-xs"
        >
          {lang ? t.preloader.caption : t.preloader.chooseLanguage}
        </span>
        {lang && (
          <span className="max-w-[80vw] text-center font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400 sm:hidden">
            {t.preloader.pcHint}
          </span>
        )}
      </div>

      {/*
       * Expansion layer — a dark circle positioned at the oval's center that
       * scale()-animates to cover every viewport corner on exit.
       * Only `transform` is animated → GPU-composited, zero layout reflow.
       * The UI text (oval + caption) is a sibling, never a child — it is
       * NOT scaled.
       */}
      <div
        ref={expansionRef}
        aria-hidden
        className={`loader-expansion${exitStarted ? ' loader-exit' : ''}`}
        style={{ '--exit-scale': exitScale } as React.CSSProperties}
      />
    </div>
  )
}
