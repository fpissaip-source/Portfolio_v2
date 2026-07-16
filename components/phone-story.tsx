'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { LineReveal } from './anim'

gsap.registerPlugin(ScrollTrigger)

/**
 * Cinematic interlude — the fact carries itself, so the typography stays
 * quiet and enormous. Behind it: the instrument itself, traced as a bare
 * line-art silhouette that draws its own outline in as you scroll, rather
 * than a rendered product shot.
 */
export function PhoneStory() {
  const sectionRef = useRef<HTMLElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const svg = svgRef.current
    if (!section || !svg) return
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    const body = svg.querySelector<SVGGeometryElement>('[data-draw-body]')
    const details = Array.from(
      svg.querySelectorAll<SVGGeometryElement>('[data-draw-detail]'),
    )
    const shapes = [body, ...details].filter((el): el is SVGGeometryElement => !!el)
    const lengths = shapes.map((el) => el.getTotalLength())
    shapes.forEach((el, i) => {
      el.style.strokeDasharray = `${lengths[i]}`
      el.style.strokeDashoffset = prefersReduced ? '0' : `${lengths[i]}`
    })

    const textEls = Array.from(svg.querySelectorAll<SVGTextElement>('[data-screen-text]'))

    if (prefersReduced) {
      textEls.forEach((el) => {
        el.style.opacity = '1'
      })
      return
    }

    const ctx = gsap.context(() => {
      const proxy = { p: 0 }
      gsap.to(proxy, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'top 25%',
          scrub: 0.6,
        },
        onUpdate: () => {
          // The body traces first, like a single pen stroke describing the
          // silhouette; the smaller details (island, buttons) only start
          // drawing once the body is most of the way around.
          const bodyT = Math.min(1, proxy.p / 0.7)
          const detailT = Math.max(0, Math.min(1, (proxy.p - 0.55) / 0.45))
          shapes.forEach((el, i) => {
            const t = i === 0 ? bodyT : detailT
            el.style.strokeDashoffset = `${lengths[i] * (1 - t)}`
          })
          // The screen only "powers on" once the outline is essentially
          // fully drawn — the text lights up from nothing, brightening its
          // own glow as it settles, like a phone waking up.
          const textT = Math.max(0, Math.min(1, (proxy.p - 0.72) / 0.28))
          const eased = textT * textT * (3 - 2 * textT)
          textEls.forEach((el) => {
            el.style.opacity = String(eased)
            el.style.filter = `blur(${(1 - eased) * 4}px) drop-shadow(0 0 ${
              2 + eased * 12
            }px rgba(167,139,250,${0.6 * eased})) drop-shadow(0 0 ${
              1 + eased * 6
            }px rgba(255,255,255,${0.55 * eased}))`
            el.style.transform = `translateY(${(1 - eased) * 8}px)`
          })
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="phone"
      aria-label="Built entirely on a phone"
      className="relative overflow-hidden px-6 py-40 sm:py-56"
    >
      {/* the instrument itself — a bare outline that draws itself in */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 1.06 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-15% 0px' }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-1/2 top-1/2 aspect-video w-[max(120vw,900px)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(1400px,100vw)]"
      >
        <svg
          ref={svgRef}
          viewBox="0 0 400 820"
          className="absolute left-1/2 top-1/2 h-[92%] -translate-x-1/2 -translate-y-1/2 opacity-80"
          fill="none"
        >
          <defs>
            <linearGradient id="phoneOutline" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--purple)" />
              <stop offset="55%" stopColor="white" />
              <stop offset="100%" stopColor="var(--blue)" />
            </linearGradient>
            <linearGradient id="screenText" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--purple)" />
              <stop offset="50%" stopColor="white" />
              <stop offset="100%" stopColor="var(--blue)" />
            </linearGradient>
          </defs>
          <rect
            data-draw-body
            x="20"
            y="20"
            width="360"
            height="780"
            rx="72"
            stroke="url(#phoneOutline)"
            strokeWidth="3"
          />
          <rect
            data-draw-detail
            x="155"
            y="54"
            width="90"
            height="26"
            rx="13"
            stroke="url(#phoneOutline)"
            strokeWidth="2.5"
          />
          <rect
            data-draw-detail
            x="9"
            y="176"
            width="6"
            height="46"
            rx="3"
            stroke="url(#phoneOutline)"
            strokeWidth="2.5"
          />
          <rect
            data-draw-detail
            x="9"
            y="240"
            width="6"
            height="88"
            rx="3"
            stroke="url(#phoneOutline)"
            strokeWidth="2.5"
          />
          <rect
            data-draw-detail
            x="385"
            y="220"
            width="6"
            height="110"
            rx="3"
            stroke="url(#phoneOutline)"
            strokeWidth="2.5"
          />

          {/* screen content — lights up in place once the outline finishes
              drawing, like the phone waking up */}
          <text
            data-screen-text
            x="200"
            y="541"
            textAnchor="middle"
            className="font-sans"
            style={{ opacity: 0, fontSize: '28px', fontWeight: 900, letterSpacing: '0.01em' }}
            fill="url(#screenText)"
          >
            NO PC.
          </text>
          <text
            data-screen-text
            x="200"
            y="583"
            textAnchor="middle"
            className="font-sans"
            style={{ opacity: 0, fontSize: '28px', fontWeight: 900, letterSpacing: '0.01em' }}
            fill="url(#screenText)"
          >
            NO LAPTOP.
          </text>
          <text
            data-screen-text
            x="200"
            y="617"
            textAnchor="middle"
            className="font-sans"
            style={{ opacity: 0, fontSize: '17px', fontWeight: 700, letterSpacing: '0.02em' }}
            fill="url(#screenText)"
          >
            EVERYTHING BUILT ENTIRELY ON IPHONE.
          </text>
          <text
            data-screen-text
            x="200"
            y="658"
            textAnchor="middle"
            className="font-mono uppercase"
            style={{ opacity: 0, fontSize: '13px', fontWeight: 600, letterSpacing: '0.32em' }}
            fill="rgba(255,255,255,0.65)"
          >
            6.1-inch screen &middot; Germany
          </text>
        </svg>
        {/* melt the outline's edges into the page background */}
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_50%,transparent_45%,#050505_92%)]" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <LineReveal
          className="text-balance font-sans text-4xl font-semibold leading-[1.12] tracking-tight sm:text-6xl md:text-7xl"
          stagger={0.16}
          lines={[
            <>Every system on this page,</>,
            <>
              <span className="text-muted-foreground">
                the agent, the platforms, the deployments,
              </span>
            </>,
            <>was designed, written and shipped</>,
            <>
              <span className="bg-gradient-to-br from-purple via-white to-blue bg-clip-text text-transparent">
                on a phone.
              </span>
            </>,
          ]}
        />
      </div>
    </section>
  )
}
