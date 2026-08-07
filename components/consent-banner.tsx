'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { useT } from './language-context'
import { OPEN_CONSENT_EVENT, getConsent, readConsent, resetConsent, setConsent } from '@/lib/consent'

/**
 * Cookie banner + preferences dialog.
 *
 * One question only: the optional, measurement-type cookies. The L.U.K.A.S.
 * agent used to sit here as a second toggle and does not any more — it is a
 * feature, not a tracking cookie, and it is asked for where someone reaches
 * for it (see lukas-consent-prompt.tsx). A list that mixes the two makes
 * both harder to answer.
 *
 * Shown only until the question has been answered, and re-openable from the
 * footer at any time — withdrawing has to be as easy as giving. It is
 * floating chrome over content, so it takes the glass treatment DESIGN.md §5
 * reserves for exactly that.
 *
 * The dialog is a real modal: labelled, focus-trapped, Esc closes, focus
 * returns to whatever opened it. Nothing here is pre-ticked; "reject" is the
 * same size and weight as "accept".
 */
export function ConsentBanner() {
  const t = useT()
  const [decided, setDecided] = useState<boolean | null>(null) // null = not yet read
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [analyticsOn, setAnalyticsOn] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setDecided(getConsent('analytics') !== null)
    setAnalyticsOn(getConsent('analytics') === true)
  }, [])

  // Footer link / privacy page can reopen this at any time.
  useEffect(() => {
    const open = () => {
      openerRef.current = document.activeElement as HTMLElement | null
      setAnalyticsOn(getConsent('analytics') === true)
      setSettingsOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, open)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, open)
  }, [])

  const close = useCallback(() => {
    setSettingsOpen(false)
    openerRef.current?.focus?.()
  }, [])

  const decide = useCallback((analytics: boolean) => {
    // Records this category only: an answer already given about the agent
    // is none of this dialog's business (see setConsent in lib/consent.ts).
    setConsent('analytics', analytics)
    setDecided(true)
    setAnalyticsOn(analytics)
    setSettingsOpen(false)
    openerRef.current?.focus?.()
  }, [])

  const withdraw = useCallback(() => {
    resetConsent()
    setDecided(false)
    setAnalyticsOn(false)
    setSettingsOpen(false)
  }, [])

  // Esc to close + focus trap while the dialog is open.
  useEffect(() => {
    if (!settingsOpen) return
    const node = dialogRef.current
    const sel =
      'a[href],button:not([disabled]),input,[tabindex]:not([tabindex="-1"])'
    node?.querySelector<HTMLElement>(sel)?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
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
  }, [settingsOpen, close])

  const c = t.consent
  const showBanner = decided === false && !settingsOpen

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="region"
            aria-label={c.bannerAria}
            className="glass fixed inset-x-3 bottom-3 z-[120] rounded-2xl p-5 sm:inset-x-auto sm:left-5 sm:bottom-5 sm:max-w-md sm:p-6"
          >
            <p className="font-label text-[12px] uppercase tracking-[0.22em] text-blue/90">
              {c.kicker}
            </p>
            <p className="mt-3 text-pretty text-[16px] leading-[1.6] text-foreground/78">
              {c.bannerBody}{' '}
              <Link
                href="/datenschutz"
                className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-foreground hover:decoration-blue"
              >
                {c.privacyLink}
              </Link>
            </p>
            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
              {/* Reject is the same size and weight as accept — a decline
                  that is visually cheaper than an accept is not a free
                  choice. */}
              <button
                type="button"
                onClick={() => decide(false)}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {c.rejectAll}
              </button>
              <button
                type="button"
                onClick={() => decide(true)}
                className="rounded-full border border-blue/60 bg-blue/10 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-blue/85 hover:bg-blue/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                {c.acceptAll}
              </button>
              <button
                type="button"
                onClick={() => {
                  openerRef.current = document.activeElement as HTMLElement | null
                  setSettingsOpen(true)
                }}
                className="rounded-full px-5 py-2.5 text-[15px] font-medium tracking-tight text-foreground/75 underline decoration-white/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {c.settings}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[130] grid place-items-center bg-black/75 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <motion.div
              ref={dialogRef}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="consent-title"
              onClick={(e) => e.stopPropagation()}
              className="glass max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6 sm:p-7"
              data-lenis-prevent
            >
              <h2
                id="consent-title"
                className="text-2xl font-semibold tracking-tight"
              >
                {c.settingsTitle}
              </h2>
              <p className="mt-2 text-pretty text-[16px] leading-[1.6] text-foreground/78">
                {c.settingsIntro}
              </p>

              {/* Necessary — stated, not offered as a fake choice. */}
              <div className="mt-7 border-t border-white/10 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">
                      {c.necessaryTitle}
                    </h3>
                    <p className="mt-1.5 max-w-[52ch] text-pretty text-[16px] leading-[1.6] text-foreground/78">
                      {c.necessaryBody}
                    </p>
                  </div>
                  <span className="mt-1 shrink-0 font-label text-[12px] uppercase tracking-[0.16em] text-foreground/72">
                    {c.alwaysOn}
                  </span>
                </div>
              </div>

              {/* Analytics — the decision the opening banner is about. */}
              <div className="mt-5 border-t border-white/10 pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold tracking-tight">
                      {c.analyticsTitle}
                    </h3>
                    <p className="mt-1.5 max-w-[52ch] text-pretty text-[16px] leading-[1.6] text-foreground/78">
                      {c.analyticsBody}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsOn}
                    aria-label={c.analyticsToggleAria}
                    onClick={() => setAnalyticsOn((v) => !v)}
                    className={`mt-1 flex h-7 w-12 shrink-0 items-center rounded-full border px-0.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue ${
                      analyticsOn
                        ? 'justify-end border-blue/70 bg-blue/25'
                        : 'justify-start border-white/20 bg-white/5'
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full transition-colors ${
                        analyticsOn ? 'bg-blue' : 'bg-white/40'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                {readConsent() !== null && (
                  <button
                    type="button"
                    onClick={withdraw}
                    className="rounded-full px-5 py-2.5 text-[15px] font-medium tracking-tight text-foreground/75 underline decoration-white/20 underline-offset-4 transition-colors hover:text-foreground hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:mr-auto"
                  >
                    {c.withdraw}
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {c.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => decide(analyticsOn)}
                  className="rounded-full border border-blue/60 bg-blue/10 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-blue/85 hover:bg-blue/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                >
                  {c.save}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
