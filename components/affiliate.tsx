'use client'

import { ArrowRight, BarChart3, CircleCheck, Euro, Link2, Wallet } from 'lucide-react'
import { Reveal } from './anim'
import { SectionHeading } from './section-heading'
import { useLanguage } from './language-context'

const COPY = {
  de: {
    kicker: 'Partnerprogramm',
    heading: 'Mindestens 660,00 € Provision pro erfolgreicher Vermittlung.',
    description:
      'Je nach Projektart, Umfang, Auftragswert und deinem Beitrag zur Neukundengewinnung kann die Provision deutlich höher ausfallen.',
    minimumLabel: 'Mindestprovision',
    minimumValue: '660,00 €+',
    minimumNote: 'Pro erfolgreich abgeschlossenem und bezahltem Kundenprojekt.',
    moreLabel: 'Mehr ist möglich',
    moreBody:
      'Größere, komplexere oder besonders wertvolle Projekte werden entsprechend höher vergütet.',
    commissionTitle: 'Klare Vergütung',
    commissionBody:
      'Die Provisionshöhe wird vor der Vermittlung transparent festgelegt. Du weißt, was ein erfolgreicher Abschluss wert ist.',
    dashboardTitle: 'Eigenes Partner-Dashboard',
    dashboardBody:
      'Leads, Projektstatus, bestätigte Provisionen und Auszahlungen übersichtlich an einem Ort.',
    payoutTitle: 'Wöchentlich oder monatlich',
    payoutBody:
      'Du wählst, ob freigegebene Provisionen wöchentlich gebündelt oder einmal monatlich ausgezahlt werden.',
    processKicker: 'So funktioniert es',
    processHeading: 'Du stellst den Kontakt her. Wir übernehmen den Rest.',
    processBody:
      'Du brauchst weder zu entwickeln noch Support zu leisten. Deine Aufgabe ist die qualifizierte Empfehlung.',
    step1Title: 'Unternehmen empfehlen',
    step1Body:
      'Du stellst den Kontakt zu einem Unternehmen her, das eine Website, Software oder Automatisierung benötigt.',
    step2Title: 'Beratung und Abschluss',
    step2Body:
      'Wir prüfen den Bedarf, erstellen das Angebot und übernehmen Beratung, Umsetzung und Betreuung.',
    step3Title: 'Provision erhalten',
    step3Body:
      'Nach erfolgreichem Abschluss und Zahlung wird deine Provision freigegeben und im gewählten Rhythmus ausgezahlt.',
    ctaEyebrow: 'Als Partner starten',
    ctaTitle: 'Du kennst Unternehmen mit digitalem Nachholbedarf?',
    ctaBody:
      'Stell den Kontakt her und verdiene an erfolgreich vermittelten Projekten mit.',
    cta: 'Partnerprogramm anfragen',
    subject: 'Anfrage zum Affiliate-Partnerprogramm',
    note:
      'Die konkrete Provision, Freigabe und Auszahlung werden vorab im Partnervertrag festgelegt. Ein Anspruch entsteht bei erfolgreich abgeschlossenem und vollständig bezahltem Kundenprojekt.',
  },
  en: {
    kicker: 'Partner programme',
    heading: 'At least €660.00 commission per successful referral.',
    description:
      'Depending on the project type, scope, contract value and your contribution to acquiring the client, the commission can be considerably higher.',
    minimumLabel: 'Minimum commission',
    minimumValue: '€660.00+',
    minimumNote: 'Per successfully completed and fully paid client project.',
    moreLabel: 'Higher earnings are possible',
    moreBody:
      'Larger, more complex or particularly valuable projects are compensated accordingly.',
    commissionTitle: 'Clear compensation',
    commissionBody:
      'The commission is agreed transparently before the referral. You know what a successful deal is worth.',
    dashboardTitle: 'Your own partner dashboard',
    dashboardBody:
      'Leads, project status, confirmed commission and payouts in one clear place.',
    payoutTitle: 'Weekly or monthly',
    payoutBody:
      'Choose whether approved commissions are grouped into weekly payouts or paid once per month.',
    processKicker: 'How it works',
    processHeading: 'You make the introduction. We handle the rest.',
    processBody:
      'You do not need to build or provide support. Your role is the qualified referral.',
    step1Title: 'Refer a business',
    step1Body:
      'Introduce a business that needs a website, software product or automation.',
    step2Title: 'Consulting and close',
    step2Body:
      'We assess the need, prepare the proposal and handle consulting, delivery and support.',
    step3Title: 'Receive commission',
    step3Body:
      'After the project closes successfully and is paid, your commission is approved and paid on your chosen schedule.',
    ctaEyebrow: 'Become a partner',
    ctaTitle: 'Know a business that needs to improve digitally?',
    ctaBody:
      'Make the introduction and earn from successfully referred projects.',
    cta: 'Ask about the partner programme',
    subject: 'Affiliate partner programme inquiry',
    note:
      'The exact commission, approval and payout terms are agreed in the partner contract. Commission is earned on a successfully completed and fully paid client project.',
  },
} as const

