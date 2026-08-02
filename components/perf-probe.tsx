'use client'

import { useEffect, useState } from 'react'
import { getPerfTier, probePerfTier, type PerfTier } from '@/lib/perf-tier'

/**
 * Starts the frame-rate probe once, as early on the page as a client
 * component can. Renders nothing; the result lands on <html> as
 * `data-perf="low"` and in lib/perf-tier.ts. See that file for why the tier
 * is measured instead of detected.
 */
export function PerfProbe() {
  useEffect(() => {
    probePerfTier()
  }, [])
  return null
}

/**
 * The measured tier, for components that have to drop a whole layer rather
 * than restyle one (a canvas that runs its own rAF loop cannot be turned off
 * from CSS).
 *
 * Starts at `high` on both the server and the first client render, so the
 * markup matches; a device that turns out to be slow unmounts the layer
 * about a second and a half in, which is early enough to matter and late
 * enough that nothing flashes.
 */
export function usePerfTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>('high')
  useEffect(() => {
    setTier(getPerfTier())
    return probePerfTier(setTier)
  }, [])
  return tier
}
