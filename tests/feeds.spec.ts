import { test, expect } from '@playwright/test';
import { getPlaylistVideos, getPodcastEpisodes, getYouTubeVideos } from '../src/lib/feeds';

// The YouTube and podcast feeds against stand-in XML.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
});

const realFetch = globalThis.fetch;
test.afterEach(() => {
  globalThis.fetch = realFetch;
});
const serve = (xml: string) => {
  globalThis.fetch = (async () => new Response(xml)) as typeof fetch;
};

const entry = (id: string, title: string, published: string) =>
  `<entry><yt:videoId>${id}</yt:videoId><title>${title}</title><published>${published}</published></entry>`;

test('a title made only of digits is kept as written', async () => {
  serve(`<rss><channel>
    <item><title>1984</title><itunes:duration>2509</itunes:duration></item>
    <item><title>007</title><itunes:duration>00:41:49</itunes:duration></item>
  </channel></rss>`);
  const episodes = await getPodcastEpisodes();
  expect(episodes.map((e) => e.title)).toEqual(['1984', '007']);
  expect(episodes.map((e) => e.duration)).toEqual(['2509', '00:41:49']);

  serve(`<feed>${entry('12345678901', '2026', '2026-11-08T15:00:00+00:00')}</feed>`);
  const [video] = await getPlaylistVideos('PLaaaaaaaaaaaaaaaa');
  expect(video).toMatchObject({ id: '12345678901', title: '2026', url: 'https://www.youtube.com/watch?v=12345678901' });
});

test('a playlist kept oldest-first still gives its newest video first', async () => {
  serve(`<feed>
    ${entry('aaaaaaaaaaa', 'Oct 25', '2026-10-25T15:00:00+00:00')}
    ${entry('bbbbbbbbbbb', 'Nov 1', '2026-11-01T15:00:00+00:00')}
    ${entry('ccccccccccc', 'Nov 8', '2026-11-08T15:00:00+00:00')}
  </feed>`);
  const videos = await getPlaylistVideos('PLbbbbbbbbbbbbbbbb');
  expect(videos.map((v) => v.title)).toEqual(['Nov 8', 'Nov 1', 'Oct 25']);
});

// The YouTube Data API (with a key) against a stand-in for googleapis.com. The RSS feed
// above stays as the fallback, since it has gone down for hours at a time.
const KEY = 'test-key';
const item = (videoId: string, title: string, videoPublishedAt?: string) => ({
  snippet: { title, thumbnails: { high: { url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` } } },
  contentDetails: videoPublishedAt ? { videoId, videoPublishedAt } : { videoId },
});
/** Answers API requests with `api` (or that status) and feed requests with `xml`; records what was asked. */
function youtube(api: unknown[] | number, xml = '<feed></feed>') {
  const asked: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    asked.push(url);
    if (!url.startsWith('https://www.googleapis.com/')) return new Response(xml);
    return typeof api === 'number' ? new Response('{}', { status: api }) : Response.json({ items: api });
  }) as typeof fetch;
  return asked;
}

test('with a key, a playlist comes from the YouTube Data API, newest first, without private or deleted videos', async () => {
  const asked = youtube([
    item('aaaaaaaaaaa', 'Oct 25 & more', '2026-10-25T15:00:00Z'),
    item('ppppppppppp', 'Private video'),
    item('ccccccccccc', 'Nov 8', '2026-11-08T15:00:00Z'),
    item('ddddddddddd', 'Deleted video'),
  ]);
  const videos = await getPlaylistVideos('https://www.youtube.com/playlist?list=PLcccccccccccccccc', undefined, KEY);
  expect(videos.map((v) => v.title)).toEqual(['Nov 8', 'Oct 25 & more']);
  expect(videos[0]).toMatchObject({
    id: 'ccccccccccc',
    url: 'https://www.youtube.com/watch?v=ccccccccccc',
    thumbnail: 'https://i.ytimg.com/vi/ccccccccccc/hqdefault.jpg',
  });
  expect(videos[0].date?.toISOString()).toBe('2026-11-08T15:00:00.000Z');
  expect(asked).toHaveLength(1);
  const url = new URL(asked[0]);
  expect(url.pathname).toBe('/youtube/v3/playlistItems');
  expect(url.searchParams.get('playlistId')).toBe('PLcccccccccccccccc');
  expect(url.searchParams.get('key')).toBe(KEY);
});

test("with a key, the channel's newest uploads come from its uploads playlist", async () => {
  const asked = youtube([item('eeeeeeeeeee', 'Sunday service', '2026-11-08T15:00:00Z')]);
  const videos = await getYouTubeVideos(undefined, 'UCp-U4UoiyeroDpOyrygy5YA', KEY);
  expect(videos.map((v) => v.id)).toEqual(['eeeeeeeeeee']);
  expect(new URL(asked[0]).searchParams.get('playlistId')).toBe('UUp-U4UoiyeroDpOyrygy5YA');
});

test('when the API refuses, or there is no key, the RSS feed is used', async () => {
  const feed = `<feed>${entry('fffffffffff', 'From the feed', '2026-11-08T15:00:00+00:00')}</feed>`;
  let asked = youtube(403, feed);
  expect((await getPlaylistVideos('PLdddddddddddddddd', undefined, KEY)).map((v) => v.title)).toEqual(['From the feed']);
  expect(asked.map((u) => new URL(u).hostname)).toEqual(['www.googleapis.com', 'www.youtube.com']);

  asked = youtube([item('ggggggggggg', 'From the API', '2026-11-08T15:00:00Z')], feed);
  expect((await getPlaylistVideos('PLeeeeeeeeeeeeeeee')).map((v) => v.title)).toEqual(['From the feed']);
  expect(asked.map((u) => new URL(u).hostname)).toEqual(['www.youtube.com']);
});
