// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pure static site (default output). Deploys to Cloudflare Pages as static assets.
// Content is pulled from Sanity at BUILD time (see src/lib/sanity.ts) — no server needed.
//
// `site`/`base` are overridable via env so the SAME source can also publish to a
// GitHub Pages *project* site (served from a `/CCC/` subpath) for staff previews,
// without disturbing the production Cloudflare build (which serves from the root).
// Production defaults below are used whenever the env vars are unset.
// Internal links/assets go through withBase() in src/data/site.ts, so a non-root
// base "just works". See .github/workflows/deploy-pages.yml.
const site = process.env.SITE_URL || 'https://chelseachurch.com';
const base = process.env.BASE_PATH || undefined; // e.g. '/CCC' on GitHub Pages

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  // Keep this a multi-page static site. Do NOT add <ClientRouter /> (View Transitions):
  // is:inline embed scripts (Church Center modal) don't re-execute on client-side nav,
  // which would silently break the giving/registration modals after the first page load.
  trailingSlash: 'ignore',
  // Build-time secret for the ESV scripture tooltips (src/lib/esv.ts). Optional:
  // the site builds fine without it — references just render as plain text.
  env: {
    schema: {
      ESV_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
