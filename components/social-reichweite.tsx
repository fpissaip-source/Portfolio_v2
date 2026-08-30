'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

/**
 * Der Reichweiten-Beleg auf der Startseite.
 *
 * Warum das hier steht: der Rest der Seite verkauft Systeme, durch die
 * Anfragen hereinkommen. Das setzt voraus, dass ueberhaupt jemand kommt.
 * Dieser Abschnitt ist der Teil davor, und er ist der einzige auf der
 * Seite, der nicht mit Code belegt wird, sondern mit Zahlen aus einer
 * fremden Anwendung.
 *
 * Drei Entscheidungen:
 *
 * 1. Die Zahlen stehen als Text neben dem Bildschirmfoto. Ein Bild ist fuer
 *    Google, fuer einen Screenreader und fuer jede Antwortmaschine eine
 *    leere Flaeche, und "5.045 Follower in einem Monat" ist das ganze
 *    Argument. Dieselbe Regel wie beim ChatGPT-Beleg weiter oben.
 *
 * 2. Die Bildschirmfotos haben weissen Grund, die Seite hat schwarzen. Sie
 *    liegen deshalb in einem Rahmen mit hellem Innenfeld statt frei auf der
 *    Flaeche: sie sind ein Zitat aus einer fremden Anwendung und sollen als
 *    solches erkennbar bleiben.
 *
 * 3. Der Einordnungssatz steht vor den Konten, nicht danach. Ohne ihn liest
 *    ein Auftraggeber hier eine Leistung, die er nicht bestellen will; die
 *    Konten sind Versuchsaufbauten, uebertragbar ist die Methode.
 *
 * Kein eigener Hintergrund, kein `Scene`-Rahmen: der Abschnitt haengt
 * zwischen den Leistungen und dem Werdegang und soll dort keinen eigenen
 * Raum aufmachen.
 */
export function SocialReichweite() {
  const t = useT()
  const s = t.social

  return (
    <section
      id="social"
      className="relative mx-auto max-w-7xl px-6 py-32 2xl:max-w-[96rem]"
      aria-label={s.kicker}
    >
      <SectionHeading
        label={s.kicker}
        heading={s.heading}
        description={s.intro}
        tone="purple"
        align="left"
        className="mb-6"
      />

      <Reveal y={20}>
        <p className="max-w-[62ch] text-pretty text-[16px] leading-[1.6] text-foreground/60">
          {s.einordnung}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {s.konten.map((k, i) => (
          <Reveal key={k.handle} delay={i * 0.06} y={26}>
            <article className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <div className="rounded-xl border border-white/10 bg-white p-1.5">
                <Image
                  src={`/social/${i === 0 ? 'lucy-profil' : 'mrhan-profil'}.webp`}
                  alt={k.bildAlt}
                  width={1125}
                  height={542}
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="w-full rounded-lg"
                />
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-tight">
                {k.name} <span className="font-normal text-foreground/50">{k.handle}</span>
              </h3>
              <p className="mt-1 text-[14px] leading-snug text-accent-tint">{k.art}</p>

              {/* `flex-col-reverse`: die Zahl steht oben, das Wort darunter,
                  im Dokument aber zuerst der Begriff und dann sein Wert.
                  Sonst muesste die Beschriftung zweimal dastehen, einmal
                  sichtbar und einmal versteckt, und ein Screenreader laese
                  sie doppelt. */}
              <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
                {k.zahlen.map((z) => (
                  <div key={z.label} className="flex flex-col-reverse">
                    <dt className="mt-1 text-[12px] leading-snug text-foreground/50">{z.label}</dt>
                    <dd className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                      {z.wert}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-16 grid gap-10 border-t border-white/10 pt-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
        <Reveal y={22}>
          <span className="flex items-center gap-2.5 font-label text-[13px] font-medium uppercase tracking-[0.16em] text-accent-tint">
            <span
              aria-hidden
              className="h-px w-7 shrink-0 bg-gradient-to-r from-purple/10 to-purple"
            />
            {s.hookKicker}
          </span>
          <h3 className="mt-4 max-w-[22ch] text-balance font-display text-[1.6rem] font-semibold leading-[1.14] tracking-tight sm:text-[2rem]">
            {s.hookHeading}
          </h3>
        </Reveal>

        <Reveal y={22} delay={0.06}>
          <div className="flex flex-col gap-5">
            {s.hookAbsaetze.map((absatz) => (
              <p
                key={absatz}
                className="max-w-[62ch] text-pretty text-[17px] leading-[1.65] text-foreground/80"
              >
                {absatz}
              </p>
            ))}
          </div>

          <p className="mt-8 max-w-[62ch] text-pretty text-[17px] leading-[1.6] text-foreground">
            {s.ctaText}
          </p>

          <Link
            href="/anfrage"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[16px] font-medium text-foreground/85 transition-colors hover:border-white/40 hover:text-foreground"
          >
            {s.cta} <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
