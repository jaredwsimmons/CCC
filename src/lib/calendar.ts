// Calendar data layer — LIVE from Church Center's PUBLIC calendar API.
//
// This is the exact public API the church's own calendar embed uses (the data
// any visitor already sees), reached with NO Planning Center credentials:
//   1) POST https://{org}.churchcenter.com/sessions/tokens  -> anonymous org bearer (ort_…)
//   2) GET  https://api.churchcenter.com/calendar/v2/events  with that bearer
// Fetched at BUILD time; if anything fails we fall back to the seeded events
// below so the page never breaks. (Undocumented app API — hence the fallback.)

const ORG_SUB = 'chelseachurch.churchcenter.com';
const CC_API = 'https://api.churchcenter.com/calendar/v2';
const TZ = 'America/Chicago';
const UA = 'ChelseaCommunityChurch-site/1.0';

export interface ChurchEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD in church-local time
  timeLabel: string; // "9:00 AM – 10:30 AM" | "All day"
  recurrence?: string;
  location?: string;
  description?: string;
  register?: string;
  publicUrl?: string;
}

const stripHtml = (s: string) =>
  (s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const localDate = (iso: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const localTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });

async function fetchLive(timeoutMs = 9000): Promise<ChurchEvent[]> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const opts = { signal: ctrl.signal, headers: { 'User-Agent': UA } };

    const tokRes = await fetch(`https://${ORG_SUB}/sessions/tokens`, { ...opts, method: 'POST', headers: { ...opts.headers, 'Content-Type': 'application/json' } });
    if (!tokRes.ok) { clearTimeout(t); return []; }
    const token = (await tokRes.json())?.data?.attributes?.token;
    if (!token) { clearTimeout(t); return []; }

    const url = `${CC_API}/events?filter=upcoming,first_occurrence&order=visible_starts_at&per_page=100&include=event_registration_url,location`;
    const res = await fetch(url, { ...opts, headers: { ...opts.headers, Authorization: `Bearer ${token}` } });
    clearTimeout(t);
    if (!res.ok) return [];
    const body = await res.json();

    const inc: Record<string, any> = {};
    for (const i of body.included ?? []) inc[`${i.type}:${i.id}`] = i;
    const rel = (e: any, key: string) => {
      const d = e.relationships?.[key]?.data;
      return d ? inc[`${d.type}:${d.id}`] : null;
    };

    return (body.data ?? []).map((e: any): ChurchEvent => {
      const a = e.attributes;
      const reg = rel(e, 'event_registration_url')?.attributes?.url;
      const loc = rel(e, 'location')?.attributes?.name;
      let timeLabel = 'All day';
      if (!a.all_day_event && a.starts_at) {
        timeLabel = localTime(a.starts_at);
        if (a.ends_at && localDate(a.ends_at) === localDate(a.starts_at)) timeLabel += ` – ${localTime(a.ends_at)}`;
      }
      return {
        id: String(e.id),
        title: a.name?.trim() ?? 'Event',
        date: localDate(a.starts_at),
        timeLabel,
        recurrence: a.recurring ? stripHtml(a.recurrence_description || '') || 'Recurring' : undefined,
        location: loc || undefined,
        description: stripHtml(a.description || '') || undefined,
        register: reg || undefined,
        publicUrl: a.public_url || undefined,
      };
    });
  } catch {
    return [];
  }
}

// ── Seeded fallback (used only if the live fetch fails) ──────────────────────
const SEED: ChurchEvent[] = [
  { id: 's1', title: 'Sundae Funday Bingo', date: '2026-07-13', timeLabel: '6:00 – 7:30 PM', location: 'Community Room', description: 'Women’s ministry night of bingo, prizes, and ice cream sundaes.', register: 'https://chelseachurch.churchcenter.com/registrations/events/3694679' },
  { id: 's2', title: 'Men On Fire', date: '2026-08-02', timeLabel: '6:00 PM', location: 'The fire pit', recurrence: 'First Sunday monthly', description: 'Brotherhood, Scripture, and prayer around the fire pit.' },
  { id: 's3', title: 'Ladies Breakfast', date: '2026-08-22', timeLabel: '8:00 AM', location: 'Community Room', description: 'Breakfast and fellowship for the women of the church.' },
];

