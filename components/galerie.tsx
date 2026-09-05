'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { gsap } from 'gsap'

/**
 * Die Galerie: DepthCarousel, portiert von React Bits (reactbits.dev).
 *
 * Warum dieses und nicht das vorherige: hier sollen Bildschirmfotos UND
 * Videos nebeneinander stehen. Die schoenen Schauen von React Bits
 * (CircularGallery, FlyingPosters, MorphSlider) rechnen mit WebGL und laden
 * jedes Stueck als Textur — ein <video> bekommt man da nicht hinein. Von den
 * Schauen, die im DOM bleiben, ist DepthCarousel die einzige, die eine Karte
 * gross in die Mitte stellt und den Rest gestaffelt dahinter: ein Stapel
 * Browserfenster, der nach hinten wegkippt. Genau das Bild, das die Vorlage
 * vorgibt, und es traegt jeden Inhalt, den man in eine Karte legen kann.
 *
 * Keine Beschriftung, kein Titel, kein Verweis: es ist eine Galerie. Was zu
 * sehen ist, steht in den Bildern.
 *
 * Sieben Abweichungen von der Vorlage:
 *
 * 1. Bild ODER Video je Stueck. Es laeuft immer nur das Stueck in der Mitte,
 *    und nur, solange die Schau im Bild ist — fuenf gleichzeitig laufende
 *    Videos hinter einem Weichzeichner bringen jedes Telefon zum Stocken.
 * 2. Das Rad nimmt nur die Waagerechte. Die Vorlage faengt jedes Rad ab
 *    (`preventDefault`) und dreht auch bei senkrechtem Scrollen weiter — auf
 *    einer Seite mit weichem Scrollen bleibt man dann in der Schau haengen.
 * 3. Groesse aus der Breite statt fester Pixel: Kartengroesse, Versatz und
 *    Hoehe des Kastens haengen an der gemessenen Breite.
 * 4. Fehler der Vorlage: `reducedRef` wird nur im Autoplay-Effekt gesetzt.
 *    Ohne Autoplay bleibt es `false`, und bei abgeschalteter Bewegung wird
 *    trotzdem getweent. Hier steht es in einem eigenen Effekt und hoert auf
 *    Aenderungen.
 * 5. Fehler der Vorlage: der Klick auf eine Karte prueft `dragRef.current?.moved`,
 *    aber `dragRef` ist beim Klick schon geleert (pointerup laeuft vorher).
 *    Jedes Ziehen, das ueber einer Karte endet, sprang deshalb zurueck.
 *    Hier merkt sich ein Zeitstempel das Ziehen.
 * 6. Kein Weichzeichner auf schmalen Geraeten. `filter: blur()` auf einem
 *    laufenden Video kostet dort mehr, als es aussieht.
 * 7. Bei abgeschalteter Bewegung bekommt das mittige Video Bedienelemente:
 *    ohne Selbststart braucht es einen Weg, es zu starten.
 * 8. Fehler der Vorlage: die Buehne verschluckt den Klick auf die hinteren
 *    Karten (siehe `.galerie-buehne` in globals.css). In der Vorlage faellt
 *    das nicht auf, weil dort die Nachbarn kaum herausragen.
 */

export type Schaustueck =
  | {
      art: 'bild'
      id: string
      quelle: string
      /* Natuerliche Masse. Ohne sie liefert Next kein Bild ohne Platzsprung. */
      breite: number
      hoehe: number
    }
  | { art: 'video'; id: string; quelle: string; standbild: string }

type Props = {
  stuecke: Schaustueck[]
  label: string
  vorher: string
  weiter: string
  /** Aria-Beschriftung je Folie, `{n}` und `{von}` werden ersetzt. */
  folie: string
}

/* Der Entwurf, in dem die Zahlen unten stimmen. Alles darunter wird
   proportional verkleinert, nichts einzeln nachgestellt. 16:10, weil in jeder
   Karte ein Browserfenster steckt und kein Kinobild. */
