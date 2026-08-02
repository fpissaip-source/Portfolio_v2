'use client'

import { useEffect, useRef, useState } from 'react'

const GLOW_SIZE = 760
const GLOW_RADIUS = GLOW_SIZE / 2

/** A restrained cursor-following light. It is skipped on touch devices. */
export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(!window.matchMedia('(pointer: coarse)').matches)
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!show || !element) return

    let frame = 0
    let targetX = window.innerWidth / 2
    let targetY = window.innerHeight / 2
    let currentX = targetX
    let currentY = targetY

    const onMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY
    }

    const animate = () => {
      currentX += (targetX - currentX) * 0.1
      currentY += (targetY - currentY) * 0.1
      element.style.transform = `translate3d(${currentX - GLOW_RADIUS}px, ${
        currentY - GLOW_RADIUS
      }px, 0)`
      frame = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    frame = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [show])

  if (!show) return null

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 h-[760px] w-[760px] rounded-full opacity-[0.38] mix-blend-screen will-transform"
      style={{
        background:
          'radial-gradient(circle, color-mix(in oklch, var(--blue) 24%, transparent) 0%, color-mix(in oklch, var(--purple) 10%, transparent) 34%, transparent 64%)',
      }}
    />
  )
}
