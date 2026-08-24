'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { Mesh, Program, Renderer, Texture, Triangle } from 'ogl'

/**
 * HalftoneReveal, portiert von React Bits (reactbits.dev), JavaScript + CSS.
 *
 * Das Bild liegt als Rasterdruck da, und unter dem Zeiger wird es scharf, als
 * hielte man eine Lupe darauf. Was es mitteilt: hier liegt ein Beleg, sieh
 * genauer hin.
 *
 * Vier Abweichungen von der Vorlage:
 *
 * 1. touch-action steht auf pan-y statt none. Die Vorlage sperrt jede
 *    Beruehrung, damit die Lupe dem Finger folgen kann. In einer Demoseite ist
 *    das richtig, hier waere es ein Fehler: das Bild steht mitten in einer
 *    langen Seite, und wer mit dem Finger darauf nach unten wischt, kaeme
 *    nicht weiter.
 *
 * 2. Die Bildschleife haelt an, wenn die Leinwand nicht zu sehen ist oder das
 *    Fenster im Hintergrund liegt. Die Vorlage rechnet durchgehend weiter,
 *    auch wenn sie zehn Bildschirmhoehen weiter oben steht.
 *
 * 3. Die mitgelieferte .css-Datei steht bei den anderen Klassen in
 *    globals.css.
 *
 * 4. Die Leinwand ist ausdruecklich Beiwerk (aria-hidden). Sie liegt hier ueber
 *    einem gewoehnlichen Bild mit Alternativtext: faellt WebGL aus, faellt sie
 *    weg und der Beleg steht trotzdem da.
 *
 * Die Namen der Eigenschaften bleiben englisch wie in der Bibliothek.
 */

const MODI = { mono: 0, duotone: 1, color: 2 } as const
const FORMEN = { circle: 0, square: 1, diamond: 2, line: 3 } as const
const AUSLOESER = { off: 0, hover: 1, always: 2 } as const

const hexZuRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [0, 0, 0]
}

