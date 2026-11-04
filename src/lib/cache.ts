// Edge cache for upstream data (Church Center, feeds, ESV) on Cloudflare Workers.
//
// cached(key, ttl, load) returns data no older than `ttl` seconds when it can. When a
// refresh fails (`load` returns null), it keeps returning the last good copy, so a
// Church Center hiccup shows slightly old data instead of an empty section, and it
// waits a minute before trying again, so an outage doesn't slow every page view.
// Outside the Workers runtime (no `caches.default`) it just calls `load()`.
//
// The Cache API does nothing on *.workers.dev addresses; it works on the custom domain.

const KEEP_SECONDS = 7 * 24 * 60 * 60; // how long an entry survives without a successful refresh
const RETRY_SECONDS = 60; // how long to wait after a failed refresh
const KEY_BASE = 'https://chelseachurch.com/__edge-cache/';

type Entry<T> = { at: number; data: T | null };

export async function cached<T>(
  key: string,
  ttl: number,
  load: () => Promise<T | null>,
): Promise<T | null> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return load();

  const req = new Request(KEY_BASE + encodeURIComponent(key));
  let last: Entry<T> | null = null;
  try {
    const hit = await cache.match(req);
    if (hit) last = (await hit.json()) as Entry<T>;
  } catch {
    // An unreadable entry is treated as a miss.
  }
  if (last && Date.now() - last.at < ttl * 1000) return last.data;

  const fresh = await load();
  // On failure, keep the last good copy (or remember there is none) and look fresh
  // again for RETRY_SECONDS, so the next minute of visits doesn't wait on a dead upstream.
  const entry: Entry<T> =
    fresh !== null
      ? { at: Date.now(), data: fresh }
      : { at: Date.now() - Math.max(ttl - RETRY_SECONDS, 0) * 1000, data: last?.data ?? null };
  try {
    await cache.put(
      req,
      new Response(JSON.stringify(entry), {
        headers: { 'Content-Type': 'application/json', 'Cache-Control': `max-age=${KEEP_SECONDS}` },
      }),
    );
  } catch {
    // Caching is best-effort; the data is still returned.
  }
  return entry.data;
}
