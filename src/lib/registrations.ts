// Registrations data layer — LIVE from Church Center's PUBLIC registrations API
// (src/lib/churchcenter.ts), cached at the edge for 15 minutes with the last good copy
// as a fallback (src/lib/cache.ts). Feeds the Registration card and Open registrations
// sections.

import { cached } from './cache';
import { ccGet, localDate, localTime, stripHtml } from './churchcenter';

export interface Registration {
  id: string;
  name: string;
  when?: string; // "Friday, Nov 6 · 6:00 PM"
  price?: string; // "Free" | "$10" | "$10 – $25"
  open: boolean;
  full: boolean;
  url: string; // the Church Center event page
  image?: string;
  summary?: string;
}

function whenLabel(startsAt?: string): string | undefined {
  if (!startsAt) return undefined;
  const day = new Date(`${localDate(startsAt)}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return `${day} · ${localTime(startsAt)}`;
}

// null = the fetch failed (as opposed to [] = no registrations).
async function fetchLive(): Promise<Registration[] | null> {
  const body = await ccGet('/registrations/v2/events?per_page=100');
  if (!body) return null;
  return (body.data ?? [])
    .filter((e: any) => !e.attributes?.archived)
    .map((e: any): Registration => {
      const a = e.attributes;
      return {
        id: String(e.id),
        name: a.name?.trim() ?? 'Event',
        when: whenLabel(a.starts_at),
        price: a.free ? 'Free' : a.event_price_with_range || undefined,
        open: Boolean(a.open) && !a.closed,
        full: Boolean(a.at_maximum_capacity),
        url: a.public_url,
        image: a.logo_url || undefined,
        summary: stripHtml(a.stripped_description || a.description || '').slice(0, 220) || undefined,
      };
    })
    .filter((r: Registration) => r.url);
}

/** Every registration Church Center lists publicly (not archived), soonest first. */
export async function getRegistrations(): Promise<Registration[]> {
  return (await cached('registrations', 15 * 60, fetchLive)) ?? [];
}

/** Open registrations, optionally only those whose name contains `match` (any apostrophe style). */
export async function getOpenRegistrations(match?: string): Promise<Registration[]> {
  const norm = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'");
  const want = match ? norm(match.trim()) : '';
  return (await getRegistrations()).filter((r) => r.open && (!want || norm(r.name).includes(want)));
}

/** The registration a Church Center link points to, if it's still open. */
export async function getRegistrationByUrl(url?: string): Promise<Registration | null> {
  const id = url?.match(/\/registrations\/events\/(\d+)/)?.[1];
  if (!id) return null;
  return (await getRegistrations()).find((r) => r.id === id && r.open) ?? null;
}
