'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
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
          <SectionHeading
            label={t.about.kicker}
            heading={t.about.heading}
            description={t.about.intro}
            align="left"
            tone="purple"
            headingClassName="sm:text-5xl"
            descriptionClassName="max-w-md"
          />

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={15} suffix="+" />
              </div>
              <div className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
                {t.about.stat1Label}
              </div>
            </div>
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={7} suffix="" />
              </div>
              <div className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
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
              <div className="flex items-center gap-3 text-sm font-medium tracking-tight text-blue/80">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-blue shadow-[0_0_14px_2px_color-mix(in_oklch,var(--blue)_55%,transparent)]"
                />
                {t.about.storyLabel}
              </div>
              <h3 className="mt-4 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {t.about.storyHeading}
              </h3>
              <div className="relative mt-7 flex flex-col gap-7 border-l border-white/10 pl-6">
                {t.about.story.map((s) => (
                  <div key={s.flag} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue shadow-[0_0_12px_2px_color-mix(in_oklch,var(--blue)_70%,transparent)]"
                    />
                    <div className="text-sm font-medium tracking-tight text-purple/80">
                      {s.flag}
                    </div>
                    <div className="mt-1 text-lg font-semibold tracking-tight">
                      {s.title}
                    </div>
                    <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
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
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue/20 bg-blue/[0.08] text-xs font-semibold tabular-nums text-blue">
                    {String(i + 1).padStart(2, '0')}
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
