// Calendar data layer.
//
// TODAY: seeded from the real events published on chelseachurch.com (the
// dated one-offs and the stated recurring rhythms). No token, no embed.
//
// SWAP LATER (one function, no page changes): once a PCO Personal Access
// Token is set as a build/server secret, replace the body of getUpcomingEvents()
// with a fetch of  /calendar/v2/events?filter=future&include=event_instances
// (Cloudflare build secret via astro:env/server). Confirm the "visible in
// Church Center" filter attribute before shipping — see the vault note
// "Church Website — Planning Center API Integration".

export interface ChurchEvent {
  title: string;
  /** ISO date (YYYY-MM-DD) for one-offs; omitted for weekly rhythms */
  date?: string;
  time: string;
  location: string;
  description?: string;
  /** optional Church Center registration/RSVP link */
  register?: string;
  category: 'service' | 'women' | 'men' | 'groups' | 'all-church';
}

// Weekly rhythms (shown as a "Every week" panel, not dated instances)
export const weekly: ChurchEvent[] = [
  { title: 'Sunday Worship', time: 'Sundays · 9:00 & 10:30 AM', location: 'Worship Room', category: 'service',
    description: 'Two identical gatherings with programming for kids and students at both hours.' },
  { title: 'Community Groups', time: 'Wednesdays · 6:00 PM', location: 'On campus & in homes', category: 'groups',
    description: 'exHIMplify, Stringfellowship, and the Allgood group meet mid-week.' },
  { title: "Men's Bible Study", time: 'Mon 6:00 AM · Thu 6:30 AM/PM · Fri 6:30 AM', location: 'Bojangles, O’Henry’s & the Church Commons', category: 'men',
    description: 'Four weekly gatherings around town — come to whichever fits your week.' },
];

// Dated upcoming events (from the current site). Newest sources of truth are the
// women's ministry + all-church announcements.
const upcoming: ChurchEvent[] = [
  { title: 'Sundae Funday Bingo', date: '2026-07-13', time: '6:00–7:30 PM', location: 'Community Room',
    description: 'Women’s ministry night of bingo, prizes, and ice cream sundaes. Bring a topping or salty snack to share.',
    register: 'https://chelseachurch.churchcenter.com/registrations/events/3694679', category: 'women' },
  { title: 'Men On Fire', date: '2026-08-02', time: '6:00 PM', location: 'The fire pit',
    description: 'First-Sunday gathering of all men for brotherhood, Scripture, and prayer.', category: 'men' },
  { title: 'Ladies Breakfast', date: '2026-08-22', time: '8:00 AM', location: 'Community Room',
    description: 'Women of the church gather for breakfast and fellowship. Details coming soon.', category: 'women' },
  { title: 'Men On Fire', date: '2026-09-06', time: '6:00 PM', location: 'The fire pit',
    description: 'First-Sunday gathering of all men for brotherhood, Scripture, and prayer.', category: 'men' },
];

export function getUpcomingEvents(): ChurchEvent[] {
  // sorted ascending by date; when live, the API query does this server-side
  return [...upcoming].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
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
