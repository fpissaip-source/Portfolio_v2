'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useT } from './language-context'

export function SiteNav() {
  const reduce = useReducedMotion()
  const t = useT()
  const LINKS = [
    // Mirrors the page order: L.U.K.A.S. right after the hero, then the
    // work, then what's on offer.
    { label: t.nav.lukas, href: '#lukas' },
    { label: t.nav.work, href: '#work' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.stack, href: '#stack' },
    { label: t.nav.process, href: '#process' },
    { label: t.nav.contact, href: '#contact' },
  ]
  const [show, setShow] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Appears once the hero has been scrolled past. The hero carries its own
  // two calls to action, so the nav would only compete with them there;
  // from the next section on it is the only way to move around the page.
  useEffect(() => {
    const getThreshold = () => {
      const hero = document.getElementById('top')
      if (!hero) return window.innerHeight * 0.8
      const rect = hero.getBoundingClientRect()
      return rect.bottom + window.scrollY - window.innerHeight * 0.6
    }
    let threshold = getThreshold()
    const onScroll = () => setShow(window.scrollY > threshold)
    const onResize = () => {
      threshold = getThreshold()
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

  function go(e: React.MouseEvent, href: string) {
    e.preventDefault()
    const el = document.querySelector(href)
    if (!el) return
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis
    if (lenis) lenis.scrollTo(el, { offset: -40 })
    else el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Wordmark. The top of the page had no name on it until the visitor
          scrolled past the hero — on a portfolio, of all things. Always
          there, quiet, and a way back to the top. */}
      <a
        href="#top"
        onClick={(e) => go(e, '#top')}
        data-page-chrome
        className="fixed left-4 top-4 z-50 rounded-full px-1 py-1.5 font-label text-[12px] uppercase tracking-[0.22em] text-foreground/70 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-6 sm:text-[11px]"
      >
        Issa Hareb
      </a>

      {/* Desktop — centered pill nav */}
      <AnimatePresence>
        {show && (
          <motion.nav
            initial={reduce ? false : { opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -20 }}
            transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-4 z-50 hidden -translate-x-1/2 sm:block"
          >
            <div data-page-chrome className="glass flex items-center gap-1 rounded-full px-2 py-1.5">
              <div className="flex items-center">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    // whitespace-nowrap: at tablet widths the pill gets tight
                    // enough that "Über mich" wrapped to a second line, which
                    // pushed that one item off the shared baseline and made
                    // the pill visibly taller than its own padding.
                    className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[15px] text-foreground/75 transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Mobile — compact menu button + overlay, since the desktop pill
          nav is hidden below `sm` and mobile otherwise has no navigation
          at all. */}
      {/* Mobile menu — top right, next to the language switch, and there
          from the first screen. It used to appear only after the hero and
          to sit in the bottom-right corner, on top of the L.U.K.A.S.
          launcher: two floating round buttons fighting for one corner. */}
      {!menuOpen && (
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t.nav.openMenu}
          aria-expanded={menuOpen}
          data-mobile-menu
          data-page-chrome
          className="glass fixed right-4 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden"
        >
          <Menu className="h-4.5 w-4.5" aria-hidden />
        </button>
      )}

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm sm:hidden"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="glass absolute right-4 top-16 flex flex-col gap-0.5 rounded-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => {
                    go(e, l.href)
                    setMenuOpen(false)
                  }}
                  className="rounded-full px-5 py-2.5 text-right text-sm text-foreground transition-colors hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
            </motion.nav>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t.nav.closeMenu}
              data-mobile-menu
            className="glass fixed right-4 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="h-4.5 w-4.5" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
