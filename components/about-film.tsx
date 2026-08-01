'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useT } from './language-context'
import { ScrubVideo, type ScrubVideoHandle } from './scrub-video'

gsap.registerPlugin(ScrollTrigger)

/**
 * The flythrough — city → lit window → room → monitor — as a scroll-scrubbed
 * strip inside the About section. It used to be the site's full-screen
 * opening; the page now starts at the hero instead, and the footage does the
 * job it was always best at down here: showing the room the work happens in,
 * while the section reads as "the person behind the systems".
 *
 * It sits in its own frame with nothing on top of it, so unlike the old
 * full-screen version there is no text whose contrast depends on the
 * footage. The frame pipeline is shared with the hero (see ScrubVideo).
 */
const VIDEO_SRC = '/videos/intro.mp4'
const VIDEO_SRC_MOBILE = '/videos/intro-mobile.mp4'
const POSTER_SRC = '/intro/cinematic-poster.jpg'

export function AboutFilm() {
  const t = useT()
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<ScrubVideoHandle>(null)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    // The whole flight plays out across the frame's own pass through the
    // viewport — enter at the bottom edge, done as it leaves the top.
    const st = ScrollTrigger.create({
      trigger: frame,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => videoRef.current?.seek(self.progress),
    })
    return () => st.kill()
  }, [])

  return (
    <figure className="mt-16">
      <div
        ref={frameRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-[0_0_120px_-50px_rgba(122,165,232,0.5)]"
      >
        <ScrubVideo
          ref={videoRef}
          src={VIDEO_SRC}
          srcMobile={VIDEO_SRC_MOBILE}
          poster={POSTER_SRC}
          className="absolute inset-0 h-full w-full"
        />
        {/* Same vignette the footage was graded for, so the frame's edges sit
            in the page instead of ending on a hard rectangle. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_90px_20px_rgba(0,0,0,0.75)]"
        />
      </div>
      <figcaption className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {t.about.filmCaption}
      </figcaption>
    </figure>
  )
}
