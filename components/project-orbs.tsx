'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useTexture } from '@react-three/drei'
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  type RapierRigidBody,
} from '@react-three/rapier'
import * as THREE from 'three'

/**
 * Projects & hobby projects as physical, floating 3D nodes — zero gravity,
 * a gentle center-pull plus per-node wander keeps them adrift on screen
 * (same engine as components/tech-orbs.tsx), each now carrying a real,
 * Higgsfield-generated glass-orb badge image instead of a flat color, and
 * a slow constant tumble so they read as floating in 3D rather than just
 * panning across a plane. Hovering brings up a cursor-anchored preview
 * panel (rendered by the parent, outside the canvas, with the project's
 * real screenshot when it has one); clicking asks the parent to open the
 * full detail view.
 */
export type OrbProject = {
  name: string
  tagline: string
  status: string
  hobby?: boolean
  featured?: boolean
  /** Real project screenshot — shown in the cursor-follow preview if set. */
  image?: string
}

/** Higgsfield-generated glass-orb badge per project, keyed by name — a
 *  distinct visual identity per node instead of a flat tinted sphere. */
const ORB_IMAGES: Record<string, string> = {
  GuardianGrid: '/projects/orbs/guardiangrid.png',
  'TaxiBB Essen': '/projects/orbs/taxibb.png',
  StudyForge: '/projects/orbs/studyforge.png',
  'Team Operations Suite': '/projects/orbs/team-ops.png',
  'Automation Systems': '/projects/orbs/automation.png',
  Bewerbungsbot: '/projects/orbs/bewerbungsbot.png',
}
const FALLBACK_ORB_IMAGE = '/projects/orbs/guardiangrid.png'

const geometry = new THREE.IcosahedronGeometry(1, 2)
const edgesGeometry = new THREE.EdgesGeometry(geometry)

function tintFor(p: OrbProject) {
  return p.hobby ? new THREE.Color('#a78bfa') : new THREE.Color('#7da5eb')
}

function Node({
  project,
  seed,
  reduced,
  hovered,
  onHover,
  onExpand,
}: {
  project: OrbProject
  seed: number
  reduced: boolean
  hovered: boolean
  onHover: (v: boolean) => void
  onExpand: () => void
}) {
  const api = useRef<RapierRigidBody>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.LineSegments>(null)
  const vec = useMemo(() => new THREE.Vector3(), [])
  const tint = useMemo(() => tintFor(project), [project])
  const texture = useTexture(ORB_IMAGES[project.name] ?? FALLBACK_ORB_IMAGE)
  const scale = (project.featured ? 1.75 : 1.55) * (hovered ? 1.12 : 1)

  const position = useMemo<[number, number, number]>(() => {
    // Spread nodes around a ring so they start clearly separated — physics
    // (or, in reduced motion, nothing at all) takes it from there.
    const a = seed * 1.9
    return [Math.cos(a) * 5.6, Math.sin(a * 1.3) * 3.2, Math.sin(a * 0.7) * 1.2]
  }, [seed])

  // A slow, constant tumble on top of the physics translation — makes the
  // badge read as genuinely floating in 3D rather than sliding across a
  // flat plane. Set once; Rapier keeps it spinning without any per-frame
  // torque bookkeeping.
  useEffect(() => {
    if (reduced) return
    const rb = api.current
    if (!rb) return
    const s = seed * 7.3
    rb.setAngvel(
      {
        x: (Math.sin(s) * 0.5 + 0.5) * 0.12 + 0.02,
        y: (Math.cos(s * 1.4) * 0.5 + 0.5) * 0.12 + 0.02,
        z: (Math.sin(s * 0.6) * 0.5 + 0.5) * 0.08,
      },
      true,
    )
  }, [reduced, seed])

  useFrame((state, delta) => {
    if (reduced) return
    const rb = api.current
    if (!rb) return
    delta = Math.min(0.1, delta)
    // Gentle center pull keeps the flock readable and on-screen; a slow,
    // low-frequency wander gives each one its own lazy drift in every
    // direction rather than a flat left-right pan.
    const impulse = vec
      .copy(rb.translation() as THREE.Vector3)
      .normalize()
      .multiply(new THREE.Vector3(-3, -3.6, -5))
      .multiplyScalar(delta)
    const t = state.clock.elapsedTime
    impulse.x += Math.sin(t * 0.09 + seed * 2.1) * 4.5 * delta
    impulse.y += Math.cos(t * 0.08 + seed * 1.3) * 4.5 * delta
    impulse.z += Math.sin(t * 0.07 + seed * 0.7) * 2.4 * delta
    rb.applyImpulse(impulse, true)
  })

  return (
    <RigidBody
      ref={api}
      position={position}
      linearDamping={1.4}
      angularDamping={1.1}
      friction={0.3}
      colliders={false}
    >
      <BallCollider args={[2.6]} />
      <mesh ref={meshRef} geometry={geometry} scale={scale}>
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture}
          emissiveIntensity={hovered ? 0.85 : 0.55}
          roughness={0.3}
          metalness={0.15}
        />
      </mesh>
      <lineSegments ref={wireRef} geometry={edgesGeometry} scale={scale * 1.01}>
        <lineBasicMaterial color={tint} transparent opacity={hovered ? 0.85 : 0.4} />
      </lineSegments>

      <Html center distanceFactor={9} zIndexRange={[10, 0]}>
        <div
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
          className={`glass flex cursor-pointer items-center justify-center rounded-full px-4 py-2 text-center transition-all duration-200 ${
            hovered ? 'scale-110 shadow-[0_0_50px_-10px_rgba(167,139,250,0.65)]' : ''
          }`}
          style={{ width: 168, transform: 'translateY(78px)' }}
        >
          <span className="whitespace-nowrap font-semibold tracking-tight text-foreground" style={{ fontSize: 15 }}>
            {project.name}
          </span>
        </div>
      </Html>
    </RigidBody>
  )
}

