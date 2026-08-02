'use client'

import { useLanguage } from './language-context'

/** Small, always-present DE/EN switch, top-right — language is auto-detected
 *  from the browser on first visit (see language-context.tsx), but this
 *  stays reachable at any time to override that pick. */
export function LanguageToggle() {
  const { lang, setLang } = useLanguage()
  if (!lang) return null

  return (
    <div
      data-page-chrome
      data-language-toggle
      className="fixed right-16 top-4 z-50 flex items-center gap-0.5 rounded-full border border-white/10 bg-black/30 p-0.5 font-mono text-[9px] uppercase tracking-[0.1em] backdrop-blur-sm sm:right-4"
    >
      {(['de', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          aria-label={l === 'de' ? 'Deutsch' : 'English'}
          className={`rounded-full px-2 py-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
            lang === l
              ? 'bg-white/15 text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
