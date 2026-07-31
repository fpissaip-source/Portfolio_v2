'use client'

import {
  Suspense,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, OrbitControls, Plane, Sphere, Stars } from '@react-three/drei'
import { Code2, ExternalLink, X } from 'lucide-react'
import { useT } from './language-context'

/**
 * 3D card gallery — the work section's stage.
 *
 * Ported from 21st.dev's "3D Image Gallery" (StellarCardGallerySingle,
 * moazamtrade/shadway). The maths that make it what it is are kept verbatim:
 * the golden-ratio Fibonacci-sphere placement, the three nested wireframe
 * shells, the per-card billboard `lookAt(camera.position)`, and the tilt that
 * follows the pointer in the detail card. Everything below is a change I had
 * to make for it to work on *this* page, listed so the deviations are not
 * mistaken for the original:
 *
 *   1. **The starfield.** Upstream mounts a second WebGLRenderer in a
 *      `position: fixed; inset: 0` black div sized to `window.innerWidth` —
 *      a full-viewport opaque layer that would have covered the entire site,
 *      plus a second GL context for one section. Replaced with drei's
 *      `<Stars>` inside the same canvas: same look, one context, contained.
 *   2. **Contained, not `h-screen`.** This is a section on a long page, not
 *      a standalone route.
 *   3. **Zoom and pan off.** The page scrolls with Lenis; a canvas that eats
 *      the wheel for dolly-zoom traps the visitor inside the section. Drag
 *      to rotate is kept — that is the interaction worth having.
 *   4. **Landscape cards.** Upstream cards are portrait (`w-40 h-52`, square
 *      image crop). These are website captures; a square crop would cut the
 *      layout away, which is the entire subject. Cards and the detail view
 *      are 16:9.
 *   5. **Brand colour.** Upstream's teal #31b8c6 → the site's blue/purple.
 *   6. **Real actions.** Upstream's detail card has "Download" and a
 *      favourite heart, neither of which means anything here. Replaced with
 *      the live link and repository link when a project has them.
 *   7. **A keyboard path.** Upstream is pointer-only inside a canvas, which
 *      makes every card unreachable without a mouse. A visually-hidden but
 *      focusable button per card opens the same detail view.
 */

/** Blue and purple as hex — three.js materials can't read CSS tokens.
 *  Kept next to the source values in globals.css (--blue, --purple). */
const BLUE = '#7aa5e8'
const PURPLE = '#b08fdb'

export type GalleryCard = {
  id: string
  imageUrl: string
  alt: string
  title: string
  /** Shown under the title in the detail view — the one line that says what
   *  this is. Without it a built client site and a design direction look
   *  identical on a wall of screenshots. */
  kindLabel: string
  meta?: string
  liveUrl?: string
  githubUrl?: string
  /** Extra block under the copy — used for the measured third-party audit,
   *  which must survive the move off the old orb panel. */
  detail?: ReactNode
}

type CardContextType = {
  selectedCard: GalleryCard | null
  setSelectedCard: (card: GalleryCard | null) => void
  cards: GalleryCard[]
}

const CardContext = createContext<CardContextType | undefined>(undefined)

function useCard() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCard must be used within CardProvider')
  return ctx
}

