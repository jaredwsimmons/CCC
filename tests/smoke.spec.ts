import { test, expect } from '@playwright/test';
import { pages } from './pages';

for (const p of pages) {
  test(`${p.name} loads cleanly`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    const res = await page.goto(p.path);
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);

    // No sideways scrolling (the phone project catches layouts that overflow).
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    // Every image of ours has alt text. Church Center's injected spinner is a data: URI.
    await expect(page.locator('img:not([alt]):not([src^="data:"])')).toHaveCount(0);

    expect(errors).toEqual([]);
  });
}

test('unknown pages get the 404 page', async ({ page }) => {
  const res = await page.goto('/no-such-page');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText("We couldn't find that page");
});

test('internal links all resolve', async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'links are the same on every viewport');
  const hrefs = new Set<string>();
  for (const p of pages) {
    await page.goto(p.path);
    const found = await page
      .locator('a[href^="/"]:not([href^="//"])')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
    for (const h of found) hrefs.add(h.split('#')[0]);
  }
  for (const h of hrefs) {
    const res = await request.get(h);
    expect(res.status(), h).toBeLessThan(400);
  }
});
