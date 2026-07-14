import { SmoothScroll } from '@/components/smooth-scroll'
import { MouseGlow } from '@/components/mouse-glow'
import { EdgeGlow } from '@/components/edge-glow'
import { SiteNav } from '@/components/site-nav'
import { CinematicIntro } from '@/components/cinematic-intro'
import { Hero } from '@/components/hero'
import { Projects } from '@/components/projects'
import { About } from '@/components/about'
import { TechStack } from '@/components/tech-stack'
import { Process } from '@/components/process'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <SmoothScroll>
      <MouseGlow />
      <SiteNav />
      <main className="relative">
        <CinematicIntro />
        {/* The website — revealed as the monitor becomes the screen */}
        <div className="relative z-10 bg-background">
          <EdgeGlow />
          <Hero />
          <Projects />
          <About />
          <TechStack />
          <Process />
          <Contact />
          <SiteFooter />
        </div>
      </main>
    </SmoothScroll>
  )
}
