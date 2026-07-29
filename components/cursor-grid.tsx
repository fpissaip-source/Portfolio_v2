'use client'

import { useEffect, useRef } from 'react'

/**
 * Cursor-lit lattice (React Bits' CursorGrid, ported to TS and pulled onto
 * this site's rules).
 *
 * Why this one earns its place where the WebGL backdrops would not: it is a
 * plain 2D canvas — no extra WebGL context on a page that already runs three
 * — and it genuinely sleeps. The render loop stops itself the moment nothing
 * is lit and only wakes on a pointer event, so an idle section costs nothing.
 * A lattice that lights under the cursor is also the site's own metaphor made
 * literal: an instrument surface responding to the hand (DESIGN.md §1).
 *
 * Deviations from upstream, all deliberate:
 *
 *   • **The listener moved off the canvas onto the host section.** Upstream
 *     binds `pointermove` to the grid's own container. As a backdrop the
 *     content is not a descendant of that container, so the effect would have
 *     died exactly where the heading and the capability list sit — the part
 *     of the section people actually point at. `hostRef` takes the events and
 *     the canvas stays `pointer-events: none`, so it never swallows a click
 *     meant for a link underneath.
 *   • Colour defaults to the section accent, not upstream's magenta
 *     `#D946EF` — this site is blue and violet only (§3).
 *   • Skipped entirely on coarse pointers and under prefers-reduced-motion.
 *     `pointermove` barely fires on touch, so on a phone this would be dead
 *     weight rather than an effect; `MouseGlow` already draws the same line.
 */

const FALLOFF_CURVES = {
  linear: (t: number) => t,
  smooth: (t: number) => t * t * (3 - 2 * t),
  sharp: (t: number) => t * t * t,
}

