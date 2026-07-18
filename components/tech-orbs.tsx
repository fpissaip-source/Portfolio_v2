'use client'

import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Real-time 3D tech stack: each technology is a sphere with its logo baked
 * onto a dark glossy disc texture, floating in a small hand-rolled physics
 * sim (center pull + wander + pairwise/wall/pointer repulsion) — no physics
 * engine. A `@react-three/rapier` + WASM version of this used to ship a
 * single ~2.2MB chunk (by far the heaviest thing on the page) just for
 * these balls to bounce off each other, and the WASM had to fetch and
 * compile before any of them appeared. This reproduces the same look with
 * plain vector math over the ~20 spheres, which is trivially cheap at that
 * count and has nothing to compile — the balls are ready as soon as their
 * logo textures are.
 *
 * This is the single, real implementation. There is no 2D/DOM fallback and
 * no hardware detection — the scene is intentionally kept lightweight so it
 * runs on real devices in the published site.
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

/** One sphere's simulation state — plain vectors, no physics-engine body. */
type OrbBody = {
  pos: THREE.Vector3
  vel: THREE.Vector3
  scale: number
  seed: number
  spinX: number
  spinY: number
}

/** A wall as a plane (point + outward normal) instead of a physics
 *  collider. Kept as the exact same tilted-frustum-plane geometry as
 *  before: each plane matches the camera's frustum at that edge, so a
 *  ball's surface can rest flush against the visible screen edge at any
 *  depth without a physics engine's collider ever being involved. */
type Wall = { point: THREE.Vector3; normal: THREE.Vector3 }

function makeWalls(viewportWidth: number, viewportHeight: number): Wall[] {
  const w = viewportWidth / 2
  const h = viewportHeight / 2
  const dist = 20 // camera z — matches the Canvas camera below
  const aH = Math.atan(w / dist)
  const aV = Math.atan(h / dist)
  return [
    { point: new THREE.Vector3(w, 0, 0), normal: new THREE.Vector3(Math.cos(aH), 0, Math.sin(aH)) },
    { point: new THREE.Vector3(-w, 0, 0), normal: new THREE.Vector3(-Math.cos(aH), 0, Math.sin(aH)) },
    { point: new THREE.Vector3(0, h, 0), normal: new THREE.Vector3(0, Math.cos(aV), Math.sin(aV)) },
    { point: new THREE.Vector3(0, -h, 0), normal: new THREE.Vector3(0, -Math.cos(aV), Math.sin(aV)) },
    { point: new THREE.Vector3(0, 0, 7), normal: new THREE.Vector3(0, 0, 1) },
    { point: new THREE.Vector3(0, 0, -7), normal: new THREE.Vector3(0, 0, -1) },
  ]
}

const Orb = forwardRef<THREE.Group, { material: THREE.Material; scale: number }>(
  function Orb({ material, scale }, ref) {
    return (
      <group ref={ref}>
        <mesh geometry={sphereGeometry} material={material} scale={scale} />
      </group>
    )
  },
)

