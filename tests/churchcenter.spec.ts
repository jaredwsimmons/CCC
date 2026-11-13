import { test, expect } from '@playwright/test';
import { ccGet } from '../src/lib/churchcenter';

test('concurrent cold callers share one token request and recover after token failure', async () => {
  const realFetch = globalThis.fetch;
  const realNow = Date.now;
  Date.now = () => realNow() + 10 * 60 * 1000; // expire any token from other source tests
  let calls = 0;
  let fail = true;
  globalThis.fetch = (async (input: string | URL | Request) => {
    if (String(input).includes('/sessions/tokens')) {
      calls++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return fail ? new Response('Unavailable', { status: 503 })
        : Response.json({ data: { attributes: { token: 'test' } } });
    }
    return Response.json({ data: [] });
  }) as typeof fetch;
  try {
    expect(await Promise.all([ccGet('/groups/v2/groups'), ccGet('/calendar/v2/events')])).toEqual([null, null]);
    expect(calls).toBe(1);
    fail = false;
    expect(await Promise.all([ccGet('/groups/v2/groups'), ccGet('/calendar/v2/events')])).toEqual([{ data: [] }, { data: [] }]);
    expect(calls).toBe(2);
  } finally {
    globalThis.fetch = realFetch;
    Date.now = realNow;
  }
});

test('one caller timing out does not cancel token acquisition for the other caller', async () => {
  const realFetch = globalThis.fetch;
  const realNow = Date.now;
  Date.now = () => realNow() + 20 * 60 * 1000;
  let calls = 0;
  globalThis.fetch = (async (input, init) => {
    if (String(input).includes('/sessions/tokens')) {
      calls++;
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 15);
        init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true });
      });
      return Response.json({ data: { attributes: { token: 'test' } } });
    }
    return Response.json({ data: [] });
  }) as typeof fetch;
  try {
    expect(await Promise.all([ccGet('/groups/v2/groups', 1), ccGet('/calendar/v2/events', 200)])).toEqual([null, { data: [] }]);
    expect(calls).toBe(1);
  } finally { globalThis.fetch = realFetch; Date.now = realNow; }
});
