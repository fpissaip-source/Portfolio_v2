'use client'

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * FoldText, portiert von React Bits (reactbits.dev), JavaScript + CSS.
 *
 * Der Satz klappt auf wie ein Blatt, das gefaltet war: jedes Wort kippt um
 * seine obere Kante nach vorn, mit einem Schatten im Falz. Was es mitteilt:
 * hier wird etwas aufgeschlagen und gelesen.
 *
 * Zwei Abweichungen von der Vorlage:
 *
 * 1. Beim Trennen nach Woertern steht zwischen den Stuecken ein gewoehnliches
 *    Leerzeichen und kein geschuetztes. Die Vorlage setzt dort U+00A0, und ein
 *    geschuetztes Leerzeichen ist per Definition eine Stelle, an der nicht
 *    umbrochen werden darf: ein Satz von vierzig Zeichen laege damit in einer
 *    einzigen Zeile und liefe aus seiner Spalte heraus. In einer Ueberschrift
 *    aus drei Woertern faellt das nicht auf, in einer schmalen Spalte sofort.
 *    Die Regel white-space: pre-wrap bleibt, das gewoehnliche Leerzeichen
 *    ueberlebt sie und ist zugleich eine Umbruchstelle.
 *
 * 2. Die mitgelieferte .css-Datei steht bei den anderen Klassen in
 *    globals.css.
 *
 * Der Satz steht zweimal im Dokument: einmal unsichtbar fuer Vorleseprogramme
 * und einmal zerlegt fuer das Auge. Das ist hier hinnehmbar, weil die Seite
 * `noindex` traegt; auf einer indexierten Seite waere es das nicht.
 */

gsap.registerPlugin(ScrollTrigger)

type Scharnier = 'top' | 'bottom' | 'left' | 'right'

const SCHARNIERE: Record<Scharnier, { origin: string; rotateX: number; rotateY: number }> = {
  top: { origin: '50% 0%', rotateX: -92, rotateY: 0 },
  bottom: { origin: '50% 100%', rotateX: 92, rotateY: 0 },
  left: { origin: '0% 50%', rotateX: 0, rotateY: 92 },
  right: { origin: '100% 50%', rotateX: 0, rotateY: -92 },
}

const klemm = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export type FoldTextProps = {
  text: string
  splitBy?: 'char' | 'word' | 'line'
  hinge?: Scharnier
  duration?: number
  stagger?: number
  ease?: string
  perspective?: number
  creaseShading?: number
  trigger?: 'mount' | 'scroll' | 'hover' | 'loop'
  fontSize?: string | number
  fontWeight?: string | number
  color?: string
  className?: string
  style?: CSSProperties
}

