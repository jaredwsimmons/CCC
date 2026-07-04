// Groups data layer — LIVE from Church Center's PUBLIC groups API (no token),
// the same feed the church publishes for people to browse/join. Fetched at
// build time; full (enrollment closed) groups are hidden per request, sorted
// by meeting day/time (Mon→Sun), with a graceful fallback.

const ORG_SUB = 'chelseachurch.churchcenter.com';
const CC_API = 'https://api.churchcenter.com/groups/v2';
const UA = 'ChelseaCommunityChurch-site/1.0';

export interface Group {
  name: string;
  type: string; // "Community Groups" | "Women's Groups" | "Ministry Groups"
  schedule?: string;
  description?: string;
  image?: string;
  joinUrl: string;
  sortKey: number;
}

const TYPE_LABEL: Record<string, string> = {
  'community-groups': 'Community Groups',
  'women-s-groups': "Women's Groups",
  'ministry-groups': 'Ministry Groups',
};
export const TYPES = ['Community Groups', "Women's Groups", 'Ministry Groups'];

const DAY_ORDER: Record<string, number> = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 7,
};

const stripHtml = (s: string) =>
  (s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function typeFromUrl(url: string): string {
  const m = (url || '').match(/\/groups\/([^/]+)\//);
  return (m && TYPE_LABEL[m[1]]) || 'Groups';
}

// Sort Mon→Sun, then by start time. Groups with no parseable day sort last.
function sortKey(schedule?: string): number {
  if (!schedule) return 8 * 10000;
  const s = schedule.toLowerCase();
  let day = 8;
  for (const [name, idx] of Object.entries(DAY_ORDER)) if (s.includes(name)) { day = idx; break; }
  let mins = 9999;
  const m = s.match(/from\s+(\d{1,2})(?::(\d{2}))?\s*[–\-]?\s*(?:to)?\s*\d{1,2}(?::\d{2})?\s*(am|pm)/);
  if (m) {
    let h = parseInt(m[1], 10);
    const min = m[2] ? parseInt(m[2], 10) : 0;
    if (m[3] === 'pm' && h !== 12) h += 12;
    if (m[3] === 'am' && h === 12) h = 0;
    mins = h * 60 + min;
  }
  return day * 10000 + mins;
}

async function fetchLive(timeoutMs = 9000): Promise<Group[]> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const opts = { signal: ctrl.signal, headers: { 'User-Agent': UA } };

    const tokRes = await fetch(`https://${ORG_SUB}/sessions/tokens`, { ...opts, method: 'POST', headers: { ...opts.headers, 'Content-Type': 'application/json' } });
    if (!tokRes.ok) { clearTimeout(t); return []; }
    const token = (await tokRes.json())?.data?.attributes?.token;
    if (!token) { clearTimeout(t); return []; }

    const res = await fetch(`${CC_API}/groups?per_page=100`, { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${token}` } });
    clearTimeout(t);
    if (!res.ok) return [];
    const body = await res.json();

    return (body.data ?? [])
      .filter((g: any) => g.attributes?.enrollment_open !== false) // hide full/closed
      .map((g: any): Group => {
        const a = g.attributes;
        const schedule = stripHtml(a.schedule || '') || undefined;
        return {
          name: a.name?.trim() ?? 'Group',
          type: typeFromUrl(a.church_center_web_url),
          schedule,
          description: stripHtml(a.description || '') || undefined,
          image: a.header_image?.medium || a.header_image?.thumbnail || undefined,
          joinUrl: a.church_center_web_url,
          sortKey: sortKey(schedule),
        };
      });
  } catch {
    return [];
  }
}

const SEED: Group[] = [
  { name: 'Generations', type: 'Community Groups', schedule: 'Meets weekly on Sundays from 9–10am', joinUrl: `https://${ORG_SUB}/groups`, sortKey: 7 * 10000 + 540 },
  { name: 'Living Stones', type: 'Community Groups', schedule: 'Meets weekly on Sundays from 9–10am', joinUrl: `https://${ORG_SUB}/groups`, sortKey: 7 * 10000 + 540 },
  { name: 'Faith in the Trenches', type: 'Community Groups', schedule: 'Meets weekly on Sundays from 10:30–11:30am', joinUrl: `https://${ORG_SUB}/groups`, sortKey: 7 * 10000 + 630 },
  { name: 'exHImplify', type: 'Community Groups', schedule: 'Meets weekly on Wednesdays from 6–7pm', joinUrl: `https://${ORG_SUB}/groups`, sortKey: 3 * 10000 + 1080 },
];

// Flat list, sorted Mon→Sun by day/time (groups with no schedule last).
export async function getGroups(): Promise<Group[]> {
  const live = await fetchLive();
  const groups = live.length ? live : SEED;
  return groups.sort((a, b) => a.sortKey - b.sortKey || a.name.localeCompare(b.name));
}
