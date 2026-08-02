'use client'

import { useEffect, useRef, useState } from 'react'

/** A soft cursor-following glow. Pointer-events none, GPU transform only.
 *
 *  Not rendered at all where it cannot be seen or cannot be afforded: there
 *  is no cursor to follow on a touch screen, and `mix-blend-screen` over the
 *  full viewport is a compositing pass per frame either way. */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(!window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!show || !el) return

    let raf = 0
    let tx = window.innerWidth / 2
    let ty = window.innerHeight / 2
    let cx = tx
    let cy = ty

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
    }

    const loop = () => {
      cx += (tx - cx) * 0.12
      cy += (ty - cy) * 0.12
      el.style.transform = `translate3d(${cx - 450}px, ${cy - 450}px, 0)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [show])

  if (!show) return null

  return (
    <div
      ref={ref}
      aria-hidden
      // Bigger and brighter than it was. At 600px and 22% it read as a
      // smudge somewhere near the cursor rather than as light coming off it,
      // and on a near-black page that is the difference between a lit room
      // and a flat one.
      className="pointer-events-none fixed left-0 top-0 z-30 h-[900px] w-[900px] rounded-full opacity-90 mix-blend-screen will-transform"
      style={{
        background:
          'radial-gradient(circle, color-mix(in oklch, var(--blue) 46%, transparent) 0%, color-mix(in oklch, var(--purple) 20%, transparent) 34%, transparent 68%)',
      }}
    />
  )
}