const KARTE_BREIT = 880
const KARTE_HOCH = 550

/* Zwei Geometrien statt einer. Der Faecher der Vorlage rechnet mit hochkant
   stehenden Karten, deren Versatz fast ein Drittel ihrer Breite betraegt —
   erst dadurch schaut der Nachbar ueberhaupt hinter der vorderen Karte
   hervor. Bei einer 16:10-Karte muss der Versatz deshalb absolut viel
   groesser sein, sonst steht der ganze Stapel unsichtbar hinter der ersten
   Karte. Nachgemessen auf 1440: bei 84 Pixeln Versatz ragten sieben Pixel
   heraus.

   Auf schmalen Geraeten kehrt sich die Rechnung um: dort ist jeder Pixel
   Versatz einer, der der vorderen Karte fehlt. Enger Faecher, dafuer eine
   Karte, die noch etwas zeigt. */
type Geometrie = { versatz: number; tiefe: number; neigung: number; luft: number; weich: number }
const WEIT: Geometrie = { versatz: 190, tiefe: 260, neigung: 22, luft: 90, weich: 3 }
/* Auf dem Telefon liegt der Stapel fast flach. Nicht aus Geschmack, sondern
   aus Arithmetik: Tiefe und Neigung verkleinern den Nachbarn, und was er an
   Breite verliert, zieht seine sichtbare Kante wieder hinter die vordere
   Karte. Bei 390 Pixeln blieben mit der weiten Geometrie fuenf Pixel uebrig —
   nachgemessen. Flach gelegt bleiben vierzig, und die Tiefe erzaehlt
   stattdessen der Schleier.

   Kein Weichzeichner: `filter: blur()` auf einem laufenden Video kostet auf
   dem Telefon mehr, als es aussieht. */
const ENG: Geometrie = { versatz: 120, tiefe: 90, neigung: 0, luft: 10, weich: 0 }

/* Der Stapel faechert nur nach einer Seite auf. Ohne Ausgleich staende die
   vordere Karte mittig und der Faecher rechts daneben, die Schau haette also
   links ein Loch. Der Ausgleich schiebt alles um ein knappes Versatzmass
   zurueck, damit die Masse wieder in der Mitte sitzt. */
const AUSGLEICH = 0.85

const klemm = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

