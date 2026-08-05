'use client'

import { Reveal, WordReveal } from './anim'

type SectionHeadingProps = {
  label: string
  heading: string
  description?: string
  align?: 'left' | 'center'
  tone?: 'blue' | 'purple'
  className?: string
  headingClassName?: string
  descriptionClassName?: string
}

export function SectionHeading({
  label,
  heading,
  description,
  align = 'center',
  tone = 'blue',
  className = '',
  headingClassName = '',
  descriptionClassName = '',
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={`${centered ? 'items-center text-center' : 'items-start text-left'} flex flex-col ${className}`}
    >
      {/* The section label, with something to hold onto.
          At 10px mono in 90% accent it was the quietest thing on the page —
          a visitor scrolling past a section had nothing that said which
          section it was. It is bigger, at full strength, and sits behind a
          short accent rule that gives it presence without competing with
          the headline underneath. */}
      {label && (
        <Reveal>
          <span
            className={`flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] sm:text-sm ${
              tone === 'purple' ? 'text-purple' : 'text-blue'
            }`}
          >
            <span
              aria-hidden
              className={`h-px w-7 shrink-0 sm:w-9 ${
                tone === 'purple'
                  ? 'bg-gradient-to-r from-purple/10 to-purple'
                  : 'bg-gradient-to-r from-blue/10 to-blue'
              }`}
            />
            {label}
          </span>
        </Reveal>
      )}

      <WordReveal
        as="h2"
        text={heading}
        className={`mt-3 text-balance font-display text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl md:text-6xl ${headingClassName}`}
      />

      {description && (
        <Reveal delay={0.1}>
          <p
            className={`mt-5 max-w-[60ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg ${descriptionClassName}`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
