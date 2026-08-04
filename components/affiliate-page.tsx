'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  LayoutDashboard,
  Wallet,
} from 'lucide-react'
import { Affiliate } from './affiliate'
import { useLanguage } from './language-context'

const COPY = {
  de: {
    brandLabel: 'Partnerprogramm',
    navBenefits: 'Vorteile',
    navProcess: 'Ablauf',
    portfolio: 'Zum Portfolio',
    portfolioAria: 'Zum Portfolio von Issa Hareb',
    eyebrow: 'Empfehlungsprogramm für digitale Projekte',
    headline: 'Empfehlungen, die sich auszahlen.',
    intro:
      'Du stellst den Kontakt zu einem Unternehmen her. Ich übernehme Beratung, Angebot, Umsetzung und Betreuung – du erhältst für den erfolgreichen Abschluss eine attraktive Provision.',
    primaryCta: 'Partnerprogramm anfragen',
    subject: 'Anfrage zum Affiliate-Partnerprogramm',
    minimumLabel: 'Mindestprovision',
    minimumValue: '660,00 €+',
    minimumNote: 'pro erfolgreich abgeschlossenem und vollständig bezahltem Kundenprojekt',
    moreTitle: 'Deutlich mehr ist möglich',
    moreBody:
      'Die tatsächliche Vergütung richtet sich nach Projektart, Umfang, Auftragswert und deinem Beitrag zur Kundengewinnung.',
    proofDashboard: 'Eigenes Partner-Dashboard',
    proofPayout: 'Auszahlung wöchentlich oder monatlich',
    proofWork: 'Kein Entwicklungs- oder Supportaufwand',
    closingLabel: 'Portfolio',
    closingTitle: 'Sieh dir an, welche Projekte und Systeme ich umsetze.',
    closingBody:
      'Im Portfolio findest du laufende Kundenprojekte, Webanwendungen, Automatisierungen und meinen vollständigen Entwicklungsprozess.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
  },
  en: {
    brandLabel: 'Partner programme',
    navBenefits: 'Benefits',
    navProcess: 'Process',
    portfolio: 'View portfolio',
    portfolioAria: "View Issa Hareb's portfolio",
    eyebrow: 'Referral programme for digital projects',
    headline: 'Referrals that pay off.',
    intro:
      'You make the introduction to a business. I handle consulting, the proposal, delivery and support – you receive an attractive commission when the project closes successfully.',
    primaryCta: 'Ask about the partner programme',
    subject: 'Affiliate partner programme inquiry',
    minimumLabel: 'Minimum commission',
    minimumValue: '€660.00+',
    minimumNote: 'per successfully completed and fully paid client project',
    moreTitle: 'Significantly more is possible',
    moreBody:
      'The final compensation depends on the project type, scope, contract value and your contribution to acquiring the client.',
    proofDashboard: 'Your own partner dashboard',
    proofPayout: 'Weekly or monthly payouts',
    proofWork: 'No development or support work required',
    closingLabel: 'Portfolio',
    closingTitle: 'See the projects and systems I deliver.',
    closingBody:
      'The portfolio includes live client work, web applications, automations and my complete development process.',
    imprint: 'Imprint',
    privacy: 'Privacy',
  },
} as const

