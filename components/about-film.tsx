'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useT } from './language-context'

gsap.registerPlugin(ScrollTrigger)

/**
 * The flythrough — city → lit window → room → monitor — as a scroll-scrubbed
 * strip inside the About section. It used to be the site's full-screen
 * opening; the page now starts at the hero instead, and the footage does the
 * job it was always best at down here: showing the room the work happens in,
 * while the section reads as "the person behind the systems".
 *
 * Same frame pipeline as before, because it is the part that was hard to get
 * right: the video is a decode source only, never a player. Scroll position
 * seeks it, and each decoded frame is blitted to a canvas. The master is
 * All-Intra (every frame a keyframe), so a seek is a single-frame decode and
 * scrubbing stays responsive — including on iOS Safari, where seeking during
 * scroll is historically fragile.
 *
 * It sits in its own frame with nothing on top of it, so unlike the old
 * full-screen version there is no text whose contrast depends on the footage.
 */
const VIDEO_SRC = '/videos/intro.mp4'
const VIDEO_SRC_MOBILE = '/videos/intro-mobile.mp4'
const POSTER_SRC = '/intro/cinematic-poster.jpg'

export function AboutFilm() {
  const t = useT()
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const frame = frameRef.current
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!frame || !canvas || !video) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Phones get the smaller master: on a phone-sized frame it is visually
    // equivalent, downloads a third less, and — the part that matters here —
    // decodes faster, so each seek resolves quicker on exactly the devices
    // with the least decode headroom. Set here rather than as a <source
    // media="…">, which browsers ignore inside <video>.
    video.src = window.matchMedia('(max-width: 767px)').matches ? VIDEO_SRC_MOBILE : VIDEO_SRC

    // Canvas size is read once per resize, never inside the seek path: a
    // layout read there forces a synchronous re-layout on every scroll tick.
    let cw = 0
    let ch = 0
    /** Set only if the browser refuses the priming autoplay (iOS Low Power
     *  Mode): the video itself becomes the visible layer and is scrubbed
     *  natively, because a hidden video will not decode for the canvas
     *  there. Stays false in every normal case. */
    let videoIsVisible = false

    const coverTransform = () => {
      const vw = video.videoWidth
      const vh = video.videoHeight
      const scale = Math.max(cw / vw, ch / vh)
      return { scale, dx: (cw - vw * scale) / 2, dy: (ch - vh * scale) / 2 }
    }

    const drawFrame = () => {
      if (videoIsVisible) return
      if (!cw || !ch || !video.videoWidth) return
      const { scale, dx, dy } = coverTransform()
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(video, dx, dy, video.videoWidth * scale, video.videoHeight * scale)
    }

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cw = canvas.clientWidth
      ch = canvas.clientHeight
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawFrame()
    }

    // Seek queue — never issue overlapping seeks; the newest target wins.
    // Painting is driven by requestVideoFrameCallback where available (it
    // fires exactly when the seeked frame is ready to composite), with
    // `seeked` as the fallback and a watchdog so a dropped seek can't wedge
    // the queue on a stale frame.
    const vrfc = (
      video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }
    ).requestVideoFrameCallback?.bind(video)
    const fastSeek = (video as HTMLVideoElement & { fastSeek?: (t: number) => void }).fastSeek?.bind(
      video,
    )
    const SEEK_EPS = 1 / 120
    let pendingTime: number | null = null
    let seekBusy = false
    let watchdog = 0

    const releaseSeek = () => {
      window.clearTimeout(watchdog)
      seekBusy = false
      if (pendingTime !== null) {
        const t = pendingTime
        pendingTime = null
        seekTo(t)
      }
    }

    const seekTo = (time: number) => {
      const d = video.duration
      if (!d || Number.isNaN(d)) return
      const clamped = Math.max(0, Math.min(d - 1 / 60, time))
      if (seekBusy) {
        pendingTime = clamped
        return
      }
      // WebKit may swallow `seeked` for a same-position seek, which would
      // leave seekBusy set forever.
      if (Math.abs(video.currentTime - clamped) < SEEK_EPS) return
      seekBusy = true
      window.clearTimeout(watchdog)
      watchdog = window.setTimeout(releaseSeek, 300)
      if (vrfc) vrfc(() => drawFrame())
      if (fastSeek) fastSeek(clamped)
      else video.currentTime = clamped
    }

    const onSeeked = () => {
      drawFrame()
      releaseSeek()
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', releaseSeek)

    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const promoteVideo = () => {
      Object.assign(video.style, {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: '1',
      })
      canvas.style.visibility = 'hidden'
      videoIsVisible = true
    }
    const unlockVideo = () => {
      window.removeEventListener('touchend', unlockVideo)
      const p = video.play() // must be the first call inside the gesture
      if (!p) return
      p.then(() => {
        video.pause()
        video.removeAttribute('poster')
        promoteVideo()
      }).catch(() => {
        /* still refused — the poster stays, which is a clean first frame */
      })
    }

    const onLoadedMeta = () => {
      sizeCanvas()
      const p = video.play()
      if (p) {
        p.then(() => video.pause()).catch(() => {
          // iOS Low Power Mode blocks exactly this muted autoplay, which is
          // what stops the canvas from ever advancing. The first real touch
          // is allowed to start it.
          if (isTouch) window.addEventListener('touchend', unlockVideo, { passive: true })
        })
      }
      ScrollTrigger.refresh()
    }
    video.addEventListener('loadedmetadata', onLoadedMeta)
    if (video.readyState >= 1) onLoadedMeta()

    const st = ScrollTrigger.create({
      trigger: frame,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const d = video.duration
        if (!d) return
        const time = self.progress * d
        if (videoIsVisible) video.currentTime = time
        else seekTo(time)
      },
    })

    window.addEventListener('resize', sizeCanvas)
    return () => {
      st.kill()
      window.clearTimeout(watchdog)
      window.removeEventListener('resize', sizeCanvas)
      window.removeEventListener('touchend', unlockVideo)
      video.removeEventListener('loadedmetadata', onLoadedMeta)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', releaseSeek)
    }
  }, [])

  return (
    <figure className="mt-16">
      <div
        ref={frameRef}
        className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-black shadow-[0_0_120px_-50px_rgba(122,165,232,0.5)]"
      >
        {/* First frame as a plain image underneath. It is what the visitor
            sees before the video has loaded, and what stays if it never
            does (blocked codec, failed request) — the canvas paints over it
            the moment there are real frames, so there is no state where the
            frame is an empty black rectangle.
            eslint-disable: next/image would fingerprint and resize an asset
            that is already sized for exactly this box. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={POSTER_SRC} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />
        {/* Decode source only — src is picked by viewport on mount. */}
        <video
          ref={videoRef}
          aria-hidden
          muted
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          disablePictureInPicture
          className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
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
