import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { render } from './render';

const css = readFileSync('src/styles/global.css', 'utf8');
const documentFor = (html: string) => `<!doctype html><html class="js"><head><style>${css}</style></head><body>${html}</body></html>`;
const realFetch = globalThis.fetch;
test.afterEach(() => { globalThis.fetch = realFetch; });

test('two group filters operate independently and announce no matches', async ({ page }) => {
  globalThis.fetch = (async (input) => String(input).includes('/sessions/tokens')
    ? Response.json({ data: { attributes: { token: 'test' } } })
    : Response.json({ data: [
      { attributes: { name: 'Community One', enrollment_open: true, church_center_web_url: 'https://chelseachurch.churchcenter.com/groups/community-groups/one' } },
      { attributes: { name: 'Women One', enrollment_open: true, church_center_web_url: 'https://chelseachurch.churchcenter.com/groups/women-s-groups/one' } },
    ] })) as typeof fetch;
  const one = await render('src/components/sections/GroupsSection.astro', { s: { heading: 'First', filters: true } });
  const two = await render('src/components/sections/GroupsSection.astro', { s: { heading: 'Second', filters: true } });
  await page.setContent(documentFor(one + two));
  const roots = page.locator('[data-group-section]');
  await roots.nth(0).getByRole('button', { name: 'Community', exact: true }).click();
  await expect(roots.nth(0).getByRole('heading', { name: 'Women One' })).toBeHidden();
  await expect(roots.nth(1).getByRole('heading', { name: 'Women One' })).toBeVisible();
  await expect(roots.nth(1).getByRole('button', { name: 'All', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await roots.nth(0).getByRole('button', { name: 'Ministry', exact: true }).click();
  await expect(roots.nth(0).getByRole('status')).toContainText('No groups match');
});

test('calendar switches independently and reveals every event on a crowded day', async ({ page }) => {
  globalThis.fetch = (async (input) => String(input).includes('/sessions/tokens')
    ? Response.json({ data: { attributes: { token: 'test' } } })
    : Response.json({ data: [1, 2, 3, 4].map((id) => ({ id: String(id), attributes: {
      name: `Event ${id}`, starts_at: '2099-01-12T18:00:00Z', public_url: `https://example.com/event-${id}`,
    } })) })) as typeof fetch;
  const one = await render('src/components/sections/CalendarEventsSection.astro', { s: { heading: 'First calendar' } });
  const two = await render('src/components/sections/CalendarEventsSection.astro', { s: { heading: 'Second calendar' } });
  await page.setContent(documentFor(one + two));
  const roots = page.locator('[data-calendar-section]');
  await roots.nth(0).getByRole('button', { name: 'Month', exact: true }).click();
  await expect(roots.nth(0).locator('[data-view="month"]')).toBeVisible();
  await expect(roots.nth(1).locator('[data-view="month"]')).toBeHidden();
  await roots.nth(0).locator('summary').click();
  await expect(roots.nth(0).getByRole('link', { name: /Event 4,.*Jan 12, 2099/ })).toBeVisible();
  await roots.nth(0).getByRole('button', { name: 'List', exact: true }).click();
  await expect(roots.nth(0).locator('time').first()).toHaveAttribute('datetime', '2099-01-12');
});

test('mobile menu contains focus, closes with Escape, and releases the page on desktop', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile');
  const header = await render('src/components/Header.astro', {
    churchName: 'CCC', menu: [{ label: "I'm New", href: '/imnew' }, { label: 'Calendar', href: '/calendar' }],
  });
  await page.setContent(documentFor(`${header}<main><a href="/outside">Outside</a></main><footer>Footer</footer>`));
  const toggle = page.locator('[data-nav-toggle]');
  await expect(toggle).toHaveAccessibleName('Menu');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: "I'm New", exact: true })).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', true);
  await page.locator('main a').evaluate((el: HTMLAnchorElement) => el.focus());
  await expect(page.getByRole('link', { name: "I'm New", exact: true })).toBeFocused();
  await page.getByRole('link', { name: 'Calendar', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('a.brand')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
  await toggle.click();
  await page.setViewportSize({ width: 1200, height: 900 });
  await expect(toggle).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('main')).toHaveJSProperty('inert', false);
});
