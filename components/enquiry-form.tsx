'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { useLanguage } from './language-context'
import { ProjectTypeSelect, type ProjectOption } from './project-type-select'

/**
 * The enquiry form.
 *
 * Two things drive the shape of it. The first is that a stranger filling
 * this in has already decided to spend effort, and every field is a chance
 * to change their mind — so there are five, one of them optional, and the
 * hardest question ("what do you want?") is answered by picking, not by
 * writing. The budget field is gone: asking a stranger to name a number
 * before they know what the thing costs is the fastest way to lose them,
 * and it can be settled in the first reply.
 *
 * The second is that the button has to answer "am I done?" without the
 * visitor rereading the form. It pulses quietly from the start, and the
 * moment everything required is present it changes colour and pulses
 * harder. That is state made visible, not decoration.
 *
 * The failure path is unchanged and still the part worth reading. If the
 * server cannot pass the enquiry on it answers with an error, and this form
 * offers the same message as a pre-filled mailto instead of pretending it
 * went through. A form that says "thank you" and drops the message is worse
 * than no form at all, because the visitor stops trying.
 */

const COPY = {
  de: {
    name: 'Name',
    email: 'E-Mail',
    company: 'Firma (optional)',
    namePlaceholder: 'Vor- und Nachname',
    emailPlaceholder: 'name@firma.de',
    companyPlaceholder: 'Falls vorhanden',
    projectLabel: 'Worum geht es?',
    projectPlaceholder: 'Projektart wählen',
    message: 'Erzähl mir mehr',
    messagePlaceholder:
      'Was hast du vor, was stört dich an der jetzigen Lösung, bis wann soll es stehen?',
    messageHint: 'Ein paar Sätze genügen. Rückfragen kläre ich in der Antwort.',
    submit: 'Anfrage senden',
    submitReady: 'Anfrage abschicken',
    sending: 'Wird gesendet…',
    progress: 'Noch offen:',
    ready: 'Alles da. Ab damit.',
    okTitle: 'Angekommen.',
    okBody:
      'Deine Anfrage liegt bei mir und ich melde mich innerhalb von 24 Stunden mit einer ehrlichen Einschätzung zu Umfang, Vorgehen und Preis.',
    failTitle: 'Der Versand klemmt gerade.',
    failBody:
      'Damit nichts verloren geht: mit einem Klick als E-Mail senden, die Angaben sind schon eingetragen.',
    failCta: 'Als E-Mail öffnen',
    required: 'Bitte Name, E-Mail, Projektart und Nachricht ausfüllen.',
    invalidEmail: 'Diese E-Mail-Adresse sieht nicht richtig aus.',
    tooMany: 'Zu viele Anfragen kurz hintereinander. Bitte kurz warten.',
    privacy: 'Deine Angaben werden nur zur Beantwortung dieser Anfrage genutzt.',
  },
  en: {
    name: 'Name',
    email: 'Email',
    company: 'Company (optional)',
    namePlaceholder: 'First and last name',
    emailPlaceholder: 'name@company.com',
    companyPlaceholder: 'If you have one',
    projectLabel: 'What is it about?',
    projectPlaceholder: 'Choose a project type',
    message: 'Tell me more',
    messagePlaceholder:
      'What do you have in mind, what bothers you about the current setup, by when does it need to be live?',
    messageHint: 'A few sentences is enough. I will ask the rest in my reply.',
    submit: 'Send enquiry',
    submitReady: 'Send it',
    sending: 'Sending…',
    progress: 'Still missing:',
    ready: 'All set. Send it.',
    okTitle: 'Received.',
    okBody:
      'Your enquiry has reached me and I will come back within 24 hours with an honest assessment of scope, approach and price.',
    failTitle: 'Sending is stuck right now.',
    failBody:
      'So nothing is lost: send it as an email in one click, the details are already filled in.',
    failCta: 'Open as email',
    required: 'Please fill in name, email, project type and message.',
    invalidEmail: 'That email address does not look right.',
    tooMany: 'Too many enquiries in a row. Please wait a moment.',
    privacy: 'Your details are used only to answer this enquiry.',
  },
  es: {
    name: 'Nombre',
    email: 'Correo',
    company: 'Empresa (opcional)',
    namePlaceholder: 'Nombre y apellidos',
    emailPlaceholder: 'nombre@empresa.com',
    companyPlaceholder: 'Si tienes una',
    projectLabel: '¿De qué se trata?',
    projectPlaceholder: 'Elige el tipo de proyecto',
    message: 'Cuéntame más',
    messagePlaceholder:
      '¿Qué tienes en mente, qué te molesta de lo actual, para cuándo lo necesitas?',
    messageHint: 'Bastan unas frases. El resto lo pregunto al responder.',
    submit: 'Enviar consulta',
    submitReady: 'Enviar ahora',
    sending: 'Enviando…',
    progress: 'Todavía falta:',
    ready: 'Todo listo. Envíalo.',
    okTitle: 'Recibido.',
    okBody:
      'Tu consulta ya está conmigo y te respondo en 24 horas con una valoración honesta de alcance, enfoque y precio.',
    failTitle: 'El envío está fallando ahora mismo.',
    failBody:
      'Para que no se pierda: envíalo como correo con un clic, los datos ya están puestos.',
    failCta: 'Abrir como correo',
    required: 'Rellena nombre, correo, tipo de proyecto y mensaje.',
    invalidEmail: 'Ese correo no parece correcto.',
    tooMany: 'Demasiadas consultas seguidas. Espera un momento.',
    privacy: 'Tus datos se usan solo para responder a esta consulta.',
  },
} as const

