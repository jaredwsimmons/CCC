import { test, expect } from '@playwright/test';
import { render } from './render';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('one-off calendar events expose a machine-readable full date', async () => {
  const html = await render('src/components/EventList.astro', { events: [
    { id: '1', title: 'Newcomer Lunch', date: '2099-01-12', timeLabel: 'Noon' },
  ] });
  expect(html).toMatch(/<time\b[^>]*datetime="2099-01-12"/);
  expect(html).toContain('Jan 12, 2099');
});

test('a full event never promises an unverified waitlist', async () => {
  const html = await render('src/components/RegistrationCard.astro', { reg: {
    id: '1', name: 'Camp', full: true, open: true, url: 'https://chelseachurch.churchcenter.com/registrations/events/1',
  } });
  expect(html).not.toContain('Join the waitlist');
  expect(html).toContain('View registration details');
});

test('a podcast message uses its episode link without presenting a channel as the same video', async () => {
  const html = await render('src/components/LatestMessage.astro', {
    message: { title: 'Message A', date: null, link: 'https://example.com/message-a', audioUrl: 'https://example.com/a.mp3' },
    watchLabel: 'Watch on YouTube', watchUrl: 'https://www.youtube.com/@chelsea_community_church', listenLabel: 'Listen',
  });
  expect(html).toContain('https://example.com/message-a');
  expect(html).not.toContain('Watch on YouTube');
});

test('filtering one group section leaves another section alone', () => {
  const button = (key: string) => ({
    key, selected: key === 'all', callback: () => {},
    getAttribute() { return key; }, setAttribute(_k: string, v: string) { this.selected = v === 'true'; },
    classList: { toggle() {} }, addEventListener(_e: string, f: () => void) { this.callback = f; },
  });
  const card = (type: string) => ({ hidden: false, style: { display: '' }, getAttribute: () => type });
  const a = { buttons: [button('all'), button('Community Groups')], cards: [card('Community Groups')], dataset: {}, querySelector: () => ({ hidden: true }) };
  const b = { buttons: [button('all'), button("Women's Groups")], cards: [card("Women's Groups")], dataset: {}, querySelector: () => ({ hidden: true }) };
  for (const root of [a, b]) Object.assign(root, { querySelectorAll: (s: string) => s === '[data-filter]' ? root.buttons : root.cards });
  const source = readFileSync('src/components/sections/GroupsSection.astro', 'utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)![1];
  vm.runInNewContext(source, { document: { querySelectorAll: (s: string) => s === '[data-group-section]' ? [a, b] : s === '[data-filter]' ? [...a.buttons, ...b.buttons] : [...a.cards, ...b.cards] } });
  a.buttons[1].callback();
  expect(b.buttons[0].selected).toBe(true);
  expect(b.cards[0].hidden).toBe(false);
  expect(b.cards[0].style.display).toBe('');
});

test('the homepage links the displayed podcast to its episode rather than an old series playlist', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async (input) => String(input).includes('/podcast/rss')
    ? new Response('<rss><channel><item><title>Current message fixture</title><description>John 3:16</description><pubDate>Sun, 08 Nov 2026 15:00:00 GMT</pubDate><link>https://example.com/current-message</link><enclosure url="https://example.com/audio.mp3" /></item></channel></rss>')
    : new Response('Unavailable', { status: 503 })) as typeof fetch;
  try {
    const html = await render('src/pages/index.astro');
    expect(html).toContain('Current message fixture');
    expect(html).toMatch(/href="https:\/\/example.com\/current-message"[^>]*>Listen to this message/);
    expect(html).not.toContain('PLcnuF3joGnBHLhefAXRk4zswRf2Ti73Hx');
  } finally { globalThis.fetch = realFetch; }
});

test('group and calendar outages do not claim there are no items', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response('Unavailable', { status: 503 })) as typeof fetch;
  try {
    const groups = await render('src/components/sections/GroupsSection.astro', { s: { heading: 'Groups' } });
    const calendar = await render('src/components/sections/CalendarEventsSection.astro', { s: { heading: 'Events' } });
    expect(groups).toContain('We could not load groups right now.');
    expect(groups).toContain('/groups');
    expect(calendar).toContain('We could not load the calendar right now.');
  } finally { globalThis.fetch = realFetch; }
});
