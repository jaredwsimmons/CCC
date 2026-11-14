// Edge cache for upstream data (Church Center, feeds, ESV) on Cloudflare Workers.
//
// cached(key, ttl, load) returns data no older than `ttl` seconds when it can. When a
// refresh fails (`load` returns null), it keeps returning the last good copy, so a
// Church Center hiccup shows slightly old data instead of an empty section, and it
// waits a minute before trying again, so an outage doesn't slow every page view.
// Outside the Workers runtime (no `caches.default`) it just calls `load()`.
//
// The Cache API does nothing on *.workers.dev addresses (it works on the custom domain),
// so each running Worker also keeps entries in memory: repeat visits it serves don't
// refetch either way.

const KEEP_SECONDS = 7 * 24 * 60 * 60; // how long an entry survives without a successful refresh
const RETRY_SECONDS = 60; // how long to wait after a failed refresh
// Versioned because older entries did not record when their data was last refreshed.
const KEY_BASE = 'https://chelseachurch.com/__edge-cache/v2/';

type Entry<T> = { at: number; goodAt: number; retryAt: number; data: T | null };

const memory = new Map<string, Entry<unknown>>();

/** Forget the in-memory entries (tests). */
export const clearMemoryCache = () => memory.clear();

export async function cached<T>(
  key: string,
  ttl: number,
  load: () => Promise<T | null>,
): Promise<T | null> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return load();

  const usable = (e: Entry<T> | null) => e !== null && Date.now() - e.goodAt < KEEP_SECONDS * 1000;
  const isFresh = (e: Entry<T> | null) => usable(e) && Date.now() < e!.retryAt;
  let last = (memory.get(key) as Entry<T> | undefined) ?? null;
  if (isFresh(last)) return last!.data;

  const req = new Request(KEY_BASE + encodeURIComponent(key));
  try {
    const hit = await cache.match(req);
    const edge = hit ? ((await hit.json()) as Entry<T>) : null;
    if (edge && (!last || edge.at > last.at)) last = edge;
  } catch {
    // An unreadable entry is treated as a miss.
  }
  if (isFresh(last)) {
    memory.set(key, last!);
    return last!.data;
  }

  const fresh = await load();
  // On failure, keep the last good copy (or remember there is none) and look fresh
  // again for RETRY_SECONDS, so the next minute of visits doesn't wait on a dead upstream.
  const now = Date.now();
  const stale = usable(last) ? last : null;
  const entry: Entry<T> =
    fresh !== null
      ? { at: now, goodAt: now, retryAt: now + ttl * 1000, data: fresh }
      : { at: now, goodAt: stale?.goodAt ?? now, retryAt: now + RETRY_SECONDS * 1000, data: stale?.data ?? null };
  memory.set(key, entry);
  try {
    await cache.put(
      req,
      new Response(JSON.stringify(entry), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${entry.data === null ? RETRY_SECONDS : Math.max(1, Math.ceil((entry.goodAt + KEEP_SECONDS * 1000 - now) / 1000))}`,
        },
      }),
    );
  } catch {
    // Caching is best-effort; the data is still returned.
  }
  return entry.data;
}
