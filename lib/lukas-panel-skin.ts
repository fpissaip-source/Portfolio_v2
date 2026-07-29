/**
 * Structural fixes for the L.U.K.A.S. chat panel.
 *
 * The panel itself is built by the backend's widget.js, which is not part of
 * this repository. It ships without a shadow DOM by design ("die Host-Seite
 * kann mit normalem CSS ALLES überschreiben"), so its *look* is re-skinned
 * purely in CSS — see the `.lukas-w` block in app/globals.css.
 *
 * Two things CSS cannot do, and this module does:
 *
 * 1. **Give the panel back its scroll.** Lenis intercepts wheel/touch on the
 *    whole document; it walks the event's composed path and only stands down
 *    when it finds `data-lenis-prevent`. Without that attribute every swipe
 *    inside the message list was being consumed as page scroll — which is
 *    why the conversation could not be scrolled back up, most visibly on
 *    mobile where the panel covers the entire viewport.
 *
 * 2. **Replace the emoji glyphs with real icons.** widget.js writes 🎤 / ➤ /
 *    ✕ as text content. Emoji render in the OS colour font, at a size and
 *    weight nothing else on the page shares — the single loudest reason the
 *    panel read as dated next to the rest of the site.
 *
 * Both are idempotent and applied once, when widget.js has finished building
 * the panel; its buttons are populated at construction and never rewritten
 * afterwards (only classes and `display` change), so a one-shot swap holds.
 */

const ICONS: Record<string, string> = {
  '.lukas-mic': `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>`,
  '.lukas-send': `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>`,
  '.lukas-close': `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
}

export function skinLukasPanel(): () => void {
  if (typeof window === 'undefined') return () => {}

  let disposed = false
  let poll = 0

  const apply = (panel: HTMLElement) => {
    // Lenis hands the gesture back the moment it finds this on the path —
    // one attribute on the panel covers the message list, the chips and the
    // input row in one go.
    panel.setAttribute('data-lenis-prevent', '')

    for (const [sel, svg] of Object.entries(ICONS)) {
      const btn = panel.querySelector<HTMLElement>(sel)
      // Guard on the emoji still being there: if widget.js ever ships real
      // icons of its own, leave them alone rather than fighting it.
      if (btn && !btn.querySelector('svg')) btn.innerHTML = svg
    }
  }

  let tries = 0
  const wait = () => {
    if (disposed) return
    const panel = document.querySelector<HTMLElement>('.lukas-panel')
    if (panel) {
      apply(panel)
      return
    }
    if (tries++ < 120) poll = window.setTimeout(wait, 250) // up to ~30s
  }
  wait()

  return () => {
    disposed = true
    window.clearTimeout(poll)
  }
}
