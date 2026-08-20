'use client'

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { useLanguage } from './language-context'

/**
 * The enquiry form, and the site's first page that collects anything.
 *
 * Every call to action here used to be a bare `mailto:`. On a desktop with
 * no mail client configured that is a dead button, and it leaves no record
 * of who asked for what. Google Ads also needs a page where a customer
 * fills something in; it cannot point at a mail link.
 *
 * The failure path is the part worth reading. If the server has no mail
 * credential it answers 503, and this form then shows the same message as
 * a pre-filled mailto instead of pretending it was sent. A form that says
 * "thank you" and drops the message is worse than no form at all, because
 * the visitor stops trying.
 */

const COPY = {
  de: {
    name: 'Name', email: 'E-Mail', company: 'Firma (optional)',
    budget: 'Budgetrahmen (optional)', budgetAny: 'Noch offen',
    message: 'Worum geht es?',
    messageHint: 'Ein paar Sätze genügen: was du vorhast und bis wann.',
    submit: 'Anfrage senden', sending: 'Wird gesendet…',
    okTitle: 'Angekommen.',
    okBody: 'Ich melde mich innerhalb von 24 Stunden mit einer ehrlichen Einschätzung.',
    failTitle: 'Der Versand klemmt gerade.',
    failBody: 'Damit nichts verloren geht: mit einem Klick als E-Mail senden, die Angaben sind schon eingetragen.',
    failCta: 'Als E-Mail öffnen',
    required: 'Bitte Name, E-Mail und Nachricht ausfüllen.',
    invalidEmail: 'Diese E-Mail-Adresse sieht nicht richtig aus.',
    tooMany: 'Zu viele Anfragen kurz hintereinander. Bitte kurz warten.',
    privacy: 'Deine Angaben werden nur zur Beantwortung dieser Anfrage genutzt.',
  },
  en: {
    name: 'Name', email: 'Email', company: 'Company (optional)',
    budget: 'Budget range (optional)', budgetAny: 'Not decided yet',
    message: 'What is it about?',
    messageHint: 'A few sentences is enough: what you have in mind and by when.',
    submit: 'Send enquiry', sending: 'Sending…',
    okTitle: 'Received.',
    okBody: 'I will come back within 24 hours with an honest assessment.',
    failTitle: 'Sending is stuck right now.',
    failBody: 'So nothing is lost: send it as an email in one click, the details are already filled in.',
    failCta: 'Open as email',
    required: 'Please fill in name, email and message.',
    invalidEmail: 'That email address does not look right.',
    tooMany: 'Too many enquiries in a row. Please wait a moment.',
    privacy: 'Your details are used only to answer this enquiry.',
  },
  es: {
    name: 'Nombre', email: 'Correo', company: 'Empresa (opcional)',
    budget: 'Presupuesto (opcional)', budgetAny: 'Aún sin definir',
    message: '¿De qué se trata?',
    messageHint: 'Bastan unas frases: qué tienes en mente y para cuándo.',
    submit: 'Enviar consulta', sending: 'Enviando…',
    okTitle: 'Recibido.',
    okBody: 'Te respondo en 24 horas con una valoración honesta.',
    failTitle: 'El envío está fallando ahora mismo.',
    failBody: 'Para que no se pierda: envíalo como correo con un clic, los datos ya están puestos.',
    failCta: 'Abrir como correo',
    required: 'Rellena nombre, correo y mensaje.',
    invalidEmail: 'Ese correo no parece correcto.',
    tooMany: 'Demasiadas consultas seguidas. Espera un momento.',
    privacy: 'Tus datos se usan solo para responder a esta consulta.',
  },
} as const

const BUDGETS = ['', '< 2.000 €', '2.000 – 5.000 €', '5.000 – 15.000 €', '> 15.000 €']

const field =
  'w-full rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-[16px] text-foreground placeholder:text-foreground/40 transition-colors focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/20'
