'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * L.U.K.A.S. brain interior — a real-time WebGL scene, not footage.
 *
 * The camera lives INSIDE the agent's mind: neurons above, below, behind,
 * everywhere. Five dense neural clusters — one per ability beat — hang in a
 * deep volume. Scroll flies the camera along a spline that dwells at each
 * cluster while its region ignites (nodes flare, local synapses light up,
 * highways to the other brain regions start streaming signals), then rushes
 * to the next region with a speed-kicked FOV, so the transit reads as a hard
 * zoom through tissue rather than a cut.
 *
 * Scroll → scene coupling is a single mutable ref written by the GSAP
 * ScrollTrigger in lukas.tsx (raw section progress, same value that drives
 * the text beats), so camera, glow and copy can never drift apart. Dwells
 * are produced by a piecewise smootherstep p→spline-parameter map anchored
 * exactly on the beat snap points.
 *
 * Everything is additive-blended unlit geometry (points, 1px line segments,
 * sprite halos) — 13 draw calls total, no post-processing — so it holds
 * 60fps on phones. Depth is faked cheaply: exp² fog matched to the page
 * background plus near-camera dissolve for particles flying past the lens.
 */

type ProgressRef = { current: { p: number } }

const BG = '#050505'
const PURPLE = '#a58ad8' // ≈ --purple oklch(0.68 0.11 300)
const BLUE = '#7fa9e8' // ≈ --blue  oklch(0.72 0.11 250)
const FOG_DENSITY = 0.028
const BASE_FOV = 57

/** Region centers — spread across x AND y so travel dips under some regions
 *  and climbs over others: the brain must exist above and below us too. */
const CENTERS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(16, 7, -27),
  new THREE.Vector3(-15, -7, -54),
  new THREE.Vector3(9, 9, -82),
  new THREE.Vector3(-2, -5, -109),
]

/** Camera stations: pulled ~9 units back from each center, each from a
 *  different side, so every arrival composes the region differently. */
const VIEWS = [
  new THREE.Vector3(0, 0.5, 9.2),
  new THREE.Vector3(9, 4.8, -21),
  new THREE.Vector3(-7.8, -3.8, -47.8),
  new THREE.Vector3(3.2, 5.6, -75.6),
  new THREE.Vector3(3, -2, -102),
]
const START = new THREE.Vector3(0, 1.6, 22)
const END = new THREE.Vector3(0.4, -3.6, -104.6)
/** lookAt anchors per p-anchor segment (aligned with pAnchors below). */
const TARGETS = [
  CENTERS[0],
  CENTERS[0],
  CENTERS[1],
  CENTERS[2],
  CENTERS[3],
  CENTERS[4],
  new THREE.Vector3().copy(CENTERS[4]).add(new THREE.Vector3(0, 0.6, -2.4)),
]

const HIGHWAY_PAIRS: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3], [0, 4],
  [1, 2], [1, 3], [1, 4],
  [2, 3], [2, 4],
  [3, 4],
]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smootherstep = (t: number) => {
  const x = Math.max(0, Math.min(1, t))
  return x * x * x * (x * (x * 6 - 15) + 10)
}
const smoothstep = (a: number, b: number, t: number) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

/** Per-cluster dominant hues — alternating purple/blue family with white
 *  lift so the five regions read as distinct areas of one brain. */
function clusterHue(i: number): THREE.Color {
  const purple = new THREE.Color(PURPLE)
  const blue = new THREE.Color(BLUE)
  const c = i % 2 === 0 ? purple.clone() : blue.clone()
  c.lerp(i % 2 === 0 ? blue : purple, (i * 37) % 3 === 0 ? 0.3 : 0.12)
  c.lerp(new THREE.Color('#ffffff'), i === 4 ? 0.3 : 0.08)
  return c
}

// --------------------------------------------------------------------------
// shaders
// --------------------------------------------------------------------------

