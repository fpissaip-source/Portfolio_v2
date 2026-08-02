'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NameSequence, type NameSequenceHandle } from './name-sequence'
import { ScrubVideo, type ScrubVideoHandle } from './scrub-video'

gsap.registerPlugin(ScrollTrigger)

/**
 * The name, with the flythrough running behind it.
 *
 * Film and typography are driven by one ScrollTrigger. Keeping one source of
 * truth matters here: the old name animation waited for a separate 50%
 * IntersectionObserver, so jump navigation and short viewports could leave
 * the film and the title in unrelated states. Both now advance and reverse
 * together on every scroll update.
 */
const SRC = '/videos/intro.mp4'
const SRC_MOBILE = '/videos/intro-mobile.mp4'
const POSTER = '/intro/cinematic-poster.jpg'

export function AboutIntro() {
  const rootRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<ScrubVideoHandle>(null)
  const nameRef = useRef<NameSequenceHandle>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (reduced) {
      videoRef.current?.seek(0)
      nameRef.current?.setProgress(1)
      return
    }

    const apply = (progress: number) => {
      videoRef.current?.seek(progress)
      nameRef.current?.setProgress(progress)
    }

    apply(0)
    const trigger = ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    })

    // Fonts, decoded posters and the sections above can all settle after the
    // first paint. One refresh on the next frame gives this late section its
    // real document position instead of keeping hydration-time measurements.
    const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.cancelAnimationFrame(refreshFrame)
      trigger.kill()
    }
  }, [reduced])

  return (
    <div ref={rootRef} className={`relative ${reduced ? '' : 'h-[190vh]'}`}>
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden px-6">
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
          <NameSequence ref={nameRef} />
        </div>
      </div>
    </div>
  )
}
