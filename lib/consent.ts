/**
 * Consent state for this site.
 *
 * What this site actually does, which is what the categories below are
 * derived from — not from a generic banner template:
 *
 *   • It sets **no cookies at all**. There is not a single `document.cookie`
 *     write in the codebase.
 *   • It stores exactly one thing on the device: the chosen language, under
 *     `site-lang` in localStorage. That is a preference the visitor set
 *     themselves, so it is treated as necessary and is not gated — but it is
 *     disclosed rather than hidden.
 *   • There is no analytics and no advertising. @vercel/analytics was
 *     removed; nothing replaced it. So this file deliberately does NOT
 *     invent "Statistics" and "Marketing" toggles: offering a switch for
 *     something that does not exist is a false statement on a page whose
 *     whole purpose is disclosure.
 *
 * That leaves exactly one thing a visitor can meaningfully decide about:
 *
 *   • **L.U.K.A.S.** loads a third-party script from the agent backend, and
 *     in conversation transmits the message text there. In voice mode the
 *     browser opens a WebRTC connection **directly to api.openai.com** and
 *     the microphone audio goes to OpenAI. That is a third-party service
 *     accessing the device and transmitting personal data, so it requires
 *     opt-in consent and must not load until it is given.
 *
 * Consent is stored under `site-consent` with a version. Bumping
 * CONSENT_VERSION invalidates stored answers and asks again — do that when
 * the set of categories or the recipients change, never for a redesign.
 */

export const CONSENT_VERSION = 1
const STORAGE_KEY = 'site-consent'
const EVENT = 'site-consent-change'

/** `lukas` is the only optional category; see the note above. */
export type ConsentState = {
  version: number
  /** ISO timestamp of the decision — a consent record is worthless undated. */
  decidedAt: string
  lukas: boolean
}

export type ConsentDecision = Pick<ConsentState, 'lukas'>

/** `null` = no valid decision stored yet, so the banner must be shown. */
export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (parsed.version !== CONSENT_VERSION) return null
    if (typeof parsed.lukas !== 'boolean') return null
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : '',
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
