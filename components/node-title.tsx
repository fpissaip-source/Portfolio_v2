'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export type NodeTitleHandle = {
  setProgress: (p: number) => void
  /** Client-space bounds of the final "ISSA HAREB" line — the cinematic
   *  intro uses it to slide the title onto the monitor's screen preview. */
  getNameRect: () => DOMRect | null
}

/**
 * "I AM ISSA" → "ISSA HAREB", drawn as outlined letters that assemble from
 * flashing network nodes — the same visual language as the L.U.K.A.S.
 * neuron sparks around it. Everything is scrubbed by ONE progress value:
 *
 *   0.02–0.17  "I"   forms (nodes flicker in along the glyph outline)
 *   0.17–0.32  "AM"  forms
 *   0.32–0.48  "ISSA" forms — the full line holds, outlined + glowing
 *   0.60–0.78  "I AM" dissolves back into sparks; ISSA glides into its
 *              "ISSA HAREB" position while HAREB forms beside it
 *   0.88–1.00  the finished name fades for the monitor hand-off
 *
 * Letters are stroke-only (no fill) with a soft blue glow bleeding both
 * inward and outward from the outline. Node flicker runs on its own clock
 * so the letters keep sparking even when the scroll is parked.
 */

const BLUE = '125,165,235'
const ICE = '210,230,255'
const PURPLE = '167,139,250'

const SEG = {
  I: [0.02, 0.17],
  AM: [0.17, 0.32],
  ISSA: [0.32, 0.48],
  MORPH: [0.6, 0.78],
  IAM_OUT: [0.6, 0.72],
  HAREB: [0.64, 0.82],
  OUT: [0.88, 1],
} as const

const seg = (p: number, [a, b]: readonly [number, number]) =>
  Math.max(0, Math.min(1, (p - a) / (b - a)))
const smooth = (t: number) => t * t * (3 - 2 * t)

type Pt = {
  x: number
  y: number
  phase: number
  speed: number
  r: number
  nn: number[]
}

type WordGlyph = {
  text: string
  pts: Pt[]
  width: number
  asc: number
  desc: number
}

type Spark = { ax: number; ay: number; bx: number; by: number; born: number; life: number }

