import { NextResponse } from 'next/server'

/**
 * Receives the enquiry form.
 *
 * Delivery goes through Resend, chosen because it is already the mail path
 * in the TaxiBB project and there is no reason to learn a second one.
 *
 * The one thing this route must never do is accept a submission it cannot
 * deliver. A form that returns "thank you" and drops the message is worse
 * than no form: the visitor believes they have made contact and stops
 * trying. So when the key is absent the route says so plainly with a 503,
 * and the form falls back to a pre-filled mailto — the message still
 * reaches its destination, just by a different road.
 */

const TO = 'info@hareb.org'
/** Resend's shared sender needs no domain verification; swap for an address
 *  on hareb.org once that domain is verified there, which also stops these
 *  landing in spam. */
const FROM = 'Anfrage <onboarding@resend.dev>'

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
  const budget = str(body.budget, 60)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 422 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 422 })
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    // Not configured. Say so, so the form can offer the other road.
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const lines = [
    `Name:    ${name}`,
    `E-Mail:  ${email}`,
    company ? `Firma:   ${company}` : null,
    budget ? `Budget:  ${budget}` : null,
    '',
    message,
  ].filter(Boolean)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        // So a reply in the mail client goes to the person, not to Resend.
        reply_to: email,
        subject: `Anfrage über issahareb.me: ${name}`,
        text: lines.join('\n'),
      }),
    })
    if (!response.ok) {
      return NextResponse.json({ error: 'send_failed' }, { status: 502 })
    }
  } catch {
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