/** Invisible walls at the viewport edges — nodes roam right up to the rim
 *  of the screen but never leave it. */
function Walls() {
  const { viewport } = useThree()
  const w = viewport.width / 2
  const h = viewport.height / 2
  const t = 2
  return (
    <RigidBody type="fixed" colliders={false} restitution={0.3}>
      <CuboidCollider args={[t, h + 6, 8]} position={[w + t, 0, 0]} />
      <CuboidCollider args={[t, h + 6, 8]} position={[-w - t, 0, 0]} />
      <CuboidCollider args={[w + 6, t, 8]} position={[0, h + t, 0]} />
      <CuboidCollider args={[w + 6, t, 8]} position={[0, -h - t, 0]} />
      <CuboidCollider args={[w + 6, h + 6, t]} position={[0, 0, 3 + t]} />
      <CuboidCollider args={[w + 6, h + 6, t]} position={[0, 0, -3 - t]} />
    </RigidBody>
  )
}

function Scene({
  projects,
  reduced,
  hoveredName,
  onHover,
  onExpand,
}: {
  projects: OrbProject[]
  reduced: boolean
  hoveredName: string | null
  onHover: (name: string | null) => void
  onExpand: (name: string) => void
}) {
  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight position={[10, 12, 8]} intensity={1.6} color="#efeaff" />
      <directionalLight position={[-10, -6, 6]} intensity={0.5} color="#e3edff" />

      <Physics gravity={[0, 0, 0]}>
        <Walls />
        {projects.map((p, i) => (
          <Node
            key={p.name}
            project={p}
            seed={i + 1}
            reduced={reduced}
            hovered={hoveredName === p.name}
            onHover={(v) => onHover(v ? p.name : null)}
            onExpand={() => onExpand(p.name)}
          />
        ))}
      </Physics>
    </>
  )
}

/** Cursor-anchored preview panel — rendered outside the R3F canvas as a
 *  plain DOM overlay so it can show a real <img> and track the literal
 *  mouse position (not a 3D-projected one), always offset to the right
 *  of the pointer. */
function HoverPreview({
  project,
  x,
  y,
}: {
  project: OrbProject | null
  x: number
  y: number
}) {
  if (!project) return null
  return (
    <div
      className="glass pointer-events-none absolute left-0 top-0 z-20 w-64 overflow-hidden rounded-2xl shadow-[0_25px_70px_-20px_rgba(0,0,0,0.85)]"
      style={{ transform: `translate3d(${x + 22}px, ${y - 24}px, 0)` }}
    >
      {project.image ? (
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 bg-white/[0.04] px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-purple">
            {project.hobby ? 'Hobby Project' : project.status}
          </span>
        </div>
      )}
      <div className="px-4 py-3">
        <p className="font-semibold tracking-tight text-foreground">{project.name}</p>
        <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
          {project.tagline}
        </p>
      </div>
    </div>
  )
}

export default function ProjectOrbs({
  projects,
  onExpand,
}: {
  projects: OrbProject[]
  onExpand: (name: string) => void
}) {
  const [reduced, setReduced] = useState(false)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  const hoveredProject = projects.find((p) => p.name === hoveredName) ?? null

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full"
      onPointerMove={(e) => {
        const r = wrapRef.current?.getBoundingClientRect()
        if (!r) return
        setPointer({ x: e.clientX - r.left, y: e.clientY - r.top })
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 17], fov: 32.5, near: 1, far: 100 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Scene
            projects={projects}
            reduced={reduced}
            hoveredName={hoveredName}
            onHover={setHoveredName}
            onExpand={onExpand}
          />
        </Suspense>
      </Canvas>

      <HoverPreview project={hoveredProject} x={pointer.x} y={pointer.y} />
    </div>
  )
}
