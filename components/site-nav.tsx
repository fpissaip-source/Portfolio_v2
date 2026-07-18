'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useT } from './language-context'

export function SiteNav() {
  const t = useT()
  const LINKS = [
    { label: t.nav.services, href: '#services' },
    { label: t.nav.lukas, href: '#lukas' },
    { label: t.nav.work, href: '#work' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.stack, href: '#stack' },
    { label: t.nav.process, href: '#process' },
    { label: t.nav.contact, href: '#contact' },
  ]
  const [show, setShow] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Appears the moment the cinematic intro ends (its bottom edge reaches
  // the top of the viewport) rather than deep into the page — a visible
  // way to navigate, including straight to "Arbeiten"/Work, exists from
  // right after the intro instead of only after scrolling most of the way
  // through Lukas.
  useEffect(() => {
    const getThreshold = () => {
      const intro = document.getElementById('intro')
      if (!intro) return window.innerHeight * 5
      const rect = intro.getBoundingClientRect()
      return rect.bottom + window.scrollY - window.innerHeight
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
      {/* Desktop — centered pill nav */}
      <AnimatePresence>
        {show && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-4 z-50 hidden -translate-x-1/2 sm:block"
          >
            <div className="glass flex items-center gap-1 rounded-full px-2 py-1.5">
              <div className="flex items-center">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => go(e, l.href)}
                    className="rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
      <AnimatePresence>
        {show && !menuOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setMenuOpen(true)}
            aria-label={t.nav.openMenu}
            aria-expanded={menuOpen}
            className="glass fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </motion.button>
        )}
      </AnimatePresence>

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
              className="glass absolute bottom-20 right-5 flex flex-col gap-0.5 rounded-2xl p-2"
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
                  className="rounded-xl px-5 py-2.5 text-right text-sm text-foreground transition-colors hover:bg-white/5"
                >
                  {l.label}
                </a>
              ))}
            </motion.nav>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t.nav.closeMenu}
              className="glass fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
