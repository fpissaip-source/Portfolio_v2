import Link from 'next/link'
import { pfad } from '@/lib/hd2-site'

/*
 * Die Bausteine der neuen Hareb-Digital-Seite.
 *
 * Uebernommen aus github.com/fpissaip-source/harebdigital (components/
 * bausteine.tsx). Zwei Abweichungen, beide der Vorschau geschuldet:
 *
 * 1. `Knopf` schickt seinen Verweis durch `pfad()`. Im Ursprung liegt die
 *    Seite auf der Wurzel ihrer Domain, hier unter /start.
 * 2. `Projektbild` bleibt ein handgeschriebenes <picture> mit AVIF und WebP
 *    und wird NICHT auf next/image umgestellt. Im Ursprung ist der
 *    Bildoptimierer wegen `output: "export"` abgeschaltet, und die Dateien
 *    liegen bereits in beiden Formaten vor — next/image daraufzusetzen hiesse,
 *    fertige Bilder ein zweites Mal umzurechnen.
 */

export function Abschnitt({
  id,
  children,
  className = '',
}: {
  id?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section id={id} className={`mx-auto max-w-6xl px-5 py-16 sm:py-20 ${className}`}>
      {children}
    </section>
  )
}

export function Ueberschrift({
  eyebrow,
  children,
}: {
  eyebrow?: string
  children: React.ReactNode
}) {
  return (
    <>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-leuchten">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{children}</h2>
    </>
  )
}

export function Knopf({
  href,
  children,
  variante = 'voll',
}: {
  href: string
  children: React.ReactNode
  variante?: 'voll' | 'leer'
}) {
  const stil =
    variante === 'voll'
      ? 'bg-signal text-white hover:opacity-90'
      : 'border border-white/20 text-kreide hover:border-white/40'
  return (
    <Link
      href={pfad(href)}
      className={`inline-flex items-center rounded-lg px-5 py-3 text-sm font-medium transition ${stil}`}
    >
      {children}
    </Link>
  )
}

export function Karte({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-kohle/60 p-6 transition-colors hover:border-white/20">
      {children}
    </div>
  )
}

export function Projektbild({ name, alt }: { name: string; alt: string }) {
  return (
    <picture>
      <source srcSet={`/projekte/${name}.avif`} type="image/avif" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/projekte/${name}.webp`}
        alt={alt}
        width={1600}
        height={1000}
        loading="lazy"
        decoding="async"
        className="aspect-[16/10] w-full rounded-xl border border-white/10 object-cover object-top"
      />
    </picture>
  )
}
