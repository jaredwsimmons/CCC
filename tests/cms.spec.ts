import { test, expect } from '@playwright/test';
import { render } from './render';
import { parse, evaluate } from 'groq-js';
import { homeQuery, pageQuery, settingsQuery } from '../src/lib/queries';
import { buildDocuments } from '../src/data/migration';
import { validAddress, addressIsUnique } from '../studio/lib/page-address';
import { validateSectionHeading } from '../studio/lib/section-validation';
import { clickToEdit } from '../src/lib/preview';
import { readFileSync, readdirSync } from 'node:fs';
import { buttonLink } from '../src/lib/links';
import { churchCenterHost, churchCenterUrl, podcastFeedUrl } from '../src/lib/integrations';
import { staffCmsDefaults } from '../scripts/upgrade-staff-cms';
import { ccGet } from '../src/lib/churchcenter';
import { getPodcastEpisodes } from '../src/lib/feeds';

async function query(source: string, documents: unknown[], params: Record<string, unknown> = {}) {
  return (await evaluate(parse(source), { dataset: documents, params })).get();
}

test('page-header photos honor the focal point selected by staff', async () => {
  const html = await render('src/components/PageHeader.astro', { title: 'Our ministry', header: {
    image: { _sanityAsset: 'image@file://./public/images/example.jpg', alt: 'Our church family', hotspot: { x: 0.2, y: 0.3 } },
  } });
  expect(html).toContain('object-position: 20% 30%');
});

test('staff can hide sections without deleting them and visible sections retain their order', async () => {
  const html = await render('src/components/sections/Sections.astro', { list: [
    { _type: 'textSection', _key: 'first', heading: 'First visible' },
    { _type: 'textSection', _key: 'hidden', heading: 'Hidden content', hidden: true },
    { _type: 'textSection', _key: 'last', heading: 'Last visible', hidden: false },
  ] });
  expect(html).not.toContain('Hidden content');
  expect(html.indexOf('First visible')).toBeLessThan(html.indexOf('Last visible'));
});

test('the header renders a staff-selected branding asset', async () => {
  const html = await render('src/components/Header.astro', { menu: [], churchName: 'Chelsea', branding: {
    headerLogo: { _sanityAsset: 'image@file://./public/images/updated-logo.png', alt: 'Chelsea logo' },
  } });
  expect(html).toContain('/images/updated-logo.png');
});

test('homepage sections can be replaced and reordered without losing button references', async () => {
  const docs = buildDocuments();
  const home = docs.find((d) => d._id === 'home')!;
  home.sections = [{ _type: 'textSection', _key: 'campaign', heading: 'A staff campaign', buttons: [
    { _type: 'button', _key: 'go', kind: 'page', label: 'Explore', page: { _type: 'reference', _ref: 'page-men' } },
  ] }, { _type: 'homeHighlightsSection', _key: 'message' }];
  const result = await query(homeQuery, docs);
  expect(result.sections[0].buttons[0].page.slug).toBe('men');
  expect(result.sections.map((s: any) => s._key)).toEqual(['campaign', 'message']);
  home.sections = [];
  expect((await query(homeQuery, docs)).sections).toEqual([]);
});

test('homepage edits render with its video disabled and a custom section', async () => {
  const docs = buildDocuments();
  const home = docs.find((d) => d._id === 'home')!;
  (home.hero as any).showVideo = false;
  home.sections = [{ _type: 'textSection', _key: 'campaign', heading: 'Staff campaign headline' }];
  const html = await render('src/pages/index.astro', {}, docs);
  expect(html).toContain('Staff campaign headline');
  expect(html).not.toMatch(/<video\b/);
  expect(html).not.toContain('This week at Chelsea');
});

test('leader biographies and email addresses survive both query and rendering', async () => {
  const docs = [{ _id: 'leader-fixture', _type: 'leader', name: 'Staff fixture', role: 'Ministry leader', group: 'staff', bio: 'A staff-written biography.', email: 'fixture@example.com', order: 1 }];
  const html = await render('src/components/sections/LeadersSection.astro', { s: { heading: 'Our staff' } }, docs);
  expect(html).toContain('A staff-written biography.');
  expect(html).toContain('mailto:fixture@example.com');
});

test('old addresses resolve directly to the current page while current routes take priority', async () => {
  const docs = [{ _id: 'page-fixture', _type: 'page', title: 'New page', slug: { current: 'new-page' }, previousSlugs: ['old-page', 'older-page'] }];
  for (const slug of ['new-page', 'old-page', 'older-page']) expect((await query(pageQuery, docs, { slug })).slug).toBe('new-page');
  expect(await query(pageQuery, docs, { slug: 'missing-page' })).toBeNull();
  expect((await query(pageQuery, [...docs, { _id: 'page-conflict', _type: 'page', title: 'Current', slug: { current: 'old-page' } }], { slug: 'old-page' })).slug).toBe('old-page');
});

