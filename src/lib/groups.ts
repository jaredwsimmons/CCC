// Groups data layer — LIVE from Church Center's PUBLIC groups API (src/lib/churchcenter.ts),
// the same feed the church publishes for people to browse/join. Fetched when
// the page is visited and cached at the edge for 30 minutes, falling back to
// the last good copy (src/lib/cache.ts); full (enrollment closed) groups are
// hidden per request, sorted by meeting day/time (Mon→Sun).

import { cached } from './cache';
import { ccGet, stripHtml } from './churchcenter';

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

// null = the fetch failed (as opposed to [] = no open groups).
async function fetchLive(): Promise<Group[] | null> {
  try {
    const body = await ccGet('/groups/v2/groups?per_page=100');
    if (!body) return null;

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
    return null;
  }
}

// Flat list, sorted Mon→Sun by day/time (groups with no schedule last).
export async function getGroups(): Promise<Group[]> {
  const groups = (await cached('groups', 30 * 60, fetchLive)) ?? [];
  return groups.sort((a, b) => a.sortKey - b.sortKey || a.name.localeCompare(b.name));
}
