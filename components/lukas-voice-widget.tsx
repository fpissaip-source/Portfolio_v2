'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { onLukasReached } from '@/lib/lukas-presence'
import { useT } from './language-context'

/**
 * L.U.K.A.S. voice/chat launcher.
 *
 * The conversation itself is powered by the Lukas-Autonom backend's own
 * embed (`<lukas-domain>/widget.js`, configured through its data-* API and
 * an ElevenLabs agent id). This component owns only the on-brand *entry*
 * experience around it: a floating launcher that fades in after the visitor
 * has travelled through the L.U.K.A.S. scroll story (never before — see
 * lib/lukas-presence.ts), plus a shared open trigger so the in-section
 * "Sprich mit L.U.K.A.S." panel opens the exact same thing.
 *
 * Config (both public, so NEXT_PUBLIC_, inlined at build time on Railway):
 *   NEXT_PUBLIC_LUKAS_WIDGET_DOMAIN  the backend origin serving widget.js
 *                                    (e.g. https://lukas.issahareb.me).
 *                                    Unset ⇒ the launcher never renders and
 *                                    the site ships exactly as before.
 *   NEXT_PUBLIC_LUKAS_AGENT_ID       overrides the default agent id below.
 *
 * On first activation we inject widget.js with its data-* attributes; the
 * backend widget then takes over the actual chat/voice surface.
 */
const WIDGET_DOMAIN = process.env.NEXT_PUBLIC_LUKAS_WIDGET_DOMAIN
const AGENT_ID =
  process.env.NEXT_PUBLIC_LUKAS_AGENT_ID || 'agent_4501ky1q2tgvepx906k5waew8bwk'

/** Fired by the in-section invite panel (components/lukas.tsx) so its CTA
 *  opens the same conversation as the floating launcher. */
export const OPEN_CHAT_EVENT = 'lukas:open-chat'

export function LukasVoiceWidget() {
  const t = useT()
  const [reached, setReached] = useState(false)
  const [activated, setActivated] = useState(false)
  const scriptInjected = useRef(false)

  // Appear only once the visitor has been through the L.U.K.A.S. section.
  useEffect(() => onLukasReached(() => setReached(true)), [])

  // Inject the backend widget script exactly once, on the first open (from
  // the launcher or the in-section panel). The backend's widget.js reads
  // these data-* attributes off its own <script> tag.
  const activate = () => {
    if (!WIDGET_DOMAIN) return
    if (!scriptInjected.current) {
      scriptInjected.current = true
      const s = document.createElement('script')
      s.src = `${WIDGET_DOMAIN}/widget.js`
      s.async = true
      s.defer = true
      s.setAttribute('data-api', WIDGET_DOMAIN)
      s.setAttribute('data-voice', 'agent')
      s.setAttribute('data-agent-id', AGENT_ID)
      document.body.appendChild(s)
    }
    setActivated(true)
  }

  // Shared open trigger for the in-section CTA.
  useEffect(() => {
    if (!WIDGET_DOMAIN) return
    const open = () => activate()
    window.addEventListener(OPEN_CHAT_EVENT, open)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nothing to show until configured and until the section has been reached.
  // Once activated, the backend widget owns the on-screen surface, so the
  // branded launcher steps aside rather than sitting on top of it.
  if (!WIDGET_DOMAIN || !reached || activated) return null

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        onClick={activate}
        aria-label={t.lukasVoice.launcherAria}
        initial={{ opacity: 0, y: 24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.9 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="group fixed bottom-6 right-5 z-[95] flex items-center gap-3 rounded-full border border-white/15 bg-black/55 py-2.5 pl-2.5 pr-4 shadow-[0_18px_50px_-16px_rgba(0,0,0,0.85)] backdrop-blur-md transition-colors hover:border-purple/60 sm:right-9"
      >
        {/* Neuron orb — the section's motif, distilled into one pulsing node. */}
        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-purple/25 blur-md" />
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple/25 [animation-duration:2.4s]" />
          <span className="relative h-3 w-3 rounded-full bg-[color-mix(in_oklch,var(--purple)_60%,white)] shadow-[0_0_14px_3px_color-mix(in_oklch,var(--purple)_75%,transparent)]" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-purple/80">
            {t.lukasVoice.launcherKicker}
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {t.lukasVoice.launcherLabel}
          </span>
        </span>
      </motion.button>
    </AnimatePresence>
  )
}
