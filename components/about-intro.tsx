'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NameSequence } from './name-sequence'
import { ScrubVideo, type ScrubVideoHandle } from './scrub-video'

gsap.registerPlugin(ScrollTrigger)

/**
 * The name, with the flythrough running behind it.
 *
 * The footage — city → lit window → room → monitor — used to be the site's
 * full-screen opening. It does the same job better here: it is the room the
 * work happens in, and it is playing while the section says whose room it
 * is. Scroll drives it; nothing plays on its own.
 *
 * Legibility is the whole design constraint of putting type over moving
 * footage, and this is a lit night city, not a dark plate. Three things
 * handle it, in this order: the footage runs at reduced opacity, a scrim
 * darkens the band the name occupies, and the name itself is large, bold
 * and carries its own glow. Measured rather than eyeballed — see the
 * contrast note in the commit.
 *
 * Under prefers-reduced-motion the stage collapses to a single screen with
 * the first frame held: same composition, nothing moving, and no tall block
 * of scroll that does nothing.
 */
const SRC = '/videos/intro.mp4'
const SRC_MOBILE = '/videos/intro-mobile.mp4'
const POSTER = '/intro/cinematic-poster.jpg'

export function AboutIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<ScrubVideoHandle>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => videoRef.current?.seek(self.progress),
    })
    return () => st.kill()
  }, [reduced])

  return (
    <div ref={rootRef} className={`relative ${reduced ? '' : 'h-[190vh]'}`}>
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-6">
        {/* The wrapper carries the positioning, not ScrubVideo: that
            component brings its own `relative`, which wins over a
            `position` class passed in through className — laid out in flow
            it became a flex item and pushed the name off centre. */}
        <div aria-hidden className="absolute inset-0">
          <ScrubVideo
            ref={videoRef}
            src={SRC}
            srcMobile={SRC_MOBILE}
            poster={POSTER}
            fit="cover"
            className="h-full w-full opacity-[0.55]"
          />
        </div>
        {/* Two scrims, not one. The radial darkens the middle band the name
            sits in; the linear takes the top and bottom edges down to the
            page colour so the footage ends inside the section instead of on
            a hard horizontal seam against the black above and below it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(90% 55% at 50% 50%, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.7) 45%, rgba(5,5,5,0.25) 100%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, #050505 0%, rgba(5,5,5,0) 22%, rgba(5,5,5,0) 74%, #050505 100%)',
          }}
        />
        <div className="relative z-10 w-full">
          <NameSequence />
        </div>
      </div>
    </div>
  )
}
