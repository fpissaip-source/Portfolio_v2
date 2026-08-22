/**
 * Sprachen als URLs.
 *
 * Die Seite trug schon immer vollständige Übersetzungen in drei Sprachen,
 * gewählt wurde die Sprache aber im Browser über localStorage. Für einen
 * Besucher war das elegant; für einen Crawler gab es genau eine URL mit
 * deutschem Inhalt, und die englischen und spanischen Texte — Impressum und
 * Datenschutz eingeschlossen — existierten für Suchmaschinen nicht.
 *
 * Deutsch behält seine bisherigen Adressen ohne Präfix. Das ist keine
 * Bequemlichkeit, sondern der Grund, warum dieser Umbau überhaupt gefahrlos
 * ist: `/`, `/anfrage` und `/impressum` sind indexiert, verlinkt und stehen
 * in der Sitemap. Ein Präfix hätte jede dieser Adressen umgeleitet und die
 * mühsam aufgebaute Bewertung durch eine Weiterleitungskette geschickt.
 */

export const LANGS = ['de', 'en', 'es'] as const
export type Lang = (typeof LANGS)[number]

export const DEFAULT_LANG: Lang = 'de'

export const SITE_URL = 'https://issahareb.me'

/** Was in `<html lang>` und in `hreflang` steht. Ein Sprachcode allein
 *  ("de") ist gültig; die Region dazu ("de-DE") ist genauer, und genauer ist
 *  bei einer Zuordnung immer besser. */
export const HREFLANG: Record<Lang, string> = {
  de: 'de-DE',
  en: 'en',
  es: 'es',
}

/** Für Open Graph, das eine andere Schreibweise verlangt als hreflang. */
export const OG_LOCALE: Record<Lang, string> = {
  de: 'de_DE',
  en: 'en_US',
  es: 'es_ES',
}

/**
 * Der Pfad einer Seite in einer bestimmten Sprache.
 *
 * `path` ist immer die deutsche, präfixlose Form mit führendem Schrägstrich.
 * Deutsch gibt sie unverändert zurück, die anderen bekommen ihr Präfix.
 */
export function langPath(lang: Lang, path = '/'): string {
  const clean = path === '/' ? '' : path.replace(/\/+$/, '')
  if (lang === DEFAULT_LANG) return clean || '/'
  return `/${lang}${clean}`
}

export function langUrl(lang: Lang, path = '/'): string {
  const p = langPath(lang, path)
  return p === '/' ? SITE_URL : `${SITE_URL}${p}`
}

/**
 * Die `alternates` für eine Seite: eigener Pfad als canonical, dazu jede
 * Sprachfassung.
 *
 * `x-default` zeigt auf die deutsche Fassung. Es beantwortet die Frage
 * „welche nehme ich, wenn keine passt" — und das ist hier die Sprache des
 * Marktes, in dem gearbeitet wird, nicht Englisch als Weltsprache.
 */
export function alternatesFor(lang: Lang, path = '/') {
  const languages: Record<string, string> = {}
  for (const l of LANGS) languages[HREFLANG[l]] = langPath(l, path)
  languages['x-default'] = langPath(DEFAULT_LANG, path)
  return { canonical: langPath(lang, path), languages }
}

/** Prüft eine Zeichenkette aus der URL, ohne ihr zu glauben. */
export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value)
}

/**
 * Nimmt einer Adresse ihr Sprachpräfix.
 *
 * Wird beim Sprachwechsel gebraucht: aus `/en/impressum` muss `/impressum`
 * werden, bevor das neue Präfix davorkommt. Ohne diesen Schritt entstünde
 * `/es/en/impressum`.
 */
export function stripLangPrefix(pathname: string): string {
  const match = pathname.match(/^\/([a-z]{2})(?=\/|$)/)
  if (match && isLang(match[1]) && match[1] !== DEFAULT_LANG) {
    return pathname.slice(3) || '/'
  }
  return pathname || '/'
}
