# Chelsea Community Church — Website

A fast, free-to-host church website. Replaces the GoHighLevel/agency site while **keeping Planning Center as the engine**.

**Stack:** [Astro](https://astro.build) (server-rendered) → [Cloudflare Workers](https://workers.cloudflare.com) (free host) → [Sanity](https://www.sanity.io) (the CMS staff edit) → **Church Center** for calendar / giving / forms / registration. Pages are built when they're visited, so edits and Church Center changes show up without a rebuild. Domain registration stays at GoDaddy; email stays on Google Workspace.

> Design rationale, cost model, and the GoHighLevel→Planning Center CRM plan live in the vault:
> `04 Church/Church Website — Target Stack & CRM Replacement.md`.

---

## Prerequisites

- **Node 22.23.4+** (`.nvmrc` pins it; Astro 7 requires it)
- A free **Sanity** account → https://www.sanity.io/manage (only needed once you want real content; the site builds without it)

## Quick start (the website)

```bash
npm install
npm run dev      # http://localhost:4321
```

The site runs immediately with **placeholder pages** for every nav item and **live Church Center** calendar/giving. It builds fine before Sanity is connected.

```bash
npm run build    # Workers bundle + static assets → ./dist
npm run preview  # run the production build locally in the Workers runtime
npm test         # Playwright tests (builds + previews the site)
```

`npm run dev` and `npm run preview` run Cloudflare's real Workers runtime locally — no Cloudflare account needed. Astro 7 keeps them running in the background: if one says it's "already running", stop it with `npx astro dev stop` / `npx astro preview stop`. Local secrets go in `.dev.vars` (see `.dev.vars.example`).

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
4. Add content in the Studio. The website reads it **when each page is visited**, so a published change is live within seconds — no rebuild.

## How Church Center and the live data work

- The modal runtime loads once in `<head>` (`src/components/ChurchCenterScript.astro`).
- Any link ending in `?open-in-church-center-modal=true` opens giving/forms/registration in an overlay on desktop (phones open it in a new tab). **Requires HTTPS.**
- The calendar, groups and sermon feeds are fetched from Church Center / the podcast and YouTube feeds when a page is visited, and cached at the edge (`src/lib/cache.ts`): 10–30 minutes fresh, with the last good copy shown if a source is down.
- Church Center org/URLs are configured in `src/data/site.ts`.

## Deploy to Cloudflare Workers

1. Create a free Cloudflare account under the church's shared address.
2. Either deploy from a machine (`npx wrangler login`, then `npm run build && npx wrangler deploy`), or connect the GitHub repo under **Workers & Pages** (Workers Builds) with build command `npm run build` and deploy command `npx wrangler deploy`.
3. Set build variables `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET`, and secrets with `npx wrangler secret put ESV_API_KEY`.
4. Add the custom domain `chelseachurch.com` to the Worker. Cloudflare requires the domain's DNS to be hosted on Cloudflare (registration stays at GoDaddy; only nameservers change). **Recreate the Google Workspace MX, SPF and verification records exactly** during the DNS move or email breaks — see the staff asks doc.

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
└─ public/                  # favicon, robots.txt, images (old-URL redirects live in astro.config.mjs)
```

## Editing content (for staff)

Everything is edited in the **Studio** (`<name>.sanity.studio`) — no code. Pick a page, fill in the labeled fields, add an image (drag the focal point), press **Publish**. You can't break the layout, and the change is live within seconds. Full walkthrough in the vault stack note.

---

_Scaffolded 2026-07-03. Placeholder content + TODOs (address, socials, real page copy) are intentional — see `src/data/site.ts`._
