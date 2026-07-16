'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
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
 * (same engine as components/tech-orbs.tsx). Each node carries a
 * screen-space `Html` label instead of a baked texture, so the project
 * name/tagline stay real, legible text. Hovering previews a node; clicking
 * it asks the parent to open the full detail view. There is no pointer-
 * repel body here (unlike tech-orbs) — a fleeing target is the last thing
 * you want under a cursor that's trying to click it.
 */
export type OrbProject = {
  name: string
  tagline: string
  status: string
  hobby?: boolean
  featured?: boolean
}

const geometry = new THREE.IcosahedronGeometry(1, 1)
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
  const vec = useMemo(() => new THREE.Vector3(), [])
  const tint = useMemo(() => tintFor(project), [project])
  const scale = project.featured ? 1.15 : 1

  const position = useMemo<[number, number, number]>(() => {
    // Spread nodes around a ring so they start clearly separated — physics
    // (or, in reduced motion, nothing at all) takes it from there. Z stays
    // shallow: a wide depth range makes closer nodes render (and Html-scale)
    // much bigger than farther ones, which visually overlaps their labels
    // even when their real 3D separation is respected.
    const a = seed * 1.9
    return [Math.cos(a) * 5.2, Math.sin(a * 1.3) * 3, Math.sin(a * 0.7) * 0.6]
  }, [seed])

  useFrame((state, delta) => {
    if (reduced) return
    const rb = api.current
    if (!rb) return
    delta = Math.min(0.1, delta)
    // Gentle center pull keeps the flock readable and on-screen; a slow
    // per-node wander gives each one its own lazy drift, much calmer than
    // the tech-stack logo balls since these need to stay legible. Z is
    // pulled back harder than x/y to keep the whole gallery on one shallow
    // depth plane.
    const impulse = vec
      .copy(rb.translation() as THREE.Vector3)
      .normalize()
      .multiply(new THREE.Vector3(-3, -3.6, -9))
      .multiplyScalar(delta)
    const t = state.clock.elapsedTime
    impulse.x += Math.sin(t * 0.18 + seed * 2.1) * 5 * delta
    impulse.y += Math.cos(t * 0.15 + seed * 1.3) * 5 * delta
    impulse.z += Math.sin(t * 0.12 + seed * 0.7) * 0.6 * delta
    rb.applyImpulse(impulse, true)
  })

  return (
    <RigidBody
      ref={api}
      position={position}
      linearDamping={1.4}
      angularDamping={0.6}
      friction={0.3}
      colliders={false}
    >
      <BallCollider args={[2.1]} />
      <mesh
        geometry={geometry}
        scale={scale * (hovered ? 1.15 : 1)}
      >
        <meshStandardMaterial
          color={tint}
          emissive={tint}
          emissiveIntensity={hovered ? 0.9 : 0.5}
          roughness={0.35}
          metalness={0.1}
          transparent
          opacity={0.5}
        />
      </mesh>
      <lineSegments geometry={edgesGeometry} scale={scale * (hovered ? 1.15 : 1)}>
        <lineBasicMaterial color={tint} transparent opacity={hovered ? 0.9 : 0.55} />
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
          className={`glass flex cursor-pointer flex-col items-center gap-1 rounded-2xl px-4 py-2.5 text-center transition-all duration-200 ${
            hovered ? 'scale-110 shadow-[0_0_40px_-8px_rgba(167,139,250,0.55)]' : ''
          }`}
          style={{ width: 168 }}
        >
          <span className="whitespace-nowrap font-semibold tracking-tight text-foreground" style={{ fontSize: 15 }}>
            {project.name}
          </span>
          <span
            className={`overflow-hidden font-mono uppercase tracking-[0.14em] text-muted-foreground transition-all duration-200 ${
              hovered ? 'max-h-8 opacity-100' : 'max-h-0 opacity-0'
            }`}
            style={{ fontSize: 10 }}
          >
            {project.hobby ? 'Hobby Project' : project.status}
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
  const t = 1
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[t, h + 6, 8]} position={[w + t, 0, 0]} />
      <CuboidCollider args={[t, h + 6, 8]} position={[-w - t, 0, 0]} />
      <CuboidCollider args={[w + 6, t, 8]} position={[0, h + t, 0]} />
      <CuboidCollider args={[w + 6, t, 8]} position={[0, -h - t, 0]} />
      <CuboidCollider args={[w + 6, h + 6, t]} position={[0, 0, 1.5 + t]} />
      <CuboidCollider args={[w + 6, h + 6, t]} position={[0, 0, -1.5 - t]} />
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
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 12, 8]} intensity={1.4} color="#efeaff" />
      <directionalLight position={[-10, -6, 6]} intensity={0.45} color="#e3edff" />

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

export default function ProjectOrbs({
  projects,
  onExpand,
}: {
  projects: OrbProject[]
  onExpand: (name: string) => void
}) {
  const [reduced, setReduced] = useState(false)
  const [hoveredName, setHoveredName] = useState<string | null>(null)

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows={false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene
        projects={projects}
        reduced={reduced}
        hoveredName={hoveredName}
        onHover={setHoveredName}
        onExpand={onExpand}
      />
    </Canvas>
  )
}
