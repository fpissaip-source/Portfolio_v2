'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { GradientOrbs } from './gradient-orbs'
import { LightningFlash, type LightningHandle } from './lightning-flash'
import { useT } from './language-context'
import { handleAnchorClick } from '@/lib/scroll-to'
import { ScrubVideo, type ScrubVideoHandle } from './scrub-video'
import { SideRays } from './side-rays'
import { SpecularButton } from './specular-button'

gsap.registerPlugin(ScrollTrigger)

const easeOut = [0.22, 1, 0.36, 1] as const

const SRC = '/videos/hero-robot.mp4'
const SRC_MOBILE = '/videos/hero-robot-mobile.mp4'
const POSTER = '/intro/hero-robot-poster.jpg'

/** Share of the hero's scroll spent taking the head apart. The rest is the
 *  tail end of the copy arriving, so the last thing before L.U.K.A.S. is a
 *  finished page rather than a still-moving one. */
const SCRUB_SPAN = 0.72
/** Where in the *video* the copy starts arriving. Deliberately late: until
 *  the head is most of the way apart, the animation has the stage to
 *  itself, which is the whole point of it being there. */
const REVEAL_AT = 0.7

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** Progress of `p` through the window [a, b], clamped. */
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

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

/**
 * The hero is one held frame that the visitor operates: the head hangs
 * there, and scrolling takes it apart.
 *
 * The section is taller than the screen and its stage is sticky, so that
 * scroll distance drives the animation instead of moving the page. The
 * headline is up from the first moment — it is the one sentence that has to
 * land whether or not anyone scrolls — and everything else (the paragraph,
 * the capability labels, the two calls to action) only arrives once the
 * disassembly is 70% done, so the animation never has to share the stage
 * while it is the thing worth watching.
 *
 * Phone and desktop differ in placement, not in choreography: on a wide
 * screen the head has its own column beside the copy at a size you can
 * actually read; on a phone it stands alone in the middle, above the copy
 * rather than behind it, and gives up some of its height as the copy
 * arrives.
 *
 * Under prefers-reduced-motion none of this happens: the section is a plain
 * one-screen hero with everything visible and the head on its first frame.
 */