const pointsVert = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uAct[5];
  uniform float uFog;
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aCluster;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // safe activation lookup: -1 = ambient neuron, masked to zero
    float act = uAct[int(max(aCluster, 0.0) + 0.5)] * step(0.0, aCluster);
    float tw = 0.72 + 0.28 * sin(uTime * (0.5 + aPhase * 1.6) + aPhase * 6.2831);
    float isNode = step(0.0, aCluster);
    float bright = mix(0.5 * tw, tw * (0.34 + act * 1.5), isNode);
    vColor = mix(aColor, vec3(1.0), act * 0.35 * isNode) * bright;
    float dist = max(0.0001, -mv.z);
    float size = aSize * (1.0 + act * 0.65 * isNode);
    gl_PointSize = min(size * uPixelRatio * (150.0 / dist), 240.0 * uPixelRatio);
    float fog = exp(-uFog * uFog * dist * dist);
    float nearFade = smoothstep(1.0, 3.2, dist);
    vAlpha = fog * nearFade;
    gl_Position = projectionMatrix * mv;
  }
`

const pointsFrag = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = 1.0 - smoothstep(0.06, 0.5, d);
    float core = 1.0 - smoothstep(0.0, 0.16, d);
    vec3 col = vColor * (glow * 0.85 + core * 1.35);
    gl_FragColor = vec4(col, vAlpha * glow);
  }
`

/** Shared segment shader for synapses + highways; the traveling bright dot
 *  is computed per-fragment from the along-edge coordinate, so signals
 *  visibly RUN along the connection lines instead of just blinking. */
const makeLineShaders = (actLen: number) => ({
  vert: /* glsl */ `
    uniform float uFog;
    attribute float aT;
    attribute float aK;
    attribute float aPhase;
    attribute vec3 aColor;
    varying vec3 vColor;
    varying float vT;
    varying float vK;
    varying float vPhase;
    varying float vFogA;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vColor = aColor;
      vT = aT;
      vK = aK;
      vPhase = aPhase;
      float dist = max(0.0001, -mv.z);
      float fog = exp(-uFog * uFog * dist * dist);
      vFogA = fog * smoothstep(0.8, 2.6, dist);
      gl_Position = projectionMatrix * mv;
    }
  `,
  frag: /* glsl */ `
    precision mediump float;
    uniform float uTime;
    uniform float uAct[${actLen}];
    uniform float uRepeat;
    uniform float uSpeed;
    uniform float uPulseW;
    uniform float uBase;
    uniform float uActGain;
    uniform float uPulseBase;
    uniform float uPulseGain;
    varying vec3 vColor;
    varying float vT;
    varying float vK;
    varying float vPhase;
    varying float vFogA;
    void main() {
      float act = uAct[int(max(vK, 0.0) + 0.5)] * step(0.0, vK);
      float run = abs(fract(vT * uRepeat - uTime * uSpeed + vPhase) - 0.5);
      float pulse = 1.0 - smoothstep(0.0, uPulseW, run);
      float b = uBase + act * uActGain + pulse * (uPulseBase + act * uPulseGain);
      vec3 col = mix(vColor, vec3(1.0), pulse * 0.55) * b;
      gl_FragColor = vec4(col, vFogA);
    }
  `,
})

// --------------------------------------------------------------------------
// geometry builders (seeded → identical layout every mount)
// --------------------------------------------------------------------------

type BrainData = {
  pointsGeo: THREE.BufferGeometry
  edgeGeo: THREE.BufferGeometry
  highwayGeo: THREE.BufferGeometry
  halos: Array<{ pos: THREE.Vector3; color: THREE.Color; cluster: number; core: boolean }>
}

