'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { motion } from 'motion/react'
import { Reveal, WordReveal } from './anim'
import type { OrbProject } from './project-orbs'

const easeOut = [0.22, 1, 0.36, 1] as const

const loadingFallback = (
  <div className="absolute inset-0 grid place-items-center">
    <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
      Loading constellation…
    </span>
  </div>
)

const ProjectOrbs = dynamic(() => import('./project-orbs'), {
  ssr: false,
  loading: () => loadingFallback,
})

const ProjectConstellationMobile = dynamic(() => import('./project-constellation-mobile'), {
  ssr: false,
  loading: () => loadingFallback,
})

type Project = {
  name: string
  /** Short 2-3 word category shown on the compact constellation label. */
  category: string
  tagline: string
  description: string
  /** Omitted for hobby projects — no screenshot, just the write-up. */
  image?: string
  /** Optional looping screen capture shown instead of the still image. */
  video?: string
  /** Playback speed multiplier for `video` — defaults to 1 (normal speed). */
  videoPlaybackRate?: number
  stack: string[]
  status: string
  featured?: boolean
  /** Personal/side projects — rendered without media, with a plain badge. */
  hobby?: boolean
  liveUrl?: string
  githubUrl?: string
}

const PROJECTS: Project[] = [
  {
    name: 'GuardianGrid',
    category: 'Destiny 2 Companion',
    tagline: 'Destiny 2 Companion Platform',
    description:
      'A standalone AAA game companion built directly on the Bungie API: guardiangrid.io. Secure OAuth2 identity with Cloudflare Turnstile, character & inventory intelligence, loadouts, automated god-roll and build analysis, auto-loadout logic for boss rooms and a PvP DNA scan with near-real-time activity states.',
    image: '/projects/guardiangrid-login.jpg',
    video: '/videos/guardiangrid.mp4',
    stack: ['React', 'Bungie API', 'OAuth2', 'Node.js', 'Cloudflare'],
    status: 'Active Development',
    featured: true,
    liveUrl: 'https://guardiangrid.io',
  },
  {
    name: 'TaxiBB Essen',
    category: 'Live Client System',
    tagline: 'Live Commercial Case',
    description:
      'A transport & logistics platform delivered end-to-end for a real client, the first B2B/B2C deployment. Instant and scheduled bookings, a PostgreSQL-backed admin area, Resend email workflows, and uncompromising technical SEO with JSON-LD Answer Engine Optimization.',
    image: '/projects/taxibb.png',
    video: '/videos/taxibb.mp4',
    videoPlaybackRate: 1.6,
    stack: ['React', 'PostgreSQL', 'Drizzle ORM', 'Resend', 'JSON-LD'],
    status: 'Live System',
  },
  {
    name: 'StudyForge',
    category: 'AI Learning Platform',
    tagline: 'AI Learning Platform',
    description:
      'A document-to-learning workflow: upload notes and PDFs, then generate structured summaries, key terms, comprehension questions and adaptive quizzes. Includes mock-exam simulation and a full learning history for long-term use.',
    stack: ['React', 'Tailwind CSS', 'TypeScript', 'AI Pipelines'],
    status: 'Product Prototype',
    hobby: true,
  },
  {
    name: 'Team Operations Suite',
    category: 'Ops Platform Concept',
    tagline: 'Business Operations Platform',
    description:
      'An internal performance, CRM and workforce platform for any team-based business. Operational KPI dashboards, customer & CRM documentation, live leaderboards, shift planning, an internal chat and incentive systems, all behind configurable admin roles and permissions.',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Zod'],
    status: 'Full-Stack Concept',
    hobby: true,
  },
  {
    name: 'Automation Systems',
    category: 'Bots & Trading R&D',
    tagline: 'Bots, Scraping & Trading R&D',
    description:
      'A family of VPS-based automations: a Telegram scraper & distribution bot with a full link-ingestion pipeline, plus experimental Polymarket and trading research covering event-market discovery, CLOB order-book logic and a rule-based signal engine.',
    stack: ['Python', 'Node.js', 'Telegram API', 'Webhooks', 'VPS'],
    status: 'Deployed / Research',
  },
  {
    name: 'Bewerbungsbot',
    category: 'AI Job Application Agent',
    tagline: 'AI Job Application Assistant',
    description:
      'An AI-driven job search and application pipeline. Aggregates apprenticeship listings from the German Federal Employment Agency API, finds and ranks real company contact emails, then drafts a fully personalized German cover letter with GPT-4o grounded strictly in the applicant\'s own CV, generates the application PDF and sends it automatically. Includes bulk-apply with duplicate detection and offline retry queuing.',
    stack: ['React', 'Express', 'PostgreSQL', 'Drizzle ORM', 'OpenAI', 'Zod'],
    status: 'In Use',
    hobby: true,
  },
]

/** Shared inner content for the project detail view — media, name,
 *  tagline/status, description, stack, and live/GitHub links where they
 *  exist. Used by both the docked side panel (desktop/tablet) and the
 *  full-screen modal (mobile). */
