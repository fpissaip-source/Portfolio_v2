/**
 * Voice visualiser for the L.U.K.A.S. chat panel.
 *
 * The backend widget (widget.js) drives a real ElevenLabs WebRTC voice
 * conversation, but keeps its audio inside the SDK — so instead of tapping
 * raw amplitude (not reachable without owning that script), this reads the
 * widget's own, DOM-observable state and animates to it:
 *   • session live   → `.lukas-btn` carries the class `lukas-live`
 *   • Lukas speaking  → `.lukas-status` text contains "spricht" / "speaking"
 *   • Lukas listening → status contains "hört" / "listening"
 *
 * A canvas is injected once into the panel (no shadow DOM on the widget, so
 * this is a plain, non-destructive appendChild) and drawn as a mirrored
 * equalizer: energetic, organic bars while he speaks, a calm breathing line
 * while he listens, faded out when there's no voice session. Everything is
 * self-contained and tears itself down via the returned cleanup.
 */

type VoiceState = 'off' | 'listening' | 'speaking'

export function mountLukasVoiceViz(): () => void {
  if (typeof window === 'undefined') return () => {}

  let disposed = false
  let raf = 0
  let poll = 0
  let observer: MutationObserver | null = null
  let canvas: HTMLCanvasElement | null = null
  let ctx: CanvasRenderingContext2D | null = null

  // Smoothed drive value: 0 = calm, 1 = fully speaking. Lerped toward the
  // target so state changes ease instead of snapping.
  let energy = 0
  let state: VoiceState = 'off'

  const readState = (): VoiceState => {
    const btn = document.querySelector('.lukas-btn')
    const live = btn?.classList.contains('lukas-live')
    if (!live) return 'off'
    const status = (document.querySelector('.lukas-status')?.textContent || '').toLowerCase()
    if (status.includes('spricht') || status.includes('speak')) return 'speaking'
    return 'listening'
  }

  const BARS = 28

  const draw = (now: number) => {
    if (disposed || !canvas || !ctx) return
    const target = state === 'speaking' ? 1 : state === 'listening' ? 0.28 : 0
    energy += (target - energy) * 0.12

    const w = canvas.clientWidth
    const h = canvas.clientHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    ctx.clearRect(0, 0, w, h)

    // Fade the whole strip out when there's no session at all.
    canvas.style.opacity = String(Math.min(1, energy < 0.02 ? energy * 40 : 1))
    if (energy < 0.004) {
      raf = requestAnimationFrame(draw)
      return
    }

    const t = now / 1000
    const mid = h / 2
    const gap = w / BARS
    const barW = Math.max(2, gap * 0.5)

    for (let i = 0; i < BARS; i++) {
      // Layered sines + a slow per-bar offset read as organic speech motion;
      // the centre bars swing hardest, like a real voice meter.
      const centreBias = 1 - Math.abs(i - (BARS - 1) / 2) / ((BARS - 1) / 2)
      const wave =
        0.5 +
        0.5 *
          Math.sin(t * 7 + i * 0.55) *
          Math.sin(t * 3.3 + i * 0.9) *
          (0.6 + 0.4 * Math.sin(t * 1.7 + i))
      const idle = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 0.4)
      const amp =
        energy *
        (0.25 + 0.75 * centreBias) *
        (state === 'speaking' ? wave : idle * 0.35)
      const barH = Math.max(2, amp * (h * 0.9))

      const x = i * gap + (gap - barW) / 2
      const grad = ctx.createLinearGradient(0, mid - barH / 2, 0, mid + barH / 2)
      grad.addColorStop(0, 'rgba(167,139,250,0.95)')
      grad.addColorStop(1, 'rgba(91,147,246,0.85)')
      ctx.fillStyle = grad
      ctx.shadowColor = 'rgba(167,139,250,0.65)'
      ctx.shadowBlur = 8
      const r = barW / 2
      const y = mid - barH / 2
      // rounded bar
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + barW, y, x + barW, y + barH, r)
      ctx.arcTo(x + barW, y + barH, x, y + barH, r)
      ctx.arcTo(x, y + barH, x, y, r)
      ctx.arcTo(x, y, x + barW, y, r)
      ctx.closePath()
      ctx.fill()
    }
    raf = requestAnimationFrame(draw)
  }

  const attach = (panel: Element) => {
    if (disposed || canvas) return
    canvas = document.createElement('canvas')
    canvas.className = 'lukas-viz'
    Object.assign(canvas.style, {
      display: 'block',
      width: '100%',
      height: '46px',
      flex: '0 0 auto',
      background: 'transparent',
      opacity: '0',
      transition: 'opacity .4s ease',
    })
    ctx = canvas.getContext('2d')
    // Slot it right under the header so it sits above the messages.
    const head = panel.querySelector('.lukas-head')
    if (head && head.nextSibling) panel.insertBefore(canvas, head.nextSibling)
    else panel.appendChild(canvas)

    state = readState()
    observer = new MutationObserver(() => {
      state = readState()
    })
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      childList: true,
      characterData: true,
      attributeFilter: ['class'],
    })
    raf = requestAnimationFrame(draw)
  }

  // The panel is created by widget.js after its script loads — poll briefly.
  let tries = 0
  const waitForPanel = () => {
    if (disposed) return
    const panel = document.querySelector('.lukas-panel')
    if (panel) {
      attach(panel)
      return
    }
    if (tries++ < 120) poll = window.setTimeout(waitForPanel, 250) // up to ~30s
  }
  waitForPanel()

  return () => {
    disposed = true
    cancelAnimationFrame(raf)
    window.clearTimeout(poll)
    observer?.disconnect()
    canvas?.remove()
  }
}
