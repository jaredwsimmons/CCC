import { test, expect } from '@playwright/test';
import { PREVIEW_COOKIE, PREVIEW_SECONDS, clickToEdit, signPreview, verifyPreview } from '../src/lib/preview';

// Drafts must stay private: only a cookie this server signed may unlock them.
test.describe('the preview cookie', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
  });
  const secret = 'a-server-secret';
  const now = 1_000_000;

  test('a cookie the server signed works', async () => {
    expect(await verifyPreview(await signPreview(secret, now), secret, now + 1000)).toBe(true);
  });

  test('it stops working once it expires', async () => {
    const cookie = await signPreview(secret, now);
    expect(await verifyPreview(cookie, secret, now + PREVIEW_SECONDS * 1000)).toBe(false);
  });

  test('a later expiry cannot be written in', async () => {
    const [, signature] = (await signPreview(secret, now)).split('.');
    expect(await verifyPreview(`${now + 10 ** 12}.${signature}`, secret, now)).toBe(false);
  });

  test('a cookie signed with another secret fails', async () => {
    expect(await verifyPreview(await signPreview('someone-else', now), secret, now)).toBe(false);
  });

  test('made-up values fail without throwing', async () => {
    for (const value of ['', 'drafts', '1', '.', '1.2', `${now * 2}.${'z'.repeat(64)}`, `1.${'a'.repeat(64)}.3`]) {
      expect(await verifyPreview(value, secret, now), value).toBe(false);
    }
  });
});

test('click-to-edit never marks text the code makes decisions on', ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
  for (const field of ['background', 'kind', 'photoSide', 'source', 'style', 'url', 'href', 'email', 'phone', 'current']) {
    expect(clickToEdit({ sourcePath: ['sections', 0, field] }), field).toBe(false);
  }
  expect(clickToEdit({ sourcePath: ['sections', 0, 'heading'] })).toBe(true);
  expect(clickToEdit({ sourcePath: ['sections', 0, 'body', 0, 'children', 0, 'text'] })).toBe(true);
});

test('a made-up preview cookie shows the public site', async ({ page, context, baseURL }) => {
  await context.addCookies([
    { name: PREVIEW_COOKIE, value: `${Date.now() + 60_000}.${'a'.repeat(64)}`, url: baseURL! },
    { name: 'sanity-preview-perspective', value: 'drafts', url: baseURL! },
  ]);
  await page.goto('/about');
  await expect(page.locator('#exit-preview')).toHaveCount(0);
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('#exit-preview')).toHaveCount(0);
});

// Astro still links the overlay's small stylesheet on every page: its class names are
// generated (.u-dJgWtv), so it can't change the site. The scripts must stay away.
test('public pages never run the preview code', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (req) => {
    if (req.resourceType() === 'script') scripts.push(req.url());
  });
  await page.goto('/about');
  await expect(page.locator('main')).toBeVisible();
  expect(scripts.filter((url) => /visualediting/i.test(url))).toEqual([]);
});

test('preview cannot be switched on without a secret from the Studio', async ({ request }) => {
  const res = await request.get('/api/draft-mode/enable', { maxRedirects: 0 });
  expect(res.status()).toBeGreaterThanOrEqual(400);
  expect(res.headers()['set-cookie'] ?? '').not.toContain(PREVIEW_COOKIE);
});

test('switching preview off clears its cookies', async ({ request }) => {
  const res = await request.get('/api/draft-mode/disable', { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  const cookies = res.headers()['set-cookie'] ?? '';
  expect(cookies).toContain(`${PREVIEW_COOKIE}=;`);
  expect(cookies).toContain('Max-Age=0');
});