function buildBrain(dense: boolean): BrainData {
  const rand = mulberry32(42)
  const gauss = () => (rand() + rand() + rand()) / 1.5 - 1 // ~N(0, .33), [-1,1]

  const ambientCount = dense ? 2800 : 1500
  const nodesPerCluster = dense ? 108 : 72
  const ambientEdgeCap = dense ? 1150 : 620

  const purple = new THREE.Color(PURPLE)
  const blue = new THREE.Color(BLUE)

  // ---- points: ambient neurons + cluster nodes in ONE buffer -------------
  const totalPts = ambientCount + nodesPerCluster * CENTERS.length
  const pos = new Float32Array(totalPts * 3)
  const col = new Float32Array(totalPts * 3)
  const size = new Float32Array(totalPts)
  const clu = new Float32Array(totalPts)
  const pha = new Float32Array(totalPts)

  const ambient: THREE.Vector3[] = []
  for (let i = 0; i < ambientCount; i++) {
    let p: THREE.Vector3
    if (rand() < 0.45) {
      // biased toward the flight corridor so transits stream past the lens
      const a = Math.floor(rand() * (CENTERS.length - 1))
      p = new THREE.Vector3()
        .lerpVectors(CENTERS[a], CENTERS[a + 1], rand())
        .add(new THREE.Vector3(gauss() * 13, gauss() * 12, gauss() * 9))
    } else {
      p = new THREE.Vector3(
        (rand() * 2 - 1) * 38,
        (rand() * 2 - 1) * 34,
        30 - rand() * 155,
      )
    }
    ambient.push(p)
    pos.set([p.x, p.y, p.z], i * 3)
    const c = purple.clone().lerp(blue, rand()).multiplyScalar(0.45 + rand() * 0.4)
    col.set([c.r, c.g, c.b], i * 3)
    size[i] = 0.35 + rand() * 0.55
    clu[i] = -1
    pha[i] = rand()
  }

  const clusterNodes: THREE.Vector3[][] = []
  const clusterCols: THREE.Color[][] = []
  for (let ci = 0; ci < CENTERS.length; ci++) {
    const hue = clusterHue(ci)
    const other = ci % 2 === 0 ? blue : purple
    const stretch = new THREE.Vector3(
      1 + rand() * 0.5,
      0.75 + rand() * 0.5,
      1 + rand() * 0.5,
    )
    const nodes: THREE.Vector3[] = []
    const cols: THREE.Color[] = []
    for (let i = 0; i < nodesPerCluster; i++) {
      const p = new THREE.Vector3(gauss(), gauss(), gauss())
        .multiply(stretch)
        .multiplyScalar(5.6)
        .add(CENTERS[ci])
      nodes.push(p)
      const idx = ambientCount + ci * nodesPerCluster + i
      pos.set([p.x, p.y, p.z], idx * 3)
      const c = hue
        .clone()
        .lerp(other, rand() * 0.35)
        .lerp(new THREE.Color('#ffffff'), rand() * 0.22)
      cols.push(c)
      col.set([c.r, c.g, c.b], idx * 3)
      size[idx] = 0.8 + rand() * 0.95
      clu[idx] = ci
      pha[idx] = rand()
    }
    clusterNodes.push(nodes)
    clusterCols.push(cols)
  }

  const pointsGeo = new THREE.BufferGeometry()
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  pointsGeo.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  pointsGeo.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
  pointsGeo.setAttribute('aCluster', new THREE.BufferAttribute(clu, 1))
  pointsGeo.setAttribute('aPhase', new THREE.BufferAttribute(pha, 1))

  // ---- synapses: intra-cluster kNN + dim ambient links, ONE buffer -------
  const ePos: number[] = []
  const eCol: number[] = []
  const eT: number[] = []
  const eK: number[] = []
  const ePh: number[] = []
  const pushSeg = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    ca: THREE.Color,
    cb: THREE.Color,
    k: number,
    phase: number,
  ) => {
    ePos.push(a.x, a.y, a.z, b.x, b.y, b.z)
    eCol.push(ca.r, ca.g, ca.b, cb.r, cb.g, cb.b)
    eT.push(0, 1)
    eK.push(k, k)
    ePh.push(phase, phase)
  }

  for (let ci = 0; ci < clusterNodes.length; ci++) {
    const nodes = clusterNodes[ci]
    const cols = clusterCols[ci]
    const linked = new Set<string>()
    for (let i = 0; i < nodes.length; i++) {
      // nearest 2 neighbours
      const near: Array<{ j: number; d: number }> = []
      for (let j = 0; j < nodes.length; j++) {
        if (j === i) continue
        near.push({ j, d: nodes[i].distanceToSquared(nodes[j]) })
      }
      near.sort((a, b) => a.d - b.d)
      const links = 1 + Math.floor(rand() * 2)
      for (let n = 0; n < links && n < near.length; n++) {
        const j = near[n].j
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (linked.has(key)) continue
        linked.add(key)
        pushSeg(nodes[i], nodes[j], cols[i], cols[j], ci, rand())
      }
    }
  }

  let ambientEdges = 0
  for (let i = 0; i < ambient.length && ambientEdges < ambientEdgeCap; i++) {
    for (let j = i + 1; j < Math.min(i + 40, ambient.length); j++) {
      if (ambient[i].distanceToSquared(ambient[j]) < 30 && rand() < 0.6) {
        const c = purple.clone().lerp(blue, rand()).multiplyScalar(0.5)
        pushSeg(ambient[i], ambient[j], c, c, -1, rand())
        ambientEdges++
        break
      }
    }
  }

  const edgeGeo = new THREE.BufferGeometry()
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ePos), 3))
  edgeGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(eCol), 3))
  edgeGeo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(eT), 1))
  edgeGeo.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(eK), 1))
  edgeGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(ePh), 1))

  // ---- highways: bowed polylines between every region pair ---------------
  const hPos: number[] = []
  const hCol: number[] = []
  const hT: number[] = []
  const hK: number[] = []
  const hPh: number[] = []
  HIGHWAY_PAIRS.forEach(([a, b], k) => {
    const A = CENTERS[a]
    const B = CENTERS[b]
    const dir = new THREE.Vector3().subVectors(B, A).normalize()
    // random perpendicular bow so no two highways share a plane
    let perp = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1)
      .cross(dir)
    if (perp.lengthSq() < 0.01) perp = new THREE.Vector3(0, 1, 0).cross(dir)
    perp.normalize().multiplyScalar(3.5 + rand() * 6)
    const mid = new THREE.Vector3().lerpVectors(A, B, 0.5).add(perp)
    const curve = new THREE.QuadraticBezierCurve3(A, mid, B)
    const pts = curve.getPoints(22)
    const ca = clusterHue(a)
    const cb = clusterHue(b)
    const phase = rand()
    for (let s = 0; s < pts.length - 1; s++) {
      const t0 = s / (pts.length - 1)
      const t1 = (s + 1) / (pts.length - 1)
      hPos.push(pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z)
      const c0 = ca.clone().lerp(cb, t0)
      const c1 = ca.clone().lerp(cb, t1)
      hCol.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b)
      hT.push(t0, t1)
      hK.push(k, k)
      hPh.push(phase, phase)
    }
  })

  const highwayGeo = new THREE.BufferGeometry()
  highwayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(hPos), 3))
  highwayGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(hCol), 3))
  highwayGeo.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(hT), 1))
  highwayGeo.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(hK), 1))
  highwayGeo.setAttribute('aPhase', new THREE.BufferAttribute(new Float32Array(hPh), 1))

  // ---- halos: the far-visible "this region is firing" glow ---------------
  const halos: BrainData['halos'] = []
  for (let ci = 0; ci < CENTERS.length; ci++) {
    halos.push({ pos: CENTERS[ci], color: clusterHue(ci), cluster: ci, core: false })
    halos.push({
      pos: CENTERS[ci],
      color: clusterHue(ci).clone().lerp(new THREE.Color('#ffffff'), 0.55),
      cluster: ci,
      core: true,
    })
  }

  return { pointsGeo, edgeGeo, highwayGeo, halos }
}

