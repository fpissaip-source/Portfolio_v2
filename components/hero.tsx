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
 *  letter by letter as the hero scrolls into place. Adjacent per-letter
 *  inline-blocks have no text node between them, so (as with normal text)
 *  the browser never inserts a line-break inside a word — only `LitPhrase`
 *  below relies on this to keep multi-word headings wrapping normally. */
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

/** Same letter-by-letter reveal as `LitWord`, extended to a full phrase: each
 *  word gets its own `LitWord` (so it never breaks mid-word), joined by
 *  plain space text nodes (so the phrase still wraps normally between
 *  words). */
function LitPhrase({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <LitWord word={w} />
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export function Hero() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const lightningRef = useRef<LightningHandle>(null)

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
  }, [t.hero.headingStart, t.hero.headingHighlight, t.hero.headingEnd])

  useEffect(() => {
    const section = sectionRef.current
    const highlight = highlightRef.current
    if (!section || !highlight) return
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
            if (!sparked && self.progress >= 0.85) {
              sparked = true
              lightningRef.current?.strike({ intensity: 0.9 })
            }
          },
        },
      })

      gsap.to(highlight, {
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 90%',
          end: 'top 5%',
          scrub: 0.5,
        },
      })
    }, section)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [t.hero.headingStart, t.hero.headingHighlight, t.hero.headingEnd])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      <GradientOrbs />
      <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[1]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-sm font-medium tracking-tight text-foreground/60 backdrop-blur-sm"
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-blue shadow-[0_0_14px_2px_color-mix(in_oklch,var(--blue)_55%,transparent)]"
          />
          {t.hero.kicker}
        </motion.div>

        <h1
          ref={h1Ref}
          className="mt-6 text-balance font-sans text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
        >
          <LitPhrase text={t.hero.headingStart} />{' '}
          <span
            ref={highlightRef}
            style={{ opacity: 0.12 }}
            className="bg-gradient-to-br from-blue via-white to-purple bg-clip-text text-transparent"
          >
            {t.hero.headingHighlight}
          </span>{' '}
          <LitPhrase text={t.hero.headingEnd} />
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
