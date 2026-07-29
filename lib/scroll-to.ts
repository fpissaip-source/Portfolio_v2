/**
 * Anchor navigation that goes through Lenis.
 *
 * Lenis runs its own virtual scroll position; a native anchor jump (or
 * `scrollIntoView`) moves the document underneath it and the two then fight
 * until the next user gesture resettles them. Every in-page link on the site
 * therefore hands the scroll to Lenis when it is running, and falls back to
 * the native smooth scroll when it is not (no-JS, reduced motion, or before
 * SmoothScroll has mounted).
 *
 * `offset` defaults to the same -40px the nav uses, which clears the fixed
 * nav pill so the target's first line is not hidden under it.
 */
type Lenis = { scrollTo: (target: Element, options?: object) => void }

export function scrollToSelector(selector: string, offset = -40) {
  const el = document.querySelector(selector)
  if (!el) return
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
  if (lenis) lenis.scrollTo(el, { offset })
  else el.scrollIntoView({ behavior: 'smooth' })
}

/** Click handler for an in-page `<a href="#…">`. Keeps the real href so the
 *  link still works without JS and still shows its target in the status bar. */
export function handleAnchorClick(e: React.MouseEvent, href: string, offset = -40) {
  e.preventDefault()
  scrollToSelector(href, offset)
}
