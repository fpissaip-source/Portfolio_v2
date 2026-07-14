/**
 * Ambient purple shimmer anchored to the top-left and bottom-right corners of
 * the viewport. Sits above the near-black page background but behind all
 * content (negative z within the site stacking context), pointer-events off.
 */
export function EdgeGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--purple) 42%, transparent), transparent 68%)',
        }}
      />
      <div
        className="absolute -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, color-mix(in oklch, var(--purple) 42%, transparent), transparent 68%)',
        }}
      />
    </div>
  )
}
