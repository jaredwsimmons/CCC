// The Studio's Live Preview. Opening it proves who you are to Sanity, and the site then
// sets a signed cookie that unlocks unpublished drafts. The cookie is signed with the
// server's read token, so a made-up cookie shows the public site, never a draft.
// No Astro imports here, so tests can load this file directly.

export const PREVIEW_COOKIE = 'ccc-preview';
export const PREVIEW_SECONDS = 8 * 60 * 60; // about a working day of editing

const encoder = new TextEncoder();

const hmacKey = (secret: string) =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);

/** The cookie's value: when it expires, and a signature over that. */
export async function signPreview(secret: string, now = Date.now()): Promise<string> {
  const expires = String(now + PREVIEW_SECONDS * 1000);
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(secret), encoder.encode(expires));
  const hex = [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${expires}.${hex}`;
}

export async function verifyPreview(value: string, secret: string, now = Date.now()): Promise<boolean> {
  const [expires, hex, extra] = value.split('.');
  if (extra !== undefined || !/^\d+$/.test(expires ?? '') || !/^[0-9a-f]{64}$/.test(hex ?? '')) return false;
  if (Number(expires) <= now) return false;
  const signature = Uint8Array.from(hex.match(/../g)!, (b) => parseInt(b, 16));
  return crypto.subtle.verify('HMAC', await hmacKey(secret), signature, encoder.encode(expires));
}

// Click-to-edit works by hiding invisible characters inside text, which would break any
// code that compares or parses that text. So only these display-only fields are marked:
// never choices (background, kind, photoSide), web addresses, emails or phone numbers.
const CLICK_TO_EDIT = new Set([
  'announcement', 'bio', 'cardTitle', 'category', 'closing', 'deaconCardText', 'description', 'directionsLabel', 'eyebrow',
  'footerConnectHeading', 'footerEmailText', 'footerTouchHeading', 'heading', 'intro', 'label', 'listenLabel',
  'location', 'name', 'place', 'reference', 'role', 'subline', 'sundayLabel', 'text', 'time', 'title', 'watchLabel', 'what',
]);

export const clickToEdit = ({ sourcePath }: { sourcePath: readonly unknown[] }): boolean =>
  CLICK_TO_EDIT.has(String(sourcePath.at(-1)));
