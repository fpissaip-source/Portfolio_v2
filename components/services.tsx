'use client'

import { Globe, LayoutDashboard, Bot, Rocket } from 'lucide-react'
import { Reveal, WordReveal } from './anim'
import { useT } from './language-context'

const ICONS = [Globe, LayoutDashboard, Bot, Rocket]

function splitClosingHighlight(copy: string) {
  const colon = copy.indexOf(':')
  if (colon === -1) return { label: '', body: copy }
  return {
    label: copy.slice(0, colon + 1),
    body: copy.slice(colon + 1).trim(),
  }
}

export function Services() {
  const t = useT()
  const closingHighlight = splitClosingHighlight(t.services.closingHighlight)

  return (
    <section id="services" className="relative mx-auto max-w-6xl px-6 py-32">
      <div className="mx-auto mb-16 flex max-w-2xl flex-col items-center gap-4 text-center">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
            {t.services.kicker}
          </span>
        </Reveal>
        <WordReveal
          as="h2"
          text={t.services.heading}
          className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="text-pretty leading-relaxed text-muted-foreground">
            {t.services.intro}
          </p>
        </Reveal>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {t.services.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Reveal key={item.title} delay={i * 0.05} y={30}>
              <div className="group glass h-full rounded-2xl p-6 transition-colors hover:border-white/20 sm:p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={0.2} y={30}>
        <div className="glass relative mt-4 overflow-hidden rounded-2xl p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-purple/15 blur-3xl"
          />
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
            {t.services.closingKicker}
          </span>
          <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
            {t.services.closingBody}
          </p>
          {closingHighlight.label && (
            <p className="mt-4 max-w-3xl text-pretty text-sm font-semibold uppercase tracking-[0.1em] text-purple">
              {closingHighlight.label}
            </p>
          )}
          <p className="mt-2 max-w-3xl text-pretty text-lg font-semibold leading-relaxed tracking-tight text-foreground">
            {closingHighlight.body}
          </p>
        </div>
      </Reveal>
    </section>
  )
}
