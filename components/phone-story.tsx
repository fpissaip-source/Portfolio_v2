'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { LineReveal, Reveal } from './anim'

/**
 * Cinematic interlude — the fact carries itself, so the typography stays
 * quiet and enormous. Behind it: the actual instrument, a dark iPhone
 * traced by a violet rim light.
 */
export function PhoneStory() {
  return (
    <section
      id="phone"
      aria-label="Built entirely on a phone"
      className="relative overflow-hidden px-6 py-40 sm:py-56"
    >
      {/* the instrument itself — dark iPhone with violet rim light */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.06 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[max(120vw,900px)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(1400px,100vw)]"
      >
        <Image
          src="/phone/iphone-dark.png"
          alt=""
          fill
          sizes="100vw"
          className="object-contain opacity-80"
        />
        {/* melt the image edges into the page background */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent_45%,#050505_92%)]" />
      </motion.div>

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
