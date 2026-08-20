import { NextResponse } from 'next/server'

/**
 * Receives the enquiry form and hands it to L.U.K.A.S.
 *
 * It used to send mail through Resend. Mail was the wrong shape for this.
 * A message in an inbox has no state: it is read or unread, it sinks under
 * everything else that arrived that morning, and nothing about it says
 * whether anyone has answered. An enquiry is exactly the kind of thing that
 * needs to keep saying "still open" until it is dealt with.
 *
 * L.U.K.A.S. already has that object. Its dashboard has a Meldungen tab
 * where an item stays OFFEN until it is answered, with the count of open
 * ones next to it. An enquiry lands there and behaves the way an enquiry
 * should — visible at lukas.issahareb.me, with a state, in a place that is
 * checked on purpose rather than by accident.
 *
 * The one rule this route keeps from the mail version: it must never accept
 * a submission it cannot deliver. A form that says "thank you" and drops the
 * message is worse than no form at all, because the visitor believes they
 * have made contact and stops trying. Every failure here is reported as a
 * failure, and the form answers it with a pre-filled mailto — the message
 * still arrives, just by another road.
 */

/** The agent's own origin. Same default as the voice widget, so both halves
 *  of the site talk to the same deployment unless one env var moves them. */
const LUKAS_ORIGIN = (
  process.env.LUKAS_API_ORIGIN ||
  process.env.NEXT_PUBLIC_LUKAS_WIDGET_DOMAIN ||
  'https://portfoliov2-production-992f.up.railway.app'
).replace(/\/+$/, '')

/** Enough to stop a bored script, cheap enough to not need a store. Resets
 *  on deploy, which is fine: this is a doorbell, not a bank. */
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 8
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

/**
 * The four project types the form offers.
 *
 * Checked here as well as on the Lukas side, and not out of distrust of the
 * form: this route is a public HTTP endpoint, and the select element is only
 * where the honest traffic comes from. Anything outside the list is recorded
 * as having no project type rather than rejected — a real person whose
 * request arrives slightly malformed should still reach a human.
 */
const PROJECT_TYPES = [
  'Komplett neue Website',
  'Bestehende Website überarbeiten',
  'Automatisierung',
  'Sichtbarkeit erhöhen',
] as const

export async function POST(request: Request) {
  const ip =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  // Honeypot: a field positioned off-screen and hidden from assistive tech,
  // so only something filling every input reaches this. Answer 200 rather
  // than an error — a bot that learns it was caught comes back adapted.
  if (str(body.website, 200)) return NextResponse.json({ ok: true })

  const name = str(body.name, 120)
  const email = str(body.email, 200)
  const message = str(body.message, 5000)
  const company = str(body.company, 160)
  const rawType = str(body.projectType, 120)
  const projectType =
    PROJECT_TYPES.find((p) => p.toLowerCase() === rawType.toLowerCase()) ?? ''

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 422 })
  }

  const token = process.env.ANFRAGE_TOKEN
  if (!token) {
    // Not configured. Say so, so the form can offer the other road.
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  try {
    /* Ten seconds, then give up and let the visitor use the mailto. Without
       a deadline a hung agent server would hold the form on "sending" until
       the browser gave up on its own, which reads as a broken page. */
    const response = await fetch(`${LUKAS_ORIGIN}/api/public/anfrage`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        firma: company,
        projektart: projectType,
        nachricht: message,
        quelle: request.headers.get('referer') ?? 'issahareb.me/anfrage',
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'send_failed' }, { status: 502 })
    }
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
