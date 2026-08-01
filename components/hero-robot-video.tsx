'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The robot head taking itself apart — the hero's one moving object.
 *
 * Placement differs by device on purpose, so the hero mounts this twice:
 * once as a second column next to the copy (`mode="wide"`), once centred
 * *behind* the copy on a phone (`mode="narrow"`), where there is no room
 * for two columns. Only the instance matching the current viewport renders
 * anything at all — otherwise both would download and decode their video on
 * every device, for one of them to be `display: none`.
 *
 * It plays once and holds on its last frame: the head is disassembled and
 * the violet node-and-edge network is left standing. A loop that reassembles
 * and shatters a head every five seconds would pull the eye off the copy for
 * as long as the visitor stays, and the resting frame happens to be the same
 * motif as the L.U.K.A.S. section directly below.
 *
 * Skipped entirely under prefers-reduced-motion — the poster frame stands in,
 * so the composition is unchanged and nothing moves.
 */
const SRC_DESKTOP = '/videos/hero-robot.mp4'
const SRC_MOBILE = '/videos/hero-robot-mobile.mp4'
const POSTER = '/intro/hero-robot-poster.jpg'

const NARROW = '(max-width: 1023px)'

export function HeroRobotVideo({
  mode,
  className = '',
}: {
  mode: 'wide' | 'narrow'
  className?: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  /** null until the first client measurement — nothing renders server-side,
   *  so the two instances can never both appear in the initial HTML. */
  const [active, setActive] = useState<boolean | null>(null)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const narrow = window.matchMedia(NARROW)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setActive(narrow.matches === (mode === 'narrow'))
    sync()
    setStill(reduced.matches)
    narrow.addEventListener('change', sync)
    return () => narrow.removeEventListener('change', sync)
  }, [mode])

  // Autoplay is refused more often than one would think — data saver, iOS
  // Low Power Mode, strict autoplay policies. That is not a reason to give
  // up on the animation: the element keeps showing its poster (so nothing
  // moves in the layout either way) and the first real interaction, which
  // browsers do accept as a gesture, starts it.
  useEffect(() => {
    const v = videoRef.current
    if (!v || still || !active) return
    let armed = false
    const retry = () => {
      v.play()
        .then(release)
        .catch(() => {})
    }
    const release = () => {
      if (!armed) return
      armed = false
      window.removeEventListener('pointerdown', retry)
      window.removeEventListener('touchend', retry)
      window.removeEventListener('keydown', retry)
    }
    v.play().catch(() => {
      armed = true
      window.addEventListener('pointerdown', retry, { passive: true })
      window.addEventListener('touchend', retry, { passive: true })
      window.addEventListener('keydown', retry)
    })
    return release
  }, [active, still])

  if (!active) return null

  return (
    <div aria-hidden className={`pointer-events-none ${className}`.trim()}>
      {still ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={POSTER} alt="" className="h-full w-full object-contain" />
      ) : (
        <video
          ref={videoRef}
          src={mode === 'narrow' ? SRC_MOBILE : SRC_DESKTOP}
          poster={POSTER}
          muted
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      )}
    </div>
  )
}
