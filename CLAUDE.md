# CLAUDE.md — Chelsea Community Church website

Working agreement for AI-assisted work on this repo. The coding rules below are adapted from
**Andrej Karpathy — "CLAUDE.md: Field Notes on Getting a Language Model to Write Code You Will Not
Rewrite."** The canonical master lives in Jared's Obsidian vault (`01 AI/Strategy/Karpathy — Coding
Rules (AI-Written Code)`); this is the church-website deployment of it.

> The throughline: the model is **fast at generating plausible code and slow to notice that plausible ≠
> correct.** The discipline has to come from the process, not the model.

---

## The stack (read this first)
- **Astro 5** — the site. Routes in `src/pages/`, components in `src/components/` (`.astro`), `src/layouts/`.
- **Sanity CMS** — content lives in **Sanity, not the repo**. Schemas in `studio/`; queried via `@sanity/client` (GROQ); rendered through `@portabletext/to-html` + `@sanity/image-url`.
- **Cloudflare Pages** — deploy target. `functions/` = Pages Functions (**edge runtime, not Node** — no `fs` etc. unless `nodejs_compat`). `wrangler` runs it locally.
- **TypeScript** — `astro check` is the type gate.
- **Playwright** — e2e tests. This is the verification tool (rule V).
- **Planning Center (PCO)** — `scripts/pco-fields.mjs`, XML via `fast-xml-parser`.
- **Secrets** — `.dev.vars` (Cloudflare) + `.env`, both git-ignored. **Never commit them.** A `secret-scan` PreToolUse hook blocks commits containing keys.

## Commands
- `npm run dev` — Astro dev server · `npm run dev:fn` — build + Cloudflare Pages runtime (functions)
- `npm run build` — production build · `npm run check` — `astro check` (types)
- Run the **Playwright** e2e tests before calling a change done.

---

## The ten rules (for this repo)

1. **Read before you write.** Read (not skim) the `.astro` component / GROQ query / Sanity schema / PCO script you're touching. Copy the patterns already here — how components are structured, how data is fetched, how Portable Text is rendered. No pattern to copy → **ask, don't guess.**
2. **Think before you code.** State the assumption and the tradeoff before typing. Genuinely confusing → **stop and ask**, don't fill the gap with plausible-looking code.
3. **Simplicity.** Minimum code for the task in front of you *now*. No premature abstraction; hardcode until there's a real reason to configure; skip error handling for errors that can't occur. If it's abstracted "in case we need to," it's over-built.
4. **Surgical changes.** Smallest diff the task allows. **Don't reformat**, match the existing style, don't touch what you weren't asked to. `astro check` stays clean. Justify every changed line by the task — "while I was in there" → revert it.
5. **Verification.** Playwright is here — use it. Fixing a bug → **write the failing test first, then fix.** `npm run build` + `npm run check` must pass before "done." Test behavior that can break, not that a constructor set a field. Hard to test = information about the design, not permission to skip.
6. **Goal-driven execution.** A success criterion **before** code ("the events page renders upcoming PCO events, handles the empty state, and passes a Playwright check"). Multi-step → state the plan first.
7. **Debugging.** Read the whole error + stack trace. **Reproduce** (`npm run dev` / `npm run dev:fn`) before changing anything; change one thing at a time. Don't paper over a null — a missing Sanity field or an empty PCO response is a real case; find out *why* it's null.
8. **Dependencies.** Every dep is permanent code you don't control. Astro + Sanity already do a lot (sitemap, image URLs, Portable Text) — reach for those before adding a package. When you add one, **say why.**
9. **Communication.** Say what you did and why, not just a code block. Flag concerns even when you did exactly what was asked. Be precise about uncertainty ("I'm not sure Cloudflare Functions support this API" — not "I think this works").
10. **Catch the named failure modes** — **Kitchen Sink** (restructuring half the repo while you're in there) · **Wrong Abstraction** (abstracting before the copy-paste happens twice) · **Optimistic Path** (happy path handled, the Sanity/PCO fetch failure or Cloudflare 500 ignored) · **Runaway Refactor** (a fix cascading across files). Caught in one → **stop, don't push through.**

---

## Repo-specific hard rules
- **Content is Sanity-owned** — don't hardcode copy/images that belong in the CMS; add/adjust a schema in `studio/` and query it.
- **Functions run on the edge** — no Node-only APIs unless `nodejs_compat` is enabled; keep them small and env-driven.
- **Secrets live in `.dev.vars` / `.env` only** — never inline a Sanity token, PCO key, or Cloudflare secret. The `secret-scan` hook enforces this at commit; don't work around it.
- **External fetches (Sanity, PCO) handle the non-200 path** — that's rule 10's Optimistic Path; never assume a field or response exists.

*Coding rules adapted from Andrej Karpathy's coding "CLAUDE.md" field-notes. Master: Jared's Obsidian vault → `01 AI/Strategy/Karpathy — Coding Rules (AI-Written Code)`.*
