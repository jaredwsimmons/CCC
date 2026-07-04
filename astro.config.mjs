// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pure static site (default output). Deploys to Cloudflare Pages as static assets.
// Content is pulled from Sanity at BUILD time (see src/lib/sanity.ts) — no server needed.
export default defineConfig({
  site: 'https://chelseachurch.com',
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
