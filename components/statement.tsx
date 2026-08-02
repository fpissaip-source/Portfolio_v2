'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight } from 'lucide-react'
import { useT } from './language-context'

gsap.registerPlugin(ScrollTrigger)

/**
 * The three sentences the hero has no room for, assembled out of the air.
 *
 * Every word starts above its place and well in front of the screen, out
 * where the reader is, and falls back down into the paragraph as the
 * section is scrolled. By the time the section lets go, the words have
 * settled into three ordinary, perfectly legible lines with one offer
 * under them.
 *
 * Three things make that safe rather than clever:
 *
 * The copy is real text in normal flow. Only `transform`, `opacity` and
 * `filter` are animated, never layout, so the resting state is whatever the
 * browser would have laid out anyway, at any width, in either language, and
 * a crawler or a screen reader reading the DOM gets the sentences in one
 * piece with no idea any of this happened.
 *
 * The scatter is generated on the client, after mount. Random offsets
 * produced during render would differ between the server's HTML and the
 * browser's first paint (a hydration mismatch), and doing it in an effect
 * also means the no-JS and reduced-motion states are simply the finished
 * text.
 *
 * The per-word blur is dropped on weak devices. It is the single most
 * expensive part of this effect: one blur pass per word per frame. See
 * lib/perf-tier.ts.
 *
 * This is also the one white surface on the site. The fixed chrome is
 * styled for a black page, so while the white stage is under it the section
 * flips `data-surface="light"` on <html>, and globals.css inverts the
 * wordmark, the nav pill, the toggle and the top scrim for that stretch.
 */

/**
 * Where a word starts, relative to where it ends up.
 *
 * The motion is a fall *towards* the reader and *downwards*: each word
 * begins above its place and well in front of the screen, then drops back
 * into the paragraph. So the vertical offset is one-sided (always above,
 * never below) and the horizontal one is small — a word that comes in from
 * the side reads as sliding, not falling.
 */
const DRIFT_X = 0.13
const RISE_MIN = 0.4
const RISE_MAX = 0.95
/** Depth towards the viewer, in px, against the paragraph's perspective.
 *  Hard ceiling: a word translated to or past the perspective distance is
 *  behind the viewer's eye and the browser stops drawing it altogether.
 *  The old range went to 1400px against a 900px perspective, so a third of
 *  the words were simply not painted until late in their travel — which is
 *  why they appeared to pop into existence instead of falling. */
const PERSPECTIVE = 1100
const DEPTH_MIN = 240
const DEPTH_MAX = 620
/** Where in the section's scroll the offer starts arriving. The three lines
 *  land before it, so the eye reaches the button last. */
const CTA_AT = 0.78

/** Deterministic pseudo-random in [0, 1). Same word, same seat, every time,
 *  including between two renders of the same page. */
function rand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** One line of copy, split into animatable words.
 *
 *  `*emphasised*` inside the string gets the accent colour. The emphasis
 *  belongs to the sentence, and the sentence is different in every language,
 *  so it travels with the string rather than living in the JSX. */
function Line({
  text,
  className,
  reduced,
}: {
  text: string
  className?: string
  reduced: boolean
}) {
  const words = text.split(' ')
  return (
    <span className={`block text-balance ${className ?? ''}`}>
      {words.map((word, i) => {
        const accent = word.startsWith('*') || word.endsWith('*')
        return (
          // The space lives *between* the spans, never inside one: an
          // inline-block trims its own trailing whitespace, which welds the
          // whole sentence into one unbroken string.
          <Fragment key={i}>
            <span
              data-word
              // Not `text-purple`: the site's accent is mixed for a black
              // canvas and lands at ~2.4:1 on white. `.accent-on-light` is
              // the same hue taken down to a legible lightness (globals.css).
              className={`inline-block will-change-transform ${accent ? 'accent-on-light' : ''}`}
              style={reduced ? undefined : { opacity: 0 }}
            >
              {word.replace(/\*/g, '')}
            </span>
            {i < words.length - 1 ? ' ' : ''}
          </Fragment>
        )
      })}
    </span>
  )
}

