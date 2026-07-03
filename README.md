# Chelsea Community Church — Website

A fast, free-to-host church website. Replaces the GoHighLevel/agency site while **keeping Planning Center as the engine**.

**Stack:** [Astro](https://astro.build) (static) → [Cloudflare Pages](https://pages.cloudflare.com) (free host) → [Sanity](https://www.sanity.io) (the CMS staff edit) → **Church Center embeds** for calendar / giving / forms / registration. Domain stays at GoDaddy; email stays on Google Workspace.

> Design rationale, cost model, and the GoHighLevel→Planning Center CRM plan live in the vault:
> `04 Church/Church Website — Target Stack & CRM Replacement.md`.

---

## Prerequisites

- **Node 22** (`.nvmrc` pins it)
- A free **Sanity** account → https://www.sanity.io/manage (only needed once you want real content; the site builds without it)

## Quick start (the website)

```bash
npm install
npm run dev      # http://localhost:4321
```

The site runs immediately with **placeholder pages** for every nav item and **live Church Center** calendar/giving. It builds fine before Sanity is connected.

```bash
npm run build    # static output → ./dist  (this is what Cloudflare Pages serves)
npm run preview  # preview the production build locally
```

## Connecting Sanity (the CMS)

1. Create a project at https://www.sanity.io/manage (Free plan) and copy its **Project ID**.
2. In the repo root, copy `.env.example` → `.env` and set:
   ```
   PUBLIC_SANITY_PROJECT_ID=yourid
   PUBLIC_SANITY_DATASET=production
   ```
3. Set up + run the Studio (where staff edit):
   ```bash
   cd studio
   cp .env.example .env      # set SANITY_STUDIO_PROJECT_ID=yourid
   npm install
   npm run dev               # http://localhost:3333  — the editing UI
   npm run deploy            # publishes it to https://<name>.sanity.studio (free hosting for staff)
   ```
4. Add content in the Studio (Pages, Events, Sermons, Leaders, Site Settings). The website reads it at **build time**, so re-run `npm run build` (or let Cloudflare rebuild) to see changes.

### Auto-rebuild on publish (so staff edits go live by themselves)
In the Sanity project: **API → Webhooks → Create** a webhook pointing at a **Cloudflare Pages Deploy Hook** (Pages project → Settings → Builds & deployments → Deploy hooks). Then hitting **Publish** in the Studio triggers a rebuild; the change is live in ~1–2 min.

## How the Church Center embeds work

- The modal runtime loads once in `<head>` (`src/components/ChurchCenterScript.astro`).
- Any link ending in `?open-in-church-center-modal=true` opens giving/forms/registration in an overlay (see `GiveButton` usage). **Requires HTTPS** — Cloudflare Pages provides it automatically.
- The calendar is an `<iframe>` embed (`src/components/ChurchCenterCalendar.astro`) pointed at the Church Center calendar.
- Church Center org/URLs are configured in `src/data/site.ts`.

## Deploy to Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Build settings: **Framework = Astro**, build command `npm run build`, output dir `dist`.
4. Add env vars `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET` in Pages settings.
5. Add the custom domain `chelseachurch.com` (move DNS to Cloudflare — free — which also lets you add a **DMARC** record to fix the current email-spoofing gap). Keep domain registration at GoDaddy; only nameservers change. **Recreate the Google Workspace MX + SPF records exactly** during the DNS move or email breaks.

## Project structure

```
├─ src/
│  ├─ data/site.ts          # church constants, nav, Church Center URLs  ← edit me first
│  ├─ layouts/Base.astro    # <head>, header, footer, fonts, CC modal script
│  ├─ components/           # Header, Footer, ChurchCenterCalendar, PortableText, ...
│  ├─ lib/                  # Sanity client + GROQ queries + image helper
│  ├─ pages/
│  │  ├─ index.astro        # homepage
│  │  ├─ [...slug].astro    # every CMS page (falls back to placeholders pre-CMS)
│  │  ├─ calendar.astro     # Church Center calendar embed
│  │  └─ give.astro         # Church Center giving
│  └─ styles/global.css     # brand system (blue #005291 / gold #F0C334, Poppins/Nunito)
├─ studio/                  # Sanity Studio (schemas + config) — staff editing UI
└─ public/                  # favicon, robots.txt, _redirects
```

## Editing content (for staff)

Everything is edited in the **Studio** (`<name>.sanity.studio`) — no code. Pick a page, fill in the labeled fields, add an image (drag the focal point), press **Publish**. You can't break the layout; the site rebuilds itself. Full walkthrough in the vault stack note.

---

_Scaffolded 2026-07-03. Placeholder content + TODOs (address, socials, real page copy) are intentional — see `src/data/site.ts`._
