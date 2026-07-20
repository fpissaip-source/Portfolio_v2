'use client'

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useLanguage, useT } from './language-context'

const PRELOAD = ['/intro/cinematic-poster.jpg']
const SESSION_KEY = 'portfolio-welcome-seen'
const GREETING_STEP_MS = 280

type Greeting = {
  text: string
  lang: string
  dir?: 'ltr' | 'rtl'
}

const GREETINGS: Greeting[] = [
  { text: 'Welcome', lang: 'en' },
  { text: 'Willkommen', lang: 'de' },
  { text: 'Bienvenue', lang: 'fr' },
  { text: 'Bienvenido', lang: 'es' },
  { text: 'Benvenuto', lang: 'it' },
  { text: 'مرحباً', lang: 'ar', dir: 'rtl' },
]

export function Preloader() {
  const { lang } = useLanguage()
  const t = useT()
  const ovalRef = useRef<HTMLDivElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

  const [greetingIndex, setGreetingIndex] = useState(0)
  const [exitStarted, setExitStarted] = useState(false)
  const [gone, setGone] = useState(false)
  const [exitScale, setExitScale] = useState(20)

  const orderedGreetings = useMemo(() => {
    const leadLanguage = lang === 'de' ? 'de' : 'en'
    const lead = GREETINGS.find((greeting) => greeting.lang === leadLanguage)
    if (!lead) return GREETINGS
    return [lead, ...GREETINGS.filter((greeting) => greeting !== lead)]
  }, [lang])

  const activeGreeting = orderedGreetings[greetingIndex] ?? orderedGreetings[0]

  const angle = useMotionValue(0)
  const springAngle = useSpring(angle, { stiffness: 55, damping: 16, mass: 0.6 })
  const shimmerBg = useTransform(
    springAngle,
    (value) =>
      `conic-gradient(from ${value}deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.95) 16deg, color-mix(in oklch, var(--purple) 70%, white) 34deg, transparent 58deg, transparent 360deg)`,
  )

  // A returning visitor should land on the cinematic intro immediately. The
  // greeting transition is shown only once per browser session.
  useLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === '1') {
        document.documentElement.classList.remove('preloading')
        setGone(true)
        return
      }
    } catch {
      // Storage can be unavailable in strict privacy modes. In that case the
      // welcome transition simply behaves like a first visit.
    }

    document.documentElement.classList.add('preloading')
    return () => document.documentElement.classList.remove('preloading')
  }, [])

  // Start fetching the intro poster under the welcome transition. There is no
  // fake percentage and no claim that the whole site has finished loading.
  useEffect(() => {
    if (gone) return
    for (const src of PRELOAD) {
      const image = new Image()
      image.src = src
    }
  }, [gone])

  // Shimmer follows the pointer and falls back to a slow idle rotation.
  useEffect(() => {
    if (gone) return
    const oval = ovalRef.current
    if (!oval) return

    let raf = 0
    let autoAngle = 0
    let lastPointer = -Infinity

    const onMove = (event: PointerEvent) => {
      lastPointer = performance.now()
      const rect = oval.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const degrees =
        (Math.atan2(event.clientY - centerY, event.clientX - centerX) * 180) /
          Math.PI +
        90
      angle.set(degrees)
    }

    const tick = () => {
      if (performance.now() - lastPointer > 1400) {
        autoAngle = (autoAngle + 0.5) % 360
        angle.set(autoAngle)
      }
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [angle, gone])

  // Calculate how far the real pill must scale to cover the entire viewport.
  useLayoutEffect(() => {
    if (gone) return
    const oval = ovalRef.current
    if (!oval) return

    const update = () => {
      const rect = oval.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const viewportWidth = Math.max(
        window.innerWidth,
        document.documentElement.clientWidth,
      )
      const viewportHeight = Math.max(
        window.innerHeight,
        document.documentElement.clientHeight,
      )
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const scaleX = Math.max(centerX, viewportWidth - centerX) / (rect.width / 2)
      const scaleY = Math.max(centerY, viewportHeight - centerY) / (rect.height / 2)

      setExitScale(Math.max(scaleX, scaleY) * 1.1)
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(oval)
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [gone, lang])

  // Cycle through a few greetings, then let the pill expand into the site.
  useEffect(() => {
    if (!lang || gone) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const timers: number[] = []

    if (!reducedMotion) {
      orderedGreetings.slice(1).forEach((_, index) => {
        timers.push(
          window.setTimeout(
            () => setGreetingIndex(index + 1),
            GREETING_STEP_MS * (index + 1),
          ),
        )
      })
    }

    const exitDelay = reducedMotion
      ? 450
      : GREETING_STEP_MS * orderedGreetings.length + 120

    timers.push(
      window.setTimeout(() => {
        if (!reducedMotion) {
          lightningRef.current?.strike({
            intensity: 0.9,
            duration: 300,
            originX: 0.35 + Math.random() * 0.3,
            originY: 0.06 + Math.random() * 0.08,
            targetX: 0.35 + Math.random() * 0.3,
            targetY: 0.22 + Math.random() * 0.1,
          })
        }
        setExitStarted(true)
      }, exitDelay),
    )

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [gone, lang, orderedGreetings])

  useEffect(() => {
    if (!exitStarted) return

    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // The transition still completes if storage is blocked.
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const timer = window.setTimeout(
      () => {
        document.documentElement.classList.remove('preloading')
        setGone(true)
      },
      reducedMotion ? 80 : 900,
    )

    return () => window.clearTimeout(timer)
  }, [exitStarted])

  if (gone || !activeGreeting) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t.preloader.welcome}
      className={`fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-white${exitStarted ? ' loader-root-exit' : ''}`}
    >
      <span className="sr-only">{t.preloader.welcome}</span>

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
        className="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.11]"
      >
        <div className="preloader-marquee flex w-max items-center gap-16 whitespace-nowrap font-sans text-5xl font-bold tracking-tight text-black/60 sm:text-7xl">
          {[...GREETINGS, ...GREETINGS, ...GREETINGS].map((greeting, index) => (
            <span key={`${greeting.lang}-${index}`} className="flex items-center gap-16">
              <span dir={greeting.dir}>{greeting.text}</span>
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

            <div className="absolute inset-0 grid place-items-center overflow-hidden rounded-full px-8">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeGreeting.lang}
                  aria-hidden
                  dir={activeGreeting.dir}
                  initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="font-sans text-2xl font-bold leading-none tracking-tight text-foreground sm:text-5xl"
                >
                  {activeGreeting.text}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="loader-meta flex flex-col items-center gap-2">
          <span className="text-[10px] font-medium uppercase tracking-[0.24em] text-neutral-500 sm:text-xs">
            {t.preloader.caption}
          </span>
          <span
            aria-hidden
            className="max-w-[86vw] text-center text-[9px] font-medium tracking-[0.08em] text-neutral-400 sm:text-[10px]"
          >
            Welcome · Willkommen · Bienvenue · Bienvenido · مرحباً
          </span>
        </div>
      </div>
    </div>
  )
}
