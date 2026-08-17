'use client'

import { Reveal } from './anim'
import { SectionHeading } from './section-heading'
import { useLanguage } from './language-context'
import { FAQ_DE, FAQ_EN, FAQ_ES, type FaqEntry } from '@/lib/faq'

/**
 * The answers, visible on the page.
 *
 * This section exists for two readers at once. A visitor gets the questions
 * they would otherwise have to send an email to ask. An answer engine gets a
 * block of self-contained question-and-answer pairs it can quote, backed by
 * matching FAQPage structured data in app/layout.tsx.
 *
 * Both read the same source (lib/faq.ts), which is the point: Google only
 * honours FAQ markup whose answers are actually on the page, and markup that
 * claims more than the page shows is the one way to lose the whole graph.
 *
 * Every entry renders, always. A first version showed six and kept the rest
 * behind a "show all" button, which put six questions in the markup that were
 * not in the HTML — measured: 12 in the schema, 6 in the page. Google honours
 * FAQ markup only for content the page actually shows, so that version would
 * have thrown the rich result away. It is also simply better for the reader
 * who came to find out what a website costs.
 */

const COPY = {
  de: {
    kicker: 'Häufige Fragen',
    heading: 'Was Kunden vor dem ersten Gespräch wissen wollen.',
    description:
      'Die Fragen, die am häufigsten kommen, mit ehrlichen Antworten. Wenn deine nicht dabei ist, schreib mir einfach.',
  },
  en: {
    kicker: 'Frequently asked',
    heading: 'What clients want to know before the first conversation.',
    description:
      'The questions that come up most often, answered honestly. If yours is not here, just write to me.',
  },
  es: {
    kicker: 'Preguntas frecuentes',
    heading: 'Lo que los clientes quieren saber antes de la primera conversación.',
    description:
      'Las preguntas más habituales, con respuestas honestas. Si la tuya no está, escríbeme.',
  },
} as const

export function Faq() {
  const { lang } = useLanguage()
  const t = lang === 'es' ? COPY.es : lang === 'en' ? COPY.en : COPY.de
  const entries: FaqEntry[] = lang === 'es' ? FAQ_ES : lang === 'en' ? FAQ_EN : FAQ_DE

  return (
    <section id="faq" className="relative mx-auto max-w-7xl px-6 py-32 2xl:max-w-[96rem]">
      <SectionHeading
        label={t.kicker}
        heading={t.heading}
        description={t.description}
        align="left"
        tone="purple"
        className="mb-14 sm:mb-16"
      />

      <Reveal delay={0.08}>
        <div className="grid gap-x-16 gap-y-10 border-t border-white/10 pt-10 lg:grid-cols-2">
          {entries.map((entry) => (
            <div key={entry.question}>
              {/* A real h3, in document order, with the answer as an ordinary
                  paragraph directly after it. That structure is what makes the
                  pair liftable: the question is the heading of its answer. */}
              <h3 className="font-display text-[19px] font-semibold leading-snug tracking-[-0.01em] text-foreground sm:text-xl">
                {entry.question}
              </h3>
              <p className="mt-2.5 max-w-[58ch] text-pretty text-[17px] leading-[1.6] text-foreground/78">
                {entry.answer}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
