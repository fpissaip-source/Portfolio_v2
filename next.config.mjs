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

/**
 * Sicherheits-Header.
 *
 * Gemessen am 22.08.2026: die Live-Seite lieferte keinen einzigen davon aus.
 * Das ist kein akutes Loch — es gibt keine Anmeldung, keine Sitzung und keine
 * Nutzerdaten zu stehlen —, aber es sind die Schlösser, die man anbringt,
 * bevor man sie braucht, und jedes davon kostet nichts.
 *
 * Bewusst NICHT dabei: eine scharfe Content-Security-Policy. Diese Seite
 * bindet den L.U.K.A.S.-Widget von einem fremden Ursprung ein, Next.js setzt
 * eigene Inline-Skripte zum Hochfahren, und Tailwind arbeitet mit
 * Inline-Stilen. Eine geratene Policy hätte gute Chancen, die Seite still zu
 * zerlegen — man merkt es erst, wenn ein Besucher eine leere Fläche sieht.
 * Deshalb steht sie unten als Report-Only: der Browser meldet, was sie
 * blockiert HÄTTE, und bricht nichts. Aus diesen Meldungen wird die scharfe
 * Fassung gebaut, nicht aus Vermutungen.
 */
const SECURITY_HEADERS = [
  {
    /* Ein Jahr HTTPS-Zwang, samt Unterdomänen. Ohne diesen Header ist der
       allererste Aufruf über http:// angreifbar, bevor die Weiterleitung
       greift. preload fehlt mit Absicht: der Eintrag in die Browserliste ist
       nur schwer rückgängig zu machen und will überlegt sein. */
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  /* Verhindert, dass ein Browser eine Datei anders interpretiert, als der
     Content-Type sagt — die Grundlage einiger Upload-Angriffe. */
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /* Kein Einbetten in fremde Rahmen. Schützt gegen Clickjacking: eine fremde
     Seite legt die eigene unsichtbar über ihre eigenen Schaltflächen. */
  { key: 'X-Frame-Options', value: 'DENY' },
  /* Beim Verlassen der Seite wird die Herkunft nur noch als Domain
     mitgeschickt, nicht mehr der volle Pfad. */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  /* Die Seite braucht weder Kamera noch Mikrofon noch Standort. Wer nichts
     davon anfordert, sollte es auch nicht dürfen — falls doch einmal fremder
     Code hineingerät. */
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

/* Die Ursprünge, die tatsächlich vorkommen — aus dem Quelltext erhoben, nicht
   geraten: der Agenten-Server für Widget und Gespräch, Google Fonts für die
   vier Schriften. */
const LUKAS_ORIGIN = 'https://portfoliov2-production-992f.up.railway.app'

const CSP_REPORT_ONLY = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${LUKAS_ORIGIN}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  `connect-src 'self' ${LUKAS_ORIGIN} https://api.elevenlabs.io wss://api.elevenlabs.io`,
  `frame-src ${LUKAS_ORIGIN}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  /* `upgrade-insecure-requests` gehört NICHT in die Report-Only-Fassung: der
     Browser ignoriert die Direktive dort und schreibt dafür bei jedem
     Seitenaufruf eine Warnung in die Konsole. In die scharfe Fassung kommt sie
     mit. */
].join('; ')

const nextConfig = {
  /* Verrät die Technik hinter der Seite an jeden, der einen Header liest.
     Kein Loch für sich, aber es erspart einem Angreifer die Frage, welche
     Schwachstellenliste er durchgehen muss. */
  poweredByHeader: false,

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
        // Auf allem, was ausgeliefert wird.
        source: '/:path*',
        headers: [
          ...SECURITY_HEADERS,
          { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
        ],
      },
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
        /*
         * Die Bilddateien der Marke. Sie tragen eine Fassungsnummer im Namen,
         * also gilt hier dasselbe wie fuer die Filme: eine neue Fassung ist
         * eine neue Datei, und die alte darf beliebig lange im Zwischenspeicher
         * bleiben.
         */
        source: '/:file(apple-icon-v2.png|icon-512-v2.png|icon-32-v2.png)',
        headers: [{ key: 'Cache-Control', value: IMMUTABLE }],
      },
      {
        /*
         * /favicon.ico ist die eine Ausnahme und muss es sein: Googles
         * Favicon-Crawler fragt genau diesen Pfad ab, er laesst sich also
         * nicht umbenennen. Eine unveraenderliche Datei unter einem festen
         * Namen ist ein Widerspruch — beim letzten Wechsel lieferte
         * Cloudflare tagelang das alte Zeichen aus. Ein Tag ist lang genug,
         * um Anfragen zu buendeln, und kurz genug, damit ein neues Zeichen
         * ankommt, ohne dass jemand den Zwischenspeicher leeren muss.
         */
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
      },
    ]
  },
}

export default nextConfig
