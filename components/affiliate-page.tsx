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
    headerLabel: 'Partner programme',
    navBenefits: 'Benefits',
    navProcess: 'Process',
    portfolio: 'View portfolio',
    portfolioAria: "View Issa Hareb's portfolio",
    headline: 'Referrals that pay off.',
    headlineLines: ['Referrals', 'that pay off.'],
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
  const copyY = useTransform(heroScroll, [0, 1], [0, -72])
  const detailY = useTransform(heroScroll, [0, 1], [0, 54])
  const heroOpacity = useTransform(heroScroll, [0, 0.72, 1], [1, 0.88, 0.32])

  const proofItems = [t.proofDashboard, t.proofPayout, t.proofWork]

  return (
    <main id="main-content" className="relative min-h-screen overflow-x-clip bg-background">
      <motion.header
        initial={reducedMotion ? false : { y: -22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: easeOut }}
        className="sticky top-0 z-50 border-b border-white/8 bg-background/90 backdrop-blur-xl"
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-5 py-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex min-w-0 items-center gap-4">
            <span className="truncate text-xs font-semibold tracking-[0.04em] text-foreground">
              {t.headerLabel}
            </span>
            <motion.span
              initial={reducedMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: easeOut }}
              className="hidden h-px w-16 origin-left bg-white/15 sm:block"
              aria-hidden
            />
          </div>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Affiliate">
            <a
              href="#benefits"
              className="text-xs font-medium text-muted-foreground underline decoration-transparent underline-offset-[7px] transition-colors hover:text-foreground hover:decoration-white/30"
            >
              {t.navBenefits}
            </a>
            <a
              href="#process"
              className="text-xs font-medium text-muted-foreground underline decoration-transparent underline-offset-[7px] transition-colors hover:text-foreground hover:decoration-white/30"
            >
              {t.navProcess}
            </a>
          </nav>

          <div className="flex items-center justify-self-end gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em]">
              {(['de', 'en'] as const).map((language, index) => (
                <span key={language} className="flex items-center gap-1.5">
                  {index > 0 && <span className="text-white/20">/</span>}
                  <button
                    type="button"
                    onClick={() => setLang(language)}
                    aria-pressed={currentLanguage === language}
                    aria-label={language === 'de' ? 'Deutsch' : 'English'}
                    className={`py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue ${
                      currentLanguage === language
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {language}
                  </button>
                </span>
              ))}
            </div>

            <Link
              href="/"
              aria-label={t.portfolioAria}
              className="group inline-flex items-center gap-2 border-l border-white/10 pl-4 text-xs font-semibold tracking-tight text-foreground transition-colors hover:text-blue sm:text-sm"
            >
              {t.portfolio}
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </div>

        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gradient-to-r from-blue/70 via-purple/60 to-transparent"
          style={{ scaleX: pageProgress }}
        />
      </motion.header>

      <section
        ref={heroRef}
        className="relative isolate min-h-[calc(100svh-73px)] overflow-hidden px-6 pb-24 pt-20 sm:pb-32 sm:pt-28 lg:pb-36 lg:pt-32"
      >
        {!reducedMotion && (
          <motion.div
            aria-hidden
            initial={{ x: '-32vw', opacity: 0 }}
            animate={{ x: '112vw', opacity: [0, 0.16, 0] }}
            transition={{
              duration: 3.8,
              delay: 0.18,
              ease: easeOut,
              times: [0, 0.46, 1],
            }}
            className="pointer-events-none absolute -top-[18%] bottom-[-18%] left-0 -z-10 w-[18vw] min-w-28 rotate-[8deg] blur-3xl"
            style={{
              background:
                'linear-gradient(90deg, transparent, color-mix(in oklch, var(--blue) 18%, white), transparent)',
            }}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-[16%] -z-20 h-px bg-gradient-to-r from-transparent via-white/[0.045] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] -z-20 h-px bg-gradient-to-r from-transparent via-white/[0.035] to-transparent" />

        <div className="mx-auto max-w-7xl">
          <motion.div
            style={reducedMotion ? undefined : { opacity: heroOpacity }}
            className="grid gap-16 border-t border-white/12 pt-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-20 lg:pt-10"
          >
            <motion.div style={reducedMotion ? undefined : { y: copyY }}>
              <h1
                aria-label={t.headline}
                className="max-w-4xl text-balance font-display text-[clamp(3.3rem,8vw,7.4rem)] font-semibold leading-[0.91] tracking-[-0.058em] text-foreground"
              >
                {t.headlineLines.map((line, index) => (
                  <span
                    key={line}
                    className="-mb-[0.08em] block overflow-hidden pb-[0.08em]"
                    aria-hidden
                  >
                    <motion.span
                      initial={reducedMotion ? false : { y: '112%', opacity: 0.001 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{
                        duration: 1.05,
                        delay: 0.12 + index * 0.13,
                        ease: easeOut,
                      }}
                      className="block will-transform"
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                initial={reducedMotion ? false : { y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.5, ease: easeOut }}
                className="mt-8 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
              >
                {t.intro}
              </motion.p>

              <motion.div
                initial={reducedMotion ? false : { y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.85, delay: 0.66, ease: easeOut }}
                className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center"
              >
                <a
                  href={mailto}
                  className="group inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 text-sm font-semibold tracking-tight text-background transition-transform hover:translate-y-[-1px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-purple sm:text-base"
                >
                  {t.primaryCta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </a>

                <Link
                  href="/"
                  className="group inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-muted-foreground underline decoration-white/20 underline-offset-[7px] transition-colors hover:text-foreground hover:decoration-white/50 sm:text-base"
                >
                  {t.portfolio}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            </motion.div>

            <motion.aside
              initial={reducedMotion ? false : { x: 42, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.34, ease: easeOut }}
              style={reducedMotion ? undefined : { y: detailY }}
              className="border-t border-white/12 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-xs font-semibold tracking-tight text-muted-foreground">
                  {t.minimumLabel}
                </p>
                <span className="font-mono text-[10px] tracking-[0.18em] text-white/30">01</span>
              </div>

              <div className="overflow-hidden">
                <motion.p
                  initial={reducedMotion ? false : { y: '105%', opacity: 0.001 }}
                  animate={{ y: '0%', opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: easeOut }}
                  className="mt-7 font-display text-[clamp(4.2rem,10vw,7rem)] font-semibold leading-none tracking-[-0.075em] text-foreground"
                >
                  {t.minimumValue}
                </motion.p>
              </div>
              <motion.p
                initial={reducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.76 }}
                className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base"
              >
                {t.minimumNote}
              </motion.p>

              <motion.div
                initial={reducedMotion ? false : { x: 24, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.82, ease: easeOut }}
                className="mt-9 border-l-2 border-blue/55 pl-5"
              >
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {t.moreTitle}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {t.moreBody}
                </p>
              </motion.div>

              <ol className="mt-10 border-t border-white/10">
                {proofItems.map((item, index) => (
                  <motion.li
                    key={item}
                    initial={reducedMotion ? false : { x: 28, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{
                      duration: 0.72,
                      delay: 0.92 + index * 0.09,
                      ease: easeOut,
                    }}
                    className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-white/10 py-4"
                  >
                    <span className="font-mono text-[10px] tracking-[0.15em] text-white/30">
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-medium tracking-tight text-foreground/90">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ol>
            </motion.aside>
          </motion.div>
        </div>
      </section>

      <Affiliate standalone />

      <motion.section
        initial={reducedMotion ? false : { opacity: 0, y: 52 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-18% 0px' }}
        transition={{ duration: 1, ease: easeOut }}
        className="border-t border-white/8 px-6 py-20 sm:py-28"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-10 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-tight text-blue/85">
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
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight text-foreground underline decoration-white/20 underline-offset-[8px] transition-colors hover:text-blue hover:decoration-blue/50 sm:text-base"
          >
            {t.portfolio}
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </motion.section>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <span>{t.headerLabel}</span>
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