const label = 'block text-[15px] font-medium text-foreground/85'

export function EnquiryForm() {
  const { lang } = useLanguage()
  const t = lang === 'es' ? COPY.es : lang === 'en' ? COPY.en : COPY.de

  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle')
  const [error, setError] = useState('')
  const [mailto, setMailto] = useState('')

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>

    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
      setError(t.required)
      return
    }
    setState('sending')

    const buildMailto = () =>
      `mailto:info@hareb.org?subject=${encodeURIComponent(
        `Anfrage über issahareb.me: ${data.name}`,
      )}&body=${encodeURIComponent(
        [
          `Name: ${data.name}`,
          `E-Mail: ${data.email}`,
          data.company ? `Firma: ${data.company}` : '',
          data.budget ? `Budget: ${data.budget}` : '',
          '',
          data.message,
        ]
          .filter(Boolean)
          .join('\n'),
      )}`

    try {
      const response = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        setState('sent')
        return
      }
      const { error: reason } = (await response.json().catch(() => ({}))) as { error?: string }
      if (reason === 'invalid_email') {
        setError(t.invalidEmail)
        setState('idle')
        return
      }
      if (reason === 'missing_fields') {
        setError(t.required)
        setState('idle')
        return
      }
      if (response.status === 429) {
        setError(t.tooMany)
        setState('idle')
        return
      }
      setMailto(buildMailto())
      setState('fallback')
    } catch {
      setMailto(buildMailto())
      setState('fallback')
    }
  }

  if (state === 'sent') {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#050505]">
          <Check className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em]">{t.okTitle}</h2>
        <p className="mt-2 max-w-[46ch] text-[17px] leading-[1.6] text-foreground/80">{t.okBody}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {/* Honeypot. Off-screen rather than display:none, which some bots skip,
          and hidden from assistive tech so nobody is ever asked to fill it. */}
      <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="name">{t.name}</label>
          <input id="name" name="name" required autoComplete="name" className={`mt-2 ${field}`} />
        </div>
        <div>
          <label className={label} htmlFor="email">{t.email}</label>
          <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" className={`mt-2 ${field}`} />
        </div>
        <div>
          <label className={label} htmlFor="company">{t.company}</label>
          <input id="company" name="company" autoComplete="organization" className={`mt-2 ${field}`} />
        </div>
        <div>
          <label className={label} htmlFor="budget">{t.budget}</label>
          <select id="budget" name="budget" className={`mt-2 ${field}`} defaultValue="">
            {BUDGETS.map((b) => (
              <option key={b || 'any'} value={b} className="bg-[#15171e]">
                {b || t.budgetAny}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={label} htmlFor="message">{t.message}</label>
        <textarea id="message" name="message" required rows={6} className={`mt-2 ${field} resize-y`} />
        <p className="mt-2 text-[15px] text-foreground/60">{t.messageHint}</p>
      </div>

      {error && (
        <p role="alert" className="text-[15px] font-medium text-red-300">{error}</p>
      )}

      {state === 'fallback' ? (
        <div className="rounded-xl border border-white/20 bg-white/[0.05] p-5">
          <p className="text-[17px] font-semibold text-foreground">{t.failTitle}</p>
          <p className="mt-1.5 max-w-[52ch] text-[16px] leading-[1.55] text-foreground/78">{t.failBody}</p>
          <a
            href={mailto}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-[15px] font-semibold text-[#050505] transition-colors hover:bg-white/90"
          >
            {t.failCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      ) : (
        <button
          type="submit"
          disabled={state === 'sending'}
          className="inline-flex items-center gap-2.5 rounded-lg bg-white px-7 py-3 text-[16px] font-semibold tracking-tight text-[#050505] transition-transform hover:scale-[1.02] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {state === 'sending' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t.sending}
            </>
          ) : (
            <>
              {t.submit}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      )}

      <p className="text-[15px] text-foreground/55">{t.privacy}</p>
    </form>
  )
}
