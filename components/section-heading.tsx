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
            className={`flex items-center gap-2.5 font-label text-sm font-medium uppercase tracking-[0.16em] sm:text-base ${
              tone === 'purple' ? 'text-accent-tint' : 'text-blue'
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
        className={`mt-3.5 text-balance font-display text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-5xl md:text-6xl ${headingClassName}`}
      />

      {/* The paragraph under every section headline. It ran at 16px in
          `--muted-foreground` (5.6:1) with a 60-character measure — small,
          grey and wide, so it read as a caption for the headline instead of
          as the sentence that explains the section. 18/19px, near-white, and
          a shorter line so the eye returns cleanly. */}
      {description && (
        <Reveal delay={0.1}>
          <p
            className={`mt-5 max-w-[46ch] text-pretty text-[18px] leading-[1.6] text-foreground/85 sm:text-[19px] ${descriptionClassName}`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
