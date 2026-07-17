'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'
import { Reveal, WordReveal } from './anim'
import { useT } from './language-context'

export function Process() {
  const t = useT()
  const STEPS = t.process.steps
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 60%', 'end 80%'],
  })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])
  const particleY = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section id="process" className="relative mx-auto max-w-4xl px-6 py-32">
      <div className="mb-20 flex flex-col items-center gap-4 text-center">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
            {t.process.kicker}
          </span>
        </Reveal>
        <WordReveal
          as="h2"
          text={t.process.heading}
          className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
      </div>

      <div ref={ref} className="relative pl-12 sm:pl-0">
        {/* center rail */}
        <div className="absolute left-6 top-0 h-full w-px -translate-x-1/2 bg-white/8 sm:left-1/2">
          {/* progress fill */}
          <motion.div
            style={{ scaleY: lineScale }}
            className="absolute inset-0 origin-top will-transform"
          >
            <div className="h-full w-full bg-gradient-to-b from-blue via-purple to-transparent" />
          </motion.div>
          {/* moving particle */}
          <motion.div
            style={{ top: particleY }}
            className="absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-white will-transform"
          >
            <div className="absolute inset-0 rounded-full bg-blue blur-[6px]" />
          </motion.div>
        </div>

        <div className="flex flex-col gap-12">
          {STEPS.map((s, i) => {
            const left = i % 2 === 0
            return (
              <div
                key={s.title}
                className={`relative flex sm:w-1/2 ${
                  left ? 'sm:self-start sm:pr-10' : 'sm:self-end sm:pl-10'
                }`}
              >
                {/* node */}
                <span
                  className={`absolute top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-white/20 bg-background will-transform ${
                    left
                      ? 'left-[-1.5rem] sm:left-auto sm:right-[-2.55rem]'
                      : 'left-[-1.5rem] sm:left-[-2.55rem]'
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue" />
                </span>
                <Reveal className="w-full" y={30}>
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-blue">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h3 className="text-xl font-semibold tracking-tight">
                        {s.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