function ProjectDetailContent({ project }: { project: Project }) {
  return (
    <>
      {project.image || project.video ? (
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
          {project.video ? (
            <video
              key={project.video}
              ref={(el) => {
                if (el) el.playbackRate = project.videoPlaybackRate ?? 1
              }}
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
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.03] px-5 py-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-purple">
            {project.hobby ? 'Hobby Project' : project.status}
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {project.tagline}
          </span>
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
        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-5 flex flex-wrap gap-3">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-blue/15 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-blue transition-colors hover:bg-blue/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                Live Project ↗
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                GitHub ↗
              </a>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function useEscapeAndScrollLock(onClose: () => void) {
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
}

/** Full-screen modal — used on mobile, where a docked side panel wouldn't
 *  leave enough room to be useful. Clicking the backdrop or Escape closes. */
function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  useEscapeAndScrollLock(onClose)
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
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          &times;
        </button>
        <ProjectDetailContent project={project} />
      </div>
    </div>
  )
}

/** Docked side panel — used on desktop/tablet, where the constellation
 *  stays visible (dimmed) to its left instead of being fully hidden behind
 *  a detached popup. Lives inside the gallery's own relatively-positioned
 *  container, not a page-level fixed overlay. */
function ProjectDetailPanel({ project, onClose }: { project: Project; onClose: () => void }) {
  useEscapeAndScrollLock(onClose)
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, ease: easeOut }}
      className="glass absolute inset-y-3 right-3 z-30 w-[min(26rem,44%)] overflow-y-auto rounded-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white/80 transition-colors hover:bg-black/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        &times;
      </button>
      <ProjectDetailContent project={project} />
    </motion.div>
  )
}

/** The rest of the register — one line each, like a credits roll. */
const REGISTER: { name: string; category: string; status: string }[] = [
  { name: 'Polymarket / Trading Automation', category: 'Automation & Data R&D', status: 'Research Prototype' },
  { name: 'Financial Transaction Tracker', category: 'FinTech UI', status: 'App Prototype' },
  { name: 'TENSA. Digital Production System', category: 'Brand Operations', status: 'Active Brand Project' },
  { name: 'MoncyDev / Portfolio Web Systems', category: 'Web Experience', status: 'Web Portfolio Work' },
  { name: '3D Character & Rigging Preparation', category: 'Creative Pipeline', status: 'Visual Development' },
  { name: 'Motion, Gaming & Interface Experiments', category: 'Prototype Lab', status: 'Ongoing Lab' },
]

type Tier = 'mobile' | 'tablet' | 'desktop'

function useTier(): Tier {
  const [tier, setTier] = useState<Tier>('desktop')
  useEffect(() => {
    const mobileQ = window.matchMedia('(max-width: 767px)')
    const tabletQ = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')
    const update = () => setTier(mobileQ.matches ? 'mobile' : tabletQ.matches ? 'tablet' : 'desktop')
    update()
    mobileQ.addEventListener('change', update)
    tabletQ.addEventListener('change', update)
    return () => {
      mobileQ.removeEventListener('change', update)
      tabletQ.removeEventListener('change', update)
    }
  }, [])
  return tier
}

export function Projects() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const expandedProject = PROJECTS.find((p) => p.name === expanded) ?? null
  const tier = useTier()

  const orbProjects: OrbProject[] = PROJECTS.map((p) => ({
    name: p.name,
    category: p.category,
    tagline: p.tagline,
    status: p.status,
    stack: p.stack,
    hobby: p.hobby,
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
          text="Selected Systems"
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="max-w-xl text-pretty text-muted-foreground">
            A connected ecosystem of platforms, agents and automation systems.
          </p>
        </Reveal>
      </div>

      {/* Interactive constellation on desktop/tablet; a horizontal
          scroll-snap card row on mobile (no free-floating physics there —
          see project-constellation-mobile.tsx). A soft ambient glow +
          stronger border give the section presence of its own so it
          doesn't blend into the surrounding page. */}
      <div className="relative h-[560px] w-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_0_140px_-40px_rgba(167,139,250,0.4)] sm:h-[640px]">
        {tier !== 'mobile' && !expandedProject && (
          <span className="pointer-events-none absolute right-4 top-4 z-10 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
            Drag to explore · Select a node to inspect
          </span>
        )}
        {/* radial light behind the GuardianGrid hub, a barely-visible
            technical grid, and an inset vignette — spatial depth without
            competing with the nodes themselves */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(45% 50% at 50% 42%, color-mix(in oklch, var(--purple) 18%, transparent), transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent 0 39px, rgba(255,255,255,0.5) 39px 40px), repeating-linear-gradient(90deg, transparent 0 39px, rgba(255,255,255,0.5) 39px 40px)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [box-shadow:inset_0_0_120px_30px_rgba(0,0,0,0.55)]"
        />
        <div className="absolute inset-0 touch-pan-y md:touch-none">
          {tier === 'mobile' ? (
            <ProjectConstellationMobile projects={orbProjects} onExpand={setExpanded} />
          ) : (
            <ProjectOrbs projects={orbProjects} expandedName={expanded} onExpand={setExpanded} />
          )}
        </div>
        {expandedProject && tier !== 'mobile' && (
          <ProjectDetailPanel project={expandedProject} onClose={() => setExpanded(null)} />
        )}
      </div>

      {expandedProject && tier === 'mobile' && (
        <ProjectDetailModal project={expandedProject} onClose={() => setExpanded(null)} />
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
            <motion.li
              key={r.name}
              className="group grid gap-1 py-4 transition-colors hover:bg-white/[0.02] sm:grid-cols-[1.4fr_1fr_1fr] sm:items-baseline sm:gap-6 sm:px-3"
              initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
              transition={{ duration: 0.9, delay: i * 0.03, ease: easeOut }}
            >
              <span className="font-medium tracking-tight text-foreground">
                {r.name}
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {r.category}
              </span>
              <span className="font-mono text-xs text-purple/80">
                {r.status}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
