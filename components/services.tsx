'use client'

import { Globe, LayoutDashboard, Bot, Rocket } from 'lucide-react'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

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
      <SectionHeading
        label={t.services.kicker}
        heading={t.services.heading}
        description={t.services.intro}
        tone="blue"
        className="mx-auto mb-16 max-w-3xl"
        descriptionClassName="mx-auto"
      />

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
        <div className="glass relative mt-4 overflow-hidden rounded-2xl p-6 sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-purple/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-px w-2/3 bg-gradient-to-l from-blue/35 via-purple/30 to-transparent"
          />

          <div className="relative max-w-4xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-purple shadow-[0_0_16px_2px_color-mix(in_oklch,var(--purple)_55%,transparent)]"
              />
              <span className="h-px w-10 bg-gradient-to-r from-purple/70 to-transparent" />
            </div>

            <h3 className="mt-5 max-w-3xl text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {t.services.closingKicker}
            </h3>

            <p className="mt-5 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
              {t.services.closingBody}
            </p>

            <div className="mt-8 rounded-2xl border border-purple/20 bg-gradient-to-br from-purple/[0.08] via-white/[0.025] to-blue/[0.05] p-5 sm:p-6">
              {closingHighlight.label && (
                <p className="text-sm font-semibold tracking-tight text-purple">
                  {closingHighlight.label}
                </p>
              )}
              <p className="mt-2 max-w-3xl text-pretty text-xl font-semibold leading-relaxed tracking-tight text-foreground sm:text-2xl">
                {closingHighlight.body}
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
