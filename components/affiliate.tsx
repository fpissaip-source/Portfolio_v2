'use client'

import {
  ArrowRight,
  BarChart3,
  CircleCheck,
  Clock3,
  Euro,
  Link2,
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
    heading: '2.000–4.000 € Projektwert. Bis zu 1.320 € Provision.',
    description:
      'Vermittle passende Neukunden für Website-Projekte. Wir übernehmen Beratung, Angebot, Umsetzung und Betreuung – du verdienst bei einem erfolgreichen Abschluss bis zu 33 %.',
    commissionTitle: '660–1.320 € je Website',
    commissionBody:
      'Bei typischen Projektwerten zwischen 2.000 und 4.000 € kann deine Provision pro erfolgreicher Vermittlung vierstellig ausfallen.',
    dashboardTitle: 'Klarer Partnerbereich',
    dashboardBody:
      'Leads, Projektstatus, Auftragswerte, bestätigte Provisionen und Auszahlungen übersichtlich an einem Ort.',
    payoutTitle: 'Wöchentlich oder monatlich',
    payoutBody:
      'Du entscheidest, ob freigegebene Provisionen wöchentlich gebündelt oder einmal monatlich ausgezahlt werden.',
    dashboardEyebrow: 'Partner-Dashboard · Vorschau',
    dashboardTitleLine: 'Deine Performance. Ohne Tabellenchaos.',
    live: 'Live synchronisiert',
    period: 'Letzte 30 Tage',
    generatedCommission: 'Erzielte Provision',
    activeLeads: 'Aktive Leads',
    conversionRate: 'Abschlussquote',
    approved: 'Freigegeben',
    performanceTitle: 'Provisionsentwicklung',
    performanceBody: 'Bestätigte und erwartete Provision aus vermittelten Projekten',
    thisMonth: 'Dieser Monat',
    referralsTitle: 'Aktuelle Vermittlungen',
    referralsBody: 'Vom Erstkontakt bis zur Auszahlung',
    project: 'Projekt',
    projectValue: 'Auftragswert',
    commission: 'Provision',
    statusConfirmed: 'Bestätigt',
    statusConsultation: 'In Beratung',
    statusPaid: 'Ausgezahlt',
    payoutEyebrow: 'Auszahlung',
    payoutAvailable: 'Aktuell verfügbar',
    payoutReady: 'Zur Auszahlung freigegeben',
    payoutCadence: 'Auszahlungsrhythmus',
    weekly: 'Wöchentlich',
    monthly: 'Monatlich',
    payoutHint: 'Der Rhythmus kann im Partnerprofil angepasst werden.',
    exampleEyebrow: 'Beispielrechnung',
    exampleTitle: 'Eine vermittelte Website',
    salePrice: 'Projektwert',
    commissionRate: 'Provision bis zu',
    yourShare: 'Dein möglicher Anteil',
    trackingTitle: 'Lückenloses Tracking',
    trackingBody: 'Jeder Lead erhält einen eindeutigen Status und eine nachvollziehbare Historie.',
    ctaEyebrow: 'Werde Wachstumspartner',
    ctaTitle: 'Du kennst Unternehmen, die eine bessere Website brauchen?',
    ctaBody:
      'Stell den Kontakt her. Wir übernehmen Verkauf, Entwicklung und Support – du verdienst am erfolgreich abgeschlossenen Projekt mit.',
    cta: 'Als Partner bewerben',
    subject: 'Bewerbung für das Affiliate-Partnerprogramm',
    note:
      'Die konkrete Provisionshöhe richtet sich nach Projekt, Auftragswert und Beitrag zur Neukundengewinnung. Freigabe, wöchentliche oder monatliche Auszahlung und weitere Bedingungen werden im Partnervertrag festgelegt. Eine Provision entsteht bei einem erfolgreich abgeschlossenen und bezahlten Kundenprojekt.',
  },
  en: {
    kicker: 'Advertising / Affiliate',
    heading: '€2,000–€4,000 project value. Up to €1,320 commission.',
    description:
      'Refer suitable new clients for website projects. We handle consulting, proposals, delivery and support – you earn up to 33% when a project closes successfully.',
    commissionTitle: '€660–€1,320 per website',
    commissionBody:
      'With typical project values between €2,000 and €4,000, a successful referral can generate a four-figure commission.',
    dashboardTitle: 'A clear partner workspace',
    dashboardBody:
      'Leads, project status, contract values, confirmed commission and payouts in one focused view.',
    payoutTitle: 'Weekly or monthly',
    payoutBody:
      'Choose whether approved commissions are grouped into weekly payouts or paid once per month.',
    dashboardEyebrow: 'Partner dashboard · Preview',
    dashboardTitleLine: 'Your performance. Without spreadsheet chaos.',
    live: 'Live synced',
    period: 'Last 30 days',
    generatedCommission: 'Generated commission',
    activeLeads: 'Active leads',
    conversionRate: 'Conversion rate',
    approved: 'Approved',
    performanceTitle: 'Commission growth',
    performanceBody: 'Confirmed and expected commission from referred projects',
    thisMonth: 'This month',
    referralsTitle: 'Current referrals',
    referralsBody: 'From first contact to payout',
    project: 'Project',
    projectValue: 'Contract value',
    commission: 'Commission',
    statusConfirmed: 'Confirmed',
    statusConsultation: 'In consultation',
    statusPaid: 'Paid',
    payoutEyebrow: 'Payout',
    payoutAvailable: 'Available now',
    payoutReady: 'Approved for payout',
    payoutCadence: 'Payout cadence',
    weekly: 'Weekly',
    monthly: 'Monthly',
    payoutHint: 'The cadence can be changed in the partner profile.',
    exampleEyebrow: 'Example calculation',
    exampleTitle: 'One referred website',
    salePrice: 'Project value',
    commissionRate: 'Commission up to',
    yourShare: 'Your potential share',
    trackingTitle: 'Complete tracking',
    trackingBody: 'Every lead receives a clear status and a transparent history.',
    ctaEyebrow: 'Become a growth partner',
    ctaTitle: 'Know a business that needs a better website?',
    ctaBody:
      'Make the introduction. We handle sales, development and support – you earn from the successfully completed project.',
    cta: 'Apply as a partner',
    subject: 'Application for the affiliate partner program',
    note:
      'The exact commission depends on the project, contract value and contribution to acquiring the client. Approval, weekly or monthly payouts and further terms are defined in the partner agreement. Commission is earned on a successfully completed and paid client project.',
  },
} as const

