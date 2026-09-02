'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { HdTexte } from '@/lib/hd-texte'

/**
 * Das Kartenmenue der Landingpage.
 *
 * Herkunft: React Bits, CardNav (github.com/DavidHDev/react-bits,
 * src/content/Components/CardNav). Die Idee ist die Wow-Stelle: die
 * Kopfzeile ist geschlossen eine Leiste und faehrt beim Oeffnen nach unten
 * auf, waehrend drei Karten von unten hereinfahren, versetzt. Kein
 * Vollbild-Overlay, keine Liste, die aufklappt — die Leiste selbst wird zum
 * Menue.
 *
 * Abweichungen von der Vorlage, alle mit Grund:
 *
 * 1. Kein GSAP. Die Vorlage baut eine Timeline und misst die Zielhoehe bei
 *    jedem Rendern nach. Hier reicht ein CSS-Uebergang auf `height` mit
 *    einer gemessenen Zielhoehe: eine Abhaengigkeit weniger, und die
 *    Landingpage laedt GSAP ohnehin schon fuer den Scroll-Film — zwei
 *    Animationssysteme auf demselben Element sind eine Fehlerquelle.
 *
 * 2. Ein echter <button> statt eines <div role="button">. Die Vorlage baut
 *    Tastaturbedienung von Hand nach (onKeyDown auf Enter und Leertaste);
 *    ein Knopf kann das selbst, samt Fokusreihenfolge und Ansage.
 *
 * 3. `aria-expanded` und `aria-controls` zeigen auf die Karten, und die
 *    Escape-Taste schliesst. Ohne das ist ein aufgeklapptes Menue fuer
 *    jemanden mit Tastatur eine Sackgasse.
 *
 * 4. Die Vorlage haelt den Knopf rechts fuer sich. Hier stehen dort der
 *    Sprachschalter und der Anker, auf dem der Anfrage-Knopf landet, wenn er
 *    aus der Buehne heraufgeflogen kommt. Beides gehoert in die Leiste, und
 *    beides muss ueber der aufgefahrenen Flaeche bleiben.
 *
 * 5. Geschlossen ist die Leiste durchsichtig, solange der Film laeuft, und
 *    bekommt erst darunter ihren Grund. Das war schon so, bevor das Menue
 *    kam, und es ist der Grund, warum der Film oben nicht abgeschnitten
 *    wirkt.
 */

const GESCHLOSSEN = 64

export function HdKartenmenue({
  t,
  formular,
  ueberDemFilm,
  ankerRef,
  kinder,
  rechts,
}: {
  t: HdTexte
  /** Sprachrichtiger Pfad zur Anfrageseite; ersetzt `{formular}`. */
  formular: string
  /** Solange der Film laeuft, bleibt die Leiste ohne Grund. */
  ueberDemFilm: boolean
  /** Der Anker fuer den Knopf, der aus der Buehne heraufkommt. */
  ankerRef?: React.Ref<HTMLSpanElement>
  /** Der Knopf selbst, falls er gerade oben steht. */
  kinder?: React.ReactNode
  /** Sprachschalter. */
  rechts?: React.ReactNode
}) {
  const [offen, setOffen] = useState(false)
  const [hoehe, setHoehe] = useState(GESCHLOSSEN)
  const flaeche = useRef<HTMLDivElement>(null)
  const inhalt = useRef<HTMLDivElement>(null)
  const id = useId()

  /* Die Zielhoehe wird gemessen, nicht geraten. Auf dem Telefon stehen die
     drei Karten untereinander, am Rechner nebeneinander, und beim
     Sprachwechsel aendert sich die Textlaenge. Eine feste Zahl waere in
     genau diesen drei Faellen falsch. */
  const messen = useCallback(() => {
    const el = inhalt.current
    if (!el) return GESCHLOSSEN
    return GESCHLOSSEN + el.scrollHeight + 12
  }, [])

  useEffect(() => {
    if (!offen) {
      setHoehe(GESCHLOSSEN)
      return
    }
    setHoehe(messen())
    const beobachter = new ResizeObserver(() => setHoehe(messen()))
    if (inhalt.current) beobachter.observe(inhalt.current)
    window.addEventListener('resize', () => setHoehe(messen()))
    return () => beobachter.disconnect()
  }, [offen, messen])

  /* Escape schliesst, und ein Klick auf einen Verweis auch: wer im Menue auf
     einen Abschnitt springt, will das Menue danach nicht mehr sehen. */
  useEffect(() => {
    if (!offen) return
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOffen(false)
    }
    document.addEventListener('keydown', taste)
    return () => document.removeEventListener('keydown', taste)
  }, [offen])

  const ziel = (href: string) => (href === '{formular}' ? formular : href)

  return (
    <div
      ref={flaeche}
      className={`hd-kartenmenue ${offen ? 'hd-kartenmenue--offen' : ''}`}
      style={{ height: hoehe }}
      data-ueber-film={ueberDemFilm ? 'ja' : 'nein'}
    >
      <div className="hd-kartenmenue__leiste">
        <button
          type="button"
          className={`hd-burger ${offen ? 'hd-burger--offen' : ''}`}
          aria-expanded={offen}
          aria-controls={id}
          aria-label={offen ? t.menue.schliessen : t.menue.oeffnen}
          onClick={() => setOffen((v) => !v)}
        >
          <span aria-hidden className="hd-burger__strich" />
          <span aria-hidden className="hd-burger__strich" />
        </button>

        <Link href="/start" className="hd-kartenmenue__marke">
          <Image src="/icon-32-v2.png" alt="" width={28} height={28} className="rounded-lg" />
          <span className="font-display text-[18px] font-bold tracking-tight">Hareb Digital</span>
        </Link>

        <div className="hd-kartenmenue__rechts">
          {rechts}
          <span ref={ankerRef} className="relative inline-flex h-11 w-11 shrink-0">
            {kinder}
          </span>
        </div>
      </div>

      <div id={id} ref={inhalt} className="hd-kartenmenue__inhalt" aria-hidden={!offen}>
        {t.menue.karten.map((karte, i) => (
          <div
            key={karte.label}
            className="hd-kartenmenue__karte"
            /* Versetzt hereinfahren. Die Verzoegerung steht als Variable im
               Stil, damit die Reihenfolge im CSS bleibt und hier nur die
               Zahl der Karte. */
            style={{ '--verzug': `${i * 0.07}s` } as React.CSSProperties}
          >
            <span className="hd-kartenmenue__label">{karte.label}</span>
            <ul className="hd-kartenmenue__links">
              {karte.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={ziel(l.href)}
                    onClick={() => setOffen(false)}
                    tabIndex={offen ? undefined : -1}
                    {...(l.href.startsWith('http')
                      ? { target: '_blank', rel: 'noreferrer' }
                      : {})}
                  >
                    <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
