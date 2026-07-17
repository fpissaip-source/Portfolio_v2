'use client'

import { Component, useEffect, useRef, useState, type ReactNode } from 'react'
import ProjectOrbs, { type OrbProject } from './project-orbs'
import { roleFor, ROLE_COLORS } from './project-orbs-shared'
import { useT } from './language-context'

/**
 * Mobile projects section — the real 3D constellation (same component as
 * desktop, recomposed for portrait), synced with a scroll-snapping card
 * row: swiping the cards highlights the matching node, tapping a node or
 * a card opens the same detail view as on desktop.
 */

/** If WebGL is unavailable on a device, fall back to the previous static
 *  hub visual instead of a crashed section. */
class CanvasBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** The old static hub — kept only as the no-WebGL fallback. */
function StaticHub() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative flex h-28 w-28 items-center justify-center">
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
    </div>
  )
}

/** R3F Canvas init failures happen asynchronously and are NOT reliably
 *  caught by React error boundaries — gate on WebGL support explicitly
 *  before mounting the Canvas at all. */
function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function ProjectConstellationMobile({
  projects,
  onExpand,
}: {
  projects: OrbProject[]
  onExpand: (name: string) => void
}) {
  const t = useT()
  const listRef = useRef<HTMLUListElement>(null)
  const rafRef = useRef(0)
  const [active, setActive] = useState<string | null>(projects[0]?.name ?? null)
  /** null = not yet detected (render the static hub as placeholder),
   *  false = unsupported or context lost (keep static hub). */
  const [webglOk, setWebglOk] = useState<boolean | null>(null)

  useEffect(() => {
    setWebglOk(detectWebGL())
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  /** Highlight the node whose card is closest to the carousel center. */
  const handleScroll = () => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = listRef.current
      if (!el) return
      const mid = el.scrollLeft + el.clientWidth / 2
      let best: string | null = null
      let bestD = Infinity
      for (const li of Array.from(el.children) as HTMLElement[]) {
        const c = li.offsetLeft + li.offsetWidth / 2
        const d = Math.abs(c - mid)
        if (d < bestD) {
          bestD = d
          best = li.dataset.name ?? null
        }
      }
      if (best) setActive(best)
    })
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        {webglOk === true ? (
          <CanvasBoundary fallback={<StaticHub />}>
            <ProjectOrbs
              projects={projects}
              expandedName={null}
              onExpand={onExpand}
              variant="mobile"
              activeName={active}
              onContextLost={() => setWebglOk(false)}
            />
          </CanvasBoundary>
        ) : (
          <StaticHub />
        )}
      </div>

      <div className="shrink-0 pb-4">
        <ul
          ref={listRef}
          onScroll={handleScroll}
          className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="list"
        >
          {projects.map((p) => {
            const colors = ROLE_COLORS[roleFor(p)]
            const isActive = active === p.name
            return (
              <li key={p.name} data-name={p.name} className="shrink-0 snap-center">
                <button
                  type="button"
                  onClick={() => onExpand(p.name)}
                  className="glass flex w-[220px] flex-col gap-2 rounded-2xl p-4 text-left transition-[transform,box-shadow] duration-300 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    outlineColor: colors.ring,
                    boxShadow: isActive
                      ? `0 0 0 1px ${colors.ring}66, 0 0 28px -8px ${colors.glow}`
                      : undefined,
                  }}
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
                    {p.hobby ? t.projects.hobbyProject : p.status}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
          {t.projectOrbsMobile.tapHint}
        </p>
      </div>
    </div>
  )
}
