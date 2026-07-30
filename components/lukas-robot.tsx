'use client'

import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { onConsentChange } from '@/lib/consent'

/**
 * The Spline robot that stands next to the "talk to L.U.K.A.S." invite.
 *
 * Adapted from 21st.dev's Spline Scene (serafimcloud) rather than dropped in,
 * because the upstream demo has properties this site cannot simply accept:
 *
 *   1. **It is a third-party origin.** The scene streams from
 *      prod.spline.design and the runtime is ~6.6 MB unpacked. The privacy
 *      page states the agent is the only third party and that nothing
 *      external loads without a decision — so this is gated behind the same
 *      consent, and prod.spline.design is now named on that page. Tying them
 *      together isn't just tidy: the robot *is* the agent's face, so one
 *      decision covering both is what a visitor would expect.
 *   2. **The upstream `/next` export is the wrong one.** It is an async
 *      *server* component that fetches the scene during render to build a
 *      thumbhash placeholder — i.e. it would hit prod.spline.design on every
 *      page render, consent or not. Only the client export can honour a gate.
 *   3. **The scene is not ours.** SCENE_URL points at the community asset the
 *      component ships with. Export your own from Spline, drop the
 *      .splinecode in /public and point SCENE_URL at it, and the third-party
 *      origin disappears — the consent gate can then be relaxed.
 *
 * Also skipped under prefers-reduced-motion (it is an idling character, which
 * is exactly what that setting is about) and below 1024px. Note the width
 * gate is a real media-query check, not a `hidden lg:block` class: CSS would
 * hide the canvas while React still mounted it and still pulled the runtime
 * and the scene down a phone connection.
 *
 * `aria-hidden` + pointer-events off: it carries no information, and a WebGL
 * canvas that swallows pointer events inside a pinned ScrollTrigger section
 * is a scroll bug waiting to happen. The trade is that the robot idles
 * rather than tracking the cursor.
 */

const Spline = lazy(() => import('@splinetool/react-spline'))

/**
 * Mandatory, not defensive polish: react-spline stores a failed
 * `Application.load()` in state and **rethrows it during render**
 * (`if (error) throw error` in its source). Any blocked request — an ad
 * blocker, a corporate proxy, Spline having a bad day, a visitor briefly
 * offline — therefore throws out of a decorative subtree. Verified here: with
 * outbound HTTPS unavailable to the browser, the scene fetch fails with
 * ERR_CONNECTION_RESET and the error reaches the page. A decoration must
 * never be able to do that, so it gets its own boundary and simply vanishes.
 */
class RobotBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/** Community scene shipped with the upstream component. Replace with a
 *  self-hosted `/scenes/….splinecode` to drop the external origin. */
const SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'

export function LukasRobot({ className = '' }: { className?: string }) {
  const [allowed, setAllowed] = useState(false)
  const [eligible, setEligible] = useState(false)

  useEffect(() => onConsentChange((s) => setAllowed(s?.lukas === true)), [])
  useEffect(() => {
    const mq = window.matchMedia(
      '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
    )
    const sync = () => setEligible(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Nothing rendered at all without consent — no request, and no reserved
  // empty box either: the invite is a centred flex row, so when this returns
  // null the copy simply centres on its own. The panel never depends on it.
  if (!allowed || !eligible) return null

  return (
    <div aria-hidden className={`pointer-events-none ${className}`.trim()}>
      <RobotBoundary>
        <Suspense fallback={null}>
          <Spline scene={SCENE_URL} className="h-full w-full" />
        </Suspense>
      </RobotBoundary>
    </div>
  )
}
