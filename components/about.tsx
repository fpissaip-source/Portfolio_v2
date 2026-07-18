'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { Reveal, WordReveal } from './anim'
import { useT } from './language-context'

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  // Vertical-only margin: '-20%' alone also shrinks the observed viewport
  // horizontally, which on narrow phones pushed the first (left-edge) stat
  // out of the observed zone entirely — it never fired and stayed at 0.
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const dur = 1600
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to])

  return (
    <span ref={ref} className="tabular-nums">
      {val}
      {suffix}
    </span>
  )
}

export function About() {
  const t = useT()
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
              {t.about.kicker}
            </span>
          </Reveal>
          <WordReveal
            as="h2"
            text={t.about.heading}
            className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
              {t.about.intro}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={15} suffix="+" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t.about.stat1Label}
              </div>
            </div>
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={7} suffix="" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {t.about.stat2Label}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Reveal y={30}>
            <div className="glass relative mb-3 overflow-hidden rounded-2xl p-6 sm:p-8">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple/15 blur-3xl"
              />
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
                {t.about.storyLabel}
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                {t.about.storyHeading}
              </h3>
              <div className="relative mt-6 flex flex-col gap-6 border-l border-white/10 pl-6">
                {t.about.story.map((s) => (
                  <div key={s.flag} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue shadow-[0_0_12px_2px_color-mix(in_oklch,var(--blue)_70%,transparent)]"
                    />
                    <div className="font-mono text-[11px] uppercase tracking-[0.25em] text-purple/80">
                      {s.flag}
                    </div>
                    <div className="mt-1 font-semibold tracking-tight">
                      {s.title}
                    </div>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          {t.about.pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05} y={30}>
              <div className="group glass rounded-2xl p-6 transition-colors hover:border-white/20">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-sm text-blue">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                      {p.body}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
