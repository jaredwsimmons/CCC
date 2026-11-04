import type { APIRoute } from 'astro';
import { findRefs, getPassage } from '../../lib/esv';

// GET /api/esv?ref=John%203:16 → { text } for the scripture tooltips (ScriptureRef.astro).
// Only a string that is exactly one scripture reference is looked up, so the church's
// ESV quota can't be spent on arbitrary queries. Passages are cached in src/lib/esv.ts.
export const GET: APIRoute = async ({ url }) => {
  const ref = (url.searchParams.get('ref') ?? '').trim();
  const parts = ref.length <= 60 ? findRefs(ref) : [];
  if (parts.length !== 1 || parts[0].t !== 'ref' || parts[0].v !== ref) {
    return Response.json({ error: 'Not a scripture reference.' }, { status: 400 });
  }
  const text = await getPassage(ref);
  if (!text) return Response.json({ error: 'Passage unavailable.' }, { status: 404 });
  return Response.json({ text }, { headers: { 'Cache-Control': 'public, max-age=86400' } });
};
