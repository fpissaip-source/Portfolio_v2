'use client'

import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Mic } from 'lucide-react'
import { useT } from './language-context'


/**
 * Asks for the L.U.K.A.S. decision where the visitor actually meets him —
 * in his own section, one tap before the conversation starts — instead of
 * in the banner that greets everyone on arrival.
 *
 * Two reasons this is the better place. A choice about a feature is easier
 * to make while standing in front of it than as a checkbox shown before you
 * know what it is. And the opening banner can then be about the one thing
 * it really is about (analytics), rather than presenting two unrelated
 * decisions at once.
 *
 * The copy deliberately does not say "third-party code is loaded". That is
 * technically true and reads like a warning that the visitor is about to be
 * attacked. What actually happens is: the agent gets loaded so he can
 * answer. The transfers that genuinely matter — messages to the agent
 * server, and microphone audio to OpenAI when speaking rather than typing —
 * are still named plainly, which is what the disclosure is for.
 */
export function LukasConsentPrompt({
  open,
  onAllow,
  onClose,
}: {
  open: boolean
  onAllow: () => void
  onClose: () => void
}) {
  const t = useT()
  const dialogRef = useRef<HTMLDivElement>(null)
  const c = t.consent

  // Esc closes; focus moves into the dialog and is trapped while open.
  useEffect(() => {
    if (!open) return
    const node = dialogRef.current
    const sel = 'a[href],button:not([disabled])'
    node?.querySelector<HTMLElement>(sel)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll<HTMLElement>(sel)].filter(
        (el) => el.offsetParent !== null,
      )
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[130] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lukas-consent-title"
            onClick={(e) => e.stopPropagation()}
            className="glass w-full max-w-lg rounded-2xl p-6 sm:p-7"
            data-lenis-prevent
          >
            <p className="font-label text-[12px] uppercase tracking-[0.22em] text-purple/90">
              {c.askKicker}
            </p>
            <h2
              id="lukas-consent-title"
              className="mt-3 text-2xl font-semibold tracking-tight"
            >
              {c.askTitle}
            </h2>
            <p className="mt-3 text-pretty text-[16px] leading-[1.6] text-foreground/78">
              {c.askBody}
            </p>
            {/* Voice is the heavier transfer, so it gets its own line rather
                than being buried at the end of the paragraph above. */}
            <div className="mt-4 flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Mic className="mt-0.5 h-4 w-4 shrink-0 text-purple/80" aria-hidden />
              <p className="text-pretty text-[16px] leading-[1.6] text-foreground/78">
                {c.askVoiceNote}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              {/* Declining is the same size and weight as allowing. */}
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {c.askDecline}
              </button>
              <button
                type="button"
                onClick={onAllow}
                className="rounded-full border border-purple/60 bg-purple/10 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-purple/90 hover:bg-purple/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
              >
                {c.askAllow}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
