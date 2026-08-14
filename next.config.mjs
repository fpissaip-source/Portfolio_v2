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
