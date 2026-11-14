// Initialize new editing controls without overwriting existing staff content.
import { createClient } from '@sanity/client';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultHomeSections } from '../src/lib/home';

export function staffCmsDefaults(doc: { _id: string; [key: string]: any }): Record<string, unknown> {
  if (doc._id.replace(/^drafts\./, '') !== 'home') return {};
  return {
    ...(doc.sections == null ? { sections: defaultHomeSections } : {}),
    ...(doc.hero && doc.hero.showVideo == null ? { 'hero.showVideo': true } : {}),
  };
}

async function main() {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
  if (!projectId) throw new Error('Set PUBLIC_SANITY_PROJECT_ID before running the CMS upgrade.');
  const apply = process.argv.includes('--apply');
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (apply && !token) throw new Error('Applying the CMS upgrade requires SANITY_API_WRITE_TOKEN with editor access.');
  const client = createClient({ projectId, dataset: process.env.PUBLIC_SANITY_DATASET || 'production', apiVersion: '2025-02-19', useCdn: false, perspective: 'raw', token });
  const docs = await client.fetch<any[]>('*[_id in ["home", "drafts.home"]]');
  if (!docs.length) throw new Error('No Home document found. Inspect the dataset before importing or upgrading content.');
  for (const doc of docs) {
    const set = staffCmsDefaults(doc);
    if (!Object.keys(set).length) continue;
    console.log(`${apply ? 'Initializing' : 'Would initialize'} ${doc._id}: ${Object.keys(set).join(', ')}`);
    if (apply) {
      if (!doc._rev) throw new Error('No revision returned; refusing an unguarded content change.');
      await client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit();
    }
  }
  if (!apply) console.log('Dry run only. Export a backup and review these fields before using --apply.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
