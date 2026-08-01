/**
 * Consent state for this site.
 *
 * What this site actually does, which is what the categories below are
 * derived from — not from a generic banner template:
 *
 *   • It stores the chosen language under `site-lang` in localStorage. That
 *     is a preference the visitor set themselves, so it is treated as
 *     necessary and is not gated — but it is disclosed rather than hidden.
 *   • **Analytics** is opt-in. An analytics tool typically sets cookies and
 *     records page views, so it must not run before consent and must stop
 *     being loadable when consent is withdrawn. Nothing is loaded until a
 *     tool is actually configured (see components/analytics.tsx) — the
 *     category existing does not mean something is running.
 *   • **L.U.K.A.S.** is opt-in and is asked for *in the section itself*,
 *     right before the visitor starts a conversation, rather than in the
 *     opening banner. Asking about a feature at the moment someone reaches
 *     for it is both easier to understand and a better-informed decision
 *     than a checkbox shown before they know what it is.
 *
 * Consent is stored under `site-consent` with a version. Bumping
 * CONSENT_VERSION invalidates stored answers and asks again — do that when
 * the set of categories or the recipients change, never for a redesign.
 */

/** Bumped to 2 when analytics was added: the set of categories changed, so
 *  previously stored answers no longer cover what is being asked. */
export const CONSENT_VERSION = 2
const STORAGE_KEY = 'site-consent'
const EVENT = 'site-consent-change'

/** The two optional categories; see the note above. */
export type ConsentState = {
  version: number
  /** ISO timestamp of the decision — a consent record is worthless undated. */
  decidedAt: string
  analytics: boolean
  lukas: boolean
}

export type ConsentDecision = Pick<ConsentState, 'analytics' | 'lukas'>

/** `null` = no valid decision stored yet, so the banner must be shown. */
export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (parsed.version !== CONSENT_VERSION) return null
    if (typeof parsed.lukas !== 'boolean') return null
    if (typeof parsed.analytics !== 'boolean') return null
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : '',
      analytics: parsed.analytics,
      lukas: parsed.lukas,
    }
  } catch {
    // Corrupt or unreadable (private mode, storage disabled): ask again
    // rather than assuming consent.
    return null
  }
}

export function writeConsent(decision: ConsentDecision): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    analytics: decision.analytics,
    lukas: decision.lukas,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable — the decision still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }))
  return state
}

/** Records one category without disturbing the other. The banner decides
 *  analytics; the L.U.K.A.S. section decides its own category later, and
 *  must not reset a choice the visitor already made about analytics. */
export function setConsent<K extends keyof ConsentDecision>(key: K, value: boolean) {
  const current = readConsent()
  return writeConsent({
    analytics: current?.analytics ?? false,
    lukas: current?.lukas ?? false,
    [key]: value,
  } as ConsentDecision)
}

/** Clears the decision so the banner returns. Used by "withdraw consent". */
export function resetConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }))
}

export function hasConsent(category: keyof ConsentDecision): boolean {
  return readConsent()?.[category] === true
}

/** Subscribe to decisions. Fires immediately with the current state so a
 *  listener that mounts after the decision still learns about it. */
export function onConsentChange(cb: (state: ConsentState | null) => void) {
  if (typeof window === 'undefined') return () => {}
  cb(readConsent())
  const handler = (e: Event) => cb((e as CustomEvent<ConsentState | null>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}

/** Opens the preferences dialog from anywhere (footer link, privacy page). */
export const OPEN_CONSENT_EVENT = 'site-consent-open'
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))
}
