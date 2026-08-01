'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { AboutFilm } from './about-film'
import { Reveal } from './anim'
import { useT } from './language-context'
import { NameSequence } from './name-sequence'
import { SectionHeading } from './section-heading'

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  const [started, setStarted] = useState(false)
  const [val, setVal] = useState(0)

  // useInView alone misses jump navigation (a nav click lands the section
  // via Lenis scrollTo almost instantly, and the observer can stay silent)
  // — which left the stats frozen at "0", the exact opposite of what a
  // trust number is for. Belt and braces: start when the observer fires,
  // OR when the element is already inside the viewport on mount, OR after
  // a fallback delay. A late (or even unseen) start is harmless — a never
  // starting one shows "0 systems built".
  useEffect(() => {
    if (started) return
    if (inView) {
      setStarted(true)
      return
    }
    const el = ref.current
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) {
        setStarted(true)
        return
      }
    }
    const timer = window.setTimeout(() => setStarted(true), 2500)
    return () => window.clearTimeout(timer)
  }, [inView, started])

  useEffect(() => {
    if (!started) return
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
  }, [started, to])

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
      {/* The section opens by saying who this is — name first, everything
          else after. */}
      <NameSequence />
      <div className="mt-24 grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
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
          {/* The story is a field, not a card — it sits in the same column as
              the competency list below it, and one boxed block beside an
              unboxed one reads as two unrelated systems (DESIGN.md §5). */}
          <Reveal y={30}>
            <div className="relative mb-6">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple/10 blur-3xl"
              />
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue/90">
                {t.about.storyLabel}
              </div>
              <h3 className="mt-3 text-balance font-display text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                {t.about.storyHeading}
              </h3>
              <div className="relative mt-7 flex flex-col gap-7 border-l border-white/10 pl-6">
                {t.about.story.map((s) => (
                  <div key={s.flag} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-blue shadow-[0_0_12px_2px_color-mix(in_oklch,var(--blue)_70%,transparent)]"
                    />
                    <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-purple/80">
                      {s.flag}
                    </div>
                    <div className="mt-2 font-display text-lg font-semibold tracking-tight">
                      {s.title}
                    </div>
                    <p className="mt-2 max-w-[62ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          {/* Competencies as a specification list (DESIGN.md §5, #4). These
              are parallel capabilities, not a sequence — the old 01/02/03
              markers promised an order that does not exist, and the card
              per item turned a list into a pricing page. */}
          <div className="mt-3">
            {t.about.pillars.map((p, i) => (
              <Reveal key={p.title} delay={Math.min(i, 3) * 0.05} y={24}>
                <article className="group border-t border-white/10 py-7 transition-colors duration-200 hover:border-blue/30">
                  <h3 className="font-display text-lg font-semibold tracking-tight sm:text-xl">
                    {p.title}
                  </h3>
                  <p className="mt-2 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
                    {p.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
      {/* The flythrough that used to open the site, now where it belongs:
          the room the work gets made in, at the end of the story about it. */}
      <AboutFilm />
    </section>
  )
}
