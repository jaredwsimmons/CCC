// Existing Sanity datasets do not change when migration.ts changes. This guarded,
// dry-run-by-default patch only replaces the exact old copy found in the review.
import { createClient } from '@sanity/client';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type Document = { _id: string; _rev?: string; [key: string]: unknown };
const ids = ['home', 'weeklyRhythm', 'siteSettings', 'page-imnew', 'page-missions', 'page-kids-students', 'page-serve'];
const copy: Record<string, string> = {
  'Two identical gatherings, with programming for kids and students at both hours.': 'Two identical worship gatherings, with Preschool and Kids programming at both hours. Student community groups meet at 9:00 AM.',
  'Preschool through high school meet at both Sunday services; students also gather Wednesday nights at 6 PM.': 'Preschool and Kids meet at both Sunday services. Middle and high school students meet at 9:00 AM on Sundays and 6:00 PM on Wednesdays.',
  'On months with a 5th Sunday, we cancel all age-graded ministries — Preschool through Students — and the whole church worships together.': 'On the fifth Sunday of the month only, Preschool through Students join the whole church for family worship instead of their usual age-graded programming.',
  'Programming for kids and students at both hours': 'Preschool and Kids at both hours; Students at 9:00 AM',
  '5th through 12th grade': 'Middle and high school',
  'Serving and praying over this ministry — reach out anytime.': 'Serving and praying over this ministry.',
  'Monthly missions highlight': 'Pray, give, and go',
  "This month's partner": 'Support our mission partners',
  "Each month, our Men's and Women's ministries sponsor one of our mission partners directly. Visit their pages to see who they're supporting this month and how you can be part of it.": 'Our church partners with local and global ministries through prayer, giving, and service. Explore our partners below, or contact Pastor Ben for current opportunities to get involved.',
};

export function contentCorrections(doc: Document): { set: Record<string, unknown>; unset: string[] } {
  const set: Record<string, unknown> = {};
  const unset: string[] = [];
  const id = doc._id.replace(/^drafts\./, '');
  if (!ids.includes(id)) return { set, unset };
  function walk(value: unknown, path: string) {
    if (typeof value === 'string') {
      if (copy[value]) set[path] = copy[value];
      if (id === 'home' && /^hero\.buttons\[\d+\]\.label$/.test(path) && value === 'Find your place') set[path] = 'Explore Ministries';
      if (id === 'page-serve' && ['title', 'header.title'].includes(path) && value === 'Serve') set[path] = 'Ministries';
    } else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (value && typeof value === 'object') for (const [key, v] of Object.entries(value)) {
      if (!key.startsWith('_')) walk(v, path ? `${path}.${key}` : key);
    }
  }
  walk(doc, '');
  if (id === 'weeklyRhythm') {
    const tiles = doc.tiles as { title?: string; time?: string; description?: string }[] | undefined;
    tiles?.forEach((tile, i) => {
      if (tile.title === 'Kids & Students' && tile.time === 'Both Sunday services'
        && tile.description && copy[tile.description]) set[`tiles[${i}].time`] = 'Sundays & Wednesdays';
    });
  }
  if (id === 'home') {
    const series = doc.currentSeries as { title?: string; buttons?: { kind?: string; url?: string }[] } | undefined;
    series?.buttons?.forEach((button, i) => {
      if (button.url?.includes('PLcnuF3joGnBHLhefAXRk4zswRf2Ti73Hx')) {
        set[`currentSeries.buttons[${i}].kind`] = 'page';
        set[`currentSeries.buttons[${i}].label`] = 'Watch & Listen';
        set[`currentSeries.buttons[${i}].page`] = { _type: 'reference', _ref: 'fixed-media' };
        unset.push(`currentSeries.buttons[${i}].url`);
      }
    });
    if (series?.title === 'Jesus Storyteller') {
      set['currentSeries.title'] = 'Gratitude';
      set['currentSeries.description'] = 'Join us for Gratitude, a four-week series beginning November 1, 2026, exploring how thankfulness shapes the way we see God and live each day. Worship with us Sunday at 9:00 or 10:30 AM.';
      set['currentSeries.expiresOn'] = '2026-11-28';
      // Do not reuse the old series art, or write local-only migration asset paths to Sanity.
      unset.push('currentSeries.image');
    }
  }
  return { set, unset };
}

async function main() {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error('Set PUBLIC_SANITY_PROJECT_ID in .env before running this script.');
  const apply = process.argv.includes('--apply');
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (apply && !token) throw new Error('Applying corrections requires SANITY_API_WRITE_TOKEN with editor access.');
  const client = createClient({ projectId, dataset: process.env.PUBLIC_SANITY_DATASET || 'production', apiVersion: '2024-10-01', useCdn: false, token, perspective: 'raw' });
  const documents = await client.fetch<Document[]>('*[_id in $ids]', { ids: ids.flatMap((id) => [id, `drafts.${id}`]) });
  for (const doc of documents) {
    const { set, unset } = contentCorrections(doc);
    const paths = [...Object.keys(set), ...unset];
    if (!paths.length) continue;
    console.log(`${apply ? 'Updating' : 'Would update'} ${doc._id}: ${paths.join(', ')}`);
    if (apply) {
      if (!doc._rev) throw new Error(`No revision returned for ${doc._id}; refusing an unguarded write.`);
      await client.patch(doc._id).ifRevisionId(doc._rev).set(set).unset(unset).commit();
    }
  }
  if (!apply) console.log('Dry run only. Review the field list, then pass --apply to write these exact-copy corrections.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
