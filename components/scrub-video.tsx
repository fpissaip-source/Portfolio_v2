'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, type CSSProperties } from 'react'

/**
 * A video used as a frame source rather than a player: the caller drives it
 * with `seek(progress)` from wherever its scroll position comes from, and
 * each decoded frame is blitted onto a canvas.
 *
 * The masters are All-Intra (every frame a keyframe), so a seek is a single
 * decode and scrubbing stays responsive — including on iOS Safari, where
 * seeking during scroll is historically fragile. Seeks are queued so they
 * can never overlap; the newest target always wins, and a watchdog releases
 * the queue if a `seeked` event never arrives.
 *
 * The poster renders as a plain <img> underneath the canvas. It is what a
 * visitor sees before the video has loaded and what stays if it never does
 * (blocked codec, failed request), so there is no state where this is an
 * empty black rectangle.
 */
export type ScrubVideoHandle = {
  /** 0 = first frame, 1 = last frame. Safe to call before the video has
   *  loaded — the position is remembered and applied once it can be. */
  seek: (progress: number) => void
}

export const ScrubVideo = forwardRef<
  ScrubVideoHandle,
  {
    src: string
    /** Used below 768px, where a smaller frame also decodes faster. */
    srcMobile?: string
    poster: string
    className?: string
    style?: CSSProperties
    /** How the frame maps onto the canvas box. Default 'cover'. */
    fit?: 'cover' | 'contain'
  }
