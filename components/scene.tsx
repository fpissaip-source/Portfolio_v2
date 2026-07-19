'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { SceneBackdrop, type BackdropVariant } from './scene-backdrop'
import { useT } from './language-context'

const easeOut = [0.22, 1, 0.36, 1] as const

/**
 * Film-chapter wrapper. Every major section opens with an editorial slate
 * line, flanked by a rule that draws outward, while thin letterbox bars
 * retract as the section scrolls into view. Purely presentational —
 * anchors/ids stay on the wrapped section components.
 */
export function Scene({
  labelKey,
  backdrop,
  children,
}: {
  labelKey: keyof ReturnType<typeof useT>['scene']
  backdrop?: BackdropVariant
  children: ReactNode
}) {
  const t = useT()
  const label = t.scene[labelKey]
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

      {/* Elegant chapter marker: normal sans typography instead of terminal UI. */}
      <div className="pointer-events-none relative z-10 mx-auto flex max-w-7xl items-center gap-4 px-6 pt-20 sm:gap-6">
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-left bg-gradient-to-r from-transparent via-purple/45 to-blue/20"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1.2, ease: easeOut }}
        />
        <motion.div
          className="flex max-w-[78vw] items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-center backdrop-blur-sm sm:max-w-none"
          initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 1, ease: easeOut }}
        >
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple shadow-[0_0_14px_2px_color-mix(in_oklch,var(--purple)_55%,transparent)]"
          />
          <span className="text-sm font-medium tracking-[-0.01em] text-foreground/55">
            {label}
          </span>
        </motion.div>
        <motion.span
          aria-hidden
          className="h-px flex-1 origin-right bg-gradient-to-l from-transparent via-purple/45 to-blue/20"
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
