import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import Script from 'next/script'
import { LanguageProvider } from '@/components/language-context'
import './globals.css'

// L.U.K.A.S. chat/voice widget — vanilla script served by the Lukas
// backend (fpissaip-source/lukas_autonom), self-injects a floating
// button + panel into document.body. lazyOnload: not critical for first
// paint, and the backend's own origin-check only allows this domain.
const LUKAS_API = 'https://portfoliov2-production-992f.up.railway.app'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

// Distinctive display face used only for the "I AM ISSA HAREB" name reveal
// in the cinematic intro — deliberately not the site's default Geist Sans,
// so the name reads as a designed title moment rather than body type.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Issa Hareb | Building Intelligent Systems',
  description:
    'Issa Hareb, full-stack product engineer in Essen, Germany, building autonomous agents, data-intensive platforms and high-end interfaces, end to end.',
  openGraph: {
    title: 'Issa Hareb | Building Intelligent Systems',
    description:
      'Full-stack product engineer building autonomous agents, data-intensive platforms and high-end interfaces.',
    type: 'website',
  },
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
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} bg-background`}
    >
      <body className="antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <Script
          src={`${LUKAS_API}/widget.js`}
          data-api={LUKAS_API}
          data-voice="agent"
          data-agent-id="agent_4501ky1q2tgvepx906k5waew8bwk"
          strategy="lazyOnload"
        />
      </body>
    </html>
  )
}
