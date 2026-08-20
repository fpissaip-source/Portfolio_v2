import type { MetadataRoute } from 'next'

const SITE = 'https://issahareb.me'

/** /sitemap.xml was a 404, so nothing told a crawler which pages exist.
 *  Keep this in step with app/: a route that is not listed here is a route
 *  no crawler is told about. /affiliate was missing, which is the one page
 *  on the site written to be found by search. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: SITE, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE}/anfrage`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/affiliate`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/impressum`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/datenschutz`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
