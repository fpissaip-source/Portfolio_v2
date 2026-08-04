'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { Reveal } from './anim'
import { GradientOrbs } from './gradient-orbs'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

export function Contact() {
  const t = useT()
  const details = [
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
    <section id="contact" className="relative overflow-hidden px-6 py-32 sm:py-40">
      <GradientOrbs />

      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionHeading
          label={t.contact.kicker}
          heading={t.contact.heading}
          description={t.contact.subtitle}
          tone="blue"
          className="mb-14"
          headingClassName="mx-auto max-w-3xl text-4xl leading-[1.02] sm:text-6xl lg:text-7xl"
          descriptionClassName="mx-auto max-w-lg"
        />

        <Reveal delay={0.15}>
          <dl className="mx-auto grid max-w-3xl gap-x-10 gap-y-8 border-y border-white/10 py-10 sm:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="text-center sm:text-left">
                <dt className="flex items-center justify-center gap-2 text-xs font-medium tracking-tight text-muted-foreground sm:justify-start">
                  <detail.icon className="h-3.5 w-3.5 text-blue/70" aria-hidden />
                  {detail.label}
                </dt>
                <dd className="mt-3">
                  {detail.href ? (
                    <a
                      href={detail.href}
                      className="inline-block text-lg font-medium tracking-tight text-foreground underline decoration-blue/40 decoration-1 underline-offset-[6px] transition-colors hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue sm:text-xl"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    <span className="text-lg font-medium tracking-tight text-muted-foreground sm:text-xl">
                      {detail.value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={0.22}>
          <div className="mt-16 border-y border-purple/25 py-12 text-center sm:py-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-purple sm:text-[11px]">
              {t.contact.offerLabel}
            </p>
            <h3 className="mx-auto mt-4 max-w-xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
              {t.contact.offerTitle}
            </h3>
            <p className="mx-auto mt-5 max-w-lg text-pretty leading-relaxed text-muted-foreground">
              {t.contact.offerBody}
            </p>
            <a
              href={`mailto:info@hareb.org?subject=${encodeURIComponent(t.contact.offerSubject)}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-semibold tracking-tight text-background transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
              {t.contact.offerCta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-8 flex justify-center">
            <a
              href={`mailto:info@hareb.org?subject=${encodeURIComponent(t.contact.ctaSubject)}`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium tracking-tight text-muted-foreground underline decoration-white/15 underline-offset-[6px] transition-colors hover:text-foreground hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
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
