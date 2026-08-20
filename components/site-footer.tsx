'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { useT } from './language-context'
import { openConsentSettings } from '@/lib/consent'

const SOCIALS = [
  { type: 'img' as const, src: '/logos/github.svg', href: 'https://github.com/fpissaip-source', label: 'GitHub' },
  // Restored with the real profile URL. It had shipped as href="#", which
  // looks like a live profile link and instead jumps to the top of a
  // 21,000px page, so it was pulled until there was something to point at.
  //
  // The www form rather than de.linkedin.com: the locale subdomain is a
  // mirror that redirects, and this URL is also the one in `sameAs` — a
  // corroborating profile only corroborates if both places name it
  // identically.
  { type: 'img' as const, src: '/logos/linkedin.svg', href: 'https://www.linkedin.com/in/issa-hareb-10a61642b', label: 'LinkedIn' },
  // Canonical profile URL, not the /web_profiles tab that was handed over:
  // that one 301s, and `sameAs` has to name the resource itself.
  //
  // A text mark rather than a logo. There is no Xing SVG in public/logos,
  // and inventing a path for a trademarked mark from memory renders
  // garbage; the letters are unambiguous at this size and cost nothing.
  { type: 'text' as const, href: 'https://www.xing.com/profile/Issa_Hareb02082', label: 'Xing', mark: 'Xg' },
  { type: 'icon' as const, href: 'mailto:info@hareb.org', label: 'Email' },
]

export function SiteFooter() {
  const t = useT()
  return (
    <footer className="relative border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm tracking-tight">
          <span className="font-semibold">Issa Hareb</span>
          <span className="text-blue">.</span>
          <span className="text-[15px] text-foreground/70">
            {t.footer.tagline}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              {...(s.href.startsWith('http') ? { target: '_blank', rel: 'me noreferrer' } : {})}
              className="glass flex h-10 w-10 items-center justify-center rounded-full text-foreground/70 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              {s.type === 'img' ? (
                <Image
                  src={s.src}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 opacity-70 invert transition-opacity hover:opacity-100"
                />
              ) : s.type === 'text' ? (
                <span aria-hidden className="text-[13px] font-semibold tracking-tight">
                  {s.mark}
                </span>
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </a>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] font-medium tracking-tight text-foreground/65 sm:justify-end">
          <Link href="/affiliate" className="py-1.5 transition-colors hover:text-foreground">
            Affiliate
          </Link>
          <Link href="/impressum" className="py-1.5 transition-colors hover:text-foreground">
            {t.footer.imprint}
          </Link>
          <Link href="/datenschutz" className="py-1.5 transition-colors hover:text-foreground">
            {t.footer.privacy}
          </Link>
          {/* Withdrawing consent has to be as reachable as giving it, so the
              preferences dialog gets a permanent entry point rather than
              living only in the first-visit banner. */}
          <button
            type="button"
            onClick={openConsentSettings}
            className="py-1.5 transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {t.consent.footerLink}
          </button>
          <p>
            &copy; {new Date().getFullYear()} · {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
