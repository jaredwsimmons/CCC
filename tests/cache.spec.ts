import { test, expect } from '@playwright/test';
import { cached, clearMemoryCache } from '../src/lib/cache';

// The edge cache's behavior when upstreams (Church Center, feeds, ESV) succeed and fail,
// against an in-memory stand-in for Cloudflare's caches.default and a controllable clock.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
});

let now = 0;
const realNow = Date.now;
const g = globalThis as { caches?: unknown };

test.beforeEach(() => {
  clearMemoryCache();
  now = 1_000_000;
  Date.now = () => now;
  const store = new Map<string, string>();
  g.caches = {
    default: {
      match: async (req: Request) => (store.has(req.url) ? new Response(store.get(req.url)) : undefined),
      put: async (req: Request, res: Response) => void store.set(req.url, await res.text()),
    },
  };
});
test.afterEach(() => {
  Date.now = realNow;
  delete g.caches;
});

// A loader that returns the queued results in order and counts its calls.
function loader<T>(...results: (T | null)[]) {
  const fn = async () => {
    fn.calls++;
    return results.shift() ?? null;
  };
  fn.calls = 0;
  return fn;
}

test('serves from cache until the ttl passes, then refreshes', async () => {
  const load = loader(['a'], ['b']);
  expect(await cached('k', 60, load)).toEqual(['a']);
  now += 59_000;
  expect(await cached('k', 60, load)).toEqual(['a']);
  expect(load.calls).toBe(1);
  now += 2_000;
  expect(await cached('k', 60, load)).toEqual(['b']);
  expect(load.calls).toBe(2);
});

test('keeps the last good copy when a refresh fails, and retries a minute later', async () => {
  const load = loader(['good'], null, ['newer']);
  await cached('k', 600, load);
  now += 601_000;
  expect(await cached('k', 600, load)).toEqual(['good']); // refresh failed
  now += 30_000;
  expect(await cached('k', 600, load)).toEqual(['good']); // within the retry wait
  expect(load.calls).toBe(2);
  now += 31_000;
  expect(await cached('k', 600, load)).toEqual(['newer']); // retried
  expect(load.calls).toBe(3);
});

test('remembers a failure with no copy for a minute instead of retrying every visit', async () => {
  const load = loader<string[]>(null, ['finally']);
  expect(await cached('k', 600, load)).toBeNull();
  now += 30_000;
  expect(await cached('k', 600, load)).toBeNull();
  expect(load.calls).toBe(1);
  now += 31_000;
  expect(await cached('k', 600, load)).toEqual(['finally']);
});

test('still caches when the edge cache drops writes (*.workers.dev)', async () => {
  g.caches = { default: { match: async () => undefined, put: async () => {} } };
  const load = loader(['a'], ['b']);
  expect(await cached('k', 600, load)).toEqual(['a']);
  now += 300_000;
  expect(await cached('k', 600, load)).toEqual(['a']);
  expect(load.calls).toBe(1);
});

test('without an edge cache, every call loads', async () => {
  delete g.caches;
  const load = loader(['a'], ['b']);
  expect(await cached('k', 600, load)).toEqual(['a']);
  expect(await cached('k', 600, load)).toEqual(['b']);
});
