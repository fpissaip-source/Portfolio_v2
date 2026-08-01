'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { onLukasReached } from '@/lib/lukas-presence'
import { mountLukasVoiceViz } from '@/lib/lukas-voice-viz'
import { skinLukasPanel } from '@/lib/lukas-panel-skin'
import { hasConsent, onConsentChange, setConsent } from '@/lib/consent'
import { LukasConsentPrompt } from './lukas-consent-prompt'
import { useT } from './language-context'

/**
 * L.U.K.A.S. voice/chat launcher.
 *
 * The conversation itself is the Lukas-Autonom backend's own embeddable
 * widget (`<domain>/widget.js` — a self-contained chat/voice panel, voice via
 * the OpenAI Realtime API). This component owns the on-brand *entry*:
 *   • the backend widget is loaded only once the visitor has travelled
 *     through the L.U.K.A.S. scroll story (see lib/lukas-presence.ts);
 *   • the widget's own default button is hidden (CSS — it has no shadow
 *     DOM), and our branded launcher pill takes its place;
 *   • the in-section "Sprich mit L.U.K.A.S." panel opens the same thing.
 *
 * Config (public → NEXT_PUBLIC_, inlined at build time):
 *   NEXT_PUBLIC_LUKAS_WIDGET_DOMAIN  backend origin serving widget.js +
 *                                    the chat API. Defaults to the current
 *                                    Railway deployment; override to move it.
 */
const WIDGET_DOMAIN =
  process.env.NEXT_PUBLIC_LUKAS_WIDGET_DOMAIN ||
  'https://portfoliov2-production-992f.up.railway.app'

/** Fired by the in-section invite panel (components/lukas.tsx) so its CTA
 *  opens the same conversation as the floating launcher. */
export const OPEN_CHAT_EVENT = 'lukas:open-chat'

export function LukasVoiceWidget() {
  const t = useT()
  const [reached, setReached] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [askOpen, setAskOpen] = useState(false)
  const loadedRef = useRef(false)
  const vizCleanupRef = useRef<(() => void) | null>(null)

  // Appear only once the visitor has been through the L.U.K.A.S. section.
  useEffect(() => onLukasReached(() => setReached(true)), [])

  // widget.js is third-party code that transmits the conversation to the
  // agent backend, and in voice mode streams microphone audio straight to
  // api.openai.com. It must not load before the visitor has opted in, and it
  // must stop being loadable the moment they withdraw.
  useEffect(() => onConsentChange((s) => setAllowed(s?.lukas === true)), [])

  // Load the backend widget (idempotent — safe to call from both the
  // "reached" preload below AND directly from a click, see openChat). Hide
  // its own default button and lift its panel above our launcher pill.
  const loadWidget = () => {
    if (loadedRef.current) return
    if (!hasConsent('lukas')) return
    loadedRef.current = true

    // Only the two rules that depend on *this* component existing stay
    // inline — they hide the widget's own button in favour of our launcher
    // and lift its panel clear of it. The panel's appearance is re-skinned in
    // app/globals.css (see the `.lukas-w` block); widget.js injects its own
    // stylesheet after ours, which is why those rules are scoped by class
    // rather than shouted down with !important.
    const style = document.createElement('style')
    style.setAttribute('data-lukas-widget-style', '')
    style.textContent =
      '.lukas-btn{display:none!important}.lukas-panel{bottom:92px!important}'
    document.head.appendChild(style)

    const s = document.createElement('script')
    s.src = `${WIDGET_DOMAIN}/widget.js`
    s.defer = true
    const attrs: Record<string, string> = {
      'data-api': WIDGET_DOMAIN,
      'data-voice': 'agent',
      'data-theme': 'dark',
      'data-accent': '#a78bfa',
      'data-accent2': '#5b93f6',
      'data-radius': '20px',
      'data-position': 'bottom-right',
      'data-title': 'L.U.K.A.S.',
      'data-subtitle': t.lukasVoice.panelSubtitle,
      'data-greeting': t.lukasVoice.panelGreeting,
      'data-placeholder': t.lukasVoice.panelPlaceholder,
    }
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
    document.body.appendChild(s)

    // Both wait for widget.js to build the panel, then patch it: the
    // visualiser injects the equalizer and tracks his speaking/listening
    // state, the skin restores scrolling (Lenis) and swaps the emoji glyphs
    // for real icons.
    const disposeViz = mountLukasVoiceViz()
    const disposeSkin = skinLukasPanel()
    vizCleanupRef.current = () => {
      disposeViz()
      disposeSkin()
    }
  }

  // Preload once the section is reached (so the floating launcher opens
  // instantly), but the in-section invite CTA can fire long before that —
  // openChat() below loads on demand too, so clicking it never no-ops.
  useEffect(() => {
    if (reached && allowed) loadWidget()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reached, allowed])

  useEffect(() => () => vizCleanupRef.current?.(), [])

  // Toggle the widget panel via its (hidden) button. Loads the widget first
  // if it isn't already (e.g. the invite CTA fires long before "reached"),
  // then retries briefly since the script + its button take a moment to
  // appear once injected.
  const openPanel = () => {
    loadWidget()
    let attempts = 30
    const tryClick = () => {
      const btn = document.querySelector<HTMLElement>('.lukas-btn')
      if (btn) {
        btn.click()
        return
      }
      if (attempts-- > 0) window.setTimeout(tryClick, 150)
    }
    tryClick()
  }

  const openChat = () => {
    // No permission yet: ask right here, in a prompt about this one thing.
    // The visitor pressed "talk to L.U.K.A.S.", so the question they get is
    // about L.U.K.A.S. — not a cookie list they have to find the agent in.
    if (!hasConsent('lukas')) {
      setAskOpen(true)
      return
    }
    openPanel()
  }

  // Shared open trigger for the in-section CTA.
  useEffect(() => {
    const open = () => openChat()
    window.addEventListener(OPEN_CHAT_EVENT, open)
    return () => window.removeEventListener(OPEN_CHAT_EVENT, open)
  }, [])

  const allow = () => {
    setConsent('lukas', true)
    setAskOpen(false)
    // Straight into the conversation they asked for — the prompt is a step
    // on the way, not a destination.
    openPanel()
  }

  return (
    <>
      <LukasConsentPrompt
        open={askOpen}
        onAllow={allow}
        onClose={() => setAskOpen(false)}
      />
      {reached && (
        <AnimatePresence>
        <motion.button
          type="button"
          onClick={openChat}
          data-lukas-launcher
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
      )}
    </>
  )
}
