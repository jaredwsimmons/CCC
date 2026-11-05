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

The site runs immediately with **today's content** and **live Church Center** calendar, groups and registrations. Until Sanity is connected, pages render from `src/data/migration.ts` (today's content, already in Sanity's document format) through the same queries the live site uses.

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
4. Load today's content into the new project (once; the import asks you to log in the first time and uploads the photos from `public/images`):
   ```bash
   npm run export:sanity     # in the repo root → migration/dataset.ndjson
   cd studio && npx sanity dataset import ../migration/dataset.ndjson production
   ```
   From then on content is edited **in the Studio only**: `src/data/migration.ts` and `src/data/content.ts` are used only while no project ID is set.
5. Edit in the Studio. The website reads it **when each page is visited**, so a published change is live within seconds — no rebuild.

### Live Preview

The Studio opens on **Live Preview**: the real website beside the form, showing unpublished drafts. Setup:

1. Create a read-only key, in `studio/`: `npx sanity tokens add "Site preview" --role=viewer`. Put it in `.dev.vars` as `SANITY_API_READ_TOKEN` (production: `npx wrangler secret put SANITY_API_READ_TOKEN`).
2. Allow the site's address, in `studio/`: `npx sanity cors add http://localhost:4321 --credentials`, and the real address once it's live.
3. Before `npx sanity deploy`, set `SANITY_STUDIO_PREVIEW_URL` in `studio/.env` to the real address, and `PUBLIC_SANITY_STUDIO_URL` to the Studio's address where the site is built.

Only a cookie signed by the server unlocks drafts (`src/lib/preview.ts`), and draft results never go through the cache.

## How Church Center and the live data work

- The modal runtime loads once in `<head>` (`src/components/ChurchCenterScript.astro`).
- Any link ending in `?open-in-church-center-modal=true` opens giving/forms/registration in an overlay on desktop (phones open it in a new tab). **Requires HTTPS.**
- The calendar, groups and sermon feeds are fetched from Church Center / the podcast and YouTube feeds when a page is visited, and cached at the edge (`src/lib/cache.ts`): 10–30 minutes fresh, with the last good copy shown if a source is down.
- Church Center org/URLs are configured in `src/data/site.ts`.

## Deploy to Cloudflare Workers

1. Create a free Cloudflare account under the church's shared address.
2. Either deploy from a machine (`npx wrangler login`, then `npm run build && npx wrangler deploy`), or connect the GitHub repo under **Workers & Pages** (Workers Builds) with build command `npm run build` and deploy command `npx wrangler deploy`.
3. Set build variables `PUBLIC_SANITY_PROJECT_ID` / `PUBLIC_SANITY_DATASET`, and secrets with `npx wrangler secret put ESV_API_KEY` and `npx wrangler secret put SANITY_API_READ_TOKEN`.
4. Add the custom domain `chelseachurch.com` to the Worker. Cloudflare requires the domain's DNS to be hosted on Cloudflare (registration stays at GoDaddy; only nameservers change). **Recreate the Google Workspace MX, SPF and verification records exactly** during the DNS move or email breaks — see the staff asks doc.

## Project structure

```
├─ src/
│  ├─ data/site.ts          # church constants, Church Center URLs
│  ├─ data/migration.ts     # today's content as Sanity documents (used until Sanity is connected)
│  ├─ layouts/Base.astro    # <head>, header + footer (menu and church details from Site Settings)
│  ├─ components/           # Header, Footer, PageHeader, Buttons, RichText, ...
│  │  └─ sections/          # one component per Sanity section type (Sections.astro picks them)
│  ├─ lib/                  # Sanity fetch + GROQ queries, button links, images, edge cache, Church Center + feeds
│  ├─ pages/
│  │  ├─ index.astro        # homepage (Home page + Site Settings)
│  │  ├─ [...slug].astro    # every page staff build in Sanity
│  │  ├─ calendar, groups, media, give, leaders .astro   # fixed pages: live data + a Sanity header and sections
│  │  ├─ bylaws.astro       # the bylaws (still in code)
│  │  ├─ sitemap.xml.ts     # the sitemap, built on request
│  │  └─ api/esv.ts         # verses for the scripture tooltips
│  └─ styles/global.css     # brand system (blue #005291 / gold #F0C334, Poppins/Nunito)
├─ studio/                  # Sanity Studio (schemas + config) — staff editing UI
└─ public/                  # favicon, robots.txt, images (old-URL redirects live in astro.config.mjs)
```

## Editing content (for staff)

Everything is edited in the **Studio** (`<name>.sanity.studio`) — no code. Pick a page, fill in the labeled fields, add an image (drag the focal point), press **Publish**. You can't break the layout, and the change is live within seconds. Full walkthrough in the vault stack note.

---

_Scaffolded 2026-07-03._
