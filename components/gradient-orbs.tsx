'use client'

import { motion } from 'motion/react'

/** Soft floating gradient orbs — GPU transforms only. */
export function GradientOrbs() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute left-[10%] top-[12%] h-[36rem] w-[36rem] rounded-full opacity-40 blur-[100px] will-transform"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--blue) 45%, transparent), transparent 70%)',
        }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[8%] top-[28%] h-[30rem] w-[30rem] rounded-full opacity-35 blur-[110px] will-transform"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--purple) 45%, transparent), transparent 70%)',
        }}
        animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent 75%)',
        }}
      />
    </div>
  )
}
