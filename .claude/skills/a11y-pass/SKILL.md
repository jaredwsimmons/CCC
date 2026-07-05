---
name: a11y-pass
description: Catch the accessibility failures that ship in almost every AI-built UI. Use after building any interactive component.
when_to_use: forms, buttons, modals, images, color choices, keyboard interaction
---
# Accessibility Pass
- **Keyboard** — every interactive element reachable and operable by Tab/Enter/Esc. Modals trap focus and restore it on close.
- **Labels** — every input has a real `<label>`; icon-only buttons have `aria-label`.
- **Images** — meaningful `alt`; decorative images `alt=""`.
- **Contrast** — text ≥ 4.5:1 (3:1 for large). Don't encode meaning in color alone.
- **Semantics** — real `<button>`/`<a>`, not a clickable `<div>`. Headings in order.
- **Focus** — visible focus ring. Never `outline: none` without a replacement.
Output: each failure with the element + the fix. Test it with Tab only, no mouse.

---
_Adapted from [Archive228/loopkit](https://github.com/Archive228/loopkit), MIT — see `.claude/skills/LICENSE-loopkit`._

## This repo (Chelsea Community Church)
Run this over the Astro forms and interactive UI: **`ContactForm.astro`** and the
`prayer.astro` / `connections.astro` / `imnew.astro` pages, plus the Church Center embed.
- **Contrast against the brand** — gold **`--gold: #f0c334`** on white is well under 4.5:1;
  never use it for body text or as text on paper. Use `--blue: #005291` / `--navy: #19374F` for text; reserve gold for large accents/fills only.
- **Labels** — every form field (name/email/phone/prayer request) needs a real `<label>`; the honeypot `company` field must be `aria-hidden` + off-screen, not just visually hidden in a way a screen reader reads aloud.
- **Focus** — visible focus ring on the pill buttons and inputs; don't `outline: none` without a branded replacement (a `--blue` ring works).
- **Semantics** — real `<button>`/`<a>`; headings in order on each page.
- **Embeds** — Church Center iframes are third-party; check they're keyboard-reachable and labelled, and don't trap focus.
- Test each form with Tab only, no mouse.
