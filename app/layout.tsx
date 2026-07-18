import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { LanguageProvider } from '@/components/language-context'
import './globals.css'

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
      </body>
    </html>
  )
}