function FloatingCard({
  card,
  position,
  htmlFactor,
}: {
  card: GalleryCard
  position: { x: number; y: number; z: number }
  htmlFactor: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const { setSelectedCard, selectedCard } = useCard()

  // Billboard: every card keeps facing the camera as the sphere is dragged.
  useFrame(({ camera }) => {
    groupRef.current?.lookAt(camera.position)
  })

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {/* Invisible hit plane — the visible card is DOM inside <Html>, which
          can't receive raycasts, so the pointer target lives in the scene. */}
      <Plane
        args={[5.5, 3.4]}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedCard(card)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          setHovered(false)
          document.body.style.cursor = 'auto'
        }}
      >
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      {/* Not rendered while a detail card is open. drei portals <Html> to
          document.body and assigns it a z-index from zIndexRange, which
          defaults to [16777271, 0] — so these cards paint straight over the
          dialog no matter what z-index it carries. Reported from a phone:
          the whole sphere was sitting on top of the open project. Removing
          them is also the honest thing to draw: the dialog covers the scene
          anyway, and the starfield behind it stays. */}
      {!selectedCard && (
      <Html
        transform
        distanceFactor={htmlFactor}
        position={[0, 0, 0.01]}
        style={{
          transition: 'transform 0.3s ease',
          transform: hovered ? 'scale(1.12)' : 'scale(1)',
          pointerEvents: 'none',
          // drei portals <Html> content to document.body, so it is NOT a
          // descendant of the gallery frame — measured: the ancestor chain
          // from a card runs p < div < body, and body allows pinch-zoom.
          // Setting it on the frame therefore never reached these cards, and
          // a pinch that landed on one zoomed the whole page. It has to be
          // declared here, on the element the finger actually hits.
          touchAction: 'pan-y',
        }}
      >
        <div
          className="w-56 select-none overflow-hidden rounded-xl bg-[#0b0b0e] p-2.5"
          style={{
            boxShadow: hovered
              ? `0 25px 50px ${BLUE}55, 0 0 30px ${BLUE}44`
              : '0 15px 30px rgba(0,0,0,0.6)',
            border: hovered
              ? `1.5px solid ${BLUE}99`
              : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageUrl}
            alt=""
            className="aspect-video w-full rounded-md object-cover"
            draggable={false}
          />
          <p className="mt-1.5 truncate text-center text-[11px] font-medium text-white">
            {card.title}
          </p>
        </div>
      </Html>
      )}
    </group>
  )
}

