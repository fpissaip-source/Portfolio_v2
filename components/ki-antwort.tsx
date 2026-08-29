'use client'

import { Reveal } from './anim'
import { useLanguage, useT } from './language-context'

/**
 * Der Beleg zur Behauptung im Abschnitt darüber.
 *
 * `statement.proof` sagt, KI-Antworten würden „nachweislich weit über dem
 * Durchschnitt" optimiert. Nachweislich ist ein grosses Wort, und bis hierher
 * stand kein Nachweis daneben — die Seite behauptete etwas über sich selbst,
 * was man ihr glauben musste. Jetzt steht die Antwort da, die ChatGPT auf die
 * Frage nach dem Namen gibt, samt der Stelle, an der sie sie herhat.
 *
 * Drei Entscheidungen, die hier wichtiger sind als das Aussehen:
 *
 * 1. Es ist kein Bildschirmfoto, sondern echter Text. Ein Bild wäre der
 *    kürzere Weg gewesen und hätte für jeden Crawler nichts enthalten — und
 *    ausgerechnet dieser Abschnitt handelt davon, dass Maschinen die Seite
 *    lesen können.
 * 2. Es ahmt die Oberfläche von ChatGPT nicht nach. Kein Logo, keine
 *    Nachbildung des Fensters, kein Sprechblasen-Grün. Ein Zitat mit
 *    Quellenangabe behauptet, was es ist; eine nachgebaute fremde Oberfläche
 *    behauptet, sie wäre echt.
 * 3. Die Antwort bleibt in jeder Sprachfassung auf Deutsch. Ein übersetztes
 *    Zitat ist keins mehr. In den anderen Sprachen steht ein Satz daneben,
 *    der das sagt.
 *
 * Der helle Grund ist derselbe wie im Abschnitt darüber: die Behauptung und
 * ihr Beleg gehören in denselben Raum. Danach wird die Seite wieder dunkel.
 */
export function KiAntwort() {
  const t = useT()
  const { lang } = useLanguage()
  const k = t.kiAntwort

  return (
    <section className="relative bg-white px-6 pb-24 pt-4 text-black sm:pb-32" aria-label={k.label}>
      <div className="mx-auto max-w-3xl">
        <Reveal y={24}>
          <span className="flex items-center gap-2.5 font-label text-[12px] font-medium uppercase tracking-[0.2em] text-black/45">
            <span aria-hidden className="h-px w-7 shrink-0 bg-black/25" />
            {k.label}
          </span>

          <h2 className="mt-4 max-w-[24ch] text-balance font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.4rem]">
            {k.heading}
          </h2>

          <p className="mt-5 max-w-[56ch] text-pretty text-[17px] leading-[1.6] text-black/65 sm:text-[18px]">
            {k.intro}
          </p>
        </Reveal>

        <Reveal y={28} delay={0.08}>
          {/* `figure`/`blockquote`/`figcaption`: die Auszeichnung sagt selbst,
              dass hier zitiert wird und wer die Quelle ist. Das ist dieselbe
              Aussage wie die sichtbare Zeile darunter, nur für alles, was
              nicht liest, sondern auswertet. */}
          <figure className="mt-9 rounded-2xl border border-black/10 bg-black/[0.03] p-6 sm:p-8">
            <div className="flex justify-end">
              <p className="rounded-2xl border border-dashed border-black/25 px-5 py-2.5 text-[16px] font-medium sm:text-[17px]">
                {k.frage}
              </p>
            </div>

            <blockquote className="mt-6 flex flex-col gap-4 border-l-2 border-black/15 pl-5">
              {k.absaetze.map((absatz) => (
                <p key={absatz} className="text-pretty text-[16px] leading-[1.62] sm:text-[17px]">
                  {absatz}
                </p>
              ))}
            </blockquote>

            <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-black/10 pt-4 text-[14px] text-black/55">
              <cite className="not-italic font-medium text-black/70">{k.quelle}</cite>
              {lang !== 'de' && k.sprachHinweis && (
                <>
                  <span aria-hidden className="h-1 w-1 rounded-full bg-black/25" />
                  <span>{k.sprachHinweis}</span>
                </>
              )}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
