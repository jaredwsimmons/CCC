import { createClient, type SanityClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
const apiVersion = (import.meta.env.PUBLIC_SANITY_API_VERSION as string) || '2024-10-01';

/** True once a real Sanity project id is configured in .env. */
export const hasSanity = Boolean(projectId);

/**
 * Sanity client — or null when no project is configured yet.
 * `useCdn: false` because we query at BUILD time (static site); the CDN adds nothing for build fetches.
 */
export const client: SanityClient | null = hasSanity
  ? createClient({ projectId, dataset, apiVersion, useCdn: false })
  : null;

/**
 * Safe fetch: returns null (never throws) when Sanity isn't configured or a query fails,
 * so the site still builds and renders placeholder content before the CMS is wired up.
 */
export async function sanityFetch<T = unknown>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!client) return null;
  try {
    return await client.fetch<T>(query, params);
  } catch (err) {
    console.warn('[sanity] query failed — falling back to placeholder:', (err as Error).message);
    return null;
  }
}

export { projectId, dataset };
