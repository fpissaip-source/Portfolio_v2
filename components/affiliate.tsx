'use client'

import {
  ArrowRight,
  BarChart3,
  MousePointerClick,
  Percent,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { Reveal } from './anim'
import { SectionHeading } from './section-heading'
import { useLanguage } from './language-context'

const COPY = {
  de: {
    kicker: 'Advertising / Affiliate',
    heading: 'Empfehlen. Abschließen. Bis zu 33 % verdienen.',
    description:
      'Du bringst passende Neukunden mit Hareb Digital zusammen. Wir übernehmen Beratung, Umsetzung und Betreuung – du erhältst für erfolgreiche Projekte eine attraktive Provision.',
    commissionTitle: 'Bis zu 33 % Provision',
    commissionBody:
      'Deine Vergütung richtet sich nach Projektart, Auftragswert und deinem Beitrag zur Kundengewinnung.',
    dashboardTitle: 'Eigenes Partner-Dashboard',
    dashboardBody:
      'Behalte Klicks, Leads, Abschlüsse und deine bestätigte Provision übersichtlich im Blick.',
    payoutTitle: 'Nahtlose Auszahlung',
    payoutBody:
      'Freigegebene Provisionen werden transparent erfasst und ohne unnötige Umwege ausgezahlt.',
    dashboardEyebrow: 'Partner-Dashboard · Vorschau',
    dashboardTitleLine: 'Performance auf einen Blick',
    period: 'Letzte 30 Tage',
    clicks: 'Klicks',
    leads: 'Leads',
    customers: 'Neukunden',
    commission: 'Provision',
    chartTitle: 'Conversion-Performance',
    chartMeta: '+24,8 % zum Vormonat',
    payoutCard: 'Nächste Auszahlung',
    payoutStatus: 'Zur Auszahlung bereit',
    payoutDate: 'Voraussichtlich am 15. des Monats',
    ctaEyebrow: 'Werde Wachstumspartner',
    ctaTitle: 'Du kennst Unternehmen, die digital besser aufgestellt sein könnten?',
    ctaBody:
      'Stell den Kontakt her und verdiene an erfolgreich vermittelten Projekten mit – ohne selbst verkaufen, entwickeln oder Support leisten zu müssen.',
    cta: 'Als Partner bewerben',
    subject: 'Bewerbung für das Affiliate-Partnerprogramm',
    note:
      'Die konkrete Provisionshöhe, Freigabe und Auszahlung werden vorab im individuellen Partnervertrag festgelegt. Eine Provision entsteht nur bei erfolgreich abgeschlossenem und bezahltem Kundenprojekt.',
  },
  en: {
    kicker: 'Advertising / Affiliate',
    heading: 'Refer. Convert. Earn up to 33%.',
    description:
      'Connect suitable new clients with Hareb Digital. We handle consulting, delivery and support – you earn an attractive commission on successful projects.',
    commissionTitle: 'Up to 33% commission',
    commissionBody:
      'Your compensation depends on the project type, contract value and your contribution to acquiring the client.',
    dashboardTitle: 'Your own partner dashboard',
    dashboardBody:
      'Track clicks, leads, conversions and confirmed commission in one clear view.',
    payoutTitle: 'Seamless payouts',
    payoutBody:
      'Approved commissions are recorded transparently and paid without unnecessary friction.',
    dashboardEyebrow: 'Partner dashboard · Preview',
    dashboardTitleLine: 'Performance at a glance',
    period: 'Last 30 days',
    clicks: 'Clicks',
    leads: 'Leads',
    customers: 'New clients',
    commission: 'Commission',
    chartTitle: 'Conversion performance',
    chartMeta: '+24.8% month over month',
    payoutCard: 'Next payout',
    payoutStatus: 'Ready for payout',
    payoutDate: 'Expected on the 15th of the month',
    ctaEyebrow: 'Become a growth partner',
    ctaTitle: 'Know a business that should be performing better digitally?',
    ctaBody:
      'Make the introduction and earn from successfully referred projects – without having to sell, build or provide support yourself.',
    cta: 'Apply as a partner',
    subject: 'Application for the affiliate partner program',
    note:
      'The exact commission rate, approval and payout terms are agreed in an individual partner contract. Commission is earned only on successfully completed and paid client projects.',
  },
} as const

const CHART = [38, 52, 46, 67, 59, 78, 72, 94]

export function Affiliate() {
  const { lang } = useLanguage()
  const t = lang === 'en' ? COPY.en : COPY.de

  const benefits = [
    {
      icon: Percent,
      title: t.commissionTitle,
      body: t.commissionBody,
      accent: 'text-purple',
    },
    {
      icon: BarChart3,
      title: t.dashboardTitle,
      body: t.dashboardBody,
      accent: 'text-blue',
    },
    {
      icon: Wallet,
      title: t.payoutTitle,
      body: t.payoutBody,
      accent: 'text-purple',
    },
  ]

  const stats = [
    { icon: MousePointerClick, label: t.clicks, value: '2.481', detail: '+18,4 %' },
    { icon: Users, label: t.leads, value: '184', detail: '+11,2 %' },
    { icon: TrendingUp, label: t.customers, value: '61', detail: '+9,6 %' },
    { icon: Percent, label: t.commission, value: '3.420 €', detail: 'bestätigt' },
  ]

  return (
    <section
      id="affiliate"
      className="relative overflow-hidden border-t border-white/5 px-6 py-28 sm:py-36"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 18% 25%, color-mix(in oklch, var(--purple) 13%, transparent), transparent 72%), radial-gradient(ellipse 55% 45% at 82% 72%, color-mix(in oklch, var(--blue) 11%, transparent), transparent 74%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          label={t.kicker}
          heading={t.heading}
          description={t.description}
          tone="purple"
          headingClassName="max-w-5xl text-5xl leading-[0.98] sm:text-7xl lg:text-8xl"
          descriptionClassName="max-w-2xl text-base sm:text-lg"
          className="mb-16 sm:mb-20"
        />

        <div className="grid border-y border-white/10 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.08}>
              <article className="h-full border-b border-white/10 px-2 py-9 last:border-b-0 sm:px-6 lg:border-b-0 lg:border-r lg:px-9 lg:last:border-r-0">
                <benefit.icon className={`h-6 w-6 ${benefit.accent}`} aria-hidden />
                <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {benefit.title}
                </h3>
                <p className="mt-4 max-w-sm text-pretty leading-relaxed text-muted-foreground">
                  {benefit.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 shadow-[0_40px_120px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:mt-20">
            <div className="flex flex-col gap-5 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue/80">
                  {t.dashboardEyebrow}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {t.dashboardTitleLine}
                </h3>
              </div>
              <span className="w-max rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-muted-foreground">
                {t.period}
              </span>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.55fr_0.75fr]">
              <div className="border-b border-white/10 p-5 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <stat.icon className="h-4 w-4 text-blue/75" aria-hidden />
                        <span className="text-[10px] font-medium text-emerald-300/80">
                          {stat.detail}
                        </span>
                      </div>
                      <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.02] p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.chartTitle}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Clicks → Leads → Customers</p>
                    </div>
                    <p className="text-xs font-medium text-emerald-300/85">{t.chartMeta}</p>
                  </div>
                  <div className="mt-8 flex h-40 items-end gap-2 sm:gap-3">
                    {CHART.map((height, index) => (
                      <div
                        key={`${height}-${index}`}
                        className="group relative flex-1 overflow-hidden rounded-t-lg bg-white/[0.045]"
                        style={{ height: '100%' }}
                      >
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-t-lg bg-gradient-to-t from-purple/55 via-blue/65 to-blue transition-opacity group-hover:opacity-90"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="flex flex-col justify-between p-5 sm:p-8">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-purple/85">
                    {t.payoutCard}
                  </p>
                  <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.04em] text-foreground sm:text-6xl">
                    1.240 €
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-sm font-medium text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.8)]" />
                    {t.payoutStatus}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t.payoutDate}
                  </p>
                </div>

                <div className="mt-12 border-t border-white/10 pt-7">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tracking</span>
                    <span className="text-foreground">Live</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full w-[86%] rounded-full bg-gradient-to-r from-purple to-blue" />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-16 rounded-[2rem] border border-purple/25 bg-purple/[0.055] px-6 py-10 text-center sm:mt-20 sm:px-12 sm:py-14">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-purple">
              {t.ctaEyebrow}
            </p>
            <h3 className="mx-auto mt-4 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.ctaTitle}
            </h3>
            <p className="mx-auto mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground sm:text-lg">
              {t.ctaBody}
            </p>
            <a
              href={`mailto:info@hareb.org?subject=${encodeURIComponent(t.subject)}`}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-4 text-base font-semibold tracking-tight text-background transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <p className="mx-auto mt-7 max-w-3xl text-pretty text-[11px] leading-relaxed text-muted-foreground/70 sm:text-xs">
              {t.note}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
