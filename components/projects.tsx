'use client'




import { motion } from 'motion/react'
import { Reveal, WordReveal } from './anim'
import { useLanguage, useT } from './language-context'
import { useNearViewport } from './use-near-viewport'
import { StellarGallery, type GalleryCard } from './stellar-gallery'

/** Self-directed design explorations, in the same order as
 *  `t.projects.directions` — the copy that names and describes each one
 *  lives there so it switches with the language. */
const DESIGN_DIRECTIONS = [
  { image: '/design-directions/vantiq.webp' },
  { image: '/design-directions/novasynth.webp' },
  { image: '/design-directions/kelvin-roe.webp' },
  { image: '/design-directions/heliodyne.webp' },
]

const easeOut = [0.22, 1, 0.36, 1] as const

/** Measured third-party audit of a deployed project, rendered as a spec
 *  readout rather than a badge: the numbers are the point, and a badge would
 *  read as a sticker the site awarded itself. The headline score is the one
 *  large figure; the three sub-scores sit under it at label scale. Source and
 *  crawl date are shown, not hidden — an unattributed number is a claim. */
function ProjectAudit({ audit }: { audit: NonNullable<Project['audit']> }) {
  const t = useT()
  const { lang } = useLanguage()
  const subScores = [
    { label: t.projects.auditTech, value: audit.tech },
    { label: t.projects.auditStructure, value: audit.structure },
    { label: t.projects.auditContent, value: audit.content },
  ]
  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-4xl font-semibold tabular-nums tracking-tight text-blue">
          {audit.onpage}%
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {t.projects.auditOnpage}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-x-4 gap-y-1">
        {subScores.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-lg font-semibold tabular-nums tracking-tight">
              {s.value}%
            </dd>
            <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">
        {t.projects.auditSource}{' '}
        <a
          href={audit.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-foreground hover:decoration-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {audit.sourceName}
        </a>{' '}
        ·{' '}
        <time dateTime={audit.crawledOn}>
          {new Date(audit.crawledOn).toLocaleDateString(lang ?? 'en', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </time>
      </p>
    </div>
  )
}

function LoadingFallback() {
  const t = useT()
  return (
    <div className="absolute inset-0 grid place-items-center">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
        {t.projects.loadingConstellation}
      </span>
    </div>
  )
}

type Project = {
  name: string
  /** Short 2-3 word category shown on the compact constellation label. */
  category: string
  tagline: string
  description: string
  /** Omitted for hobby projects — no screenshot, just the write-up. */
  image?: string
  /** Generated mockup used ONLY as the orb's fisheye texture — never shown
   *  in the detail panel/modal, since it's a staged illustration rather
   *  than a real screenshot of the actual product. */
  orbImage?: string
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
  /** Third-party audit of the *deployed* site. Only ever set from a real
   *  report — the point of showing figures at all is that they are measured
   *  rather than claimed (DESIGN.md §1), so the source and crawl date are
   *  part of the data, not decoration. */
  audit?: {
    onpage: number
    tech: number
    structure: number
    content: number
    /** ISO date of the crawl the figures come from. */
    crawledOn: string
    sourceName: string
    sourceUrl: string
  }
}

/** Structural fields only — name, media, stack, links. The translatable
 *  copy (category/tagline/description/status) lives in
 *  `useT().projects.projects`, keyed by `name`, and is merged in at render
 *  time inside `Projects()` so it switches with the active language. */
type ProjectMeta = Pick<
  Project,
  | 'name'
  | 'image'
  | 'orbImage'
  | 'video'
  | 'videoPlaybackRate'
  | 'stack'
  | 'featured'
  | 'hobby'
  | 'liveUrl'
  | 'githubUrl'
  | 'audit'
>

const PROJECT_META: ProjectMeta[] = [
  {
    name: 'GuardianGrid',
    image: '/projects/guardiangrid-login.jpg',
    video: '/videos/guardiangrid.mp4',
    stack: ['React', 'Bungie API', 'OAuth2', 'Node.js', 'Cloudflare'],
    featured: true,
    liveUrl: 'https://www.guardiangrid.io',
  },
  {
    name: 'TaxiBB Essen',
    image: '/projects/taxibb.png',
    orbImage: '/projects/orb-textures/taxibb.webp',
    video: '/videos/taxibb.mp4',
    videoPlaybackRate: 1.6,
    stack: ['React', 'PostgreSQL', 'Drizzle ORM', 'Resend', 'JSON-LD'],
    liveUrl: 'https://taxibbessen.de',
    githubUrl: 'https://github.com/fpissaip-source/Taxibbessen',
    audit: {
      onpage: 92,
      tech: 99,
      structure: 97,
      content: 80,
      crawledOn: '2026-07-28',
      sourceName: 'seobility.net',
      sourceUrl: 'https://www.seobility.net',
    },
  },
  {
    name: 'StudyForge',
    orbImage: '/projects/orb-textures/studyforge.webp',
    stack: ['React', 'Tailwind CSS', 'TypeScript', 'AI Pipelines'],
    hobby: true,
  },
  {
    name: 'Team Operations Suite',
    orbImage: '/projects/orb-textures/teamops.webp',
    stack: ['React', 'Node.js', 'PostgreSQL', 'Zod'],
    hobby: true,
  },
  {
    name: 'Automation Systems',
    orbImage: '/projects/orb-textures/automation.webp',
    stack: ['Python', 'Node.js', 'Telegram API', 'Webhooks', 'VPS'],
  },
  {
    name: 'Bewerbungsbot',
    orbImage: '/projects/orb-textures/bewerbungsbot.webp',
    stack: ['React', 'Express', 'PostgreSQL', 'Drizzle ORM', 'OpenAI', 'Zod'],
    hobby: true,
    githubUrl: 'https://github.com/fpissaip-source/Bewerbungsbot',
  },
]

/** The written substance of a project — description, stack and status.
 *  Rendered inside the gallery's detail card under the screenshot, so
 *  nothing that the old docked panel carried is lost in the move. */
function ProjectExtras({ project }: { project: Project }) {
  const t = useT()
  return (
    <>
      <p className="mt-3 max-w-[68ch] text-pretty text-sm leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <li
            key={tech}
            className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
          >
            {tech}
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-purple/80">
        {project.hobby ? t.projects.hobbyProject : project.status}
      </p>
      {project.audit && <ProjectAudit audit={project.audit} />}
    </>
  )
}

export function Projects() {
  const t = useT()
  const PROJECTS: Project[] = PROJECT_META.map((m) => ({
    ...m,
    ...(t.projects.projects[m.name] ?? {
      category: '',
      tagline: '',
      description: '',
      status: '',
    }),
  }))
  // The 3D gallery is the heaviest thing on the page after Lukas — don't
  // create its WebGL context until the section is actually close to
  // scrolling into view, rather than the moment the page hydrates.
  const { ref: galleryRef, near: galleryNear } = useNearViewport<HTMLDivElement>()

  // Built work and design directions share one sphere, but never share an
  // identity: every card carries its own kind label, so a client site and an
  // exploration stay tellable apart inside the gallery itself and not only
  // under the heading above it.
  const cards: GalleryCard[] = [
    ...PROJECTS.map((p) => ({
      id: p.name,
      imageUrl: p.orbImage ?? p.image ?? '/design-directions/vantiq.webp',
      alt: p.name,
      title: p.name,
      kindLabel: p.category || t.projects.kindProject,
      meta: p.tagline,
      liveUrl: p.liveUrl,
      githubUrl: p.githubUrl,
      detail: <ProjectExtras project={p} />,
    })),
    ...DESIGN_DIRECTIONS.map((d, i) => ({
      id: d.image,
      imageUrl: d.image,
      alt: t.projects.directions[i]?.title ?? '',
      title: t.projects.directions[i]?.title ?? '',
      kindLabel: t.projects.kindDirection,
      meta: t.projects.directions[i]?.meta,
    })),
  ]

  return (
    <section id="work" className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="mb-16 flex flex-col gap-4">
        <Reveal>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-blue">
            {t.projects.kicker}
          </span>
        </Reveal>
        <WordReveal
          as="h2"
          text={t.projects.heading}
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        />
        <Reveal delay={0.1}>
          <p className="max-w-xl text-pretty text-muted-foreground">
            {t.projects.subtitle}
          </p>
        </Reveal>
      </div>

      {/* Interactive constellation on desktop/tablet; a horizontal
          scroll-snap card row on mobile (no free-floating physics there —
          see project-constellation-mobile.tsx). A soft ambient glow +
          stronger border give the section presence of its own so it
          doesn't blend into the surrounding page. */}
      <div
        ref={galleryRef}
        className="relative h-[560px] w-full overflow-hidden rounded-2xl shadow-[0_0_140px_-40px_rgba(167,139,250,0.4)] sm:h-[640px]"
      >
        <span className="pointer-events-none absolute right-4 top-4 z-10 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
          {t.projects.dragHint}
        </span>
        <div className="absolute inset-0">
          {galleryNear ? <StellarGallery cards={cards} /> : <LoadingFallback />}
        </div>
      </div>

      {/* Full register — the credits roll */}
      <div className="mt-24">
        <Reveal>
          <div className="mb-8 flex items-center gap-4">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-purple">
              {t.projects.registerLabel}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-purple/30 to-transparent" />
          </div>
        </Reveal>
        <ul className="divide-y divide-white/5">
          {t.projects.register.map((r, i) => (
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
