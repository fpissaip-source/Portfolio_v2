'use client'

import { motion } from 'motion/react'
import { Smartphone, MapPin, Sparkles } from 'lucide-react'
import { GradientOrbs } from './gradient-orbs'

const easeOut = [0.22, 1, 0.36, 1] as const

const line1 = 'Building'
const line2 = 'Intelligent'
const line3 = 'Systems.'

function AnimatedWord({ word, delay }: { word: string; delay: number }) {
  return (
    <span className="inline-block overflow-hidden pb-[0.1em] align-bottom">
      <motion.span
        className="inline-block will-transform"
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1, delay, ease: easeOut }}
      >
        {word}
      </motion.span>
    </span>
  )
}

const FACTS = [
  { icon: Sparkles, label: 'AI Engineer & Full-Stack Developer' },
  { icon: Smartphone, label: 'Built entirely on an iPhone' },
  { icon: MapPin, label: 'Germany' },
]

export function Hero() {
  return (
    <section
      id="top"
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
          <AnimatedWord word={line1} delay={0.1} />
          <br />
          <span className="bg-gradient-to-br from-blue via-white to-purple bg-clip-text text-transparent">
            <AnimatedWord word={line2} delay={0.22} />
          </span>
          <br />
          <AnimatedWord word={line3} delay={0.34} />
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

        <motion.ul
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: easeOut }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-3"
        >
          {FACTS.map((f) => (
            <li
              key={f.label}
              className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground"
            >
              <f.icon className="h-4 w-4 text-blue" />
              {f.label}
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  )
}
