'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'
import * as THREE from 'three'
import { roleFor, tierFor, ROLE_COLORS, type Tier as SizeTier } from './project-orbs-shared'

/**
 * "Project Constellation" — a deliberately composed system/neuron network,
 * not a bag of randomly floating balls. GuardianGrid is the hub; every
 * other project is a spoke, sized and colored by its real importance.
 * Positions are fixed (not physics-driven); a tiny per-node sinusoidal
 * offset plus a slow constant spin is the only motion, so it reads as
 * "quietly alive" rather than "bouncing around."
 */
export type OrbProject = {
  name: string
  category: string
  tagline: string
  status: string
  stack: string[]
  hobby?: boolean
}

/** Fixed, composed layout — GuardianGrid at the hub, the rest arranged
 *  around it like a pentagon, Automation Systems held slightly further
 *  back as the smallest research node. */
const NODE_POSITIONS: Record<string, [number, number, number]> = {
  GuardianGrid: [0, 1.3, 1.4],
  'TaxiBB Essen': [-4.6, 2.2, -0.8],
  Bewerbungsbot: [4.6, 2.0, -0.6],
  StudyForge: [3.9, -2.4, -1.6],
  'Team Operations Suite': [-3.9, -2.3, -1.4],
  'Automation Systems': [1.9, -2.85, -2.4],
}

const SCALE_FOR_TIER: Record<SizeTier, number> = {
  hero: 2.4,
  large: 1.55,
  medium: 1.15,
  small: 0.85,
}

/** Portrait recomposition of the same constellation for phones — tighter
 *  x-range, taller y-range, same hub-and-spokes hierarchy. Tuned so all
 *  nodes and their name pills project inside a ~342x386 canvas. */
const NODE_POSITIONS_MOBILE: Record<string, [number, number, number]> = {
  GuardianGrid: [0, 0.55, 1.2],
  'TaxiBB Essen': [-2.75, 2.45, -0.8],
  Bewerbungsbot: [2.7, 2.3, -0.6],
  StudyForge: [2.65, -1.9, -1.5],
  'Team Operations Suite': [-2.65, -1.85, -1.3],
  'Automation Systems': [0.85, -3.2, -2.2],
}

export type OrbVariant = 'desktop' | 'mobile'

/** Per-variant tuning. Mobile: smaller nodes, fixed camera (the desktop
 *  dolly formula assumes a wide container), name-only label pills, and a
 *  higher dim floor so non-focused nodes stay visible on a small screen. */
const VARIANTS: Record<
  OrbVariant,
  {
    positions: Record<string, [number, number, number]>
    scaleMul: number
    dimFloor: { wire: number; core: number; ring: number }
    lift: number
    showCategory: boolean
    nameSize: number
    dollyCamera: boolean
    /** On mobile the hub label sits ABOVE its orb (crown position) so the
     *  bottom row of spoke labels has room. */
    hubLabelAbove: boolean
  }
> = {
  desktop: {
    positions: NODE_POSITIONS,
    scaleMul: 1,
    dimFloor: { wire: 0.08, core: 0.08, ring: 0.06 },
    lift: 0.55,
    showCategory: true,
    nameSize: 14,
    dollyCamera: true,
    hubLabelAbove: false,
  },
  mobile: {
    positions: NODE_POSITIONS_MOBILE,
    scaleMul: 0.72,
    dimFloor: { wire: 0.2, core: 0.16, ring: 0.15 },
    lift: 0.35,
    showCategory: false,
    nameSize: 11,
    dollyCamera: false,
    hubLabelAbove: true,
  },
}

function seedFromName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 1000
  return h / 1000
}

const geometry = new THREE.IcosahedronGeometry(1, 1)
const edgesGeometry = new THREE.EdgesGeometry(geometry)
const dotGeometry = new THREE.SphereGeometry(1, 10, 10)
const ringGeometry = new THREE.TorusGeometry(1.35, 0.012, 8, 64)

