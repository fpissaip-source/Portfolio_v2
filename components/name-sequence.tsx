'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { DecodeName, type NeonLineHandle } from './decode-name'
import { useT } from './language-context'

/**
 * The name, introduced one beat at a time: I → am → Issa Hareb.
 *
 * It builds on a single line and stays centred the whole way, because every
 * word that hasn't arrived yet takes up no width at all (DecodeName's
 * `setJoin`) — so the line grows outward from its own middle instead of
 * sliding sideways as words appear. Each word decodes in place: a scan head
 * runs through it, letters flicker through random glyphs just ahead of it,
 * and lock in with a spark. Once the whole line is standing it settles from
 * the blue "signal" glow into solid purple ink — the site's title colour.
 *
 * Plays once, when the line comes into view. Under prefers-reduced-motion it
 * simply *is* the finished line: same composition, nothing moves.
 */
export function NameSequence() {
  const t = useT()
  const rootRef = useRef<HTMLDivElement>(null)
  const fitRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<NeonLineHandle>(null)
  /** Set once the reveal has started, so a later re-fit (font load, resize,
   *  rotation) re-measures without collapsing a line that is already up. */
  const playedRef = useRef(false)
  const words = t.about.nameWords

  // Scale the finished line down if it would be wider than the column —
  // "ICH BIN ISSA HAREB" at the desktop size runs off a phone screen. A
  // transform rather than a smaller font-size: DecodeName measures word
  // widths in px for its collapse, and changing the font under it would
  // invalidate every one of those measurements.
  useEffect(() => {
    const box = fitRef.current
    const line = lineRef.current
    if (!box || !line) return
    const fit = () => {
      // Measure at full width. Safe to do at any time: the letters are
      // still fully transparent until their word's reveal runs, so nothing
      // flashes — only the (invisible) boxes change size.
      const spans = box.querySelectorAll<HTMLElement>('[data-neon-text] > span')
      if (spans.length < 2) return
      box.style.transform = 'scale(1)'
      words.forEach((_, i) => line.setJoin(i, 1))
      const first = spans[0].getBoundingClientRect()
      const last = spans[spans.length - 1].getBoundingClientRect()
      const needed = last.right - first.left
      const available = box.clientWidth
      // getBoundingClientRect keeps reporting real positions even where the
      // line overflows and is clipped, so this stays correct when it does.
      box.style.transform = needed > available ? `scale(${(available / needed).toFixed(4)})` : ''
      if (!playedRef.current) words.forEach((_, i) => line.setJoin(i, i === 0 ? 1 : 0))
    }
    fit()
    document.fonts?.ready?.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [words])

  useEffect(() => {
    const root = rootRef.current
    const line = lineRef.current
    if (!root || !line) return

    const settle = () => {
      playedRef.current = true
      words.forEach((_, i) => {
        line.setJoin(i, 1)
        line.setWord(i, 1)
      })
      line.setSolidify(1)
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settle()
      return
    }

    let timeline: gsap.core.Timeline | undefined
    const play = () => {
      playedRef.current = true
      const state = { solidify: 0 }
      const tl = gsap.timeline()
      timeline = tl
      words.forEach((_, i) => {
        // Beat spacing: the first two words get a clear pause between them
        // ("I" … "am"), the last two overlap heavily so "Issa Hareb" lands
        // as one name rather than two separate words.
        const at = i < 2 ? i * 0.75 : 1.5 + (i - 2) * 0.3
        if (i > 0) {
          const j = { v: 0 }
          tl.to(
            j,
            {
              v: 1,
              duration: 0.45,
              ease: 'power3.out',
              onUpdate: () => line.setJoin(i, j.v),
            },
            at,
          )
        }
        const p = { v: 0 }
        tl.to(
          p,
          {
            v: 1,
            duration: 0.7,
            ease: 'none',
            onUpdate: () => line.setWord(i, p.v),
          },
          at,
        )
      })
      tl.to(
        state,
        {
          solidify: 1,
          duration: 0.9,
          ease: 'power2.inOut',
          onUpdate: () => line.setSolidify(state.solidify),
        },
        '>-0.15',
      )
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        play()
      },
      { threshold: 0.5 },
    )
    io.observe(root)
    return () => {
      io.disconnect()
      timeline?.kill()
    }
  }, [words])

  return (
    <div ref={rootRef} className="relative flex flex-col items-center text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue/90">
        {t.about.introTitle}
      </p>
      {/* DecodeName is aria-hidden (it is a pile of flickering glyph spans),
          so the actual sentence is exposed here once, in text. */}
      <h2 className="sr-only">{words.join(' ')}</h2>
      <div ref={fitRef} className="mt-5 w-full">
        <DecodeName
          ref={lineRef}
          words={words}
          className="h-[14vh] min-h-[76px] w-full text-4xl font-bold sm:text-6xl md:text-7xl"
        />
      </div>
    </div>
  )
}
