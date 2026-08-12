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

function BorderTrail() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-px h-px opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
      style={{
        background:
          'radial-gradient(28rem 1px at var(--trail-x, 50%) 50%, color-mix(in oklch, var(--blue) 85%, white), color-mix(in oklch, var(--blue) 45%, transparent) 35%, transparent 70%)',
      }}
    />
  )
}

function trackTrail(event: React.PointerEvent<HTMLElement>) {
  const element = event.currentTarget
  element.style.setProperty(
    '--trail-x',
    `${event.clientX - element.getBoundingClientRect().left}px`,
  )
}

export function Services() {
  const t = useT()
  const closingHighlight = splitClosingHighlight(t.services.closingHighlight)

  return (
    <section id="services" className="relative mx-auto max-w-7xl px-6 py-32 2xl:max-w-[96rem]">
      <SectionHeading
        label={t.services.kicker}
        heading={t.services.heading}
        description={t.services.intro}
        tone="blue"
        align="left"
        className="mb-16"
      />

      <div>
        {t.services.items.map((item, index) => {
          const Icon = ICONS[index % ICONS.length]
          return (
            <Reveal key={item.title} delay={Math.min(index, 3) * 0.05} y={24}>
              <article
                onPointerMove={trackTrail}
                className="group relative grid gap-x-10 gap-y-4 border-t border-white/10 py-8 transition-colors duration-200 hover:border-blue/30 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:py-10"
              >
                <BorderTrail />
                <div className="flex items-start gap-3">
                  <Icon
                    className="mt-1 h-4 w-4 shrink-0 text-blue/70 transition-colors duration-200 group-hover:text-blue"
                    aria-hidden
                  />
                  <h3 className="text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                    {item.title}
                  </h3>
                </div>

                <div className="max-w-[62ch]">
                  <p className="text-pretty text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
                    {item.lead}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 text-[15px] leading-snug text-foreground/75"
                      >
                        <span
                          aria-hidden
                          className="h-1 w-1 shrink-0 rounded-full bg-blue/60 transition-colors duration-200 group-hover:bg-blue"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>

      <Reveal delay={0.15} y={24}>
        <div className="mt-20 border-t border-white/20 pt-12">
          <h3 className="max-w-3xl text-balance font-display text-2xl font-semibold leading-[1.15] tracking-tight sm:text-3xl">
            {t.services.closingKicker}
          </h3>

          <p className="mt-5 max-w-[48ch] text-pretty text-[17px] leading-[1.6] text-foreground/80">
            {t.services.closingBody}
          </p>

          <div className="mt-10">
            {closingHighlight.label && (
              <p className="font-label text-[12px] uppercase tracking-[0.22em] text-purple/90 sm:text-[11px]">
                {closingHighlight.label.replace(/:$/, '')}
              </p>
            )}
            <p className="mt-3 max-w-3xl text-balance font-display text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
              {closingHighlight.body}
            </p>
            <a
              href="#contact"
              onClick={(event) => {
                const element = document.getElementById('contact')
                const lenis = (
                  window as unknown as {
                    __lenis?: { scrollTo: (target: Element, options?: object) => void }
                  }
                ).__lenis
                if (element && lenis) {
                  event.preventDefault()
                  lenis.scrollTo(element, { offset: 0 })
                }
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-purple/40 px-6 py-3 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-purple/70 hover:bg-purple/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
              {t.services.cta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
