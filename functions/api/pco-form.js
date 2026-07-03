/**
 * Cloudflare Pages Function — POST /api/pco-form
 *
 * Receives a submission from the site's custom prayer / plan-a-visit forms and
 * writes it into Planning Center People, so the church keeps everything in one
 * place (same as a Church Center form submission) but with an on-brand UI.
 *
 * This lives in /functions and deploys automatically with Cloudflare Pages —
 * it does NOT require the Astro Cloudflare adapter, so the site stays a static
 * build. It only runs in production (or `wrangler pages dev`), not in the plain
 * static `npm run preview`; the form degrades gracefully there.
 *
 * ── SETUP (once you have a Personal Access Token) ──────────────────────────
 * 1. In Cloudflare Pages → Settings → Environment variables, add (encrypted):
 *      PCO_APP_ID   = <Application ID>
 *      PCO_SECRET   = <Secret>
 * 2. Resolve the field IDs for each form (needs the token), then fill FIELD_MAP
 *    below. Get them with:
 *      curl -u $PCO_APP_ID:$PCO_SECRET \
 *        https://api.planningcenteronline.com/people/v2/forms/876492/fields
 *    (876492 = prayer form, 869246 = plan-a-visit form)
 * 3. Deploy. Done.
 * ───────────────────────────────────────────────────────────────────────────
 */

const PCO_API = 'https://api.planningcenteronline.com/people/v2';

// formType (from the site form) → Church Center People form id
const FORM_IDS = {
  prayer: '876492',
  visit: '869246',
};

// TODO(token): map each posted field name → the PCO form's field id.
// Fill these once `GET /forms/{id}/fields` is run with the token (step 2 above).
const FIELD_MAP = {
  prayer: {
    // name:  'FIELD_ID',
    // email: 'FIELD_ID',
    // phone: 'FIELD_ID',
    // request: 'FIELD_ID',
  },
  visit: {
    // name:  'FIELD_ID',
    // email: 'FIELD_ID',
    // phone: 'FIELD_ID',
    // message: 'FIELD_ID',
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Spam: honeypot is stripped client-side, but double-check here too.
  if (data.company) return json({ ok: true }); // silently accept bots

  const formType = data.formType;
  const formId = FORM_IDS[formType];
  if (!formId) return json({ error: 'Unknown form.' }, 400);

  if (!env.PCO_APP_ID || !env.PCO_SECRET) {
    // Not wired yet — tell the client so it shows the Church Center fallback.
    return json({ error: 'Form not configured yet.' }, 503);
  }

  const auth = 'Basic ' + btoa(`${env.PCO_APP_ID}:${env.PCO_SECRET}`);
  const map = FIELD_MAP[formType] || {};

  // Build the PCO form-submission field_data from whatever fields were posted.
  const field_data = Object.entries(map)
    .filter(([key]) => data[key])
    .map(([key, fieldId]) => ({ field_id: fieldId, value: String(data[key]) }));

  if (field_data.length === 0) {
    // FIELD_MAP not filled in yet → don't pretend it worked.
    return json({ error: 'Form field mapping not configured yet.' }, 503);
  }

  try {
    const res = await fetch(`${PCO_API}/forms/${formId}/form_submissions`, {
      method: 'POST',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
        'User-Agent': 'ChelseaCommunityChurch-site/1.0',
      },
      body: JSON.stringify({ data: { attributes: { field_data } } }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return json({ error: 'Planning Center rejected the submission.', detail }, 502);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ error: 'Could not reach Planning Center.' }, 502);
  }
}
