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

test('weekly video headings stay simple and the newest video plays inline', async ({ page }) => {
  globalThis.fetch = (async () => new Response(`<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015">${[1, 2, 3, 4].map((id) => `<entry><yt:videoId>weekly${id}</yt:videoId><title>Long upload title ${id}</title></entry>`).join('')}</feed>`)) as typeof fetch;
  const html = await render('src/components/sections/PlaylistSection.astro', { s: {
    heading: 'Video announcements', playlist: 'PLweeklybrowser1234', count: 2,
    videoLabels: ['This week', 'Last week', 'Two weeks ago'],
  } });
  await page.route('https://www.youtube-nocookie.com/**', (route) => route.fulfill({ body: '<p>Video fixture</p>' }));
  await page.setContent(documentFor(html));
  await expect(page.getByRole('heading', { level: 2 })).toHaveText('Video announcements');
  await expect(page.getByRole('heading', { level: 3 })).toHaveText(['This week', 'Last week', 'Two weeks ago']);
  await expect(page.getByText(/Long upload title/)).toHaveCount(0);
  await expect(page.locator('a')).toHaveCount(3);
  await page.getByRole('link', { name: 'Play This week', exact: true }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/weekly1?autoplay=1&rel=0');
  await expect(page.locator('iframe')).toHaveAttribute('title', 'Play This week');
});

test('section titles, labels, and introductions share the content edge in plain and tinted sections', async ({ page }) => {
  const props = { center: true, title: 'Our ministries', eyebrow: 'Get involved', lead: 'A short introduction to the ways you can connect and serve.' };
  const plain = await render('src/components/Section.astro', props);
  const tinted = await render('src/components/Section.astro', { ...props, variant: 'alt' });
  await page.setContent(documentFor(plain + tinted));
  for (const header of await page.locator('.section-head').all()) {
    await expect(header.getByRole('heading', { level: 2 })).toHaveCSS('text-align', 'left');
    await expect(header.locator('.eyebrow')).toHaveCSS('justify-content', 'flex-start');
    const offsets = await header.evaluate((element) => {
      const parent = element.parentElement!;
      const left = element.getBoundingClientRect().left;
      return {
        title: left - parent.getBoundingClientRect().left - parseFloat(getComputedStyle(parent).paddingLeft),
        lead: element.querySelector('.lead')!.getBoundingClientRect().left - left,
        endDash: getComputedStyle(element.querySelector('.eyebrow')!, '::after').content,
      };
    });
    expect(Math.abs(offsets.title)).toBeLessThanOrEqual(1);
    expect(Math.abs(offsets.lead)).toBeLessThanOrEqual(1);
    expect(offsets.endDash).toBe('none');
  }
});

test('a staff-built page keeps section order, image focal points and mobile layout', async ({ page }) => {
  const header = await render('src/components/PageHeader.astro', { title: 'A new ministry page' });
  const body = await render('src/components/sections/Sections.astro', { list: [
    { _type: 'textSection', _key: 'first', heading: 'Welcome to the ministry' },
    { _type: 'textSection', _key: 'hidden', heading: 'An unpublished section', hidden: true },
    { _type: 'textPhotoSection', _key: 'second', heading: 'When we gather', photos: [
      { _key: 'photo', _sanityAsset: 'image@file://./public/images/fixture.jpg', alt: 'People gathering', hotspot: { x: 0.2, y: 0.3 } },
    ] },
    { _type: 'ctaBandSection', _key: 'contact', heading: 'Get in touch', buttons: [
      { kind: 'url', label: 'Ask about the ministry', url: 'mailto:fixture@example.com' },
    ] },
  ] });
  await page.route('**/images/fixture.jpg', (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#005291"/></svg>' }));
  await page.setContent(documentFor(header + body));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A new ministry page');
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['Welcome to the ministry', 'When we gather', 'Get in touch']);
  await expect(page.getByText('An unpublished section')).toHaveCount(0);
  await expect(page.getByAltText('People gathering')).toHaveCSS('object-position', '20% 30%');
  await expect(page.getByRole('link', { name: 'Ask about the ministry' })).toHaveAttribute('href', 'mailto:fixture@example.com');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
