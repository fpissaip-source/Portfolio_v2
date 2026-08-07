'use client'

import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { useLanguage, type Lang } from './language-context'

const easeOut = [0.22, 1, 0.36, 1] as const

const LANGUAGE_LABELS: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
}

const COPY = {
  de: {
    label: 'Partnerprogramm',
    benefits: 'Vorteile',
    process: 'Ablauf',
    portfolio: 'Zum Portfolio',
    portfolioAria: 'Zum Portfolio von Issa Hareb',
    headline: ['Empfehlungen,', 'die sich auszahlen.'],
    intro: 'Du stellst den Kontakt her. Ich übernehme Beratung, Umsetzung und Betreuung.',
    cta: 'Partnerprogramm anfragen',
    subject: 'Anfrage zum Affiliate-Partnerprogramm',
    minimum: 'Mindestens',
    amount: '660,00 €+',
    amountNote: 'Provision pro erfolgreichem Kundenprojekt.',
    earning: 'Mit 2–3 Kunden bereits mehr als 3.000 € verdienen.',
    earningNote: 'Je nach Projektart und Umfang.',
    dashboard: 'Eigenes Partner-Dashboard',
    payout: 'Wöchentliche oder monatliche Auszahlung',
    workload: 'Kein Entwicklungs- oder Supportaufwand',
    step1: 'Kontakt herstellen',
    step1Body: 'Du empfiehlst ein passendes Unternehmen.',
    step2: 'Projekt abschließen',
    step2Body: 'Ich übernehme Angebot und Umsetzung.',
    step3: 'Provision erhalten',
    step3Body: 'Nach Zahlung wird dein Anteil freigegeben.',
    finalTitle: 'Du kennst ein passendes Unternehmen?',
    finalBody: 'Eine kurze Vorstellung reicht für den Start.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
  },
  en: {
    label: 'Partner programme',
    benefits: 'Benefits',
    process: 'Process',
    portfolio: 'View portfolio',
    portfolioAria: "View Issa Hareb's portfolio",
    headline: ['Referrals', 'that pay off.'],
    intro: 'You make the introduction. I handle consulting, delivery and support.',
    cta: 'Ask about the partner programme',
    subject: 'Affiliate partner programme inquiry',
    minimum: 'At least',
    amount: '€660.00+',
    amountNote: 'Commission per successful client project.',
    earning: 'Earn more than €3,000 with just 2–3 clients.',
    earningNote: 'Depending on the project type and scope.',
    dashboard: 'Your own partner dashboard',
    payout: 'Weekly or monthly payouts',
    workload: 'No development or support work',
    step1: 'Make the introduction',
    step1Body: 'Refer a suitable business.',
    step2: 'Close the project',
    step2Body: 'I handle the proposal and delivery.',
    step3: 'Receive commission',
    step3Body: 'Your share is approved after payment.',
    finalTitle: 'Know a suitable business?',
    finalBody: 'A short introduction is enough to get started.',
    imprint: 'Imprint',
    privacy: 'Privacy',
  },
  es: {
    label: 'Programa de socios',
    benefits: 'Ventajas',
    process: 'Proceso',
    portfolio: 'Ver portfolio',
    portfolioAria: 'Ver el portfolio de Issa Hareb',
    headline: ['Recomendaciones', 'que generan ingresos.'],
    intro: 'Tú haces la presentación. Yo me encargo de la consultoría, el desarrollo y el soporte.',
    cta: 'Consultar el programa',
    subject: 'Consulta sobre el programa de socios',
    minimum: 'Como mínimo',
    amount: '660,00 €+',
    amountNote: 'Comisión por cada proyecto de cliente completado.',
    earning: 'Con solo 2–3 clientes puedes superar los 3.000 €.',
    earningNote: 'Según el tipo y el alcance del proyecto.',
    dashboard: 'Panel propio para socios',
    payout: 'Pagos semanales o mensuales',
    workload: 'Sin desarrollo ni soporte por tu parte',
    step1: 'Hacer la presentación',
    step1Body: 'Recomiendas una empresa adecuada.',
    step2: 'Cerrar el proyecto',
    step2Body: 'Yo me encargo de la propuesta y la ejecución.',
    step3: 'Recibir la comisión',
    step3Body: 'Tu parte se libera después del pago.',
    finalTitle: '¿Conoces una empresa adecuada?',
    finalBody: 'Una breve presentación es suficiente para empezar.',
    imprint: 'Aviso legal',
    privacy: 'Privacidad',
  },
} as const

