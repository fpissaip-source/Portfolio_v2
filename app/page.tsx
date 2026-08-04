import { SmoothScroll } from '@/components/smooth-scroll'
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
import { PerfProbe } from '@/components/perf-probe'
import { Hero } from '@/components/hero'
import { Statement } from '@/components/statement'
import { Services } from '@/components/services'
import { Lukas } from '@/components/lukas'
import { Projects } from '@/components/projects'
import { About } from '@/components/about'
import { TechStack } from '@/components/tech-stack'
import { Process } from '@/components/process'
import { Contact } from '@/components/contact'
import { Affiliate } from '@/components/affiliate'
import { SiteFooter } from '@/components/site-footer'
import { Scene, FilmGrain } from '@/components/scene'

export default function Page() {
  return (
    <SmoothScroll>
      <SkipLink />
      {/* Measures what this device can actually paint and, if it cannot keep
          up, takes the expensive layers off (lib/perf-tier.ts). */}
      <PerfProbe />
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
        {/* The hero is deliberately four short lines. This is where the
            short version gets explained — one sentence, assembled out of
            the air as it is scrolled, which is also the handover out of the
            hero's own animation. */}
        <Statement />
        {/* L.U.K.A.S. after the statement: the head has just taken itself
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
        <Affiliate />
        <SiteFooter />
      </main>
    </SmoothScroll>
  )
}