export function Affiliate() {
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
    <section id="affiliate" className="relative overflow-hidden border-t border-white/5 px-6 py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 52% 42% at 18% 20%, color-mix(in oklch, var(--purple) 10%, transparent), transparent 74%), radial-gradient(ellipse 46% 38% at 84% 74%, color-mix(in oklch, var(--blue) 8%, transparent), transparent 76%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <SectionHeading
          label={t.kicker}
          heading={t.heading}
          description={t.description}
          tone="purple"
          headingClassName="max-w-5xl text-4xl leading-[1.02] sm:text-6xl lg:text-7xl"
          descriptionClassName="max-w-2xl"
          className="mb-14 sm:mb-20"
        />

        <Reveal delay={0.08}>
          <div className="grid border-y border-white/10 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col justify-between border-b border-white/10 py-10 lg:border-b-0 lg:border-r lg:pr-12">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-purple/85">
                  {t.minimumLabel}
                </p>
                <p className="mt-4 font-display text-6xl font-semibold tracking-[-0.055em] text-foreground sm:text-8xl">
                  {t.minimumValue}
                </p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {t.minimumNote}
                </p>
              </div>

              <div className="mt-10 border-t border-white/10 pt-7">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue">
                  <CircleCheck className="h-4 w-4" aria-hidden />
                  {t.moreLabel}
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {t.moreBody}
                </p>
              </div>
            </div>

            <div className="lg:pl-12">
              {benefits.map((benefit, index) => (
                <article
                  key={benefit.title}
                  className={`grid gap-4 py-8 sm:grid-cols-[auto_1fr] sm:gap-6 ${
                    index < benefits.length - 1 ? 'border-b border-white/10' : ''
                  }`}
                >
                  <benefit.icon className="mt-1 h-5 w-5 text-blue/75" aria-hidden />
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                      {benefit.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                      {benefit.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-20 grid gap-10 border-b border-white/10 pb-16 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue/85">
                {t.processKicker}
              </p>
              <h3 className="mt-4 max-w-md text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {t.processHeading}
              </h3>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground">
                {t.processBody}
              </p>
            </div>

            <ol className="divide-y divide-white/10 border-t border-white/10">
              {steps.map((step, index) => (
                <li key={step.title} className="grid gap-4 py-7 sm:grid-cols-[3rem_1fr] sm:gap-6">
                  <span className="font-mono text-xs text-purple/75">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                      {step.title}
                    </h4>
                    <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="mt-16 flex flex-col items-start justify-between gap-8 border-t border-white/10 pt-10 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-purple/85">
                <Link2 className="h-3.5 w-3.5" aria-hidden />
                {t.ctaEyebrow}
              </div>
              <h3 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                {t.ctaTitle}
              </h3>
              <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
                {t.ctaBody}
              </p>
            </div>

            <a
              href={`mailto:info@hareb.org?subject=${encodeURIComponent(t.subject)}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold tracking-tight text-background transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:text-base"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <p className="mt-7 max-w-4xl text-[11px] leading-relaxed text-muted-foreground/65 sm:text-xs">
            {t.note}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
