'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { Reveal, WordReveal } from './anim'
import type { OrbProject } from './project-orbs'

const ProjectOrbs = dynamic(() => import('./project-orbs'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        Loading gallery…
      </span>
    </div>
  ),
})

type Project = {
  name: string
  tagline: string
  description: string
  /** Omitted for hobby projects — no screenshot, just the write-up. */
  image?: string
  /** Optional looping screen capture shown instead of the still image. */
  video?: string
  stack: string[]
  status: string
  featured?: boolean
  /** Personal/side projects — rendered without media, with a plain badge. */
  hobby?: boolean
}

const PROJECTS: Project[] = [
  {
    name: 'GuardianGrid',
    tagline: 'Destiny 2 Companion Platform',
    description:
      'A standalone AAA game companion built directly on the Bungie API: guardiangrid.io. Secure OAuth2 identity with Cloudflare Turnstile, character & inventory intelligence, loadouts, automated god-roll and build analysis, auto-loadout logic for boss rooms and a PvP DNA scan with near-real-time activity states.',
    image: '/projects/guardiangrid-login.jpg',
    video: '/projects/guardiangrid-scroll.mp4',
    stack: ['React', 'Bungie API', 'OAuth2', 'Node.js', 'Cloudflare'],
    status: 'Active Development',
    featured: true,
  },
  {
    name: 'TaxiBB Essen',
    tagline: 'Live Commercial Case',
    description:
      'A transport & logistics platform delivered end-to-end for a real client, the first B2B/B2C deployment. Instant and scheduled bookings, a PostgreSQL-backed admin area, Resend email workflows, and uncompromising technical SEO with JSON-LD Answer Engine Optimization.',
    image: '/projects/taxibb.png',
    video: '/projects/taxibb-scroll.mp4',
    stack: ['React', 'PostgreSQL', 'Drizzle ORM', 'Resend', 'JSON-LD'],
    status: 'Live System',
  },
  {
    name: 'StudyForge',
    tagline: 'AI Learning Platform',
    description:
      'A document-to-learning workflow: upload notes and PDFs, then generate structured summaries, key terms, comprehension questions and adaptive quizzes. Includes mock-exam simulation and a full learning history for long-term use.',
    stack: ['React', 'Tailwind CSS', 'TypeScript', 'AI Pipelines'],
    status: 'Product Prototype',
    hobby: true,
  },
  {
    name: 'Team Operations Suite',
    tagline: 'Business Operations Platform',
    description:
      'An internal performance, CRM and workforce platform for any team-based business. Operational KPI dashboards, customer & CRM documentation, live leaderboards, shift planning, an internal chat and incentive systems, all behind configurable admin roles and permissions.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Zod'],
    status: 'Full-Stack Concept',
    hobby: true,
  },
  {
    name: 'Automation Systems',
    tagline: 'Bots, Scraping & Trading R&D',
    description:
      'A family of VPS-based automations: a Telegram scraper & distribution bot with a full link-ingestion pipeline, plus experimental Polymarket and trading research covering event-market discovery, CLOB order-book logic and a rule-based signal engine.',
    image: '/projects/appautomation.png',
    stack: ['Python', 'Node.js', 'Telegram API', 'Webhooks', 'VPS'],
    status: 'Deployed / Research',
  },
  {
    name: 'Bewerbungsbot',
    tagline: 'AI Job Application Assistant',
    description:
      'An AI-driven job search and application pipeline. Aggregates apprenticeship listings from the German Federal Employment Agency API, finds and ranks real company contact emails, then drafts a fully personalized German cover letter with GPT-4o grounded strictly in the applicant\'s own CV, generates the application PDF and sends it automatically. Includes bulk-apply with duplicate detection and offline retry queuing.',
    stack: ['React', 'Express', 'PostgreSQL', 'Drizzle ORM', 'OpenAI', 'Zod'],
    status: 'In Use',
    hobby: true,
  },
]

/** Expanded, full-detail view of one project — a centered glass panel over
 *  a dimmed backdrop. Clicking the backdrop (not the panel) or Escape
 *  returns to the floating 3D gallery. */
function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const lenisWin = window as unknown as { __lenis?: { stop: () => void; start: () => void } }
    lenisWin.__lenis?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      lenisWin.__lenis?.start()
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass relative w-full max-w-2xl overflow-hidden rounded-3xl p-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white"
        >
          &times;
        </button>

        {project.hobby ? (
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.03] px-5 py-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-purple">
              Hobby Project
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {project.tagline}
            </span>
          </div>
        ) : (
          <div
            className={`relative overflow-hidden rounded-2xl ${
              project.featured ? 'aspect-[16/10]' : 'aspect-[16/10]'
            }`}
          >
            {project.video ? (
              <video
                src={project.video}
                poster={project.image}
                muted
                loop
                autoPlay
                playsInline
                aria-label={`${project.name}: ${project.tagline}`}
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            ) : (
              <Image
                src={project.image || '/placeholder.svg'}
                alt={`${project.name}: ${project.tagline}`}
                fill
                sizes="(max-width: 768px) 100vw, 42rem"
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.18em] [text-shadow:0_1px_12px_rgba(0,0,0,0.8)]">
              <span className="min-w-0 truncate text-white/70">{project.tagline}</span>
              <span className="shrink-0 text-blue">{project.status}</span>
            </div>
          </div>
        )}

        <div className="px-5 pb-6 pt-5 sm:px-7">
          <h3 className="text-3xl font-semibold tracking-tight">{project.name}</h3>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            {project.description}
          </p>
          <p className="mt-5 font-mono text-xs leading-relaxed text-muted-foreground/80">
            {project.stack.join(' · ')}
          </p>
        </div>
      </div>
    </div>
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
  const [expanded, setExpanded] = useState<string | null>(null)
  const expandedProject = PROJECTS.find((p) => p.name === expanded) ?? null

  const orbProjects: OrbProject[] = PROJECTS.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    status: p.status,
    hobby: p.hobby,
    featured: p.featured,
  }))

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
          text="Projekte & Hobbyprojekte"
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Hover a node to preview it, click to see the full project — click
            outside to return to the gallery.
          </p>
        </Reveal>
      </div>

      {/* Interactive 3D gallery — projects and hobby projects float as
          physical nodes; touch-pan-y keeps vertical scroll working on
          mobile while the canvas still catches taps/hovers. */}
      <div className="relative h-[560px] w-full overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] sm:h-[640px]">
        <div className="absolute inset-0 touch-pan-y md:touch-none">
          <ProjectOrbs projects={orbProjects} onExpand={setExpanded} />
        </div>
      </div>

      {expandedProject && (
        <ProjectDetail project={expandedProject} onClose={() => setExpanded(null)} />
      )}

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
