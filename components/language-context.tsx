'use client'

import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { EN, DE, type Dictionary } from '@/lib/translations'

export type Lang = 'en' | 'de'

const STORAGE_KEY = 'site-lang'

type LanguageContextValue = {
  /** null means "no stored preference — show the picker." The very first
   *  client render always starts null (matching the server-rendered HTML,
   *  which has no access to localStorage), but a returning visitor's
   *  stored choice is read in useLayoutEffect — synchronously before the
   *  browser paints the first frame — so their pick never visibly flashes
   *  the picker first. */
  lang: Lang | null
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null)

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'de') setLangState(stored)
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
