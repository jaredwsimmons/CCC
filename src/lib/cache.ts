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

const KEEP_SECONDS = 7 * 24 * 60 * 60; // how long an entry survives without a successful refresh (or its ttl, if longer)
const RETRY_SECONDS = 60; // how long to wait after a failed refresh
// Versioned because older entries did not record when their data was last refreshed.
const KEY_BASE = 'https://chelseachurch.com/__edge-cache/v2/';

type Entry<T> = { at: number; goodAt: number; retryAt: number; data: T | null };

const memory = new Map<string, Entry<unknown>>();
const budgets = new Map<string, { window: number; used: number }>();

/** Forget the in-memory entries (tests). */
export const clearMemoryCache = () => {
  memory.clear();
  budgets.clear();
};

export async function cached<T>(
  key: string,
  ttl: number,
  load: () => Promise<T | null>,
): Promise<T | null> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return load();

  const keep = Math.max(KEEP_SECONDS, ttl) * 1000;
  const usable = (e: Entry<T> | null) => e !== null && Date.now() - e.goodAt < keep;
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
          'Cache-Control': `max-age=${entry.data === null ? RETRY_SECONDS : Math.max(1, Math.ceil((entry.goodAt + keep - now) / 1000))}`,
        },
      }),
    );
  } catch {
    // Caching is best-effort; the data is still returned.
  }
  return entry.data;
}

/**
 * True for the first `limit` calls in each window of `windowSeconds`, then false: a cap on
 * how often something that costs a shared allowance (the ESV API) may run. The count is
 * kept like the data above, per Cloudflare location and without locking, so it is a
 * close limit rather than an exact one. Outside the Workers runtime it always allows.
 */
export async function withinBudget(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  if (!cache) return true;
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  const local = budgets.get(key);
  let used = local?.window === window ? local.used : 0;
  const req = new Request(KEY_BASE + encodeURIComponent(`budget:${key}:${window}`));
  try {
    const hit = await cache.match(req);
    if (hit) used = Math.max(used, Number(await hit.text()) || 0);
  } catch {
    // An unreadable count falls back to this Worker's own.
  }
  if (used >= limit) return false;
  budgets.set(key, { window, used: used + 1 });
  try {
    await cache.put(req, new Response(String(used + 1), { headers: { 'Cache-Control': `max-age=${windowSeconds}` } }));
  } catch {
    // Best-effort, as above.
  }
  return true;
}