export function Galerie({ stuecke, label, vorher, weiter, folie }: Props) {
  const anzahl = stuecke.length

  const kasten = useRef<HTMLDivElement>(null)
  const wurzel = useRef<HTMLDivElement>(null)
  const karten = useRef<(HTMLDivElement | null)[]>([])
  const schleier = useRef<(HTMLSpanElement | null)[]>([])
  const filme = useRef<(HTMLVideoElement | null)[]>([])
  /* Welche Stuecke ihre Quelle schon losgeworden sind.
     Zwei Wege davor waren falsch, beide gemessen: das `src`-Attribut ist im
     Effekt immer leer, weil React es beim Commit entfernt, und `currentSrc`
     wie `networkState` bleiben nach dem Raeumen in Zustaenden stehen, die
     die Bedingung erneut erfuellen — heraus kamen elf `load()`-Aufrufe fuer
     drei Videos. Ein Merker beantwortet die Frage "schon geraeumt?" direkt,
     statt sie aus dem Medienzustand zu erraten. */
  const geraeumt = useRef<Set<number>>(new Set())

  /* Die Position ist eine Fliesskommazahl in Karten: 1.4 heisst "zwischen der
     zweiten und der dritten, naeher an der zweiten". Sie steht in einem Ref
     und nicht im Zustand, weil sie sechzig Mal in der Sekunde weiterlaeuft. */
  const pos = useRef(0)
  const fokus = useRef(0)
  const tween = useRef<gsap.core.Tween | null>(null)
  const faktor = useRef(1)
  const geo = useRef<Geometrie>(WEIT)
  const ruhig = useRef(false)
  const ziehen = useRef<{
    x: number
    start: number
    letztX: number
    letztT: number
    v: number
    bewegt: boolean
    id: number
  } | null>(null)
  const gezogenBis = useRef(0)
  const radUhr = useRef<number | null>(null)

  const [aktiv, setAktiv] = useState(0)
  const [hoehe, setHoehe] = useState(KARTE_HOCH)
  /* Um so viel steht die vordere Karte links der Mitte (siehe AUSGLEICH). Die
     Bedienleiste unten macht den Versatz mit, sonst steht sie neben der Karte,
     unter die sie gehoert. */
  const [schub, setSchub] = useState(0)
  const [imBild, setImBild] = useState(false)
  const [stumm, setStumm] = useState(false)

  /* ── Anordnung ──────────────────────────────────────────────────────── */

  const anordnen = useCallback(
    (p: number) => {
      const n = anzahl
      if (!n) return
      const sc = faktor.current
      const g = geo.current

      for (let i = 0; i < n; i++) {
        const el = karten.current[i]
        if (!el) continue

        /* Abstand zur Mitte, ueber den Rand hinaus gerechnet: die letzte Karte
           steht kurz vor der ersten und nicht n Schritte hinter ihr. */
        let d = i - p
        if (n > 1) {
          d = ((d % n) + n) % n
          if (d > n / 2) d -= n
        }

        const zurueck = Math.max(0, d)
        const sichtbar = Math.abs(d) <= 3.5

        const tz = -g.tiefe * d
        const tx = g.versatz * (d - AUSGLEICH)
        const ry = g.neigung * klemm(d, 0, 1)

        /* Nach vorne heraus wird ausgeblendet, nach hinten nur abgedunkelt:
           sonst schoebe sich die vordere Karte durch den Betrachter. */
        let deckung = d < 0 ? Math.max(0, 1 + d) : 1
        if (!sichtbar) deckung = 0

        const blur = g.weich > 0 ? Math.min(g.weich, (zurueck / 3) * g.weich) : 0

        el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(
          2,
        )}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`
        el.style.opacity = deckung.toFixed(3)
        el.style.filter = blur > 0 ? `blur(${blur.toFixed(2)}px)` : ''
        el.style.zIndex = String(Math.round(2000 - d * 20))
        el.style.pointerEvents = sichtbar && deckung > 0.05 ? 'auto' : 'none'

        const s = schleier.current[i]
        if (s) s.style.opacity = klemm(zurueck * 0.2, 0, 0.6).toFixed(3)
      }
    },
    [anzahl],
  )

  const fahren = useCallback(
    (ziel: number, bewegt: boolean) => {
      tween.current?.kill()
      const stellvertreter = { p: pos.current }
      const dauer = bewegt && !ruhig.current ? 0.7 : 0
      tween.current = gsap.to(stellvertreter, {
        p: ziel,
        duration: dauer,
        ease: 'power3.out',
        onUpdate: () => {
          pos.current = stellvertreter.p
          anordnen(stellvertreter.p)
        },
        onComplete: () => {
          if (anzahl > 0) pos.current = ((pos.current % anzahl) + anzahl) % anzahl
          anordnen(pos.current)
        },
      })
    },
    [anordnen, anzahl],
  )

  const setzen = useCallback(
    (roh: number, bewegt = true) => {
      const n = anzahl
      if (!n) return
      const i = ((roh % n) + n) % n
      let schritt = i - pos.current
      if (n > 1) {
        schritt = ((schritt % n) + n) % n
        if (schritt > n / 2) schritt -= n
      }
      fahren(pos.current + schritt, bewegt)
      if (i !== fokus.current) {
        fokus.current = i
        setAktiv(i)
      }
    },
    [anzahl, fahren],
  )

  const um = useCallback((schritt: number) => setzen(fokus.current + schritt, true), [setzen])

  /* ── Groesse ────────────────────────────────────────────────────────── */

  useEffect(() => {
    const el = kasten.current
    if (!el) return
    const beobachter = new ResizeObserver((eintraege) => {
      const b = eintraege[0].contentRect.width
      /* Die Geometrie kommt aus der gemessenen Breite und nicht aus einem
         Zustand: sonst rechnete dieser Durchgang noch mit der alten. */
      const g = b < 640 ? ENG : WEIT
      geo.current = g
      const sc = klemm(b / (KARTE_BREIT + g.versatz * 2 + g.luft), 0.34, 1)
      faktor.current = sc
      /* Der Kasten ist so hoch wie die Karte plus etwas Luft
         herum. Ohne die Rechnung stuende die Schau in einem festen Rahmen
         und liesse auf dem Telefon die halbe Hoehe leer. */
      setHoehe(Math.round(KARTE_HOCH * sc + 24))
      setSchub(Math.round(g.versatz * AUSGLEICH * sc))
      anordnen(pos.current)
    })
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [anordnen])

  useEffect(() => {
    anordnen(pos.current)
  }, [anordnen])

  /* ── Bewegung abgeschaltet ──────────────────────────────────────────── */

  useEffect(() => {
    const frage = window.matchMedia('(prefers-reduced-motion: reduce)')
    const setzenRuhig = () => {
      ruhig.current = frage.matches
      setStumm(frage.matches)
    }
    setzenRuhig()
    frage.addEventListener('change', setzenRuhig)
    return () => frage.removeEventListener('change', setzenRuhig)
  }, [])

  /* ── Rad, waagerecht ────────────────────────────────────────────────── */

  useEffect(() => {
    const el = wurzel.current
    if (!el || anzahl < 2) return
    const beiRad = (e: WheelEvent) => {
      /* Nur die Waagerechte gehoert der Schau. Wer senkrecht scrollt, will
         durch die Seite und nicht durch die Bilder. */
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
      e.preventDefault()
      tween.current?.kill()
      const schritt = klemm(e.deltaX / (KARTE_BREIT * 0.9), -0.6, 0.6)
      pos.current += schritt
      anordnen(pos.current)
      if (radUhr.current) window.clearTimeout(radUhr.current)
      radUhr.current = window.setTimeout(() => setzen(Math.round(pos.current), true), 130)
    }
    el.addEventListener('wheel', beiRad, { passive: false })
    return () => {
      el.removeEventListener('wheel', beiRad)
      if (radUhr.current) window.clearTimeout(radUhr.current)
    }
  }, [anordnen, setzen, anzahl])

  /* ── Ziehen ─────────────────────────────────────────────────────────── */

  const wegProKarte = () => Math.max(KARTE_BREIT * 0.55 * faktor.current, 40)

  const beiZeigerAb = useCallback(
    (e: React.PointerEvent) => {
      if (anzahl < 2) return
      tween.current?.kill()
      ziehen.current = {
        x: e.clientX,
        start: pos.current,
        letztX: e.clientX,
        letztT: performance.now(),
        v: 0,
        bewegt: false,
        id: e.pointerId,
      }
    },
    [anzahl],
  )

  const beiZeigerBewegt = useCallback(
    (e: React.PointerEvent) => {
      const z = ziehen.current
      if (!z) return
      const dx = e.clientX - z.x
      if (!z.bewegt && Math.abs(dx) > 4) {
        z.bewegt = true
        wurzel.current?.setPointerCapture(z.id)
      }
      if (!z.bewegt) return
      const jetzt = performance.now()
      z.v = (e.clientX - z.letztX) / Math.max(jetzt - z.letztT, 1)
      z.letztX = e.clientX
      z.letztT = jetzt
      pos.current = z.start - dx / wegProKarte()
      anordnen(pos.current)
    },
    [anordnen],
  )

  const beiZeigerAuf = useCallback(() => {
    const z = ziehen.current
    if (!z) return
    ziehen.current = null
    if (!z.bewegt) return
    /* Der Zeitstempel schuetzt den folgenden Klick: er kommt nach dem
       pointerup, und ohne die Sperre spraenge die Schau auf die Karte
       zurueck, ueber der das Ziehen zufaellig endete. */
    gezogenBis.current = performance.now() + 250
    setzen(Math.round(pos.current - (z.v * 180) / wegProKarte()), true)
  }, [setzen])

  /* ── Videos: nur das mittige laeuft ─────────────────────────────────── */

  useEffect(() => {
    const el = kasten.current
    if (!el) return
    const beobachter = new IntersectionObserver(
      ([eintrag]) => setImBild(eintrag.isIntersecting),
      { threshold: 0.25 },
    )
    beobachter.observe(el)
    return () => beobachter.disconnect()
  }, [])

  /* Pausieren reicht auf iOS nicht.
   *
   * Ein pausiertes <video> mit geladener Quelle behaelt seine
   * Dekodersitzung und die dekodierten Bilder im Speicher. Wer sich durch
   * die vier Stuecke wischt, hat danach drei davon liegen, dazu den Film im
   * Helden — auf einem iPhone XS mit vier Gigabyte beendet Safari den Tab
   * und zeigt "Auf hareb.digital ist wiederholt ein Problem aufgetreten".
   *
   * Deshalb wird die Quelle am inaktiven Stueck entfernt und `load()`
   * gerufen: das gibt Dekoder und Puffer frei. Sichtbar bleibt das
   * `poster`, es haengt nicht an der Quelle. Beim Zurueckwischen laedt das
   * Stueck neu — ein paar hundert Kilobyte gegen einen Absturz. */
  useEffect(() => {
    filme.current.forEach((film, i) => {
      if (!film) return

      if (i === aktiv) {
        /* Wieder dran: es darf beim naechsten Verlassen erneut geraeumt
           werden. React hat die Quelle in diesem Commit schon gesetzt. */
        geraeumt.current.delete(i)
        if (imBild && !ruhig.current) {
          const versuch = film.play()
          if (versuch) versuch.catch(() => {})
        } else {
          film.pause()
        }
        return
      }

      film.pause()
      if (geraeumt.current.has(i)) return
      geraeumt.current.add(i)
      film.removeAttribute('src')
      film.load()
    })
  }, [aktiv, imBild, stumm])

  useEffect(
    () => () => {
      tween.current?.kill()
      if (radUhr.current) window.clearTimeout(radUhr.current)
    },
    [],
  )

  /* ── Aufbau ─────────────────────────────────────────────────────────── */

  return (
    <section aria-label={label} className="relative">
      <div className="mx-auto flex max-w-6xl items-baseline justify-between px-6">
        <span className="hd-label">{label}</span>
        <span className="font-display text-[15px] font-bold tabular-nums tracking-tight">
          {String(aktiv + 1).padStart(2, '0')}
          <span className="text-[color:var(--hd-ink-soft)]"> / {String(anzahl).padStart(2, '0')}</span>
        </span>
      </div>

      <div ref={kasten} className="relative mt-8">
        <div
          ref={wurzel}
          className="galerie"
          style={{ height: hoehe }}
          role="group"
          aria-roledescription="carousel"
          aria-label={label}
          tabIndex={0}
          onPointerDown={beiZeigerAb}
          onPointerMove={beiZeigerBewegt}
          onPointerUp={beiZeigerAuf}
          onPointerCancel={beiZeigerAuf}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              um(-1)
            } else if (e.key === 'ArrowRight') {
              e.preventDefault()
              um(1)
            }
          }}
        >
          <div className="galerie-buehne">
            {stuecke.map((stueck, i) => (
              <div
                key={stueck.id}
                ref={(el) => {
                  karten.current[i] = el
                }}
                className="galerie-karte"
                style={{ width: KARTE_BREIT, height: KARTE_HOCH }}
                aria-roledescription="slide"
                aria-label={folie.replace('{n}', String(i + 1)).replace('{von}', String(anzahl))}
                /* Nicht `inert`: das war der erste Versuch und nahm den
                   hinteren Karten auch den Klick — ein Tipp auf den Nachbarn
                   tat nichts, obwohl er sichtbar danebensteht. Verborgen
                   werden sie nur fuer Vorlesegeraete; anfassbar bleiben sie.
                   Fokussierbares steckt ohnehin nur in der mittigen Karte
                   (die Bedienelemente des Videos bei ruhiger Einstellung). */
                aria-hidden={aktiv !== i}
                onClick={() => {
                  if (performance.now() < gezogenBis.current) return
                  setzen(i, true)
                }}
              >
                {stueck.art === 'bild' ? (
                  <Image
                    src={stueck.quelle}
                    alt=""
                    width={stueck.breite}
                    height={stueck.hoehe}
                    sizes="(max-width: 640px) 90vw, 720px"
                    loading={i <= 1 ? 'eager' : 'lazy'}
                    className="galerie-medium"
                    draggable={false}
                  />
                ) : (
                  /* Die Quelle steht am <video> und nicht als <source>-Kind,
                     und sie steht nur an dem Stueck, das gerade dran ist.
                     Das ist keine Formsache: nur so laesst sie sich wieder
                     entfernen. Ein <source> bekommt man aus einem laufenden
                     Element nicht mehr heraus, ohne den Baum anzufassen —
                     und ohne Entfernen behaelt iOS den Dekoder samt
                     Bildspeicher, auch wenn das Video laengst pausiert ist.
                     Das Standbild bleibt sichtbar, es haengt am `poster`. */
                  <video
                    ref={(el) => {
                      filme.current[i] = el
                    }}
                    className="galerie-medium"
                    poster={stueck.standbild}
                    src={aktiv === i ? stueck.quelle : undefined}
                    preload="none"
                    muted
                    loop
                    playsInline
                    controls={stumm && aktiv === i}
                    style={{ pointerEvents: stumm ? 'auto' : 'none' }}
                  />
                )}
                <span
                  ref={(el) => {
                    schleier.current[i] = el
                  }}
                  className="galerie-schleier"
                />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Die Bedienung steht unter der Schau und nicht darin. Vorher lagen die
          Pfeile am Rand des Rahmens: auf dem Telefon ist der Rahmen 390 Pixel
          breit und die Karte 304 — die Knoepfe lagen also mitten auf der
          Website, die sie zeigen sollen. Unten in einer Reihe verdecken sie
          nichts, und Pfeil–Punkte–Pfeil ist auf den ersten Blick als
          Schau zu lesen. */}
      <div className="galerie-leiste" style={{ transform: `translateX(${-schub}px)` }}>
        <button type="button" onClick={() => um(-1)} aria-label={vorher} className="galerie-pfeil">
          <span aria-hidden>&larr;</span>
        </button>

        <div className="galerie-punkte">
          {stuecke.map((stueck, i) => (
            <button
              key={stueck.id}
              type="button"
              aria-label={folie.replace('{n}', String(i + 1)).replace('{von}', String(anzahl))}
              aria-current={aktiv === i}
              className={`galerie-punkt${aktiv === i ? ' ist-aktiv' : ''}`}
              onClick={() => setzen(i, true)}
            >
              <span />
            </button>
          ))}
        </div>

        <button type="button" onClick={() => um(1)} aria-label={weiter} className="galerie-pfeil">
          <span aria-hidden>&rarr;</span>
        </button>
      </div>

      <span aria-live="polite" aria-atomic className="sr-only">
        {folie.replace('{n}', String(aktiv + 1)).replace('{von}', String(anzahl))}
      </span>
    </section>
  )
}
