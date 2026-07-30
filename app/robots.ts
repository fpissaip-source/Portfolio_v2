import type { MetadataRoute } from 'next'

const SITE = 'https://issahareb.me'

/**
 * There was no robots.txt at all — /robots.txt answered with the HTML 404
 * page. A missing robots.txt is not itself a block (crawlers treat it as
 * "allow everything"), but it is the file every crawler asks for first, it
 * is where the sitemap gets announced, and a 404 there means the sitemap
 * was announced nowhere.
 *
 * Everything is allowed, including the AI crawlers, because the point of
 * this site is to be read. The only exclusion is /_next/, which is build
 * output with no content in it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/_next/' }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