/**
 * The four options.
 *
 * `value` is German in all three languages on purpose: it is the string that
 * ends up in the subject line of a Meldung that only one person ever reads,
 * and that person reads German. Translating it would mean the same enquiry
 * arrives under four different names depending on the visitor's browser.
 */
const PROJECT_OPTIONS: Record<'de' | 'en' | 'es', readonly ProjectOption[]> = {
  de: [
    {
      value: 'Komplett neue Website',
      title: 'Komplett neue Website',
      detail:
        'Von der ersten Skizze bis zum laufenden Betrieb — inklusive maximaler Auffindbarkeit bei Google und bei ChatGPT, Gemini, Claude & Co.',
    },
    {
      value: 'Bestehende Website überarbeiten',
      title: 'Bestehende Website überarbeiten',
      detail: 'Design, Tempo, Struktur und Technik von dem, was schon da ist.',
    },
    {
      value: 'Automatisierung',
      title: 'Automatisierung',
      detail: 'KI-Agenten und Abläufe, die dir Arbeit dauerhaft abnehmen.',
    },
    {
      value: 'Sichtbarkeit erhöhen',
      title: 'Ausschließlich Sichtbarkeit erhöhen',
      detail: 'Nur Auffindbarkeit: SEO, AEO und GEO für die bestehende Seite.',
    },
  ],
  en: [
    {
      value: 'Komplett neue Website',
      title: 'A completely new website',
      detail:
        'From the first sketch to running in production — including maximum findability on Google and in ChatGPT, Gemini, Claude and the rest.',
    },
    {
      value: 'Bestehende Website überarbeiten',
      title: 'Rework the existing website',
      detail: 'Design, speed, structure and engineering of what is already there.',
    },
    {
      value: 'Automatisierung',
      title: 'Automation',
      detail: 'AI agents and workflows that take work off your hands for good.',
    },
    {
      value: 'Sichtbarkeit erhöhen',
      title: 'Visibility only',
      detail: 'Findability alone: SEO, AEO and GEO for the site you have.',
    },
  ],
  es: [
    {
      value: 'Komplett neue Website',
      title: 'Una web completamente nueva',
      detail:
        'Del primer boceto a la puesta en marcha, con la máxima visibilidad en Google y en ChatGPT, Gemini, Claude y compañía.',
    },
    {
      value: 'Bestehende Website überarbeiten',
      title: 'Renovar la web actual',
      detail: 'Diseño, velocidad, estructura y técnica de lo que ya existe.',
    },
    {
      value: 'Automatisierung',
      title: 'Automatización',
      detail: 'Agentes de IA y flujos que te quitan trabajo de forma duradera.',
    },
    {
      value: 'Sichtbarkeit erhöhen',
      title: 'Solo visibilidad',
      detail: 'Únicamente encontrabilidad: SEO, AEO y GEO para la web actual.',
    },
  ],
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function EnquiryForm() {
  const { lang } = useLanguage()
  const reduce = useReducedMotion()
  const key = lang === 'es' ? 'es' : lang === 'en' ? 'en' : 'de'
  const t = COPY[key]
  const options = PROJECT_OPTIONS[key]

  const [values, setValues] = useState({
    name: '',
    email: '',
    company: '',
    projectType: '',
    message: '',
  })
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'fallback'>('idle')
  const [error, setError] = useState('')
  const [mailto, setMailto] = useState('')

  const set = (field: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [field]: value }))

  /* What is still missing, in the order the form asks for it. Doubles as the
     readiness test and as the list shown next to the button, so the two can
     never disagree — a button that says "ready" while the hint says
     "missing: email" is worse than either alone. */
  const missing = [
    values.name.trim() ? null : t.name,
    EMAIL_RE.test(values.email.trim()) ? null : t.email,
    values.projectType ? null : t.projectLabel,
    values.message.trim().length >= 10 ? null : t.message,
  ].filter(Boolean) as string[]

  const ready = missing.length === 0

  const buildMailto = () =>
    `mailto:info@hareb.org?subject=${encodeURIComponent(
      `Anfrage über issahareb.me: ${values.name}`,
    )}&body=${encodeURIComponent(
      [
        `Name: ${values.name}`,
        `E-Mail: ${values.email}`,
        values.company ? `Firma: ${values.company}` : '',
        values.projectType ? `Projektart: ${values.projectType}` : '',
        '',
        values.message,
      ]
        .filter(Boolean)
        .join('\n'),
    )}`

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!ready) {
      setError(t.required)
      return
    }

    const honeypot = (
      event.currentTarget.elements.namedItem('website') as HTMLInputElement | null
    )?.value

    setState('sending')

    try {
      const response = await fetch('/api/anfrage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot ?? '' }),
      })
      if (response.ok) {
        setState('sent')
        return
      }
      const { error: reason } = (await response.json().catch(() => ({}))) as {
        error?: string
      }
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
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="enquiry-menu p-8 sm:p-10"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent-soft to-purple text-[#0a0410]">
          <Check className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold tracking-[-0.02em]">
          {t.okTitle}
        </h2>
        <p className="mt-3 max-w-[52ch] text-[18px] leading-[1.6] text-foreground/85">
          {t.okBody}
        </p>
      </motion.div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-7" noValidate>
      {/* Honeypot. Off-screen rather than display:none, which some bots skip,
          and hidden from assistive tech so nobody is ever asked to fill it. */}
      <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The choice comes first. It is the question the visitor already has
          an answer to, and answering it makes the rest feel like paperwork
          they have started rather than a form they are facing. */}
      <ProjectTypeSelect
        name="projectType"
        options={options}
        value={values.projectType}
        onChange={set('projectType')}
        label={t.projectLabel}
        placeholder={t.projectPlaceholder}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="enquiry-label" htmlFor="name">
            {t.name}
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder={t.namePlaceholder}
            value={values.name}
            onChange={(e) => set('name')(e.target.value)}
            className={`enquiry-field mt-2.5 ${values.name.trim() ? 'enquiry-field-filled' : ''}`}
          />
        </div>
        <div>
          <label className="enquiry-label" htmlFor="email">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder={t.emailPlaceholder}
            value={values.email}
            onChange={(e) => set('email')(e.target.value)}
            className={`enquiry-field mt-2.5 ${
              EMAIL_RE.test(values.email.trim()) ? 'enquiry-field-filled' : ''
            }`}
          />
        </div>
      </div>

      <div>
        <label className="enquiry-label" htmlFor="company">
          {t.company}
        </label>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          placeholder={t.companyPlaceholder}
          value={values.company}
          onChange={(e) => set('company')(e.target.value)}
          className={`enquiry-field mt-2.5 ${values.company.trim() ? 'enquiry-field-filled' : ''}`}
        />
      </div>

      <div>
        <label className="enquiry-label" htmlFor="message">
          {t.message}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder={t.messagePlaceholder}
          value={values.message}
          onChange={(e) => set('message')(e.target.value)}
          className={`enquiry-field mt-2.5 resize-y ${
            values.message.trim().length >= 10 ? 'enquiry-field-filled' : ''
          }`}
        />
        <p className="mt-2.5 text-[15px] leading-[1.55] text-foreground/60">
          {t.messageHint}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-[16px] font-medium text-red-300">
          {error}
        </p>
      )}

      {state === 'fallback' ? (
        <div className="enquiry-menu p-6">
          <p className="text-[18px] font-semibold text-foreground">{t.failTitle}</p>
          <p className="mt-2 max-w-[52ch] text-[16px] leading-[1.55] text-foreground/80">
            {t.failBody}
          </p>
          <a
            href={mailto}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-[16px] font-semibold text-[#050505] transition-colors hover:bg-white/90"
          >
            {t.failCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button
            type="submit"
            disabled={state === 'sending'}
            /* Not `disabled` while incomplete: a dead button gives no reason
               and cannot be clicked to find out. It stays pressable, and
               pressing it names what is missing. */
            aria-describedby="enquiry-progress"
            className={`enquiry-cta inline-flex items-center gap-2.5 px-8 py-3.5 text-[17px] font-semibold tracking-tight disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
              ready ? 'enquiry-cta-ready' : ''
            }`}
          >
            {state === 'sending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                {t.sending}
              </>
            ) : (
              <>
                {ready ? t.submitReady : t.submit}
                <motion.span
                  aria-hidden
                  animate={reduce || !ready ? { x: 0 } : { x: [0, 4, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex"
                >
                  <ArrowRight className="h-4.5 w-4.5" />
                </motion.span>
              </>
            )}
          </button>

          {/* aria-live so the state change reaches a screen reader too — the
              colour and the pulse carry it for everyone else. */}
          <p
            id="enquiry-progress"
            aria-live="polite"
            className="text-[15px] leading-[1.5] text-foreground/60"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ready ? 'ready' : missing.join('|')}
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                {ready ? (
                  <span className="font-medium text-accent-tint">{t.ready}</span>
                ) : (
                  <>
                    {t.progress} {missing.join(' · ')}
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </p>
        </div>
      )}

      <p className="text-[15px] text-foreground/55">{t.privacy}</p>
    </form>
  )
}
