'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { onConsentChange } from '@/lib/consent'

/**
 * Consent-gated mount point for an analytics tool.
 *
 * Nothing is loaded until two things are true: a tool is configured, and the
 * visitor has allowed the `analytics` category. Both are checked here rather
 * than at the call site, so there is no path that bypasses the gate.
 *
 * Configuring it is one environment variable — no code change:
 *
 *   NEXT_PUBLIC_ANALYTICS_SRC     the script URL, e.g. a self-hosted
 *                                 Plausible or Umami endpoint
 *   NEXT_PUBLIC_ANALYTICS_DOMAIN  the site identifier the tool expects
 *                                 (Plausible: data-domain, Umami:
 *                                 data-website-id)
 *
 * With NEXT_PUBLIC_ANALYTICS_SRC unset this component renders nothing, which
 * is the current state: the consent category exists and is honest about what
 * it would do, but no request is made to anyone. That is deliberate — the
 * category had to exist before a tool is picked, so the banner could be
 * built and reviewed first.
 *
 * A note on the tool choice, since the privacy copy depends on it: the text
 * says cookies are set. Plausible and Umami are cookieless and would let
 * that sentence be softened; Google Analytics would need the copy widened
 * (US transfer, longer retention, advertising identifiers). Pick the tool,
 * then the wording gets a second pass.
 */
const SRC = process.env.NEXT_PUBLIC_ANALYTICS_SRC
const DOMAIN = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN

export function Analytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => onConsentChange((s) => setAllowed(s?.analytics === true)), [])

  if (!SRC || !allowed) return null

  return (
    <Script
      src={SRC}
      strategy="lazyOnload"
      data-domain={DOMAIN}
      data-website-id={DOMAIN}
    />
  )
}
