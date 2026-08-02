'use client'

import { useEffect, useRef, useState } from 'react'
import { Renderer, Program, Triangle, Mesh } from 'ogl'

const hexToRgb = (hex: string): [number, number, number] => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return match
    ? [
        parseInt(match[1], 16) / 255,
        parseInt(match[2], 16) / 255,
        parseInt(match[3], 16) / 255,
      ]
    : [1, 1, 1]
}

type Origin = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

const originToFlip = (origin: Origin): [number, number] => {
  switch (origin) {
    case 'top-left':
      return [1, 0]
    case 'bottom-right':
      return [0, 1]
    case 'bottom-left':
      return [1, 1]
    default:
      return [0, 0]
  }
}

const VERTEX_SHADER = `attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`

const FRAGMENT_SHADER = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;
  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);
  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`

type SideRaysProps = {
  speed?: number
  rayColor1?: string
  rayColor2?: string
  intensity?: number
  spread?: number
  origin?: Origin
  tilt?: number
  saturation?: number
  blend?: number
  falloff?: number
  opacity?: number
  className?: string
}

export function SideRays({
  speed = 0.8,
  rayColor1 = '#6da9e7',
  rayColor2 = '#a388d2',
  intensity = 1.25,
  spread = 1.8,
  origin = 'top-right',
  tilt = 0,
  saturation = 0.9,
  blend = 0.6,
  falloff = 1.7,
  opacity = 0.28,
  className = '',
}: SideRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<Renderer | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !containerRef.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    cleanupRef.current?.()
    cleanupRef.current = null
    let cancelled = false

    const init = async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      const container = containerRef.current
      if (cancelled || !container) return

      let renderer: Renderer
      try {
        renderer = new Renderer({
          dpr: Math.min(window.devicePixelRatio || 1, 2),
          alpha: true,
        })
      } catch {
        return
      }

      rendererRef.current = renderer
      const gl = renderer.gl
      gl.canvas.style.width = '100%'
      gl.canvas.style.height = '100%'
      while (container.firstChild) container.removeChild(container.firstChild)
      container.appendChild(gl.canvas)

      const [flipX, flipY] = originToFlip(origin)
      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        iSpeed: { value: speed },
        iRayColor1: { value: hexToRgb(rayColor1) },
        iRayColor2: { value: hexToRgb(rayColor2) },
        iIntensity: { value: intensity },
        iSpread: { value: spread },
        iFlipX: { value: flipX },
        iFlipY: { value: flipY },
        iTilt: { value: tilt },
        iSaturation: { value: saturation },
        iBlend: { value: blend },
        iFalloff: { value: falloff },
        iOpacity: { value: opacity },
      }

      const geometry = new Triangle(gl)
      const program = new Program(gl, {
        vertex: VERTEX_SHADER,
        fragment: FRAGMENT_SHADER,
        uniforms,
      })
      const mesh = new Mesh(gl, { geometry, program })

      const resize = () => {
        const current = containerRef.current
        if (!current) return
        renderer.dpr = Math.min(window.devicePixelRatio || 1, 2)
        const { clientWidth, clientHeight } = current
        renderer.setSize(clientWidth, clientHeight)
        uniforms.iResolution.value = [
          clientWidth * renderer.dpr,
          clientHeight * renderer.dpr,
        ]
      }

      const render = (time: number) => {
        if (!rendererRef.current) return
        uniforms.iTime.value = time * 0.001
        try {
          renderer.render({ scene: mesh })
          animationFrameRef.current = requestAnimationFrame(render)
        } catch {
          // Context loss only removes decoration; the hero remains usable.
        }
      }

      window.addEventListener('resize', resize)
      resize()
      animationFrameRef.current = requestAnimationFrame(render)

      cleanupRef.current = () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current)
          animationFrameRef.current = null
        }
        window.removeEventListener('resize', resize)
        try {
          renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
          const canvas = renderer.gl.canvas
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
        } catch {
          // Already removed.
        }
        rendererRef.current = null
      }
    }

    void init()

    return () => {
      cancelled = true
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [
    visible,
    speed,
    rayColor1,
    rayColor2,
    intensity,
    spread,
    origin,
    tilt,
    saturation,
    blend,
    falloff,
    opacity,
  ])

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
    />
  )
}
