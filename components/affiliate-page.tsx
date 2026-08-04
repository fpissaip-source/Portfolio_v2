'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Affiliate } from './affiliate'
import { useLanguage } from './language-context'

const COPY = {
  de: {
    portfolio: 'Zum Portfolio',
    portfolioAria: 'Zum Portfolio von Issa Hareb',
    closingLabel: 'Mehr über meine Arbeit',
    closingTitle: 'Projekte, Leistungen und technische Umsetzung ansehen.',
    closingBody:
      'Im Portfolio findest du laufende Projekte, Webanwendungen, Automatisierungen und meinen Entwicklungsprozess.',
    imprint: 'Impressum',
    privacy: 'Datenschutz',
  },
  en: {
    portfolio: 'View portfolio',
    portfolioAria: "View Issa Hareb's portfolio",
    closingLabel: 'More about my work',
    closingTitle: 'Explore projects, services and technical delivery.',
    closingBody:
      'The portfolio includes live projects, web applications, automations and my development process.',
    imprint: 'Imprint',
    privacy: 'Privacy',
  },
} as const

export function AffiliatePage() {
  const { lang, setLang } = useLanguage()
  const currentLanguage = lang === 'en' ? 'en' : 'de'
  const t = COPY[currentLanguage]

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-background/80 px-5 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link
            href="/"
            aria-label={t.portfolioAria}
            className="flex items-center gap-1 text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-75"
          >
            Issa Hareb<span className="text-blue">.</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center rounded-full border border-white/10 p-0.5 font-mono text-[9px] uppercase tracking-[0.1em]">
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
              className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3.5 py-2 text-xs font-semibold tracking-tight text-foreground transition-colors hover:border-blue/50 hover:bg-blue/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:px-5 sm:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              {t.portfolio}
            </Link>
          </div>
        </div>
      </header>

      <Affiliate />

      <section className="border-t border-white/8 px-6 py-20 sm:py-28">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue/85">
              {t.closingLabel}
            </p>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              {t.closingTitle}
            </h2>
            <p className="mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t.closingBody}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold tracking-tight text-background transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:text-base"
          >
            {t.portfolio}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Issa Hareb</p>
          <nav className="flex items-center gap-5" aria-label="Legal">
            <Link href="/impressum" className="transition-colors hover:text-foreground">
              {t.imprint}
            </Link>
            <Link href="/datenschutz" className="transition-colors hover:text-foreground">
              {t.privacy}
            </Link>
          </nav>
        </div>
      </footer>
    </main>
  )
}
