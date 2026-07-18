'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useT } from './language-context'

/** Visible "Skip Intro" button — the skip-link only reaches keyboard and
 *  screen-reader users; a normal mouse visitor (a recruiter re-checking
 *  the site, say) had no way to bypass the long cinematic intro at all.
 *  Shown only while still inside the intro's scroll range, gone once past
 *  it (the site nav takes over from there). */
export function SkipIntroButton() {
  const t = useT()
  const [visible, setVisible] = useState(false)
  const introEndRef = useRef<number | null>(null)

  useEffect(() => {
    const getIntroEnd = () => {
      const intro = document.getElementById('intro')
      if (!intro) return null
      const rect = intro.getBoundingClientRect()
      return rect.bottom + window.scrollY - window.innerHeight
    }
    introEndRef.current = getIntroEnd()
    const onScroll = () => {
      const end = introEndRef.current
      setVisible(end !== null && window.scrollY < end - 40)
    }
    const onResize = () => {
      introEndRef.current = getIntroEnd()
      onScroll()
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const skip = () => {
    const el = document.getElementById('after-intro')
    if (!el) return
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis
    if (lenis) lenis.scrollTo(el, { offset: 0 })
    else el.scrollIntoView({ behavior: 'smooth' })
    el.focus()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={skip}
          className="glass fixed bottom-5 right-5 z-40 rounded-full px-5 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t.nav.skipIntro}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
