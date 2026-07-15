import { SmoothScroll } from '@/components/smooth-scroll'
import { MouseGlow } from '@/components/mouse-glow'
import { EdgeGlow } from '@/components/edge-glow'
import { SiteNav } from '@/components/site-nav'
import { CinematicIntro } from '@/components/cinematic-intro'
import { Hero } from '@/components/hero'
import { Lukas } from '@/components/lukas'
import { Projects } from '@/components/projects'
import { PhoneStory } from '@/components/phone-story'
import { About } from '@/components/about'
import { TechStack } from '@/components/tech-stack'
import { Process } from '@/components/process'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'
import { Scene, FilmGrain } from '@/components/scene'

export default function Page() {
  return (
    <SmoothScroll>
      <MouseGlow />
      <FilmGrain />
      <SiteNav />
      <main className="relative">
        <CinematicIntro />
        {/* The website — revealed as the monitor becomes the screen */}
        <div className="relative z-10 bg-background">
          <EdgeGlow />
          <Hero />
          <Scene label="L.U.K.A.S. — The Operating System Behind Everything">
            <Lukas />
          </Scene>
          <Scene label="Selected Work" backdrop="ions">
            <Projects />
          </Scene>
          <Scene label="Shipped Entirely From an iPhone" backdrop="dust">
            <PhoneStory />
          </Scene>
          <Scene label="The Person Behind the Systems" backdrop="aurora">
            <About />
          </Scene>
          <Scene label="Tools of the Trade" backdrop="dust">
            <TechStack />
          </Scene>
          <Scene label="From Idea to Production" backdrop="ions">
            <Process />
          </Scene>
          <Scene label="Let's Build Together" backdrop="aurora">
            <Contact />
          </Scene>
          <SiteFooter />
        </div>
      </main>
    </SmoothScroll>
  )
}
