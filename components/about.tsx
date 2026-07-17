'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'motion/react'
import { Smartphone } from 'lucide-react'
import { Reveal, WordReveal } from './anim'

const STORY = [
  {
    era: 'The Start',
    title: 'Drawn to the digital world',
    body: "I'm Issa, 24, based in Essen. For as long as I can remember I've been curious about the digital world and everything you can build in it — long before I ever wrote a line of code.",
  },
  {
    era: 'The Foundation',
    title: 'Fachabitur, then the real world',
    body: 'I earned my Fachabitur in business and administration with strong grades — and then kept it grounded, working a string of full-time jobs and learning how things actually run.',
  },
  {
    era: 'The Spark',
    title: 'Then AI changed everything',
    body: 'When OpenAI set the AI wave rolling with ChatGPT, something clicked. It woke a passion I never knew I had — suddenly the digital world I had always watched became something I could build in.',
  },
  {
    era: 'Today',
    title: 'Learning something new, every day',
    body: 'Since that day I have taught myself something new every single day, and I make a point of staying on the leading edge of what is possible. Everything on this site is the result.',
  },
]

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
    body: "This is where I go deepest. I've nearly mastered working with modern AI, using it as a genuine engineering partner to design, write and ship production systems, complete with the retrieval, tooling and guardrails that make it dependable.",
  },
  {
    title: 'System Thinking',
    body: 'I design for the whole loop, from inputs and feedback to failure and recovery, not just the happy path.',
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
                <span className="font-semibold">nearly mastered the use of AI</span>,
                and I&apos;ve done it without a computer. Every architecture
                decision, every line of code and every deployment happens
                entirely from my iPhone. It forced me to think sharper, lean on
                AI as a real engineering partner, and prove that great software
                is about how you think, not the hardware you own.
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

      {/* The story so far — a glowing timeline instead of a wall of text,
          designed to still feel alive on a narrow phone screen. */}
      <div className="mt-28">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
            Origin story
          </span>
        </Reveal>
        <WordReveal
          as="h2"
          text="The story so far."
          className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
        />

        <ol className="relative mt-12 max-w-3xl">
          {/* glowing spine */}
          <div
            aria-hidden
            className="absolute bottom-2 left-[7px] top-2 w-px"
            style={{
              background:
                'linear-gradient(to bottom, color-mix(in oklch, var(--blue) 70%, transparent), color-mix(in oklch, var(--purple) 70%, transparent), transparent)',
            }}
          />
          {STORY.map((s, i) => (
            <li key={s.era} className="relative pb-12 pl-10 last:pb-0">
              {/* pulsing node on the spine */}
              <span
                aria-hidden
                className="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-blue/25 [animation-duration:3s]" />
                <span
                  className="h-2 w-2 rounded-full bg-blue"
                  style={{
                    boxShadow:
                      '0 0 10px color-mix(in oklch, var(--blue) 90%, transparent), 0 0 26px color-mix(in oklch, var(--purple) 55%, transparent)',
                  }}
                />
              </span>
              <Reveal delay={i * 0.06} y={24}>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-purple/90">
                  {s.era}
                </span>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