>(function ScrubVideo({ src, srcMobile, poster, className = '', style, fit = 'cover' }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const seekRef = useRef<(p: number) => void>(() => {})
  /** Last requested position, replayed once metadata arrives. */
  const wantedRef = useRef(0)

  useImperativeHandle(ref, () => ({ seek: (p) => seekRef.current(p) }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const poster = posterRef.current
    if (!canvas || !video || !poster) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    video.src = srcMobile && window.matchMedia('(max-width: 767px)').matches ? srcMobile : src

    // Canvas size is read on resize only, never inside the seek path: a
    // layout read there forces a synchronous re-layout on every scroll tick.
    let cw = 0
    let ch = 0
    /** Set only if the browser refuses the priming autoplay (iOS Low Power
     *  Mode): the video itself becomes the visible layer and is scrubbed
     *  natively, because a hidden video will not decode for a canvas there.
     *  Stays false in every normal case. */
    let videoIsVisible = false
    /** True once a real frame has been blitted. Until then the poster is
     *  what the visitor sees; after it, never again. */
    let painted = false
    /** The muted play/pause that primes the decoder runs exactly once. */
    let primed = false

    const draw = () => {
      if (videoIsVisible) return
      if (!cw || !ch || !video.videoWidth) return
      // HAVE_CURRENT_DATA. Below this there is no frame to copy, and the
      // clear below would leave an empty canvas with the poster showing
      // through it — the poster being frame zero, i.e. the head fully
      // assembled. That is what the "it snaps back together and then falls
      // apart again" flicker was made of.
      if (video.readyState < 2) return
      const vw = video.videoWidth
      const vh = video.videoHeight
      const scale = fit === 'cover' ? Math.max(cw / vw, ch / vh) : Math.min(cw / vw, ch / vh)
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(video, (cw - vw * scale) / 2, (ch - vh * scale) / 2, vw * scale, vh * scale)
      if (!painted) {
        painted = true
        // From here the canvas always holds a real frame, so the poster has
        // nothing left to do but be wrong in exactly the wrong moment.
        poster.style.opacity = '0'
      }
    }

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cw = canvas.clientWidth
      ch = canvas.clientHeight
      canvas.width = Math.round(cw * dpr)
      canvas.height = Math.round(ch * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      draw()
    }

    const vrfc = (
      video as HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number }
    ).requestVideoFrameCallback?.bind(video)
    /** Half a frame at 24fps — anything closer is already on screen. */
    const SEEK_EPS = 1 / 48
    let pending: number | null = null
    let busy = false
    let watchdog = 0
    /** The last time we *asked* for, which is not the same as the time the
     *  video ended up at. See seekTime. */
    let requested: number | null = null

    const release = () => {
      window.clearTimeout(watchdog)
      busy = false
      if (pending !== null) {
        const t = pending
        pending = null
        seekTime(t)
      }
    }

    const seekTime = (time: number) => {
      const d = video.duration
      if (!d || Number.isNaN(d)) return
      const clamped = Math.max(0, Math.min(d - 1 / 48, time))
      if (busy) {
        pending = clamped
        return
      }
      // Compared against what was last asked for, not against where the
      // video actually landed.
      //
      // This is what stops the end of the scrub from jittering. Once the
      // scroll runs past the end of the animation the caller keeps asking
      // for the same final time, every frame. Measuring against
      // `video.currentTime` made that a new seek every time, because a seek
      // does not land exactly on the requested time — so the same request
      // was issued over and over and the last two frames flickered against
      // each other. Measuring against the request makes a repeat request a
      // no-op, which is what it is.
      //
      // WebKit also swallows `seeked` for a same-position seek, which would
      // leave the queue wedged behind a `busy` that never clears.
      const reference = requested ?? video.currentTime
      if (Math.abs(reference - clamped) < SEEK_EPS) return
      busy = true
      requested = clamped
      window.clearTimeout(watchdog)
      watchdog = window.setTimeout(release, 300)
      if (vrfc) vrfc(() => draw())
      // Deliberately not `fastSeek`. It is allowed to land on a nearby
      // frame rather than the requested one, and against an All-Intra
      // master (every frame a keyframe) it buys nothing: a precise seek is
      // already a single-frame decode. Its imprecision was the other half
      // of the jitter above.
      video.currentTime = clamped
    }

    seekRef.current = (p) => {
      const clamped = Math.max(0, Math.min(1, p))
      wantedRef.current = clamped
      if (videoIsVisible) {
        // Same de-duplication as seekTime: without it the promoted <video>
        // is handed the same final time on every frame of the overscroll.
        const t = clamped * (video.duration || 0)
        if (video.duration && Math.abs((requested ?? video.currentTime) - t) >= SEEK_EPS) {
          requested = t
          video.currentTime = t
        }
        return
      }
      seekTime(clamped * (video.duration || 0))
    }

    const onSeeked = () => {
      draw()
      release()
    }
    video.addEventListener('seeked', onSeeked)
    video.addEventListener('error', release)

    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const unlock = () => {
      window.removeEventListener('touchend', unlock)
      const p = video.play() // must be the first call inside the gesture
      if (!p) return
      p.then(() => {
        video.pause()
        video.removeAttribute('poster')
        Object.assign(video.style, {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: fit,
          opacity: '1',
        })
        canvas.style.visibility = 'hidden'
        videoIsVisible = true
        video.currentTime = wantedRef.current * (video.duration || 0)
      }).catch(() => {
        /* still refused — the poster stays, which is a clean first frame */
      })
    }

    const onMeta = () => {
      sizeCanvas()
      // The priming play/pause below only ever runs against a fresh, unseen
      // video. `play()` on a media element whose position is already the end
      // of the resource is *specified* to rewind it to the beginning first,
      // so priming a video that has been scrubbed to its last frame would
      // put the assembled head back on screen. Only prime once, at the top.
      if (primed) {
        seekRef.current(wantedRef.current)
        return
      }
      primed = true
      seekRef.current(wantedRef.current)
      const p = video.play()
      if (p) {
        // A muted inline play/pause primes the decode pipeline without a
        // gesture. iOS Low Power Mode blocks exactly this, which is what
        // stops scrubbed frames from ever advancing — there, the visitor's
        // first touch is allowed to start it.
        p.then(() => video.pause()).catch(() => {
          if (isTouch) window.addEventListener('touchend', unlock, { passive: true })
        })
      }
    }
    video.addEventListener('loadedmetadata', onMeta)
    if (video.readyState >= 1) onMeta()

    sizeCanvas()
    // ResizeObserver rather than a window resize listener: the hero shrinks
    // this box during its scroll choreography, with the window size never
    // changing — the canvas backing store has to follow it, or the frame is
    // drawn at the wrong resolution and goes soft.
    const ro = new ResizeObserver(sizeCanvas)
    ro.observe(canvas)
    return () => {
      window.clearTimeout(watchdog)
      ro.disconnect()
      window.removeEventListener('touchend', unlock)
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', release)
      seekRef.current = () => {}
    }
  }, [src, srcMobile, fit])

  return (
    <div aria-hidden style={style} className={`relative overflow-hidden ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={posterRef}
        src={poster}
        alt=""
        className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${fit === 'cover' ? 'object-cover' : 'object-contain'}`}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={poster}
        disablePictureInPicture
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      />
    </div>
  )
})