export function AffiliatePage() {
  const { lang, setLang } = useLanguage()
  const t = lang === 'es' ? COPY.es : lang === 'en' ? COPY.en : COPY.de
  const reducedMotion = useReducedMotion()
  const mailto = `mailto:info@hareb.org?subject=${encodeURIComponent(t.subject)}`
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.25,
  })

  const features = [t.dashboard, t.payout, t.workload]
  const steps = [
    [t.step1, t.step1Body],
    [t.step2, t.step2Body],
    [t.step3, t.step3Body],
  ] as const

  return (
    <main id="main-content" className="relative min-h-screen overflow-x-clip bg-[#02040e] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-30 bg-[url('/affiliate-bg-mobile.svg')] bg-cover bg-top bg-no-repeat md:bg-[url('/affiliate-bg-desktop.svg')] md:bg-center"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgba(2,4,14,0.52)_0%,rgba(2,4,14,0.78)_45%,rgba(2,4,14,0.96)_100%)] md:bg-[linear-gradient(90deg,rgba(2,4,14,0.88)_0%,rgba(2,4,14,0.64)_55%,rgba(2,4,14,0.54)_100%)]"
      />

      <motion.header
        initial={reducedMotion ? false : { y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="sticky top-0 z-50 border-b border-white/10 bg-[#02040e]/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6 sm:py-4">
          <span className="max-w-[46%] font-display text-[1.06rem] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:max-w-none sm:text-[1.18rem]">
            {t.label}
          </span>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Affiliate">
            <a
              href="#benefits"
              className="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-white/58 transition-colors hover:text-white"
            >
              {t.benefits}
            </a>
            <a
              href="#process"
              className="font-label text-[11px] font-semibold uppercase tracking-[0.14em] text-white/58 transition-colors hover:text-white"
            >
              {t.process}
            </a>
          </nav>

          <div className="flex flex-col items-end gap-1.5">
            <Link
              href="/"
              aria-label={t.portfolioAria}
              className="group inline-flex items-center gap-2 font-display text-[1rem] font-semibold leading-none tracking-[-0.025em] text-white transition-colors hover:text-purple sm:text-[1.1rem]"
            >
              <span>{t.portfolio}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>

            <div
              className="flex items-center rounded-full border border-white/12 bg-white/[0.045] p-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
              role="group"
              aria-label="Language"
            >
              {(['de', 'en', 'es'] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setLang(language)}
                  aria-pressed={lang === language}
                  aria-label={LANGUAGE_LABELS[language]}
                  className={`min-w-8 rounded-full px-2 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
                    lang === language
                      ? 'bg-white/14 text-white'
                      : 'text-white/55 hover:text-white'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>
        </div>
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-gradient-to-r from-blue/80 via-purple/75 to-transparent"
          style={{ scaleX: progress }}
        />
      </motion.header>

      <section className="relative px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pb-32 lg:pt-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-16">
          <div>
            <h1 className="max-w-4xl font-display text-[clamp(3.1rem,8vw,7.2rem)] font-semibold leading-[0.91] tracking-[-0.058em]">
              {t.headline.map((line, index) => (
                <span key={line} className="block overflow-hidden pb-[0.08em]">
                  <motion.span
                    initial={reducedMotion ? false : { y: '112%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.95, delay: index * 0.12, ease: easeOut }}
                    className="block"
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={reducedMotion ? false : { y: 22, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.34, ease: easeOut }}
              className="mt-7 max-w-xl text-lg font-medium leading-relaxed text-white/88 sm:text-xl"
            >
              {t.intro}
            </motion.p>

            <motion.a
              initial={reducedMotion ? false : { y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.48, ease: easeOut }}
              href={mailto}
              className="group mt-8 inline-flex items-center gap-2 rounded-lg border border-purple/50 bg-purple/90 px-6 py-3.5 text-base font-semibold text-white shadow-[0_14px_45px_rgba(113,82,255,0.34)] transition-transform hover:-translate-y-0.5"
            >
              {t.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </motion.a>

            <motion.div
              initial={reducedMotion ? false : { y: 24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, delay: 0.62, ease: easeOut }}
              className="relative mt-10 max-w-2xl overflow-hidden border-l-2 border-purple bg-black/35 px-5 py-5 backdrop-blur-md sm:px-6"
            >
              <motion.div
                aria-hidden
                initial={reducedMotion ? false : { x: '-140%' }}
                animate={{ x: '190%' }}
                transition={{ duration: 1.5, delay: 0.9, ease: easeOut }}
                className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-xl"
              />
              <p className="text-balance text-2xl font-semibold leading-tight tracking-[-0.025em] text-white sm:text-3xl">
                {t.earning}
              </p>
              <p className="mt-2 text-base font-medium text-white/75">{t.earningNote}</p>
            </motion.div>
          </div>

          <motion.aside
            initial={reducedMotion ? false : { x: 34, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.22, ease: easeOut }}
            className="border border-white/15 bg-[#070a18]/78 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-lg sm:p-8"
          >
            <p className="text-base font-semibold text-white/75">{t.minimum}</p>
            <p className="mt-3 font-display text-[clamp(4rem,10vw,6.5rem)] font-semibold leading-none tracking-[-0.07em] text-white">
              {t.amount}
            </p>
            <p className="mt-4 text-base font-medium leading-relaxed text-white/80">{t.amountNote}</p>

            <ul id="benefits" className="mt-8 divide-y divide-white/12 border-t border-white/12">
              {features.map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={reducedMotion ? false : { x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.65, delay: 0.62 + index * 0.09, ease: easeOut }}
                  className="flex items-center gap-3 py-4 text-base font-semibold text-white/90"
                >
                  <Check className="h-4 w-4 shrink-0 text-purple" aria-hidden />
                  {feature}
                </motion.li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </section>

      <section id="process" className="border-y border-white/10 bg-[#02040e]/76 px-6 py-20 backdrop-blur-md sm:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            initial={reducedMotion ? false : { y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: '-15% 0px' }}
            transition={{ duration: 0.8, ease: easeOut }}
            className="font-display text-3xl font-semibold tracking-[-0.035em] sm:text-5xl"
          >
            {t.process}
          </motion.h2>

          <ol className="mt-10 grid border-t border-white/15 lg:grid-cols-3">
            {steps.map(([title, body], index) => (
              <motion.li
                key={title}
                initial={reducedMotion ? false : { y: 28, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-12% 0px' }}
                transition={{ duration: 0.75, delay: index * 0.1, ease: easeOut }}
                className="group border-b border-white/15 py-10 lg:border-b-0 lg:border-r lg:px-8 lg:py-12 first:lg:pl-0 last:lg:border-r-0 last:lg:pr-0"
              >
                <span className="inline-block bg-gradient-to-br from-purple via-purple to-blue bg-clip-text font-display text-[2.55rem] font-semibold leading-none tracking-[-0.07em] text-transparent sm:text-[3rem]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 max-w-[16ch] text-balance font-display text-[2rem] font-semibold leading-[0.98] tracking-[-0.045em] text-white sm:text-[2.35rem]">
                  {title}
                </h3>
                <p className="mt-4 max-w-[30rem] text-[1.05rem] font-medium leading-[1.5] text-white/78 sm:text-[1.1rem]">
                  {body}
                </p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-20 sm:py-24">
        <motion.div
          initial={reducedMotion ? false : { y: 32, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 0.8, ease: easeOut }}
          className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-7 border-t border-white/15 pt-8 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{t.finalTitle}</h2>
            <p className="mt-3 text-lg font-medium text-white/75">{t.finalBody}</p>
          </div>
          <a href={mailto} className="group inline-flex shrink-0 items-center gap-2 text-base font-semibold text-white underline decoration-purple/70 underline-offset-[8px]">
            {t.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </a>
        </motion.div>
      </section>

      <footer className="border-t border-white/10 bg-[#02040e]/80 px-6 py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm font-medium text-white/60 sm:flex-row">
          <span>{t.label}</span>
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
