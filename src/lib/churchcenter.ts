// Church Center's PUBLIC API — the same data any visitor already sees on Church Center,
// reached with NO Planning Center credentials:
//   1) POST https://{org}.churchcenter.com/sessions/tokens  -> anonymous org bearer (ort_…)
//   2) GET  https://api.churchcenter.com/{product}/v2/…     with that bearer
// It's an undocumented app API, so callers cache what they get (src/lib/cache.ts) and
// treat null as "unavailable". The token is reused for 5 minutes: Church Center's firewall
// starts refusing (HTTP 403) when it's asked for a fresh token on every request.

const ORG_SUB = 'chelseachurch.churchcenter.com';
const API = 'https://api.churchcenter.com';
const UA = 'ChelseaCommunityChurch-site/1.0';
const TOKEN_SECONDS = 5 * 60;

export const TZ = 'America/Chicago';

let token: { value: string; at: number } | null = null;
let tokenRequest: Promise<string | null> | null = null;

async function getToken(signal: AbortSignal): Promise<string | null> {
  if (token && Date.now() - token.at < TOKEN_SECONDS * 1000) return token.value;
  // Calendar and announcements load together. Share acquisition as well as the finished token.
  tokenRequest ??= (async () => {
    const res = await fetch(`https://${ORG_SUB}/sessions/tokens`, {
      // A short-lived caller must not cancel acquisition for the other callers.
      signal: AbortSignal.timeout(9000),
      method: 'POST',
      headers: { 'User-Agent': UA, 'Content-Type': 'application/json' },
    });
    if (!res.ok) return null;
    const value = (await res.json())?.data?.attributes?.token as string | undefined;
    if (!value) return null;
    token = { value, at: Date.now() };
    return value;
  })().finally(() => { tokenRequest = null; });
  const pending = tokenRequest;
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    pending.then(
      (value) => { signal.removeEventListener('abort', abort); resolve(value); },
      (error) => { signal.removeEventListener('abort', abort); reject(error); },
    );
  });
}

/** GET a Church Center API path (e.g. "/groups/v2/groups"): parsed JSON, or null on any failure. */
export async function ccGet(path: string, timeoutMs = 9000): Promise<any | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const bearer = await getToken(ctrl.signal);
    if (!bearer) return null;
    const res = await fetch(API + path, { signal: ctrl.signal, headers: { 'User-Agent': UA, Authorization: `Bearer ${bearer}` } });
    if (res.status === 401 && token?.value === bearer) token = null; // don't clear a newer token
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** YYYY-MM-DD in church-local time. */
export const localDate = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));

/** "7:00 PM" in church-local time. */
export const localTime = (iso: string) => new Date(iso).toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });

/** Strip HTML from Church Center rich-text fields. */
export const stripHtml = (s: string) =>
  (s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
