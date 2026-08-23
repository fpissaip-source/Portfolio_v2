'use client'

import { Fragment, useEffect, useRef, useState } from 'react'
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

const SCRUB_SPAN = 0.72
const REVEAL_AT = 0.7
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function LitWord({ word }: { word: string }) {
  return (
    <span className="inline-block">
      {word.split('').map((ch, i) => (
        // 0.45, not 0.12. The letters light up on load, and at 0.12 the
        // headline is a grey smudge for the first second of the visit. A
        // reveal is only worth having if the thing revealed was legible
        // the whole time.
        // Der Buchstabe steht in `data-ch` und wird per ::before gezeichnet,
        // nicht als Textknoten. Grund: darüber liegt bereits eine saubere
        // sr-only-Fassung derselben Überschrift. Ein Crawler liest aria-hidden
        // nicht als "ignorieren" — das gilt nur für Screenreader —, also stand
        // die Schlagzeile zweimal im Dokument. Erzeugter Inhalt gehört nicht
        // zum DOM-Text und wird nicht ausgelesen; gerendert, gemessen und von
        // GSAP animiert wird er trotzdem, denn die Deckkraft liegt am Span.
        <span
          key={i}
          data-lit
          data-ch={ch}
          style={{ opacity: 0.45 }}
          className="lit-char inline-block"
        />
      ))}
    </span>
  )
}

