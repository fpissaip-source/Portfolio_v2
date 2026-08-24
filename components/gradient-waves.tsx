'use client'

import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'

/**
 * GradientWaves, portiert von React Bits (reactbits.dev), JavaScript + CSS.
 *
 * Ein Wellenfeld, das gegen einen Horizont laeuft. Es steht am Fuss der Seite,
 * dort wo vorher nur noch Schwarz war: die Seite hoert damit auf, statt
 * einfach zu enden.
 *
 * Zwei Abweichungen von der Vorlage: bei abgeschalteter Bewegung entsteht die
 * Leinwand gar nicht, und die mitgelieferte .css-Datei steht bei den anderen
 * Klassen in globals.css. Die Anhalte-Logik der Vorlage bleibt.
 */

const hexZuRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1]
}

const stufen = (detail: string) => (detail === 'low' ? 40 : detail === 'high' ? 110 : 70)

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`

export type GradientWavesProps = {
  horizonColor?: string
  waveColor?: string
  crestColor?: string
  speed?: number
  amplitude?: number
  waveScale?: number
  waveRatio?: number
  swell?: number
  turbulence?: number
  tilt?: number
  zoom?: number
  height?: number
  fogDepth?: number
  detail?: 'low' | 'medium' | 'high'
  brightness?: number
  opacity?: number
  mouseInteraction?: boolean
  parallaxStrength?: number
  grain?: boolean
  grainIntensity?: number
  className?: string
}

export function GradientWaves({
  horizonColor = '#5227FF',
  waveColor = '#FF9FFC',
  crestColor = '#FFFFFF',
  speed = 0.4,
  amplitude = 2.5,
  waveScale = 0.6,
  waveRatio = 0.9,
  swell = 35,
  turbulence = 20,
  tilt = 1.11,
  zoom = 1,
  height = 5.5,
  fogDepth = 15,
  detail = 'medium',
  brightness = 1,
  opacity = 1,
  mouseInteraction = true,
  parallaxStrength = 0.5,
  grain = true,
  grainIntensity = 0.05,
  className = '',
}: GradientWavesProps) {
  const kasten = useRef<HTMLDivElement>(null)
  const zeigerAn = useRef(mouseInteraction)

  useEffect(() => {
    const el = kasten.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let renderer: Renderer
    try {
      renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      })
    } catch {
      return
    }

    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    const leinwand = gl.canvas
    leinwand.style.width = '100%'
    leinwand.style.height = '100%'
    leinwand.style.display = 'block'
    el.appendChild(leinwand)

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Float32Array([1, 1]) },
        uSpeed: { value: speed },
        uAmplitude: { value: amplitude },
        uWaveScale: { value: waveScale },
        uWaveRatio: { value: waveRatio },
        uSwell: { value: swell },
        uTurbulence: { value: turbulence },
        uTilt: { value: tilt },
        uZoom: { value: zoom },
        uHeight: { value: height },
        uFogDepth: { value: fogDepth },
        uSteps: { value: stufen(detail) },
        uBrightness: { value: brightness },
        uOpacity: { value: opacity },
        uGrain: { value: grain ? 1 : 0 },
        uGrainIntensity: { value: grainIntensity },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uParallax: { value: parallaxStrength },
        uEnableMouse: { value: mouseInteraction },
        uHorizonColor: { value: new Float32Array(hexZuRgb(horizonColor)) },
        uWaveColor: { value: new Float32Array(hexZuRgb(waveColor)) },
        uCrestColor: { value: new Float32Array(hexZuRgb(crestColor)) },
      },
    })

    const netz = new Mesh(gl, { geometry: new Triangle(gl), program })

    const messen = () => {
      const r = el.getBoundingClientRect()
      renderer.setSize(Math.max(1, Math.floor(r.width)), Math.max(1, Math.floor(r.height)))
      const res = program.uniforms.iResolution.value
      res[0] = gl.drawingBufferWidth
      res[1] = gl.drawingBufferHeight
      renderer.render({ scene: netz })
    }
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)
    messen()

    const jetzt = [0.5, 0.5]
    const ziel = [0.5, 0.5]
    const beiBewegung = (e: PointerEvent) => {
      const r = leinwand.getBoundingClientRect()
      ziel[0] = (e.clientX - r.left) / r.width
      ziel[1] = 1 - (e.clientY - r.top) / r.height
    }
    const beiVerlassen = () => {
      ziel[0] = 0.5
      ziel[1] = 0.5
    }
    leinwand.addEventListener('pointermove', beiBewegung, { passive: true })
    leinwand.addEventListener('pointerleave', beiVerlassen, { passive: true })

    let bild = 0
    let sichtbar = false
    let imVordergrund = !document.hidden
    const t0 = performance.now()

    const schleife = (t: number) => {
      program.uniforms.iTime.value = (t - t0) * 0.001
      const zx = zeigerAn.current ? ziel[0] : 0.5
      const zy = zeigerAn.current ? ziel[1] : 0.5
      jetzt[0] += 0.05 * (zx - jetzt[0])
      jetzt[1] += 0.05 * (zy - jetzt[1])
      program.uniforms.uMouse.value[0] = jetzt[0]
      program.uniforms.uMouse.value[1] = jetzt[1]
      renderer.render({ scene: netz })
      bild = requestAnimationFrame(schleife)
    }
    const anlaufen = () => {
      if (sichtbar && imVordergrund && bild === 0) bild = requestAnimationFrame(schleife)
    }
    const anhalten = () => {
      if (bild !== 0) {
        cancelAnimationFrame(bild)
        bild = 0
      }
    }

    const blick = new IntersectionObserver(
      ([e]) => {
        sichtbar = e.isIntersecting
        sichtbar ? anlaufen() : anhalten()
      },
      { threshold: 0 },
    )
    blick.observe(el)

    const beiSichtwechsel = () => {
      imVordergrund = !document.hidden
      imVordergrund ? anlaufen() : anhalten()
    }
    document.addEventListener('visibilitychange', beiSichtwechsel)

    return () => {
      anhalten()
      beobachter.disconnect()
      blick.disconnect()
      document.removeEventListener('visibilitychange', beiSichtwechsel)
      leinwand.removeEventListener('pointermove', beiBewegung)
      leinwand.removeEventListener('pointerleave', beiVerlassen)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      leinwand.parentNode?.removeChild(leinwand)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    zeigerAn.current = mouseInteraction
  }, [mouseInteraction])

  return <div ref={kasten} aria-hidden className={`gradient-waves ${className}`.trim()} />
}
