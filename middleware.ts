import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LANG, LANGS } from '@/lib/i18n'

/**
 * Sprachpräfixe, ohne die deutschen Adressen anzufassen.
 *
 * Alle Seiten liegen unter `app/[lang]/`, es gibt sie also technisch nur als
 * `/de/...`, `/en/...` und `/es/...`. Für Deutsch wäre das die falsche
 * Adresse: `/`, `/anfrage` und `/impressum` sind indexiert, verlinkt, stehen
 * in der Sitemap und tragen die Bewertung, die diese Seite über Wochen
 * aufgebaut hat. Ein Präfix hätte jede davon durch eine Weiterleitung
 * geschickt.
 *
 * Also zwei Regeln, die zusammengehören:
 *
 *   1. Eine Adresse ohne Präfix wird intern auf `/de/...` umgeschrieben. Der
 *      Besucher sieht weiterhin `/anfrage`; die Adresse ändert sich nicht,
 *      es gibt keine Weiterleitung und keinen zusätzlichen Umlauf.
 *
 *   2. `/de/...` wird dauerhaft auf die präfixlose Form umgeleitet. Ohne
 *      diese Regel wäre dieselbe Seite unter zwei Adressen erreichbar — und
 *      doppelte Inhalte sind genau das Problem, das dieser Umbau lösen soll.
 *
 * Bewusst KEINE Umleitung nach Browsersprache. Sie ist verlockend und
 * schadet: ein Crawler kommt ohne aussagekräftigen Accept-Language-Header,
 * bekäme also je nach Laune eine andere Fassung derselben Adresse serviert.
 * Die Sprache steht in der Adresse, sonst nirgends.
 */
const PREFIXED = LANGS.filter((l) => l !== DEFAULT_LANG)

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // `/de` und `/de/...` sind die technische Innenansicht, nicht die Adresse.
  if (pathname === `/${DEFAULT_LANG}` || pathname.startsWith(`/${DEFAULT_LANG}/`)) {
    const target = pathname.slice(DEFAULT_LANG.length + 1) || '/'
    return NextResponse.redirect(new URL(target + search, request.url), 301)
  }

  // Steht bereits ein Präfix da, ist nichts zu tun.
  if (PREFIXED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next()
  }

  /* Die Kundenseite liegt bewusst ausserhalb des Sprachbaums. Sie hat keine
     Sprachpfade, sondern richtet sich nach der Einstellung des Browsers: sie
     trägt `noindex` und bekommt ihren Verkehr aus Anzeigen, da zählt nur, dass
     der Besucher ohne weiteren Klick in seiner Sprache ankommt.

     Ein Vary auf Accept-Language waere hier das Naheliegende, damit kein
     Zwischenspeicher die zuerst geholte Fassung an alle weiterreicht. Es hat
     keinen Zweck: Next setzt den Vary-Kopf fuer Seitenantworten selbst und
     ueberschreibt einen eigenen, gemessen in der Entwicklung wie im Build.
     Noetig ist er auch nicht, denn die Seite wird bei jedem Aufruf gerendert
     und geht mit "private, no-store" hinaus, was jedem geteilten Speicher das
     Ablegen ohnehin verbietet. */
  /* `/start-alt` steht mit in der Bedingung, seit die neue Hareb-Digital-Seite
     auf `/start` liegt und die vorherige Fassung dorthin ausgewichen ist.
     Ohne sie liefe sie in die Sprachumschreibung und landete auf einer
     deutschen Adresse, die es nicht gibt. */
  if (pathname === '/start' || pathname === '/start-alt' || pathname.startsWith('/start/')) {
    return NextResponse.next()
  }

  return NextResponse.rewrite(new URL(`/${DEFAULT_LANG}${pathname}${search}`, request.url))
}

export const config = {
  /* Alles ausser den Pfaden, die keine Seiten sind. `_next` und `api` liegen
     ausserhalb des Sprachbaums, und die Dateien mit Punkt im Namen sind
     Bilder, das Favicon und die Bestätigungsdatei von Bing — ein Präfix
     davor würde sie schlicht unauffindbar machen. */
  matcher: ['/((?!api|_next/static|_next/image|.*\\.).*)'],
}
