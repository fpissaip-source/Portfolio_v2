"use client";

/**
 * L.U.K.A.S.'s face — the 3D robot beside the "talk to L.U.K.A.S." invite.
 *
 * Ported from 21st.dev's Robot Hero (alexperezcedeno). Everything that makes
 * the character is untouched: the procedurally-generated PBR chassis
 * textures, the capsule head with its Fresnel shader, the blink cycle, the
 * heart-eye reaction on click, the ears and antennae.
 *
 * This replaces an earlier Spline-based robot, and the reason is worth
 * recording: the Spline one streamed its scene from prod.spline.design and
 * pulled a 6.6 MB runtime, so it had to sit behind the cookie consent and be
 * named on the privacy page as a further recipient. This one is pure
 * react-three-fiber over three.js — both already in the bundle for the brain,
 * the gallery and the tech orbs — with no network request and no third party
 * at all. The consent gate and that privacy paragraph are gone with it.
 *
 * Changes from upstream:
 *   1. **Only the robot.** Upstream ships a whole landing page around it — a
 *      sticky shop navbar with "Buy Now", a react-icons shopping bag and a
 *      giant "UITHEFACTORY" watermark on a light-grey gradient. All removed.
 *   2. **Transparent canvas on dark.** Upstream lights a white robot against
 *      a pale background; here it stands in the section's own darkness.
 *   3. **Brand colour.** The pink antenna tip and heart eyes take the agent's
 *      purple, the head screen the site's blue, instead of #ff3366 / #00ffc6.
 *   4. **Gated to >=1024px and steady motion.** A WebGL character is not what
 *      a phone needs beside a two-line invite, and it idles and blinks
 *      continuously, which is what prefers-reduced-motion is about.
 */

import * as React from "react";
import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/** Mirrors --purple / --blue in globals.css; three.js can't read CSS tokens. */
const ACCENT = "#b08fdb";
const SCREEN = "#7aa5e8";

class HeartCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }
  getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    t = t * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);

    return optionalTarget.set(x * 0.002, (y + 6) * 0.002, 0);
  }
}

const sharedHeartCurve = new HeartCurve();