function Node({
  project,
  hoveredName,
  onHover,
  onExpand,
  expandedName,
  reduced,
  variant,
}: {
  project: OrbProject
  hoveredName: string | null
  onHover: (v: boolean) => void
  onExpand: () => void
  expandedName: string | null
  reduced: boolean
  variant: OrbVariant
}) {
  const outerRef = useRef<THREE.Group>(null)
  const spinRef = useRef<THREE.Group>(null)
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null)
  const wireMatRef = useRef<THREE.LineBasicMaterial>(null)
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const satMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const liftRef = useRef(0)

  const cfg = VARIANTS[variant]
  const basePos = useMemo(
    () => new THREE.Vector3(...(cfg.positions[project.name] ?? [0, 0, 0])),
    [project.name, cfg],
  )
  const role = useMemo(() => roleFor(project), [project.name])
  const colors = ROLE_COLORS[role]
  const scale = SCALE_FOR_TIER[tierFor(project)] * cfg.scaleMul
  const seed = useMemo(() => seedFromName(project.name), [project.name])

  const hovered = hoveredName === project.name
  const anyHovered = hoveredName !== null
  const dimmed = (anyHovered && !hovered) || (expandedName !== null && expandedName !== project.name)

  const satelliteOffsets = useMemo(() => {
    const s = seed * 6.28
    return [
      new THREE.Vector3(Math.cos(s * 1.7) * 1.0 * scale, Math.sin(s * 2.3) * 0.8 * scale, 0.35 * scale),
      new THREE.Vector3(Math.cos(s * 3.1) * -0.95 * scale, Math.sin(s * 1.1) * -0.7 * scale, -0.25 * scale),
    ]
  }, [seed, scale])

  useFrame((state, delta) => {
    const outer = outerRef.current
    const spin = spinRef.current
    if (!outer || !spin) return
    const t = state.clock.elapsedTime
    let floatX = 0
    let floatY = 0
    if (!reduced) {
      spin.rotation.y += delta * 0.055
      spin.rotation.x += delta * 0.018
      floatX = Math.cos(t * 0.2 + seed * 6) * 0.09 * scale
      floatY = Math.sin(t * 0.25 + seed * 6) * 0.13 * scale
    }
    const targetLift = hovered ? cfg.lift : 0
    liftRef.current += (targetLift - liftRef.current) * Math.min(1, delta * 6)
    outer.position.set(basePos.x + floatX, basePos.y + floatY, basePos.z + liftRef.current)

    const k = Math.min(1, delta * 6)
    const targetWire = dimmed ? cfg.dimFloor.wire : hovered ? 0.85 : 0.38
    const targetCore = dimmed ? cfg.dimFloor.core : hovered ? 0.42 : 0.28
    const targetRing = dimmed ? cfg.dimFloor.ring : hovered ? 0.75 : 0.3
    if (wireMatRef.current) wireMatRef.current.opacity += (targetWire - wireMatRef.current.opacity) * k
    if (coreMatRef.current) coreMatRef.current.opacity += (targetCore - coreMatRef.current.opacity) * k
    if (ringMatRef.current) ringMatRef.current.opacity += (targetRing - ringMatRef.current.opacity) * k
    const targetSat = hovered ? 0.6 : 0
    for (const m of satMatRefs.current) {
      if (m) m.opacity += (targetSat - m.opacity) * k
    }
  })

  return (
    <group ref={outerRef} position={basePos}>
      {/* invisible, slightly oversized hit-area so hovering/clicking the
          visible sphere itself (not just the small label chip) drives the
          hover/expand state — the sphere reads much bigger on screen than
          the wireframe edges' actual raycast footprint. */}
      <mesh
        geometry={geometry}
        scale={scale * 1.12}
        onPointerOver={(e) => {
          e.stopPropagation()
          onHover(true)
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          onHover(false)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onExpand()
        }}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <group ref={spinRef}>
        <mesh geometry={geometry} scale={scale}>
          <meshStandardMaterial
            ref={coreMatRef}
            color="#0a0a12"
            emissive={colors.core}
            emissiveIntensity={0.22}
            roughness={0.6}
            metalness={0.1}
            transparent
            opacity={0.28}
          />
        </mesh>
        <lineSegments geometry={edgesGeometry} scale={scale}>
          <lineBasicMaterial ref={wireMatRef} color={colors.ring} transparent opacity={0.38} />
        </lineSegments>
        <mesh geometry={ringGeometry} scale={scale} rotation={[1.15, 0.4, 0]}>
          <meshBasicMaterial ref={ringMatRef} color={colors.ring} transparent opacity={0.3} />
        </mesh>
      </group>

      {/* small glowing center */}
      <mesh geometry={dotGeometry} scale={0.1 * scale}>
        <meshBasicMaterial color={colors.core} transparent opacity={0.9} />
      </mesh>

      {/* backend satellites — near-invisible until this node is hovered */}
      {satelliteOffsets.map((offset, i) => (
        <mesh
          key={i}
          geometry={dotGeometry}
          position={offset}
          scale={0.045 * scale}
        >
          <meshBasicMaterial
            ref={(m) => {
              satMatRefs.current[i] = m
            }}
            color={colors.core}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      <Html
        center
        distanceFactor={8.5}
        zIndexRange={[10, 0]}
        position={[
          0,
          cfg.hubLabelAbove && role === 'hero' ? 1.55 * scale + 0.3 : -1.55 * scale - 0.3,
          0,
        ]}
      >
        <button
          type="button"
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover(true)
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            onHover(false)
          }}
          onClick={(e) => {
            e.stopPropagation()
            onExpand()
          }}
          aria-label={`${project.name}, ${project.category}`}
          className="glass flex cursor-pointer flex-col items-center gap-1 whitespace-nowrap rounded-xl px-3.5 py-2 text-center transition-[transform,opacity] duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            opacity: dimmed ? 0.35 : 1,
            outlineColor: colors.ring,
          }}
        >
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: colors.core, boxShadow: `0 0 6px 1px ${colors.glow}` }}
            />
            <span className="font-semibold tracking-tight text-foreground" style={{ fontSize: cfg.nameSize }}>
              {project.name}
            </span>
          </span>
          {cfg.showCategory && (
            <span
              className="font-mono uppercase tracking-[0.12em] text-muted-foreground"
              style={{ fontSize: 10 }}
            >
              {project.category}
            </span>
          )}
        </button>
      </Html>
    </group>
  )
}

