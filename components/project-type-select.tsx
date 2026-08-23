'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ChevronDown } from 'lucide-react'

/**
 * The project-type chooser on the enquiry page.
 *
 * A native `<select>` was the honest first version and the wrong one. Its
 * menu is drawn by the operating system: on Windows a grey list in Segoe UI,
 * on Android a full-screen sheet. Nothing about it can be styled, so on the
 * one page where a visitor is deciding whether to trust the person who built
 * the site, the most important control looked like it came from somewhere
 * else. It also cannot hold a second line, and each of these four options
 * needs one — "Sichtbarkeit erhöhen" means nothing on its own.
 *
 * The second version replaced it with a rounded box and a violet focus ring,
 * which is what every component library ships and therefore says nothing.
 * This is the third. It borrows the vocabulary the rest of the site already
 * uses: a baseline instead of a border, poster numerals instead of bullets,
 * one accent bar that travels rather than four states that fade.
 *
 * The panel opens by unclipping downward rather than fading. A fade tells you
 * something appeared; a wipe tells you it came out of the control you just
 * pressed, and the stagger behind it tells you how long the list is before a
 * word has been read. That is 200 milliseconds doing actual work.
 *
 * Leaving the native element means the keyboard and screen-reader behaviour
 * the browser used to provide has to be provided here. That is the real cost,
 * and it is paid in full below: roving highlight with the arrow keys, Home
 * and End, Enter and Space to commit, Escape to abandon, first-letter
 * typeahead, and `aria-activedescendant` so a screen reader is told which
 * option is current without focus ever leaving the button.
 */

export type ProjectOption = {
  value: string
  title: string
  detail: string
}

type Props = {
  options: readonly ProjectOption[]
  value: string
  onChange: (value: string) => void
  label: string
  index: string
  placeholder: string
  name: string
}

export function ProjectTypeSelect({
  options,
  value,
  onChange,
  label,
  index,
  placeholder,
  name,
}: Props) {
  const reduce = useReducedMotion()
  const id = useId()
  const [open, setOpen] = useState(false)
  /* Which option the keyboard is on. Distinct from `value`: you can walk the
     list without choosing anything, and Escape must leave the old choice
     standing. */
  const [active, setActive] = useState(0)

  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  const close = useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }, [])

  const commit = useCallback(
    (i: number) => {
      const option = options[i]
      if (!option) return
      onChange(option.value)
      close()
    },
    [options, onChange, close],
  )

  // Opening puts the cursor on the current choice rather than at the top —
  // reopening a menu to change your mind should not lose your place.
  useEffect(() => {
    if (!open) return
    const current = options.findIndex((o) => o.value === value)
    setActive(current >= 0 ? current : 0)
  }, [open, options, value])

  // A click anywhere else closes it, without stealing focus back: the visitor
  // is already on their way somewhere.
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  // Keep the highlighted option in view when arrowing past the fold.
  useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  function onKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActive((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActive((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(active)
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        // Tab means "I am done here" — keep the choice, let focus leave.
        setOpen(false)
        break
      default: {
        if (event.key.length !== 1) break
        const from = active + 1
        const order = [...options.slice(from), ...options.slice(0, from)]
        const hit = order.find((o) =>
          o.title.toLowerCase().startsWith(event.key.toLowerCase()),
        )
        if (hit) setActive(options.indexOf(hit))
      }
    }
  }

  return (
    <div
      ref={wrapRef}
      className="enquiry-row"
      data-filled={selected ? 'true' : 'false'}
    >
      <span id={`${id}-label`} className="enquiry-label">
        <span className="enquiry-num" aria-hidden>
          {index}
        </span>
        {label}
      </span>

      {/* The real value for the form submission. Hidden rather than absent so
          the value travels with the form and nothing downstream has to know
          this control is not a native select. */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={buttonRef}
        /* Fester Bezeichner neben der erzeugten `useId`-Familie: das Formular
           setzt beim unvollstaendigen Absenden den Fokus auf das erste
           fehlende Feld, und dafuer braucht es einen Namen, den es kennt. */
        id="projekt-auswahl"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className="enquiry-input mt-2 w-full"
      >
        <span className="min-w-0">
          <span
            className={`block truncate ${
              selected ? 'font-medium text-foreground' : 'text-foreground/34'
            }`}
          >
            {selected ? selected.title : placeholder}
          </span>
          {selected && (
            /* Wrapping rather than truncating: the second line is the
               confirmation that the right thing was picked, and an ellipsis
               in the middle of it confirms nothing. */
            <span className="mt-1.5 block text-[14px] leading-[1.45] text-foreground/55">
              {selected.detail}
            </span>
          )}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={
            reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 30 }
          }
          className="mt-1 shrink-0 text-foreground/50"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <div className="enquiry-rule" />
      <span className="enquiry-glow" aria-hidden />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="enquiry-menu absolute left-0 right-0 top-full z-30 mt-3 overflow-hidden p-1.5"
          >
            {/* The wipe. `clipPath` on an inner wrapper rather than height on
                the panel: animating height reflows the list on every frame,
                and clipping does not touch layout at all. */}
            <motion.ul
              ref={listRef}
              id={`${id}-list`}
              role="listbox"
              aria-labelledby={`${id}-label`}
              tabIndex={-1}
              initial={reduce ? false : { clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              exit={reduce ? undefined : { clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              {options.map((option, i) => {
                const isActive = i === active
                const isSelected = option.value === value
                return (
                  <motion.li
                    key={option.value}
                    id={`${id}-opt-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : {
                            delay: 0.06 + i * 0.045,
                            duration: 0.32,
                            ease: [0.22, 1, 0.36, 1],
                          }
                    }
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(i)}
                    className={`relative cursor-pointer overflow-hidden rounded-[0.7rem] py-3.5 pl-5 pr-4 ${
                      isActive ? 'enquiry-opt-active' : ''
                    }`}
                  >
                    {/* One wash and one bar that travel between the options
                        instead of four that fade independently. `layoutId`
                        makes the move continuous, which is what turns a stack
                        of rows into a single instrument. */}
                    {isActive && (
                      <>
                        <motion.span
                          layoutId={`${id}-wash`}
                          aria-hidden
                          className="enquiry-opt-highlight absolute inset-0 rounded-[0.7rem]"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 520, damping: 42 }
                          }
                        />
                        <motion.span
                          layoutId={`${id}-bar`}
                          aria-hidden
                          className="enquiry-opt-bar absolute bottom-1.5 left-0 top-1.5 w-[3px] rounded-full"
                          transition={
                            reduce
                              ? { duration: 0 }
                              : { type: 'spring', stiffness: 520, damping: 42 }
                          }
                        />
                      </>
                    )}

                    <span className="relative flex items-start gap-4">
                      <span className="enquiry-opt-num mt-0.5 shrink-0 tabular-nums" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block text-[16.5px] font-medium leading-snug ${
                            isSelected ? 'text-accent-tint' : 'text-foreground'
                          }`}
                        >
                          {option.title}
                        </span>
                        <span className="mt-1 block text-[14px] leading-[1.5] text-foreground/58">
                          {option.detail}
                        </span>
                      </span>
                      {/* A dot, not a tick. A tick reads as "done"; this is a
                          choice among four, and the dot says which one. */}
                      <span
                        aria-hidden
                        className={`mt-2 h-2 w-2 shrink-0 rounded-full transition-all duration-200 ${
                          isSelected
                            ? 'scale-100 bg-accent-tint shadow-[0_0_12px_2px_color-mix(in_oklch,var(--purple)_70%,transparent)]'
                            : 'scale-0 bg-transparent'
                        }`}
                      />
                    </span>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
