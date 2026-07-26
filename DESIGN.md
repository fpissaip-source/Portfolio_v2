# DESIGN.md — issahareb.me

**This file is the design authority for this repository.**
Read it before writing or changing any frontend code. When code and this
document disagree, this document wins — or the document gets updated
first, deliberately. Do not "improve" the site in a direction this file
does not sanction.

---

## 1. Visual philosophy

**The site is an instrument, not a shop window.**

A black housing, a lit scale, and colour only where colour means
something. The visitor is not being sold to — they are being shown a
working machine, and the machine is the site itself.

Three commitments follow from that:

1. **Proof over claim.** The scroll-scrubbed intro, the neuron volume you
   fly through, the agent that actually talks back — these *are* the
   portfolio. Copy supports them; it never replaces them.
2. **Scroll is the camera.** The visitor cuts the film by scrolling.
   Motion answers the gesture directly and predictably. Nothing important
   moves on its own timer.
3. **Controlled composure.** The feeling to produce is not "wow, effects."
   It is "someone decided every detail here on purpose."

**What a visitor must feel in the first five seconds:** calm (deep black,
no noise), precision (motion tracks my gesture exactly), curiosity (the
camera is flying toward a lit window with someone working behind it).
No sales pressure.

### Identity that must never be removed

These are load-bearing. Changing them is a redesign, not a refinement,
and needs an explicit decision:

- The **scroll-scrubbed cinematic intro** in the hero (city → window →
  room → monitor → the site itself). It may be *shortened* or re-cut, but
  the scroll-driven camera dive stays.
- **Cinematic scroll storytelling** as the site's organising principle.
- The **L.U.K.A.S. chapter** — flying through the neuron volume, one
  ability per beat, the live agent at the end.
- **Bilingual DE/EN** with the visitor's own language detected.
- Deep-black canvas with blue/violet as the only chromatic accents.

---

## 2. Typography

Three faces, three **roles**. Never pick a face by mood; pick it by role.

| Role | Face | Used for |
|---|---|---|
| Display | **Space Grotesk** (`--font-space-grotesk`) | Section headings, hero headline, the name lockup, numbers that carry weight |
| Body | **Geist** (`--font-geist-sans`) | Paragraphs, card body, descriptions, nav |
| Instrument | **Geist Mono** (`--font-geist-mono`) | Kickers, labels, data, status, captions, project register |

**Why Space Grotesk for display:** it is already the site's identity in
the intro title lockup, and it carries actual character (open counters,
distinctive `a`/`g`) where Geist reads as the Next.js default. Geist as a
*display* face is the single strongest "template" signal this site can
emit — that is why it is body-only.

### Rules

- **One display size per viewport.** Never two competing headline scales
  on one screen.
- **Instrument text is always uppercase, always tracked** (`0.2em`–`0.3em`),
  always small (`10–12px`). It is a label, never a sentence.
- **Body copy maximum 65 characters per line.** Use `max-w-[65ch]` or a
  column width that produces it. On mobile, 45–55.
- **Never centre a paragraph longer than two lines.** Centred hero
  sub-copy is fine at two lines; a five-line centred block is not.
- Headline line count: **desktop ≤ 3 lines, mobile ≤ 4.** If it exceeds
  that, the copy is too long — cut the copy, do not shrink the type.
- `text-balance` on headings, `text-pretty` on paragraphs. Always.

---

## 3. Colour

```
--background   #050505      the canvas. Nothing is "more black" than this.
--foreground   oklch(.97 0 0)
--muted-fg     oklch(.62 .01 265)
--border       oklch(1 0 0 / 8%)
--blue         oklch(.72 .11 250)   CRAFT  — product, services, work
--purple       oklch(.68 .11 300)   MIND   — L.U.K.A.S., AI, voice
```

**Colour is semantic here, not decorative.**

- **Blue = craft.** Services, projects, the built things.
- **Violet = mind.** L.U.K.A.S., the agent, the neuron field, voice.
- **One accent dominates per section.** Never give blue and violet equal
  prominence in the same viewport — that is what makes a page read
  "generic gradient site".
- Accents appear as **light** (glow, a lit node, a rule) far more often
  than as **fill**. A filled accent block must earn itself.
- **Gradients only where a light source is implied** (a glow, the neuron
  field, the lit window). Never a gradient as background decoration, never
  a gradient on a button by default.

Contrast floor: body text ≥ 4.5:1, large display ≥ 3:1, instrument labels
≥ 4.5:1 (they are small — they need it most).

