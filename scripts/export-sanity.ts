// Writes today's content as Sanity documents for `sanity dataset import` (see README).
//   npm run export:sanity  →  migration/dataset.ndjson
// Photo paths are made absolute so the import can upload them from public/images.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildDocuments } from '../src/data/migration';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'migration/dataset.ndjson');

const docs = buildDocuments();
const lines = docs.map((doc) =>
  JSON.stringify(doc, (key, value) =>
    key === '_sanityAsset' && typeof value === 'string'
      ? value.replace(/file:\/\/\.\/(.+)$/, (_, rel: string) => pathToFileURL(resolve(root, rel)).href)
      : value,
  ),
);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join('\n') + '\n');

const counts = docs.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d._type]: (acc[d._type] ?? 0) + 1 }), {});
console.log(`Wrote ${docs.length} documents to ${out}`);
console.log(counts);
