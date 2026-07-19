'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EN, DE, type Dictionary } from '@/lib/translations'

export type Lang = 'en' | 'de'

type LanguageContextValue = {
  /** null only for the instant before the layout effect resolves the browser
   *  language. This happens before the first painted frame, so the site does
   *  not visibly flash between languages. */
  lang: Lang | null
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null)

  useLayoutEffect(() => {
    const browserLanguage = navigator.languages?.[0] ?? navigator.language
    const detected: Lang = browserLanguage.toLowerCase().startsWith('de') ? 'de' : 'en'

    // Browser language is now the source of truth. Remove the old remembered
    // picker value so it cannot override a visitor's current browser setting.
    window.localStorage.removeItem('site-lang')
    setLangState(detected)
  }, [])

  useLayoutEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  // A language change re-renders every section with differently-sized copy.
  // Refresh the scroll measurements once the new layout has settled.
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

export function useT(): Dictionary {
  const { lang } = useLanguage()
  return lang === 'de' ? DE : EN
}