function ResponsiveGroup({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  // Upstream's 3.5 / cap 1.1 frames him for a full-viewport hero. In this
  // 448x544 column that leaves him a small figure adrift in empty space.
  // Note moving the camera in does NOT fix it: viewport.width shrinks with
  // camera distance, so this divisor cancels the zoom almost exactly. The
  // scale itself is what has to change.
  const scale = Math.min(1.6, viewport.width / 2.2);
  return <group scale={scale}>{children}</group>;
}

function GlassCapsule({ color, power, intensity }: { color: string; power: number; intensity: number }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      color: { value: new THREE.Color("#ffffff") },
      power: { value: 2.5 },
      intensity: { value: 0.6 },
    }),
    [],
  );

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.color.value.set(color);
      materialRef.current.uniforms.power.value = power;
      materialRef.current.uniforms.intensity.value = intensity;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[0.3, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPosition = -mvPosition.xyz;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          uniform float power;
          uniform float intensity;
          varying vec3 vNormal;
          varying vec3 vViewPosition;
          void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewPosition);
            float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
            fresnel = pow(fresnel, power);
            gl_FragColor = vec4(color, fresnel * intensity);
          }
        `}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

const earBaseMat = new THREE.MeshStandardMaterial({ color: "#f0f0f0", roughness: 0.5 });
const earRingMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.3 });
const earCenterMat = new THREE.MeshStandardMaterial({ color: "#cccccc", roughness: 0.8 });
const antennaBaseMat = new THREE.MeshStandardMaterial({ color: "#999999", roughness: 0.4, metalness: 0.5 });
const antennaStickMat = new THREE.MeshStandardMaterial({ color: "#d0d0d0", roughness: 0.4, metalness: 0.2 });
const antennaTipMat = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: 0.2, toneMapped: false });

function RobotEar({ position, scale = 1, isLeft = false }: { position: [number, number, number]; scale?: number; isLeft?: boolean }) {
  const dir = isLeft ? -1 : 1;

  return (
    <group position={position} scale={scale}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earBaseMat}>
        <cylinderGeometry args={[0.04, 0.04, 0.025, 32]} />
      </mesh>

      <mesh position={[dir * 0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earRingMat}>
        <torusGeometry args={[0.032, 0.008, 16, 32]} />
      </mesh>

      <mesh position={[dir * 0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow material={earCenterMat}>
        <cylinderGeometry args={[0.03, 0.03, 0.005, 32]} />
      </mesh>

      <group position={[dir * 0.015, 0.035, 0]} rotation={[-0.4, 0, 0]}>
        <mesh position={[0, 0.01, 0]} castShadow receiveShadow material={antennaBaseMat}>
          <cylinderGeometry args={[0.006, 0.008, 0.02, 16]} />
        </mesh>
        <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={antennaStickMat}>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 8]} />
        </mesh>
        <mesh position={[0, 0.11, 0]} castShadow receiveShadow material={antennaTipMat}>
          <sphereGeometry args={[0.006, 16, 16]} />
        </mesh>
      </group>
    </group>
  );
}

const eyeMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2, 2, 2), toneMapped: false, transparent: true });
const heartMat = new THREE.MeshBasicMaterial({ color: ACCENT, toneMapped: false });

function RobotEye({
  position,
  rotation,
  scale = 1,
  blinkDuration = 0.15,
  blinkCycle = 3.0,
  isLovedRef,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: number;
  blinkDuration?: number;
  blinkCycle?: number;
  isLovedRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const normalEyesRef = useRef<THREE.Group>(null);
  const heartEyeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current || !normalEyesRef.current || !heartEyeRef.current) return;

    const isHeart = isLovedRef.current;

    normalEyesRef.current.visible = !isHeart;
    heartEyeRef.current.visible = isHeart;

    const cycle = clock.getElapsedTime() % blinkCycle;

    let targetScaleY = 1;

    if (cycle < blinkDuration && !isHeart) {
      const progress = cycle / blinkDuration;
      const blinkClose = Math.sin(progress * Math.PI);

      targetScaleY = Math.max(0.05, 1.0 - blinkClose);
    }

    groupRef.current.scale.set(scale, scale * targetScaleY, scale);
  });

  const { topPath, bottomPath } = useMemo(() => {
    const w = 0.025;
    const h = 0.035;
    const r = 0.02;
    const g = 0.005;

    const tPath = new THREE.CurvePath<THREE.Vector3>();
    tPath.add(new THREE.LineCurve3(new THREE.Vector3(-w, g, 0), new THREE.Vector3(-w, h - r, 0)));
    tPath.add(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-w, h - r, 0), new THREE.Vector3(-w, h, 0), new THREE.Vector3(-w + r, h, 0)),
    );
    tPath.add(new THREE.LineCurve3(new THREE.Vector3(-w + r, h, 0), new THREE.Vector3(w - r, h, 0)));
    tPath.add(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(w - r, h, 0), new THREE.Vector3(w, h, 0), new THREE.Vector3(w, h - r, 0)),
    );
    tPath.add(new THREE.LineCurve3(new THREE.Vector3(w, h - r, 0), new THREE.Vector3(w, g, 0)));

    const bPath = new THREE.CurvePath<THREE.Vector3>();
    bPath.add(new THREE.LineCurve3(new THREE.Vector3(-w, -g, 0), new THREE.Vector3(-w, -(h - r), 0)));
    bPath.add(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(-w, -(h - r), 0), new THREE.Vector3(-w, -h, 0), new THREE.Vector3(-w + r, -h, 0)),
    );
    bPath.add(new THREE.LineCurve3(new THREE.Vector3(-w + r, -h, 0), new THREE.Vector3(w - r, -h, 0)));
    bPath.add(
      new THREE.QuadraticBezierCurve3(new THREE.Vector3(w - r, -h, 0), new THREE.Vector3(w, -h, 0), new THREE.Vector3(w, -(h - r), 0)),
    );
    bPath.add(new THREE.LineCurve3(new THREE.Vector3(w, -(h - r), 0), new THREE.Vector3(w, -g, 0)));

    return { topPath: tPath, bottomPath: bPath };
  }, []);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      <mesh ref={heartEyeRef} visible={false} material={heartMat}>
        <tubeGeometry args={[sharedHeartCurve, 64, 0.0035, 8, true]} />
      </mesh>

      <group ref={normalEyesRef}>
        <mesh material={eyeMat}>
          <tubeGeometry args={[topPath, 20, 0.0035, 8, false]} />
        </mesh>
        <mesh material={eyeMat}>
          <tubeGeometry args={[bottomPath, 20, 0.0035, 8, false]} />
        </mesh>
      </group>
    </group>
  );
}

function generatePbrTexturesAsync(): Promise<{ colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const size = 512;
      const canvasC = document.createElement("canvas");
      const canvasB = document.createElement("canvas");
      canvasC.width = canvasB.width = size;
      canvasC.height = canvasB.height = size;
      const ctxC = canvasC.getContext("2d");
      const ctxB = canvasB.getContext("2d");

      if (ctxC && ctxB) {
        ctxC.fillStyle = "#dcdcdc";
        ctxC.fillRect(0, 0, size, size);
        ctxB.fillStyle = "#808080";
        ctxB.fillRect(0, 0, size, size);

        for (let i = 0; i < 10000; i++) {
          const x = Math.random() * size;
          const y = Math.random() * size;
          const r = 0.5 + Math.random() * 1.5;
          const isDark = Math.random() > 0.15;

          ctxC.beginPath();
          ctxC.arc(x, y, r, 0, Math.PI * 2);
          ctxC.fillStyle = isDark ? "#222222" : "#dddddd";
          ctxC.fill();

          ctxB.beginPath();
          ctxB.arc(x, y, r, 0, Math.PI * 2);
          ctxB.fillStyle = isDark ? "#000000" : "#ffffff";
          ctxB.fill();
        }
      }

      const texC = new THREE.CanvasTexture(canvasC);
      const texB = new THREE.CanvasTexture(canvasB);
      texC.wrapS = texB.wrapS = THREE.RepeatWrapping;
      texC.wrapT = texB.wrapT = THREE.RepeatWrapping;

      texC.repeat.set(6, 3);
      texB.repeat.set(6, 3);
      texC.needsUpdate = true;
      texB.needsUpdate = true;

      resolve({ colorMap: texC, bumpMap: texB });
    }, 0);
  });
}

function RobotPrototype({
  neckParams = { baseR: 0.25, baseH: -0.01, midR: 0.23, midH: 0.02, lipBottomR: 0.27, lipBottomH: 0.025, lipTopR: 0.28, lipTopH: 0.05, innerR: 0.24, innerDropH: 0.03 },
  bodyParams = { bodyBevelR: 0.21, bodyBevelY: 0.38, bodyBevelT: 0.015 },
}: {
  neckParams?: Record<string, number>;
  bodyParams?: Record<string, number>;
}) {
  const isLovedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const [textures, setTextures] = useState<{ colorMap: THREE.CanvasTexture | null; bumpMap: THREE.CanvasTexture | null }>({
    colorMap: null,
    bumpMap: null,
  });

  const design = {
    pantallaColor: SCREEN,
    pantallaGrosor: 3.8,
    pantallaBrillo: 1.2,
    separacionOjos: 0.07,
    tamañoOrejas: 1.3,
    escalaOjos: 1.1,
    parpadeoFrecuencia: 3.0,
    parpadeoDuracion: 0.45,
    colorChasis: "#c4c4c4",
    alturaCabeza: 0.6,
  };

  const config = {
    moveSpeed: 0.35,
    bodyRotSpeed: 10.0,
    headRotSpeed: 20.0,
    bodyTiltX: 0.0,
    bodyTiltY: 0.95,
    headLookX: 0.3,
    headLookY: 1.8,
  };

  useFrame((state, delta) => {
    if (!bodyRef.current || !headRef.current) return;

    const dt = Math.min(delta, 0.1);

    const tx = state.pointer.x;
    const ty = state.pointer.y;

    const maxMoveX = state.viewport.width / 3.5;
    const targetPosX = tx * maxMoveX;
    bodyRef.current.position.x = THREE.MathUtils.lerp(bodyRef.current.position.x, targetPosX, config.moveSpeed * dt);

    const relativeX = tx - bodyRef.current.position.x / 2.5;

    const bodyTargetRotY = -relativeX * config.bodyTiltY;
    const bodyTargetRotX = relativeX * relativeX * config.bodyTiltX - ty * 0.25;
    const bodyTargetRotZ = -relativeX * 0.15;

    bodyRef.current.rotation.y = THREE.MathUtils.lerp(bodyRef.current.rotation.y, bodyTargetRotY, config.bodyRotSpeed * dt);
    bodyRef.current.rotation.x = THREE.MathUtils.lerp(bodyRef.current.rotation.x, bodyTargetRotX, config.bodyRotSpeed * dt);
    bodyRef.current.rotation.z = THREE.MathUtils.lerp(bodyRef.current.rotation.z, bodyTargetRotZ, config.bodyRotSpeed * dt);

    const headTargetRotY = relativeX * config.headLookY;
    const headTargetRotX = -ty * config.headLookX;

    headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, headTargetRotY, config.headRotSpeed * dt);
    headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, headTargetRotX, config.headRotSpeed * dt);
  });

  useEffect(() => {
    let mounted = true;
    let generatedMaps: { colorMap: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } | null = null;

    generatePbrTexturesAsync().then((res) => {
      if (mounted) {
        generatedMaps = res;
        setTextures(res);
      } else {
        res.colorMap.dispose();
        res.bumpMap.dispose();
      }
    });

    return () => {
      mounted = false;

      if (generatedMaps) {
        generatedMaps.colorMap.dispose();
        generatedMaps.bumpMap.dispose();
      }
    };
  }, []);

  const handlePointerDown = (e: import("@react-three/fiber").ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isLovedRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isLovedRef.current = false;
    }, 2000);
  };

  const neckProfile = useMemo(() => {
    const points: THREE.Vector2[] = [];

    points.push(new THREE.Vector2(neckParams.innerR, neckParams.baseH));
    points.push(new THREE.Vector2(neckParams.baseR, neckParams.baseH));
    points.push(new THREE.Vector2(neckParams.midR, neckParams.midH));
    points.push(new THREE.Vector2(neckParams.lipBottomR, neckParams.lipBottomH));
    points.push(new THREE.Vector2(neckParams.lipTopR, neckParams.lipTopH));
    points.push(new THREE.Vector2(neckParams.innerR, neckParams.lipTopH));
    points.push(new THREE.Vector2(neckParams.innerR, neckParams.lipTopH - neckParams.innerDropH));
    return points;
  }, [neckParams]);

  const headMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#111111",
      roughness: 1.0,
      metalness: 0.0,
    });
  }, []);

  if (!textures.colorMap) return null;

  return (
    <group ref={bodyRef} position={[0, -0.3, 0]} onPointerDown={handlePointerDown} onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "auto")}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.43, 64, 64, 0, Math.PI * 2, Math.PI * 0.15, Math.PI * 0.85]} />
        <meshStandardMaterial color={design.colorChasis} map={textures.colorMap || undefined} bumpMap={textures.bumpMap || undefined} bumpScale={0.005} roughness={1.0} metalness={0.0} envMapIntensity={0.0} />
      </mesh>

      {bodyParams.bodyBevelT > 0 && (
        <mesh position={[0, bodyParams.bodyBevelY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[bodyParams.bodyBevelR, bodyParams.bodyBevelT, 32, 64]} />
          <meshStandardMaterial color={design.colorChasis} map={textures.colorMap || undefined} bumpMap={textures.bumpMap || undefined} bumpScale={0.005} roughness={1.0} metalness={0.0} envMapIntensity={0.0} />
        </mesh>
      )}

      <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
        <latheGeometry args={[neckProfile, 64]} />
        <meshStandardMaterial color={design.colorChasis} map={textures.colorMap || undefined} bumpMap={textures.bumpMap || undefined} bumpScale={0.005} roughness={1.0} metalness={0.0} envMapIntensity={0.0} />
      </mesh>

      <group ref={headRef} position={[0, design.alturaCabeza, 0]}>
        <mesh material={headMat} castShadow receiveShadow>
          <sphereGeometry args={[0.28, 64, 64, 0, Math.PI * 2, 0, Math.PI]} />
        </mesh>

        <GlassCapsule color={design.pantallaColor} power={design.pantallaGrosor} intensity={design.pantallaBrillo} />

        <group position={[0, -0.02, 0.29]}>
          <RobotEye position={[-design.separacionOjos, 0, 0]} rotation={[0, -0.2, 0]} scale={design.escalaOjos} blinkDuration={design.parpadeoDuracion} blinkCycle={design.parpadeoFrecuencia} isLovedRef={isLovedRef} />
          <RobotEye position={[design.separacionOjos, 0, 0]} rotation={[0, 0.2, 0]} scale={design.escalaOjos} blinkDuration={design.parpadeoDuracion} blinkCycle={design.parpadeoFrecuencia} isLovedRef={isLovedRef} />
        </group>

        <RobotEar position={[-0.29, 0, 0]} isLeft={true} scale={design.tamañoOrejas} />
        <RobotEar position={[0.29, 0, 0]} isLeft={false} scale={design.tamañoOrejas} />
      </group>
    </group>
  );
}


/**
 * The mounted robot. Nothing here is conditional on consent — there is no
 * third party left to consent to.
 */
export function LukasRobot({ className = "" }: { className?: string }) {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEligible(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!eligible) return null;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0.05, 6], fov: 40 }}
        gl={{ alpha: true }}
        // The invite panel sits inside a pinned ScrollTrigger section; a
        // transparent canvas lets the neuron field show through behind him
        // instead of punching a grey rectangle into the scene.
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.75} color="#ffffff" />
        <directionalLight position={[0, 6, 3]} intensity={0.6} color={SCREEN} />
        <directionalLight position={[-5, 2, -5]} intensity={0.35} color={ACCENT} />
        {/* Upstream uses preset="studio", which drei resolves by fetching
            studio_small_03_1k.hdr from raw.githack.com. Verified in the
            browser: it is a live third-party request. That is precisely what
            moving off Spline was meant to eliminate, so the studio is built
            from Lightformers instead — the environment map is rendered in
            the scene, nothing is downloaded. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 3, 2]} scale={[6, 3, 1]} color="#ffffff" />
          <Lightformer intensity={1.1} position={[-4, 1, 1]} scale={[3, 4, 1]} color={SCREEN} />
          <Lightformer intensity={0.9} position={[4, 0.5, 1]} scale={[3, 4, 1]} color={ACCENT} />
          <Lightformer intensity={0.6} position={[0, -2, -2]} scale={[6, 3, 1]} color="#ffffff" />
        </Environment>
        <ResponsiveGroup>
          <RobotPrototype
            neckParams={{ baseR: 0.215, baseH: -0.05, midR: 0.28, midH: 0.02, lipBottomR: 0.295, lipBottomH: 0.045, lipTopR: 0.27, lipTopH: 0.055, innerR: 0.1, innerDropH: 0.0 }}
            bodyParams={{ bodyBevelR: 0.235, bodyBevelY: 0.34, bodyBevelT: 0.025 }}
          />
        </ResponsiveGroup>
      </Canvas>
    </div>
  );
}
