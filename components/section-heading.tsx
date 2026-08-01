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
 * The one section header used site-wide (DESIGN.md §2, §4, §6).
 *
 * Three typographic roles in one block: a mono "instrument" label, a
 * Space Grotesk display heading, and Geist body copy — always in that
 * order, always at the same offsets. That constant is most of what makes
 * the page read as systematic rather than assembled.
 *
 * `tone` is semantic, not decorative: blue = craft (services, work),
 * purple = mind (L.U.K.A.S., AI).
 */
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
            className={`font-mono text-[11px] uppercase tracking-[0.3em] ${
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
        className={`mt-3 text-balance font-display font-semibold text-4xl leading-[1.08] tracking-tight sm:text-6xl ${headingClassName}`}
      />

      {description && (
        <Reveal delay={0.1}>
          <p
            className={`mt-4 max-w-[62ch] text-pretty leading-relaxed text-muted-foreground ${descriptionClassName}`}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
