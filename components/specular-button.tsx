'use client'

import { useEffect, useRef, type MouseEventHandler, type ReactNode } from 'react'
import { Renderer, Program, Mesh, Triangle, Color } from 'ogl'

/**
 * Specular button — a light that rides the button's edge and steers toward
 * the pointer (React Bits' SpecularButton, ported to TS and pulled onto this
 * site's rules).
 *
 * Deviations from the upstream component, all deliberate:
 *   • Renders an <a> when `href` is given. Both CTAs it is used for are real
 *     in-page links; turning them into <button>s would have cost the href,
 *     the status-bar target and middle-click.
 *   • `radius` defaults past the clamp so the shape is a pill — DESIGN.md §5
 *     allows rounded-full / rounded-2xl / rounded-none and nothing between.
 *   • The upstream `box-shadow: 0 8px 24px rgba(0,0,0,.25)` is gone: §5 has
 *     exactly two legitimate shadows, glow-as-light-source and depth for
 *     floating chrome, and a button in the page flow is neither.
 *   • Colour comes from the section's own accent (blue = craft, violet =
 *     mind, §3) rather than the upstream white-on-grey.
 *
 * The effect is progressive enhancement and never a prerequisite for using
 * the control: the shaders are `#version 300 es`, so on a device without
 * WebGL2 — and for anyone who asked for reduced motion — the canvas is
 * simply never created and the button keeps its CSS border.
 */

const PAD = 20

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform vec2 uCenter;
uniform vec2 uHalfSize;
uniform float uRadius;
uniform float uAngle;
uniform float uPx;
uniform vec3 uLineColor;
uniform vec3 uBaseColor;
uniform float uIntensity;
uniform float uShineSize;
uniform float uShineFade;
uniform float uThickness;
uniform float uBaseWidth;

out vec4 fragColor;

float sdRoundedRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }

float gaussianLine(float d, float sigma) {
  float x = d / (sigma + 1e-6);
  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));
  return exp(-k * x * x);
}