---

## 4. Spacing

One scale. Nothing off it.

```
4  8  12  16  24  32  48  64  96  128    (px → Tailwind 1 2 3 4 6 8 12 16 24 32)
```

**Section rhythm — exactly two values:**

- `py-32` — default section padding.
- `py-40` — breathing sections (contact, closing moments).

Anything else (`py-24`, `py-56`, one-off values) is a bug. Fix it rather
than matching it.

**Content gutters:** `px-6` mobile, `px-6` up to `max-w-7xl` container.
**Vertical rhythm inside a block:** label → 12 → heading → 16 → body →
24/32 → action. Keep it identical across sections; that repetition is
what reads as "systematic" instead of "assembled".

**Reserve space for fixed chrome.** The nav pill and the language toggle
float above content. Every section must keep a top safe area (`pt-24`
minimum on content that can scroll under them) — see anti-patterns.

---

## 5. Surfaces & radius

**Prefer fields over cards.** The default way to separate content is
whitespace, a hairline rule, or a baseline grid — *not* a box.

A card is only justified when the element is genuinely **object-like**:
something you pick up, open, or that floats above the page.

| Justified card | Not a card |
|---|---|
| Project orb / project detail modal | A service description |
| The L.U.K.A.S. chat panel | A contact detail |
| The floating voice launcher | A competency/pillar |
| A hover preview that follows the cursor | A statistic |

**Radius — three values only:**

- `rounded-full` — pills, buttons, badges, orbs.
- `rounded-2xl` — real surfaces (panels, modals, media frames).
- `rounded-none` — data tables, registers, technical listings.

Nothing else. `rounded-xl`, `rounded-3xl`, `rounded-md` are drift.

**Shadows:** no decorative shadows. Two legitimate uses:
1. **Glow as a light source** — a lit node, a bolt, an active state.
2. **Depth for floating chrome** — `0 18px 50px -16px rgba(0,0,0,.85)`.

`.glass` (backdrop blur) is reserved for **floating chrome that overlaps
content**: nav, launcher, modal, chat panel. It is not a section style.

---

## 6. Layout

- Container `max-w-7xl`, gutters `px-6`.
- **Asymmetry over symmetry.** A sticky statement column beside a scrolling
  content column reads more art-directed than centred stacks. Use it.
- **Grids must resolve.** Never leave an orphan in the last row. With five
  items, use a layout that fits five (list, 3+2 with an intentional
  emphasis, or a stack) — not a 2-column grid that strands one.
- Full-bleed is for **scenes** (intro, L.U.K.A.S., constellation).
  Contained is for **reading** (services, about, process, contact).
- The section label (mono kicker) always sits at the same offset from the
  section's top edge. That constant is a large part of the "systematic"
  feeling.

---

## 7. Interaction

- **Every interactive element has a visible focus ring.** `:focus-visible`
  with a 2px ring in the section's accent, offset 2px. Never
  `outline: none` without a replacement.
- **Hit targets ≥ 44×44px** on touch. Small visual, large target.
- **Contact data is always actionable.** Email is `mailto:`, phone is
  `tel:`. Never render a contact detail as plain text.
- Hover states are for pointers only; never make information
  hover-dependent, because touch has no hover.
- **State must be legible without colour alone** (add an icon, a label,
  a position change).
- Anything that opens (modal, chat panel) traps focus, closes on `Esc`,
  and returns focus to the trigger.

---

## 8. Animation

**Motion answers a gesture. It does not perform on its own.**

Timing:

| Kind | Duration | Easing |
|---|---|---|
| Feedback (hover, press, toggle) | 120–200ms | `ease-out` |
| Element reveal | 400–600ms | `[0.22, 1, 0.36, 1]` |
| Camera move / scene change | 600–900ms | `power2.inOut` |
| Scroll scrub | `scrub: 0.25–0.5` | `none` (linear) |

Rules:

- **One orchestrated moment per section.** A section earns one memorable
  motion beat; everything else in it stays still. Scattered small effects
  everywhere is the strongest "AI-generated" tell in motion design.
- **Reveals trigger when the element is actually readable** — start when
  it has fully entered the viewport, not when the section's top edge
  crosses. A reveal the visitor only catches the tail of is a bug.
- **Never animate `width`/`height`/`top`/`left`.** Transform and opacity
  only. Add `will-change` only on elements that actually animate.
- `prefers-reduced-motion: reduce` must produce a **complete, static,
  legible** page — not a broken one. Scrubbed scenes jump to their final
  state; nothing is left invisible.