test('page address validation protects fixed routes and checks other pages and aliases', async () => {
  for (const value of ['404', 'api', 'calendar', 'serve', '../page', 'two words', 'Uppercase', 'x'.repeat(97)]) expect(validAddress(value), value).not.toBe(true);
  expect(validAddress('vbs-2027')).toBe(true);
  let parameters: any;
  const context = { document: { _id: 'drafts.page-fixture' }, getClient: () => ({ withConfig: () => ({ fetch: async (_query: string, params: any) => { parameters = params; return false; } }) }) };
  expect(await addressIsUnique('existing-page', context)).toBe(false);
  expect(parameters).toEqual({ id: 'page-fixture', value: 'existing-page' });
});

test('all approved section types have renderers and migrated headings meet editor validation', () => {
  const renderers = readFileSync('src/components/sections/Sections.astro', 'utf8');
  const names = readdirSync('studio/schemaTypes/sections').filter((f) => f.endsWith('Section.ts')).map((f) => readFileSync(`studio/schemaTypes/sections/${f}`, 'utf8').match(/name: '(\w+)'/)![1]);
  for (const name of [...names, 'homeWeekSection', 'homeAnnouncementsSection', 'homeHighlightsSection']) expect(renderers).toContain(`${name}:`);
  for (const doc of buildDocuments()) for (const section of (doc.sections ?? []) as any[]) expect(validateSectionHeading(section), `${doc._id}: ${section._type}`).toBe(true);
  expect(validateSectionHeading({ _type: 'cardsSection' })).not.toBe(true);
  expect(validateSectionHeading({ _type: 'textSection', body: [{ style: 'h4' }] })).not.toBe(true);
});

test('source settings change rendered giving links and reject unsafe source addresses', async () => {
  const docs = buildDocuments();
  const settings = docs.find((d) => d._id === 'siteSettings')!;
  (settings.integrations as any).givingBase = 'https://fixture.churchcenter.com/giving';
  settings.giveButton = { _type: 'button', kind: 'give', label: 'Give', fund: 'new-fund' };
  const result = await query(settingsQuery, docs);
  expect(buttonLink(result.giveButton)?.href).toContain('https://fixture.churchcenter.com/giving/to/new-fund');
  expect(buttonLink({ kind: 'give', fund: '../unsafe' })).toBeNull();
  expect(churchCenterHost('127.0.0.1')).toBe('chelseachurch.churchcenter.com');
  expect(churchCenterUrl('https://churchcenter.com.evil.example/giving')).toBeNull();
  expect(podcastFeedUrl('http://127.0.0.1/private')).toBeNull();
  expect(podcastFeedUrl('https://anchor.fm/s/fixture/podcast/rss')).toBeTruthy();
});

test('new wording and video labels support click-to-edit without marking configuration', () => {
  expect(clickToEdit({ sourcePath: ['sections', 0, 'videoLabels', 1] })).toBe(true);
  expect(clickToEdit({ sourcePath: ['wording', 'registerLabel'] })).toBe(true);
  for (const field of ['churchCenterHost', 'podcastFeed', 'youtubeChannelId', 'previousSlugs', 'hidden']) expect(clickToEdit({ sourcePath: [field] })).toBe(false);
});

test('the CMS upgrade initializes old Home documents and preserves staff choices', () => {
  const changes = staffCmsDefaults({ _id: 'drafts.home', hero: {} });
  expect(changes.sections).toHaveLength(3);
  expect(changes['hero.showVideo']).toBe(true);
  expect(staffCmsDefaults({ _id: 'home', sections: [], hero: { showVideo: false } })).toEqual({});
  expect(staffCmsDefaults({ _id: 'page-men' })).toEqual({});
});

test('unpublished or missing navigation references do not become misleading home links', async () => {
  const docs = buildDocuments();
  docs.find((d) => d._id === 'siteSettings')!.menu = [{ _key: 'missing', label: 'Unpublished destination', page: { _type: 'reference', _ref: 'missing-page' } }];
  const html = await render('src/layouts/Base.astro', {}, docs);
  expect(html).not.toContain('Unpublished destination');
});

test('source connection changes use the right Church Center organization and podcast feed', async () => {
  const original = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    requested.push(url);
    if (url.includes('/sessions/tokens')) return Response.json({ data: { attributes: { token: new URL(url).hostname } } });
    if (url.includes('/podcast/rss')) return new Response('<rss><channel><item><title>A configured feed</title></item></channel></rss>');
    return Response.json({ source: new Headers(init?.headers).get('Authorization') });
  }) as typeof fetch;
  try {
    const result = await Promise.all([
      ccGet('/groups/v2/groups', 9000, 'cms-alpha.churchcenter.com'),
      ccGet('/groups/v2/groups', 9000, 'cms-beta.churchcenter.com'),
    ]);
    expect(result).toEqual([{ source: 'Bearer cms-alpha.churchcenter.com' }, { source: 'Bearer cms-beta.churchcenter.com' }]);
    expect((await getPodcastEpisodes(1, 'https://anchor.fm/s/cms-fixture/podcast/rss'))[0].title).toBe('A configured feed');
    expect(requested).toContain('https://anchor.fm/s/cms-fixture/podcast/rss');
  } finally { globalThis.fetch = original; }
});
