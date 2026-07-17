'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useT } from './language-context'

export function SiteNav() {
  const t = useT()
  const LINKS = [
    { label: t.nav.lukas, href: '#lukas' },
    { label: t.nav.work, href: '#work' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.stack, href: '#stack' },
    { label: t.nav.process, href: '#process' },
    { label: t.nav.contact, href: '#contact' },
  ]
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 4.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
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
  )
}
