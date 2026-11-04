import { createClient, type SanityClient } from '@sanity/client';
import { cached } from './cache';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID as string | undefined;
const dataset = (import.meta.env.PUBLIC_SANITY_DATASET as string) || 'production';
const apiVersion = (import.meta.env.PUBLIC_SANITY_API_VERSION as string) || '2024-10-01';

/**
 * True once a real Sanity project id is configured. Until then the site renders the
 * migrated content (src/data/migration.ts) with the same queries, run locally by groq-js.
 */
export const hasSanity = Boolean(projectId);

// Published content only, through Sanity's API CDN (which keeps serving cached content
// for up to two hours if the Content Lake itself is down).
const client: SanityClient | null = hasSanity
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: 'published' })
  : null;

let localDocs: unknown[] | null = null;
async function queryLocal<T>(query: string, params: Record<string, unknown>): Promise<T> {
  const [{ parse, evaluate }, { buildDocuments }] = await Promise.all([import('groq-js'), import('../data/migration')]);
  localDocs ??= buildDocuments();
  const result = await evaluate(parse(query, { params }), { dataset: localDocs, params });
  return (await result.get()) as T;
}

async function hash(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Run a GROQ query. Results are cached for 10 seconds (so a published edit shows within
 * seconds), and if Sanity can't be reached the last good result is used. With no result
 * at all it throws, so the page fails (500) instead of rendering as if the content
 * didn't exist. A query that finds nothing returns null, as usual.
 */
export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!client) return queryLocal<T>(query, params);
  const res = await cached(`sanity:${await hash(query + JSON.stringify(params))}`, 10, async () => {
    try {
      return { value: await client.fetch<T>(query, params) };
    } catch (err) {
      console.warn('[sanity] query failed:', (err as Error).message);
      return null;
    }
  });
  if (!res) throw new Error('Sanity could not be reached and no cached copy exists.');
  return res.value;
}

export { projectId, dataset };
