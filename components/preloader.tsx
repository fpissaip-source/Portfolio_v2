'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useLanguage, useT } from './language-context'

const PRELOAD = ['/intro/cinematic-poster.jpg']
/** How long each quick greeting stays before the next one swaps in. */
const GREETING_STEP_MS = 190
/** How long the final (browser-language) greeting stands before the exit. */
const FINAL_HOLD_MS = 600
/** Never wait on slow assets longer than this before exiting anyway. */
const PRELOAD_CAP_MS = 2500

/** Rapid multilingual hellos. Add more here any time — just append a
 *  `{ lang, text }` entry, no other wiring needed. The visitor's own
 *  browser language (matched against `lang` below) is pulled out and
 *  shown both FIRST and LAST, bookending the quick tour through the rest. */
const GREETINGS = [
  { lang: 'en', text: 'Welcome' },
  { lang: 'de', text: 'Willkommen' },
  { lang: 'fr', text: 'Bonjour' },
  { lang: 'es', text: 'Hola' },
  { lang: 'it', text: 'Ciao' },
  { lang: 'pt', text: 'Olá' },
  { lang: 'nl', text: 'Hallo' },
  { lang: 'tr', text: 'Merhaba' },
  { lang: 'ja', text: 'こんにちは' },
  { lang: 'ar', text: 'مرحباً' },
]

export function Preloader() {
  const { lang } = useLanguage()
  const t = useT()
  const ovalRef = useRef<HTMLDivElement>(null)
  const lightningRef = useRef<LightningHandle>(null)
  const loadedRef = useRef(0)

  const [greetingIndex, setGreetingIndex] = useState(0)
  const [exitStarted, setExitStarted] = useState(false)
  const [gone, setGone] = useState(false)
  const [exitScale, setExitScale] = useState(20)

  // The visitor's own language opens the sequence, a quick tour through the
  // rest follows, then the same greeting closes it — first and last frame.
  const orderedGreetings = useMemo(() => {
    const finalLang = lang === 'de' ? 'de' : 'en'
    const home = GREETINGS.find((g) => g.lang === finalLang) ?? GREETINGS[0]
    const others = GREETINGS.filter((g) => g !== home)
    return [home, ...others, home]
  }, [lang])

  const activeGreeting = orderedGreetings[Math.min(greetingIndex, orderedGreetings.length - 1)]
  const isFinalGreeting = greetingIndex >= orderedGreetings.length - 1

  const angle = useMotionValue(0)
  const springAngle = useSpring(angle, { stiffness: 55, damping: 16, mass: 0.6 })
  const shimmerBg = useTransform(
    springAngle,
    (a) =>
      `conic-gradient(from ${a}deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.95) 16deg, color-mix(in oklch, var(--purple) 70%, white) 34deg, transparent 58deg, transparent 360deg)`,
  )

  useEffect(() => {
    const html = document.documentElement
    html.classList.add('preloading')
    const unlock = () => html.classList.remove('preloading')

    // Scroll is locked (`html.preloading { overflow: hidden }`) only while
    // the intro sequence plays. The normal exit path below removes the
    // class, but it runs off a chain of setTimeout()s, and iOS Safari
    // throttles timers hard while a heavy page is still loading — if that
    // chain stalls, the lock would stick and the whole page would feel
    // frozen. Two independent failsafes guarantee it never does:
    //   1. Any real intent to move the page (touch/wheel/scroll) releases
    //      the lock immediately — if the visitor is trying to scroll, they
    //      never stay stuck, whatever the timers are doing.
    //   2. A hard wall-clock cap releases it no matter what.
    const releaseOnIntent = () => {
      unlock()
      window.removeEventListener('touchmove', releaseOnIntent)
      window.removeEventListener('wheel', releaseOnIntent)
    }
    window.addEventListener('touchmove', releaseOnIntent, { passive: true })
    window.addEventListener('wheel', releaseOnIntent, { passive: true })
    const hardCap = window.setTimeout(unlock, 6000)

    return () => {
      window.clearTimeout(hardCap)
      window.removeEventListener('touchmove', releaseOnIntent)
      window.removeEventListener('wheel', releaseOnIntent)
      unlock()
    }
  }, [])

  // Warm the intro poster under the greetings — the sequence is not gated on
  // it (except for a soft cap below), it just gets a head start.
  useEffect(() => {
    for (const src of PRELOAD) {
      const img = new Image()
      const done = () => {
        loadedRef.current++
      }
      img.onload = done
      img.onerror = done
      img.src = src
    }
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

  // The whole show: rapid hellos → the browser's own language → exit. Kicks
  // off as soon as the language is resolved (a layout effect on first paint).
  useEffect(() => {
    if (!lang) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers: number[] = []
    const started = performance.now()

    if (!reduced) {
      for (let i = 1; i < orderedGreetings.length; i++) {
        timers.push(window.setTimeout(() => setGreetingIndex(i), GREETING_STEP_MS * i))
      }
    } else {
      // Reduced motion: no cycling — land directly on the final greeting.
      setGreetingIndex(orderedGreetings.length - 1)
    }

    const cycleMs = reduced ? 450 : GREETING_STEP_MS * (orderedGreetings.length - 1) + FINAL_HOLD_MS

    // Soft gate: don't exit into a not-yet-loaded intro poster, but never
    // stall past the hard cap either.
    let poll: number | undefined
    const tryExit = () => {
      const elapsed = performance.now() - started
      if (loadedRef.current >= PRELOAD.length || elapsed >= PRELOAD_CAP_MS) {
        lightningRef.current?.strike({
          intensity: 1.15,
          duration: 380,
          originX: 0.35 + Math.random() * 0.3,
          originY: 0.06 + Math.random() * 0.08,
          targetX: 0.35 + Math.random() * 0.3,
          targetY: 0.22 + Math.random() * 0.1,
        })
        setExitStarted(true)
        return
      }
      poll = window.setTimeout(tryExit, 80)
    }
    timers.push(window.setTimeout(tryExit, cycleMs))

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      if (poll) window.clearTimeout(poll)
    }
  }, [lang, orderedGreetings])

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

            {/* Rapid multilingual hellos, landing on the visitor's own
                language. `mode="popLayout"` lets each word start entering
                while the previous one is still leaving — at this pace a
                serial wait would stutter. Gated on `lang` so a non-English
                visitor never sees a flash of the English default while the
                real language is still resolving. */}
            <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-full">
              {lang && (
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={activeGreeting.text}
                    initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, filter: 'blur(5px)' }}
                    transition={{
                      duration: isFinalGreeting ? 0.2 : 0.13,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className="font-sans text-xl font-bold leading-none tracking-tight text-foreground sm:text-4xl"
                  >
                    {activeGreeting.text}
                  </motion.span>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        <div className="loader-meta flex flex-col items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 sm:text-xs">
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