export async function getUpcomingEvents(): Promise<ChurchEvent[]> {
  const live = await fetchLive();
  // The Sunday-morning service breakouts (Worship/Preschool/K-5, all "Every
  // Sunday") are covered by the weekly-rhythm cards — drop them so the upcoming
  // list highlights special + non-weekly-Sunday events.
  const events = (live.length ? live : SEED).filter((e) => !/^every sunday$/i.test(e.recurrence || ''));
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

// The rhythm of our week — curated tiles above the live event list.
export interface RhythmTile {
  category: string;
  title: string;
  time: string;
  location: string;
  description: string;
  link?: { href: string; label: string };
}
export const rhythm: RhythmTile[] = [
  { category: 'Worship', title: 'Sunday Worship', time: 'Sundays · 9:00 & 10:30 AM', location: 'Worship Room',
    description: 'Two identical gatherings, with programming for kids and students at both hours.' },
  { category: 'Kids & Students', title: 'Kids & Students', time: 'Both Sunday services', location: 'Kids & Student Halls',
    description: 'Preschool through high school meet at both Sunday services; students also gather Wednesday nights at 6 PM.' },
  { category: 'Community Groups', title: 'Community Groups', time: 'Everyday', location: 'On campus & in homes',
    description: 'Adults do life together in groups throughout the week.',
    link: { href: '/groups', label: 'See all community groups →' } },
  { category: '5th Sundays', title: 'Family Worship', time: '5th Sundays', location: 'Worship Room',
    description: 'On months with a 5th Sunday, we cancel all age-graded ministries — Preschool through Students — and the whole church worships together.' },
];

// Build a traditional month grid (Sun–Sat weeks) for the calendar's "Month" view.
export interface DayCell { day: number; date: string; events: ChurchEvent[] }
export function buildMonthGrids(events: ChurchEvent[]): { label: string; weeks: (DayCell | null)[][] }[] {
  const byMonth = new Map<string, ChurchEvent[]>();
  for (const e of events) {
    const ym = e.date.slice(0, 7);
    if (!byMonth.has(ym)) byMonth.set(ym, []);
    byMonth.get(ym)!.push(e);
  }
  const out: { label: string; weeks: (DayCell | null)[][] }[] = [];
  for (const [ym, evs] of [...byMonth.entries()].sort()) {
    const [y, m] = ym.split('-').map(Number);
    const label = new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const firstDow = new Date(y, m - 1, 1).getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const byDay: Record<number, ChurchEvent[]> = {};
    for (const e of evs) (byDay[Number(e.date.slice(8, 10))] ||= []).push(e);
    const cells: (DayCell | null)[] = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, date: `${ym}-${String(d).padStart(2, '0')}`, events: byDay[d] || [] });
    while (cells.length % 7) cells.push(null);
    const weeks: (DayCell | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    out.push({ label, weeks });
  }
  return out;
}

export function groupByMonth(events: ChurchEvent[]): { month: string; events: ChurchEvent[] }[] {
  const out: { month: string; events: ChurchEvent[] }[] = [];
  for (const e of events) {
    if (!e.date) continue;
    const month = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    let bucket = out.find((o) => o.month === month);
    if (!bucket) { bucket = { month, events: [] }; out.push(bucket); }
    bucket.events.push(e);
  }
  return out;
}

export function dateParts(iso: string): { weekday: string; month: string; day: string } {
  const d = new Date(iso + 'T12:00:00');
  return {
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    month: d.toLocaleDateString('en-US', { month: 'short' }),
    day: String(d.getDate()),
  };
}
