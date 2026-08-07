'use client'

import Link from 'next/link'
import { LanguageToggle } from './language-toggle'
import { SiteFooter } from './site-footer'
import { useT } from './language-context'

export function LegalPage({
  title,
  sections,
}: {
  title: string
  sections: { heading: string; body: string[] }[]
}) {
  const t = useT()
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <LanguageToggle />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-32">
        <Link
          href="/"
          className="font-label text-[13px] uppercase tracking-[0.17em] text-foreground/72 transition-colors hover:text-foreground"
        >
          ← {t.legal.back}
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h1>
        {/* These are the two pages people actually read top to bottom, and
            the body was set at the browser default across the page's full
            column. 17px over a 68-character measure is the comfortable range. */}
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-label text-[15px] font-medium uppercase tracking-[0.14em] text-accent-tint">
                {section.heading}
              </h2>
              <div className="mt-3 max-w-[68ch] space-y-2.5 text-[17px] leading-[1.65] text-foreground/85">
                {section.body.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
