'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { HD_KEKS, HD_SPRACHEN, type HdLang } from '@/lib/hd-texte'

/**
 * Der Sprachschalter der Landingpage.
 *
 * Die Seite waehlt ihre Sprache sonst selbst, aus der Einstellung des Browsers
 * und dem Land. Das trifft meistens, aber eben nicht immer: wer mit deutschem
 * Browser im Ausland arbeitet und die Seite einem englischsprachigen Kunden
 * zeigen will, braucht einen Weg. Der ist das hier.
 *
 * Die Wahl liegt in einem Keks und nicht in der Adresse, weil die Seite keine
 * Sprachpfade hat: sie traegt `noindex` und bekommt ihren Verkehr aus
 * Anzeigen, es gibt also nichts, was unter drei Adressen indexiert werden
 * muesste. Der Keks ist zustimmungsfrei: er speichert eine Einstellung, die
 * der Besucher selbst vorgenommen hat, und verfolgt niemanden.
 *
 * Danach `refresh()` statt eines Neuladens. Der Server rendert die Seite mit
 * der neuen Sprache, React tauscht den Baum aus, und der Scrollstand bleibt,
 * wo er war.
 */

const NAMEN: Record<HdLang, { kurz: string; lang: string }> = {
  de: { kurz: 'DE', lang: 'Deutsch' },
  en: { kurz: 'EN', lang: 'English' },
  es: { kurz: 'ES', lang: 'Español' },
}

export function HdSprachschalter({ lang }: { lang: HdLang }) {
  const router = useRouter()
  const [laeuft, starten] = useTransition()

  const umstellen = (ziel: HdLang) => {
    if (ziel === lang) return
    document.cookie = `${HD_KEKS}=${ziel}; path=/; max-age=31536000; samesite=lax`
    starten(() => router.refresh())
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border p-0.5"
      style={{ borderColor: 'var(--hd-line)', opacity: laeuft ? 0.6 : 1 }}
    >
      {HD_SPRACHEN.map((l) => {
        const aktiv = l === lang
        return (
          <button
            key={l}
            type="button"
            lang={l}
            aria-label={NAMEN[l].lang}
            aria-current={aktiv ? 'true' : undefined}
            onClick={() => umstellen(l)}
            className={`min-h-8 rounded-full px-2.5 font-label text-[12px] font-medium uppercase tracking-[0.1em] transition-colors ${
              aktiv
                ? 'bg-[color:var(--hd-ink)] text-[color:var(--hd-paper)]'
                : 'text-[color:var(--hd-ink-soft)] hover:text-[color:var(--hd-ink)]'
            }`}
          >
            {NAMEN[l].kurz}
          </button>
        )
      })}
    </div>
  )
}
