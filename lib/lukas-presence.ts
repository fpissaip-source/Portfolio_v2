/**
 * Tiny cross-component signal for "the visitor has travelled through the
 * L.U.K.A.S. section". The section (components/lukas.tsx) fires it once the
 * scroll story is essentially complete; the floating voice launcher
 * (components/lukas-voice-widget.tsx) waits for it before appearing, so
 * L.U.K.A.S. only offers to talk after he's introduced himself.
 *
 * A module-level flag backs a window event so a listener that mounts (or
 * re-mounts) after the moment has already passed still learns about it
 * immediately — no ordering assumptions between the two components.
 */
const EVENT = 'lukas:reached'
let reached = false

export function markLukasReached() {
  if (reached) return
  reached = true
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENT))
}

export function hasLukasBeenReached() {
  return reached
}

/** Subscribe; fires immediately if the moment already happened. Returns an
 *  unsubscribe. */
export function onLukasReached(cb: () => void) {
  if (reached) {
    cb()
    return () => {}
  }
  const handler = () => cb()
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
