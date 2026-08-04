'use client'

import { ArrowRight, BarChart3, Euro, Wallet } from 'lucide-react'
import { Reveal } from './anim'
import { SectionHeading } from './section-heading'
import { useLanguage } from './language-context'

const COPY = {
  de: {
    kicker: 'Partnerprogramm',
    heading: 'Mindestens 660,00 € Provision pro Vermittlung.',
    description: 'Wenige Kontakte können bereits eine starke Zusatzeinnahme erzeugen.',
    commissionTitle: 'Klare Provision',
    commissionBody: 'Mindestens 660,00 € pro bezahltem Kundenprojekt.',
    dashboardTitle: 'Partner-Dashboard',
    dashboardBody: 'Leads und Provisionen auf einen Blick.',
    payoutTitle: 'Flexible Auszahlung',
    payoutBody: 'Wöchentlich oder monatlich.',
    processKicker: 'Ablauf',
    processHeading: 'Kontakt. Abschluss. Provision.',
    processBody: 'Du empfiehlst. Ich übernehme den Rest.',
    step1Title: 'Kontakt herstellen',
    step1Body: 'Du stellst ein passendes Unternehmen vor.',
    step2Title: 'Projekt abschließen',
    step2Body: 'Ich übernehme Beratung, Angebot und Umsetzung.',
    step3Title: 'Provision erhalten',
    step3Body: 'Nach Zahlung wird deine Provision freigegeben.',
    ctaTitle: 'Du kennst ein passendes Unternehmen?',
    ctaBody: 'Dann lass uns kurz über die Vermittlung sprechen.',
    cta: 'Partnerprogramm anfragen',
    subject: 'Anfrage zum Affiliate-Partnerprogramm',
    note: 'Details zu Provision und Auszahlung werden vorab vereinbart.',
  },
  en: {
    kicker: 'Partner programme',
    heading: 'At least €660.00 commission per referral.',
    description: 'A few strong introductions can already create meaningful extra income.',
    commissionTitle: 'Clear commission',
    commissionBody: 'At least €660.00 per fully paid client project.',
    dashboardTitle: 'Partner dashboard',
    dashboardBody: 'Leads and commission at a glance.',
    payoutTitle: 'Flexible payout',
    payoutBody: 'Weekly or monthly.',
    processKicker: 'Process',
    processHeading: 'Introduction. Close. Commission.',
    processBody: 'You refer. I handle the rest.',
    step1Title: 'Make the introduction',
    step1Body: 'Introduce a suitable business.',
    step2Title: 'Close the project',
    step2Body: 'I handle consulting, the proposal and delivery.',
    step3Title: 'Receive commission',
    step3Body: 'Your commission is approved after payment.',
    ctaTitle: 'Know a suitable business?',
    ctaBody: 'Let us talk briefly about the referral.',
    cta: 'Ask about the partner programme',
    subject: 'Affiliate partner programme inquiry',
    note: 'Commission and payout details are agreed in advance.',
  },
} as const

type AffiliateProps = {
  standalone?: boolean
}

export function Affiliate({ standalone = false }: AffiliateProps) {
  const { lang } = useLanguage()
  const t = lang === 'en' ? COPY.en : COPY.de

  const benefits = [
    { icon: Euro, title: t.commissionTitle, body: t.commissionBody },
    { icon: BarChart3, title: t.dashboardTitle, body: t.dashboardBody },
    { icon: Wallet, title: t.payoutTitle, body: t.payoutBody },
  ]

  const steps = [
    { title: t.step1Title, body: t.step1Body },
    { title: t.step2Title, body: t.step2Body },
    { title: t.step3Title, body: t.step3Body },
  ]

  return (
    <section
      id="affiliate"
      className={`relative overflow-hidden px-5 sm:px-6 ${
        standalone
          ? 'border-t border-white/10 bg-[#02040d]/82 py-16 backdrop-blur-sm sm:py-20'
          : 'border-t border-white/5 py-28 sm:py-36'
      }`}
    >
      <div className="relative z-10 mx-auto max-w-7xl">
        {!standalone && (
          <SectionHeading
            label={t.kicker}
            heading={t.heading}
            description={t.description}
            tone="purple"
            headingClassName="max-w-5xl text-4xl leading-[1.02] sm:text-6xl lg:text-7xl"
            descriptionClassName="max-w-2xl"
            className="mb-14 sm:mb-20"
          />
        )}

        {!standalone && (
          <Reveal delay={0.08}>
            <div id="benefits" className="grid border-y border-white/10 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <article
                  key={benefit.title}
                  className={`py-9 lg:px-9 lg:py-11 ${
                    index < benefits.length - 1
                      ? 'border-b border-white/10 lg:border-b-0 lg:border-r'
                      : ''
                  } ${index === 0 ? 'lg:pl-0' : ''} ${index === benefits.length - 1 ? 'lg:pr-0' : ''}`}
                >
                  <benefit.icon className="h-5 w-5 text-blue/80" aria-hidden />
                  <h2 className="mt-5 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {benefit.title}
                  </h2>
                  <p className="mt-3 max-w-sm text-base font-medium leading-relaxed text-foreground/72">
                    {benefit.body}
                  </p>
                </article>
              ))}
            </div>
          </Reveal>
        )}

        <Reveal delay={standalone ? 0.04 : 0.12}>
          <div
            id="process"
            className={`scroll-mt-24 ${
              standalone
                ? 'grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16'
                : 'mt-20 grid gap-10 border-b border-white/10 pb-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16'
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-blue/90">{t.processKicker}</p>
              <h2 className="mt-3 max-w-md text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {t.processHeading}
              </h2>
              <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-white/72 sm:text-lg">
                {t.processBody}
              </p>
            </div>

            <ol className="border-t border-white/15">
              {steps.map((step, index) => (
                <li
                  key={step.title}
                  className="grid gap-3 border-b border-white/15 py-5 sm:grid-cols-[3rem_1fr] sm:gap-5 sm:py-6"
                >
                  <span className="text-sm font-semibold text-purple/90">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-base font-medium leading-relaxed text-white/70">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-14 flex flex-col items-start justify-between gap-7 border-t border-white/15 pt-8 sm:flex-row sm:items-end">
            <div>
              <h2 className="max-w-2xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
                {t.ctaTitle}
              </h2>
              <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-white/70">
                {t.ctaBody}
              </p>
            </div>

            <a
              href={`mailto:info@hareb.org?subject=${encodeURIComponent(t.subject)}`}
              className="group inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-[#02040d] transition-transform hover:-translate-y-0.5 sm:text-base"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
          <p className="mt-5 text-sm font-medium leading-relaxed text-white/55">
            {t.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
