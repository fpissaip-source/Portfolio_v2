'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { Smartphone } from 'lucide-react'
import { Reveal, WordReveal } from './anim'

const PILLARS = [
  {
    title: 'Problem Solving',
    body: 'I start from the real constraint, not the shiny tool. The right solution is the simplest one that survives production.',
  },
  {
    title: 'Software Architecture',
    body: 'Systems that stay clean as they scale: clear boundaries, predictable data flow, and interfaces that age well.',
  },
  {
    title: 'Automation',
    body: 'If it happens twice, it should run itself. I turn repetitive work into resilient, observable pipelines.',
  },
  {
    title: 'Artificial Intelligence',
    body: "This is where I go deepest. I build AI into real systems — with proper retrieval, tooling and guardrails, not just an API wrapper. The goal is always the same: make it dependable enough to ship.",
  },
  {
    title: 'System Thinking',
    body: 'I design for the whole loop, from inputs and feedback to failure and recovery, not just the happy path.',
  },
]

/** The personal side — Issa's own story, told as a short timeline. */
const STORY: { flag: string; title: string; body: string }[] = [
  {
    flag: 'Roots',
    title: 'Curious by default',
    body: "I've been drawn to the digital world and everything it makes possible for as long as I can remember.",
  },
  {
    flag: 'The spark',
    title: 'ChatGPT set the stone rolling',
    body: "When OpenAI kicked off the AI wave, it lit a passion I didn't know I had — suddenly all that curiosity had a direction.",
  },
  {
    flag: 'Since then',
    title: 'Something new every single day',
    body: 'I teach myself new things daily and do everything I can to stay right at the edge of what AI and software can do.',
  },
  {
    flag: 'On paper',
    title: 'Grounded in the real world',
    body: 'Fachabitur in business & administration, earned with good grades — plus full-time jobs along the way that taught me how work actually gets done.',
  },
]

function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })
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
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
              About
            </span>
          </Reveal>
          <WordReveal
            as="h2"
            text="I think in systems and ship in products."
            className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
              My work connects technical architecture, product thinking, visual
              design, automation and commercial deployment. From autonomous
              agents to live client systems: I ship the whole loop, not just
              the demo.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-8 max-w-md rounded-2xl border border-blue/25 bg-blue/[0.06] p-6">
              <div className="flex items-center gap-2 text-blue">
                <Smartphone className="h-5 w-5" />
                <span className="font-mono text-xs uppercase tracking-[0.25em]">
                  No PC. No laptop. Just an iPhone.
                </span>
              </div>
              <p className="mt-3 text-pretty leading-relaxed text-foreground">
                Here&apos;s what I&apos;m most proud of: I&apos;ve{' '}
                <span className="font-semibold">
                  built all of this without a computer
                </span>
                . Every architecture decision, every line of code and every
                deployment happens entirely from my iPhone. It forced me to
                think sharper, lean on AI as a real engineering partner, and
                prove that great software is about how you think, not the
                hardware you own.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid grid-cols-3 gap-6">
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={15} suffix="+" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Systems built
              </div>
            </div>
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={7} suffix="" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Product domains
              </div>
            </div>
            <div>
              <div className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={100} suffix="%" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Built on iPhone
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
                My Story
              </span>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                Hi, I&apos;m Issa — 24, self-taught, and all in on AI.
              </h3>
              <div className="relative mt-6 flex flex-col gap-6 border-l border-white/10 pl-6">
                {STORY.map((s) => (
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
          {PILLARS.map((p, i) => (
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