/** Sample glow-node anchor points along a word's stroked outline. */
function sampleWord(text: string, font: string, F: number): WordGlyph {
  const probe = document.createElement('canvas')
  const ctx = probe.getContext('2d', { willReadFrequently: true })!
  ctx.font = font
  const m = ctx.measureText(text)
  const asc = Math.ceil(m.actualBoundingBoxAscent || F * 0.72)
  const desc = Math.ceil(m.actualBoundingBoxDescent || F * 0.05)
  const pad = Math.ceil(F * 0.2)
  probe.width = Math.ceil(m.width) + pad * 2
  probe.height = asc + desc + pad * 2
  ctx.font = font
  ctx.lineWidth = Math.max(1.5, F * 0.014)
  ctx.strokeStyle = '#fff'
  ctx.strokeText(text, pad, pad + asc)

  const { data } = ctx.getImageData(0, 0, probe.width, probe.height)
  const raw: { x: number; y: number }[] = []
  const step = Math.max(2, Math.round(F / 46))
  for (let y = 0; y < probe.height; y += step) {
    for (let x = 0; x < probe.width; x += step) {
      if (data[(y * probe.width + x) * 4 + 3] > 90) {
        // store relative to the text's left-baseline origin
        raw.push({ x: x - pad, y: y - pad - asc })
      }
    }
  }
  // Fisher–Yates: the shuffled order becomes the node reveal order.
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[raw[i], raw[j]] = [raw[j], raw[i]]
  }
  const target = Math.min(70 + text.length * 26, raw.length)
  const pts: Pt[] = raw.slice(0, target).map((p) => ({
    ...p,
    phase: Math.random() * Math.PI * 2,
    speed: 2.2 + Math.random() * 3.4,
    r: (0.9 + Math.random() * 1.1) * Math.max(1.1, F / 90),
    nn: [],
  }))
  // 2 nearest revealed-earlier-or-later neighbours for the connective edges
  for (let i = 0; i < pts.length; i++) {
    const dists = pts
      .map((q, j) => ({ j, d: (q.x - pts[i].x) ** 2 + (q.y - pts[i].y) ** 2 }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
    pts[i].nn = dists.slice(0, 2).map((e) => e.j)
  }
  return { text, pts, width: m.width, asc, desc }
}

export const NodeTitle = forwardRef<NodeTitleHandle, { className?: string }>(
  function NodeTitle({ className }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const apiRef = useRef<NodeTitleHandle>({
      setProgress: () => {},
      getNameRect: () => null,
    })

    useImperativeHandle(ref, () => ({
      setProgress: (p) => apiRef.current.setProgress(p),
      getNameRect: () => apiRef.current.getNameRect(),
    }))

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      let progress = 0
      let raf = 0
      let disposed = false
      let words: Record<'I' | 'AM' | 'ISSA' | 'HAREB', WordGlyph> | null = null
      let font = ''
      let F = 0
      let gap = 0
      let baseY = 0
      // left-baseline x origins for both layouts
      let layoutA = { I: 0, AM: 0, ISSA: 0 }
      let layoutB = { ISSA: 0, HAREB: 0 }
      const sparks: Spark[] = []
      let nextSparkAt = 0

      const build = () => {
        const W = canvas.clientWidth
        const H = canvas.clientHeight
        if (!W || !H) return
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.round(W * dpr)
        canvas.height = Math.round(H * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const family = getComputedStyle(document.body).fontFamily || 'sans-serif'
        // Size the line so BOTH layouts fit — they share one font size so
        // the ISSA that glides between them never has to rescale.
        const probeFont = `700 100px ${family}`
        const probe = document.createElement('canvas').getContext('2d')!
        probe.font = probeFont
        const gapU = 0.26
        const unitsA =
          (probe.measureText('I').width +
            probe.measureText('AM').width +
            probe.measureText('ISSA').width) /
            100 +
          gapU * 2
        const unitsB =
          (probe.measureText('ISSA').width + probe.measureText('HAREB').width) / 100 + gapU
        const units = Math.max(unitsA, unitsB)
        F = Math.min(H * 0.13, (W * 0.88) / units)
        gap = F * gapU
        baseY = H * 0.26
        font = `700 ${F}px ${family}`

        words = {
          I: sampleWord('I', font, F),
          AM: sampleWord('AM', font, F),
          ISSA: sampleWord('ISSA', font, F),
          HAREB: sampleWord('HAREB', font, F),
        }
        const wA = words.I.width + gap + words.AM.width + gap + words.ISSA.width
        const wB = words.ISSA.width + gap + words.HAREB.width
        layoutA = {
          I: (W - wA) / 2,
          AM: (W - wA) / 2 + words.I.width + gap,
          ISSA: (W - wA) / 2 + words.I.width + gap + words.AM.width + gap,
        }
        layoutB = {
          ISSA: (W - wB) / 2,
          HAREB: (W - wB) / 2 + words.ISSA.width + gap,
        }
        draw()
      }

      const drawWord = (
        w: WordGlyph,
        ox: number,
        q: number,
        fade: number,
        t: number,
      ) => {
        if (q <= 0.001 || fade <= 0.001) return
        const strokeA = smooth(seg(q, [0.5, 1])) * fade
        // Nodes carry the first half, then recede as the outline lights up —
        // a few keep sparking so the letters never go static. While a word
        // dissolves (fade < 1) the nodes flare back up as the stroke dies.
        const settle = 1 - 0.7 * strokeA
        const flare = fade < 1 ? Math.sin((1 - fade) * Math.PI) * 0.9 : 0
        const reveal = q * w.pts.length

        // connective edges
        ctx.lineCap = 'round'
        for (let i = 0; i < w.pts.length; i++) {
          const ai = Math.max(0, Math.min(1, reveal - i))
          if (ai <= 0) continue
          const p = w.pts[i]
          const fl = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * p.speed + p.phase)
          for (const j of p.nn) {
            if (j > reveal) continue
            const qp = w.pts[j]
            const a = ai * fl * (settle * 0.28 + flare * 0.25) * fade
            if (a <= 0.01) continue
            ctx.strokeStyle = `rgba(${BLUE},${a})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(ox + p.x, baseY + p.y)
            ctx.lineTo(ox + qp.x, baseY + qp.y)
            ctx.stroke()
          }
        }
        // nodes
        for (let i = 0; i < w.pts.length; i++) {
          const ai = Math.max(0, Math.min(1, reveal - i))
          if (ai <= 0) continue
          const p = w.pts[i]
          const keepAlive = i % 6 === 0 ? 0.35 : 0
          const fl = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * p.speed + p.phase)
          const a = ai * fl * Math.min(1, settle + keepAlive + flare) * fade
          if (a <= 0.015) continue
          const px = ox + p.x
          const py = baseY + p.y
          const glowR = p.r * 4.5
          const g = ctx.createRadialGradient(px, py, 0, px, py, glowR)
          const col = i % 5 === 0 ? PURPLE : BLUE
          g.addColorStop(0, `rgba(${col},${0.55 * a})`)
          g.addColorStop(1, `rgba(${col},0)`)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(px, py, glowR, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = `rgba(${ICE},${0.75 * a})`
          ctx.beginPath()
          ctx.arc(px, py, p.r * 0.55, 0, Math.PI * 2)
          ctx.fill()
        }

        // outlined glyphs — a wide soft stroke bleeds glow to both sides of
        // the outline (inward AND outward), then a thin ice-bright core.
        if (strokeA > 0.01) {
          ctx.font = font
          ctx.shadowColor = `rgba(${BLUE},0.9)`
          ctx.shadowBlur = F * 0.14
          ctx.strokeStyle = `rgba(${BLUE},${0.5 * strokeA})`
          ctx.lineWidth = Math.max(1.5, F * 0.016)
          ctx.strokeText(w.text, ox, baseY)
          ctx.shadowBlur = F * 0.05
          ctx.strokeStyle = `rgba(${ICE},${0.95 * strokeA})`
          ctx.lineWidth = Math.max(1, F * 0.008)
          ctx.strokeText(w.text, ox, baseY)
          ctx.shadowBlur = 0
        }
      }

      /** Short-lived jagged micro-bolt between two outline nodes. */
      const drawSparks = (t: number) => {
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i]
          const age = (t - s.born) / s.life
          if (age >= 1) {
            sparks.splice(i, 1)
            continue
          }
          const a = Math.sin(age * Math.PI) * 0.85
          const mx = (s.ax + s.bx) / 2 + (Math.sin(s.born * 13 + t * 30) * F) / 30
          const my = (s.ay + s.by) / 2 + (Math.cos(s.born * 7 + t * 26) * F) / 30
          ctx.strokeStyle = `rgba(${ICE},${a})`
          ctx.lineWidth = 1.1
          ctx.shadowColor = `rgba(${BLUE},0.8)`
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.moveTo(s.ax, s.ay)
          ctx.lineTo(mx, my)
          ctx.lineTo(s.bx, s.by)
          ctx.stroke()
          ctx.shadowBlur = 0
        }
      }

      const spawnSpark = (w: WordGlyph, ox: number, q: number, t: number) => {
        if (reduced || w.pts.length < 4) return
        const reveal = Math.floor(q * w.pts.length)
        if (reveal < 3) return
        const i = Math.floor(Math.random() * reveal)
        const p = w.pts[i]
        const j = p.nn[Math.floor(Math.random() * p.nn.length)]
        if (j === undefined || j > reveal) return
        const q2 = w.pts[j]
        sparks.push({
          ax: ox + p.x,
          ay: baseY + p.y,
          bx: ox + q2.x,
          by: baseY + q2.y,
          born: t,
          life: 0.28 + Math.random() * 0.2,
        })
      }

      const draw = () => {
        const W = canvas.clientWidth
        const H = canvas.clientHeight
        ctx.clearRect(0, 0, W, H)
        if (!words || progress <= 0.001 || progress >= 0.999) return
        const t = performance.now() / 1000
        const p = progress

        const master = 1 - smooth(seg(p, SEG.OUT))
        if (master <= 0) return
        const fadeIAM = (1 - smooth(seg(p, SEG.IAM_OUT))) * master
        const morph = smooth(seg(p, SEG.MORPH))
        const issaX = layoutA.ISSA + (layoutB.ISSA - layoutA.ISSA) * morph

        const prevOp = ctx.globalCompositeOperation
        ctx.globalCompositeOperation = 'lighter'

        drawWord(words.I, layoutA.I, seg(p, SEG.I), fadeIAM, t)
        drawWord(words.AM, layoutA.AM, seg(p, SEG.AM), fadeIAM, t)
        drawWord(words.ISSA, issaX, seg(p, SEG.ISSA), master, t)
        drawWord(words.HAREB, layoutB.HAREB, seg(p, SEG.HAREB), master, t)

        // occasional micro-bolts inside whichever word is currently forming
        if (t >= nextSparkAt) {
          nextSparkAt = t + 0.18 + Math.random() * 0.3
          const forming: [WordGlyph, number, number][] = [
            [words.I, layoutA.I, seg(p, SEG.I)],
            [words.AM, layoutA.AM, seg(p, SEG.AM)],
            [words.ISSA, issaX, seg(p, SEG.ISSA)],
            [words.HAREB, layoutB.HAREB, seg(p, SEG.HAREB)],
          ]
          const active = forming.filter(([, , q]) => q > 0.05)
          if (active.length) {
            const [w, ox, q] = active[Math.floor(Math.random() * active.length)]
            spawnSpark(w, ox, q, t)
          }
        }
        drawSparks(t)

        ctx.globalCompositeOperation = prevOp
      }

      // Flicker runs on its own clock — keep animating while visible even
      // if the scroll position is parked.
      const loop = () => {
        raf = 0
        if (disposed) return
        draw()
        if (progress > 0.001 && progress < 0.999 && !reduced) {
          raf = requestAnimationFrame(loop)
        }
      }

      apiRef.current = {
        setProgress: (v) => {
          progress = v
          if (!raf) raf = requestAnimationFrame(loop)
        },
        getNameRect: () => {
          if (!words) return null
          const rect = canvas.getBoundingClientRect()
          const wB = words.ISSA.width + gap + words.HAREB.width
          const asc = Math.max(words.ISSA.asc, words.HAREB.asc)
          const desc = Math.max(words.ISSA.desc, words.HAREB.desc)
          return new DOMRect(
            rect.left + layoutB.ISSA,
            rect.top + baseY - asc,
            wB,
            asc + desc,
          )
        },
      }

      // Sample the outlines only after the real display font is ready —
      // sampling the fallback font would form the wrong letter shapes.
      let cancelled = false
      document.fonts?.ready
        .then(() => {
          if (!cancelled) build()
        })
        .catch(() => {
          if (!cancelled) build()
        })
      if (!document.fonts) build()

      window.addEventListener('resize', build)
      return () => {
        disposed = true
        cancelled = true
        window.removeEventListener('resize', build)
        cancelAnimationFrame(raf)
      }
    }, [])

    return <canvas ref={canvasRef} aria-hidden className={className} />
  },
)
