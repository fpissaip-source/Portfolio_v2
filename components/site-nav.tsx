'use client'

import { BubbleMenu, type BubbleItem } from './bubble-menu'
import { useT } from './language-context'

/**
 * Die Navigation des Portfolios.
 *
 * Vorher: ein Namenszug oben links, eine mittige Pillenleiste ab Tablet, die
 * erst nach dem Helden auftauchte, und darunter ein eigenes Klappmenü fürs
 * Telefon — drei Fassungen desselben Menüs.
 *
 * Jetzt eine: BubbleMenu. Zwei Blasen in der Kopfzeile, und beim Öffnen
 * springen die Ziele als grosse Pillen ins Bild. Dieselbe Bedienung auf jedem
 * Gerät, und der Namenszug ist die linke Blase, also weiterhin der Weg nach
 * oben.
 *
 * Das weiche Scrollen bleibt: die Verweise laufen über Lenis und nicht über
 * einen Sprung.
 */

/* Der Akzent der Seite, hier als Hex, weil das Bauteil die Farben in
   Zeichenketten weiterreicht. Blau und Violett im Wechsel, wie überall sonst
   auf der Seite auch. */
const BLAU = '#7aa2e8'
const VIOLETT = '#b07ae0'

function scrollen(e: React.MouseEvent, href: string) {
  e.preventDefault()
  const el = document.querySelector(href)
  if (!el) return
  const lenis = (
    window as unknown as {
      __lenis?: { scrollTo: (t: Element, o?: object) => void; start: () => void }
    }
  ).__lenis
  if (lenis) {
    /* Erst wieder anwerfen, dann fahren. Solange das Menue offen ist, steht
       Lenis still, damit die Seite nicht hinter den Pillen wegscrollt — und
       ein angehaltenes Lenis verschluckt den Scrollbefehl kommentarlos.
       Nachgemessen: der Sprung zum Ziel blieb bei 0 stehen. */
    lenis.start()
    lenis.scrollTo(el, { offset: -40 })
  } else {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

export function SiteNav() {
  const t = useT()

  /* Dieselbe Reihenfolge wie die Seite: L.U.K.A.S. direkt nach dem Helden,
     dann die Arbeiten, dann das Angebot. */
  const ziele: BubbleItem[] = [
    { label: t.nav.lukas, href: '#lukas', rotation: -8, hoverStyles: { bgColor: VIOLETT, textColor: '#0a0a0a' } },
    { label: t.nav.work, href: '#work', rotation: 8, hoverStyles: { bgColor: BLAU, textColor: '#0a0a0a' } },
    { label: t.nav.services, href: '#services', rotation: 8, hoverStyles: { bgColor: VIOLETT, textColor: '#0a0a0a' } },
    { label: t.nav.about, href: '#about', rotation: 8, hoverStyles: { bgColor: BLAU, textColor: '#0a0a0a' } },
    { label: t.nav.stack, href: '#stack', rotation: -8, hoverStyles: { bgColor: VIOLETT, textColor: '#0a0a0a' } },
    { label: t.nav.process, href: '#process', rotation: 8, hoverStyles: { bgColor: BLAU, textColor: '#0a0a0a' } },
    { label: t.nav.contact, href: '#contact', rotation: -8, hoverStyles: { bgColor: VIOLETT, textColor: '#0a0a0a' } },
  ]

  return (
    <BubbleMenu
      logo={
        <span className="font-label text-[12px] uppercase tracking-[0.22em] sm:text-[11px]">
          Issa Hareb
        </span>
      }
      items={ziele}
      menuAriaLabel={t.nav.openMenu}
      closeAriaLabel={t.nav.closeMenu}
      menuBg="#f4f4f5"
      menuContentColor="#0a0a0a"
      onLogoClick={(e) => scrollen(e, '#top')}
      onItemClick={scrollen}
    />
  )
}
