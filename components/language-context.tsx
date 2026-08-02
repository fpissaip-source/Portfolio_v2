'use client'

import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { EN, DE, type Dictionary } from '@/lib/translations'

export type Lang = 'en' | 'de'

const STORAGE_KEY = 'site-lang'

type LanguageContextValue = {
  /** null only for the instant before the layout effect resolves the language. */
  lang: Lang | null
  setLang: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang | null>(null)

  useLayoutEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'de' || stored === 'en') {
      setLangState(stored)
      return
    }

    // German browser languages get German. Every other browser language falls
    // back to English, including unsupported languages.
    const browserLanguage = navigator.languages?.[0] ?? navigator.language
    const detected: Lang = browserLanguage.toLowerCase().startsWith('de') ? 'de' : 'en'
    setLangState(detected)
  }, [])

  useLayoutEffect(() => {
    if (lang) document.documentElement.lang = lang
  }, [lang])

  // A voluntary language switch changes copy dimensions throughout the page,
  // so refresh every scroll trigger after the new layout has settled.
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

export function useT(): Dictionary {
  const { lang } = useLanguage()
  // German is the fallback while `lang` is still unresolved — which is what
  // the server renders, and therefore what any crawler that does not run JS
  // reads. The page's <html lang>, its metadata and its structured data all
  // say de-DE; serving English HTML underneath them was the one combination
  // guaranteed to be wrong. Visitors never see this state: the language is
  // resolved in a layout effect, behind the preloader.
  return lang === 'en' ? EN : DE
}
