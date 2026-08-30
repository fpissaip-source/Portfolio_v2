import { existsSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * Nach einem Deploy die Adressen bei IndexNow anmelden.
 *
 * Warum: was diese Seite ueber sich schreibt, kommt bei ChatGPT ohne
 * Browsing erst an, wenn es im Index steht, und dieser Index wird ueber
 * Bing gefuellt. Ohne Anstoss liegen dazwischen Wochen, in denen ein
 * Crawler irgendwann von selbst vorbeikommt.
 *
 * Warum beim Start und nicht nach dem Build: zwischen Build und Start
 * liegt der Wechsel auf den neuen Container. Wer beim Build meldet,
 * schickt den Crawler auf eine Adresse, die noch die alte Fassung
 * ausliefert, und bekommt genau die in den Index. Deshalb hier, plus
 * eine halbe Minute Vorlauf, bis der Server auch wirklich antwortet.
 *
 * Zwei Bremsen, damit daraus kein Dauerfeuer wird: nur in der Produktion,
 * und eine Merkdatei pro Commit, damit ein Neustart desselben Containers
 * nicht ein zweites Mal meldet. Abschalten mit INDEXNOW_AUS=1.
 */
if (process.env.NODE_ENV === 'production' && !process.env.INDEXNOW_AUS) {
  const stand = process.env.RAILWAY_GIT_COMMIT_SHA ?? 'unbekannt'
  const merk = join(tmpdir(), `indexnow-${stand}`)

  let schonGemeldet = false
  try {
    schonGemeldet = existsSync(merk)
    if (!schonGemeldet) writeFileSync(merk, new Date().toISOString())
  } catch {
    /* Kein Schreibrecht im temporaeren Verzeichnis: dann eben ohne
       Merkdatei. Eine Meldung zu viel ist harmloser als gar keine. */
  }

  if (!schonGemeldet) {
    /* Nicht blockierend und ohne den Prozess offen zu halten: der Server
       soll nicht auf eine fremde Schnittstelle warten, bevor er die
       erste Anfrage beantwortet. */
    const timer = setTimeout(() => {
      void import('@/lib/indexnow').then(({ meldeIndexNow, indexNowUrls }) =>
        meldeIndexNow(indexNowUrls()).then((ergebnis) => {
          console.log('[indexnow]', JSON.stringify(ergebnis))
        }),
      )
    }, 30_000)
    timer.unref?.()
  }
}
