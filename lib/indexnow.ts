import sitemap from '@/app/sitemap'
import { SITE_URL } from '@/lib/i18n'

/**
 * IndexNow: der Seite selbst sagen lassen, dass sie sich geaendert hat.
 *
 * Warum das hier steht: was diese Seite ueber sich behauptet, kommt bei
 * ChatGPT nicht an, weil ChatGPT ohne Browsing aus einem Index antwortet,
 * und dieser Index wird ueber Bing gefuellt. Zwischen "steht auf der Seite"
 * und "steht im Index" liegen sonst Wochen, in denen ein Crawler
 * irgendwann von selbst vorbeikommt. IndexNow kuerzt das ab: eine
 * Anfrage mit der Liste der Adressen, und Bing, Yandex und Seznam holen
 * sie ab, statt zu warten.
 *
 * Der Schluessel ist KEIN Geheimnis. Das Verfahren verlangt ausdruecklich,
 * dass er unter der eigenen Domain oeffentlich abrufbar liegt
 * (public/<schluessel>.txt) — daran prueft die Gegenseite, dass wirklich
 * jemand mit Zugriff auf diese Domain die Anfrage gestellt hat. Er darf
 * deshalb im Repo stehen. Ueber INDEXNOW_KEY laesst er sich ersetzen; dann
 * muss auch die Datei unter public/ den neuen Namen tragen.
 *
 * Gemeldet wird ausschliesslich, was in der Sitemap steht. Damit kann hier
 * niemals eine Adresse landen, die auf `noindex` steht — /start ist genau
 * so ein Fall, und eine Seite zur Indexierung anzumelden, die man
 * gleichzeitig aus dem Index heraushalten will, ist der schnellste Weg,
 * sich das Vertrauen der Suchmaschine zu verspielen.
 */

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? '0d989215f00a3b30c5c37438e9679ae5'

const ENDPUNKT = 'https://api.indexnow.org/indexnow'

export function indexNowUrls(): string[] {
  /* Doppelte raus: die Sitemap fuehrt jede Adresse einmal, aber ein
     Sprachalternativ-Eintrag kann dieselbe Adresse ein zweites Mal
     nennen. Doppelte Eintraege sind kein Fehler, nur unnoetig. */
  return [...new Set(sitemap().map((eintrag) => eintrag.url))]
}

export type IndexNowErgebnis = { status: number; anzahl: number } | { fehler: string }

export async function meldeIndexNow(urls = indexNowUrls()): Promise<IndexNowErgebnis> {
  const host = new URL(SITE_URL).host
  try {
    const antwort = await fetch(ENDPUNKT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    })
    return { status: antwort.status, anzahl: urls.length }
  } catch (fehler) {
    return { fehler: fehler instanceof Error ? fehler.message : String(fehler) }
  }
}
