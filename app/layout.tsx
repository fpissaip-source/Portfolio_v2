import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { LanguageProvider } from '@/components/language-context'
import './globals.css'
import './loader-transition.css'
import './elegant-headings.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

// Headline face. A contemporary grotesque with real character in the
// letterforms — narrow apertures, a hard-cut 'a' and 'g', an optical-size
// axis that keeps large settings from going soft. It carries the same
// machined feel as the subject matter, where an editorial serif read
// literary, and it still separates cleanly from Geist in the interface and
// the mono kickers, which is the whole job of a display face here.
const displayFace = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display-face',
})

// Distinctive display face used only for the "I AM ISSA HAREB" name reveal
// in the cinematic intro — deliberately not the site's default Geist Sans,
// so the name reads as a designed title moment rather than body type.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
})

const SITE_URL = 'https://issahareb.me'
const SITE_TITLE = 'Issa Hareb | Building Intelligent Systems'
const SITE_DESCRIPTION =
  'Issa Hareb, full-stack product engineer in Essen, Germany, building autonomous agents, data-intensive platforms and high-end interfaces, end to end.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description:
      'Full-stack product engineer building autonomous agents, data-intensive platforms and high-end interfaces.',
    url: SITE_URL,
    siteName: 'Issa Hareb',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description:
      'Full-stack product engineer building autonomous agents, data-intensive platforms and high-end interfaces.',
  },
}

/** Person structured data — helps search engines associate this site with
 *  Issa Hareb as an entity (knowledge panel eligibility) rather than
 *  reading it as anonymous marketing copy. */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Issa Hareb',
  url: SITE_URL,
  jobTitle: 'Full-Stack Product Engineer',
  description: SITE_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Essen',
    addressCountry: 'DE',
  },
  sameAs: ['https://github.com/fpissaip-source'],
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#050505',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${displayFace.variable} ${spaceGrotesk.variable} bg-background`}
    >
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        {/* @vercel/analytics is deliberately not mounted. This site is
            deployed on Railway, not Vercel, so the script it injects —
            /_vercel/insights/script.js — is served by nothing: verified 404
            on the live domain, i.e. a failed request on every single visit
            that collected no data in return. The dependency stays in
            package.json so this is one line to restore if the site ever
            moves to Vercel. */}
      </body>
    </html>
  )
}
