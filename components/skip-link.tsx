'use client'

import { useT } from './language-context'

/** Standard "skip to content" link — invisible until focused (first Tab
 *  press), then jumps keyboard/screen-reader users past the cinematic
 *  intro straight to the content after it (#after-intro, not #main-content
 *  — that starts at the intro itself, so it wouldn't actually skip
 *  anything). Real href + native anchor jump as a no-JS fallback; where
 *  Lenis is running, preventDefault and hand it the scroll instead so the
 *  jump doesn't fight Lenis's own virtual scroll position. */
export function SkipLink() {
  const t = useT()
  return (
    <a
      href="#after-intro"
      onClick={(e) => {
        const el = document.getElementById('after-intro')
        const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } }).__lenis
        if (el && lenis) {
          e.preventDefault()
          lenis.scrollTo(el, { offset: 0 })
          el.focus()
        }
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg"
    >
      {t.nav.skipToContent}
    </a>
  )
}
