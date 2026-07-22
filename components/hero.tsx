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
  const headingEnd = t.hero.headingEnd.replace(/^[—–-]\s*/, '')

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
  }, [t.hero.headingStart, t.hero.headingHighlight, headingEnd])

  useEffect(() => {
    const section = sectionRef.current
    const highlight = highlightRef.current
    const h1 = h1Ref.current
    if (!section || !highlight || !h1) return
    let sparked = false
    // Trigger on the HEADLINE itself, not the whole min-h-screen section.
    // The heading sits in the section's vertical center, so a
    // section-top-based trigger (start 'top 90%') begins reacting while the
    // text is still far below the fold — on a phone the reveal was already
    // finishing by the time the words were comfortably on screen, so the
    // visitor only ever caught its tail. Anchoring to the heading and
    // starting once it's fully in view means the reveal actually plays out
    // while you're reading it: begins when the whole headline has entered
    // ('bottom bottom') and completes as it reaches center.
    const revealTrigger = { trigger: h1, start: 'bottom bottom', end: 'center 45%', scrub: 0.5 }
    const ctx = gsap.context(() => {
      gsap.to(section.querySelectorAll('[data-lit]'), {
        opacity: 1,
        ease: 'none',
        duration: 0.35,
        stagger: 0.045,
        scrollTrigger: {
          ...revealTrigger,
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
        scrollTrigger: { ...revealTrigger },
      })
    }, section)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [t.hero.headingStart, t.hero.headingHighlight, headingEnd])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      <GradientOrbs />
      <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[1]" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <h1
          ref={h1Ref}
          className="text-balance font-sans text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl md:text-7xl"
        >
          <LitPhrase text={t.hero.headingStart} />{' '}
          <span
            ref={highlightRef}
            style={{ opacity: 0.12 }}
            className="bg-gradient-to-br from-blue via-white to-purple bg-clip-text text-transparent"
          >
            {t.hero.headingHighlight}
          </span>{' '}
          <LitPhrase text={headingEnd} />
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
