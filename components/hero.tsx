'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GradientOrbs } from './gradient-orbs'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useT } from './language-context'

gsap.registerPlugin(ScrollTrigger)

const easeOut = [0.22, 1, 0.36, 1] as const

/** The word is always in the DOM; each letter starts dim and is lit up
 *  letter by letter as the hero scrolls into place. */
function LitWord({ word }: { word: string }) {
  return (
    <span className="inline-block">
      {word.split('').map((ch, i) => (
        <span key={i} data-lit style={{ opacity: 0.12 }} className="inline-block">
          {ch}
        </span>
      ))}
    </span>
  )
}

export function Hero() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

  // The three heading words are sized generously via fixed Tailwind
  // classes, tuned against the English copy. A translation's longest word
  // (e.g. German "Intelligente" vs. English "Intelligent") can be wide
  // enough to exceed the viewport at the same font-size, and since the
  // section clips overflow, the excess — often the last letter — just
  // gets cut off rather than wrapping. Shrink the heading's font-size only
  // if its widest line would actually overflow, so the common case (fits
  // fine) never changes.
  useLayoutEffect(() => {
    const section = sectionRef.current
    const h1 = h1Ref.current
    if (!section || !h1) return
    const fit = () => {
      h1.style.fontSize = ''
      const cs = window.getComputedStyle(section)
      const available =
        section.clientWidth - parseFloat(cs.paddingLeft || '0') - parseFloat(cs.paddingRight || '0')
      const needed = h1.getBoundingClientRect().width
      if (needed > available) {
        const base = parseFloat(window.getComputedStyle(h1).fontSize)
        h1.style.fontSize = `${(base * available) / needed}px`
      }
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [t.hero.line1, t.hero.line2, t.hero.line3])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    let sparked = false
    const ctx = gsap.context(() => {
      gsap.to(section.querySelectorAll('[data-lit]'), {
        opacity: 1,
        ease: 'none',
        duration: 0.35,
        stagger: 0.045,
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 5%',
          scrub: 0.5,
          onUpdate: (self) => {
            // One last spark bridging toward L.U.K.A.S., right as the
            // headline finishes lighting up — deliberately just one; Hero
            // is a reading section, not a place for a recurring loop.
            if (!sparked && self.progress >= 0.85) {
              sparked = true
              lightningRef.current?.strike({ intensity: 0.9 })
            }
          },
        },
      })
    }, section)
    return () => ctx.revert()
  }, [t.hero.line1, t.hero.line2, t.hero.line3])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      <GradientOrbs />
      <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[1]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="font-mono text-xs uppercase tracking-[0.35em] text-blue sm:text-sm"
        >
          {t.hero.kicker}
        </motion.span>

        <h1
          ref={h1Ref}
          className="mt-6 text-balance font-sans text-6xl font-semibold leading-[0.95] tracking-tight sm:text-8xl md:text-[9rem]"
        >
          <LitWord word={t.hero.line1} />
          <br />
          <span className="bg-gradient-to-br from-blue via-white to-purple bg-clip-text text-transparent">
            <LitWord word={t.hero.line2} />
          </span>
          <br />
          <LitWord word={t.hero.line3} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.6, ease: easeOut }}
          className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {t.hero.body}
        </motion.p>

      </div>
    </section>
  )
}
