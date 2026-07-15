'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GradientOrbs } from './gradient-orbs'

gsap.registerPlugin(ScrollTrigger)

const easeOut = [0.22, 1, 0.36, 1] as const

const line1 = 'Building'
const line2 = 'Intelligent'
const line3 = 'Systems.'

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
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
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
        },
      })
    }, section)
    return () => ctx.revert()
  }, [])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      <GradientOrbs />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="font-mono text-xs uppercase tracking-[0.35em] text-blue sm:text-sm"
        >
          Issa Hareb — Curriculum Vitae
        </motion.span>

        <h1 className="mt-6 text-balance font-sans text-6xl font-semibold leading-[0.95] tracking-tight sm:text-8xl md:text-[9rem]">
          <LitWord word={line1} />
          <br />
          <span className="bg-gradient-to-br from-blue via-white to-purple bg-clip-text text-transparent">
            <LitWord word={line2} />
          </span>
          <br />
          <LitWord word={line3} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, delay: 0.6, ease: easeOut }}
          className="mt-8 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          I&apos;ve made AI a true engineering partner — and I&apos;ve nearly
          mastered it. What makes that unusual: I don&apos;t own a PC or a
          laptop. Every system I design, build and ship is created entirely from
          my iPhone, end to end.
        </motion.p>

      </div>
    </section>
  )
}
