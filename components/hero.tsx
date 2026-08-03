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
/** Mobile used to shrink as far as the remaining layout space demanded.
 *  That made the robot visibly collapse as the copy arrived. Keep only a
 *  subtle safety scale now; the text can layer above the transparent parts
 *  of the frame instead of forcing the subject to become a thumbnail. */
const MOBILE_MIN_SCALE = 0.9

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
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
    let shrink = 1

    const measure = () => {
      const frame = robotBox.firstElementChild as HTMLElement | null

      if (!narrow) {
        robot.style.height = ''
        robotBox.style.width = ''
        robotBox.style.height = ''
        if (frame) frame.style.transform = ''
        return
      }

      const stageStyles = window.getComputedStyle(stage)
      const available =
        stage.clientHeight -
        parseFloat(stageStyles.paddingTop || '0') -
        parseFloat(stageStyles.paddingBottom || '0')
      const gaps = 2 * parseFloat(window.getComputedStyle(grid).rowGap || '20')
      const settled = Math.max(150, available - header.offsetHeight - reveal.offsetHeight - gaps)
      const maxWidth = window.innerWidth * 1.34
      const openHeight = Math.min(
        available - header.offsetHeight - gaps * 0.5,
        (maxWidth * 980) / 1408,
      )
      const headHeight = Math.max(settled, openHeight)

      shrink = Math.max(MOBILE_MIN_SCALE, clamp01(settled / headHeight))
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

      if (narrow) {
        const frame = robotBox.firstElementChild as HTMLElement | null
        // Stay full-size through most of the copy reveal, then use at most a
        // restrained 10% reduction at the very end.
        const scaleProgress = seg(revealProgress, 0.45, 1)
        const scale = lerp(1, shrink, scaleProgress)
        if (frame) frame.style.transform = `scale(${scale.toFixed(4)})`
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

    measure()
    apply(0)
    reveal.style.opacity = '1'

    return () => trigger.kill()
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
          className="absolute inset-x-0 bottom-6 z-20 mx-auto flex w-max items-center gap-2 rounded-full border border-purple/60 bg-purple/12 px-6 py-3 text-[13px] font-semibold tracking-tight text-foreground backdrop-blur-sm transition-colors hover:border-purple/90 hover:bg-purple/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple sm:bottom-8 sm:text-sm"
        >
          {t.hero.ctaDraft}
          <span aria-hidden className="text-base leading-none">
            →
          </span>
        </a>

        <div
          ref={gridRef}
          className="relative mx-auto grid w-full max-w-7xl gap-5 sm:gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14"
        >
          <div className="relative z-20 text-center lg:col-start-1 lg:row-start-1 lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: easeOut }}
              className="mb-4 flex items-center justify-center gap-3 sm:mb-5 sm:gap-4 lg:justify-start"
            >
              {t.hero.kickerWords.map((word, i) => (
                <Fragment key={word}>
                  {i > 0 && (
                    <span aria-hidden className="h-4 w-px shrink-0 bg-white/20 sm:h-5" />
                  )}
                  <span className="whitespace-nowrap font-display text-[13px] font-medium tracking-tight text-foreground/85 sm:text-[15px]">
                    {word}
                  </span>
                </Fragment>
              ))}
            </motion.div>

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

            <p className="mx-auto mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-base lg:mx-0 lg:max-w-lg">
              {t.hero.lead}
            </p>
          </div>

          <div
            ref={robotRef}
            className="relative flex min-w-0 items-center justify-center h-[44vh] w-full lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:h-[80svh] lg:justify-end"
          >
            <div
              ref={robotBoxRef}
              className="h-full w-[132vw] max-w-none shrink-0 lg:h-full lg:w-auto lg:aspect-[1408/980]"
            >
              <ScrubVideo
                ref={videoRef}
                src={SRC}
                srcMobile={SRC_MOBILE}
                poster={POSTER}
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
            <p className="mx-auto max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base lg:mx-0 lg:text-lg">
              {t.hero.body}
            </p>

            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 max-lg:[@media(max-height:720px)]:hidden sm:mt-5 lg:justify-start">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-blue/90 sm:text-[11px]">
                {t.hero.proofLabel}
              </span>
              <span className="text-[13px] font-medium tracking-tight text-foreground/80 sm:text-sm">
                {t.hero.proofItems.join(' · ')}
              </span>
            </p>

            <div className="mt-6 flex justify-center sm:mt-7 lg:justify-start">
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
