// Groups data layer — LIVE from Church Center's PUBLIC groups API (no token),
// the same feed the church publishes for people to browse/join. Fetched at
// build time; full (enrollment closed) groups are hidden per request, and a
// graceful fallback keeps the page working if the fetch ever fails.

const ORG_SUB = 'chelseachurch.churchcenter.com';
const CC_API = 'https://api.churchcenter.com/groups/v2';
const UA = 'ChelseaCommunityChurch-site/1.0';

export interface Group {
  name: string;
  type: string; // "Community Groups" | "Women's Groups" | "Ministry Groups"
  schedule?: string;
  description?: string;
  joinUrl: string;
}

const TYPE_LABEL: Record<string, string> = {
  'community-groups': 'Community Groups',
  'women-s-groups': "Women's Groups",
  'ministry-groups': 'Ministry Groups',
};
const TYPE_ORDER = ['Community Groups', "Women's Groups", 'Ministry Groups'];

const stripHtml = (s: string) =>
  (s || '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

function typeFromUrl(url: string): string {
  const m = (url || '').match(/\/groups\/([^/]+)\//);
  return (m && TYPE_LABEL[m[1]]) || 'Groups';
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
      // hide full/closed (and any not open to join)
      .filter((g: any) => g.attributes?.enrollment_open !== false)
      .map((g: any): Group => {
        const a = g.attributes;
        return {
          name: a.name?.trim() ?? 'Group',
          type: typeFromUrl(a.church_center_web_url),
          schedule: stripHtml(a.schedule || '') || undefined,
          description: stripHtml(a.description || '') || undefined,
          joinUrl: a.church_center_web_url,
        };
      });
  } catch {
    return [];
  }
}

// Fallback (only if the live fetch fails): a representative slice, live shape.
const SEED: Group[] = [
  { name: 'Generations', type: 'Community Groups', schedule: 'Meets weekly on Sundays from 9–10am', joinUrl: `https://${ORG_SUB}/groups` },
  { name: 'Living Stones', type: 'Community Groups', schedule: 'Meets weekly on Sundays from 9–10am', joinUrl: `https://${ORG_SUB}/groups` },
  { name: 'Faith in the Trenches', type: 'Community Groups', schedule: 'Meets weekly on Sundays from 10:30–11:30am', joinUrl: `https://${ORG_SUB}/groups` },
  { name: 'exHImplify', type: 'Community Groups', schedule: 'Meets weekly on Wednesdays from 6–7pm', joinUrl: `https://${ORG_SUB}/groups` },
];

export async function getGroupsByType(): Promise<{ type: string; groups: Group[] }[]> {
  const live = await fetchLive();
  const groups = live.length ? live : SEED;
  const byType = new Map<string, Group[]>();
  for (const g of groups) {
    if (!byType.has(g.type)) byType.set(g.type, []);
    byType.get(g.type)!.push(g);
  }
  return [...byType.entries()]
    .map(([type, groups]) => ({ type, groups }))
    .sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.type), bi = TYPE_ORDER.indexOf(b.type);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}
