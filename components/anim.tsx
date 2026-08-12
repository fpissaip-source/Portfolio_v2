'use client'

import { motion, type Variants } from 'motion/react'
import { Fragment, type ReactNode } from 'react'

const easeOut = [0.22, 1, 0.36, 1] as const

/** Simple fade + rise reveal on scroll into view */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  once = true,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.9, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  )
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.045 },
  },
}

const wordVariant: Variants = {
  hidden: { opacity: 0, y: '0.5em', filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: '0em',
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: easeOut },
  },
}

/** Credit-roll style line reveal: each line rises out of a mask, like film
 *  titles. Use for multi-line cinematic statements. */
export function LineReveal({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.14,
  once = true,
}: {
  lines: ReactNode[]
  className?: string
  lineClassName?: string
  delay?: number
  stagger?: number
  once?: boolean
}) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <motion.span
            className={`block will-transform ${lineClassName ?? ''}`}
            initial={{ y: '110%', opacity: 0.001 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once, margin: '-12% 0px' }}
            transition={{
              duration: 0.9,
              delay: delay + i * stagger,
              ease: easeOut,
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

/** Word-by-word reveal for headlines */
export function WordReveal({
  text,
  className,
  as: Tag = 'h2',
  delay = 0,
  once = true,
}: {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
  once?: boolean
}) {
  const MotionTag = motion[Tag]
  const words = text.split(' ')
  return (
    <MotionTag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: '-15% 0px' }}
      transition={{ delayChildren: delay }}
      aria-label={text}
    >
      {/* The separator is an ordinary space BETWEEN the outer spans, and it
          used to be a non-breaking space INSIDE them.
          Both halves of that were wrong. A U+00A0 is by definition a place
          the browser may not break, and with no whitespace between the
          spans either, a heading had almost no legal break points left. The
          line breaker fell back to squeezing one or two words per line: at
          1920px a seven-word headline in a 1232px box was using 311px of it
          across four lines. Every "five words, three lines" headline on the
          site came from here. */}
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="inline-block overflow-hidden align-bottom" aria-hidden>
            <motion.span className="inline-block will-transform" variants={wordVariant}>
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </Fragment>
      ))}
    </MotionTag>
  )
}
