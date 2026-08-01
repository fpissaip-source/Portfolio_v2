import { SmoothScroll } from '@/components/smooth-scroll'
import { Preloader } from '@/components/preloader'
import { IonTrail } from '@/components/ion-trail'
import { MouseGlow } from '@/components/mouse-glow'
import { EdgeGlow } from '@/components/edge-glow'
import { SiteNav } from '@/components/site-nav'
import { LanguageToggle } from '@/components/language-toggle'
import { SkipLink } from '@/components/skip-link'
import { TopScrim } from '@/components/top-scrim'
import { LukasVoiceWidget } from '@/components/lukas-voice-widget'
import { ConsentBanner } from '@/components/consent-banner'
import { Analytics } from '@/components/analytics'
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
      <LukasVoiceWidget />
      <ConsentBanner />
      <Analytics />
      {/* The page starts at the hero — no cinematic prologue in front of it.
          The robot head coming apart is the opening image now, and it sits
          directly next to what the site is actually offering. */}
      <main id="main-content" tabIndex={-1} className="relative bg-background outline-none">
        {/* Fades content out under the fixed nav / language toggle so copy
            never scrolls visibly through them (DESIGN.md anti-pattern #1). */}
        <TopScrim />
        <EdgeGlow />
        <IonTrail />
        <Hero />
        {/* L.U.K.A.S. straight after the hero: the head has just taken itself
            apart into a network, and this is the system that network is. */}
        <Scene labelKey="lukas">
          <Lukas />
        </Scene>
        <Scene labelKey="work" backdrop="nodes">
          <Projects />
        </Scene>
        {/* The cursor-lit lattice replaces this section's ion backdrop
            rather than stacking on it — with the global MouseGlow that
            would have been three ambient systems in one viewport. */}
        <Scene labelKey="services" backdrop="cursor-grid">
          <Services />
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
      </main>
    </SmoothScroll>
  )
}