function Scene({ count }: { count: number }) {
  const { viewport } = useThree()
  const [materials, setMaterials] = useState<THREE.Material[] | null>(null)
  const groupRefs = useRef<(THREE.Group | null)[]>([])
  const bodies = useRef<OrbBody[]>([])
  const pointerTarget = useRef(new THREE.Vector3())

  // Scratch objects reused every frame — no per-frame allocation for a sim
  // this small (<=20 orbs).
  const scratchDir = useMemo(() => new THREE.Vector3(), [])
  const scratchDelta = useMemo(() => new THREE.Vector3(), [])
  const scratchPointer = useMemo(() => new THREE.Vector3(), [])

  // Spawn area guaranteed to sit inside the tilted frustum walls even on
  // narrow phone viewports. Frozen on mount — resizes move the walls, and
  // the sim then herds the balls, so respawning isn't needed.
  const [bounds] = useState(() => {
    const margin = (half: number) => {
      const a = Math.atan(half / 20) // camera z = 20, matches makeWalls()
      return (1.1 + 1.5 * Math.sin(a)) / Math.cos(a)
    }
    const w = viewport.width / 2
    const h = viewport.height / 2
    return {
      x: Math.max(0.5, (w - margin(w)) / 1.3),
      y: Math.max(0.5, (h - margin(h)) / 1.3),
    }
  })

  const orbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        techIndex: i % TECH.length,
        scale: SCALES[Math.floor(Math.random() * SCALES.length)],
        seed: i + 1,
      })),
    [count],
  )

  // Walls track the live viewport (recompute on resize), same as the
  // physics version's Walls() component did.
  const walls = useMemo(
    () => makeWalls(viewport.width, viewport.height),
    [viewport.width, viewport.height],
  )

  useEffect(() => {
    bodies.current = orbs.map((o) => {
      // Start scattered INSIDE the frustum walls, same distribution as
      // before — the spread scales with the viewport so nothing spawns
      // beyond the side walls on narrow phone screens.
      const a = o.seed * 2.3999
      const pos = new THREE.Vector3(
        Math.cos(a) * bounds.x + THREE.MathUtils.randFloatSpread(bounds.x * 0.6),
        Math.sin(a * 1.7) * bounds.y + THREE.MathUtils.randFloatSpread(bounds.y * 0.6),
        THREE.MathUtils.randFloatSpread(3),
      )
      return {
        pos,
        vel: new THREE.Vector3(),
        scale: o.scale,
        seed: o.seed,
        spinX: 0.12 + 0.1 * Math.sin(o.seed * 3.7),
        spinY: 0.16 + 0.1 * Math.cos(o.seed * 2.1),
      }
    })
  }, [orbs, bounds])

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

  useFrame((state, rawDelta) => {
    const list = bodies.current
    if (!list.length) return
    const delta = Math.min(0.1, rawDelta)
    const t = state.clock.elapsedTime

    // Kinematic pointer target — same lerp-toward-pointer behaviour as the
    // old kinematic RigidBody.
    scratchPointer.set((state.pointer.x * viewport.width) / 2, (state.pointer.y * viewport.height) / 2, 0)
    pointerTarget.current.lerp(scratchPointer, 0.2)

    for (const b of list) {
      // Gentle center pull (keeps the flock on screen) + per-orb wander
      // (keeps everything floating on its own, no pointer needed) — same
      // formula as the old per-frame impulse, applied as acceleration.
      scratchDir.copy(b.pos)
      if (scratchDir.lengthSq() > 1e-6) scratchDir.normalize()
      b.vel.x += (-20 * b.scale * scratchDir.x + Math.sin(t * 0.45 + b.seed * 2.1) * 34 * b.scale) * delta
      b.vel.y += (-24 * b.scale * scratchDir.y + Math.cos(t * 0.38 + b.seed * 1.3) * 34 * b.scale) * delta
      b.vel.z += (-30 * b.scale * scratchDir.z + Math.sin(t * 0.31 + b.seed * 0.7) * 12 * b.scale) * delta

      // Linear damping (matches the old RigidBody's linearDamping: 0.75).
      b.vel.multiplyScalar(Math.exp(-2.2 * delta))

      // Walls — reflect the ball back once its surface reaches the plane.
      for (const wall of walls) {
        const d =
          (b.pos.x - wall.point.x) * wall.normal.x +
          (b.pos.y - wall.point.y) * wall.normal.y +
          (b.pos.z - wall.point.z) * wall.normal.z
        const penetration = d + b.scale
        if (penetration > 0) {
          b.pos.addScaledVector(wall.normal, -penetration)
          const vn = b.vel.dot(wall.normal)
          if (vn > 0) b.vel.addScaledVector(wall.normal, -1.45 * vn)
        }
      }

      // Pointer repulsion — an invisible radius-2 sphere shoves orbs away.
      scratchDelta.copy(b.pos).sub(pointerTarget.current)
      const pDist = scratchDelta.length()
      const pMin = b.scale + 2
      if (pDist < pMin && pDist > 1e-4) {
        scratchDelta.multiplyScalar(1 / pDist)
        b.pos.addScaledVector(scratchDelta, pMin - pDist)
        const vn = b.vel.dot(scratchDelta)
        if (vn < 0) b.vel.addScaledVector(scratchDelta, -1.2 * vn)
      }
    }

    // Pairwise repulsion — soft positional correction + a velocity kick
    // along the collision normal, standing in for rigid-body collision at
    // this orb count (<=20, so this is a trivial O(n^2) pass).
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        scratchDelta.copy(b.pos).sub(a.pos)
        const dist = scratchDelta.length()
        const minDist = a.scale + b.scale
        if (dist < minDist && dist > 1e-4) {
          scratchDelta.multiplyScalar(1 / dist)
          const overlap = (minDist - dist) * 0.5
          a.pos.addScaledVector(scratchDelta, -overlap)
          b.pos.addScaledVector(scratchDelta, overlap)
          const relVel = b.vel.dot(scratchDelta) - a.vel.dot(scratchDelta)
          if (relVel < 0) {
            const impulse = -relVel * 0.5
            a.vel.addScaledVector(scratchDelta, -impulse)
            b.vel.addScaledVector(scratchDelta, impulse)
          }
        }
      }
    }

    // Integrate + push the result straight to each orb's Object3D — no
    // React state/re-render involved.
    for (let i = 0; i < list.length; i++) {
      const b = list[i]
      b.pos.addScaledVector(b.vel, delta)
      const g = groupRefs.current[i]
      if (g) {
        g.position.copy(b.pos)
        g.rotation.x += delta * b.spinX
        g.rotation.y += delta * b.spinY
      }
    }
  })

  if (!materials) return null

  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[10, 12, 8]} intensity={1.7} color="#efeaff" />
      <directionalLight position={[-10, -6, 6]} intensity={0.5} color="#e3edff" />

      {orbs.map((o, i) => (
        <Orb
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
          material={materials[o.techIndex]}
          scale={o.scale}
        />
      ))}
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
