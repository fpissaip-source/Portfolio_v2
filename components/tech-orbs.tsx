'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Physics,
  RigidBody,
  BallCollider,
  CuboidCollider,
  type RapierRigidBody,
} from '@react-three/rapier'
import * as THREE from 'three'

/**
 * Real-time 3D tech stack: each technology is a physical sphere (Rapier
 * RigidBody + BallCollider) with its logo baked onto a dark glossy disc
 * texture. Gravity is zero — every frame a center-seeking impulse pulls the
 * spheres back to the middle, so they gather, collide, spin and bounce. An
 * invisible kinematic collider follows the pointer/finger and shoves them away.
 *
 * This is the single, real implementation. There is no 2D/DOM fallback and no
 * hardware detection — the scene is intentionally kept lightweight so it runs
 * on real devices in the published site.
 */

type Tech = { name: string; logo: string; tint?: 'white' }

const TECH: Tech[] = [
  { name: 'TypeScript', logo: '/logos/typescript.svg' },
  { name: 'JavaScript', logo: '/logos/javascript.svg' },
  { name: 'React', logo: '/logos/react.svg' },
  { name: 'Next.js', logo: '/logos/nextdotjs.svg', tint: 'white' },
  { name: 'Node.js', logo: '/logos/nodedotjs.svg' },
  { name: 'Python', logo: '/logos/python.svg' },
  { name: 'FastAPI', logo: '/logos/fastapi.svg' },
  { name: 'PostgreSQL', logo: '/logos/postgresql.svg' },
  { name: 'Prisma', logo: '/logos/prisma.svg', tint: 'white' },
  { name: 'Redis', logo: '/logos/redis.svg' },
  { name: 'Supabase', logo: '/logos/supabase.svg' },
  { name: 'Docker', logo: '/logos/docker.svg' },
  { name: 'Tailwind CSS', logo: '/logos/tailwindcss.svg' },
  { name: 'Three.js', logo: '/logos/threedotjs.svg', tint: 'white' },
  { name: 'GSAP', logo: '/logos/greensock.svg' },
  { name: 'Framer', logo: '/logos/framer.svg', tint: 'white' },
  { name: 'Git', logo: '/logos/git.svg' },
  { name: 'OpenAI', logo: '/logos/openai.svg', tint: 'white' },
  { name: 'Vercel', logo: '/logos/vercel.svg', tint: 'white' },
]

const SCALES = [0.7, 0.8, 1, 1, 1]

// Shared sphere geometry reused by every orb.
const sphereGeometry = new THREE.SphereGeometry(1, 28, 28)

/** Draw a logo onto a dark glossy disc and return a THREE texture. */
function createLogoTexture(tech: Tech): Promise<THREE.Texture> {
  return new Promise((resolve) => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // White glossy base
    const grad = ctx.createRadialGradient(
      size * 0.4,
      size * 0.32,
      size * 0.05,
      size * 0.5,
      size * 0.5,
      size * 0.65,
    )
    grad.addColorStop(0, '#ffffff')
    grad.addColorStop(0.55, '#f4f5f9')
    grad.addColorStop(1, '#e6e8f0')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    const finish = () => {
      const texture = new THREE.CanvasTexture(canvas)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = 8
      resolve(texture)
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const target = size * 0.46
      const ratio = Math.min(target / img.width, target / img.height)
      const w = img.width * ratio
      const h = img.height * ratio
      // Logos keep their original colors — dark marks read fine on the
      // white base (the former white-tint inversion would vanish here).
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
      finish()
    }
    img.onerror = finish
    img.src = tech.logo
  })
}

