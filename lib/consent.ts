/**
 * Consent state for this site.
 *
 * Two decisions, asked in two different places, stored independently:
 *
 *   • **analytics** — asked by the banner on arrival, the ordinary cookie
 *     question. Nothing is loaded until a tool is actually configured (see
 *     components/analytics.tsx); the category existing does not mean
 *     something is running.
 *   • **lukas** — asked nowhere near the banner. The agent is a feature, not
 *     a tracking cookie, so it is asked for at the moment someone reaches
 *     for it: pressing "talk to L.U.K.A.S." opens a small prompt, and only
 *     an answer there loads anything. It is deliberately absent from the
 *     cookie preferences, where a toggle for it read as a second, unrelated
 *     decision hidden in a list.
 *
 * Both are tri-state on purpose: `null` means "not asked yet" and is what
 * makes each surface know whether it still has a question to put. Coupling
 * them into one boolean pair meant answering the banner also counted as
 * answering for the agent, and vice versa.
 *
 * The chosen language lives under `site-lang` and is not gated: it is a
 * preference the visitor set themselves. It is disclosed, not hidden.
 *
 * Consent is stored under `site-consent` with a version. Bumping
 * CONSENT_VERSION invalidates stored answers and asks again — do that when
 * the set of categories or the recipients change, never for a redesign.
 */

/** 3: the categories became independently answerable (`null` = unanswered),
 *  so a stored v2 record cannot say which questions were actually put. */
export const CONSENT_VERSION = 3
const STORAGE_KEY = 'site-consent'
const EVENT = 'site-consent-change'

export type ConsentCategory = 'analytics' | 'lukas'

/** `null` on a category = never answered; `false` = declined. */
export type ConsentState = {
  version: number
  /** ISO timestamp of the last change — a consent record is worthless undated. */
  decidedAt: string
  analytics: boolean | null
  lukas: boolean | null
}

const readFlag = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null)

/** `null` = nothing valid stored yet, so every question is still open. */
export function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentState>
    if (parsed.version !== CONSENT_VERSION) return null
    return {
      version: CONSENT_VERSION,
      decidedAt: typeof parsed.decidedAt === 'string' ? parsed.decidedAt : '',
      analytics: readFlag(parsed.analytics),
      lukas: readFlag(parsed.lukas),
    }
  } catch {
    // Corrupt or unreadable (private mode, storage disabled): ask again
    // rather than assuming consent.
    return null
  }
}

/** Records one category and leaves the other exactly as it was — including
 *  leaving it unanswered, which is what keeps the banner and the agent
 *  prompt from answering each other's question. */
export function setConsent(category: ConsentCategory, value: boolean | null): ConsentState {
  const current = readConsent()
  const state: ConsentState = {
    version: CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    analytics: current?.analytics ?? null,
    lukas: current?.lukas ?? null,
    [category]: value,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage unavailable — the decision still applies for this page view.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: state }))
  return state
}

/** Clears everything so every question returns. Used by "withdraw consent",
 *  which withdraws all of it — including the agent, which is why the
 *  control says so rather than naming only cookies. */
export function resetConsent() {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to clear */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: null }))
}

/** The stored answer, or `null` if the question has not been put yet. */
export function getConsent(category: ConsentCategory): boolean | null {
  return readConsent()?.[category] ?? null
}

export function hasConsent(category: ConsentCategory): boolean {
  return getConsent(category) === true
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

/** Opens the cookie preferences from anywhere (footer link, privacy page). */
export const OPEN_CONSENT_EVENT = 'site-consent-open'
export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))
}
