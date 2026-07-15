'use client'

import { LineReveal, Reveal } from './anim'

/**
 * Cinematic interlude — the fact carries itself, so the typography stays
 * quiet and enormous. No badge, no exclamation: just the statement.
 */
export function PhoneStory() {
  return (
    <section
      id="phone"
      aria-label="Built entirely on a phone"
      className="relative overflow-hidden px-6 py-40 sm:py-56"
    >
      {/* faint code rain inside a phone silhouette */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[76%] w-[min(320px,60vw)] -translate-x-1/2 -translate-y-1/2 rounded-[3rem] border border-purple/15 opacity-40"
      >
        <div className="absolute inset-x-0 top-3 mx-auto h-1.5 w-16 rounded-full bg-white/5" />
        <div className="absolute inset-4 overflow-hidden rounded-[2.2rem]">
          <div className="h-[200%] w-full animate-[grain_9s_linear_infinite] bg-[repeating-linear-gradient(0deg,transparent,transparent_10px,color-mix(in_oklch,var(--purple)_12%,transparent)_11px,transparent_12px)]" />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <LineReveal
          className="text-balance font-sans text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl md:text-7xl"
          stagger={0.16}
          lines={[
            <>Every system on this page,</>,
            <>
              <span className="text-muted-foreground">
                the agent, the platforms, the deployments,
              </span>
            </>,
            <>was designed, written and shipped</>,
            <>
              <span className="bg-gradient-to-br from-purple via-white to-blue bg-clip-text text-transparent">
                on a phone.
              </span>
            </>,
          ]}
        />

        <Reveal delay={0.5}>
          <p className="mt-14 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground sm:text-sm">
            No PC. No laptop. The entire time.
          </p>
        </Reveal>
        <Reveal delay={0.62}>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground/60">
            6.1-inch screen &middot; Germany
          </p>
        </Reveal>
      </div>
    </section>
  )
}
