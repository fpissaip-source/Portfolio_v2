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
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-24 sm:py-32">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {t.legal.back}
        </Link>
        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-purple">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-2 leading-relaxed text-foreground/80">
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