function Connection({
  from,
  to,
  color,
  highlighted,
  reduced,
  phase,
}: {
  from: THREE.Vector3
  to: THREE.Vector3
  color: string
  highlighted: boolean
  reduced: boolean
  phase: number
}) {
  const dotRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    const d = dotRef.current
    if (!d) return
    const t = reduced ? 0.5 : (Math.sin(state.clock.elapsedTime * 0.35 + phase) + 1) / 2
    d.position.lerpVectors(from, to, t)
  })
  return (
    <>
      <Line points={[from, to]} color={color} lineWidth={1} transparent opacity={highlighted ? 0.55 : 0.12} />
      <mesh ref={dotRef} geometry={dotGeometry} scale={0.05}>
        <meshBasicMaterial color={color} transparent opacity={highlighted ? 0.9 : 0.35} />
      </mesh>
    </>
  )
}

function Connections({
  projects,
  hoveredName,
  reduced,
  positions,
}: {
  projects: OrbProject[]
  hoveredName: string | null
  reduced: boolean
  positions: Record<string, [number, number, number]>
}) {
  const hero = projects.find((p) => roleFor(p) === 'hero')
  if (!hero) return null
  const heroPos = new THREE.Vector3(...(positions[hero.name] ?? [0, 0, 0]))
  return (
    <>
      {projects
        .filter((p) => p.name !== hero.name)
        .map((p, i) => {
          const pos = new THREE.Vector3(...(positions[p.name] ?? [0, 0, 0]))
          const highlighted = hoveredName === hero.name || hoveredName === p.name
          const colors = ROLE_COLORS[roleFor(p)]
          return (
            <Connection
              key={p.name}
              from={heroPos}
              to={pos}
              color={colors.ring}
              highlighted={highlighted}
              reduced={reduced}
              phase={i * 1.3}
            />
          )
        })}
    </>
  )
}

