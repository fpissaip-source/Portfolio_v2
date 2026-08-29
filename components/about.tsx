'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'motion/react'
import { AboutIntro } from './about-intro'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

/**
 * Eine hochzaehlende Zahl — die im Dokument aber von Anfang an richtig steht.
 *
 * Vorher stand hier `useState(0)`. Das hiess: der Server lieferte `0`, und im
 * ausgelieferten HTML stand woertlich "0+ Gebaute Systeme" und "0
 * Produktbereiche". Nachgemessen am laufenden Server:
 *
 *   Roh-HTML (Server):        0  /  0
 *   nach 500 ms im Browser:   0  /  0
 *   nach 4 s im Browser:     15+ /  7
 *
 * Fuer einen Menschen war das nie sichtbar, weil die Zahlen unterhalb des
 * ersten Bildschirms stehen und laengst hochgezaehlt haben, wenn man dort
 * ankommt. Fuer die Haelfte der Leser dieser Seite ist es aber das Einzige,
 * was ankommt: jeder Crawler, der kein JavaScript ausfuehrt, liest die
 * Nullen — und das sind genau die, die in robots.txt eigens eingeladen
 * werden (GPTBot, ClaudeBot, PerplexityBot und die anderen). Auch Googles
 * erster Durchgang liest das rohe HTML; gerendert wird spaeter und nicht
 * immer.
 *
 * Jetzt steht der Zielwert von der ersten Auslieferung an da. Hochgezaehlt
 * wird nur, wenn die Zahl tatsaechlich ins Bild kommt — der blinde
 * 2,5-Sekunden-Wecker von vorher ist weg, denn genau der liess die Zahl auch
 * fuer einen Crawler auf Null springen, der nie in ihre Naehe gescrollt ist.
 * Bei abgeschalteter Bewegung passiert gar nichts, die Zahl steht einfach da.
 */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px -20% 0px' })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(to)

  useEffect(() => {
    if (!inView || reduce) return
    let frame = 0
    const start = performance.now()
    const duration = 1600

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * to))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setValue(to)
    }

    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      /* Wer waehrend des Zaehlens weiterscrollt, soll keine halbe Zahl
         zurueckgelassen bekommen. */
      setValue(to)
    }
  }, [inView, reduce, to])

  return (
    <span ref={ref} className="tabular-nums">
      {value}
      {suffix}
    </span>
  )
}

export function About() {
  const t = useT()

  return (
    <section id="about" className="relative">
      <AboutIntro />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 pb-32 pt-24 lg:grid-cols-[1.08fr_1fr] 2xl:max-w-[96rem]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            label={t.about.kicker}
            heading={t.about.heading}
            description={t.about.intro}
            align="left"
            tone="purple"
            headingClassName="max-w-[30ch] sm:text-4xl md:text-[2.5rem] lg:text-[2.6rem]"
            descriptionClassName="max-w-[46ch]"
          />

          <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-white/10 pt-7">
            <div>
              <dd className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={15} suffix="+" />
              </dd>
              <dt className="mt-1 text-[15px] font-medium tracking-tight text-foreground/72">
                {t.about.stat1Label}
              </dt>
            </div>
            <div>
              <dd className="text-4xl font-semibold tracking-tight text-foreground">
                <Counter to={7} />
              </dd>
              <dt className="mt-1 text-[15px] font-medium tracking-tight text-foreground/72">
                {t.about.stat2Label}
              </dt>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <Reveal y={30}>
            <div className="mb-6">
              <p className="font-label text-[12px] uppercase tracking-[0.22em] text-blue/90 sm:text-[11px]">
                {t.about.storyLabel}
              </p>
              <h3 className="mt-3 text-balance font-display text-2xl font-semibold leading-[1.15] tracking-tight sm:text-3xl">
                {t.about.storyHeading}
              </h3>

              <div className="mt-7 flex flex-col gap-7 border-l border-white/10 pl-6">
                {t.about.story.map((story) => (
                  <article key={story.flag} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full border border-blue/70 bg-background"
                    />
                    <p className="text-xs font-semibold tracking-tight text-purple/85">
                      {story.flag}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                      {story.title}
                    </h4>
                    <p className="mt-2 max-w-[48ch] text-pretty text-[17px] leading-[1.6] text-foreground/80">
                      {story.body}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="mt-3">
            {t.about.pillars.map((pillar, index) => (
              <Reveal key={pillar.title} delay={Math.min(index, 3) * 0.05} y={24}>
                <article className="group border-t border-white/10 py-7 transition-colors duration-200 hover:border-blue/30">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 max-w-[48ch] text-pretty text-[17px] leading-[1.6] text-foreground/80">
                    {pillar.body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
