'use client'

import { useEffect, useRef, useState } from 'react'

/** True once the element has scrolled within `margin` of the viewport, and
 *  stays true after that (a heavy WebGL scene mounting once is fine — it's
 *  mounting immediately on page load, far below the fold, that isn't).
 *  Used to defer Canvas/WebGL context creation until shortly before a
 *  section is actually visible instead of the moment the page hydrates. */
export function useNearViewport<T extends HTMLElement>(margin = '400px') {
  const ref = useRef<T>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (near) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true)
          obs.disconnect()
        }
      },
      { rootMargin: margin },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [margin, near])

  return { ref, near }
}
