---
name: loading-empty-error-states
description: Design the three states every data UI forgets. Use for any component that fetches or lists data.
when_to_use: a list, a fetch, a dashboard, anything async in the UI
---
# Loading / Empty / Error States
AI-built UIs handle the happy path and crash on the other three. Design all four:
- **Loading** — skeletons that match the final layout (not a centered spinner that shifts everything).
- **Empty** — a real first-run state: what it is, and the one action to fill it. Not a blank box.
- **Error** — what failed, in human terms, plus a retry. Never a raw stack trace or silent nothing.
- **Partial** — slow/streaming data, optimistic updates that can roll back.
For each fetch in the diff, confirm all four exist. The empty and error states are where products feel broken.

---
_Adapted from [Archive228/loopkit](https://github.com/Archive228/loopkit), MIT — see `.claude/skills/LICENSE-loopkit`._

## This repo (Chelsea Community Church)
Two flavors of async here — cover both:
- **Build-time data fetches** — `src/lib/calendar.ts`, `src/lib/groups.ts`, `src/lib/feeds.ts` (media)
  run at build. Their "error" state is a broken build or a silently empty page: guard each fetch so a
  down upstream (Church Center calendar, groups, media RSS) yields a real **empty state** ("No events
  this week" / "Check back soon") on `calendar.astro` / `groups.astro` / `media.astro`, not a blank section or a crash.
- **Runtime form submit** — `ContactForm.astro` → `functions/api/pco-form.js` returns JSON the UI must render:
  - **Loading** — disable the submit + show a pending state while the POST is in flight.
  - **Success** — the `{ ok: true }` confirmation.
  - **Error** — a human message on `4xx`/`502`; never surface the raw Planning Center `detail`.
  - **Not-configured (`503`)** — the function returns 503 until the PCO token/field-map is wired; the form must fall back to the **Church Center embed** here, exactly as the function's comments intend.
