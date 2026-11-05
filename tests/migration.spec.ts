import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { buildDocuments } from '../src/data/migration';

// The migrated documents must be valid for the Studio's schemas before they're imported:
// what `sanity schema validate` can't check without a project.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
});

const docs = buildDocuments();
const ids = new Set(docs.map((d) => d._id));

// Walk every value in a document, calling `visit` with each object and its path.
function walk(value: unknown, path: string, visit: (obj: Record<string, unknown>, path: string) => void) {
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (value && typeof value === 'object') {
    visit(value as Record<string, unknown>, path);
    for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, visit);
  }
}

test('every reference points to a migrated document', () => {
  const broken: string[] = [];
  for (const d of docs) walk(d, d._id, (o, p) => { if (o._type === 'reference' && !ids.has(o._ref as string)) broken.push(`${p} → ${o._ref}`); });
  expect(broken).toEqual([]);
});

test('every section is a type the Studio defines', () => {
  const dir = 'studio/schemaTypes/sections';
  const defined = readdirSync(dir)
    .filter((f) => f.endsWith('Section.ts'))
    .map((f) => readFileSync(`${dir}/${f}`, 'utf8').match(/name: '(\w+Section)'/)?.[1]);
  const used = docs.flatMap((d) => ((d.sections as { _type: string }[]) ?? []).map((s) => s._type));
  expect(used.filter((t) => !defined.includes(t))).toEqual([]);
});

test('every ministry page follows the template', () => {
  const ministries = ['connections', 'kids', 'men', 'missions', 'prayer', 'preschool', 'students', 'women', 'worship'];
  for (const slug of ministries) {
    const page = docs.find((d) => d._id === `page-${slug}`) as unknown as { header: { eyebrow: string }; sections: { _type: string; match?: string }[] };
    expect(page.header.eyebrow, slug).toBe('Ministries');
    const types = page.sections.map((s) => s._type);
    expect(types.slice(-2), slug).toEqual(['openRegistrationsSection', 'ctaBandSection']);
    expect(page.sections.at(-2)?.match, slug).toBeTruthy();
    expect(types.indexOf('scheduleSection'), slug).toBeLessThan(2);
  }
});

test('the current series and announcement belong to the Home page', () => {
  const home = docs.find((d) => d._id === 'home') as unknown as { currentSeries?: { title?: string } };
  expect(home.currentSeries?.title).toBeTruthy();
  expect(docs.find((d) => d._id === 'siteSettings')).not.toHaveProperty('currentSeries');
  for (const file of ['siteSettings.ts', 'home.ts']) {
    const declares = /name: 'announcement'/.test(readFileSync(`studio/schemaTypes/${file}`, 'utf8'));
    expect(declares, file).toBe(file === 'home.ts');
  }
});

test('the footer links are set in Site Settings', () => {
  const settings = docs.find((d) => d._id === 'siteSettings') as unknown as Record<string, { label?: string }[] & { label?: string; kind?: string }>;
  expect(settings.footerPrayer).toMatchObject({ kind: 'churchCenter' });
  expect(settings.footerConnect.map((l) => l.label)).toContain('Text updates');
  expect(settings.footerExplore.map((l) => l.label)).toContain('Bylaws');
});

test('the Bylaws keep every article and their lettered lists', () => {
  const page = docs.find((d) => d._id === 'page-bylaws') as unknown as { sections: { body: { style?: string; listItem?: string }[] }[] };
  const body = page.sections[0].body;
  expect(body.filter((b) => b.style === 'h2')).toHaveLength(13);
  expect(body.filter((b) => b.listItem === 'letter').length).toBeGreaterThan(0);
});

test('the fixed pages are built from sections staff can edit', () => {
  const types = (id: string) => ((docs.find((d) => d._id === id)?.sections as { _type: string }[]) ?? []).map((s) => s._type);
  expect(types('fixed-calendar')).toContain('calendarEventsSection');
  expect(types('fixed-groups')).toContain('groupsSection');
  expect(types('fixed-media')).toEqual(['latestMessageSection', 'recentVideosSection', 'podcastSection']);
  expect(types('fixed-leaders')).toEqual(['leadersSection', 'leadersSection', 'deaconsSection']);
});

test('people who have left the church are not mentioned', () => {
  expect(JSON.stringify(docs)).not.toMatch(/brian|marbury|herring|kipley/i);
});

test('every photo has alt text', () => {
  const missing: string[] = [];
  for (const d of docs) walk(d, d._id, (o, p) => { if (o._type === 'image' && !String(o.alt ?? '').trim()) missing.push(p); });
  expect(missing).toEqual([]);
});

test('list items have keys that are unique within their list', () => {
  const problems: string[] = [];
  for (const d of docs)
    walk(d, d._id, (o, p) => {
      for (const [k, v] of Object.entries(o)) {
        if (!Array.isArray(v) || !v.some((x) => x && typeof x === 'object')) continue;
        const keys = v.map((x) => (x as { _key?: string })._key);
        if (keys.some((x) => !x) || new Set(keys).size !== keys.length) problems.push(`${p}.${k}`);
      }
    });
  expect(problems).toEqual([]);
});

test('page addresses are unique and not taken by the site', () => {
  const reserved = ['calendar', 'groups', 'media', 'give', 'leaders', 'api', 'home', 'history', 'our-story', 'beliefs'];
  const slugs = docs.filter((d) => d._type === 'page').map((d) => (d.slug as { current: string }).current);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect(slugs.filter((s) => reserved.includes(s))).toEqual([]);
});
