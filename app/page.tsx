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
          <Scene index="01" label="The Machine">
            <Lukas />
          </Scene>
          <Scene index="02" label="The Work">
            <Projects />
          </Scene>
          <Scene index="03" label="Shot on a Phone">
            <PhoneStory />
          </Scene>
          <Scene index="04" label="The Person">
            <About />
          </Scene>
          <Scene index="05" label="The Instruments">
            <TechStack />
          </Scene>
          <Scene index="06" label="The Method">
            <Process />
          </Scene>
          <Scene index="07" label="Final Cut">
            <Contact />
          </Scene>
          <SiteFooter />
        </div>
      </main>
    </SmoothScroll>
  )
}
