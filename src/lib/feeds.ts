// YouTube videos and the sermon podcast, fetched when a page needs them, cached at the
// edge for 15 minutes (src/lib/cache.ts), and parsed into typed data the page renders
// natively (no iframe/embed). YouTube comes from its Data API when YOUTUBE_API_KEY is
// set, else from its public RSS feed, which has been going down for hours at a time.
// If nothing answers and nothing is cached, we return [] and the page falls back to
// its platform buttons. Cached copies are JSON, so dates stay strings until handed out.
import { XMLParser } from 'fast-xml-parser';
import { site } from '../data/site';
import { podcastFeedUrl, youtubeChannelId } from './integrations';
import { cached } from './cache';

// parseTagValue: false keeps text as text, so a title like "1984" isn't read as a number.
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: false });

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'ChelseaCommunityChurch-site/1.0' },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
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

/** How many items to keep from each feed, so every section shares one cached download. */
export const FEED_ITEMS = 13;

type CachedVideo = Omit<Video, 'date'> & { date: string | null };

// A playlist's videos from the YouTube Data API (1 unit of the key's 10,000 a day); null
// if it doesn't answer. Private and deleted videos stay listed without a publish date,
// so they're left out.
async function fromApi(playlistId: string, limit: number, apiKey: string): Promise<CachedVideo[] | null> {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
  url.search = new URLSearchParams({ part: 'snippet,contentDetails', maxResults: String(Math.min(limit, 50)), playlistId, key: apiKey }).toString();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      // 400 = bad key, 403 = key not allowed or the day's quota used up, 404 = no such playlist.
      console.warn(`[youtube] Data API answered ${res.status} for playlist ${playlistId}; using the RSS feed.`);
      return null;
    }
    const body = (await res.json()) as { items?: any[] };
    return asArray<any>(body.items)
      .filter((i) => i.contentDetails?.videoId && i.contentDetails?.videoPublishedAt)
      .map((i) => {
        const id: string = i.contentDetails.videoId;
        const thumbs = i.snippet?.thumbnails ?? {};
        return {
          id,
          title: i.snippet?.title ?? '',
          date: i.contentDetails.videoPublishedAt as string,
          thumbnail: thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${id}`,
        };
      })
      .slice(0, limit);
  } catch {
    return null;
  }
}

// The same videos from YouTube's public RSS feed; null if it doesn't answer.
async function fromRss(url: string, limit: number): Promise<CachedVideo[] | null> {
  const xml = await fetchText(url);
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
}

// One playlist's videos (a channel's uploads are a playlist too), cached under `key`:
// from the Data API when there's a key, with the RSS feed `rssUrl` as the fallback.
async function youtubeFeed(key: string, playlistId: string, rssUrl: string, limit: number, apiKey?: string): Promise<Video[]> {
  const videos = await cached(key, 15 * 60, async () =>
    (apiKey ? await fromApi(playlistId, limit, apiKey) : null) ?? fromRss(rssUrl, limit),
  );
  return (videos ?? []).map((v) => ({ ...v, date: v.date ? new Date(v.date) : null }));
}

/** The newest uploads from the church's channel. `apiKey` is YOUTUBE_API_KEY, when set. */
export const getYouTubeVideos = (limit = FEED_ITEMS, channelId?: string, apiKey?: string) => {
  const id = youtubeChannelId(channelId);
  // A channel's uploads playlist is its ID with UC changed to UU.
  return youtubeFeed(`youtube:${id}:${limit}`, `UU${id.slice(2)}`, `https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, limit, apiKey);
};

/** A playlist's ID from its YouTube link (…?list=PL…), or the ID itself; null if it's neither. */
export function playlistIdFrom(link?: string | null): string | null {
  const s = (link ?? '').trim();
  return s.match(/[?&]list=([\w-]+)/)?.[1] ?? s.match(/^((?:PL|UU)[\w-]{10,})$/)?.[1] ?? null;
}

/**
 * The videos in a playlist, newest first; [] for a bad link or no answer. YouTube lists them
 * in the playlist's own order, which may be oldest first, so they're sorted here.
 * `apiKey` is YOUTUBE_API_KEY, when set.
 */
export async function getPlaylistVideos(link?: string | null, limit = FEED_ITEMS, apiKey?: string): Promise<Video[]> {
  const id = playlistIdFrom(link);
  if (!id) return [];
  const videos = await youtubeFeed(`ytpl:${id}:${limit}`, id, `https://www.youtube.com/feeds/videos.xml?playlist_id=${id}`, limit, apiKey);
  return videos.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));
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

export async function getPodcastEpisodes(limit = FEED_ITEMS, source?: string): Promise<Episode[]> {
  const feed = podcastFeedUrl(source) || site.media.podcastFeed;
  const episodes = await cached(`podcast:${feed}:${limit}`, 15 * 60, async () => {
    const xml = await fetchText(feed);
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
