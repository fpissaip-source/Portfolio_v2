'use client'

import { useEffect, useLayoutEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GradientOrbs } from './gradient-orbs'
import { HeroRobotVideo } from './hero-robot-video'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useT } from './language-context'
import { handleAnchorClick } from '@/lib/scroll-to'
import { SideRays } from './side-rays'
import { SpecularButton } from './specular-button'

gsap.registerPlugin(ScrollTrigger)

const easeOut = [0.22, 1, 0.36, 1] as const

function LitWord({ word }: { word: string }) {
  return (
    <span className="inline-block">
      {word.split('').map((ch, i) => (
        <span key={i} data-lit style={{ opacity: 0.12 }} className="inline-block">
          {ch}
        </span>
      ))}
    </span>
  )
}

function LitPhrase({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <LitWord word={w} />
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export function Hero() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const lightningRef = useRef<LightningHandle>(null)
  const headingEnd = t.hero.headingEnd.replace(/^[—–-]\s*/, '')

  // Shrink the heading only if a single unbreakable word would otherwise
  // overflow its column (German compounds do this at narrow widths). The h1
  // is a block element, so its border box always equals the column — the
  // overflow signal is scrollWidth vs clientWidth, not width vs available.
  useLayoutEffect(() => {
    const h1 = h1Ref.current
    if (!h1) return
    const fit = () => {
      h1.style.fontSize = ''
      const available = h1.clientWidth
      const needed = h1.scrollWidth
      if (available > 0 && needed > available) {
        const base = parseFloat(window.getComputedStyle(h1).fontSize)
        h1.style.fontSize = `${(base * available) / needed}px`
      }
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [t.hero.headingStart, t.hero.headingHighlight, headingEnd])

  useEffect(() => {
    const section = sectionRef.current
    const highlight = highlightRef.current
    const h1 = h1Ref.current
    if (!section || !highlight || !h1) return
    let sparked = false
    // Trigger on the HEADLINE itself, not the whole min-h-screen section.
    // The heading sits in the section's vertical center, so a
    // section-top-based trigger (start 'top 90%') begins reacting while the
    // text is still far below the fold — on a phone the reveal was already
    // finishing by the time the words were comfortably on screen, so the
    // visitor only ever caught its tail. Anchoring to the heading and
    // starting once it's fully in view means the reveal actually plays out
    // while you're reading it: begins when the whole headline has entered
    // ('bottom bottom') and completes as it reaches center.
    const revealTrigger = { trigger: h1, start: 'bottom bottom', end: 'center 45%', scrub: 0.5 }
    const ctx = gsap.context(() => {
      gsap.to(section.querySelectorAll('[data-lit]'), {
        opacity: 1,
        ease: 'none',
        duration: 0.35,
        stagger: 0.045,
        scrollTrigger: {
          ...revealTrigger,
          onUpdate: (self) => {
            if (!sparked && self.progress >= 0.85) {
              sparked = true
              lightningRef.current?.strike({ intensity: 0.9 })
            }
          },
        },
      })

      gsap.to(highlight, {
        opacity: 1,
        ease: 'none',
        scrollTrigger: { ...revealTrigger },
      })
    }, section)
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [t.hero.headingStart, t.hero.headingHighlight, headingEnd])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden px-6 pb-24 pt-28"
    >
      {/* Both ambient layers are masked to fade out before the section ends.
          The hero is `overflow-hidden`, so anything lighting it gets cut off
          dead straight at the bottom edge — invisible while the hero was
          near-black, but a hard full-width seam against the black services
          section as soon as SideRays lit it. The mask ends the light inside
          the hero instead of letting the section boundary end it.
          -webkit- prefix included: Safari still needs it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 14%, black 55%, transparent 94%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 14%, black 55%, transparent 94%)',
        }}
      >
        <GradientOrbs />
        {/* Light from off-frame, top right — the hero is the largest expanse
            of bare canvas on the page, and a source outside the frame is
            consistent rather than decorative (DESIGN.md §3). Kept low: it
            must read as one lamp, not as a colour wash. */}
        <SideRays />
      </div>
      <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[1]" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        {/* Copy column. Centered on a phone (where the robot sits behind it),
            left-aligned from `lg` up (where the robot has its own column and
            the text has a hard left edge to line up on). */}
        <div className="relative text-center lg:text-left">
          {/* Phone placement: the head sits centred *behind* the copy, since
              there is no room for a second column.
              Its band is anchored to the top of the column and sized by
              width (aspect-video + object-contain = the picture fills this
              box exactly), so it always lands behind the kicker and the
              headline — white, large type, which keeps a wide contrast
              margin — and never behind the body paragraph, which is muted
              grey and would not. That is measured, not assumed: centred
              across the whole column at 34% the body copy came out at
              3.88:1 against the video's blown-out white frames, under the
              4.5:1 floor. As laid out here the headline measures 8.5:1 and
              the body copy sits on plain background.
              The bottom fade is the safety margin for the layouts I can't
              enumerate (longer headline, other language, narrower phone):
              wherever the copy might reach up into the band, the picture is
              already fading to nothing. */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-9 aspect-video w-[132%] -translate-x-1/2 lg:hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, black 0%, black 52%, transparent 90%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 52%, transparent 90%)',
            }}
          >
            <HeroRobotVideo mode="narrow" className="absolute inset-0 opacity-[0.42]" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(72% 64% at 50% 50%, rgba(5,5,5,0.42) 0%, rgba(5,5,5,0.34) 55%, rgba(5,5,5,0) 100%)',
              }}
            />
            {/* Feather the frame's own edges into the page. Painted as
                background-coloured gradients rather than as a second mask:
                they can only ever darken, so the contrast measured above
                stays valid — a mask could have lightened an edge. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to right, #050505 0%, rgba(5,5,5,0) 16%, rgba(5,5,5,0) 84%, #050505 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0) 20%)',
              }}
            />
          </div>

          <div className="relative">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: easeOut }}
              className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue"
            >
              {t.hero.kicker}
            </motion.p>

            <h1
              ref={h1Ref}
              className="mt-6 text-balance font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl lg:text-[3.5rem] xl:text-6xl"
            >
              <LitPhrase text={t.hero.headingStart} />{' '}
              <span
                ref={highlightRef}
                style={{ opacity: 0.12 }}
                className="bg-gradient-to-br from-blue via-white to-purple bg-clip-text text-transparent"
              >
                {t.hero.headingHighlight}
              </span>{' '}
              <LitPhrase text={headingEnd} />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.6, ease: easeOut }}
              className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground lg:mx-0 mx-auto sm:text-lg"
            >
              {t.hero.body}
            </motion.p>

            {/* What I do, as four labels rather than a fifth sentence — the
                breadth is the message, and a list is read in a glance. */}
            <motion.ul
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.72, ease: easeOut }}
              className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start"
            >
              {t.hero.capabilities.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium tracking-tight text-foreground/90"
                >
                  {c}
                </li>
              ))}
            </motion.ul>

            {/* One primary (blue: this is craft/work, DESIGN.md §3) and one
                quiet secondary; the secondary is a text link rather than a
                second button so the pair never reads as two equal choices. */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease: easeOut }}
              className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-7 lg:items-start"
            >
              <SpecularButton href="#contact" onClick={(e) => handleAnchorClick(e, '#contact')}>
                {t.hero.ctaPrimary}
              </SpecularButton>
              <a
                href="#work"
                onClick={(e) => handleAnchorClick(e, '#work')}
                className="py-1.5 text-sm font-medium tracking-tight text-muted-foreground underline decoration-white/20 underline-offset-8 transition-colors hover:text-foreground hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                {t.hero.ctaSecondary}
              </a>
            </motion.div>
          </div>
        </div>

        {/* Desktop placement: its own column, so the copy keeps a plain black
            background and nothing has to be dimmed to stay readable. Masked
            at the edges so the footage sits in the page instead of reading
            as a pasted-in card with four hard corners. */}
        <div
          className="hidden aspect-video w-full lg:block"
          style={{
            // The ellipse is inscribed in the box (50%/50%), so the mask is
            // fully transparent by the time it reaches any edge — with a
            // larger radius the footage would still end on a visible
            // rectangle, just a dimmer one.
            maskImage: 'radial-gradient(50% 50% at 50% 50%, black 0%, black 55%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(50% 50% at 50% 50%, black 0%, black 55%, transparent 100%)',
          }}
        >
          <HeroRobotVideo mode="wide" className="h-full w-full" />
        </div>
      </div>
    </section>
  )
}
