'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
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
      context.drawImage(
        video,
        (canvasWidth - videoWidth * scale) / 2,
        (canvasHeight - videoHeight * scale) / 2,
        videoWidth * scale,
        videoHeight * scale,
      )

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
      draw()
    }

    const drain = () => {
      if (videoIsVisible || seeking || !video.duration) return
      const next = clampTime(targetTime)

      // Compare with the frame the browser actually reached, not merely the
      // last frame we requested. That distinction is what keeps reverse
      // scrolling alive after WebKit drops or coalesces a seek.
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
      }, 350)

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

      // While one frame is decoding, only targetTime changes. When seeked
      // fires, drain() immediately heads for the newest target, regardless of
      // whether the visitor kept scrolling forward or reversed direction.
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
      drain()
    }

    const onMetadata = () => {
      sizeCanvas()

      if (primed) {
        applyWantedPosition()
        return
      }

      primed = true
      // Prime at frame zero first, then seek to the requested scroll state.
      // Playing after a seek can rewind an ended media element on Safari.
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
    }

    video.addEventListener('loadedmetadata', onMetadata)

    sizeCanvas()
    const resizeObserver = new ResizeObserver(sizeCanvas)
    resizeObserver.observe(canvas)

    // Assigning the source explicitly and calling load() makes remounts and
    // mobile-source switches start a fresh request instead of inheriting a
    // half-initialised media element from React's previous render.
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
  }, [src, srcMobile, fit])

  const blended = /\bmix-blend-(?:lighten|screen)\b/.test(className)
  const mediaStyle: CSSProperties | undefined = blended
    ? {
        // Apply the black-floor correction to the pixels themselves, not to
        // the element that owns mix-blend-mode. Safari rasterises a mask or
        // filter on that outer blending layer into an isolated rectangle,
        // which is exactly the dark box visible around the robot. Crushing
        // the codec's near-black floor here leaves the outer layer free to
        // blend normally with the real hero background.
        filter: 'contrast(1.32) brightness(0.91) saturate(0.96)',
      }
    : undefined

  return (
    <div aria-hidden style={style} className={`relative overflow-hidden ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={posterRef}
        src={poster}
        alt=""
        style={mediaStyle}
        className={`absolute inset-0 h-full w-full transition-opacity duration-200 ${
          fit === 'cover' ? 'object-cover' : 'object-contain'
        }`}
      />
      <canvas
        ref={canvasRef}
        style={mediaStyle}
        className="absolute inset-0 h-full w-full"
      />
      <video
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        poster={poster}
        disablePictureInPicture
        style={mediaStyle}
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      />
    </div>
  )
})
