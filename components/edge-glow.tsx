/**
 * Ambient purple shimmer anchored to the top-left and bottom-right corners of
 * the viewport while the site content is on screen. A sticky full-viewport
 * layer inside the scrolling site keeps the glows pinned to the corners;
 * pointer-events off, content renders above it.
 */
export function EdgeGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="sticky top-0 h-[100svh]">
        <div
          className="edge-glow-pulse absolute -left-44 -top-44 h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--purple) 34%, transparent), transparent 70%)',
          }}
        />
        <div
          className="edge-glow-pulse absolute -bottom-44 -right-44 h-[34rem] w-[34rem] rounded-full blur-3xl [animation-delay:-7s]"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklch, var(--purple) 34%, transparent), transparent 70%)',
          }}
        />
      </div>
    </div>
  )
}
