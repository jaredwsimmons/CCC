import type { APIRoute } from 'astro';
import { sanityFetch } from '../lib/sanity';
import { pageSlugsQuery } from '../lib/queries';

// The sitemap, built on request so a page staff publish in Sanity is listed right away.
// The coded routes are listed here; every other page comes from Sanity.
const CODED = ['/', '/calendar', '/groups', '/media', '/give', '/leaders'];

export const GET: APIRoute = async ({ site }) => {
  const slugs = (await sanityFetch<string[] | null>(pageSlugsQuery)) ?? [];
  const urls = [...CODED, ...slugs.map((s) => `/${s}`)].map((path) => new URL(path, site).href.replaceAll('&', '&amp;'));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
};