function CardDetail() {
  const t = useT()
  const { selectedCard, setSelectedCard } = useCard()
  const cardRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setSelectedCard(null), [setSelectedCard])

  useEffect(() => {
    if (!selectedCard) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedCard, close])

  if (!selectedCard) return null

  // Pointer-following tilt, from upstream.
  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.transition = 'none'
    el.style.transform = `perspective(1000px) rotateX(${
      (e.clientY - r.top - r.height / 2) / 24
    }deg) rotateY(${(r.width / 2 - (e.clientX - r.left)) / 24}deg)`
  }
  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.transition = 'transform 0.5s ease-out'
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={selectedCard.title}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close()
      }}
      data-lenis-prevent
    >
      <div className="relative w-full max-w-3xl">
        <button
          type="button"
          onClick={close}
          aria-label={t.projects.close}
          className="absolute -top-11 right-0 z-10 rounded-full p-2 text-white transition-colors hover:text-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="h-6 w-6" />
        </button>

        <div style={{ perspective: '1000px' }}>
          <div
            ref={cardRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ transformStyle: 'preserve-3d' }}
            className="rounded-2xl border border-white/10 bg-[#0b0b0e] p-4 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedCard.imageUrl}
              alt={selectedCard.alt}
              className="aspect-video w-full rounded-xl bg-black object-cover"
            />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-blue">
              {selectedCard.kindLabel}
            </p>
            <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-foreground">
              {selectedCard.title}
            </h3>
            {selectedCard.meta && (
              <p className="mt-2 max-w-[62ch] text-pretty text-sm leading-relaxed text-muted-foreground">
                {selectedCard.meta}
              </p>
            )}
            {selectedCard.detail}
            {(selectedCard.liveUrl || selectedCard.githubUrl) && (
              <div className="mt-5 flex flex-wrap gap-2.5">
                {selectedCard.liveUrl && (
                  <a
                    href={selectedCard.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-blue/60 bg-blue/10 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-blue/90 hover:bg-blue/16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    {t.projects.liveProject}
                  </a>
                )}
                {selectedCard.githubUrl && (
                  <a
                    href={selectedCard.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold tracking-tight text-foreground transition-colors hover:border-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <Code2 className="h-4 w-4" aria-hidden />
                    {t.projects.github}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Touch controls, hand-rolled instead of OrbitControls.
 *
 * OrbitControls sets `touch-action: none` on the canvas, which takes the
 * page's own scrolling away over an element that fills most of a phone
 * screen. Leaving the browser's gestures alone instead is not an option
 * either: pinch-zooming a page that holds several WebGL contexts makes the
 * phone re-rasterise all of them at a higher scale, and the renderer runs
 * out of memory and kills the tab. That crash was reported from a real
 * device.
 *
 * So the canvas takes `touch-action: pan-y`: one finger scrolls the page
 * past the gallery as usual, and the browser's pinch-zoom is off over this
 * element only. Two fingers are ours — pinch dollies the camera, dragging
 * the midpoint orbits it. The zoom happens inside the frame, which is what
 * it should have done from the start.
 */
const MIN_R = 14
const MAX_R = 46

function TouchOrbit({ enabled }: { enabled: boolean }) {
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    if (!enabled) return
    const el = gl.domElement
    // pan-y: one finger still scrolls the page past the gallery, but the
    // browser's own pinch-zoom is off over this element. R3F's `style` prop
    // lands on the wrapper div, not here, so it has to be set directly.
    const previousTouchAction = el.style.touchAction
    el.style.touchAction = 'pan-y'
    const spread = (t: TouchList) =>
      Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY)
    const centre = (t: TouchList) => ({
      x: (t[0].clientX + t[1].clientX) / 2,
      y: (t[0].clientY + t[1].clientY) / 2,
    })
    let lastSpread = 0
    let lastCentre = { x: 0, y: 0 }

    const onStart = (e: TouchEvent) => {
      if (e.touches.length < 2) return
      e.preventDefault()
      lastSpread = spread(e.touches)
      lastCentre = centre(e.touches)
    }
    const onMove = (e: TouchEvent) => {
      // One finger is the page's: do not preventDefault, do not act.
      if (e.touches.length < 2) return
      e.preventDefault()
      const s = spread(e.touches)
      const c = centre(e.touches)
      if (lastSpread > 0) {
        const r = camera.position.length() * (lastSpread / s)
        camera.position.setLength(Math.min(MAX_R, Math.max(MIN_R, r)))
      }
      const yaw = -(c.x - lastCentre.x) * 0.006
      const x = camera.position.x
      const z = camera.position.z
      camera.position.x = x * Math.cos(yaw) - z * Math.sin(yaw)
      camera.position.z = x * Math.sin(yaw) + z * Math.cos(yaw)
      camera.position.y = Math.min(
        22,
        Math.max(-22, camera.position.y + (c.y - lastCentre.y) * 0.05),
      )
      camera.lookAt(0, 0, 0)
      lastSpread = s
      lastCentre = c
    }
    el.addEventListener('touchstart', onStart, { passive: false })
    el.addEventListener('touchmove', onMove, { passive: false })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.style.touchAction = previousTouchAction
    }
  }, [enabled, camera, gl])

  // Keeps turning on its own so every card comes round without a gesture.
  useFrame(({ camera: cam }, delta) => {
    if (!enabled) return
    const a = 0.05 * delta * Math.PI
    const x = cam.position.x
    const z = cam.position.z
    cam.position.x = x * Math.cos(a) - z * Math.sin(a)
    cam.position.z = x * Math.sin(a) + z * Math.cos(a)
    cam.lookAt(0, 0, 0)
  })

  return null
}

function CardGalaxy() {
  const { cards } = useCard()
  // The section's frame is wide on desktop and narrow-tall on a phone. A
  // fixed spread that fills one slices cards off the other, so both the
  // horizontal stretch and the on-screen card size are derived from the
  // canvas' own aspect rather than hard-coded.
  const aspect = useThree((s) => s.viewport.aspect)
  const stretch = Math.min(1.7, Math.max(0.5, aspect * 0.9))
  // Floor raised from 5: at the phone's 0.61 aspect the formula bottomed
  // out and produced ~50px cards — inside the frame, but too small to
  // read or tap. Fitting every card is not worth making all of them
  // illegible; the sphere rotates, so a card grazing an edge comes back.
  const htmlFactor = Math.min(10, Math.max(7, aspect * 5.2))

  // Fibonacci sphere — upstream's placement, unchanged.
  const positions = useMemo(() => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    return cards.map((_, i) => {
      const y = 1 - (i / (cards.length - 1 || 1)) * 2
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
      const theta = (2 * Math.PI * i) / goldenRatio
      // Upstream's 12/16/20 shells assume a full-screen canvas; inside this
      // section's 640px frame the outer ring puts cards past the vertical
      // FOV and they get sliced by the container edge. 8/11/14 keeps the
      // furthest card (plus half its height) inside tan(30°)·34 = 19.6.
      const layerRadius = 8 + (i % 3) * 3
      // Flattened into an oblate spheroid rather than upstream's true
      // sphere: the frame is wide and short, so an isotropic distribution
      // either overflows top and bottom or leaves the sides empty. Vertical
      // spread stays inside the FOV; horizontal spread fills the width.
      // Depth is held back rather than widened with x: a card swung close
      // to the camera is magnified hard by the perspective and is what
      // actually pushes cards past the side edges.
      return {
        x: Math.cos(theta) * radiusAtY * layerRadius * stretch,
        y: y * layerRadius,
        z: Math.sin(theta) * radiusAtY * layerRadius * stretch * 0.5,
      }
    })
  }, [cards, stretch])

  return (
    <>
      <Sphere args={[1.5, 32, 32]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere args={[8, 32, 32]}>
        <meshStandardMaterial color={PURPLE} transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[11, 32, 32]}>
        <meshStandardMaterial color={BLUE} transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[14, 32, 32]}>
        <meshStandardMaterial color={BLUE} transparent opacity={0.02} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={positions[i]} htmlFactor={htmlFactor} />
      ))}
    </>
  )
}

