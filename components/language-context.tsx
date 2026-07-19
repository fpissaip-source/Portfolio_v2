'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EN, DE, type Dictionary } from '@/lib/translations'

export type Lang = 'en' | 'de'

const STORAGE_KEY = 'site-lang'

type LanguageContextValue = {
  /** null means no language has been selected yet. Stored preferences are
   *  resolved synchronously before the first paint; first-time visitors stay
   *  null until they choose Deutsch or English in the preloader gate. */
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
    }
  }, [])

  useLayoutEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  // Switching language re-renders every section at once with (usually
  // differently-sized) translated text, which shifts every scroll-trigger
  // position below the change. Refresh once the new layout has settled so
  // pinned/scrubbed sections don't stay keyed to the old content's dimensions.
  const firstLangRef = useRef(true)
  useEffect(() => {
    if (!lang) return
    if (firstLangRef.current) {
      firstLangRef.current = false
      return
    }
    const lenisWin = window as unknown as { __lenis?: { start: () => void } }
    lenisWin.__lenis?.start()
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(raf)
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

/** The active dictionary defaults to English while the first-visit language
 *  gate is visible. The page itself remains covered by the preloader until a
 *  real selection has been made. */
export function useT(): Dictionary {
  const { lang } = useLanguage()
  return lang === 'de' ? DE : EN
}
