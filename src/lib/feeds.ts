// Public feed parsing — NO auth token required.
// YouTube channel RSS + the sermon podcast RSS are fetched when the Media page is
// visited, cached at the edge for 15 minutes (src/lib/cache.ts), and parsed into
// typed data the page renders natively (no iframe/embed). If a feed is unreachable
// and nothing is cached, we return [] and the page falls back to its platform buttons.
// Cached copies are JSON, so dates are kept as strings until they're handed out.
import { XMLParser } from 'fast-xml-parser';
import { site } from '../data/site';
import { cached } from './cache';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'ChelseaCommunityChurch-site/1.0' },
    });
    clearTimeout(t);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

const asArray = <T>(v: T | T[] | undefined): T[] => (Array.isArray(v) ? v : v ? [v] : []);

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&nbsp;/g, ' ');
}
const stripHtml = (s: string) =>
  decodeEntities(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

// Sermon descriptions read "{passage} - {speaker}, {role} {extra prose…}".
// Keep the useful lead (passage + speaker/role) and drop trailing prose.
function tidySubtitle(s: string, max = 96): string {
  const clean = stripHtml(s);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[,\s]+$/, '') + '…';
}

export interface Video {
  id: string;
  title: string;
  date: Date | null;
  thumbnail: string;
  url: string;
}

export async function getYouTubeVideos(limit = 6): Promise<Video[]> {
  const videos = await cached(`youtube:${limit}`, 15 * 60, async () => {
    const xml = await fetchText(site.media.youtubeFeed);
    if (!xml) return null;
    try {
      const feed = parser.parse(xml)?.feed;
      return asArray<any>(feed?.entry)
        .map((e) => {
          const id = e['yt:videoId'];
          const thumb = e['media:group']?.['media:thumbnail']?.['@_url'];
          return {
            id,
            title: decodeEntities(typeof e.title === 'string' ? e.title : e.title?.['#text'] ?? ''),
            date: (e.published as string | undefined) ?? null,
            thumbnail: thumb || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''),
            url: id ? `https://www.youtube.com/watch?v=${id}` : '',
          };
        })
        .filter((v) => v.id)
        .slice(0, limit);
    } catch {
      return null;
    }
  });
  return (videos ?? []).map((v) => ({ ...v, date: v.date ? new Date(v.date) : null }));
}

export interface Episode {
  title: string;
  subtitle: string; // passage / speaker, from the description
  date: Date | null;
  duration: string;
  audioUrl: string;
  image: string;
  link: string;
}

// The podcast feed lists every episode (300+, ~350 KB), and parsing all of it takes
// longer than a free Workers request may spend (~28 ms vs 10 ms). Episodes run newest
// first and only the first few are shown, so cut the feed after the first `n` items.
function firstItems(xml: string, n: number): string {
  let end = 0;
  for (let i = 0; i < n; i++) {
    const next = xml.indexOf('</item>', end);
    if (next === -1) return xml;
    end = next + '</item>'.length;
  }
  return xml.slice(0, end) + '</channel></rss>';
}

export async function getPodcastEpisodes(limit = 9): Promise<Episode[]> {
  const episodes = await cached(`podcast:${limit}`, 15 * 60, async () => {
    const xml = await fetchText(site.media.podcastFeed);
    if (!xml) return null;
    try {
      const channel = parser.parse(firstItems(xml, limit))?.rss?.channel;
      return asArray<any>(channel?.item)
        .map((it) => {
          const title = typeof it.title === 'string' ? it.title : it.title?.['#text'] ?? '';
          const desc = typeof it.description === 'string' ? it.description : it.description?.['#text'] ?? '';
          return {
            title: decodeEntities(title),
            subtitle: tidySubtitle(desc),
            date: (it.pubDate as string | undefined) ?? null,
            duration: it['itunes:duration'] ? String(it['itunes:duration']) : '',
            audioUrl: it.enclosure?.['@_url'] ?? '',
            image: it['itunes:image']?.['@_href'] ?? '',
            link: it.link ?? '',
          };
        })
        .filter((e) => e.title)
        .slice(0, limit);
    } catch {
      return null;
    }
  });
  return (episodes ?? []).map((e) => ({ ...e, date: e.date ? new Date(e.date) : null }));
}

// Format an itunes:duration ("00:33:58" or seconds) as "34 min"
export function fmtDuration(d: string): string {
  if (!d) return '';
  let secs = 0;
  if (d.includes(':')) {
    const parts = d.split(':').map(Number);
    secs = parts.reduce((acc, n) => acc * 60 + n, 0);
  } else {
    secs = Number(d) || 0;
  }
  const min = Math.round(secs / 60);
  return min ? `${min} min` : '';
}
