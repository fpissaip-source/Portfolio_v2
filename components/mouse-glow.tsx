'use client'

import { useEffect, useRef } from 'react'

/** A soft cursor-following glow. Pointer-events none, GPU transform only. */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const el = ref.current
    if (!el) return

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
      el.style.transform = `translate3d(${cx - 300}px, ${cy - 300}px, 0)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 h-[600px] w-[600px] rounded-full opacity-60 mix-blend-screen will-transform"
      style={{
        background:
          'radial-gradient(circle, color-mix(in oklch, var(--blue) 22%, transparent) 0%, transparent 60%)',
      }}
    />
  )
}
