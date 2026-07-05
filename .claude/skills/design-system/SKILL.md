---
name: design-system
description: Make frontend output look intentional, not AI-generated. Use for any UI work — components, pages, layouts.
when_to_use: building UI, a component, a page, "make this look good"
---
# Design System
Default AI UI is gray, centered, and timid. Don't ship that.
- **Type** — one distinctive display face + one clean body face. Real scale (e.g. 12/14/16/20/28/40), not everything 16px.
- **Color** — one strong accent, a real neutral ramp, intentional contrast. No 5 competing brand colors.
- **Space** — a spacing scale (4/8/12/16/24/32...). Generous whitespace. Align to a grid.
- **Motion** — purposeful only: feedback on action, transitions on state. No decorative bounce.
- **Hierarchy** — one clear focal point per screen. Size, weight, and space do the work, not borders everywhere.
Before done: would a senior designer ship this, or does it look like a default Tailwind template? If the latter, push the contrast and the type.

---
_Adapted from [Archive228/loopkit](https://github.com/Archive228/loopkit), MIT — see `.claude/skills/LICENSE-loopkit`._

## This repo (Chelsea Community Church)
Astro site (`src/components/*.astro`, `src/pages/*.astro`) with an established brand — **use the
existing system, don't invent a new one**:
- **Color** — the tokens already live in **`src/styles/global.css`**: `--blue: #005291` (primary),
  `--gold: #f0c334` (accent), `--navy: #19374F` over warm paper. Consume those CSS vars; never hard-code a new hex or add a competing brand color.
- **Type** — Poppins for display (`--display`, 500–700), Nunito for body (`--body`). Keep the real scale; don't flatten everything to 16px.
- **Consistency** — reuse the shared components (`Section`, `PageHero`, `CTABand`, `Header`, `Footer`)
  and match their spacing/pill-button conventions so new UI reads as the same site, not a default Tailwind template.
- Church Center embeds (`ChurchCenterScript.astro`) bring their own styling — frame them so they sit inside the brand, not clash with it.