const METRICS = [
  { key: 'generatedCommission', value: '3.420 €', change: '+24,8 %', icon: Euro },
  { key: 'activeLeads', value: '12', change: '+3', icon: Users },
  { key: 'conversionRate', value: '33,2 %', change: '+5,1 %', icon: TrendingUp },
  { key: 'approved', value: '2.480 €', change: '72 %', icon: CircleCheck },
] as const

const CHART_POINTS = '0,164 68,148 136,154 204,119 272,128 340,91 408,101 476,56 544,67 612,24'

export function Affiliate() {
  const { lang } = useLanguage()
  const t = lang === 'en' ? COPY.en : COPY.de
  const english = lang === 'en'

  const metrics = METRICS.map((metric) => ({
    ...metric,
    label: t[metric.key],
    change:
      english && metric.change.includes(',') ? metric.change.replace(',', '.').replace(' %', '%') : metric.change,
  }))

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

  const referrals = [
    {
      name: english ? 'Local trades company' : 'Lokaler Handwerksbetrieb',
      status: t.statusConfirmed,
      value: '3.800 €',
      commission: '1.254 €',
      dot: 'bg-emerald-300',
    },
    {
      name: english ? 'Healthcare practice' : 'Praxis & Gesundheit',
      status: t.statusConsultation,
      value: '2.600 €',
      commission: '858 €',
      dot: 'bg-blue',
    },
    {
      name: english ? 'B2B service provider' : 'B2B-Dienstleister',
      status: t.statusPaid,
      value: '4.000 €',
      commission: '1.320 €',
      dot: 'bg-purple',
    },
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
            'radial-gradient(ellipse 60% 45% at 18% 22%, color-mix(in oklch, var(--purple) 12%, transparent), transparent 72%), radial-gradient(ellipse 52% 42% at 84% 76%, color-mix(in oklch, var(--blue) 10%, transparent), transparent 74%)',
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
              <article
                className={`h-full px-2 py-9 sm:px-6 lg:px-9 ${
                  index < benefits.length - 1
                    ? 'border-b border-white/10 lg:border-b-0 lg:border-r'
                    : ''
                }`}
              >
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

        <Reveal delay={0.14}>
          <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[#07090e]/90 shadow-[0_42px_140px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:mt-20">
            <header className="flex flex-col gap-5 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.75)]" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-blue/80">
                    {t.dashboardEyebrow}
                  </p>
                </div>
                <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {t.dashboardTitleLine}
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden items-center gap-2 text-xs text-emerald-300/80 sm:flex">
                  <CircleCheck className="h-3.5 w-3.5" aria-hidden />
                  {t.live}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-medium text-muted-foreground">
                  {t.period}
                </span>
              </div>
            </header>

            <div className="grid lg:grid-cols-[1.55fr_0.85fr]">
              <div className="border-b border-white/8 lg:border-b-0 lg:border-r">
                <div className="grid grid-cols-2 border-b border-white/8 sm:grid-cols-4">
                  {metrics.map((metric, index) => (
                    <div
                      key={metric.label}
                      className={`p-5 sm:p-6 ${
                        index % 2 === 0 ? 'border-r border-white/8' : ''
                      } ${index < 2 ? 'border-b border-white/8 sm:border-b-0' : ''} ${
                        index < 3 ? 'sm:border-r sm:border-white/8' : 'sm:border-r-0'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <metric.icon className="h-4 w-4 text-blue/70" aria-hidden />
                        <span className="text-[10px] font-medium text-emerald-300/75">
                          {metric.change}
                        </span>
                      </div>
                      <p className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
                        {metric.value}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-5 sm:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.performanceTitle}</p>
                      <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
                        {t.performanceBody}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {t.thisMonth}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-foreground">3.420 €</p>
                    </div>
                  </div>

                  <div className="mt-7 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.018] p-4 sm:p-5">
                    <svg
                      viewBox="0 0 612 190"
                      role="img"
                      aria-label={t.performanceTitle}
                      className="h-44 w-full overflow-visible"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="affiliate-area" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--blue)" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="var(--purple)" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="affiliate-line" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="var(--purple)" />
                          <stop offset="100%" stopColor="var(--blue)" />
                        </linearGradient>
                      </defs>
                      {[42, 84, 126, 168].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          y1={y}
                          x2="612"
                          y2={y}
                          stroke="rgba(255,255,255,0.055)"
                          strokeWidth="1"
                        />
                      ))}
                      <polygon points={`0,190 ${CHART_POINTS} 612,190`} fill="url(#affiliate-area)" />
                      <polyline
                        points={CHART_POINTS}
                        fill="none"
                        stroke="url(#affiliate-line)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {[
                        [0, 164],
                        [204, 119],
                        [408, 101],
                        [612, 24],
                      ].map(([x, y]) => (
                        <circle
                          key={`${x}-${y}`}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#07090e"
                          stroke="var(--blue)"
                          strokeWidth="3"
                        />
                      ))}
                    </svg>
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground/65">
                      <span>W1</span>
                      <span>W2</span>
                      <span>W3</span>
                      <span>W4</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{t.referralsTitle}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{t.referralsBody}</p>
                      </div>
                      <Link2 className="h-4 w-4 text-purple/75" aria-hidden />
                    </div>

                    <div className="mt-5 overflow-hidden rounded-2xl border border-white/8">
                      <div className="hidden grid-cols-[1.4fr_0.8fr_0.8fr] gap-4 border-b border-white/8 px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/65 sm:grid">
                        <span>{t.project}</span>
                        <span>{t.projectValue}</span>
                        <span className="text-right">{t.commission}</span>
                      </div>
                      {referrals.map((referral, index) => (
                        <div
                          key={referral.name}
                          className={`grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_0.8fr_0.8fr] sm:items-center ${
                            index < referrals.length - 1 ? 'border-b border-white/8' : ''
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{referral.name}</p>
                            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className={`h-1.5 w-1.5 rounded-full ${referral.dot}`} />
                              {referral.status}
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:block">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60 sm:hidden">
                              {t.projectValue}
                            </span>
                            <span className="text-sm text-foreground/85">{referral.value}</span>
                          </div>
                          <div className="flex items-center justify-between sm:block sm:text-right">
                            <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/60 sm:hidden">
                              {t.commission}
                            </span>
                            <span className="text-sm font-semibold text-emerald-300/90">
                              {referral.commission}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-4 p-5 sm:p-8">
                <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-purple/85">
                      {t.payoutEyebrow}
                    </p>
                    <Wallet className="h-4 w-4 text-purple/75" aria-hidden />
                  </div>
                  <p className="mt-6 text-sm text-muted-foreground">{t.payoutAvailable}</p>
                  <p className="mt-1 font-display text-5xl font-semibold tracking-[-0.05em] text-foreground">
                    1.240 €
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.7)]" />
                    {t.payoutReady}
                  </div>

                  <div className="mt-7 border-t border-white/8 pt-6">
                    <p className="text-xs font-medium text-foreground/85">{t.payoutCadence}</p>
                    <div className="mt-3 grid grid-cols-2 rounded-xl border border-white/8 bg-black/25 p-1">
                      <span className="rounded-lg bg-white/10 px-3 py-2.5 text-center text-xs font-semibold text-foreground shadow-sm">
                        {t.weekly}
                      </span>
                      <span className="px-3 py-2.5 text-center text-xs font-medium text-muted-foreground">
                        {t.monthly}
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground/70">
                      {t.payoutHint}
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-blue/15 bg-blue/[0.035] p-6">
                  <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue/80">
                    {t.exampleEyebrow}
                  </p>
                  <h4 className="mt-3 font-display text-xl font-semibold tracking-tight text-foreground">
                    {t.exampleTitle}
                  </h4>
                  <dl className="mt-6 space-y-4">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-muted-foreground">{t.salePrice}</dt>
                      <dd className="font-medium text-foreground">4.000 €</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <dt className="text-muted-foreground">{t.commissionRate}</dt>
                      <dd className="font-medium text-foreground">33 %</dd>
                    </div>
                    <div className="border-t border-white/8 pt-4">
                      <dt className="text-xs text-muted-foreground">{t.yourShare}</dt>
                      <dd className="mt-1 font-display text-4xl font-semibold tracking-[-0.04em] text-blue">
                        1.320 €
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-3xl border border-white/8 p-6">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-purple/75" aria-hidden />
                    <p className="text-sm font-semibold text-foreground">{t.trackingTitle}</p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t.trackingBody}
                  </p>
                  <div className="mt-5 space-y-2">
                    {[78, 58, 92].map((width, index) => (
                      <div key={width} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue/70" />
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple/70 to-blue/80"
                            style={{ width: `${width - index * 3}%` }}
                          />
                        </div>
                      </div>
                    ))}
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
