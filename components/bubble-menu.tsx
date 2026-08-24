'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'

/**
 * BubbleMenu, portiert von React Bits (reactbits.dev), JavaScript + CSS.
 *
 * Zwei Blasen in der Kopfzeile: links der Namenszug, rechts der Schalter.
 * Beim Öffnen springen grosse Pillen ins Bild, jede leicht gekippt, und
 * legen sich über die Seite.
 *
 * Vier Ergänzungen, die die Vorlage nicht hat und die eine Navigation
 * braucht, sobald sie nicht nur eine Vorführung ist:
 *
 * 1. Escape schliesst. Ein Vollbild-Überzug ohne Fluchtweg über die Tastatur
 *    ist eine Falle.
 * 2. Der Hintergrund friert ein, solange offen ist. Sonst scrollt die Seite
 *    hinter den Pillen weiter, und beim Schliessen steht man woanders.
 *    Lenis übernimmt das Scrollen dieser Seite, also wird Lenis angehalten
 *    und nicht `overflow: hidden` gesetzt.
 * 3. Die Verweise laufen über Lenis statt über einen Sprung: die Seite hat
 *    weiches Scrollen, und ein harter Sprung mitten hinein sieht aus wie ein
 *    Fehler.
 * 4. Bei abgeschalteter Bewegung erscheinen die Pillen ohne Federung. Die
 *    Vorlage kennt die Einstellung nicht.
 *
 * Der Rest ist die Vorlage: dieselbe Anordnung, dieselben Zeiten, dieselbe
 * gestaffelte Federung (`back.out`).
 */

export type BubbleItem = {
  label: string
  href: string
  ariaLabel?: string
  rotation?: number
  hoverStyles?: { bgColor?: string; textColor?: string }
}

type Props = {
  logo: ReactNode
  items: BubbleItem[]
  menuAriaLabel?: string
  closeAriaLabel?: string
  navAriaLabel?: string
  menuBg?: string
  menuContentColor?: string
  onLogoClick?: (e: React.MouseEvent) => void
  onItemClick?: (e: React.MouseEvent, href: string) => void
  animationEase?: string
  animationDuration?: number
  staggerDelay?: number
}

export function BubbleMenu({
  logo,
  items,
  menuAriaLabel = 'Menü öffnen',
  closeAriaLabel = 'Menü schliessen',
  navAriaLabel = 'Hauptnavigation',
  menuBg = '#fff',
  menuContentColor = '#111',
  onLogoClick,
  onItemClick,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.5,
  staggerDelay = 0.12,
}: Props) {
  const [offen, setOffen] = useState(false)
  const [zeigen, setZeigen] = useState(false)

  const ueberzug = useRef<HTMLDivElement>(null)
  const blasen = useRef<(HTMLAnchorElement | null)[]>([])
  const marken = useRef<(HTMLSpanElement | null)[]>([])

  const umschalten = () => {
    const naechster = !offen
    if (naechster) setZeigen(true)
    setOffen(naechster)
  }

  /* Escape schliesst, und solange offen ist, steht die Seite still. */
  useEffect(() => {
    if (!offen) return
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis
    lenis?.stop()
    const beiTaste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOffen(false)
    }
    window.addEventListener('keydown', beiTaste)
    return () => {
      window.removeEventListener('keydown', beiTaste)
      lenis?.start()
    }
  }, [offen])

  useEffect(() => {
    const el = ueberzug.current
    const b = blasen.current.filter(Boolean) as HTMLElement[]
    const m = marken.current.filter(Boolean) as HTMLElement[]
    if (!el || !b.length) return

    const ruhig = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    if (offen) {
      gsap.set(el, { display: 'flex' })
      gsap.killTweensOf([...b, ...m])

      if (ruhig) {
        gsap.set(b, { scale: 1, transformOrigin: '50% 50%' })
        gsap.set(m, { y: 0, autoAlpha: 1 })
        return
      }

      gsap.set(b, { scale: 0, transformOrigin: '50% 50%' })
      gsap.set(m, { y: 24, autoAlpha: 0 })

      b.forEach((blase, i) => {
        const verzug = i * staggerDelay + gsap.utils.random(-0.05, 0.05)
        const zeit = gsap.timeline({ delay: verzug })
        zeit.to(blase, { scale: 1, duration: animationDuration, ease: animationEase })
        if (m[i]) {
          zeit.to(
            m[i],
            { y: 0, autoAlpha: 1, duration: animationDuration, ease: 'power3.out' },
            `-=${animationDuration * 0.9}`,
          )
        }
      })
      return
    }

    if (!zeigen) return
    gsap.killTweensOf([...b, ...m])
    if (ruhig) {
      gsap.set(el, { display: 'none' })
      setZeigen(false)
      return
    }
    gsap.to(m, { y: 24, autoAlpha: 0, duration: 0.2, ease: 'power3.in' })
    gsap.to(b, {
      scale: 0,
      duration: 0.2,
      ease: 'power3.in',
      onComplete: () => {
        gsap.set(el, { display: 'none' })
        setZeigen(false)
      },
    })
  }, [offen, zeigen, animationEase, animationDuration, staggerDelay])

  /* Die Kippung gilt erst ab der Breite, ab der die Pillen nebeneinander
     stehen. Untereinander gekippt sähen sie aus wie verrutscht. */
  useEffect(() => {
    const anpassen = () => {
      if (!offen) return
      const breit = window.innerWidth >= 900
      blasen.current.forEach((blase, i) => {
        if (blase) gsap.set(blase, { rotation: breit ? (items[i]?.rotation ?? 0) : 0 })
      })
    }
    window.addEventListener('resize', anpassen)
    return () => window.removeEventListener('resize', anpassen)
  }, [offen, items])

  return (
    <>
      <nav className="bubble-menu fixed" aria-label={navAriaLabel}>
        <a
          href="#top"
          onClick={onLogoClick}
          data-page-chrome
          className="bubble logo-bubble"
          style={{ background: menuBg, color: menuContentColor }}
        >
          <span className="logo-content">{logo}</span>
        </a>

        <button
          type="button"
          className={`bubble toggle-bubble menu-btn ${offen ? 'open' : ''}`}
          onClick={umschalten}
          aria-label={offen ? closeAriaLabel : menuAriaLabel}
          aria-expanded={offen}
          data-page-chrome
          style={{ background: menuBg }}
        >
          <span className="menu-line" style={{ background: menuContentColor }} />
          <span className="menu-line short" style={{ background: menuContentColor }} />
        </button>
      </nav>

      {zeigen && (
        <div ref={ueberzug} className="bubble-menu-items fixed" aria-hidden={!offen}>
          <ul className="pill-list" role="menu" aria-label={navAriaLabel}>
            {items.map((item, i) => (
              <li key={item.href} role="none" className="pill-col">
                <a
                  role="menuitem"
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link"
                  style={
                    {
                      '--item-rot': `${item.rotation ?? 0}deg`,
                      '--pill-bg': menuBg,
                      '--pill-color': menuContentColor,
                      '--hover-bg': item.hoverStyles?.bgColor || '#f3f4f6',
                      '--hover-color': item.hoverStyles?.textColor || menuContentColor,
                    } as CSSProperties
                  }
                  ref={(el) => {
                    blasen.current[i] = el
                  }}
                  onClick={(e) => {
                    onItemClick?.(e, item.href)
                    setOffen(false)
                  }}
                >
                  <span
                    className="pill-label"
                    ref={(el) => {
                      marken.current[i] = el
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
