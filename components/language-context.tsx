'use client'

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { EN, DE, type Dictionary } from '@/lib/translations'

export type Lang = 'en' | 'de'

const STORAGE_KEY = 'site-lang'

type LanguageContextValue = {
  /** null only for the instant before the layout effect below resolves it
   *  (matching the server-rendered HTML, which can't know the browser's
   *  language). Resolved synchronously before the browser paints the
   *  first frame, so nothing ever visibly starts in one language and
   *  flashes to another. */
  lang: Lang | null
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null)

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'de') {
      setLangState(stored)
      return
    }
    // No stored preference yet (first visit, or the toggle was never
    // used) — auto-detect from the browser's own language instead of
    // asking. German browsers get German; everything else gets English.
    // The top-right toggle can still switch either way at any time.
    const detected: Lang = navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
    window.localStorage.setItem(STORAGE_KEY, detected)
    setLangState(detected)
  }, [])

  useLayoutEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  const setLang = (next: Lang) => {
    window.localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

/** The active dictionary — defaults to English so components rendered
 *  before the language is resolved (or if it's never picked) still show
 *  sensible copy instead of undefined lookups. */
export function useT(): Dictionary {
  const { lang } = useLanguage()
  return lang === 'de' ? DE : EN
}