const vertex = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `#version 300 es
precision highp float;

uniform sampler2D tMap;
uniform vec2 iResolution;
uniform vec2 uImageSize;
uniform vec2 uMouse;
uniform float uActivity;

uniform float uDotSize;
uniform float uDensity;
uniform float uAngle;
uniform int uShape;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform int uMode;
uniform float uContrast;
uniform float uInvert;

uniform float uRevealRadius;
uniform float uEdge;
uniform float uIdleReveal;
uniform int uTrigger;

in vec2 vUv;
out vec4 fragColor;

vec2 uAspect() {
  return vec2(iResolution.x / max(iResolution.y, 1.0), 1.0);
}

vec2 coverUv(vec2 uv) {
  float ia = uImageSize.x / max(uImageSize.y, 1.0);
  float pa = iResolution.x / max(iResolution.y, 1.0);
  vec2 s = pa > ia ? vec2(1.0, ia / pa) : vec2(pa / ia, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 gradeRGB(vec3 c) {
  c = clamp((c - 0.5) * uContrast + 0.5, 0.0, 1.0);
  return mix(c, 1.0 - c, uInvert);
}

float shapeDist(vec2 f) {
  if (uShape == 1) return max(abs(f.x), abs(f.y));
  if (uShape == 2) return abs(f.x) + abs(f.y);
  if (uShape == 3) return abs(f.y);
  return length(f);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

vec4 sampleCell(vec2 st, float dens, float ang) {
  vec2 rp = rot(ang) * st * dens;
  vec2 center = floor(rp) + 0.5;
  vec2 stC = rot(-ang) * (center / dens);
  vec2 uvC = stC / uAspect();
  return texture(tMap, clamp(coverUv(uvC), 0.0, 1.0));
}

float coverage(vec2 st, float dens, float ang, float ink, float rscale) {
  vec2 rp = rot(ang) * st * dens;
  vec2 f = fract(rp) - 0.5;
  float d = shapeDist(f);
  float r = sqrt(clamp(ink, 0.0, 1.0)) * 0.72 * rscale * uDotSize;
  float w = length(fwidth(rp)) * 0.6 + 1e-4;
  return smoothstep(r + w, r - w, d);
}

void main() {
  vec2 aspect = uAspect();
  vec2 st = vUv * aspect;
  float ang = radians(uAngle);

  vec2 duv = (vUv - uMouse) * aspect;
  float dist = length(duv);

  float act = uTrigger == 2 ? 1.0 : (uTrigger == 0 ? 0.0 : uActivity);
  float radius = max(uRevealRadius, 1e-4) * mix(0.4, 1.0, act);

  float px = 1.4 / max(iResolution.y, 1.0);
  float band = max(px, radius * (1.0 - clamp(uEdge, 0.0, 1.0)) * 0.45);
  float loupe = 1.0 - smoothstep(radius - band, radius + band, dist);
  float focus = clamp(max(loupe * act, uIdleReveal), 0.0, 1.0);

  float dens = uDensity;

  vec3 print;
  if (uMode == 2) {
    vec3 gc = gradeRGB(sampleCell(st, dens, ang + radians(15.0)).rgb);
    vec3 gm = gradeRGB(sampleCell(st, dens, ang + radians(75.0)).rgb);
    vec3 gy = gradeRGB(sampleCell(st, dens, ang).rgb);
    vec3 gk = gradeRGB(sampleCell(st, dens, ang + radians(45.0)).rgb);
    float c = 1.0 - gc.r;
    float m = 1.0 - gm.g;
    float y = 1.0 - gy.b;
    float k = 1.0 - dot(gk, vec3(0.299, 0.587, 0.114));
    float gcr = min(min(c, m), y) * 0.5;
    c = clamp(c - gcr, 0.0, 1.0);
    m = clamp(m - gcr, 0.0, 1.0);
    y = clamp(y - gcr, 0.0, 1.0);
    k = clamp(max(gcr, k * k * 0.9), 0.0, 1.0);
    float covC = coverage(st, dens, ang + radians(15.0), c, 0.82);
    float covM = coverage(st, dens, ang + radians(75.0), m, 0.82);
    float covY = coverage(st, dens, ang, y, 0.82);
    float covK = coverage(st, dens, ang + radians(45.0), k, 0.78);
    print = uPaper;
    print = mix(print, print * vec3(0.10, 0.72, 0.90), covC);
    print = mix(print, print * vec3(0.92, 0.10, 0.52), covM);
    print = mix(print, print * vec3(0.98, 0.86, 0.10), covY);
    print = mix(print, print * vec3(0.08), covK);
  } else if (uMode == 1) {
    vec3 ink2 = mix(uInk.gbr, vec3(0.90, 0.24, 0.30), 0.7);
    float lumA = dot(gradeRGB(sampleCell(st, dens, ang).rgb), vec3(0.299, 0.587, 0.114));
    float lumB = dot(gradeRGB(sampleCell(st, dens, ang + radians(38.0)).rgb), vec3(0.299, 0.587, 0.114));
    float covA = coverage(st, dens, ang, 1.0 - lumA, 1.0);
    float covB = coverage(st, dens, ang + radians(38.0), pow(1.0 - lumB, 1.4), 0.92);
    print = uPaper;
    print = mix(print, ink2, covB * 0.85);
    print = mix(print, uInk, covA);
  } else {
    float lum = dot(gradeRGB(sampleCell(st, dens, ang).rgb), vec3(0.299, 0.587, 0.114));
    float cov = coverage(st, dens, ang, 1.0 - lum, 1.0);
    print = mix(uPaper, uInk, cov);
  }

  float t = clamp(dist / radius, 0.0, 1.0);
  float bend = t * t * t * t;
  vec2 dir = dist > 1e-5 ? duv / dist : vec2(0.0);
  vec2 off = dir * bend * radius * 0.22 / aspect;
  vec2 ca = dir * bend * 0.0045 / aspect;
  vec3 sharp = gradeRGB(vec3(
    texture(tMap, clamp(coverUv(vUv - off - ca), 0.0, 1.0)).r,
    texture(tMap, clamp(coverUv(vUv - off), 0.0, 1.0)).g,
    texture(tMap, clamp(coverUv(vUv - off + ca), 0.0, 1.0)).b
  ));

  vec3 col = mix(print, sharp, focus);
  fragColor = vec4(col, 1.0);
}
`

export type HalftoneRevealProps = {
  src: string
  inkColor?: string
  paperColor?: string
  mode?: keyof typeof MODI
  dotSize?: number
  dotDensity?: number
  angle?: number
  shape?: keyof typeof FORMEN
  contrast?: number
  invert?: boolean
  revealRadius?: number
  edge?: number
  follow?: number
  idleReveal?: number
  trigger?: keyof typeof AUSLOESER
  borderRadius?: string
  className?: string
  style?: CSSProperties
}