type Falloff = keyof typeof FALLOFF_CURVES

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  const v =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h
  const num = parseInt(v.slice(0, 6), 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

type CursorGridProps = {
  /** Element whose pointer events drive the grid. Defaults to the wrapper's
   *  own parent — i.e. the section it is used as a backdrop for. */
  hostRef?: React.RefObject<HTMLElement | null>
  cellSize?: number
  color?: string
  radius?: number
  falloff?: Falloff
  holdTime?: number
  fadeDuration?: number
  lineWidth?: number
  maxOpacity?: number
  fillOpacity?: number
  gridOpacity?: number
  cellRadius?: number
  clickPulse?: boolean
  pulseSpeed?: number
  className?: string
}

export function CursorGrid({
  hostRef,
  cellSize = 74,
  // Blue: this backs the services chapter, which is craft (DESIGN.md §3).
  color = '#6da9e7',
  radius = 170,
  falloff = 'smooth',
  holdTime = 380,
  fadeDuration = 950,
  lineWidth = 1,
  // Measured, not guessed: at 0.5 with a fill, the brightest cell under the
  // cursor dropped the muted body copy to 2.88:1 — and the cursor is exactly
  // where the reader is looking. The floor is 4.5:1 (DESIGN.md §3), so the
  // lattice is a thin drawn line and nothing else.
  maxOpacity = 0.1,
  fillOpacity = 0,
  gridOpacity = 0,
  cellRadius = 0,
  clickPulse = false,
  pulseSpeed = 600,
  className = '',
}: CursorGridProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const propsRef = useRef({
    cellSize,
    color,
    radius,
    falloff,
    holdTime,
    fadeDuration,
    lineWidth,
    maxOpacity,
    fillOpacity,
    gridOpacity,
    cellRadius,
    clickPulse,
    pulseSpeed,
  })
  propsRef.current = {
    cellSize,
    color,
    radius,
    falloff,
    holdTime,
    fadeDuration,
    lineWidth,
    maxOpacity,
    fillOpacity,
    gridOpacity,
    cellRadius,
    clickPulse,
    pulseSpeed,
  }

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    // A pointer effect for people who have a pointer, and motion for people
    // who want motion. Neither is a loss: nothing here carries information.
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const host = hostRef?.current ?? container.parentElement
    if (!host) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let cols = 0
    let rows = 0
    let offX = 0
    let offY = 0
    let alphas = new Float32Array(0)
    let touched = new Float64Array(0)
    let w = 0
    let h = 0
    const pulses: { x: number; y: number; t0: number }[] = []
    let raf = 0
    let running = false
    let lastFrame = 0

    const rebuild = () => {
      const p = propsRef.current
      w = container.offsetWidth
      h = container.offsetHeight
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / p.cellSize) + 1
      rows = Math.ceil(h / p.cellSize) + 1
      offX = (w - cols * p.cellSize) / 2
      offY = (h - rows * p.cellSize) / 2
      alphas = new Float32Array(cols * rows)
      touched = new Float64Array(cols * rows)
    }

    const cellCenter = (i: number): [number, number] => {
      const p = propsRef.current
      return [
        offX + (i % cols) * p.cellSize + p.cellSize / 2,
        offY + Math.floor(i / cols) * p.cellSize + p.cellSize / 2,
      ]
    }

    const energize = (x: number, y: number, boost?: number) => {
      const p = propsRef.current
      const r = Math.max(p.radius, 1)
      const ease = FALLOFF_CURVES[p.falloff] ?? FALLOFF_CURVES.linear
      const now = performance.now()
      const minCol = Math.max(0, Math.floor((x - r - offX) / p.cellSize))
      const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / p.cellSize))
      const minRow = Math.max(0, Math.floor((y - r - offY) / p.cellSize))
      const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / p.cellSize))
      for (let cRow = minRow; cRow <= maxRow; cRow++) {
        for (let cCol = minCol; cCol <= maxCol; cCol++) {
          const i = cRow * cols + cCol
          const [cx, cy] = cellCenter(i)
          const dist = Math.hypot(cx - x, cy - y)
          if (dist > r) continue
          const level = ease(1 - dist / r) * p.maxOpacity * (boost ?? 1)
          if (level > alphas[i]) {
            alphas[i] = level
            touched[i] = now
          } else if (level > 0) {
            touched[i] = now
          }
        }
      }
    }

    const draw = (now: number) => {
      const p = propsRef.current
      const dt = Math.min(now - lastFrame, 50)
      lastFrame = now
      ctx.clearRect(0, 0, w, h)
      const [cr, cg, cb] = hexToRgb(p.color)

      if (p.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.gridOpacity})`
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let cCol = 0; cCol <= cols; cCol++) {
          const x = Math.round(offX + cCol * p.cellSize) + 0.5
          ctx.moveTo(x, 0)
          ctx.lineTo(x, h)
        }
        for (let cRow = 0; cRow <= rows; cRow++) {
          const y = Math.round(offY + cRow * p.cellSize) + 0.5
          ctx.moveTo(0, y)
          ctx.lineTo(w, y)
        }
        ctx.stroke()
      }

      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi]
        const age = (now - pulse.t0) / 1000
        const ringR = age * p.pulseSpeed
        if (ringR > Math.hypot(w, h)) {
          pulses.splice(pi, 1)
          continue
        }
        const band = p.cellSize
        const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / p.cellSize))
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / p.cellSize))
        const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / p.cellSize))
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / p.cellSize))
        for (let cRow = minRow; cRow <= maxRow; cRow++) {
          for (let cCol = minCol; cCol <= maxCol; cCol++) {
            const i = cRow * cols + cCol
            const [cx, cy] = cellCenter(i)
            const dist = Math.hypot(cx - pulse.x, cy - pulse.y)
            if (Math.abs(dist - ringR) < band / 2 && p.maxOpacity > alphas[i]) {
              alphas[i] = p.maxOpacity
              touched[i] = now
            }
          }
        }
      }

      let anyVisible = pulses.length > 0
      const fadeStep = dt / Math.max(p.fadeDuration, 16)
      const half = p.cellSize / 2

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i]
        if (a <= 0) continue
        if (now - touched[i] > p.holdTime) {
          a = Math.max(0, a - fadeStep)
          alphas[i] = a
          if (a <= 0) continue
        }
        anyVisible = true

        const [cx, cy] = cellCenter(i)
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, p.cellSize)
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`)
        gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`)

        const x = cx - half + 0.5
        const y = cy - half + 0.5
        const s = p.cellSize - 1

        ctx.beginPath()
        if (p.cellRadius > 0) ctx.roundRect(x, y, s, s, p.cellRadius)
        else ctx.rect(x, y, s, s)
        if (p.fillOpacity > 0) {
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * p.fillOpacity})`
          ctx.fill()
        }
        ctx.strokeStyle = gradient
        ctx.lineWidth = p.lineWidth
        ctx.stroke()
      }

      if (anyVisible) {
        raf = requestAnimationFrame(draw)
      } else {
        // Nothing lit: stop the loop entirely rather than idling a RAF.
        running = false
        if (propsRef.current.gridOpacity <= 0) ctx.clearRect(0, 0, w, h)
      }
    }

    const wake = () => {
      if (running) return
      running = true
      lastFrame = performance.now()
      raf = requestAnimationFrame(draw)
    }

    const toLocal = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect()
      return [e.clientX - rect.left, e.clientY - rect.top]
    }

    const onPointerMove = (e: PointerEvent) => {
      const [x, y] = toLocal(e)
      energize(x, y)
      wake()
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!propsRef.current.clickPulse) return
      const [x, y] = toLocal(e)
      pulses.push({ x, y, t0: performance.now() })
      wake()
    }

    const ro = new ResizeObserver(() => {
      rebuild()
      wake()
    })
    ro.observe(container)
    rebuild()

    host.addEventListener('pointermove', onPointerMove as EventListener, { passive: true })
    host.addEventListener('pointerdown', onPointerDown as EventListener, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      host.removeEventListener('pointermove', onPointerMove as EventListener)
      host.removeEventListener('pointerdown', onPointerDown as EventListener)
    }
  }, [hostRef])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  )
}