void main() {
  vec2 p = gl_FragCoord.xy - uCenter;
  float d = shapeSDF(p);
  vec2 L = vec2(cos(uAngle), sin(uAngle));

  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;

  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);
  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));
  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);
  float line = gaussianLine(d, uThickness);
  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));
  float hi = line * rim * edgeClamp * uIntensity;

  vec3 col = uBaseColor * base + uLineColor * hi;
  float a = clamp(base + hi, 0.0, 1.0);
  fragColor = vec4(col, a);
}
`

type SpecularButtonProps = {
  children: ReactNode
  /** Renders an <a> instead of a <button> when set. */
  href?: string
  onClick?: MouseEventHandler<HTMLElement>
  /** Moving highlight. Defaults to the site's blue. */
  lineColor?: string
  /** Static edge stroke under the highlight. */
  baseColor?: string
  intensity?: number
  shineSize?: number
  shineFade?: number
  thickness?: number
  speed?: number
  followMouse?: boolean
  proximity?: number
  autoAnimate?: boolean
  className?: string
  'aria-label'?: string
}

export function SpecularButton({
  children,
  href,
  onClick,
  lineColor = '#9ec5f5',
  baseColor = '#3d4a5c',
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  className = '',
  ...rest
}: SpecularButtonProps) {
  const btnRef = useRef<HTMLElement>(null)
  const fxRef = useRef<HTMLSpanElement>(null)
  const propsRef = useRef({
    lineColor,
    baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  })
  propsRef.current = {
    lineColor,
    baseColor,
    intensity,
    shineSize,
    shineFade,
    thickness,
    speed,
    followMouse,
    proximity,
    autoAnimate,
  }

  useEffect(() => {
    const btn = btnRef.current
    const fx = fxRef.current
    if (!btn || !fx) return

    // Two reasons to never start: the visitor asked for less motion, or the
    // device has no WebGL2 for the `#version 300 es` shaders. In both cases
    // the button is already fully usable without this.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const probe = document.createElement('canvas').getContext('webgl2')
    if (!probe) return

    const dpr = window.devicePixelRatio || 1
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) delete geometry.attributes.uv

    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uCenter: { value: [0, 0] },
        uHalfSize: { value: [1, 1] },
        uRadius: { value: 0 },
        uAngle: { value: 2.4 },
        uPx: { value: dpr },
        uLineColor: { value: [1, 1, 1] },
        uBaseColor: { value: [0.32, 0.32, 0.32] },
        uIntensity: { value: 1 },
        uShineSize: { value: 0.17 },
        uShineFade: { value: 0.7 },
        uThickness: { value: 1 },
        uBaseWidth: { value: dpr },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    fx.appendChild(gl.canvas)

    const sizeRef = { w: 1, h: 1 }
    const resize = () => {
      const rect = btn.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      sizeRef.w = w
      sizeRef.h = h
      renderer.setSize(w + PAD * 2, h + PAD * 2)
      program.uniforms.uCenter.value = [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr]
      program.uniforms.uHalfSize.value = [(w / 2) * dpr, (h / 2) * dpr]
    }
    const ro = new ResizeObserver(resize)
    ro.observe(btn)
    resize()

    let pointerAngle: number | null = null
    let proximityT = 0
    const onPointerMove = (e: PointerEvent) => {
      const rect = btn.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right)
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom)
      const dist = Math.hypot(dx, dy)
      if (dist === 0) {
        const nx = (e.clientX - cx) / (rect.width / 2)
        const ny = (cy - e.clientY) / (rect.height / 2)
        pointerAngle =
          Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15
      } else {
        pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx)
      }
      const t = Math.max(0, 1 - dist / Math.max(propsRef.current.proximity, 1))
      proximityT = t * t * (3 - 2 * t)
    }
    window.addEventListener('pointermove', onPointerMove)

    let angle = 2.4
    let idleAngle = 2.4
    let bright = 0
    let last = performance.now()
    let raf = 0

    const lineC = new Color()
    const baseC = new Color()

    const update = (now: number) => {
      raf = requestAnimationFrame(update)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const p = propsRef.current

      idleAngle += p.speed * dt
      const steer =
        p.followMouse && pointerAngle != null && (!p.autoAnimate || proximityT > 0)
      const target = steer ? (pointerAngle as number) : idleAngle
      const diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI
      angle += diff * (1 - Math.exp(-dt * 7))

      const brightTarget = p.autoAnimate ? 1 : proximityT
      bright += (brightTarget - bright) * (1 - Math.exp(-dt * 8))

      lineC.set(p.lineColor)
      baseC.set(p.baseColor)
      program.uniforms.uAngle.value = angle
      // Clamped to half the short side, which makes the SDF a true pill —
      // the site has no in-between radius (DESIGN.md §5).
      program.uniforms.uRadius.value = (Math.min(sizeRef.w, sizeRef.h) / 2) * dpr
      program.uniforms.uLineColor.value = [lineC.r, lineC.g, lineC.b]
      program.uniforms.uBaseColor.value = [baseC.r, baseC.g, baseC.b]
      program.uniforms.uIntensity.value = p.intensity * bright
      program.uniforms.uShineSize.value = (p.shineSize * Math.PI) / 180
      program.uniforms.uShineFade.value = (p.shineFade * Math.PI) / 180
      program.uniforms.uThickness.value = p.thickness * dpr
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      if (gl.canvas.parentNode === fx) fx.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  const shared = {
    className: `specular-btn ${className}`.trim(),
    onClick,
    ...rest,
  }

  const inner = (
    <>
      <span ref={fxRef} className="specular-btn__fx" aria-hidden="true" />
      <span className="specular-btn__label">{children}</span>
    </>
  )

  if (href) {
    return (
      <a ref={btnRef as React.RefObject<HTMLAnchorElement>} href={href} {...shared}>
        {inner}
      </a>
    )
  }
  return (
    <button ref={btnRef as React.RefObject<HTMLButtonElement>} type="button" {...shared}>
      {inner}
    </button>
  )
}
