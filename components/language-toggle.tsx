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
      /* Links neben der Schalterblase des Menues und auf deren Mitte
         ausgerichtet. Die Blase sitzt bei 2em vom rechten Rand und ist 48
         Pixel breit (ab 768 dann 56), der Umschalter muss also davor
         beginnen; die Hoehen unterscheiden sich, deshalb der eigene obere
         Abstand statt eines gemeinsamen. */
      className="fixed right-[92px] top-[42px] z-50 flex items-center gap-0.5 rounded-full border border-white/10 bg-black/30 p-0.5 font-label text-[13px] uppercase tracking-[0.08em] backdrop-blur-sm md:right-[100px] md:top-[46px]"
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