function LitPhrase({ text }: { text: string }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <LitWord word={word} />
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

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

  useEffect(() => {
    const section = sectionRef.current
    const highlight = highlightRef.current
    if (!section || !highlight) return

    const context = gsap.context(() => {
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

    return () => context.revert()
  }, [reduced, t.hero.headingLine1, t.hero.headingLine2])

  useEffect(() => {
    const section = sectionRef.current
    const reveal = revealRef.current
    const robot = robotRef.current
    const robotBox = robotBoxRef.current
    const stage = stageRef.current
    const grid = gridRef.current
    if (!section || !reveal || !robot || !robotBox || !stage || !grid || reduced) return

    const rows = Array.from(reveal.children) as HTMLElement[]
    const header = grid.children[0] as HTMLElement
    let narrow = window.matchMedia('(max-width: 1023px)').matches
    let sparked = false

    // The head keeps one size for the whole scroll.
    //
    // It used to scale down to 90% across the last stretch before the end
    // frame — the climax of the animation — and because the trigger scrubs
    // raw, unsmoothed scroll, every wobble of the momentum at the end of a
    // flick was mirrored straight into that scale. It read as the robot
    // twitching: smaller, bigger, smaller. The 10% it bought back was not
    // needed either; the row below already reserves the copy's height
    // separately, and the frame only overflows it.
    const measure = () => {
      const frame = robotBox.firstElementChild as HTMLElement | null
      if (frame) frame.style.transform = ''

      if (!narrow) {
        robot.style.height = ''
        robotBox.style.width = ''
        robotBox.style.height = ''
        return
      }

      const stageStyles = window.getComputedStyle(stage)
      const available =
        stage.clientHeight -
        parseFloat(stageStyles.paddingTop || '0') -
        parseFloat(stageStyles.paddingBottom || '0')
      const gaps = 2 * parseFloat(window.getComputedStyle(grid).rowGap || '20')
      // The row's height: what is left once the copy is on screen. This is
      // layout, so the call to action can never be pushed off the bottom.
      // Der Boden, den der Kopf behalten darf. Auf einem kurzen Display ist
      // ein kleinerer Kopf richtig und ein abgeschnittener Knopf falsch, also
      // gibt der Boden dort nach — die Stufen entsprechen denen in
      // globals.css, die zugleich den Text darüber enger setzen.
      const hoehe = window.innerHeight
      const boden = hoehe <= 500 ? 70 : hoehe <= 600 ? 90 : hoehe <= 700 ? 120 : 150
      const settled = Math.max(boden, available - header.offsetHeight - reveal.offsetHeight - gaps)

      // The head's own size is driven by the screen's *width*, not by what
      // the copy leaves over.
      //
      // It used to be `available - header - gaps`, and the copy above it has
      // grown since: on a phone showing its browser chrome that arithmetic
      // left about 210px and the head became a thumbnail. Measured at 390pt
      // wide: 364px tall at a 844 stage, 336 at 700, 276 at 640 — the head
      // shrank every time the URL bar appeared.
      //
      // It can afford to ignore the copy because it already overflows its
      // row by design, the frame is `lighten`-blended so its black covers
      // nothing, and the copy paints above it. The height cap is only there
      // for genuinely short, wide screens; on any phone the width wins, so
      // the head is now one constant size and the URL bar cannot change it.
      const widthCap = (window.innerWidth * 1.34 * 980) / 1408
      const headHeight = Math.max(settled, Math.min(available * 0.86, widthCap))

      robot.style.height = `${settled.toFixed(1)}px`
      robotBox.style.height = `${headHeight.toFixed(1)}px`
      robotBox.style.width = `${((headHeight * 1408) / 980).toFixed(1)}px`
    }

    const apply = (progress: number) => {
      const videoProgress = clamp01(progress / SCRUB_SPAN)
      videoRef.current?.seek(videoProgress)

      if (!sparked && videoProgress >= 0.99) {
        sparked = true
        lightningRef.current?.strike({ intensity: 0.9 })
      }

      const revealProgress = seg(videoProgress, REVEAL_AT, 1)
      rows.forEach((row, i) => {
        const start = i * 0.22
        const entry = seg(revealProgress, start, Math.min(1, start + 0.55))
        row.style.opacity = String(entry)
        row.style.transform = `translate3d(0, ${lerp(18, 0, entry).toFixed(2)}px, 0)`
      })

      const cue = cueRef.current
      if (cue) {
        const out = 1 - seg(revealProgress, 0, 0.35)
        cue.style.opacity = String(out)
        cue.style.pointerEvents = out < 0.4 ? 'none' : 'auto'
      }
    }

    const trigger = ScrollTrigger.create({
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

    // Re-measure whenever the stage actually changes shape.
    //
    // measure() used to run only from ScrollTrigger's own refresh, and that
    // did not reliably fire for a viewport change: after 844 -> 790 -> 844 the
    // box still held its original height. On a phone that is the URL bar
    // collapsing, and the head kept a size computed for a screen that is no
    // longer there. A ResizeObserver on the stage is the direct signal.
    const stageObserver = new ResizeObserver(() => {
      narrow = window.matchMedia('(max-width: 1023px)').matches
      measure()
      apply(trigger.progress)
    })
    stageObserver.observe(stage)

    measure()
    apply(0)
    reveal.style.opacity = '1'

    return () => {
      stageObserver.disconnect()
      trigger.kill()
    }
  }, [reduced])

  return (
    <section
      id="top"
      ref={sectionRef}
      className={`relative ${reduced ? '' : 'h-[260vh] lg:h-[240vh]'}`}
    >
      <div
        ref={stageRef}
        data-hero="stage"
        className="sticky top-0 flex h-svh items-start overflow-hidden px-6 pb-8 pt-28 lg:items-center lg:pb-10 lg:pt-24"
      >
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
          <SideRays />
        </div>

        {/* A local dark well sits above the ambient lights but below the
            content. The robot still gets the atmospheric edge light, while
            mix-blend-lighten no longer replaces its dark metal with the
            brighter blue/purple background. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              'radial-gradient(ellipse 72% 48% at 50% 56%, rgba(5,5,5,0.96) 0%, rgba(5,5,5,0.82) 48%, rgba(5,5,5,0.38) 72%, transparent 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              'radial-gradient(ellipse 39% 72% at 78% 50%, rgba(5,5,5,0.96) 0%, rgba(5,5,5,0.8) 52%, rgba(5,5,5,0.3) 76%, transparent 100%)',
          }}
        />

        <LightningFlash ref={lightningRef} className="pointer-events-none absolute inset-0 z-0" />

        <a
          ref={cueRef}
          href="#contact"
          onClick={(event) => handleAnchorClick(event, '#contact')}
          // Filled, not outlined. A thin purple hairline on black is the
          // weakest shape a primary action can take; this is the only button
          // in the first screen and it should look like the one thing to press.
          className="absolute inset-x-0 bottom-6 z-20 mx-auto flex w-max items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[15px] font-semibold tracking-[-0.01em] text-[#050505] shadow-[0_10px_40px_-10px_rgba(168,130,255,0.75)] transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:bottom-8 sm:text-base"
        >
          {t.hero.ctaDraft}
          <span aria-hidden className="text-base leading-none">
            →
          </span>
        </a>

        <div
          ref={gridRef}
          // Desktop split: the copy takes the larger share and the head is
          // pushed off to the right. It used to be an even 1.02/0.98 inside a
          // 1280px container, which on a 1920px screen left the copy in a
          // 624px column and the head sitting at 63% of the viewport with a
          // quarter of the screen empty behind it — so the head read as
          // centred and the copy read as small.
          data-hero="grid"
          className="relative mx-auto grid w-full max-w-7xl gap-5 sm:gap-8 lg:grid-cols-[1.18fr_0.82fr] lg:items-center lg:gap-10 2xl:max-w-[96rem]"
        >
          {/* Ranged left, at every width. Centred copy forces the eye to
              re-find the start of every line, which is the wrong ask for a
              three-line paragraph on a phone. */}
          <div className="relative z-20 text-left lg:col-start-1 lg:row-start-1">
            {/* The kicker used to fade in from nothing over 0.7s. On a phone
                over mobile data that fade is a visible stretch in which the
                first thing on the page is unreadable — it is what the "man
                erkennt fast nichts" screenshot caught. It now starts at 0.55
                and rises, so it is legible from the first frame and the
                animation only adds presence. */}
            <motion.div
              initial={{ opacity: 0.55, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
              data-hero="kicker"
              className="mb-4 flex items-center justify-center gap-3.5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:mb-5 sm:gap-4 lg:justify-start"
            >
              {t.hero.kickerWords.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 && (
                    <span aria-hidden className="h-3.5 w-px shrink-0 bg-white/35 sm:h-4" />
                  )}
                  <span className="whitespace-nowrap font-label text-[13px] font-medium uppercase tracking-[0.14em] text-foreground sm:text-[15px]">
                    {word}
                  </span>
                </Fragment>
              ))}
            </motion.div>

            {/* Anton, uppercase, tight. The headline is the loudest thing on
                the site and now looks it — nothing else uses this face, so
                rank is legible before a word is read. Anton ships one weight,
                so no font-semibold here: asking for 600 would only make the
                browser fake a bolder version and smear the edges. */}
            <h1 data-hero="head" className="mt-4 font-poster sm:mt-5">
              <span className="sr-only">{t.hero.headingPlain}</span>
              <span aria-hidden>
                <span
                  className="block text-balance uppercase"
                  style={{
                    fontSize: 'clamp(2.6rem, 11.4vw, 4.6rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.005em',
                  }}
                >
                  <LitPhrase text={t.hero.headingLine1} />
                </span>
                {/* Was blue→white→purple clipped to the text. Its purple end
                    sat at 6.7:1 and its white middle vanished outright on
                    iOS Safari. One solid accent, full strength, and it starts
                    at 0.4 rather than 0.12 so it is never invisible. */}
                <span
                  ref={highlightRef}
                  style={{
                    opacity: 0.4,
                    fontSize: 'clamp(1.05rem, 4.4vw, 1.6rem)',
                    lineHeight: 1.2,
                  }}
                  /* Aus demselben Grund wie die Buchstaben darüber: die
                     vollständige Schlagzeile steht bereits als sr-only im
                     Dokument, und dieser Zweig ist ihre sichtbare Fassung.
                     Stünde der Satz hier als Textknoten, hätte ihn ein
                     Crawler zweimal gelesen. */
                  data-text={t.hero.headingLine2}
                  className="lit-line mt-3.5 block max-w-[24ch] text-balance font-sans font-semibold tracking-[-0.01em] text-accent-tint sm:mt-4 lg:mx-0"
                />
              </span>
            </h1>

            {/* The lead. It was 16px, centred, at 90% on mobile and dropped to
                muted grey on desktop — small, floating and pale, which is
                exactly the "keine Lust das zu lesen" complaint. It is now
                18/19px, ranged left with the headline from the sm breakpoint
                up, and stays at full foreground on every size. */}
            <p data-hero="lead" className="relative z-30 mt-6 max-w-[34ch] text-pretty text-[18px] leading-[1.6] text-foreground drop-shadow-[0_2px_14px_rgba(0,0,0,0.98)] sm:mt-7 sm:max-w-[42ch] sm:text-[19px] lg:mt-7 lg:max-w-[46ch] lg:drop-shadow-none">
              {t.hero.lead}
            </p>
          </div>

          <div
            ref={robotRef}
            className="relative flex min-w-0 items-center justify-center h-[44vh] w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[80svh] lg:justify-end"
          >
            <div
              ref={robotBoxRef}
              // The negative right margin is what pushes the head further
              // right on a desktop: a margin, deliberately, not a translate.
              // `transform` and Tailwind v4's `translate` both establish a
              // stacking context, and one between the stage and this frame
              // cuts its blend off from the light behind it — which is the
              // black panel that used to sit around the head.
              //
              // Safe to overrun the container: the master carries 60px of
              // black padding at each edge, and the animation's own bounding
              // box ends well inside that, so what leaves the screen is
              // margin rather than picture.
              // The negative right margin has to cover the master's dead
              // padding, not just nudge the frame. Measured on the poster:
              // the animation's own content occupies x 416..1018 of the
              // 1408-wide master, so 27.7% of the frame's width to the right
              // of the head is black nothing. A 4vw margin moved the frame
              // and left the head at 63% of the screen; these values put the
              // head's own right edge near the screen's right edge.
              className="relative top-7 h-full w-[132vw] max-w-none shrink-0 lg:top-0 lg:-mr-[13vw] lg:h-full lg:w-auto lg:aspect-[1408/980] 2xl:-mr-[16vw]"
            >
              <ScrubVideo
                ref={videoRef}
                src={SRC}
                srcMobile={SRC_MOBILE}
                poster={POSTER}
                alt="Kopf eines Roboters, dessen Bauteile sich voneinander lösen, mit leuchtendem neuronalem Netz im Inneren"
                fit="contain"
                className="h-full w-full mix-blend-lighten"
              />
            </div>
          </div>

          <div
            ref={revealRef}
            className="relative z-20 text-center lg:col-start-1 lg:row-start-2 lg:text-left"
            style={reduced ? undefined : { opacity: 0 }}
          >
            <p data-hero="body" className="max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-foreground/85 drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] sm:text-base lg:text-[18px] lg:drop-shadow-none">
              {t.hero.body}
            </p>

            <p data-hero="proof" className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 sm:mt-5 lg:justify-start">
              <span className="font-label text-[12px] uppercase tracking-[0.22em] text-blue/90 sm:text-[11px]">
                {t.hero.proofLabel}
              </span>
              <span className="text-[13px] font-medium tracking-tight text-foreground/90 sm:text-sm lg:text-foreground/80">
                {t.hero.proofItems.join(' · ')}
              </span>
            </p>

            <div data-hero="cta" className="mt-6 flex justify-center sm:mt-7 lg:justify-start">
              <SpecularButton
                href="#contact"
                onClick={(event) => handleAnchorClick(event, '#contact')}
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
