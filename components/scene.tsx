'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { SceneBackdrop, type BackdropVariant } from './scene-backdrop'

const easeOut = [0.22, 1, 0.36, 1] as const

/**
 * Film-chapter wrapper. Every major section opens with an editorial slate
 * line, flanked by a rule that draws outward, while thin letterbox bars
 * retract as the section scrolls into view. Purely presentational —
 * anchors/ids stay on the wrapped section components.
 */
export function Scene({
  label,
  backdrop,
  children,
}: {
  label: string
  backdrop?: BackdropVariant
  children: ReactNode
}) {
  return (
    <div className="relative">
      {backdrop && <SceneBackdrop variant={backdrop} />}
      {/* letterbox bars — pinch the frame shut, then release */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 origin-top bg-black"
        initial={{ height: 56 }}
        whileInView={{ height: 0 }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 1.1, ease: easeOut }}
      />

      {/* slate */}
      <div className="pointer-events-none relative z-10 mx-auto flex max-w-7xl items-center gap-4 px-6 pt-20">
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-left bg-gradient-to-r from-transparent via-purple/50 to-purple/10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, ease: easeOut }}
        />
        <motion.span
          className="whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.4em] text-purple/80"
          initial={{ opacity: 0, letterSpacing: '0.7em', filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, letterSpacing: '0.4em', filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1, ease: easeOut }}
        >
          {label}
        </motion.span>
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-right bg-gradient-to-l from-transparent via-purple/50 to-purple/10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, ease: easeOut }}
        />
      </div>

      {children}
    </div>
  )
}

/** Subtle animated film grain over the whole page. One fixed div, SVG
 *  turbulence tile, very low opacity — texture, not noise. */
export function FilmGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-overlay motion-safe:animate-[grain_1.2s_steps(4)_infinite]"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: '240px 240px',
      }}
    />
  )
}