/** Soft radial glow texture, generated once on the client. */
function makeGlowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(255,255,255,0.85)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.28)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.07)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// --------------------------------------------------------------------------
// scene
// --------------------------------------------------------------------------

function BrainScene({
  progress,
  snaps,
  dense,
  reduced,
}: {
  progress: ProgressRef
  snaps: number[]
  dense: boolean
  reduced: boolean
}) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const gl = useThree((s) => s.gl)

  const data = useMemo(() => buildBrain(dense), [dense])
  const glowTex = useMemo(() => makeGlowTexture(), [])

  const pointsMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointsVert,
        fragmentShader: pointsFrag,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uAct: { value: new Float32Array(5) },
          uFog: { value: FOG_DENSITY },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  const edgeMat = useMemo(() => {
    const sh = makeLineShaders(5)
    return new THREE.ShaderMaterial({
      vertexShader: sh.vert,
      fragmentShader: sh.frag,
      uniforms: {
        uTime: { value: 0 },
        uAct: { value: new Float32Array(5) },
        uFog: { value: FOG_DENSITY },
        uRepeat: { value: 1 },
        uSpeed: { value: 0.5 },
        uPulseW: { value: 0.1 },
        uBase: { value: 0.075 },
        uActGain: { value: 0.5 },
        uPulseBase: { value: 0.16 },
        uPulseGain: { value: 1.9 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  const highwayMat = useMemo(() => {
    const sh = makeLineShaders(10)
    return new THREE.ShaderMaterial({
      vertexShader: sh.vert,
      fragmentShader: sh.frag,
      uniforms: {
        uTime: { value: 0 },
        uAct: { value: new Float32Array(10) },
        uFog: { value: FOG_DENSITY },
        uRepeat: { value: 2 },
        uSpeed: { value: 0.16 },
        uPulseW: { value: 0.035 },
        uBase: { value: 0.05 },
        uActGain: { value: 0.55 },
        uPulseBase: { value: 0.1 },
        uPulseGain: { value: 2.4 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  const haloMats = useMemo(
    () =>
      data.halos.map(
        (h) =>
          new THREE.SpriteMaterial({
            map: glowTex,
            color: h.color,
            transparent: true,
            opacity: 0,
            depthWrite: false,
            depthTest: false,
            blending: THREE.AdditiveBlending,
          }),
      ),
    [data, glowTex],
  )

  useEffect(() => {
    return () => {
      data.pointsGeo.dispose()
      data.edgeGeo.dispose()
      data.highwayGeo.dispose()
      pointsMat.dispose()
      edgeMat.dispose()
      highwayMat.dispose()
      haloMats.forEach((m) => m.dispose())
      glowTex.dispose()
    }
  }, [data, pointsMat, edgeMat, highwayMat, haloMats, glowTex])

  // spline through the stations; control point i sits exactly at t = i/6,
  // matching uAnchors, so the p→u map lands precisely on each viewpoint
  const spline = useMemo(
    () => new THREE.CatmullRomCurve3([START, ...VIEWS, END], false, 'centripetal'),
    [],
  )
  const pAnchors = useMemo(() => [0, ...snaps, 1], [snaps])
  const uAnchors = useMemo(
    () => pAnchors.map((_, i) => i / (pAnchors.length - 1)),
    [pAnchors],
  )

  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const tmpTgt = useMemo(() => new THREE.Vector3(), [])
  const state = useRef({ u: 0, fov: BASE_FOV, time: 0 })

  useFrame((_, rawDelta) => {
    const dt = Math.min(Math.max(rawDelta, 0.001), 0.05)
    const s = state.current
    if (!reduced) s.time += dt
    const p = Math.max(0, Math.min(1, progress.current.p))

    // --- p → spline parameter with dwells at every beat anchor ------------
    let seg = 0
    while (seg < pAnchors.length - 2 && p > pAnchors[seg + 1]) seg++
    const span = Math.max(1e-4, pAnchors[seg + 1] - pAnchors[seg])
    const localT = (p - pAnchors[seg]) / span
    const u = uAnchors[seg] + (uAnchors[seg + 1] - uAnchors[seg]) * smootherstep(localT)

    // --- camera ------------------------------------------------------------
    spline.getPoint(u, tmpPos)
    if (!reduced) {
      tmpPos.x += Math.sin(s.time * 0.31 + 1.3) * 0.32
      tmpPos.y += Math.sin(s.time * 0.23) * 0.22
    }
    camera.position.copy(tmpPos)

    const blend = smoothstep(0.22, 0.78, localT)
    tmpTgt.lerpVectors(TARGETS[seg], TARGETS[seg + 1], blend)
    if (!reduced) {
      tmpTgt.x += Math.sin(s.time * 0.19 + 3) * 0.5
      tmpTgt.y += Math.sin(s.time * 0.27 + 1) * 0.35
    }
    camera.lookAt(tmpTgt)

    // speed-kicked FOV: fast transits stretch the view like a zoom rush
    const uVel = Math.abs(u - s.u) / dt
    s.u = u
    const targetFov = reduced
      ? BASE_FOV
      : BASE_FOV + Math.min(1, uVel * 2.4) * 11
    s.fov += (targetFov - s.fov) * Math.min(1, dt * 7)
    if (Math.abs(camera.fov - s.fov) > 0.02) {
      camera.fov = s.fov
      camera.updateProjectionMatrix()
    }

    // --- activations --------------------------------------------------------
    const act = pointsMat.uniforms.uAct.value as Float32Array
    for (let i = 0; i < snaps.length; i++) {
      act[i] = 1 - smoothstep(0.035, 0.115, Math.abs(p - snaps[i]))
    }
    ;(edgeMat.uniforms.uAct.value as Float32Array).set(act)
    const actH = highwayMat.uniforms.uAct.value as Float32Array
    HIGHWAY_PAIRS.forEach(([a, b], k) => {
      actH[k] = Math.max(act[a], act[b]) * 0.9
    })

    const t = s.time
    pointsMat.uniforms.uTime.value = t
    edgeMat.uniforms.uTime.value = t
    highwayMat.uniforms.uTime.value = t
    pointsMat.uniforms.uPixelRatio.value = gl.getPixelRatio()

    data.halos.forEach((h, i) => {
      const a = act[h.cluster]
      const breathe = reduced ? 1 : 0.9 + 0.1 * Math.sin(t * 1.7 + h.cluster * 2.1)
      haloMats[i].opacity = h.core
        ? (0.05 + 0.5 * a) * breathe
        : (0.11 + 0.6 * a) * breathe
    })
  })

  return (
    <group>
      <points geometry={data.pointsGeo} material={pointsMat} frustumCulled={false} />
      <lineSegments geometry={data.edgeGeo} material={edgeMat} frustumCulled={false} />
      <lineSegments geometry={data.highwayGeo} material={highwayMat} frustumCulled={false} />
      {data.halos.map((h, i) => (
        <sprite
          key={i}
          position={h.pos}
          material={haloMats[i]}
          scale={h.core ? [5, 5, 1] : [13, 13, 1]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}

export function LukasBrain({
  progress,
  snaps,
}: {
  progress: ProgressRef
  snaps: number[]
}) {
  // Only mounted client-side (parent gates on WebGL detection), so window
  // access here is safe.
  const dense = useMemo(
    () => !window.matchMedia('(max-width: 768px)').matches,
    [],
  )
  const reduced = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: BASE_FOV, near: 0.1, far: 260, position: START.toArray() }}
    >
      <fogExp2 attach="fog" args={[BG, FOG_DENSITY]} />
      <BrainScene progress={progress} snaps={snaps} dense={dense} reduced={reduced} />
    </Canvas>
  )
}
