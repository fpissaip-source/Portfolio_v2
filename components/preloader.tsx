'use client'

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { gsap } from 'gsap'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useLanguage, useT } from './language-context'

const PRELOAD = ['/intro/cinematic-poster.jpg']
const MIN_SHOW_MS = 900
const PERCENT_DURATION = 1

export function Preloader() {
  const { lang } = useLanguage()
  const t = useT()
  const rootRef = useRef<HTMLDivElement>(null)
  const ovalRef = useRef<HTMLDivElement>(null)
  const captionRef = useRef<HTMLSpanElement>(null)
  const lightningRef = useRef<LightningHandle>(null)
  const textRowRef = useRef<HTMLDivElement>(null)

  const [percent, setPercent] = useState(0)
  const [cursorOffset, setCursorOffset] = useState<number | null>(null)
  const [readyForWipe, setReadyForWipe] = useState(false)
  const [wipeStarted, setWipeStarted] = useState(false)
  const [exitStarted, setExitStarted] = useState(false)
  const [gone, setGone] = useState(false)
  const [exitScale, setExitScale] = useState(20)

  const angle = useMotionValue(0)
  const springAngle = useSpring(angle, { stiffness: 55, damping: 16, mass: 0.6 })
  const shimmerBg = useTransform(
    springAngle,
    (a) =>
      `conic-gradient(from ${a}deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.95) 16deg, color-mix(in oklch, var(--purple) 70%, white) 34deg, transparent 58deg, transparent 360deg)`,
  )

  useEffect(() => {
    document.documentElement.classList.add('preloading')
    return () => document.documentElement.classList.remove('preloading')
  }, [])

  // Shimmer chases the pointer and idles into a slow rotation without one.
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

  // The reveal layer is the full pill itself. Calculate how far that exact
  // rounded rectangle must scale from its real screen position to cover every
  // viewport edge; no detached circle is involved anymore.
  useLayoutEffect(() => {
    const oval = ovalRef.current
    if (!oval) return

    const update = () => {
      const rect = oval.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const viewportWidth = Math.max(window.innerWidth, document.documentElement.clientWidth)
      const viewportHeight = Math.max(window.innerHeight, document.documentElement.clientHeight)
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const scaleX = Math.max(centerX, viewportWidth - centerX) / (rect.width / 2)
      const scaleY = Math.max(centerY, viewportHeight - centerY) / (rect.height / 2)

      setExitScale(Math.max(scaleX, scaleY) * 1.1)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(oval)
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [lang])

  // Rest the insertion cursor directly after the localized loading text.
  useLayoutEffect(() => {
    if (!lang) return
    const textRow = textRowRef.current
    const oval = ovalRef.current
    if (!textRow || !oval) return

    const update = () => {
      const ovalRect = oval.getBoundingClientRect()
      const textRect = textRow.getBoundingClientRect()
      const cursorGap = 10
      setCursorOffset(Math.max(2, ovalRect.right - textRect.right + cursorGap))
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(textRow)
    ro.observe(oval)
    return () => ro.disconnect()
  }, [lang])

  useEffect(() => {
    if (!lang) return

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
      if (loadedCount >= PRELOAD.length && visualProxy.p >= 100 && elapsed >= MIN_SHOW_MS) {
        setReadyForWipe(true)
        return
      }
      settle = window.setTimeout(tryStart, 80)
    }
    settle = window.setTimeout(tryStart, 200)

    const wake = window.setTimeout(() => {
      lightningRef.current?.strike({
        intensity: 0.7,
        originX: 0.15 + Math.random() * 0.2,
        originY: 0.05 + Math.random() * 0.08,
        targetX: 0.15 + Math.random() * 0.2,
        targetY: 0.2 + Math.random() * 0.1,
      })
    }, 900)

    return () => {
      cancelled = true
      tween.kill()
      if (settle) window.clearTimeout(settle)
      window.clearTimeout(wake)
    }
  }, [lang])

  useEffect(() => {
    if (!readyForWipe) return
    const timer = window.setTimeout(() => setWipeStarted(true), 600)
    return () => window.clearTimeout(timer)
  }, [readyForWipe])

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

    const timer = window.setTimeout(() => setExitStarted(true), 1200)
    return () => window.clearTimeout(timer)
  }, [wipeStarted])

  useEffect(() => {
    if (!exitStarted) return
    const timer = window.setTimeout(() => {
      document.documentElement.classList.remove('preloading')
      setGone(true)
    }, 1120)
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

      <div
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

      <LightningFlash
        ref={lightningRef}
        className="pointer-events-none absolute inset-0 z-[5]"
        blend="multiply"
      />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div
          ref={ovalRef}
          className="relative flex h-[104px] w-[90vw] max-w-[620px] items-center justify-center rounded-full bg-black sm:h-[140px]"
        >
          <div
            aria-hidden
            className={`loader-expansion${exitStarted ? ' loader-exit' : ''}`}
            style={{ '--exit-scale': exitScale } as CSSProperties}
          />

          <div className="loader-pill-content">
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

            <div className={`loader-stage${wipeStarted ? ' loader-wipe-active' : ''}`}>
              <div className="loader-welcome">
                <span className="font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl">
                  {t.preloader.welcome}
                </span>
              </div>

              <div className="loader-mask">
                <div ref={textRowRef} className="flex items-center gap-3 sm:gap-4">
                  <span className="font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl">
                    {t.preloader.loading}
                  </span>
                  <span className="font-sans text-xl font-bold tabular-nums leading-none text-foreground sm:text-4xl">
                    {percent}
                    <span className="ml-1 text-purple">%</span>
                  </span>
                </div>
              </div>

              <div className="loader-cursor-track" aria-hidden>
                <div
                  className={`loader-cursor${!wipeStarted ? ' caret-blink' : ''}`}
                  style={cursorOffset !== null ? { right: cursorOffset } : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="loader-meta flex flex-col items-center gap-3">
          <span
            ref={captionRef}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 sm:text-xs"
          >
            {t.preloader.caption}
          </span>
          {lang && (
            <span className="max-w-[80vw] text-center font-mono text-[9px] uppercase tracking-[0.25em] text-neutral-400 sm:hidden">
              {t.preloader.pcHint}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
