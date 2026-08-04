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
      {label && (
        <Reveal>
          <span
            className={`font-mono text-[10px] uppercase tracking-[0.22em] sm:text-[11px] ${
              tone === 'purple' ? 'text-purple/90' : 'text-blue/90'
            }`}
          >
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
