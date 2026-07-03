// Introspect the Planning Center People forms to get their field IDs, so we can
// fill FIELD_MAP in functions/api/pco-form.js. Reads the token from .dev.vars and
// prints ONLY the form/field ids + labels — never the secret.
//
//   node scripts/pco-fields.mjs
import { readFileSync } from 'node:fs';

const FORMS = { prayer: '876492', visit: '869246' };

function loadDevVars() {
  const out = {};
  try {
    for (const line of readFileSync(new URL('../.dev.vars', import.meta.url), 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/);
      if (m) out[m[1]] = m[2];
    }
  } catch {}
  return out;
}

const { PCO_APP_ID, PCO_SECRET } = loadDevVars();
if (!PCO_APP_ID || !PCO_SECRET || PCO_APP_ID.startsWith('your-')) {
  console.error('✗ Put your real values in .dev.vars first (PCO_APP_ID / PCO_SECRET).');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${PCO_APP_ID}:${PCO_SECRET}`).toString('base64');

for (const [key, id] of Object.entries(FORMS)) {
  const url = `https://api.planningcenteronline.com/people/v2/forms/${id}/fields`;
  const res = await fetch(url, { headers: { Authorization: auth, 'User-Agent': 'ccc-site/1.0' } });
  if (!res.ok) {
    console.error(`✗ ${key} (${id}): HTTP ${res.status} — ${await res.text()}`);
    continue;
  }
  const body = await res.json();
  console.log(`\n=== ${key}  (form ${id}) ===`);
  for (const f of body.data ?? []) {
    const a = f.attributes ?? {};
    console.log(`  ${f.id}  ·  "${a.label}"  [${a.field_type ?? a.type ?? '?'}]`);
  }
}
console.log('\nMap each posted field name -> the field id above, in functions/api/pco-form.js FIELD_MAP.');