export function Hero() {
  const t = useT()
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const highlightRef = useRef<HTMLSpanElement>(null)
  const robotRef = useRef<HTMLDivElement>(null)
  const robotBoxRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const cueRef = useRef<HTMLAnchorElement>(null)
  const videoRef = useRef<ScrubVideoHandle>(null)
  const lightningRef = useRef<LightningHandle>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  // The headline lights up on arrival, not on scroll: it is the first thing
  // on the page now, and a scroll-driven reveal would mean the visitor's
  // first impression is a half-lit sentence.
  useEffect(() => {
    const section = sectionRef.current
    const highlight = highlightRef.current
    if (!section || !highlight) return
    const ctx = gsap.context(() => {
      const targets = section.querySelectorAll('[data-lit]')
      if (reduced) {
        gsap.set([targets, highlight], { opacity: 1 })
        return
      }
      gsap
        .timeline({ delay: 0.25 })
        .to(targets, { opacity: 1, duration: 0.45, stagger: 0.012, ease: 'none' }, 0)
        .to(highlight, { opacity: 1, duration: 0.9, ease: 'none' }, 0)
        .add(() => lightningRef.current?.strike({ intensity: 0.75 }), '>-0.35')
    }, section)
    return () => ctx.revert()
  }, [reduced, t.hero.headingLine1, t.hero.headingLine2])

  // Scroll choreography.
  useEffect(() => {
    const section = sectionRef.current
    const reveal = revealRef.current
    const robot = robotRef.current
    const robotBox = robotBoxRef.current
    if (!section || !reveal || !robot || !robotBox || reduced) return

    const stage = stageRef.current
    const grid = gridRef.current
    if (!stage || !grid) return

    const rows = Array.from(reveal.children) as HTMLElement[]
    const header = grid.children[0] as HTMLElement
    let narrow = window.matchMedia('(max-width: 1023px)').matches
    let sparked = false
    let startH = 0
    let endH = 0
    let maxW = 0

    // On a phone the head, the headline and the copy share one screen, so
    // how tall the head can be is arithmetic, not a guess: whatever is left
    // over. Fixed vh values looked right on a 390×844 phone and cut the
    // second call to action off on a 360×640 one.
    const measure = () => {
      if (!narrow) return
      const cs = window.getComputedStyle(stage)
      const avail =
        stage.clientHeight - parseFloat(cs.paddingTop || '0') - parseFloat(cs.paddingBottom || '0')
      const gaps = 2 * parseFloat(window.getComputedStyle(grid).rowGap || '20')
      const fixed = header.offsetHeight + reveal.offsetHeight + gaps
      // Floor: below this the head is a thumbnail and the whole point of it
      // is gone — better to let the section give up a few pixels at the
      // bottom edge than to show a postage stamp.
      endH = Math.max(130, avail - fixed)
      startH = Math.max(endH, Math.min(avail - header.offsetHeight - gaps, window.innerHeight * 0.52))
      maxW = window.innerWidth * 1.32
    }

    const apply = (p: number) => {
      const v = clamp01(p / SCRUB_SPAN)
      videoRef.current?.seek(v)
      if (!sparked && v >= 0.99) {
        sparked = true
        lightningRef.current?.strike({ intensity: 0.9 })
      }
      // Tie the copy to the video's own progress, not the raw scroll, so
      // "arrives at 70% of the animation" stays true if the span changes.
      const r = seg(v, REVEAL_AT, 1)
      rows.forEach((row, i) => {
        // Each row has its own slice of the reveal, so they arrive in
        // reading order instead of as one block.
        const a = i * 0.22
        const e = seg(r, a, Math.min(1, a + 0.55))
        row.style.opacity = String(e)
        row.style.transform = `translate3d(0, ${lerp(18, 0, e).toFixed(2)}px, 0)`
      })
      // The cue is the first screen's only next step; once the real copy
      // and its call to action are on screen it has nothing left to say.
      const cue = cueRef.current
      if (cue) {
        const out = 1 - seg(r, 0, 0.35)
        cue.style.opacity = String(out)
        cue.style.pointerEvents = out < 0.4 ? 'none' : 'auto'
      }
      // The head gives up height as the copy arrives — on a phone that room
      // is the only place the copy can go; on a desktop it keeps its column.
      if (narrow) {
        const h = lerp(startH, endH, r)
        robot.style.height = `${h.toFixed(1)}px`
        // Width follows the height, capped at 16:9. `cover` scales by
        // whichever side needs more, so a box wider than 16:9 crops the
        // sides (harmless — that is empty air around the head) while a box
        // taller than 16:9 crops the TOP, which ate the shell fragments
        // exactly as they flew off. Keeping the box at or below 16:9 makes
        // vertical cropping impossible at any point of the animation.
        robotBox.style.width = `${Math.min(maxW, (h * 16) / 9).toFixed(1)}px`
      } else {
        robot.style.height = ''
        robotBox.style.width = ''
      }
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => {
        narrow = window.matchMedia('(max-width: 1023px)').matches
        measure()
        apply(self.progress)
      },
    })
    measure()
    apply(0)
    // The block starts hidden in the markup so nothing flashes between
    // paint and this effect; from here on the rows carry their own opacity.
    reveal.style.opacity = '1'
    return () => st.kill()
  }, [reduced])

  return (
    <section
      id="top"
      ref={sectionRef}
      className={`relative ${reduced ? '' : 'h-[260vh] lg:h-[240vh]'}`}
    >
      <div
        ref={stageRef}
        className="sticky top-0 flex h-svh items-start overflow-hidden px-6 pb-8 pt-28 max-lg:[@media(max-height:720px)]:pb-4 max-lg:[@media(max-height:720px)]:pt-16 lg:items-center lg:pb-10 lg:pt-24"
      >
        {/* Both ambient layers are masked to fade out before the section
            ends. The stage is `overflow-hidden`, so anything lighting it
            gets cut off dead straight at the bottom edge — invisible while
            the hero was near-black, but a hard full-width seam against the
            black section below as soon as SideRays lit it.
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
          {/* Light from off-frame, top right — a source outside the frame is
              consistent rather than decorative (DESIGN.md §3). Kept low: it
              must read as one lamp, not as a colour wash. */}
          <SideRays />
        </div>
        <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-[1]" />

        {/* The first screen's one action. It used to be a scroll cue
            pointing at the work, which is not something a visitor can say
            yes to. This is: the free first draft, the cheapest ask on the
            site. Still gone by the time the real copy and its own call to
            action arrive, so there is never more than one at a time. */}
        <a
          ref={cueRef}
          href="#contact"
          onClick={(e) => handleAnchorClick(e, '#contact')}
          className="absolute inset-x-0 bottom-6 z-20 mx-auto flex w-max items-center gap-2 rounded-full border border-purple/60 bg-purple/12 px-6 py-3 text-[13px] font-semibold tracking-tight text-foreground backdrop-blur-sm transition-colors hover:border-purple/90 hover:bg-purple/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:bottom-8 sm:text-sm"
        >
          {t.hero.ctaDraft}
          <span aria-hidden className="text-base leading-none">
            →
          </span>
        </a>

        {/* Three blocks: heading, head, rest of the copy. On a phone they
            stack in that order, so the head stands between the sentence and
            the detail. From `lg` the heading and the copy share the left
            column and the head takes the right one. */}
        <div
          ref={gridRef}
          className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 sm:gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14"
        >
          <div className="text-center lg:col-start-1 lg:row-start-1 lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-blue/95 sm:text-xs"
            >
              {t.hero.kicker}
            </motion.p>

            {/* The serif runs at a single weight and one size step larger
                than the old bold sans did: at headline size the stroke
                contrast carries it, and bold would only smear that.
                The highlighted phrase is set in italic as well as in
                colour — the shape says "this is the part that matters"
                even where the gradient does not survive (Safari has form
                here, see the known background-clip bug). */}
            {/* Two lines, two beats: the promise, then how far it goes.
                The visible copy is per-letter spans for the reveal, which
                is fine to look at and unreadable to anything parsing the
                DOM — so the sentence is also here once, in one piece, and
                the decorative copy is hidden from assistive tech.
                Sizes are fluid rather than stepped: this headline has to
                hold its shape between a 360px phone and a 1600px desktop
                without a breakpoint landing mid-word. */}
            <h1 className="mt-4 font-display font-semibold sm:mt-5">
              <span className="sr-only">{t.hero.headingPlain}</span>
              <span aria-hidden>
                <span
                  className="block text-balance"
                  style={{
                    fontSize: 'clamp(2.1rem, 9.2vw, 3.5rem)',
                    lineHeight: 0.98,
                    letterSpacing: '-0.04em',
                  }}
                >
                  <LitPhrase text={t.hero.headingLine1} />
                </span>
                <span
                  ref={highlightRef}
                  style={{
                    opacity: 0.12,
                    fontSize: 'clamp(1.15rem, 5.2vw, 1.85rem)',
                    lineHeight: 1.12,
                    letterSpacing: '-0.02em',
                  }}
                  className="mt-2.5 block text-balance bg-gradient-to-br from-blue via-white to-purple bg-clip-text italic text-transparent sm:mt-3"
                >
                  {t.hero.headingLine2}
                </span>
              </span>
            </h1>

            {/* Two sentences, on screen from the first frame. The headline
                says what I am; this says what that is worth to whoever is
                reading it. Deliberately not part of the scroll reveal
                below: the opening frame was a name and a claim with nothing
                concrete under it. */}
            <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-base lg:mx-0 lg:max-w-lg">
              {t.hero.lead}
            </p>
          </div>

          {/* The head. On a phone it breaks out past the section padding so
              it is as wide as the screen allows; its height is set inline by
              the scroll choreography. */}
          <div
            ref={robotRef}
            // On a desktop the head is given a fixed share of the stage
            // height rather than being sized by its own aspect ratio. With
            // `cover`, the head's scale is driven by whichever side of the
            // box needs more, and in a wide column that is always the
            // height — so height is the only dial that actually makes him
            // bigger. 80svh is what fits between the top padding and the
            // bottom padding on a 768px-tall laptop, which is the shortest
            // screen this layout has to survive.
            className="relative h-[44vh] w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[80svh]"
          >
            {/* Breaks out of the column horizontally on a phone — but out of
                flow, so it never widens the grid track and drags the
                headline off the screen with it. The positioning lives here
                rather than on ScrubVideo: that component carries its own
                `relative`, which wins over a `position` class passed in. */}
            <div
              ref={robotBoxRef}
              className="absolute left-1/2 top-0 h-full w-[132vw] max-w-none -translate-x-1/2 lg:static lg:h-full lg:w-[152%] lg:translate-x-0"
            >
              <ScrubVideo
                ref={videoRef}
                src={SRC}
                srcMobile={SRC_MOBILE}
                poster={POSTER}
                // `cover` rather than `contain`: the head sits in the middle
                // of a wide frame with a lot of empty air around it, so
                // fitting the whole frame into the box means fitting mostly
                // air. Cropping to the box scales the head up instead, and
                // the mask below takes care of the cropped edges.
                fit="cover"
                // Fills whatever box it is given. The box itself is what is
                // shaped: never taller than 16:9 on a phone (a taller box
                // crops the TOP under `cover`, which ate the shell fragments
                // exactly as they flew off), and wide enough on a desktop
                // that the sideways crop stays away from the head.
                className="h-full w-full"
                // The ellipse is inscribed in the box, so the mask is fully
                // transparent by the time it reaches any edge — with a
                // larger radius the footage would still end on a visible
                // rectangle, just a dimmer one.
                style={{
                  maskImage:
                    'radial-gradient(50% 50% at 50% 50%, black 0%, black 58%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(50% 50% at 50% 50%, black 0%, black 58%, transparent 100%)',
                }}
              />
            </div>
          </div>

          <div
            ref={revealRef}
            className="text-center lg:col-start-1 lg:row-start-2 lg:text-left"
            style={reduced ? undefined : { opacity: 0 }}
          >
            <p className="mx-auto max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base lg:mx-0 lg:text-lg">
              {t.hero.body}
            </p>

            {/* What I do, as four labels rather than a fifth sentence — the
                breadth is the message, and a list is read in a glance. */}
            <ul className="mt-4 flex flex-wrap justify-center gap-1.5 max-lg:[@media(max-height:720px)]:hidden sm:mt-5 sm:gap-2 lg:justify-start">
              {t.hero.capabilities.map((c) => (
                <li
                  key={c}
                  className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium tracking-tight text-foreground/90 sm:px-3 sm:py-1.5 sm:text-xs"
                >
                  {c}
                </li>
              ))}
            </ul>

            {/* One primary (blue: this is craft/work, DESIGN.md §3) and one
                quiet secondary; the secondary is a text link rather than a
                second button so the pair never reads as two equal choices. */}
            {/* One call to action, not two. The secondary link sent people
                to a section they scroll into a few seconds later anyway, and
                it was the only thing on this screen competing with the one
                action worth taking here. */}
            <div className="mt-6 flex justify-center sm:mt-7 lg:justify-start">
              <SpecularButton
                href="#contact"
                onClick={(e) => handleAnchorClick(e, '#contact')}
                className="specular-btn--lg"
              >
                {t.hero.ctaPrimary}
              </SpecularButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
