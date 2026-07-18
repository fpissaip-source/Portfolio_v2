'use client'

import { useT } from './language-context'

/** Standard "skip to content" link — invisible until focused (first Tab
 *  press), then jumps keyboard/screen-reader users past the cinematic
 *  intro straight to the main content. */
export function SkipLink() {
  const t = useT()
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black focus:shadow-lg"
    >
      {t.nav.skipToContent}
    </a>
  )
}
