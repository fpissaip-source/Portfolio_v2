'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { Affiliate } from './affiliate'
import { useLanguage } from './language-context'

const easeOut = [0.22, 1, 0.36, 1] as const

const COPY = {
  de: {
    headerLabel: 'Partnerprogramm',
    navBenefits: 'Vorteile',
    navProcess: 'Ablauf',
    portfolio: 'Zum Portfolio',
    portfolioAria: 'Zum Portfolio von Issa Hareb',
    headline: 'Empfehlungen, die sich auszahlen.',
    headlineLines: ['Empfehlungen,', 'die sich auszahlen.'],
    intro:
      'Du stellst den Kontakt her. Ich übernehme Beratung, Abschluss und Umsetzung. Du erhältst die Provision.',
    primaryCta: 'Partnerprogramm anfragen',
    subject: 'Anfrage zum Affiliate-Partnerprogramm',
    earnLine: 'Mit 2–3 Kunden bereits mehr als 3.000 € verdienen.',
    earnNote: 'Je nach Projektart und Umfang ist deutlich mehr möglich.',
    minimumLabel: 'Mindestprovision',
    minimumValue: '660,00 €+',
    minimumNote: 'pro abgeschlossenem und bezahltem Kundenprojekt',
    proofDashboard: 'Eigenes Partner-Dashboard',
    proofPayout: 'Wöchentlich oder monatlich',
    proofWork: 'Keine Technik nötig',
    closingLabel: 'Portfolio',
    closingTitle: 'Projekte ansehen, die sich vermitteln lassen.',
    closingBody: 'Websites, Software und Automatisierungen für Unternehmen.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
  },
  en: {
    headerLabel: 'Partner programme',
    navBenefits: 'Benefits',
    navProcess: 'Process',
    portfolio: 'View portfolio',
    portfolioAria: "View Issa Hareb's portfolio",
    headline: 'Referrals that pay off.',
    headlineLines: ['Referrals', 'that pay off.'],
    intro:
      'You make the introduction. I handle consulting, the close and delivery. You receive the commission.',
    primaryCta: 'Ask about the partner programme',
    subject: 'Affiliate partner programme inquiry',
    earnLine: 'Earn more than €3,000 with just 2–3 clients.',
    earnNote: 'Larger or more complex projects can pay considerably more.',
    minimumLabel: 'Minimum commission',
    minimumValue: '€660.00+',
    minimumNote: 'per completed and fully paid client project',
    proofDashboard: 'Your own partner dashboard',
    proofPayout: 'Weekly or monthly',
    proofWork: 'No technical work',
    closingLabel: 'Portfolio',
    closingTitle: 'See the projects you can refer.',
    closingBody: 'Websites, software and automation for businesses.',
    imprint: 'Imprint',
    privacy: 'Privacy',
  },
} as const

