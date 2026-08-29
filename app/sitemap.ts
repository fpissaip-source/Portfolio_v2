import type { MetadataRoute } from 'next'
import { DEFAULT_LANG, HREFLANG, LANGS, langUrl } from '@/lib/i18n'
import { LEISTUNGEN } from '@/lib/leistungen'

/**
 * Jede Seite in jeder Sprache, und jede nennt die anderen beiden.
 *
 * Vorher standen hier fünf deutsche Adressen. Das war vollständig, solange es
 * nur eine Sprachfassung pro Adresse gab — jetzt wären es fünfzehn Seiten, von
 * denen ein Crawler zehn nicht kennt.
 *
 * Die `alternates`-Angabe ist dabei kein Beiwerk: hreflang im Kopf jeder Seite
 * und hreflang in der Sitemap sind zwei getrennte Wege, dieselbe Aussage zu
 * treffen, und Google empfiehlt beide. Wer nur einen davon geht, verlässt sich
 * darauf, dass jede einzelne Seite auch tatsächlich abgeholt wurde.
 *
 * Wer hier eine Route ergänzt, ergänzt sie einmal — die drei Sprachfassungen
 * entstehen von selbst. Genau deshalb steht der Pfad nur einmal da.
 */
const ROUTES: {
  path: string
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
  priority: number
}[] = [
  { path: '/', changeFrequency: 'monthly', priority: 1 },
  { path: '/anfrage', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/affiliate', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/impressum', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/datenschutz', changeFrequency: 'yearly', priority: 0.3 },
]

/**
 * Die Leistungsseiten stehen ausserhalb der Sprachschleife.
 *
 * Sie gibt es nur auf Deutsch — die Absicht dahinter ist lokal, und lokal
 * heisst hier deutschsprachig. Eine Zeile in der Sprachschleife haette drei
 * Adressen erzeugt, von denen zwei 404 liefern, und eine Sitemap, die auf
 * 404 zeigt, ist genau die Art Fehler, die die Search Console anschliessend
 * meldet.
 */
function leistungsseiten(now: Date): MetadataRoute.Sitemap {
  return LEISTUNGEN.map((l) => ({
    url: langUrl(DEFAULT_LANG, `/leistungen/${l.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [...leistungsseiten(now), ...ROUTES.flatMap((route) => {
    const languages: Record<string, string> = {}
    for (const l of LANGS) languages[HREFLANG[l]] = langUrl(l, route.path)
    languages['x-default'] = langUrl(DEFAULT_LANG, route.path)

    return LANGS.map((lang) => ({
      url: langUrl(lang, route.path),
      lastModified: now,
      changeFrequency: route.changeFrequency,
      /* Die deutsche Fassung führt. Nicht aus Prinzip, sondern weil sie den
         Markt bedient, in dem gearbeitet wird — und weil x-default auf sie
         zeigt. */
      priority: lang === DEFAULT_LANG ? route.priority : route.priority - 0.1,
      alternates: { languages },
    }))
  })]
}

/* /start fehlt hier mit Absicht: die Kundenseite trägt noindex, solange ihre
   eigene Domain nicht steht. Eine Adresse in der Sitemap, die der Seite selbst
   das Indexieren verbietet, ist ein Widerspruch, den die Search Console
   anschliessend als Fehler meldet. */
