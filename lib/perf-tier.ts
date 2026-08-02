/**
 * How much this device can actually paint, measured rather than guessed.
 *
 * The problem this solves is concrete: on an iPhone X the scroll stutters
 * badly, on an iPhone 14 the same page is smooth. Everything on the page is
 * within budget for a modern GPU and over budget for an A11, and there is no
 * useful feature flag to test for that. `navigator.deviceMemory` does not
 * exist on Safari, `hardwareConcurrency` reports 6 on the very phone that
 * cannot keep up, and user-agent sniffing dates instantly.
 *
 * So: watch real frames. For the first ~1.4 seconds after mount, count how
 * many frames arrive and how many of them were long. If the device cannot
 * hold a reasonable rate while the page is doing nothing but idling, it has
 * no chance once the scroll-scrubbed video, the WebGL scenes and the blurred
 * chrome are all live at once, and the expensive layers come off.
 *
 * The result is published as `data-perf="low"` on <html> (so CSS can react
 * without a re-render, see globals.css) and as a module-level value for the
 * components that need it in JS.
 *
 * Deliberately one-way: the tier is decided once and never re-raised. A page
 * that switches its effects back on mid-scroll because two good frames went
 * by would be worse than either state on its own.
 */

export type PerfTier = 'high' | 'low'

/** Frames slower than this count as dropped at a 60 Hz target. A little over
 *  two frame budgets: one long frame is normal, a run of them is not. */
const LONG_FRAME_MS = 34
/** Wait this long before starting to count. The first second of a page load
 *  is janky on every machine (hydration, fonts, the first WebGL context,
 *  the first video decode) and says nothing about the hardware. Measuring
 *  through it would demote perfectly capable desktops. */
const SETTLE_MS = 1200
/** How long to watch once things have settled. Long enough for a run of bad
 *  frames to be a pattern rather than an accident, short enough that the
 *  decision lands before the visitor reaches the heavy sections. */
const PROBE_MS = 1200
/** Below this many frames per second, or above this share of long frames,
 *  the device is treated as low tier. Deliberately well under 60: the cost
 *  of demoting a good device (visibly plainer page) is higher than the cost
 *  of leaving a borderline one alone. */
const MIN_FPS = 40
const MAX_LONG_SHARE = 0.35

let tier: PerfTier = 'high'
let started = false
let resolved = false
const waiting = new Set<(t: PerfTier) => void>()

export function getPerfTier(): PerfTier {
  return tier
}

/** Runs the probe once per page load and reports the result.
 *
 *  Safe to call from any number of components: the measurement happens once,
 *  and every caller is told the answer when it lands (or immediately, if it
 *  already has). Returns an unsubscribe function for callers that can
 *  unmount before the probe finishes. */
export function probePerfTier(onResolved?: (t: PerfTier) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  if (onResolved) {
    if (resolved) onResolved(tier)
    else waiting.add(onResolved)
  }
  const unsubscribe = () => {
    if (onResolved) waiting.delete(onResolved)
  }
  if (started) return unsubscribe
  started = true

  // A device that asks for less motion also gets the cheap page: the same
  // layers are the ones doing the moving.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    commit('low')
    return unsubscribe
  }

  window.setTimeout(() => {
    let t0 = 0
    let last = 0
    let frames = 0
    let long = 0

    const step = (now: number) => {
      if (!t0) {
        // The frame the probe starts on carries whatever the page was
        // already doing, so it starts the clock rather than being counted.
        t0 = now
        last = now
        requestAnimationFrame(step)
        return
      }
      const dt = now - last
      last = now
      frames++
      if (dt > LONG_FRAME_MS) long++

      const elapsed = now - t0
      if (elapsed < PROBE_MS) {
        requestAnimationFrame(step)
        return
      }
      const fps = (frames / elapsed) * 1000
      const longShare = long / frames
      commit(fps < MIN_FPS || longShare > MAX_LONG_SHARE ? 'low' : 'high')
    }

    requestAnimationFrame(step)
  }, SETTLE_MS)

  return unsubscribe
}

function commit(t: PerfTier) {
  tier = t
  resolved = true
  if (t === 'low') document.documentElement.dataset.perf = 'low'
  for (const fn of waiting) fn(t)
  waiting.clear()
}

/** Pixel ratio cap for WebGL canvases.
 *
 *  A 3× device pixel ratio means nine times the fragments of a 1× render,
 *  and on a phone-sized canvas the difference between 2× and 3× is invisible
 *  at arm's length while costing more than half the frame. react-three-fiber
 *  takes `dpr` as a [min, max] pair and this is the max. */
export function canvasDpr(): [number, number] {
  if (typeof window === 'undefined') return [1, 2]
  if (tier === 'low') return [1, 1.5]
  return [1, Math.min(window.devicePixelRatio || 1, 2)]
}
