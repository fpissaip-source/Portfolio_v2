'use client'

import Script from 'next/script'
import type React from 'react'

/**
 * ElevenLabs Conversational-AI widget — the visible "talk to L.U.K.A.S."
 * surface. The agent itself (voice, greeting, colors, and which LLM backs
 * it — e.g. the Lukas-Autonom custom-LLM endpoint) is configured entirely
 * in the ElevenLabs dashboard, not here.
 *
 * Gated behind NEXT_PUBLIC_ELEVENLABS_AGENT_ID: with the variable unset
 * the component renders nothing and the site ships exactly as before.
 * Setting the variable (Railway env, then redeploy — NEXT_PUBLIC_ values
 * are inlined at build time) turns the widget on. Agent IDs are public
 * identifiers, not secrets.
 *
 * The embed script loads lazily after the page is idle so the intro's
 * performance budget is untouched; until it executes, the custom element
 * below is an unknown tag and renders as nothing.
 */
const AGENT_ID = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'agent-id'?: string
      }
    }
  }
}

export function LukasVoiceWidget() {
  if (!AGENT_ID) return null
  return (
    <>
      <elevenlabs-convai agent-id={AGENT_ID} />
      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="lazyOnload"
      />
    </>
  )
}
