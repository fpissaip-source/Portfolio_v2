'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { AboutIntro } from './about-intro'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  const [started, setStarted] = useState(false)
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (started) return
    if (inView) {
      setStarted(true)
      return
    }

    const element = ref.current
    if (element) {
      const rect = element.getBoundingClientRect()
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setStarted(true)
        return
      }
    }

    const timer = window.setTimeout(() => setStarted(true), 2500)
    return () => window.clearTimeout(timer)
  }, [inView, started])

  useEffect(() => {
    if (!started) return
    let frame = 0
    const start = performance.now()
    const duration = 1600

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * to))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [started, to])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  )
}

export function About() {
  const t = useT()

  return (
    <section id="about" className="relative">
      <AboutIntro />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-32 pt-24 lg:grid-cols-[0.9fr_1.1fr]">
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

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-7">
            <div>
              <dd className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={15} suffix="+" />
              </dd>
              <dt className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
                {t.about.stat1Label}
              </dt>
            </div>
            <div>
              <dd className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={7} />
              </dd>
              <dt className="mt-1 text-sm font-medium tracking-tight text-muted-foreground">
                {t.about.stat2Label}
              </dt>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <Reveal y={30}>
            <div className="mb-6">
              <p className="font-label text-[10px] uppercase tracking-[0.22em] text-blue/90 sm:text-[11px]">
                {t.about.storyLabel}
              </p>
              <h3 className="mt-3 text-balance font-display text-2xl font-semibold leading-[1.15] tracking-tight sm:text-3xl">
                {t.about.storyHeading}
              </h3>

              <div className="mt-7 flex flex-col gap-7 border-l border-white/10 pl-6">
                {t.about.story.map((story) => (
                  <article key={story.flag} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full border border-blue/70 bg-background"
                    />
                    <p className="text-xs font-semibold tracking-tight text-purple/85">
                      {story.flag}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {story.title}
                    </h4>
                    <p className="mt-2 max-w-[62ch] text-pretty text-[15px] leading-relaxed text-muted-foreground">
                      {story.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="mt-3">
            {t.about.pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={Math.min(index, 3) * 0.05} y={24}>
                <article className="group border-t border-white/10 py-7 transition-colors duration-200 hover:border-blue/30">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