export function FoldText({
  text,
  splitBy = 'char',
  hinge = 'top',
  duration = 0.65,
  stagger = 0.045,
  ease = 'power3.out',
  perspective = 700,
  creaseShading = 0.55,
  trigger = 'mount',
  fontSize = 'inherit',
  fontWeight = 'inherit',
  color = 'currentColor',
  className = '',
  style = {},
}: FoldTextProps) {
  const wurzel = useRef<HTMLSpanElement>(null)
  const zeitstrahl = useRef<gsap.core.Timeline | null>(null)
  const scharnier = SCHARNIERE[hinge] ?? SCHARNIERE.top
  const falz = klemm(creaseShading, 0, 1)
  const tiefe = Math.max(120, perspective)

  const stuecke = useMemo(() => {
    let zaehler = 0

    const stueck = (inhalt: ReactNode, key: string, art = splitBy) => {
      zaehler += 1
      return (
        <span
          className="fold-text-segment"
          data-fold-split={art}
          key={key}
          style={{ '--fold-perspective': `${tiefe}px` } as CSSProperties}
        >
          <span
            className="fold-text-piece"
            data-fold-hinge={hinge}
            style={{ transformOrigin: scharnier.origin, '--fold-crease': 0 } as CSSProperties}
          >
            {inhalt || ' '}
          </span>
        </span>
      )
    }

    if (splitBy === 'line') {
      return text
        .split('\n')
        .map((zeile, i) => (
          <span className="fold-text-line" key={`line-${i}`}>
            {stueck(zeile || ' ', `segment-line-${i}`, 'line')}
          </span>
        ))
    }

    if (splitBy === 'word') {
      return text.split(/(\s+)/).flatMap((teil, i) => {
        if (!teil) return []
        /* Gewoehnliches Leerzeichen, nicht U+00A0 wie in der Vorlage: sonst
           gaebe es in der ganzen Zeile keine Umbruchstelle mehr. */
        if (/^\s+$/.test(teil)) {
          return teil.split(/(\n)/).map((t, j) =>
            t === '\n' ? (
              <br key={`ws-${i}-br-${j}`} />
            ) : t ? (
              <span className="fold-text-whitespace" key={`ws-${i}-${j}`}>
                {t}
              </span>
            ) : null,
          )
        }
        return stueck(teil, `segment-word-${zaehler}`)
      })
    }

    return Array.from(text).map((z, i) =>
      z === '\n' ? <br key={`br-${i}`} /> : stueck(z === ' ' ? ' ' : z, `segment-char-${i}`),
    )
  }, [text, splitBy, hinge, scharnier.origin, tiefe])

  useEffect(() => {
    const wurzelEl = wurzel.current
    if (!wurzelEl) return

    const teile = Array.from(wurzelEl.querySelectorAll('.fold-text-piece'))
    if (!teile.length) return

    const ruhig = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const dauer = ruhig ? Math.min(duration, 0.22) : duration
    const versatz = ruhig ? Math.min(stagger, 0.02) : stagger

    const von = {
      opacity: 0,
      rotateX: ruhig ? 0 : scharnier.rotateX,
      rotateY: ruhig ? 0 : scharnier.rotateY,
      '--fold-crease': ruhig ? 0 : falz,
      transformOrigin: scharnier.origin,
      force3D: true,
    }
    const nach = {
      opacity: 1,
      rotateX: 0,
      rotateY: 0,
      '--fold-crease': 0,
      duration: dauer,
      ease: ruhig ? 'power1.out' : ease,
      stagger: versatz,
      clearProps: 'willChange',
    }

    const abraeumen = () => {
      zeitstrahl.current?.kill()
      zeitstrahl.current = null
      gsap.killTweensOf(teile)
    }

    const spielen = (wiederholen: boolean) => {
      abraeumen()
      zeitstrahl.current = gsap.timeline({
        repeat: wiederholen ? -1 : 0,
        repeatDelay: wiederholen ? 0.75 : 0,
      })
      zeitstrahl.current.fromTo(teile, von, nach)
      return zeitstrahl.current
    }

    let ausloeser: ScrollTrigger | undefined
    let beiSchweben: (() => void) | undefined

    if (trigger === 'hover') {
      gsap.set(teile, {
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
        '--fold-crease': 0,
        transformOrigin: scharnier.origin,
      })
      beiSchweben = () => {
        spielen(false)
      }
      wurzelEl.addEventListener('mouseenter', beiSchweben)
    } else if (trigger === 'scroll') {
      gsap.set(teile, von)
      ausloeser = ScrollTrigger.create({
        trigger: wurzelEl,
        start: 'top 88%',
        once: true,
        onEnter: () => spielen(false),
      })
    } else if (trigger === 'loop') {
      spielen(true)
    } else {
      spielen(false)
    }

    return () => {
      if (beiSchweben) wurzelEl.removeEventListener('mouseenter', beiSchweben)
      ausloeser?.kill()
      abraeumen()
    }
  }, [
    text,
    splitBy,
    hinge,
    duration,
    stagger,
    ease,
    perspective,
    falz,
    trigger,
    scharnier.origin,
    scharnier.rotateX,
    scharnier.rotateY,
  ])

  return (
    <span
      ref={wurzel}
      className={`fold-text ${className}`.trim()}
      style={
        {
          '--fold-text-font-size': typeof fontSize === 'number' ? `${fontSize}px` : fontSize,
          '--fold-text-font-weight': fontWeight,
          '--fold-text-color': color,
          ...style,
        } as CSSProperties
      }
    >
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {stuecke}
      </span>
    </span>
  )
}
