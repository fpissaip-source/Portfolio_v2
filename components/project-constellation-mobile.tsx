'use client'

import type { OrbProject } from './project-orbs'
import { roleFor, ROLE_COLORS } from './project-orbs-shared'

/**
 * Mobile alternative to the 3D constellation — a free-floating physics
 * world doesn't translate to touch (no hover, small screens, and the
 * perf budget on real iPhones doesn't love a permanent WebGL render loop
 * for something the user is about to scroll straight past). Instead: a
 * static "hub" visual anchoring the same idea, plus a horizontally
 * scroll-snapping row of project cards in the same wireframe/color
 * language. Tapping a card opens the same detail view as the desktop
 * constellation.
 */
export default function ProjectConstellationMobile({
  projects,
  onExpand,
}: {
  projects: OrbProject[]
  onExpand: (name: string) => void
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-4 py-6">
      {/* Central hub visual — a CSS stand-in for GuardianGrid, the same
          blue-violet gradient role used on desktop, with a faint
          wireframe ring so the aesthetic still reads as "constellation"
          without a live render loop. */}
      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full blur-xl"
          style={{ background: 'radial-gradient(circle, rgba(139,124,246,0.35), transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute inset-2 rounded-full border border-white/15"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0 7px, rgba(255,255,255,0.05) 7px 8px), repeating-linear-gradient(90deg, transparent 0 7px, rgba(255,255,255,0.05) 7px 8px)',
          }}
        />
        <div
          aria-hidden
          className="h-3 w-3 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #7da5eb, #a78bfa)',
            boxShadow: '0 0 18px 4px rgba(139,124,246,0.7)',
          }}
        />
      </div>

      <div className="w-full">
        <ul
          className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {projects.map((p) => {
            const role = roleFor(p)
            const colors = ROLE_COLORS[role]
            return (
              <li key={p.name} className="shrink-0 snap-center">
                <button
                  type="button"
                  onClick={() => onExpand(p.name)}
                  className="glass flex w-[220px] flex-col gap-2 rounded-2xl p-4 text-left transition-transform active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ outlineColor: colors.ring }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: colors.core, boxShadow: `0 0 8px 1px ${colors.glow}` }}
                    />
                    <span className="font-semibold tracking-tight text-foreground">{p.name}</span>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {p.category}
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: colors.ring }}>
                    {p.hobby ? 'Hobby Project' : p.status}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
        Tap a system to inspect
      </span>
    </div>
  )
}
