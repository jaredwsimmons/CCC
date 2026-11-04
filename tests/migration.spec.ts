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
  const reserved = ['calendar', 'groups', 'media', 'give', 'leaders', 'api', 'home', 'history', 'bylaws'];
  const slugs = docs.filter((d) => d._type === 'page').map((d) => (d.slug as { current: string }).current);
  expect(new Set(slugs).size).toBe(slugs.length);
  expect(slugs.filter((s) => reserved.includes(s))).toEqual([]);
});
