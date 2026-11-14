// Connection preflight. Reports names/status only, never credentials or document copy.
import { createClient } from '@sanity/client';

const required = ['PUBLIC_SANITY_PROJECT_ID', 'PUBLIC_SANITY_STUDIO_URL', 'SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_PREVIEW_URL', 'SANITY_API_READ_TOKEN'];
const missing = required.filter((key) => !process.env[key]?.trim());
for (const key of missing) console.error(`Missing: ${key}`);
if (missing.length) process.exitCode = 1;
else {
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID!;
  const dataset = process.env.PUBLIC_SANITY_DATASET || 'production';
  if (projectId !== process.env.SANITY_STUDIO_PROJECT_ID || dataset !== (process.env.SANITY_STUDIO_DATASET || 'production')) {
    console.error('Website and Studio project/dataset do not match.');
    process.exitCode = 1;
  } else {
    try {
      for (const key of ['PUBLIC_SANITY_STUDIO_URL', 'SANITY_STUDIO_PREVIEW_URL']) {
        const url = new URL(process.env[key]!);
        if (url.protocol !== 'https:' && url.hostname !== 'localhost') throw new Error(`${key} must use HTTPS outside localhost.`);
      }
      const client = createClient({ projectId, dataset, apiVersion: '2025-02-19', useCdn: false, perspective: 'published' });
      const ids = ['siteSettings', 'home', 'weeklyRhythm', 'fixed-calendar', 'fixed-groups', 'fixed-media', 'fixed-give', 'fixed-leaders'];
      const present = await client.fetch<string[]>('*[_id in $ids]._id', { ids });
      const absent = ids.filter((id) => !present.includes(id));
      if (absent.length) throw new Error(`Required published documents missing: ${absent.join(', ')}`);
      await client.withConfig({ token: process.env.SANITY_API_READ_TOKEN, perspective: 'drafts' }).fetch('count(*[_type == "page"])');
      console.log('Project/dataset match; required public documents and authenticated reading passed.');
      console.log('Still verify Studio login, account permissions, browser draft isolation, CORS and publishing on the connected staging site. This check does not certify the staff handoff.');
    } catch {
      console.error('CMS preflight failed. Check project/dataset, required published documents, HTTPS addresses and read-token permissions.');
      process.exitCode = 1;
    }
  }
}
