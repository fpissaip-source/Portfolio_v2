'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { Reveal } from './anim'
import { GradientOrbs } from './gradient-orbs'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

export function Contact() {
  const t = useT()
  const DETAILS = [
    {
      icon: Mail,
      label: t.contact.emailLabel,
      value: 'info@hareb.org',
      href: 'mailto:info@hareb.org',
    },
    {
      icon: Phone,
      label: t.contact.phoneLabel,
      value: '01525 9559708',
      href: 'tel:+4915259559708',
    },
    {
      icon: MapPin,
      label: t.contact.locationLabel,
      value: t.contact.locationValue,
      href: null,
    },
  ]
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-32 sm:py-40"
    >
      <GradientOrbs />
      <div className="relative z-10 mx-auto max-w-4xl">
        <SectionHeading
          label={t.contact.kicker}
          heading={t.contact.heading}
          description={t.contact.subtitle}
          tone="blue"
          className="mb-14"
          headingClassName="mx-auto max-w-3xl text-5xl leading-[0.98] sm:text-7xl md:text-8xl"
          descriptionClassName="mx-auto max-w-lg"
        />

        {/* Contact details as fields on the canvas, not cards (DESIGN.md §5).
            The reachable ones are large, underlined-on-hover links so the
            affordance is obvious — the previous bordered boxes hid the fact
            that the address and number were tappable at all. */}
        <Reveal delay={0.15}>
          <dl className="mx-auto grid max-w-3xl gap-x-10 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-3">
            {DETAILS.map((d) => (
              <div key={d.label} className="text-center sm:text-left">
                <dt className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground sm:justify-start">
                  <d.icon className="h-3.5 w-3.5 text-blue/70" aria-hidden />
                  {d.label}
                </dt>
                <dd className="mt-3">
                  {d.href ? (
                    <a
                      href={d.href}
                      className="inline-block text-lg font-medium tracking-tight text-foreground underline decoration-blue/40 decoration-1 underline-offset-[6px] transition-colors hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue sm:text-xl"
                    >
                      {d.value}
                    </a>
                  ) : (
                    <span className="text-lg font-medium tracking-tight text-muted-foreground sm:text-xl">
                      {d.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* One primary action — the details above say how to reach me, this
            says what to do next. */}
        <Reveal delay={0.25}>
          <div className="mt-14 flex justify-center">
            <a
              href={`mailto:info@hareb.org?subject=${encodeURIComponent(t.contact.ctaSubject)}`}
              className="inline-flex items-center gap-2 rounded-full border border-blue/60 bg-blue/10 px-8 py-4 text-base font-semibold tracking-tight text-foreground transition-colors hover:border-blue/80 hover:bg-blue/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              {t.contact.cta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
