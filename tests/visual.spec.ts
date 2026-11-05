import { test, expect } from '@playwright/test';

// Full-page screenshots of pages that, between them, use every section pattern:
// hero, text + photo, navy band, cards, schedule, steps, gallery, deacon card,
// call-to-action band. Photos are masked: their files change when they move to
// Sanity's image CDN, and unmasked they make each baseline several megabytes.
const visualPages = [
  { name: 'home', path: '/' },
  { name: 'imnew', path: '/imnew' },
  { name: 'about', path: '/about' },
  { name: 'men', path: '/men' },
  { name: 'preschool', path: '/preschool' },
  { name: 'prayer', path: '/prayer' },
];

for (const p of visualPages) {
  test(`${p.name} looks the same`, async ({ page }) => {
    await page.goto(p.path);
    await page.evaluate(() => document.querySelectorAll('.live-data').forEach((e) => e.remove()));
    // Lazy images below the fold change the layout when they load; load them all first.
    await page.evaluate(async () => {
      const imgs = [...document.images];
      imgs.forEach((img) => (img.loading = 'eager'));
      await Promise.all(imgs.map((img) => img.decode().catch(() => {})));
      await document.fonts.ready;
    });
    await expect(page).toHaveScreenshot(`${p.name}.png`, {
      fullPage: true,
      mask: [page.locator('img, video')],
      maxDiffPixelRatio: 0.01,
    });
  });
}
