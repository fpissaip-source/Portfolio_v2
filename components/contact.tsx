'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { WordReveal, Reveal } from './anim'
import { GradientOrbs } from './gradient-orbs'

const DETAILS = [
  {
    icon: Mail,
    label: 'Email',
    value: 'fpissa.ip@gmail.com',
    href: 'mailto:fpissa.ip@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '0172 8431115',
    href: 'tel:+491728431115',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Essen, Germany',
    href: null,
  },
]

export function Contact() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden px-6 py-32 sm:py-40"
    >
      <GradientOrbs />
      <div className="relative z-10 mx-auto max-w-4xl">
        <div className="mb-14 text-center">
          <Reveal>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
              Contact
            </span>
          </Reveal>
          <WordReveal
            as="h2"
            text="How to reach me."
            className="mx-auto mt-4 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] tracking-tight sm:text-7xl md:text-8xl"
          />
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-lg text-pretty text-muted-foreground">
              Currently open to engineering and AI-focused roles and
              collaborations.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-3">
            {DETAILS.map((d) => {
              const inner = (
                <div className="glass flex h-full flex-col items-center gap-3 rounded-2xl p-6 text-center transition-colors hover:border-white/20">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue/10">
                    <d.icon className="h-5 w-5 text-blue" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