export function AffiliatePage() {
  const { lang, setLang } = useLanguage()
  const currentLanguage = lang === 'en' ? 'en' : 'de'
  const t = COPY[currentLanguage]
  const mailto = `mailto:info@hareb.org?subject=${encodeURIComponent(t.subject)}`

  const proofItems = [
    { icon: LayoutDashboard, label: t.proofDashboard },
    { icon: Wallet, label: t.proofPayout },
    { icon: BarChart3, label: t.proofWork },
  ]

  return (
    <main id="main-content" className="relative min-h-screen overflow-x-clip bg-background">
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#08090d]/90 p-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:px-3">
          <Link
            href="/affiliate"
            className="flex min-w-0 items-center gap-3 rounded-xl pr-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-purple/25 bg-purple/10 font-display text-sm font-semibold tracking-tight text-foreground">
              IH
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold tracking-tight text-foreground">
                Issa Hareb
              </span>
              <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                {t.brandLabel}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.025] p-1 lg:flex" aria-label="Affiliate">
            <a
              href="#benefits"
              className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
            >
              {t.navBenefits}
            </a>
            <a
              href="#process"
              className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
            >
              {t.navProcess}
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex items-center rounded-full border border-white/10 bg-black/20 p-0.5 font-mono text-[9px] uppercase tracking-[0.08em]">
              {(['de', 'en'] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setLang(language)}
                  aria-pressed={currentLanguage === language}
                  aria-label={language === 'de' ? 'Deutsch' : 'English'}
                  className={`rounded-full px-2 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
                    currentLanguage === language
                      ? 'bg-white/10 text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>

            <Link
              href="/"
              aria-label={t.portfolioAria}
              className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.035] px-3.5 py-2.5 text-xs font-semibold tracking-tight text-foreground transition-colors hover:border-purple/40 hover:bg-purple/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:px-5 sm:text-sm"
            >
              <span className="hidden xs:inline">{t.portfolio}</span>
              <span className="xs:hidden">Portfolio</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate px-6 pb-20 pt-20 sm:pb-28 sm:pt-28 lg:pb-32 lg:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 52% 46% at 20% 28%, color-mix(in oklch, var(--purple) 16%, transparent), transparent 72%), radial-gradient(ellipse 45% 38% at 82% 48%, color-mix(in oklch, var(--blue) 11%, transparent), transparent 72%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple/20 bg-purple/[0.06] px-3.5 py-2 text-[11px] font-medium tracking-tight text-purple">
              <span className="h-1.5 w-1.5 rounded-full bg-purple shadow-[0_0_12px_color-mix(in_oklch,var(--purple)_75%,transparent)]" />
              {t.eyebrow}
            </div>

            <h1 className="mt-7 max-w-4xl text-balance font-display text-[clamp(3.2rem,8vw,7.2rem)] font-semibold leading-[0.92] tracking-[-0.055em] text-foreground">
              {t.headline}
            </h1>

            <p className="mt-7 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t.intro}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={mailto}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold tracking-tight text-background transition-transform hover:scale-[1.025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:text-base"
              >
                {t.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 px-7 py-4 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-blue/45 hover:bg-blue/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:text-base"
              >
                {t.portfolio}
              </Link>
            </div>
          </div>

          <aside className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#090a0f]/88 p-7 shadow-[0_36px_120px_rgba(0,0,0,0.46)] sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(145deg, color-mix(in oklch, var(--purple) 9%, transparent), transparent 38%), radial-gradient(circle at 90% 12%, color-mix(in oklch, var(--blue) 12%, transparent), transparent 36%)',
              }}
            />

            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-purple/90">
                {t.minimumLabel}
              </p>
              <p className="mt-5 font-display text-[clamp(4rem,10vw,6.5rem)] font-semibold leading-none tracking-[-0.07em] text-foreground">
                {t.minimumValue}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.minimumNote}
              </p>

              <div className="mt-8 border-t border-white/10 pt-7">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue">
                  <Check className="h-4 w-4" aria-hidden />
                  {t.moreTitle}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t.moreBody}
                </p>
              </div>

              <ul className="mt-8 divide-y divide-white/8 border-y border-white/8">
                {proofItems.map((item) => (
                  <li key={item.label} className="flex items-center gap-3 py-4">
                    <item.icon className="h-4 w-4 shrink-0 text-purple/80" aria-hidden />
                    <span className="text-sm font-medium tracking-tight text-foreground/90">
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <Affiliate standalone />

      <section className="border-t border-white/8 px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue/85">
              {t.closingLabel}
            </p>
            <h2 className="mt-4 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.closingTitle}
            </h2>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.closingBody}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-7 py-3.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-purple/45 hover:bg-purple/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:text-base"
          >
            {t.portfolio}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">Issa Hareb</span>
            <span className="text-blue">.</span>
            <span>{t.brandLabel}</span>
          </div>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link href="/impressum" className="transition-colors hover:text-foreground">
              {t.imprint}
            </Link>
            <Link href="/datenschutz" className="transition-colors hover:text-foreground">
              {t.privacy}
            </Link>
          </nav>
          <p>© {new Date().getFullYear()} Issa Hareb</p>
        </div>
      </footer>
    </main>
  )
}
