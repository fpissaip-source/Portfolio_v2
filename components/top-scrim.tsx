/**
 * Top scrim for the floating chrome (DESIGN.md §4, anti-pattern #1).
 *
 * The nav pill and language toggle are `fixed` and translucent, so without
 * this, body copy scrolls visibly *through* them and turns to mush — the
 * single worst readability defect on the site. Instead of making the glass
 * opaque (which kills its lightness), fade the canvas out underneath the
 * chrome band so text is already gone by the time it reaches it.
 *
 * Only mounted over the real site (after the intro), never over the
 * cinematic scene, and only where the chrome actually sits: from the very
 * top of the viewport down past the pill. Non-interactive.
 */
export function TopScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-32 sm:h-36"
      style={{
        // Hold full opacity through the whole chrome band (the pill sits
        // ~16–60px) and only start fading below it, otherwise copy is still
        // legible right where the nav overlaps it. A plain two-stop gradient
        // fades too early and leaves exactly that mush.
        background:
          'linear-gradient(to bottom, var(--background) 0%, var(--background) 46%, color-mix(in oklch, var(--background) 78%, transparent) 68%, transparent 100%)',
      }}
    />
  )
}
