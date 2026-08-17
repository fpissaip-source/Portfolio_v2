/** @type {import('next').NextConfig} */

/**
 * Long-lived caching for the heavy static media.
 *
 * Next.js serves everything in /public with `Cache-Control: public,
 * max-age=14400` — four hours. Measured on the live site, that applied to
 * the hero film and the intro film, so a visitor returning the same evening
 * re-downloaded several megabytes that had not changed. Cloudflare shields
 * the origin from those requests, but it cannot give the visitor their
 * bandwidth back.
 *
 * A year plus `immutable` is safe here because none of these files is ever
 * edited in place: a new cut is a new encode, and the way to ship one is to
 * change the filename (hero-robot-v2.mp4) rather than overwrite it. That is
 * the same contract Next.js already applies to its own hashed chunks.
 */
const IMMUTABLE = 'public, max-age=31536000, immutable'

const nextConfig = {
  /**
   * www to the apex, permanently.
   *
   * Both hostnames were serving the whole site with 200 and no redirect:
   * measured, https://issahareb.me/ and https://www.issahareb.me/ returned
   * the same 158,665 bytes. That is the same page on two hostnames, which
   * Bing's guidelines name explicitly as a reason not to index, and it
   * splits whatever authority the domain earns across two addresses.
   *
   * The canonical tag already pointed at the apex from both, but a canonical
   * is a hint. A 301 is the instruction.
   *
   * 301 rather than Next's `permanent: true` (which emits 308): every
   * crawler has understood 301 for twenty years, and this is exactly the
   * case it was made for.
   */
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.issahareb.me' }],
        destination: 'https://issahareb.me/:path*',
        statusCode: 301,
      },
    ]
  },

  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
      {
        // Posters and the intro stills: same lifetime, same reasoning.
        source: '/intro/:path*',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
      {
        source: '/projects/:path*',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
      {
        source: '/design-directions/:path*',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
      {
        source: '/logos/:path*',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
      {
        // The icons are referenced from every page and never change.
        source: '/:file(icon.svg|apple-icon.png|icon-dark-32x32.png|icon-light-32x32.png)',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
    ]
  },
}

export default nextConfig
