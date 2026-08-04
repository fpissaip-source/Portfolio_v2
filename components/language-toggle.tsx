'use client'

import { useLanguage, type Lang } from './language-context'

const LANGUAGE_LABELS: Record<Lang, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
}

/** Always-present language switch. The browser language is detected on the
 * first visit, while this control stays available as a manual override. */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  if (!lang) return null

  return (
    <div
      data-page-chrome
      data-language-toggle
      className="fixed right-16 top-4 z-50 flex items-center gap-0.5 rounded-full border border-white/10 bg-black/30 p-0.5 font-mono text-[9px] uppercase tracking-[0.08em] backdrop-blur-sm sm:right-4"
    >
      {(['de', 'en', 'es'] as const).map((language) => (
        <button
          key={language}
          type="button"
          onClick={() => setLang(language)}
          aria-pressed={lang === language}
          aria-label={LANGUAGE_LABELS[language]}
          className={`rounded-full px-1.5 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue sm:px-2 ${
            lang === language
              ? 'bg-white/15 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {language}
        </button>
      ))}
    </div>
  )
}