function Orb({
  material,
  scale,
  seed,
  bounds,
}: {
  material: THREE.Material
  scale: number
  seed: number
  bounds: { x: number; y: number }
}) {
  const api = useRef<RapierRigidBody>(null)
  const vec = useMemo(() => new THREE.Vector3(), [])

  const position = useMemo<[number, number, number]>(() => {
    // Start scattered INSIDE the frustum walls. The spread scales with the
    // viewport — the old fixed ±5/±3 could spawn balls beyond the side
    // walls on narrow phone screens, stranding them off screen for good.
    const a = seed * 2.3999
    return [
      Math.cos(a) * bounds.x + THREE.MathUtils.randFloatSpread(bounds.x * 0.6),
      Math.sin(a * 1.7) * bounds.y + THREE.MathUtils.randFloatSpread(bounds.y * 0.6),
      THREE.MathUtils.randFloatSpread(3),
    ]
  }, [seed, bounds])

  useFrame((state, delta) => {
    const rb = api.current
    if (!rb) return
    delta = Math.min(0.1, delta)
    // Gentle center pull keeps the flock on screen; the viewport walls stop
    // them exactly at the frame edge, so they roam the full screen.
    const impulse = vec
      .copy(rb.translation() as THREE.Vector3)
      .normalize()
      .multiply(
        new THREE.Vector3(
          -20 * delta * scale,
          -24 * delta * scale,
          -30 * delta * scale,
        ),
      )
    // Per-orb wander keeps everything floating on its own, no pointer needed.
    const t = state.clock.elapsedTime
    impulse.x += Math.sin(t * 0.45 + seed * 2.1) * 34 * delta * scale
    impulse.y += Math.cos(t * 0.38 + seed * 1.3) * 34 * delta * scale
    impulse.z += Math.sin(t * 0.31 + seed * 0.7) * 12 * delta * scale
    rb.applyImpulse(impulse, true)
  })

  return (
    <RigidBody
      ref={api}
      position={position}
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      restitution={0.45}
      ccd
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <mesh geometry={sphereGeometry} material={material} scale={scale} />
    </RigidBody>
  )
}

/** Invisible walls — balls roam right up to the rim of the screen but never
 *  leave it (and bounce off, rather than stopping dead).
 *
 *  The side walls lie IN the camera's frustum planes (tilted to match the
 *  perspective), their blocking faces flush with the planes, so balls of
 *  any size can roll right up to the visible screen edge at every depth
 *  without ever crossing it.
 *  The previous axis-aligned walls matched the frustum only at z=0 — any
 *  ball drifting toward the camera crossed the narrower frustum there and
 *  got clipped by overflow-hidden at the screen edges, most visibly on
 *  tall/narrow phone viewports. */
function Walls() {
  const { viewport } = useThree()
  const w = viewport.width / 2
  const h = viewport.height / 2
  const dist = 20 // camera z — viewport is measured at the z=0 plane
  const t = 2
  const aH = Math.atan(w / dist)
  const aV = Math.atan(h / dist)
  // Each wall slab is parallel to its frustum plane with its *blocking face
  // lying exactly in the plane*: the centre sits t (the half-thickness)
  // OUTSIDE the plane along its outward normal n = (±cos a, 0, sin a) /
  // (0, ±cos a, sin a). Balls of any radius then rest with their surface
  // flush against the visible screen edge at every depth — no dead margin,
  // no collider protruding into the scene on narrow phone viewports.
  const L = 70
  return (
    <RigidBody type="fixed" colliders={false} restitution={0.45}>
      {/* right / left — frustum side planes */}
      <CuboidCollider
        args={[t, L, L]}
        rotation={[0, -aH, 0]}
        position={[w + t * Math.cos(aH), 0, t * Math.sin(aH)]}
      />
      <CuboidCollider
        args={[t, L, L]}
        rotation={[0, aH, 0]}
        position={[-w - t * Math.cos(aH), 0, t * Math.sin(aH)]}
      />
      {/* top / bottom — frustum planes as well */}
      <CuboidCollider
        args={[L, t, L]}
        rotation={[aV, 0, 0]}
        position={[0, h + t * Math.cos(aV), t * Math.sin(aV)]}
      />
      <CuboidCollider
        args={[L, t, L]}
        rotation={[-aV, 0, 0]}
        position={[0, -h - t * Math.cos(aV), t * Math.sin(aV)]}
      />
      {/* near / far caps */}
      <CuboidCollider args={[w + 6, h + 6, t]} position={[0, 0, 7 + t]} />
      <CuboidCollider args={[w + 6, h + 6, t]} position={[0, 0, -7 - t]} />
    </RigidBody>
  )
}

