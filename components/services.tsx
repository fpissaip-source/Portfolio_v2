'use client'

import { Globe, LayoutDashboard, Bot, Rocket, Phone } from 'lucide-react'
import { Reveal } from './anim'
import { useT } from './language-context'
import { SectionHeading } from './section-heading'

const ICONS = [Globe, LayoutDashboard, Bot, Rocket, Phone]

function splitClosingHighlight(copy: string) {
  const colon = copy.indexOf(':')
  if (colon === -1) return { label: '', body: copy }
  return {
    label: copy.slice(0, colon + 1),
    body: copy.slice(colon + 1).trim(),
  }
}

/**
 * A light point that rides the row's own top rule, under the cursor.
 *
 * Adapted from 21st.dev's Border Trail. Upstream animates a dot endlessly
 * around a card's full perimeter; that would be a sixth autonomous motion
 * system in a viewport that already carries CursorGrid, MouseGlow, IonTrail,
 * the film grain and the scroll reveals. Here it is pointer-driven and lives
 * on one edge only, so it moves solely in response to the visitor and stops
 * the instant they leave.
 *
 * It sits *on* the rule (`-top-px`, 1px tall), never behind the copy — which
 * is the whole reason this section gets a foreground effect instead of
 * another backdrop: the CursorGrid behind it already puts body text at
 * 4.51:1 against a 4.5 floor, so there is no contrast left to spend.
 */
function BorderTrail() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-x-0 -top-px h-px opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
      style={{
        background:
          'radial-gradient(28rem 1px at var(--trail-x, 50%) 50%, color-mix(in oklch, var(--blue) 85%, white), color-mix(in oklch, var(--blue) 45%, transparent) 35%, transparent 70%)',
      }}
    />
  )
}

/** Feeds the hovered row's cursor position to its own trail. Written as a
 *  CSS variable rather than React state so moving the mouse across the list
 *  never triggers a re-render. */
function trackTrail(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  el.style.setProperty('--trail-x', `${e.clientX - el.getBoundingClientRect().left}px`)
}

/**
 * Services as a capability sheet, not a card grid (DESIGN.md §5, §6).
 *
 * The previous 2-column card grid stranded the fifth offering alone in the
 * last row and dressed every item in the same icon-in-a-tinted-circle box —
 * the most template-coded component on the web. A rule-separated list can
 * hold any number of entries without orphaning, and reads as a technical
 * specification: exactly the "instrument, not shop window" posture.
 *
 * No numbering: these are parallel offerings, not a sequence, and numbers
 * would promise an order that does not exist (anti-pattern #4).
 */
export function Services() {
  const t = useT()
  const closingHighlight = splitClosingHighlight(t.services.closingHighlight)

  return (
    <section id="services" className="relative mx-auto max-w-6xl px-6 py-32">
      <SectionHeading
        label={t.services.kicker}
        heading={t.services.heading}
        description={t.services.intro}
        tone="blue"
        align="left"
        className="mb-16 max-w-3xl"
      />

      <div>
        {t.services.items.map((item, i) => {
          const Icon = ICONS[i % ICONS.length]
          return (
            <Reveal key={item.title} delay={Math.min(i, 3) * 0.05} y={24}>
              <article
                onPointerMove={trackTrail}
                className="group relative grid gap-x-10 gap-y-3 border-t border-white/10 py-8 transition-colors duration-200 hover:border-blue/30 sm:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] sm:py-10"
              >
                <BorderTrail />
                <div className="flex items-start gap-3">
                  <Icon
                    className="mt-1 h-4 w-4 shrink-0 text-blue/70 transition-colors duration-200 group-hover:text-blue"
                    aria-hidden
                  />
                  <h3 className="text-balance text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                    {item.title}
                  </h3>
                </div>
                <div className="max-w-[62ch]">
                  {/* The lead is the anchor: five short outcome lines the eye
                      can take in at a glance. Previously each row held one
                      prose paragraph of near-identical length, which gave a
                      reader no entry point and nothing to skip to. */}
                  <p className="text-pretty text-lg font-medium leading-snug tracking-tight text-foreground sm:text-xl">
                    {item.lead}
                  </p>
                  {/* And the capabilities read as what they are — a list —
                      instead of commas inside a sentence. */}
                  {/* Each entry carries its own leading marker rather than a
                      separator between entries: with separators, a wrap left
                      one orphaned at the start of the next line. */}
                  <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                    {item.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                      >
                        <span
                          aria-hidden
                          className="h-1 w-1 shrink-0 rounded-full bg-blue/60 transition-colors duration-200 group-hover:bg-blue"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>

      {/* Closing statement — a field with a heavier rule, not another card.
          It is the section's one moment of emphasis, so it gets the space. */}
      <Reveal delay={0.15} y={24}>
        <div className="mt-20 border-t border-white/20 pt-12">
          <h3 className="max-w-3xl text-balance font-display text-2xl leading-[1.15] tracking-[-0.012em] sm:text-3xl">
            {t.services.closingKicker}
          </h3>

          <p className="mt-5 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground">
            {t.services.closingBody}
          </p>

          <div className="mt-10">
            {closingHighlight.label && (
              <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-purple/90">
                {closingHighlight.label.replace(/:$/, '')}
              </p>
            )}
            <p className="mt-3 max-w-3xl text-balance font-display text-xl leading-snug tracking-[-0.012em] text-foreground sm:text-2xl">
              {closingHighlight.body}
            </p>
            {/* The shortcut for a convinced reader: interest peaks right
                here, the contact section sits six scenes further down —
                bridge it instead of hoping they scroll the whole way. */}
            <a
              href="#contact"
              onClick={(e) => {
                const el = document.getElementById('contact')
                const lenis = (
                  window as unknown as {
                    __lenis?: { scrollTo: (t: Element, o?: object) => void }
                  }
                ).__lenis
                if (el && lenis) {
                  e.preventDefault()
                  lenis.scrollTo(el, { offset: 0 })
                }
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-purple/40 bg-purple/10 px-6 py-3 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-purple/70 hover:bg-purple/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
            >
              {t.services.cta}
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
