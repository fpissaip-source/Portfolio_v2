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

        <Reveal delay={0.15}>
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
            {DETAILS.map((d) => {
              const inner = (
                <div className="glass flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center transition-colors hover:border-white/20">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue/10">
                    <d.icon className="h-5 w-5 text-blue" />
                  </span>
                  <span className="text-sm font-medium tracking-tight text-muted-foreground">
                    {d.label}
                  </span>
                  <span className="text-base font-medium text-foreground">
                    {d.value}
                  </span>
                </div>
              )
              return d.href ? (
                <a key={d.label} href={d.href} className="block">
                  {inner}
                </a>
              ) : (
                <div key={d.label}>{inner}</div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
