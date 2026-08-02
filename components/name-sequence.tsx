'use client'

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import { DecodeName, type NeonLineHandle } from './decode-name'
import { useT } from './language-context'

export type NameSequenceHandle = {
  /** 0 = hidden, 1 = fully assembled and solid. */
  setProgress: (progress: number) => void
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))
const segment = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start))

/**
 * The name, introduced one beat at a time: I → am → Issa Hareb.
 *
 * Unlike the old IntersectionObserver version, this component is fully
 * controlled by its parent. The same scroll progress that seeks the film
 * now drives every word, every join and the final solidification. That makes
 * the sequence deterministic after jump navigation and reversible when the
 * visitor scrolls back up.
 */
export const NameSequence = forwardRef<NameSequenceHandle>(function NameSequence(_, ref) {
  const t = useT()
  const rootRef = useRef<HTMLDivElement>(null)
  const fitRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<NeonLineHandle>(null)
  const progressRef = useRef(0)
  const applyRef = useRef<(progress: number) => void>(() => {})
  const words = t.about.nameWords

  useImperativeHandle(
    ref,
    () => ({
      setProgress: (progress) => applyRef.current(progress),
    }),
    [],
  )

  useEffect(() => {
    const line = lineRef.current
    if (!line) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const apply = (rawProgress: number) => {
      const progress = clamp01(rawProgress)
      progressRef.current = progress

      if (reduced) {
        words.forEach((_, index) => {
          line.setJoin(index, 1)
          line.setWord(index, 1)
        })
        line.setSolidify(1)
        return
      }

      // Four deliberately overlapping beats. The first two read as
      // "I … am"; ISSA and HAREB then arrive close enough to land as one
      // name. Because every value comes from progress, the whole sequence
      // reverses cleanly rather than remaining stuck in its played state.
      const starts = [0.06, 0.24, 0.45, 0.58]
      const ends = [0.22, 0.4, 0.65, 0.79]

      words.forEach((_, index) => {
        const start = starts[index] ?? 0.06 + index * 0.16
        const end = ends[index] ?? start + 0.2
        line.setJoin(index, index === 0 ? 1 : segment(progress, start - 0.09, start + 0.03))
        line.setWord(index, segment(progress, start, end))
      })
      line.setSolidify(segment(progress, 0.77, 0.98))
    }

    applyRef.current = apply
    apply(progressRef.current)
    return () => {
      applyRef.current = () => {}
    }
  }, [words])

  // Scale the finished line down if it would be wider than the column.
  // Measurement temporarily opens every word, then immediately restores the
  // exact current scroll state so resizing never flashes the finished name.
  useEffect(() => {
    const box = fitRef.current
    const line = lineRef.current
    if (!box || !line) return

    const fit = () => {
      const spans = box.querySelectorAll<HTMLElement>('[data-neon-text] > span')
      if (spans.length < 2) return

      box.style.transform = 'scale(1)'
      words.forEach((_, index) => line.setJoin(index, 1))
      const first = spans[0].getBoundingClientRect()
      const last = spans[spans.length - 1].getBoundingClientRect()
      const needed = last.right - first.left
      const available = box.clientWidth
      box.style.transform =
        needed > available ? `scale(${(available / needed).toFixed(4)})` : ''
      applyRef.current(progressRef.current)
    }

    fit()
    document.fonts?.ready?.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [words])

  return (
    <div ref={rootRef} className="relative flex flex-col items-center text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-blue/90">
        {t.about.introTitle}
      </p>
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
})
