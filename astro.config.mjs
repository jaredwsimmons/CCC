// @ts-check
import { defineConfig, envField } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Server-rendered on Cloudflare Workers: each page is built when it's visited, so
// Church Center data (and Sanity content) is always current, with no rebuilds.
// Upstream data is cached at the edge (src/lib/cache.ts) so a visit rarely waits on it.
// `astro dev` and `astro preview` run the real Workers runtime locally (no account needed).
export default defineConfig({
  site: 'https://chelseachurch.com',
  output: 'server',
  adapter: cloudflare({
    // Plain <img> tags only (Sanity's image CDN does the resizing), so no Cloudflare Images binding.
    imageService: 'passthrough',
  }),
  // No sessions are used; without this the adapter provisions a KV namespace for them.
  session: false,
  // Keep this a multi-page site. Do NOT add <ClientRouter /> (View Transitions):
  // is:inline embed scripts (Church Center modal) don't re-execute on client-side nav,
  // which would silently break the giving/registration modals after the first page load.
  trailingSlash: 'ignore',
  // Old URLs whose path changed. Most GoHighLevel slugs are preserved 1:1, so only these.
  redirects: {
    '/home': '/',
    '/history': '/our-story',
  },
  // Runtime secret for the ESV scripture tooltips (/api/esv). Optional: without it,
  // references render as plain text. Local: .dev.vars. Production: `wrangler secret put`.
  env: {
    schema: {
      ESV_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