export function AffiliatePage() {
  const { lang, setLang } = useLanguage()
  const currentLanguage = lang === 'en' ? 'en' : 'de'
  const t = COPY[currentLanguage]
  const mailto = `mailto:info@hareb.org?subject=${encodeURIComponent(t.subject)}`
  const reducedMotion = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)

  const { scrollYProgress: pageScroll } = useScroll()
  const pageProgress = useSpring(pageScroll, {
    stiffness: 120,
    damping: 24,
    mass: 0.25,
  })

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const copyY = useTransform(heroScroll, [0, 1], [0, -42])
  const detailY = useTransform(heroScroll, [0, 1], [0, 30])
  const heroOpacity = useTransform(heroScroll, [0, 0.78, 1], [1, 0.94, 0.48])

  const proofItems = [t.proofDashboard, t.proofPayout, t.proofWork]

  return (
    <main id="main-content" className="relative min-h-screen overflow-x-clip bg-[#02040d] text-foreground">
      <motion.header
        initial={reducedMotion ? false : { y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: easeOut }}
        className="sticky top-0 z-50 border-b border-white/10 bg-[#02040d]/80 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
          <span className="truncate text-xs font-semibold tracking-[0.02em] text-white/90">
            {t.headerLabel}
          </span>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Affiliate">
            <a href="#benefits" className="text-sm font-medium text-white/65 transition-colors hover:text-white">
              {t.navBenefits}
            </a>
            <a href="#process" className="text-sm font-medium text-white/65 transition-colors hover:text-white">
              {t.navProcess}
            </a>
          </nav>

          <div className="flex items-center justify-self-end gap-3 sm:gap-5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em]">
              {(['de', 'en'] as const).map((language, index) => (
                <span key={language} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-white/25">/</span>}
                  <button
                    type="button"
                    onClick={() => setLang(language)}
                    aria-pressed={currentLanguage === language}
                    aria-label={language === 'de' ? 'Deutsch' : 'English'}
                    className={currentLanguage === language ? 'text-white' : 'text-white/50 transition-colors hover:text-white'}
                  >
                    {language}
                  </button>
                </span>
              ))}
            </div>

            <Link
              href="/"
              aria-label={t.portfolioAria}
              className="group inline-flex items-center gap-1.5 border-l border-white/15 pl-3 text-xs font-semibold text-white sm:gap-2 sm:pl-5 sm:text-sm"
            >
              {t.portfolio}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>

        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gradient-to-r from-blue/80 via-purple/70 to-transparent"
          style={{ scaleX: pageProgress }}
        />
      </motion.header>

      <section
        ref={heroRef}
        className="relative isolate min-h-[calc(100svh-65px)] overflow-hidden px-5 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24"
      >
        <picture className="pointer-events-none absolute inset-0 -z-30">
          <source media="(max-width: 767px)" srcSet="/affiliate/affiliate-bg-mobile.svg" />
          <img
            src="/affiliate/affiliate-bg-desktop.svg"
            alt=""
            className="h-full w-full object-cover object-center"
          />
        </picture>
        <div className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(2,4,13,0.42)_0%,rgba(2,4,13,0.66)_58%,rgba(2,4,13,0.94)_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_28%_28%,transparent_0%,rgba(2,4,13,0.12)_42%,rgba(2,4,13,0.48)_100%)]" />

        {!reducedMotion && (
          <motion.div
            aria-hidden
            initial={{ x: '-34vw', opacity: 0 }}
            animate={{ x: '115vw', opacity: [0, 0.18, 0] }}
            transition={{ duration: 3.6, delay: 0.15, ease: easeOut, times: [0, 0.46, 1] }}
            className="pointer-events-none absolute -top-[16%] bottom-[-16%] left-0 -z-10 w-[16vw] min-w-24 rotate-[8deg] bg-gradient-to-r from-transparent via-blue/15 to-transparent blur-3xl"
          />
        )}

        <motion.div
          style={reducedMotion ? undefined : { opacity: heroOpacity }}
          className="mx-auto grid max-w-7xl gap-12 border-t border-white/15 pt-7 lg:grid-cols-[minmax(0,1.08fr)_minmax(330px,0.92fr)] lg:gap-16 lg:pt-10"
        >
          <motion.div style={reducedMotion ? undefined : { y: copyY }}>
            <h1
              aria-label={t.headline}
              className="max-w-4xl font-display text-[clamp(3rem,10vw,7.2rem)] font-semibold leading-[0.91] tracking-[-0.058em] text-white"
            >
              {t.headlineLines.map((line, index) => (
                <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]" aria-hidden>
                  <motion.span
                    initial={reducedMotion ? false : { y: '112%', opacity: 0.001 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{ duration: 1, delay: 0.1 + index * 0.13, ease: easeOut }}
                    className="block"
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={reducedMotion ? false : { y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.45, ease: easeOut }}
              className="mt-7 max-w-xl text-pretty text-base font-medium leading-relaxed text-white/82 sm:text-lg"
            >
              {t.intro}
            </motion.p>

            <motion.div
              initial={reducedMotion ? false : { y: 24, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.62, ease: easeOut }}
              className="relative mt-8 max-w-2xl overflow-hidden border-y border-purple/40 bg-[#080b20]/66 px-4 py-6 shadow-[0_24px_80px_rgba(30,22,91,0.34)] backdrop-blur-md sm:px-6 sm:py-7"
            >
              <motion.div
                aria-hidden
                initial={reducedMotion ? false : { x: '-130%' }}
                animate={{ x: '190%' }}
                transition={{ duration: 1.45, delay: 0.85, ease: easeOut }}
                className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl"
              />
              <p className="text-balance text-[clamp(1.55rem,4.8vw,2.65rem)] font-semibold leading-[1.08] tracking-[-0.035em] text-white">
                {t.earnLine}
              </p>
              <p className="mt-3 text-base font-medium leading-relaxed text-white/75">
                {t.earnNote}
              </p>
            </motion.div>

            <motion.div
              initial={reducedMotion ? false : { y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.78, ease: easeOut }}
              className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <a
                href={mailto}
                className="group inline-flex items-center justify-center gap-2 rounded-lg border border-purple/40 bg-[linear-gradient(180deg,rgba(139,103,255,0.96),rgba(86,78,236,0.9))] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(103,78,255,0.32)] transition-transform hover:-translate-y-0.5 sm:text-base"
              >
                {t.primaryCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </a>
              <Link href="/" className="group inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white sm:text-base">
                {t.portfolio}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>

          <motion.aside
            id="benefits"
            initial={reducedMotion ? false : { x: 34, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.95, delay: 0.3, ease: easeOut }}
            style={reducedMotion ? undefined : { y: detailY }}
            className="scroll-mt-24 self-start rounded-2xl border border-white/15 bg-[#06091a]/72 p-5 shadow-[0_28px_80px_rgba(0,0,0,0.38)] backdrop-blur-md sm:p-7"
          >
            <p className="text-sm font-semibold text-white/70">{t.minimumLabel}</p>
            <div className="overflow-hidden">
              <motion.p
                initial={reducedMotion ? false : { y: '105%', opacity: 0.001 }}
                animate={{ y: '0%', opacity: 1 }}
                transition={{ duration: 0.95, delay: 0.48, ease: easeOut }}
                className="mt-3 font-display text-[clamp(4rem,14vw,6.4rem)] font-semibold leading-none tracking-[-0.075em] text-white"
              >
                {t.minimumValue}
              </motion.p>
            </div>
            <p className="mt-3 text-base font-medium leading-relaxed text-white/75">
              {t.minimumNote}
            </p>

            <ul className="mt-7 border-t border-white/15">
              {proofItems.map((item, index) => (
                <motion.li
                  key={item}
                  initial={reducedMotion ? false : { x: 22, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.65, delay: 0.72 + index * 0.08, ease: easeOut }}
                  className="grid grid-cols-[2rem_1fr] items-center gap-3 border-b border-white/15 py-4"
                >
                  <span className="text-xs font-semibold text-purple/90">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-base font-semibold text-white/90">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.aside>
        </motion.div>
      </section>

      <Affiliate standalone />

      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-18% 0px' }}
        transition={{ duration: 0.9, ease: easeOut }}
        className="border-t border-white/10 px-5 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-blue/90">{t.closingLabel}</p>
            <h2 className="mt-3 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
              {t.closingTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/70">
              {t.closingBody}
            </p>
          </div>
          <Link href="/" className="group inline-flex shrink-0 items-center gap-2 text-base font-semibold text-white transition-colors hover:text-blue">
            {t.portfolio}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>
      </motion.section>

      <footer className="border-t border-white/10 px-5 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-white/60 sm:flex-row">
          <span>{t.headerLabel}</span>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link href="/impressum" className="transition-colors hover:text-white">{t.imprint}</Link>
            <Link href="/datenschutz" className="transition-colors hover:text-white">{t.privacy}</Link>
          </nav>
          <p>© {new Date().getFullYear()} Issa Hareb</p>
        </div>
      </footer>
    </main>
  )
}
