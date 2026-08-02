/**
 * Ambient shimmer anchored to the corners of the viewport while the site
 * content is on screen. A sticky full-viewport layer inside the scrolling
 * site keeps the glows pinned to the corners; pointer-events off, content
 * renders above it.
 *
 * Three lights, not two: at two corners the middle of a wide screen was
 * unlit, and a near-black page with nothing happening in the middle of it
 * reads as an unstyled background rather than as a dark room.
 */
export function EdgeGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="sticky top-0 h-[100svh]">
        {/* The cool one, off the right edge at eye level: the same lamp the
            hero's SideRays imply, carried down the rest of the page. */}
        <div
          className="edge-glow-pulse absolute -right-32 top-1/4 h-[42rem] w-[42rem] rounded-full blur-3xl [animation-delay:-3.5s]"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--blue) 40%, transparent), transparent 70%)',
          }}
        />
        <div
          className="edge-glow-pulse absolute -left-44 -top-44 h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--purple) 52%, transparent), transparent 72%)',
          }}
        />
        <div
          className="edge-glow-pulse absolute -bottom-44 -right-44 h-[34rem] w-[34rem] rounded-full blur-3xl [animation-delay:-7s]"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--purple) 52%, transparent), transparent 72%)',
          }}
        />
      </div>
    </div>
  )
}
