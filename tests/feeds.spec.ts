import { test, expect } from '@playwright/test';
import { getPlaylistVideos, getPodcastEpisodes } from '../src/lib/feeds';

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
