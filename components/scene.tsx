'use client'

import type { ReactNode } from 'react'
import { SceneBackdrop, type BackdropVariant } from './scene-backdrop'
import type { Dictionary } from '@/lib/translations'

/**
 * Lightweight wrapper for ambient section backdrops. The previous chapter
 * pills and cinematic slate labels added visual noise and unnecessary empty
 * space, so major sections now flow directly into one another.
 */
export function Scene({
  backdrop,
  children,
}: {
  labelKey: keyof Dictionary['scene']
  backdrop?: BackdropVariant
  children: ReactNode
}) {
  return (
    <div className="relative">
      {backdrop && <SceneBackdrop variant={backdrop} />}
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
