'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const LINKS = [
  { label: 'Work', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Stack', href: '#stack' },
  { label: 'Process', href: '#process' },
  { label: 'Contact', href: '#contact' },
]

export function SiteNav() {
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
          className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
        >
          <div className="glass flex items-center gap-1 rounded-full px-2 py-1.5">
            <a
              href="#top"
              onClick={(e) => go(e, '#top')}
              className="px-3 py-1.5 font-mono text-sm font-semibold tracking-tight text-foreground"
            >
              IH<span className="text-blue">.</span>
            </a>
            <div className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
            <div className="hidden items-center sm:flex">
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
