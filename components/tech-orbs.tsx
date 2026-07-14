'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Physics,
  RigidBody,
  BallCollider,
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

    // Dark glossy base
    const grad = ctx.createRadialGradient(
      size * 0.4,
      size * 0.32,
      size * 0.05,
      size * 0.5,
      size * 0.5,
      size * 0.65,
    )
    grad.addColorStop(0, '#1a1a24')
    grad.addColorStop(0.55, '#0c0c12')
    grad.addColorStop(1, '#050507')
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
      if (tech.tint === 'white') {
        ctx.filter = 'brightness(0) invert(1)'
      }
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
      ctx.filter = 'none'
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

  const position = useMemo<[number, number, number]>(() => {
    // Start scattered outside / below the visible area
    const a = seed * 2.3999
    return [
      Math.cos(a) * 6 + THREE.MathUtils.randFloatSpread(6),
      -8 - Math.random() * 12,
      THREE.MathUtils.randFloatSpread(8),
    ]
  }, [seed])

  useFrame((_, delta) => {
    const rb = api.current
    if (!rb) return
    delta = Math.min(0.1, delta)
    const impulse = vec
      .copy(rb.translation() as THREE.Vector3)
      .normalize()
      .multiply(
        new THREE.Vector3(
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale,
        ),
      )
    rb.applyImpulse(impulse, true)
  })

  return (
    <RigidBody
      ref={api}
      position={position}
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <mesh geometry={sphereGeometry} material={material} scale={scale} />
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
            emissiveIntensity: 0.3,
            metalness: 0.5,
            roughness: 1,
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
      <ambientLight intensity={1} />
      <directionalLight position={[10, 12, 8]} intensity={2} color="#c4b5fd" />
      <directionalLight position={[-10, -6, 6]} intensity={0.6} color="#93c5fd" />

      <Physics gravity={[0, 0, 0]}>
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