/** A handful of small, slow ambient particles for spatial depth — cheap,
 *  static positions, one shared slow rotation. */
function Particles({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const count = 70
    const arr = new Float32Array(count * 3)
    let s = 7
    const rand = () => {
      s = (s * 16807) % 2147483647
      return s / 2147483647
    }
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 24
      arr[i * 3 + 1] = (rand() - 0.5) * 15
      arr[i * 3 + 2] = (rand() - 0.5) * 10 - 3
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (reduced || !ref.current) return
    ref.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#c9d0f0" transparent opacity={0.32} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function Scene({
  projects,
  reduced,
  hoveredName,
  onHover,
  expandedName,
  onExpand,
  dragTarget,
  containerWidth,
  variant,
}: {
  projects: OrbProject[]
  reduced: boolean
  hoveredName: string | null
  onHover: (name: string | null) => void
  expandedName: string | null
  onExpand: (name: string) => void
  dragTarget: React.RefObject<{ yaw: number; pitch: number }>
  containerWidth: number
  variant: OrbVariant
}) {
  const dragGroupRef = useRef<THREE.Group>(null)
  const focusGroupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()

  // The layout's world-space extents are tuned for a wide (~1280px) desktop
  // container. On a narrower tablet container the same extents project
  // closer to the edges — dolly the camera back proportionally so labels
  // keep clear margin instead of clipping against the rounded corners.
  useEffect(() => {
    if (!VARIANTS[variant].dollyCamera) {
      camera.position.z = 15
      if (camera instanceof THREE.PerspectiveCamera) camera.updateProjectionMatrix()
      return
    }
    const baseWidth = 1280
    const z = THREE.MathUtils.clamp(15 * (baseWidth / Math.max(containerWidth, 1)), 15, 24)
    camera.position.z = z
    if (camera instanceof THREE.PerspectiveCamera) camera.updateProjectionMatrix()
  }, [camera, containerWidth, variant])

  useFrame((_, delta) => {
    const dg = dragGroupRef.current
    if (dg) {
      const k = Math.min(1, delta * 4)
      dg.rotation.y += (dragTarget.current.yaw - dg.rotation.y) * k
      dg.rotation.x += (dragTarget.current.pitch - dg.rotation.x) * k
    }
    const fg = focusGroupRef.current
    if (fg) {
      let targetX = 0
      let targetScale = 1
      if (expandedName && variant === 'desktop') {
        const basePos = NODE_POSITIONS[expandedName] ?? [0, 0, 0]
        targetX = -basePos[0] - 1.6
        targetScale = 1.1
      }
      const k = Math.min(1, delta * 4)
      fg.position.x += (targetX - fg.position.x) * k
      const s = fg.scale.x + (targetScale - fg.scale.x) * k
      fg.scale.set(s, s, s)
    }
  })

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[8, 10, 6]} intensity={1.1} color="#e8e4ff" />
      <directionalLight position={[-8, -4, 4]} intensity={0.4} color="#dbe6ff" />
      <Particles reduced={reduced} />
      <group ref={dragGroupRef}>
        <group ref={focusGroupRef}>
          <Connections
            projects={projects}
            hoveredName={hoveredName}
            reduced={reduced}
            positions={VARIANTS[variant].positions}
          />
          {projects.map((p) => (
            <Node
              key={p.name}
              project={p}
              hoveredName={hoveredName}
              onHover={(v) => onHover(v ? p.name : null)}
              onExpand={() => onExpand(p.name)}
              expandedName={expandedName}
              reduced={reduced}
              variant={variant}
            />
          ))}
        </group>
      </group>
    </>
  )
}

/** Cursor-anchored compact preview — name, tagline, up to three stack
 *  items, and a "View project" cue. Text only, per spec (the full media
 *  lives in the click-through detail panel, not the hover preview). */
