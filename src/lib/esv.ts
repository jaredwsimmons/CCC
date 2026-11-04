// ESV passage lookups for the scripture tooltips.
// - Reads the church's ESV API key from astro:env (server secret, OPTIONAL).
// - Pages never call the ESV API while rendering: the tooltip asks /api/esv for a
//   verse the first time someone hovers or taps it, and each passage is cached at
//   the edge for 30 days (src/lib/cache.ts). Rendering a page fetching every verse
//   would exceed a free Workers request's 50 subrequests on Bylaws (~27 passages).
// - NEVER throws: if the key is missing or a fetch fails, returns null and the
//   reference stays plain text.
//
// ESV text © Crossway; used per the api.esv.org terms. Required attribution is shown
// on-page (see the Beliefs page). Server-only — do not import into client code.
import { ESV_API_KEY } from 'astro:env/server';
import { cached } from './cache';

/** Whether scripture references should be interactive (an ESV key is configured). */
export const hasEsvKey = (): boolean => Boolean(ESV_API_KEY);

// Clean, tooltip-friendly text: no verse numbers, footnotes, headings, or copyright line.
const PARAMS = new URLSearchParams({
  'include-passage-references': 'false',
  'include-verse-numbers': 'false',
  'include-first-verse-numbers': 'false',
  'include-footnotes': 'false',
  'include-headings': 'false',
  'include-short-copyright': 'false',
  'include-passage-horizontal-lines': 'false',
  'include-heading-horizontal-lines': 'false',
  'indent-paragraphs': '0',
});

async function fetchESV(ref: string): Promise<string | null> {
  if (!ESV_API_KEY) return null;
  try {
    const url = `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(ref.replace(/[–—]/g, '-'))}&${PARAMS.toString()}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Authorization: `Token ${ESV_API_KEY}` },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const data = (await res.json()) as { passages?: string[] };
    const text = (data?.passages?.[0] ?? '').replace(/\s+/g, ' ').trim();
    return text || null;
  } catch {
    return null;
  }
}

/** ESV text for a reference, or null (missing key / bad ref / offline). Cached 30 days. */
export async function getPassage(ref: string): Promise<string | null> {
  const key = ref.trim();
  if (!key || !ESV_API_KEY) return null;
  return cached(`esv:${key}`, 30 * 24 * 60 * 60, () => fetchESV(key));
}

/** Split a "ref; ref; ref" string (as stored in content.ts) into individual references. */
export function splitRefs(refs: string): string[] {
  return refs
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

// --- Scripture reference detection (for auto-tagging prose) ---
// Conservative: a book name + chapter:verse (or a chapter range), with an optional
// numeral prefix (1/2/3 or I/II/III). A colon or chapter-range is REQUIRED, so bare
// numbers ("John 15 people") and clock times ("9:00 AM") never match.
const BOOK_LIST = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  'Samuel', 'Kings', 'Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Psalm',
  'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations',
  'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', 'Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', 'Thessalonians', 'Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', 'Peter', 'Jude', 'Revelation',
  // abbreviations that appear in the bylaws
  'Matt', 'Rom', 'Cor', 'Gal', 'Eph', 'Phil', 'Col', 'Thess', 'Tim', 'Heb', 'Pet', 'Rev',
];
// Longest names first so "Corinthians" beats "Cor", "Philippians" beats "Phil", etc.
const bookAlt = [...BOOK_LIST].sort((a, b) => b.length - a.length).join('|');
const REF_RE = new RegExp(
  '\\b(?:(?:[123]|I{1,3})\\s+)?(?:' + bookAlt + ')\\.?\\s+' +
    '(?:\\d+:\\d+(?:[-–]\\d+)?|\\d+[-–]\\d+)' +
    '(?:,\\s*\\d+(?::\\d+(?:[-–]\\d+)?)?)*[ab]?',
  'g',
);

export type RefPart = { t: 'text' | 'ref'; v: string };

/** Tokenize prose into alternating plain-text and scripture-reference parts. */
export function findRefs(text: string): RefPart[] {
  const out: RefPart[] = [];
  let last = 0;
  REF_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = REF_RE.exec(text)) !== null) {
    if (m.index > last) out.push({ t: 'text', v: text.slice(last, m.index) });
    out.push({ t: 'ref', v: m[0] });
    last = m.index + m[0].length;
    if (m[0].length === 0) REF_RE.lastIndex++; // guard against zero-width matches
  }
  if (last < text.length) out.push({ t: 'text', v: text.slice(last) });
  return out;
}
