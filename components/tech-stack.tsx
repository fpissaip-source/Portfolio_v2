'use client'

import dynamic from 'next/dynamic'
import { Reveal } from './anim'
import { useT } from './language-context'
import { useNearViewport } from './use-near-viewport'
import { SectionHeading } from './section-heading'

/** Own component, not an inline element: dynamic()'s `loading` is called as a
 *  render function, so a hook used directly inside it would not be valid. */
function StackLoading() {
  const t = useT()
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="text-[15px] font-medium tracking-tight text-foreground/72">
        {t.techStack.loading}
      </span>
    </div>
  )
}

const TechOrbs = dynamic(() => import('./tech-orbs'), {
  ssr: false,
  loading: () => <StackLoading />,
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
    <section id="stack" className="relative py-32">
      <div ref={orbsRef} className="absolute inset-0 z-10 overflow-hidden">
        <div className="sticky top-0 h-[100svh] w-full touch-pan-y md:touch-none">
          {orbsNear && <TechOrbs />}
        </div>
      </div>

      <div className="pointer-events-none relative z-20 mx-auto max-w-7xl px-6">
        {/* The tech orbs are near-white spheres drifting through the whole
            section, and they pass directly behind this heading — white
            display type on a white sphere is not a contrast problem at the
            margins, it is invisible. This scrim keeps the canvas readable
            without hiding the orbs: opaque under the words, gone by the time
            it reaches the orbs' own space. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-16 h-[420px] -z-10"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 32%, var(--background) 0%, color-mix(in oklch, var(--background) 88%, transparent) 45%, transparent 78%)',
          }}
        />
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
                <span className="text-[17px] font-medium tracking-tight text-foreground/78 transition-colors hover:text-foreground">
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
          {/* A technical listing, so it is set as a register: hairline rules,
              no boxes (DESIGN.md §5). Layer names are instrument labels in
              the section's own accent — this section is blue, and giving the
              layer names violet put two accents in one viewport (§3). */}
          <dl className="mx-auto mt-16 grid max-w-4xl gap-x-12 sm:grid-cols-2">
            {t.techStack.matrix.map((m) => (
              <div key={m.layer} className="border-t border-white/10 py-5">
                <dt className="font-label text-[12px] uppercase tracking-[0.22em] text-blue/90">
                  {m.layer}
                </dt>
                <dd className="mt-2.5 text-[16px] leading-[1.6] text-foreground/78">
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