export function StellarGallery({ cards }: { cards: GalleryCard[] }) {
  const t = useT()
  const [selectedCard, setSelectedCard] = useState<GalleryCard | null>(null)
  // OrbitControls sets `touch-action: none` on the canvas as long as it is
  // mounted. On a phone this element is most of the screen, so that silently
  // takes pinch-zoom away from the page — a real accessibility loss for the
  // sake of a drag gesture. It is therefore mounted for fine pointers only;
  // touch keeps the auto-rotation, which brings every card round anyway, and
  // tapping a card still opens it.
  const [canDrag, setCanDrag] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setCanDrag(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 34], fov: 60 }}
          className="absolute inset-0"
        >
          <Suspense fallback={null}>
            {/* Replaces upstream's separate fixed-position renderer. */}
            <Stars radius={120} depth={60} count={2600} factor={4} fade speed={0.4} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <CardGalaxy />
            {canDrag ? (
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate
                rotateSpeed={0.5}
                autoRotate
                autoRotateSpeed={0.35}
                target={[0, 0, 0]}
              />
            ) : (
              <TouchOrbit enabled />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* The canvas is unreachable without a pointer. These are the same
          cards as real buttons: off-screen until focused, then visible. */}
      <ul className="absolute left-0 top-0 z-20 flex flex-col gap-1">
        {cards.map((card) => (
          <li key={card.id}>
            <button
              type="button"
              onClick={() => setSelectedCard(card)}
              className="sr-only rounded-full border border-blue/60 bg-black/90 px-4 py-2 text-sm font-semibold text-foreground focus:not-sr-only focus:relative focus:m-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-blue"
            >
              {card.title} — {t.projects.open}
            </button>
          </li>
        ))}
      </ul>

      <CardDetail />
    </CardContext.Provider>
  )
}
