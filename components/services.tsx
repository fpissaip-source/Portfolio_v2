'use client'

import { Globe, LayoutDashboard, Bot, Rocket, Phone } from 'lucide-react'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

const ICONS = [Globe, LayoutDashboard, Bot, Rocket, Phone]

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
        <div className="glass mt-4 rounded-2xl p-6 sm:p-9">
          <h3 className="max-w-3xl text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
            {t.services.closingKicker}
          </h3>

          <p className="mt-5 max-w-3xl text-pretty leading-relaxed text-muted-foreground">
            {t.services.closingBody}
          </p>

          <div className="mt-8 border-t border-white/10 pt-6">
            {closingHighlight.label && (
              <p className="text-sm font-medium text-purple/80">
                {closingHighlight.label}
              </p>
            )}
            <p className="mt-2 max-w-3xl text-pretty text-xl font-semibold leading-relaxed tracking-tight text-foreground sm:text-2xl">
              {closingHighlight.body}
            </p>
            {/* The shortcut for a convinced reader: interest peaks right
                here, the contact section sits six scenes further down —
                bridge it instead of hoping they scroll the whole way. */}
            <a
              href="#contact"
              onClick={(e) => {
                const el = document.getElementById('contact')
                const lenis = (
                  window as unknown as {
                    __lenis?: { scrollTo: (t: Element, o?: object) => void }
                  }
                ).__lenis
                if (el && lenis) {
                  e.preventDefault()
                  lenis.scrollTo(el, { offset: 0 })
                }
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-purple/40 bg-purple/10 px-6 py-3 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-purple/70 hover:bg-purple/15"
            >
              {t.services.cta} →
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
