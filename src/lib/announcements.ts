// Announcements data layer — LIVE from Church Center's PUBLIC publishing API
// (src/lib/churchcenter.ts): the same announcements as chelseachurch.churchcenter.com/announcements.
// Cached at the edge for 10 minutes with the last good copy as a fallback (src/lib/cache.ts).
// Image links from Church Center expire after a few weeks, so they're never stored longer.

import { cached } from './cache';
import { ccGet } from './churchcenter';
import { inModal } from './links';

const ORG = 'https://chelseachurch.churchcenter.com';

export interface Announcement {
  id: string;
  title: string;
  /** The summary as HTML holding only <p>, <br>, <strong> and <em> (see cleanSummary). */
  summary: string;
  image?: string;
  featured: boolean;
  /** Where the announcement points: a Church Center form or registration, or a web page. */
  link?: { href: string; external: boolean };
}

/**
 * Church Center summaries are rich text. Everything is escaped, then only bare paragraph,
 * line-break and bold/italic tags are put back — no attributes, links or anything else.
 */
export function cleanSummary(html: string): string {
  // Church Center sends text with its own entities (&rsquo;, &lt;), which pass through as
  // they are; only real tags have a literal < and >. Those become placeholder characters, the
  // allowed tags are rebuilt bare, every other tag is dropped, and any stray one is escaped.
  const L = '\u0001';
  const R = '\u0002';
  const marked = (html || '').replace(/[\u0001\u0002]/g, '').replace(/&nbsp;/g, ' ').replace(/</g, L).replace(/>/g, R);
  const allowed = marked
    .replace(new RegExp(`${L}\\s*(\\/?)\\s*(p|strong|em|b|i)\\b[^${R}]*${R}`, 'gi'), (_, close: string, tag: string) => {
      const t = tag.toLowerCase();
      return `<${close}${t === 'b' ? 'strong' : t === 'i' ? 'em' : t}>`;
    })
    .replace(new RegExp(`${L}\\s*br\\b[^${R}]*${R}`, 'gi'), '<br>')
    .replace(new RegExp(`${L}[^${R}]*${R}`, 'g'), '') // any other tag goes; its text stays
    .replace(new RegExp(L, 'g'), '&lt;')
    .replace(new RegExp(R, 'g'), '&gt;');
  return allowed
    .replace(/<p>\s*(<br>\s*)+/g, '<p>') // a paragraph that opens with a blank line
    .replace(/(<br>\s*)+<\/p>/g, '</p>')
    .replace(/<p>\s*<\/p>/g, '')
    .trim();
}

function linkFor(raw: unknown): Announcement['link'] {
  if (typeof raw !== 'string' || !raw.trim()) return undefined;
  const href = raw.startsWith('/') ? ORG + raw : raw;
  if (!/^https?:\/\//.test(href)) return undefined;
  // Church Center pages open in its pop-up, like every other Church Center link on the site.
  return href.startsWith(ORG) ? { href: inModal(href), external: false } : { href, external: true };
}

// null = the fetch failed (as opposed to [] = no announcements).
async function fetchLive(): Promise<Announcement[] | null> {
  const body = await ccGet('/publishing/v2/announcements?order=-featured&per_page=25');
  if (!body) return null;
  return (body.data ?? [])
    .map((a: any): Announcement => {
      const at = a.attributes ?? {};
      const v = at.image?.attributes?.variants ?? {};
      return {
        id: String(a.id),
        title: (at.title ?? '').trim(),
        summary: cleanSummary(at.summary ?? ''),
        image: v.original_ratio_small || v.medium || v.small || undefined,
        featured: Boolean(at.featured),
        link: linkFor(at.link),
      };
    })
    .filter((a: Announcement) => a.title);
}

/** Current announcements, featured first. [] when there are none or Church Center is unreachable. */
export async function getAnnouncements(): Promise<Announcement[]> {
  return (await getAnnouncementsResult()) ?? [];
}

/** null distinguishes a source outage from an empty announcement list. */
export const getAnnouncementsResult = () => cached('cc-announcements', 10 * 60, fetchLive);
