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
    name: 'GuardianGrid',
    tagline: 'Destiny 2 Companion Platform',
    description:
      'A standalone AAA game companion built directly on the Bungie API — guardiangrid.net. Secure OAuth2 identity with Cloudflare Turnstile, character & inventory intelligence, loadouts, automated god-roll and build analysis, auto-loadout logic for boss rooms and a PvP DNA scan with near-real-time activity states.',
    image: '/projects/guardiangrid.png',
    stack: ['React', 'Bungie API', 'OAuth2', 'Node.js', 'Cloudflare'],
    status: 'Active Development',
    featured: true,
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
          <span className="absolute bottom-3 left-4 font-mono text-xs uppercase tracking-[0.2em] text-white/70 [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">
            {project.tagline}
          </span>
          <span className="absolute bottom-3 right-4 font-mono text-xs uppercase tracking-[0.2em] text-blue [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">
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

          <p className="mt-4 font-mono text-xs leading-relaxed text-muted-foreground/80">
            {project.stack.join(' · ')}
          </p>
        </div>
      </motion.div>
    </Reveal>
  )
}

/** The rest of the register — one line each, like a credits roll. */
const REGISTER: { name: string; category: string; status: string }[] = [
  { name: 'Polymarket / Trading Automation', category: 'Automation & Data R&D', status: 'Research Prototype' },
  { name: 'Financial Transaction Tracker', category: 'FinTech UI', status: 'App Prototype' },
  { name: 'Qibla One', category: 'Utility App', status: 'Product Concept' },
  { name: 'Mercedes Assessment Web App', category: 'Assessment Platform', status: 'Web-App Prototype' },
  { name: 'TENSA. Digital Production System', category: 'Brand Operations', status: 'Active Brand Project' },
  { name: 'MoncyDev / Portfolio Web Systems', category: 'Web Experience', status: 'Web Portfolio Work' },
  { name: '3D Character & Rigging Preparation', category: 'Creative Pipeline', status: 'Visual Development' },
  { name: 'Motion, Gaming & Interface Experiments', category: 'Prototype Lab', status: 'Ongoing Lab' },
]

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

      {/* Full register — the credits roll */}
      <div className="mt-24">
        <Reveal>
          <div className="mb-8 flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
              Complete Project Register
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-purple/30 to-transparent" />
          </div>
        </Reveal>
        <ul className="divide-y divide-white/5">
          {REGISTER.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.03} y={16}>
              <li className="group grid gap-1 py-4 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1.4fr_1fr_auto] sm:items-baseline sm:gap-6 sm:px-3">
                <span className="font-medium tracking-tight text-foreground">
                  {r.name}
                </span>
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {r.category}
                </span>
                <span className="font-mono text-xs text-purple/80">
                  {r.status}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}