- Scroll-snapping may guide, never trap. A visitor must always be able to
  scroll straight through a section to the next one.

---

## 9. Responsive

Breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280`.

- **Mobile is not a narrower desktop.** Heavy 3D (`dense` off), lower DPR
  caps, longer scrub for smoother scrubbing, no hover affordances.
- **Cut copy on mobile, don't shrink it.** If a card needs 8 lines on a
  phone, the copy is too long for that surface.
- Use `100svh`, never `100vh` (mobile browser chrome).
- Test every change at **390 / 834 / 1440**. A change is not done until it
  has been seen at all three.
- Fixed chrome (nav, toggle, launcher) must never overlap content at any
  width — verify by screenshot, not by assumption.

---

## 10. Accessibility

Non-negotiable, at the same level as visual quality:

- One `<h1>` per page; heading levels never skip.
- Landmarks: `<main>`, `<nav>`, `<section aria-label>` on scenes.
- Every image/canvas that carries meaning has a text equivalent;
  decorative ones are `aria-hidden`.
- Keyboard: the entire primary journey (intro → contact) is completable
  without a mouse, including skipping the intro.
- Colour is never the only carrier of meaning.
- Respect `prefers-reduced-motion` (see §8).
- Any auto-playing motion the visitor did not request must be escapable.

---

## 11. Anti-patterns

Things that are **wrong in this repository**, regardless of how common
they are elsewhere:

1. **Fixed chrome over text.** The nav pill or language toggle sitting on
   top of a heading or paragraph. Always reserve a top safe area.
2. **Card inflation.** Wrapping every piece of content in
   `rounded-2xl border bg-card`. Most content is a field, not a card.
3. **Icon-in-a-tinted-circle** as the default card ornament. It is the
   single most template-coded component on the web.
4. **Decorative numbering.** `01 / 02 / 03` on things that are not a
   sequence. Numbers promise an order; parallel competencies have none.
5. **Geist as a display face.** See §2.
6. **Orphan grid items** — five things in a two-column grid.
7. **Gradients as decoration**, unattached to any implied light source.
8. **Glassmorphism as a section style.** Glass is for floating chrome only.
9. **Contact info as plain text** instead of `mailto:`/`tel:`.
10. **Effects everywhere instead of one strong moment per section.**
11. **Copy that reads as machine-written**: "not just X, but Y",
    em-dash showers, rule-of-three cadence in every sentence, generic
    superlatives ("uncompromising", "seamless", "cutting-edge").
12. **Centred long paragraphs.**
13. **Shrinking type to fit long copy.** Cut the copy.

---

## 12. Good vs. bad, concretely

**Section label**
- ✅ `<span class="font-mono text-xs uppercase tracking-[0.3em] text-blue">Leistungen</span>` — instrument role, consistent offset, semantic accent.
- ❌ A pill-shaped badge with a background fill and an icon. That is a button's clothing on a label.

**A competency (About pillar)**
- ✅ Hairline rule, mono label, Space Grotesk title, body at ≤65ch, generous space between entries. Reads as a specification sheet.
- ❌ `rounded-2xl` card + numbered circle + icon + title + body ×5. Reads as a pricing page.

**Contact**
- ✅ Email and phone as large, tappable links on the canvas, with a mono label above each. One primary action.
- ❌ Three bordered cards with icons in tinted circles containing unclickable text.

**Hero**
- ✅ Headline ≤3 lines, one sub-line, one primary action. The scene does the rest of the talking.
- ❌ A four-line headline filling the viewport with no action anywhere.

**Motion**
- ✅ The L.U.K.A.S. camera flies to a region, the region ignites, the copy arrives. One beat, fully orchestrated.
- ❌ Every card fades up on scroll, every icon pulses, every border shimmers.

**Copy**
- ✅ "Kein Konzept. Keine Demo." — short, declarative, human.
- ❌ "Nicht nur als Konzept oder hübschen Prototyp, sondern als vollständige Lösung — von der Planung über die Datenbank bis zum Deployment."

---

## 13. Working agreement

1. Read this file before frontend work.
2. Verify visually at 390 / 834 / 1440 before calling anything done.
3. Never reduce functionality to make something look tidier. Improve
   layout, hierarchy, type, spacing, motion, interaction, consistency —
   in that order of leverage.
4. Prefer improving an existing component over replacing it.
5. If a change violates a rule here on purpose, say so explicitly and
   update this file in the same commit.
