'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost'

export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
  strength = 0.4,
}: {
  children: ReactNode
  href?: string
  onClick?: () => void
  variant?: Variant
  className?: string
  strength?: number
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  function handleMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  function reset() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={cn(
        'group relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-tight will-transform',
        variant === 'primary'
          ? 'bg-foreground text-background'
          : 'glass text-foreground',
        className,
      )}
    >
      {variant === 'primary' && (
        <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 [box-shadow:0_0_40px_-4px_var(--blue)]" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.a>
  )
}
