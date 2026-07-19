'use client'

import dynamic from 'next/dynamic'
import { Reveal } from './anim'
import { useT } from './language-context'
import { useNearViewport } from './use-near-viewport'
import { SectionHeading } from './section-heading'

const TechOrbs = dynamic(() => import('./tech-orbs'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="text-sm font-medium tracking-tight text-muted-foreground">
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
  const t = useT()
  const { ref: orbsRef, near: orbsNear } = useNearViewport<HTMLDivElement>()
  return (
    <section id="stack" className="relative py-24 sm:py-32">
      <div ref={orbsRef} className="absolute inset-0 z-10 overflow-hidden">
        <div className="sticky top-0 h-[100svh] w-full touch-pan-y md:touch-none">
          {orbsNear && <TechOrbs />}
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mx-auto max-w-7xl px-6">
        <SectionHeading
          label={t.techStack.kicker}
          heading={t.techStack.heading}
          description={t.techStack.subtitle}
          tone="blue"
          className="mb-12"
          descriptionClassName="mx-auto max-w-md text-sm"
        />

        <div className="h-[380px] sm:h-[480px]" aria-hidden />

        <Reveal delay={0.1}>
          <ul className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {TECH.map((tech, i) => (
              <li key={tech.name} className="flex items-center gap-4">
                <span className="text-base font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground">
                  {tech.name}
                </span>
                {i < TECH.length - 1 && (
                  <span className="h-1 w-1 rounded-full bg-blue/50" aria-hidden />
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <dl className="mx-auto mt-16 grid max-w-4xl gap-x-10 gap-y-5 sm:grid-cols-2">
            {t.techStack.matrix.map((m) => (
              <div
                key={m.layer}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5"
              >
                <dt className="text-sm font-semibold tracking-tight text-purple/85">
                  {m.layer}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {m.items}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  )
}