export function Statement() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [reduced, setReduced] = useState(false)
  const [cheap, setCheap] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    setCheap(document.documentElement.dataset.perf === 'low')
  }, [])

  // The white surface, and the chrome inversion that has to come with it.
  // Runs whether or not the words animate: the section is white either way.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const root = document.documentElement
    const st = ScrollTrigger.create({
      trigger: section,
      // The chrome band is ~130px tall (see TopScrim). White is under it
      // from the moment the section's top passes that line until its bottom
      // rises back through it.
      start: 'top 130px',
      end: 'bottom 130px',
      onToggle: (self) => {
        if (self.isActive) root.dataset.surface = 'light'
        else delete root.dataset.surface
      },
    })
    return () => {
      st.kill()
      delete root.dataset.surface
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current
    const cta = ctaRef.current
    if (!section || !copy || reduced) return

    const items = Array.from(copy.querySelectorAll<HTMLElement>('[data-word]'))
    if (!items.length) return

    // Each word gets a seat in space and its own slice of the scroll, so
    // they arrive over a stretch rather than snapping into place together.
    const vw = window.innerWidth
    const vh = window.innerHeight
    const plan = items.map((el, i) => ({
      el,
      dx: (rand(i + 1) - 0.5) * 2 * DRIFT_X * vw,
      // Always negative: above its place, so the word comes down onto it.
      dy: -(RISE_MIN + rand(i + 7.3) * (RISE_MAX - RISE_MIN)) * vh,
      dz: DEPTH_MIN + rand(i + 13.7) * (DEPTH_MAX - DEPTH_MIN),
      rot: (rand(i + 21.1) - 0.5) * 18,
      // Words land roughly in reading order, but not exactly: a strict
      // left-to-right arrival looks like a typewriter, not like a swarm
      // settling.
      start: (i / items.length) * 0.58 + rand(i + 31.3) * 0.1,
    }))

    const apply = (p: number) => {
      for (const w of plan) {
        const e = Math.max(0, Math.min(1, (p - w.start) / 0.32))
        // easeOutCubic: fast approach, soft landing.
        const k = 1 - Math.pow(1 - e, 3)
        const away = 1 - k
        w.el.style.transform = `translate3d(${(w.dx * away).toFixed(1)}px, ${(w.dy * away).toFixed(1)}px, ${(w.dz * away).toFixed(1)}px) rotate(${(w.rot * away).toFixed(2)}deg)`
        // From nothing, not from a faint version of the finished line: at
        // 0.14 the whole paragraph was legible before a single word had
        // moved, so there was no arrival left to watch.
        w.el.style.opacity = Math.min(1, k * 1.35).toFixed(3)
        if (!cheap) {
          w.el.style.filter = away > 0.01 ? `blur(${(away * 7).toFixed(2)}px)` : 'none'
        }
      }
      if (cta) {
        const c = Math.max(0, Math.min(1, (p - CTA_AT) / 0.16))
        cta.style.opacity = c.toFixed(3)
        cta.style.transform = `translate3d(0, ${((1 - c) * 26).toFixed(1)}px, 0)`
        cta.style.pointerEvents = c > 0.6 ? 'auto' : 'none'
      }
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })
    apply(0)
    return () => st.kill()
  }, [reduced, cheap, t.statement.lead, t.statement.proof, t.statement.extra])

  function toContact(e: React.MouseEvent) {
    e.preventDefault()
    const el = document.querySelector('#contact')
    if (!el) return
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } })
      .__lenis
    if (lenis) lenis.scrollTo(el, { offset: -40 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      ref={sectionRef}
      id="statement"
      className={`relative bg-white ${reduced ? 'py-24' : 'h-[240vh]'}`}
      aria-label={t.statement.label}
    >
      <div
        className={`flex items-center justify-center overflow-hidden bg-white px-6 ${
          reduced ? '' : 'sticky top-0 h-svh'
        }`}
      >
        <div
          // The perspective lives on the wrapper, so every word's depth is
          // measured from the same vanishing point. Set per word, they would
          // each have their own and the swarm would read as flat.
          style={{ perspective: `${PERSPECTIVE}px`, transformStyle: 'preserve-3d' }}
          className="w-full max-w-4xl text-center"
        >
          <div ref={copyRef} className="font-display tracking-tight text-black">
            <Line
              text={t.statement.lead}
              reduced={reduced}
              className="text-[clamp(1.35rem,5.6vw,3.1rem)] font-semibold leading-[1.14]"
            />
            <Line
              text={t.statement.proof}
              reduced={reduced}
              className="mt-6 text-[clamp(0.98rem,3.4vw,1.55rem)] font-medium leading-[1.28] text-black/70 sm:mt-7"
            />
            <Line
              text={t.statement.extra}
              reduced={reduced}
              className="mt-3 text-[clamp(0.98rem,3.4vw,1.55rem)] font-medium leading-[1.28] text-black/70 sm:mt-4"
            />
          </div>

          {/* The offer. It is the reason this section is bright: the rest of
              the page is a dark room, and the one place asking for a reply
              is lit. */}
          <div
            ref={ctaRef}
            className="mt-9 flex flex-col items-center gap-3 sm:mt-11"
            style={reduced ? undefined : { opacity: 0 }}
          >
            <a
              href="#contact"
              onClick={toContact}
              className="group inline-flex items-center gap-2.5 rounded-full bg-black px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:text-base"
            >
              {t.statement.ctaLabel}
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </a>
            <p className="text-xs text-black/55 sm:text-sm">{t.statement.ctaNote}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
