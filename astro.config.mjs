// @ts-check
import { defineConfig } from 'astro/config';

// Pure static site (default output). Deploys to Cloudflare Pages as static assets.
// Content is pulled from Sanity at BUILD time (see src/lib/sanity.ts) — no server needed.
export default defineConfig({
  site: 'https://chelseachurch.com',
  // Keep this a multi-page static site. Do NOT add <ClientRouter /> (View Transitions):
  // is:inline embed scripts (Church Center modal) don't re-execute on client-side nav,
  // which would silently break the giving/registration modals after the first page load.
  trailingSlash: 'ignore',
});