export function HalftoneReveal({
  src,
  inkColor = '#141414',
  paperColor = '#fff7e6',
  mode = 'mono',
  dotSize = 1,
  dotDensity = 71,
  angle = 45,
  shape = 'circle',
  contrast = 1.15,
  invert = false,
  revealRadius = 0.4,
  edge = 0.8,
  follow = 0.37,
  idleReveal = 0,
  trigger = 'hover',
  borderRadius = '16px',
  className = '',
  style,
}: HalftoneRevealProps) {
  const kasten = useRef<HTMLDivElement>(null)
  const werte = useRef<Record<string, { value: unknown }> | null>(null)
  const bild = useRef<number | null>(null)
  const traegheit = useRef(follow)
  const zeiger = useRef({ x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, an: 0, ziel: 0 })

  useEffect(() => {
    traegheit.current = follow
  }, [follow])

  useEffect(() => {
    const el = kasten.current
    if (!el) return

    const ruhig =
      typeof window !== 'undefined' &&
      !!window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: Renderer
    try {
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        alpha: false,
        antialias: true,
      })
    } catch {
      /* Kein WebGL. Darunter liegt das gewoehnliche Bild, es fehlt also
         nichts als der Effekt. */
      return
    }

    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 1)
    gl.canvas.style.width = '100%'
    gl.canvas.style.height = '100%'
    gl.canvas.style.display = 'block'
    el.appendChild(gl.canvas)

    const textur = new Texture(gl, { generateMipmaps: false })

    const uniforms = {
      tMap: { value: textur },
      iResolution: { value: [1, 1] },
      uImageSize: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uActivity: { value: 0 },
      uDotSize: { value: dotSize },
      uDensity: { value: dotDensity },
      uAngle: { value: angle },
      uShape: { value: FORMEN[shape] ?? 0 },
      uInk: { value: hexZuRgb(inkColor) },
      uPaper: { value: hexZuRgb(paperColor) },
      uMode: { value: MODI[mode] ?? 0 },
      uContrast: { value: contrast },
      uInvert: { value: invert ? 1 : 0 },
      uRevealRadius: { value: revealRadius },
      uEdge: { value: edge },
      uIdleReveal: { value: idleReveal },
      uTrigger: { value: AUSLOESER[trigger] ?? 1 },
    }
    werte.current = uniforms

    const program = new Program(gl, { vertex, fragment, uniforms })
    const netz = new Mesh(gl, { geometry: new Triangle(gl), program })

    const quelle = new Image()
    quelle.crossOrigin = 'anonymous'
    quelle.src = src
    quelle.onload = () => {
      textur.image = quelle
      uniforms.uImageSize.value = [quelle.naturalWidth, quelle.naturalHeight]
    }

    const messen = () => {
      renderer.setSize(el.clientWidth || 1, el.clientHeight || 1)
      uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height]
    }
    messen()
    const beobachter = new ResizeObserver(messen)
    beobachter.observe(el)

    const beiBewegung = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      zeiger.current.x = (e.clientX - r.left) / r.width
      zeiger.current.y = 1 - (e.clientY - r.top) / r.height
      zeiger.current.ziel = ruhig ? 0 : 1
    }
    const beiVerlassen = () => {
      zeiger.current.ziel = 0
    }
    el.addEventListener('pointermove', beiBewegung, { passive: true })
    el.addEventListener('pointerenter', beiBewegung, { passive: true })
    el.addEventListener('pointerleave', beiVerlassen, { passive: true })

    /* Die Schleife laeuft nur, wenn es etwas zu sehen gibt. Die Vorlage
       rechnet durchgehend weiter, auch zehn Bildschirmhoehen weiter oben. */
    let sichtbar = false
    let imVordergrund = !document.hidden
    let vorher = performance.now()

    const schritt = (jetzt: number) => {
      bild.current = requestAnimationFrame(schritt)
      const dt = Math.min(0.05, Math.max(0.001, (jetzt - vorher) / 1000))
      vorher = jetzt

      const z = zeiger.current
      const a = 1 - Math.exp(-dt / Math.max(0.001, traegheit.current))
      z.sx += (z.x - z.sx) * a
      z.sy += (z.y - z.sy) * a
      z.an += (z.ziel - z.an) * (1 - Math.exp(-dt / 0.18))

      uniforms.uMouse.value[0] = z.sx
      uniforms.uMouse.value[1] = z.sy
      uniforms.uActivity.value = z.an

      renderer.render({ scene: netz })
    }

    const anhalten = () => {
      if (bild.current) cancelAnimationFrame(bild.current)
      bild.current = null
    }
    const anlaufen = () => {
      if (bild.current === null && sichtbar && imVordergrund) {
        vorher = performance.now()
        bild.current = requestAnimationFrame(schritt)
      }
    }

    const blick = new IntersectionObserver(
      ([eintrag]) => {
        sichtbar = eintrag.isIntersecting
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
      blick.disconnect()
      beobachter.disconnect()
      document.removeEventListener('visibilitychange', beiSichtwechsel)
      el.removeEventListener('pointermove', beiBewegung)
      el.removeEventListener('pointerenter', beiBewegung)
      el.removeEventListener('pointerleave', beiVerlassen)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      gl.canvas.parentNode?.removeChild(gl.canvas)
      werte.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  useEffect(() => {
    const u = werte.current
    if (!u) return
    u.uDotSize.value = dotSize
    u.uDensity.value = dotDensity
    u.uAngle.value = angle
    u.uShape.value = FORMEN[shape] ?? 0
    u.uInk.value = hexZuRgb(inkColor)
    u.uPaper.value = hexZuRgb(paperColor)
    u.uMode.value = MODI[mode] ?? 0
    u.uContrast.value = contrast
    u.uInvert.value = invert ? 1 : 0
    u.uRevealRadius.value = revealRadius
    u.uEdge.value = edge
    u.uIdleReveal.value = idleReveal
    u.uTrigger.value = AUSLOESER[trigger] ?? 1
  }, [
    dotSize,
    dotDensity,
    angle,
    shape,
    inkColor,
    paperColor,
    mode,
    contrast,
    invert,
    revealRadius,
    edge,
    idleReveal,
    trigger,
  ])

  return (
    <div
      ref={kasten}
      aria-hidden
      className={`halftone-reveal ${className}`.trim()}
      style={{ borderRadius, ...style }}
    />
  )
}
