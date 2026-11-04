import { test, expect } from '@playwright/test';
import { pages } from './pages';

// The words, headings, links, buttons and image alt text of each page, as the
// accessibility tree sees them. This is what the CMS migration must preserve.
// Content is the same on every viewport, so it's checked once, on desktop.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'content is the same on every viewport');
});

for (const p of pages.filter((p) => !p.live)) {
  test(`${p.name} content matches the baseline`, async ({ page }) => {
    await page.goto(p.path);
    await expect(page.locator('main')).toMatchAriaSnapshot({ name: `${p.name}.aria.yml` });
  });
}

// Live pages: check the fixed structure around the changing data.
test('calendar shows the weekly rhythm and the events list', async ({ page }) => {
  await page.goto('/calendar');
  await expect(page.getByRole('heading', { level: 2, name: 'The rhythm of our week' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'On the calendar' })).toBeVisible();
});

test('groups shows the list of groups open to join', async ({ page }) => {
  await page.goto('/groups');
  await expect(page.getByRole('heading', { level: 2, name: 'Groups open to join' })).toBeVisible();
});

test('media shows its page header', async ({ page }) => {
  await page.goto('/media');
  await expect(page.getByRole('heading', { level: 1, name: 'Watch & Listen' })).toBeVisible();
});
