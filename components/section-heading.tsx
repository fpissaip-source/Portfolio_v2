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

const toneStyles = {
  blue: {
    dot: 'bg-blue shadow-[0_0_18px_2px_color-mix(in_oklch,var(--blue)_55%,transparent)]',
    lineLeft: 'from-transparent via-blue/55 to-purple/35',
    lineRight: 'from-purple/35 via-blue/55 to-transparent',
  },
  purple: {
    dot: 'bg-purple shadow-[0_0_18px_2px_color-mix(in_oklch,var(--purple)_55%,transparent)]',
    lineLeft: 'from-transparent via-purple/55 to-blue/35',
    lineRight: 'from-blue/35 via-purple/55 to-transparent',
  },
}

export function SectionHeading({
  label,
  heading,
  description,
  align = 'center',
  tone = 'purple',
  className = '',
  headingClassName = '',
  descriptionClassName = '',
}: SectionHeadingProps) {
  const centered = align === 'center'
  const styles = toneStyles[tone]

  return (
    <div
      className={`${centered ? 'items-center text-center' : 'items-start text-left'} flex flex-col ${className}`}
    >
      <Reveal>
        <div className={`flex items-center gap-3 ${centered ? 'justify-center' : ''}`}>
          <span
            aria-hidden
            className={`h-px w-9 bg-gradient-to-r sm:w-12 ${styles.lineLeft}`}
          />
          <span aria-hidden className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`} />
          <span className="text-sm font-medium tracking-[-0.01em] text-foreground/55">
            {label}
          </span>
          {centered && (
            <span
              aria-hidden
              className={`h-px w-9 bg-gradient-to-r sm:w-12 ${styles.lineRight}`}
            />
          )}
        </div>
      </Reveal>

      <WordReveal
        as="h2"
        text={heading}
        className={`mt-5 text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-6xl ${headingClassName}`}
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
