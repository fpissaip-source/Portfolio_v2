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

/**
 * A deliberately quiet section heading. The old kicker/terminal labels are
 * still accepted in the API so translated dictionaries do not need a schema
 * migration, but they are no longer rendered. Hierarchy now comes only from
 * typography and spacing.
 */
export function SectionHeading({
  heading,
  description,
  align = 'center',
  className = '',
  headingClassName = '',
  descriptionClassName = '',
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <div
      className={`${centered ? 'items-center text-center' : 'items-start text-left'} flex flex-col ${className}`}
    >
      <WordReveal
        as="h2"
        text={heading}
        className={`text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl ${headingClassName}`}
      />

      {description && (
        <Reveal delay={0.1}>
          <p
            className={`mt-6 max-w-2xl text-pretty leading-relaxed text-muted-foreground ${descriptionClassName}`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
