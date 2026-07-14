'use client'

import dynamic from 'next/dynamic'
import { Reveal, WordReveal } from './anim'

const TechOrbs = dynamic(() => import('./tech-orbs'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Loading stack…
      </span>
    </div>
  ),
})

type Tech = { name: string; logo: string; tint?: 'white' }

const TECH: Tech[] = [
  { name: 'TypeScript', logo: '/logos/typescript.svg' },
  { name: 'JavaScript', logo: '/logos/javascript.svg' },
  { name: 'React', logo: '/logos/react.svg' },
  { name: 'Next.js', logo: '/logos/nextdotjs.svg', tint: 'white' },
  { name: 'Node.js', logo: '/logos/nodedotjs.svg' },
  { name: 'Python', logo: '/logos/python.svg' },
  { name: 'FastAPI', logo: '/logos/fastapi.svg' },
  { name: 'PostgreSQL', logo: '/logos/postgresql.svg' },
  { name: 'Prisma', logo: '/logos/prisma.svg', tint: 'white' },
  { name: 'Redis', logo: '/logos/redis.svg' },
  { name: 'Supabase', logo: '/logos/supabase.svg' },
  { name: 'Docker', logo: '/logos/docker.svg' },
  { name: 'Tailwind CSS', logo: '/logos/tailwindcss.svg' },
  { name: 'Three.js', logo: '/logos/threedotjs.svg', tint: 'white' },
  { name: 'GSAP', logo: '/logos/greensock.svg' },
  { name: 'Framer', logo: '/logos/framer.svg', tint: 'white' },
  { name: 'Git', logo: '/logos/git.svg' },
  { name: 'OpenAI', logo: '/logos/openai.svg', tint: 'white' },
  { name: 'Vercel', logo: '/logos/vercel.svg', tint: 'white' },
]

export function TechStack() {
  return (
    <section id="stack" className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32">
      <div className="mb-12 flex flex-col items-center gap-4 text-center">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
            Toolkit
          </span>
        </Reveal>
        <WordReveal
          as="h2"
          text="The stack behind the systems."
          className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="max-w-md text-pretty text-sm text-muted-foreground">
            The tools I use to design, build and ship complete systems — end to
            end.
          </p>
        </Reveal>
      </div>

      <Reveal y={40}>
        {/* Interactive 3D balls on every device. `touch-pan-y` lets the page
            still scroll vertically on mobile while horizontal drags shove the
            balls around. */}
        <div className="relative h-[420px] w-full touch-pan-y overflow-hidden rounded-3xl sm:h-[560px] md:touch-none">
          <TechOrbs />
        </div>
      </Reveal>

      {/* Clean, legible reference list */}
      <Reveal delay={0.1}>
        <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {TECH.map((t, i) => (
            <li key={t.name} className="flex items-center gap-4">
              <span className="font-mono text-base text-muted-foreground transition-colors hover:text-foreground">
                {t.name}
              </span>
              {i < TECH.length - 1 && (
                <span className="h-1 w-1 rounded-full bg-blue/50" aria-hidden />
              )}
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Delivery matrix — the layers behind the logos */}
      <Reveal delay={0.15}>
        <dl className="mx-auto mt-16 grid max-w-4xl gap-x-10 gap-y-5 sm:grid-cols-2">
          {MATRIX.map((m) => (
            <div key={m.layer} className="flex flex-col gap-1 border-l border-purple/25 pl-4">
              <dt className="font-mono text-[11px] uppercase tracking-[0.25em] text-purple/80">
                {m.layer}
              </dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">
                {m.items}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}

const MATRIX: { layer: string; items: string }[] = [
  { layer: 'Core & Logic', items: 'TypeScript, JavaScript, Node.js, Express.js, Python, rule engines' },
  { layer: 'Frontend & Motion', items: 'React, Vite, Tailwind CSS, Three.js, Framer Motion, GSAP' },
  { layer: 'Data & APIs', items: 'PostgreSQL, Drizzle ORM, Zod, REST APIs, OAuth2, Bungie API' },
  { layer: 'AI & Memory', items: 'Autonomous agents, knowledge graphs, Nexus Brain, weighted experience loops' },
  { layer: 'Infrastructure', items: 'Linux/Ubuntu VPS, Windows instances, Railway, Render, Replit, Cloudflare' },
  { layer: 'Messaging & Delivery', items: 'Telegram bots, Resend e-mail, webhooks, automated processing pipelines' },
  { layer: 'Search & Growth', items: 'Technical SEO, AEO, JSON-LD, sitemaps, local search architecture' },
  { layer: 'Product Domains', items: 'Gaming, EdTech, operations, logistics, FinTech, brand production, utilities' },
]
