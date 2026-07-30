import type { MetadataRoute } from 'next'

const SITE = 'https://issahareb.me'

/** /sitemap.xml was a 404, so nothing told a crawler which pages exist.
 *  Three routes, which is all there are. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/datenschutz`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
