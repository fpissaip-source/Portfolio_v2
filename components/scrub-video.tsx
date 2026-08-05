'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
} from 'react'

/**
 * A video used as a frame source rather than a player. The caller drives it
 * with seek(progress), and decoded frames are painted onto a canvas.
 */
export type ScrubVideoHandle = {
  /** 0 = first frame, 1 = last frame. */
  seek: (progress: number) => void
}

export const ScrubVideo = forwardRef<
  ScrubVideoHandle,
  {
    src: string
    srcMobile?: string
    poster: string
    className?: string
    style?: CSSProperties
    fit?: 'cover' | 'contain'
  }
>(function ScrubVideo({ src, srcMobile, poster, className = '', style, fit = 'cover' }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  const seekRef = useRef<(progress: number) => void>(() => {})
  const wantedRef = useRef(0)
  const blended = /\bmix-blend-(?:lighten|screen)\b/.test(className)

  const fallbackMaskStyle = useMemo<CSSProperties | undefined>(
    () =>
      blended
        ? {
            maskImage:
              'radial-gradient(ellipse 84% 90% at 50% 50%, black 0%, black 68%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.36) 92%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 84% 90% at 50% 50%, black 0%, black 68%, rgba(0,0,0,0.88) 80%, rgba(0,0,0,0.36) 92%, transparent 100%)',
          }
        : undefined,
    [blended],
  )

  useImperativeHandle(ref, () => ({ seek: (progress) => seekRef.current(progress) }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const video = videoRef.current
    const posterElement = posterRef.current
    if (!canvas || !video || !posterElement) return

    const context = canvas.getContext('2d')
    if (!context) return

    const selectedSource =
      srcMobile && window.matchMedia('(max-width: 767px)').matches ? srcMobile : src

    // The mask is baked into each painted frame. Keeping it inside the 2D
    // canvas avoids Safari creating a separate filtered/masked rectangle for
    // a constantly changing canvas, which caused both the visible panel and
    // the scroll hitching.
    const maskCanvas = document.createElement('canvas')
    const maskContext = maskCanvas.getContext('2d')

    let canvasWidth = 0
    let canvasHeight = 0
    let videoIsVisible = false
    let painted = false
    let primed = false
    let seeking = false
    let targetTime = 0
    let watchdog = 0

    const requestFrame = (
      video as HTMLVideoElement & {
        requestVideoFrameCallback?: (callback: () => void) => number
      }
    ).requestVideoFrameCallback?.bind(video)

    /** Half a frame at 24fps. Anything closer is already the same picture. */
    const SEEK_EPSILON = 1 / 48

    const clampTime = (time: number) => {
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) return 0
      return Math.max(0, Math.min(duration - SEEK_EPSILON, time))
    }

    const rebuildMask = (dpr: number) => {
      if (!blended || !maskContext || !canvasWidth || !canvasHeight) return

      maskCanvas.width = Math.round(canvasWidth * dpr)
      maskCanvas.height = Math.round(canvasHeight * dpr)
      maskContext.setTransform(dpr, 0, 0, dpr, 0, 0)
      maskContext.clearRect(0, 0, canvasWidth, canvasHeight)
      maskContext.save()
      maskContext.translate(canvasWidth / 2, canvasHeight / 2)

      // Canvas gradients are circular. Scaling the drawing space turns this
      // into an ellipse that follows the source frame, with a long soft tail
      // before the real canvas edge.
      const xScale = canvasWidth / Math.max(canvasHeight, 1)
      maskContext.scale(xScale, 1)
      const radius = canvasHeight / 2
      const gradient = maskContext.createRadialGradient(
        0,
        0,
        radius * 0.66,
        0,
        0,
        radius,
      )
      gradient.addColorStop(0, 'rgba(0,0,0,1)')
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.98)')
      gradient.addColorStop(0.78, 'rgba(0,0,0,0.82)')
      gradient.addColorStop(0.92, 'rgba(0,0,0,0.32)')
      gradient.addColorStop(1, 'rgba(0,0,0,0)')
      maskContext.fillStyle = gradient
      maskContext.fillRect(
        -canvasWidth / (2 * xScale),
        -canvasHeight / 2,
        canvasWidth / xScale,
        canvasHeight,
      )
      maskContext.restore()
    }

    const draw = () => {
      if (videoIsVisible || !canvasWidth || !canvasHeight || !video.videoWidth) return
      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return

      const videoWidth = video.videoWidth
      const videoHeight = video.videoHeight
      const scale =
        fit === 'cover'
          ? Math.max(canvasWidth / videoWidth, canvasHeight / videoHeight)
          : Math.min(canvasWidth / videoWidth, canvasHeight / videoHeight)

      context.clearRect(0, 0, canvasWidth, canvasHeight)
      context.save()
      context.globalCompositeOperation = 'source-over'

      // Crush the encoded near-black floor during the draw itself. Unlike a
      // CSS filter on the live canvas, this does not create a new Safari
      // compositing layer on every scroll frame.
      context.filter = blended
        ? 'contrast(1.42) brightness(0.8) saturate(1.02)'
        : 'none'
      context.drawImage(
        video,
        (canvasWidth - videoWidth * scale) / 2,
        (canvasHeight - videoHeight * scale) / 2,
        videoWidth * scale,
        videoHeight * scale,
      )
      context.filter = 'none'

      if (blended && maskCanvas.width && maskCanvas.height) {
        context.globalCompositeOperation = 'destination-in'
        context.drawImage(maskCanvas, 0, 0, canvasWidth, canvasHeight)
      }
      context.restore()

      if (!painted) {
        painted = true
        posterElement.style.opacity = '0'
      }
    }

    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasWidth = canvas.clientWidth
      canvasHeight = canvas.clientHeight
      canvas.width = Math.round(canvasWidth * dpr)
      canvas.height = Math.round(canvasHeight * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      rebuildMask(dpr)
      draw()
    }

    const drain = () => {
      if (videoIsVisible || seeking || !video.duration) return
      const next = clampTime(targetTime)

      if (Math.abs(video.currentTime - next) < SEEK_EPSILON && !video.seeking) {
        draw()
        return
      }

      seeking = true
      window.clearTimeout(watchdog)
      watchdog = window.setTimeout(() => {
        seeking = false
        draw()
        drain()
      }, 280)

      if (requestFrame) requestFrame(draw)
      try {
        video.currentTime = next
      } catch {
        seeking = false
        window.clearTimeout(watchdog)
      }
    }

    seekRef.current = (progress) => {
      const clampedProgress = Math.max(0, Math.min(1, progress))
      wantedRef.current = clampedProgress
      if (!video.duration) return

      targetTime = clampTime(clampedProgress * video.duration)

      if (videoIsVisible) {
        if (Math.abs(video.currentTime - targetTime) >= SEEK_EPSILON) {
          video.currentTime = targetTime
        }
        return
      }

      // Coalesce all input while a frame is decoding. Once Safari releases
      // that seek, drain() immediately requests the newest target, including
      // when the user has reversed direction.
      drain()
    }

    const onSeeked = () => {
      window.clearTimeout(watchdog)
      draw()
      seeking = false
      drain()
    }

    const onFrameReady = () => {
      draw()
      if (!seeking) drain()
    }

    const onError = () => {
      window.clearTimeout(watchdog)
      seeking = false
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('loadeddata', onFrameReady)
    video.addEventListener('canplay', onFrameReady)
    video.addEventListener('error', onError)

    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches

    const unlock = () => {
      window.removeEventListener('touchend', unlock)
      const playPromise = video.play()
      if (!playPromise) return

      playPromise
        .then(() => {
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
          posterElement.style.opacity = '0'
          videoIsVisible = true
          if (video.duration) {
            targetTime = clampTime(wantedRef.current * video.duration)
            video.currentTime = targetTime
          }
        })
        .catch(() => {
          // The poster remains a clean first-frame fallback.
        })
    }

    const applyWantedPosition = () => {
      if (!video.duration) return
      targetTime = clampTime(wantedRef.current * video.duration)
      // Force the queue open. A seek that was still outstanding when the
      // priming play() interrupted it would otherwise leave `seeking` true
      // for good, and drain() would refuse every later target.
      seeking = false
      window.clearTimeout(watchdog)
      drain()
    }

    const onMetadata = () => {
      sizeCanvas()

      if (primed) {
        applyWantedPosition()
        return
      }

      primed = true

      // The priming play/pause is only safe from a standing start.
      //
      // `play()` on a media element whose position is the end of the
      // resource is *specified* to seek back to the beginning first. On a
      // reload the browser restores the scroll position, so by the time
      // metadata arrives the caller has usually already asked for a frame
      // near the end — the visitor saw that frame, then the priming play
      // rewound the element to zero and the canvas froze on frame one.
      // That is exactly the reported symptom.
      //
      // Priming exists to warm the decoder on iOS before the first scrub. A
      // visitor who is already inside the section gets that warm-up from
      // their own seek, so there is nothing to prime and nothing to gain by
      // risking the rewind.
      if (wantedRef.current > 0.001) {
        applyWantedPosition()
        if (isTouch) window.addEventListener('touchend', unlock, { passive: true })
        return
      }

      const playPromise = video.play()
      if (!playPromise) {
        applyWantedPosition()
        return
      }

      playPromise
        .then(() => {
          video.pause()
          applyWantedPosition()
        })
        .catch(() => {
          applyWantedPosition()
          if (isTouch) window.addEventListener('touchend', unlock, { passive: true })
        })

      // Do not wait for that promise before showing anything. It only
      // settles once the element could actually begin playing, which on a
      // large file behind a slow connection can be many seconds — and until
      // then this was the only path to the first painted frame.
      applyWantedPosition()
    }

    video.addEventListener('loadedmetadata', onMetadata)

    sizeCanvas()
    const resizeObserver = new ResizeObserver(sizeCanvas)
    resizeObserver.observe(canvas)

    video.src = selectedSource
    video.load()
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMetadata()

    return () => {
      window.clearTimeout(watchdog)
      resizeObserver.disconnect()
      window.removeEventListener('touchend', unlock)
      video.removeEventListener('loadedmetadata', onMetadata)
      video.removeEventListener('loadeddata', onFrameReady)
      video.removeEventListener('canplay', onFrameReady)
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('error', onError)
      seekRef.current = () => {}
    }
  }, [src, srcMobile, fit, blended])

  return (
    <div aria-hidden style={style} className={`relative overflow-hidden ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={posterRef}
        src={poster}
        alt=""
        style={fallbackMaskStyle}
        className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${
          fit === 'cover' ? 'object-cover' : 'object-contain'
        }`}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={poster}
        disablePictureInPicture
        style={fallbackMaskStyle}
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      />
    </div>
  )
})