function Pointer() {
  const ref = useRef<RapierRigidBody>(null)
  const vec = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ pointer, viewport }) => {
    const target = new THREE.Vector3(
      (pointer.x * viewport.width) / 2,
      (pointer.y * viewport.height) / 2,
      0,
    )
    vec.lerp(target, 0.2)
    ref.current?.setNextKinematicTranslation(vec)
  })
  return (
    <RigidBody
      type="kinematicPosition"
      colliders={false}
      ref={ref}
      position={[0, 0, 0]}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  )
}

function Scene({ count }: { count: number }) {
  const { viewport } = useThree()
  const [materials, setMaterials] = useState<THREE.Material[] | null>(null)

  // Spawn area guaranteed to sit inside the tilted frustum walls even on
  // narrow phone viewports. Exact against the tilted planes: a centre at
  // offset x with |z| <= 1.5 keeps a full MAX_R sphere inside the frustum
  // when x <= half - (MAX_R + 1.5*sin a)/cos a. Frozen on mount — resizes
  // move the walls, and the physics then herds the balls, so respawning
  // isn't needed. Orb() spreads positions up to bounds * 1.3, hence /1.3.
  const [bounds] = useState(() => {
    const margin = (half: number) => {
      const a = Math.atan(half / 20) // camera z = 20, matches Walls()
      return (1.1 + 1.5 * Math.sin(a)) / Math.cos(a)
    }
    const w = viewport.width / 2
    const h = viewport.height / 2
    return {
      x: Math.max(0.5, (w - margin(w)) / 1.3),
      y: Math.max(0.5, (h - margin(h)) / 1.3),
    }
  })

  useEffect(() => {
    let alive = true
    const created: THREE.Material[] = []
    Promise.all(TECH.map(createLogoTexture)).then((textures) => {
      if (!alive) {
        textures.forEach((t) => t.dispose())
        return
      }
      // One memoized MeshStandardMaterial per logo texture, shared by every
      // orb that uses that technology.
      const mats = textures.map(
        (texture) =>
          new THREE.MeshStandardMaterial({
            map: texture,
            emissive: new THREE.Color('#ffffff'),
            emissiveMap: texture,
            emissiveIntensity: 0.38,
            metalness: 0.08,
            roughness: 0.45,
          }),
      )
      created.push(...mats)
      setMaterials(mats)
    })
    return () => {
      alive = false
      created.forEach((m) => {
        const mm = m as THREE.MeshStandardMaterial
        mm.map?.dispose()
        mm.dispose()
      })
    }
  }, [])

  const orbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        techIndex: i % TECH.length,
        scale: SCALES[Math.floor(Math.random() * SCALES.length)],
        seed: i + 1,
      })),
    [count],
  )

  if (!materials) return null

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[10, 12, 8]} intensity={1.7} color="#efeaff" />
      <directionalLight position={[-10, -6, 6]} intensity={0.5} color="#e3edff" />

      <Physics gravity={[0, 0, 0]}>
        <Walls />
        <Pointer />
        {orbs.map((o, i) => (
          <Orb
            key={i}
            material={materials[o.techIndex]}
            scale={o.scale}
            seed={o.seed}
            bounds={bounds}
          />
        ))}
      </Physics>
    </>
  )
}

export default function TechOrbs() {
  // Max 20 spheres on desktop, max 12 on mobile.
  const [count, setCount] = useState(20)

  useEffect(() => {
    setCount(window.innerWidth < 768 ? 12 : 20)
  }, [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      shadows={false}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Scene count={count} />
    </Canvas>
  )
}