function HoverPreview({ project, x, y }: { project: OrbProject | null; x: number; y: number }) {
  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass pointer-events-none absolute left-0 top-0 z-20 w-60 rounded-2xl p-4 shadow-[0_25px_70px_-20px_rgba(0,0,0,0.85)]"
          style={{ transform: `translate3d(${x + 22}px, ${y - 20}px, 0)` }}
        >
          <p className="font-semibold tracking-tight text-foreground">{project.name}</p>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
            {project.tagline}
          </p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-purple/80">
            {project.stack.slice(0, 3).join(' · ')}
          </p>
          <p className="mt-2 text-[11px] font-medium text-blue">View project →</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ProjectOrbs({
  projects,
  expandedName,
  onExpand,
  variant = 'desktop',
  activeName = null,
  onContextLost,
}: {
  projects: OrbProject[]
  expandedName: string | null
  onExpand: (name: string) => void
  variant?: OrbVariant
  /** Externally driven focus (e.g. the mobile card carousel) — highlights
   *  that node exactly like a hover, without needing a pointer. */
  activeName?: string | null
  /** Called when the WebGL context is lost, so the parent can swap in a
   *  non-WebGL fallback (mainly relevant for the mobile variant). */
  onContextLost?: () => void
}) {
  const [reduced, setReduced] = useState(false)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [inView, setInView] = useState(true)
  const [containerWidth, setContainerWidth] = useState(1280)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragTarget = useRef({ yaw: 0, pitch: 0 })
  const dragging = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const effectiveHover = hoveredName ?? activeName
  const hoveredProject =
    expandedName || variant !== 'desktop'
      ? null
      : projects.find((p) => p.name === hoveredName) ?? null

  return (
    <div
      ref={wrapRef}
      className={`relative h-full w-full cursor-grab active:cursor-grabbing ${
        variant === 'desktop' ? 'touch-none' : 'touch-pan-y'
      }`}
      onPointerDown={(e) => {
        dragging.current = true
        lastPointer.current = { x: e.clientX, y: e.clientY }
      }}
      onPointerMove={(e) => {
        // Pointer state only feeds the desktop hover preview — skip the
        // re-renders entirely on touch variants.
        if (variant === 'desktop') {
          const r = wrapRef.current?.getBoundingClientRect()
          if (r) setPointer({ x: e.clientX - r.left, y: e.clientY - r.top })
        }
        if (dragging.current && !reduced) {
          const dx = e.clientX - lastPointer.current.x
          const dy = e.clientY - lastPointer.current.y
          lastPointer.current = { x: e.clientX, y: e.clientY }
          dragTarget.current = {
            yaw: THREE.MathUtils.clamp(dragTarget.current.yaw + dx * 0.004, -0.9, 0.9),
            pitch: THREE.MathUtils.clamp(dragTarget.current.pitch + dy * 0.003, -0.35, 0.35),
          }
        }
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
      onPointerLeave={() => {
        dragging.current = false
      }}
      onPointerCancel={() => {
        // iOS fires pointercancel when the browser takes over the gesture
        // (e.g. page scroll with touch-pan-y).
        dragging.current = false
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 15], fov: 34, near: 1, far: 100 }}
        style={{ width: '100%', height: '100%' }}
        frameloop={inView ? 'always' : 'never'}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener(
            'webglcontextlost',
            (e) => {
              e.preventDefault()
              onContextLost?.()
            },
            false,
          )
        }}
      >
        <Suspense fallback={null}>
          <Scene
            projects={projects}
            reduced={reduced}
            hoveredName={effectiveHover}
            onHover={setHoveredName}
            expandedName={expandedName}
            onExpand={onExpand}
            dragTarget={dragTarget}
            containerWidth={containerWidth}
            variant={variant}
          />
        </Suspense>
      </Canvas>

      <HoverPreview project={hoveredProject} x={pointer.x} y={pointer.y} />
    </div>
  )
}
