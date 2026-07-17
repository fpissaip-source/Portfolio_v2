'use client'

import Image from 'next/image'
import { Mail } from 'lucide-react'
import { useT } from './language-context'

const SOCIALS = [
  { type: 'img' as const, src: '/logos/github.svg', href: '#', label: 'GitHub' },
  {
    type: 'img' as const,
    src: '/logos/linkedin.svg',
    href: '#',
    label: 'LinkedIn',
  },
  { type: 'icon' as const, href: 'mailto:info@hareb.org', label: 'Email' },
]

export function SiteFooter() {
  const t = useT()
  return (
    <footer className="relative border-t border-white/5 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className="font-semibold">Issa Hareb</span>
          <span className="text-blue">.</span>
          <span className="text-muted-foreground">
            {t.footer.tagline}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              aria-label={s.label}
              className="glass flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
            >
              {s.type === 'img' ? (
                <Image
                  src={s.src}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 opacity-70 invert transition-opacity hover:opacity-100"
                />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </a>
          ))}
        </div>

        <p className="font-mono text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} · {t.footer.copyright}
        </p>
      </div>
    </footer>
  )
}
