'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Reveal, WordReveal } from './anim'

type Project = {
  name: string
  tagline: string
  description: string
  image: string
  stack: string[]
  status: string
  featured?: boolean
}

const PROJECTS: Project[] = [
  {
    name: 'L.U.K.A.S.',
    tagline: 'Logical Universal Knowledge Agent System',
    description:
      'A persistent, autonomous software agent whose behaviour emerges from an evolving history of decisions rather than static prompting. Full isolated control over its own server infrastructure, a Nexus Brain of structured knowledge graphs for persistent memory, weighted experience loops, and a peer-to-peer network for AI-only collaborative learning and reflexive metacognition.',
    image: '/projects/lukas.png',
    stack: ['TypeScript', 'Node.js', 'Knowledge Graphs', 'PostgreSQL', 'Linux VPS'],
    status: 'Core R&D System',
    featured: true,
  },
  {
    name: 'GuardianGrid',
    tagline: 'Destiny 2 Companion Platform',
    description:
      'A standalone AAA game companion built directly on the Bungie API. Secure OAuth2 identity with Cloudflare Turnstile, character & inventory intelligence, loadouts, automated god-roll and build analysis, auto-loadout logic for boss rooms and a PvP DNA scan.',
    image: '/projects/guardiangrid.png',
    stack: ['React', 'Bungie API', 'OAuth2', 'Node.js', 'Cloudflare'],
    status: 'Active Development',
  },
  {
    name: 'TaxiBB Essen',
    tagline: 'Live Commercial Case',
    description:
      'A transport & logistics platform delivered end-to-end for a real client — first B2B/B2C deployment. Instant and scheduled bookings, a PostgreSQL-backed admin area, Resend email workflows, and uncompromising technical SEO with JSON-LD Answer Engine Optimization.',
    image: '/projects/taxibb.png',
    stack: ['React', 'PostgreSQL', 'Drizzle ORM', 'Resend', 'JSON-LD'],
    status: 'Live System',
  },
  {
    name: 'StudyForge',
    tagline: 'AI Learning Platform',
    description:
      'A document-to-learning workflow: upload notes and PDFs, then generate structured summaries, key terms, comprehension questions and adaptive quizzes. Includes mock-exam simulation and a full learning history for long-term use.',
    image: '/projects/studyforge.png',
    stack: ['React', 'Tailwind CSS', 'TypeScript', 'AI Pipelines'],
    status: 'Product Prototype',
  },
  {
    name: 'Callcenter Operations Suite',
    tagline: 'Business Operations Platform',
    description:
      'An internal performance, CRM and workforce platform. Operational KPI dashboards, customer & CRM documentation, live leaderboards, shift planning, an internal chat and incentive systems — all behind configurable admin roles and permissions.',
    image: '/projects/callcenter.png',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Zod'],
    status: 'Full-Stack Concept',
  },
  {
    name: 'Automation Systems',
    tagline: 'Bots, Scraping & Trading R&D',
    description:
      'A family of VPS-based automations: a Telegram scraper & distribution bot with a full link-ingestion pipeline, plus experimental Polymarket / trading research — event-market discovery, CLOB order-book logic and a rule-based signal engine.',
    image: '/projects/appautomation.png',
    stack: ['Python', 'Node.js', 'Telegram API', 'Webhooks', 'VPS'],
    status: 'Deployed / Research',
  },
  {
    name: 'Issa Hareb Digital',
    tagline: 'Service Platform',
    description:
      'A digital studio for modern websites, custom apps and AI automations with rapid delivery. Apple-inspired scroll storytelling, pricing and testimonials, lead capture, and a reusable component stack — with payment integration on the roadmap.',
    image: '/projects/ihdigital.png',
    stack: ['React', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
    status: 'Active Business Platform',
  },
]

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 150, damping: 18 })
  const sry = useSpring(ry, { stiffness: 150, damping: 18 })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    ry.set(px * 8)
    rx.set(-py * 8)
  }
  function onLeave() {
    rx.set(0)
    ry.set(0)
  }

  return (
    <Reveal delay={(index % 2) * 0.08} y={40} className={project.featured ? 'md:col-span-2' : undefined}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 1000 }}
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`glass group relative overflow-hidden rounded-3xl p-2 will-transform ${
          project.featured ? 'md:grid md:grid-cols-2 md:gap-2' : ''
        }`}
      >
        {/* glow border on hover */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 [box-shadow:0_0_80px_-20px_var(--blue),inset_0_0_0_1px_color-mix(in_oklch,var(--blue)_40%,transparent)]" />

        <div
          className={`relative overflow-hidden rounded-2xl ${
            project.featured ? 'aspect-[16/10] md:h-full md:min-h-[22rem]' : 'aspect-[16/10]'
          }`}
        >
          <Image
            src={project.image || '/placeholder.svg'}
            alt={`${project.name} — ${project.tagline}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 will-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-background/60 px-3 py-1 font-mono text-xs tracking-tight text-muted-foreground backdrop-blur">
            {project.tagline}
          </span>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/60 px-3 py-1 font-mono text-xs tracking-tight text-blue backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blue [box-shadow:0_0_8px_var(--blue)]" />
            {project.status}
          </span>
        </div>

        <div className={`px-4 pb-4 pt-5 ${project.featured ? 'md:flex md:flex-col md:justify-center md:px-8' : ''}`}>
          <h3 className={`font-semibold tracking-tight ${project.featured ? 'text-3xl sm:text-4xl' : 'text-2xl'}`}>
            {project.name}
          </h3>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {project.stack.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Reveal>
  )
}

export function Projects() {
  return (
    <section id="work" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="mb-16 flex flex-col gap-4">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
            Featured Work
          </span>
        </Reveal>
        <WordReveal
          as="h2"
          text="Products, not portfolios."
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="max-w-xl text-pretty text-muted-foreground">
            A selection of intelligent systems and automations shipped to
            production.
          </p>
        </Reveal>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}
