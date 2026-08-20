'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'

/**
 * The project-type chooser on the enquiry page.
 *
 * A native `<select>` was the honest first version and the wrong one. Its
 * menu is drawn by the operating system: on Windows it is a grey list in
 * Segoe UI, on Android a full-screen sheet. Nothing about it can be styled,
 * so on the one page where a visitor is deciding whether to trust the
 * person who built the site, the most important control looked like it came
 * from somewhere else. It also cannot hold a second line, and each of these
 * four options needs one — "Sichtbarkeit erhöhen" means nothing on its own.
 *
 * So: a listbox built from scratch, which means the keyboard and screen
 * reader behaviour the browser used to provide has to be provided here.
 * That is the actual cost of leaving the native element, and it is paid in
 * full below — roving focus with the arrow keys, Home and End, Enter and
 * Space to commit, Escape to abandon, typeahead on first letter, plus the
 * `aria-activedescendant` wiring that tells a screen reader which option is
 * current without moving real focus off the button.
 *
 * The animation is deliberately not a fade. A fade tells you the panel
 * appeared; the stagger tells you it is a list, and how long a list, before
 * a single word has been read. It costs 160 milliseconds and it is the
 * difference between a menu and a moment.
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
  placeholder: string
  name: string
}

export function ProjectTypeSelect({
  options,
  value,
  onChange,
  label,
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

  const close = useCallback(
    (refocus = true) => {
      setOpen(false)
      if (refocus) buttonRef.current?.focus()
    },
    [],
  )

  const commit = useCallback(
    (index: number) => {
      const option = options[index]
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

  // A click anywhere else closes it, without stealing focus back: the
  // visitor is already on their way somewhere.
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
    <div ref={wrapRef} className="relative">
      <span id={`${id}-label`} className="enquiry-label">
        {label}
      </span>

      {/* The real value for the form submission. Hidden rather than absent
          so `new FormData(form)` still finds it and nothing downstream has
          to know this control is not a native select. */}
      <input type="hidden" name={name} value={value} />

      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-opt-${active}` : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={`enquiry-field mt-2.5 flex w-full items-center justify-between gap-4 text-left ${
          open ? 'enquiry-field-open' : ''
        } ${selected ? 'enquiry-field-filled' : ''}`}
      >
        <span className="min-w-0">
          <span
            className={`block truncate text-[17px] ${
              selected ? 'font-medium text-foreground' : 'text-foreground/45'
            }`}
          >
            {selected ? selected.title : placeholder}
          </span>
          {selected && (
            <span className="mt-0.5 block truncate text-[14px] text-foreground/55">
              {selected.detail}
            </span>
          )}
        </span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 30 }}
          className="shrink-0 text-foreground/55"
        >
          <ChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            aria-labelledby={`${id}-label`}
            tabIndex={-1}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scaleY: 0.94 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scaleY: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scaleY: 0.97 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: 'spring', stiffness: 460, damping: 34, mass: 0.7 }
            }
            /* Grow from the button, not from the middle: the panel should
               look like it came out of the control that opened it. */
            style={{ transformOrigin: 'top center' }}
            className="enquiry-menu absolute z-30 mt-2 w-full overflow-hidden p-1.5"
          >
            {options.map((option, index) => {
              const isActive = index === active
              const isSelected = option.value === value
              return (
                <motion.li
                  key={option.value}
                  id={`${id}-opt-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { delay: 0.03 + index * 0.035, duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                  }
                  onMouseEnter={() => setActive(index)}
                  onClick={() => commit(index)}
                  className="relative cursor-pointer rounded-xl px-4 py-3.5"
                >
                  {/* One highlight that travels between options instead of
                      four that fade independently. `layoutId` makes the move
                      continuous, which is what makes the list feel like a
                      single object rather than a stack of buttons. */}
                  {isActive && (
                    <motion.span
                      layoutId={`${id}-hl`}
                      aria-hidden
                      className="enquiry-menu-highlight absolute inset-0 rounded-xl"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 520, damping: 40 }
                      }
                    />
                  )}
                  <span className="relative flex items-start gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[16px] font-medium leading-snug text-foreground">
                        {option.title}
                      </span>
                      <span className="mt-1 block text-[14px] leading-[1.5] text-foreground/60">
                        {option.detail}
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className={`mt-0.5 shrink-0 transition-opacity duration-200 ${
                        isSelected ? 'text-accent-tint opacity-100' : 'opacity-0'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </span>
                  </span>
                </motion.li>
              )
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
