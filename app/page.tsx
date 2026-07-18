import { SmoothScroll } from '@/components/smooth-scroll'
import { Preloader } from '@/components/preloader'
import { IonTrail } from '@/components/ion-trail'
import { MouseGlow } from '@/components/mouse-glow'
import { EdgeGlow } from '@/components/edge-glow'
import { SiteNav } from '@/components/site-nav'
import { LanguageToggle } from '@/components/language-toggle'
import { SkipLink } from '@/components/skip-link'
import { CinematicIntro } from '@/components/cinematic-intro'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
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
      <SkipLink />
      <Preloader />
      <MouseGlow />
      <FilmGrain />
      <SiteNav />
      <LanguageToggle />
      <main id="main-content" tabIndex={-1} className="relative">
        <CinematicIntro />
        {/* The website — revealed as the monitor becomes the screen */}
        <div className="relative z-10 bg-background">
          <EdgeGlow />
          <IonTrail />
          <Hero />
          <Scene labelKey="services" backdrop="ions">
            <Services />
          </Scene>
          <Scene labelKey="lukas">
            <Lukas />
          </Scene>
          <Scene labelKey="work" backdrop="nodes">
            <Projects />
          </Scene>
          <Scene labelKey="phone" backdrop="rain">
            <PhoneStory />
          </Scene>
          <Scene labelKey="about" backdrop="dust">
            <About />
          </Scene>
          <Scene labelKey="stack">
            <TechStack />
          </Scene>
          <Scene labelKey="process" backdrop="orbits">
            <Process />
          </Scene>
          <Scene labelKey="contact" backdrop="aurora">
            <Contact />
          </Scene>
          <SiteFooter />
        </div>
      </main>
    </SmoothScroll>
  )
}
