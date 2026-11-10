import { test, expect } from '@playwright/test';
import { pages } from './pages';

// The words, headings, links, buttons and image alt text of each page, as the
// accessibility tree sees them. This is what the CMS migration must preserve.
// Content is the same on every viewport, so it's checked once, on desktop. A page's
// Upcoming events change from day to day, so they're set aside (see the section's class).
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'content is the same on every viewport');
});

for (const p of pages.filter((p) => !p.live)) {
  test(`${p.name} content matches the baseline`, async ({ page }) => {
    await page.goto(p.path);
    await page.evaluate(() => document.querySelectorAll('.live-data').forEach((e) => e.remove()));
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

test('leaders are split into staff, elders and deacons', async ({ page }) => {
  await page.goto('/leaders');
  for (const heading of ['Our staff', 'Our elders', 'Serving the Body']) {
    await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible();
  }
});

test('the media page still gets the series art for episodes without their own', async ({ page }) => {
  await page.goto('/media');
  const art = page.locator('.latest__art img, .ep__art');
  if ((await art.count()) === 0) test.skip(true, 'the podcast feed is unavailable right now');
  await expect(art.first()).toHaveAttribute('src', /.+/);
});

test('the text sign-up opens in a small window, since it refuses to load inside a pop-up', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.open = ((...args: string[]) => {
      (window as unknown as { opened: string[] }).opened = args;
      return {} as Window;
    }) as typeof window.open;
  });
  await page.locator('footer').getByRole('link', { name: 'Text updates' }).click();
  const opened = await page.evaluate(() => (window as unknown as { opened?: string[] }).opened);
  expect(opened?.[0]).toContain('txtsignal');
  expect(opened?.[2]).toContain('width=480');
});

test('group cards are the same height however long their descriptions are', async ({ page }) => {
  await page.goto('/groups');
  const cards = page.locator('.gcard');
  if ((await cards.count()) < 2) test.skip(true, 'Church Center has too few open groups right now');
  const heights = await cards.evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
  expect(new Set(heights).size).toBe(1);
});

test('Request to join shows the group on this site, then goes to Church Center', async ({ page }) => {
  await page.goto('/groups');
  const card = page.locator('.gcard').first();
  if ((await card.count()) === 0) test.skip(true, 'Church Center has no open groups right now');
  const name = await card.locator('h3').first().textContent();
  await card.locator('.gcard__join').click();
  await expect(page).toHaveURL(/\/groups$/);
  const dialog = page.locator('dialog[open]');
  await expect(dialog.getByRole('heading', { name: name! })).toBeVisible();
  const join = dialog.getByRole('link', { name: /request to join/i });
  await expect(join).toHaveAttribute('href', /churchcenter\.com\/groups\//);
  await expect(join).toHaveAttribute('data-small-window', /.*/);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)).toBe('hidden');
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(page.locator('dialog[open]')).toHaveCount(0);
});

// Runs once a published page uses this section; About does when its rewrite goes live.
test('a tap-to-open row opens, and a verse inside it does not close it', async ({ page }) => {
  await page.goto('/about');
  const row = page.locator('details.acc__item').first();
  if ((await row.count()) === 0) test.skip(true, 'no published page uses this section yet');
  await expect(row).not.toHaveAttribute('open');
  await row.locator('summary').click();
  await expect(row).toHaveAttribute('open');
  await expect(row.locator('.acc__body')).toBeVisible();
  // The suite runs without an ESV key, so references are plain text (.sref-plain), not tooltips (.sref).
  await row.locator('.sref, .sref-plain').first().click();
  await expect(row).toHaveAttribute('open');
});

test('the footer links from Site Settings open the right places', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('footer');
  await expect(footer.locator('li', { hasText: 'Prayer' }).getByRole('link')).toHaveAttribute('href', /churchcenter\.com.*open-in-church-center-modal=true/);
  await expect(footer.getByRole('link', { name: 'Media' }).first()).toHaveAttribute('href', '/media');
  const app = footer.getByRole('link', { name: 'Church Center app' });
  await expect(app).toHaveAttribute('href', /churchcenter\.com\/setup/);
  await expect(app).toHaveAttribute('target', '_blank');
});

test('the menu runs in the order the church asked for', async ({ page }) => {
  await page.goto('/');
  const labels = await page.locator('header nav > ul > li > a:not(.btn)').allTextContents();
  expect(labels.map((l) => l.trim())).toEqual(["I'm New", 'About', 'Ministries', 'Calendar', 'Media']);
});

test('a menu with a dropdown shows as current on any page in its list', async ({ page }) => {
  await page.goto('/men');
  await expect(page.locator('header nav > ul > li > a', { hasText: 'Ministries' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('header nav > ul > li > a', { hasText: 'About' })).not.toHaveAttribute('aria-current', 'page');
});

test("the This Sunday card on I'm New shows the times and address from Site Settings", async ({ page }) => {
  await page.goto('/imnew');
  const card = page.locator('.visit');
  await expect(card).toContainText('9:00 & 10:30 AM');
  await expect(card).toContainText('101 Chelsea Park Dr., Chelsea, AL 35043');
  await expect(card.getByRole('link', { name: 'Get directions' })).toHaveAttribute('href', /maps/);
});

test('the homepage video can be paused and played again', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const toggle = page.locator('[data-video-toggle]');
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('.hero__video').evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(toggle).toHaveAccessibleName('Play background video');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});
