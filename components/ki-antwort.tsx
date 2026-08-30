'use client'

import Image from 'next/image'
import { Reveal } from './anim'
import { useLanguage, useT } from './language-context'

/**
 * Der Beleg zur Behauptung im Abschnitt darüber.
 *
 * `statement.proof` sagt, KI-Antworten würden „nachweislich weit über dem
 * Durchschnitt" optimiert. Nachweislich ist ein grosses Wort, und bis hierher
 * stand kein Nachweis daneben — die Seite behauptete etwas über sich selbst,
 * was man ihr glauben musste. Jetzt steht das Bildschirmfoto da: die Antwort,
 * die ChatGPT auf die Frage nach dem Namen gibt, und darunter die
 * Quellenangabe, die auf diese Seite zeigt.
 *
 * Das Bild ist die Hauptsache, und zwar für Menschen. Ein Kunde, der wissen
 * will, ob hier jemand Ahnung von KI-Sichtbarkeit hat, glaubt einem
 * Bildschirmfoto und keinem Satz darüber.
 *
 * Drei Entscheidungen daneben:
 *
 * 1. Der Wortlaut steht als Abschrift im Dokument, unsichtbar. Ein Bild ist
 *    für alles, was die Seite ausliest statt ansieht, ein leeres Feld — und
 *    ausgerechnet dieser Abschnitt handelt davon, dass Maschinen die Seite
 *    lesen können. Sichtbar wiederholt wird der Text aber nicht: derselbe
 *    Absatz zweimal nebeneinander ist für einen Leser nur Doppelung.
 * 2. Statt der Wiederholung stehen daneben drei Punkte, die sagen, worauf man
 *    achten soll. Das ist das, was an der Antwort für einen Kunden zählt, und
 *    nicht das, was sowieso im Bild steht.
 * 3. Die App-Leiste des Telefons ist aus dem Bild geschnitten. Sie sagt nichts
 *    über die Antwort und machte aus dem Beleg ein fremdes Bedienfeld.
 *
 * Der helle Grund ist derselbe wie im Abschnitt darüber: die Behauptung und
 * ihr Beleg gehören in denselben Raum.
 */
export function KiAntwort() {
  const t = useT()
  const { lang } = useLanguage()
  const k = t.kiAntwort

  return (
    <section className="relative bg-white px-6 pb-24 pt-4 text-black sm:pb-32" aria-label={k.label}>
      <div className="mx-auto max-w-5xl">
        <Reveal y={24}>
          <span className="flex items-center gap-2.5 font-label text-[12px] font-medium uppercase tracking-[0.2em] text-black/45">
            <span aria-hidden className="h-px w-7 shrink-0 bg-black/25" />
            {k.label}
          </span>

          <h2 className="mt-4 max-w-[24ch] text-balance font-display text-[1.75rem] font-semibold leading-[1.12] tracking-tight sm:text-[2.4rem]">
            {k.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid items-start gap-10 md:grid-cols-[minmax(0,340px)_1fr] md:gap-14">
          <Reveal y={28}>
            {/* `figure`/`figcaption`: die Auszeichnung sagt selbst, dass hier
                etwas gezeigt und wer die Quelle ist. */}
            <figure className="m-0">
              <Image
                src="/beleg/chatgpt-issa-hareb.jpg"
                alt={k.bildAlt}
                width={900}
                height={1273}
                sizes="(max-width: 768px) 100vw, 340px"
                className="w-full rounded-2xl border border-black/10 shadow-[0_30px_60px_-32px_rgba(0,0,0,0.45)]"
              />
              <figcaption className="mt-3 text-[13px] leading-[1.5] text-black/50">
                {k.quelle}
                {lang !== 'de' && k.sprachHinweis ? ` · ${k.sprachHinweis}` : ''}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal y={28} delay={0.08}>
            <p className="max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-black/65 sm:text-[18px]">
              {k.intro}
            </p>

            <ul className="mt-7 flex flex-col gap-4">
              {k.punkte.map((punkt) => (
                <li key={punkt} className="flex gap-3.5 text-[16px] leading-[1.5] sm:text-[17px]">
                  <span
                    aria-hidden
                    className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-black/45"
                  />
                  <span className="max-w-[42ch]">{punkt}</span>
                </li>
              ))}
            </ul>

            {/* Die Abschrift. Sie steht im Dokument, aber nicht im Weg: was
                sie sagt, sieht man nebenan im Bild. Für alles, was die Seite
                ausliest statt ansieht, ist sie das Einzige, was ankommt. */}
            <div className="sr-only">
              <p>{k.frage}</p>
              <blockquote>
                {k.absaetze.map((absatz) => (
                  <p key={absatz}>{absatz}</p>
                ))}
              </blockquote>
              <p>{k.quelle}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
