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
}: {
  material: THREE.Material
  scale: number
  seed: number
}) {
  const api = useRef<RapierRigidBody>(null)
  const vec = useMemo(() => new THREE.Vector3(), [])
  const { viewport, camera } = useThree()

  const position = useMemo<[number, number, number]>(() => {
    // Start scattered INSIDE the visible frame (the walls keep them there).
    // The scatter is clamped to the view frustum at the ball's own depth —
    // a fixed spread wider than a narrow phone screen would drop balls
    // outside the frustum walls, where they'd be stuck offscreen forever.
    const a = seed * 2.3999
    const z = THREE.MathUtils.randFloatSpread(6)
    const shrink = (camera.position.z - z) / camera.position.z
    const maxX = Math.max(0, (viewport.width / 2) * shrink - scale)
    const maxY = Math.max(0, (viewport.height / 2) * shrink - scale)
    return [
      THREE.MathUtils.clamp(Math.cos(a) * 5 + THREE.MathUtils.randFloatSpread(4), -maxX, maxX),
      THREE.MathUtils.clamp(Math.sin(a * 1.7) * 3 + THREE.MathUtils.randFloatSpread(3), -maxY, maxY),
      z,
    ]
  }, [seed, scale, viewport.width, viewport.height, camera])

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

/** Invisible walls at the viewport edges — balls roam right up to the rim
 *  of the screen but never leave it (and bounce off it, rather than
 *  stopping dead — the default zero restitution above made a ball that
 *  drifted to the bottom edge just sit there against the floor, which
 *  read as it "disappearing" rather than roaming back into view).
 *
 *  The side/top/bottom walls are tilted to lie exactly on the camera's
 *  view-frustum planes instead of standing straight at the z=0 viewport
 *  rect: the balls roam a ±7 depth range, and a ball near the camera
 *  projects wider than the z=0 rect, so straight walls let it drift
 *  visually past the screen edge — on a narrow phone that read as the
 *  balls being cut off at the sides. A sphere resting against a frustum
 *  plane is tangent to the screen edge at every depth. */
function Walls() {
  const { viewport, camera } = useThree()
  const w = viewport.width / 2
  const h = viewport.height / 2
  const camZ = camera.position.z
  const t = 2
  // Frustum side plane through (±w, ·, 0) and the camera at (0, 0, camZ):
  // tilt angle from the yz-plane, and the plane's outward normal, per axis.
  const phiX = Math.atan(w / camZ)
  const phiY = Math.atan(h / camZ)
  const lenX = Math.hypot(camZ, w)
  const lenY = Math.hypot(camZ, h)
  // Center each wall one half-thickness outside the plane, along its normal.
  const sx = { x: w + (t * camZ) / lenX, z: (t * w) / lenX }
  const sy = { y: h + (t * camZ) / lenY, z: (t * h) / lenY }
  const side = Math.max(w, h) + 14
  return (
    <RigidBody type="fixed" colliders={false} restitution={0.45}>
      <CuboidCollider args={[t, side, side]} position={[sx.x, 0, sx.z]} rotation={[0, -phiX, 0]} />
      <CuboidCollider args={[t, side, side]} position={[-sx.x, 0, sx.z]} rotation={[0, phiX, 0]} />
      <CuboidCollider args={[side, t, side]} position={[0, sy.y, sy.z]} rotation={[phiY, 0, 0]} />
      <CuboidCollider args={[side, t, side]} position={[0, -sy.y, sy.z]} rotation={[-phiY, 0, 0]} />
      <CuboidCollider args={[side, side, t]} position={[0, 0, 7 + t]} />
      <CuboidCollider args={[side, side, t]} position={[0, 0, -7 - t]} />
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
  const [materials, setMaterials] = useState<THREE.Material[] | null>(null)

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
