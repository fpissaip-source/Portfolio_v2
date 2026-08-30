/**
 * IndexNow von Hand ausloesen: `node scripts/indexnow.mjs`
 *
 * Der Server macht das beim Start selbst (instrumentation.ts). Dieses
 * Skript ist fuer den Fall, dass man nicht auf einen Neustart warten
 * will — etwa direkt nachdem ein Text geaendert wurde und man wissen
 * moechte, ob die Gegenseite die Adressen annimmt.
 *
 * Es liest die Adressen NICHT aus der Anwendung, sondern aus der live
 * ausgelieferten sitemap.xml. Damit meldet es genau das, was auch
 * wirklich online steht, und nicht das, was lokal im Code liegt.
 */
const SITE = process.env.SITE_URL ?? 'https://issahareb.me'
const KEY = process.env.INDEXNOW_KEY ?? '0d989215f00a3b30c5c37438e9679ae5'

const xml = await fetch(`${SITE}/sitemap.xml`).then((r) => r.text())
const urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]))]
if (urls.length === 0) {
  console.error('Keine Adressen in der Sitemap gefunden. Laeuft die Seite?')
  process.exit(1)
}

const antwort = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: new URL(SITE).host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  }),
})
console.log(`${antwort.status} ${antwort.statusText} fuer ${urls.length} Adressen`)
console.log(urls.join('\n'))
/* 200/202 = angenommen. 403 = der Schluessel unter ${SITE}/${KEY}.txt
   fehlt oder passt nicht. 422 = eine Adresse gehoert nicht zu dieser
   Domain. 429 = zu oft gemeldet. */
process.exit(antwort.status < 300 ? 0 : 1)
