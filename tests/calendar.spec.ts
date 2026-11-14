import { test, expect } from '@playwright/test';
import { buildMonthGrids, getUpcomingEvents, onePerSeries } from '../src/lib/calendar';
import { nameMatches } from '../src/lib/format';

// The calendar against a stand-in for Church Center's API, which lists every occurrence
// of a repeating event as its own item, sharing an event_group.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
});

const realFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = realFetch;
});

const day = (n: number) => new Date(Date.UTC(2099, 0, n, 18)).toISOString();
const event = (id: number, name: string, group: number, starts: string, recurrence = 'Every Thursday') => ({
  id: String(id),
  attributes: { name, event_group: group, starts_at: starts, ends_at: starts, recurring: recurrence !== 'Does not repeat', recurrence_description: recurrence },
});

/** Serves `pages` of events, and records the paths the calendar asked for. */
function churchCenter(...pages: { data: unknown[]; more?: boolean }[]) {
  const asked: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    if (url.includes('/sessions/tokens')) return Response.json({ data: { attributes: { token: 'test' } } });
    asked.push(url);
    const offset = Number(new URL(url).searchParams.get('offset') ?? 0);
    const page = pages[offset / 100] ?? { data: [] };
    return Response.json({ data: page.data, meta: page.more ? { next: { offset: offset + 100 } } : {} });
  }) as typeof fetch;
  return asked;
}

const study = [1, 8, 15, 22].map((d, i) => event(i + 1, "Men's Bible Study", 7, day(d)));

test('every occurrence of a repeating event reaches the month view', async () => {
  const asked = churchCenter({ data: study });
  const events = await getUpcomingEvents();
  expect(asked.join()).not.toContain('first_occurrence');
  expect(events.map((e) => e.date)).toEqual(['2099-01-01', '2099-01-08', '2099-01-15', '2099-01-22']);
  const days = buildMonthGrids(events)[0].weeks.flat().filter((c) => c?.events.length).map((c) => c!.day);
  expect(days).toEqual([1, 8, 15, 22]);
});

test('the list shows a repeating event once, at its next date', async () => {
  churchCenter({ data: [...study, event(9, 'Friendsgiving', 8, day(20), 'Does not repeat')] });
  const list = onePerSeries(await getUpcomingEvents());
  expect(list.map((e) => `${e.date} ${e.title}`)).toEqual(['2099-01-01 Men\'s Bible Study', '2099-01-20 Friendsgiving']);
});

test('a renamed occurrence stays in the list', async () => {
  churchCenter({ data: [event(1, 'C3SM', 7, day(1)), event(2, 'C3SM (Friendsgiving)', 7, day(8)), event(3, 'C3SM', 7, day(15))] });
  expect(onePerSeries(await getUpcomingEvents()).map((e) => e.title)).toEqual(['C3SM', 'C3SM (Friendsgiving)']);
});

test('a second page is read, and a month cut off by the end of the data is dropped', async () => {
  const asked = churchCenter({ data: study, more: true }, { data: [event(5, 'February event', 9, new Date(Date.UTC(2099, 1, 5, 18)).toISOString()), event(6, 'March event', 10, new Date(Date.UTC(2099, 2, 5, 18)).toISOString())], more: true });
  const titles = (await getUpcomingEvents()).map((e) => e.title);
  expect(asked).toHaveLength(2);
  expect(titles).toContain('February event');
  expect(titles).not.toContain('March event');
});

test('ministry pages find their events by the words in their names', () => {
  expect(nameMatches("Men's Bible Study", "Men's")).toBe(true);
  expect(nameMatches("Women's Ministry Christmas Party", "Men's")).toBe(false);
  expect(nameMatches('Women’s Christmas Party', "Women's")).toBe(true); // either apostrophe
  expect(nameMatches('K-5 Summer Camp', 'Kids, K-5')).toBe(true);
  expect(nameMatches('Prayer Gathering', 'Kids, K-5')).toBe(false);
  expect(nameMatches('Anything', '')).toBe(true);
});

test('the regular Sunday programs stay out, since the weekly tiles cover them', async () => {
  churchCenter({ data: [event(1, 'Worship Service', 7, day(4), 'Every Sunday'), event(2, 'Graduates Club', 8, day(4), 'The first Sunday of every month')] });
  expect((await getUpcomingEvents()).map((e) => e.title)).toEqual(['Graduates Club']);
});

test('a failed second page preserves events already fetched in the first month', async () => {
  churchCenter({ data: study, more: true });
  const fetchPage = globalThis.fetch;
  globalThis.fetch = (async (input, init) => String(input).includes('offset=100')
    ? new Response('Unavailable', { status: 503 })
    : fetchPage(input, init)) as typeof fetch;
  expect((await getUpcomingEvents()).map((e) => e.title)).toEqual(study.map(() => "Men's Bible Study"));
});
