import { test, expect } from '@playwright/test';
import { cleanSummary } from '../src/lib/announcements';

// Church Center announcement summaries are rich text from outside the site; only bare
// paragraphs, line breaks and bold/italic may reach the page.
test.describe('announcement summaries', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
  });

  test('keep paragraphs, line breaks and bold/italic, without attributes', () => {
    expect(cleanSummary('<p class="x">Join us <strong style="color:red">Tuesday</strong>!<br>Bring <b>soup</b> and <i>cookies</i>.</p>')).toBe(
      '<p>Join us <strong>Tuesday</strong>!<br>Bring <strong>soup</strong> and <em>cookies</em>.</p>',
    );
  });

  test('drop scripts, links, images and event handlers, keeping the words', () => {
    const out = cleanSummary('<p onclick="x()">Hi <a href="javascript:alert(1)">there</a><img src=x onerror=alert(1)><script>alert(1)</script></p>');
    expect(out).toBe('<p>Hi therealert(1)</p>');
    expect(out).not.toMatch(/<(a|img|script)|onclick|onerror|href/i);
  });

  test("leave Church Center's entities alone and tidy blank lines", () => {
    expect(cleanSummary('<p><br>We&rsquo;re glad&nbsp;you&amp;yours came<br><br></p><p></p>')).toBe('<p>We&rsquo;re glad you&amp;yours came</p>');
  });

  test('turn an escaped tag in the text into nothing harmful', () => {
    expect(cleanSummary('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>')).toBe('<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>');
  });
});

test.describe('YouTube playlist links', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
  });

  test('give their playlist ID however staff paste them', async () => {
    const { playlistIdFrom } = await import('../src/lib/feeds');
    const id = 'PLcnuF3joGnBFOGwWqS3cVxYo2br45RiUC';
    expect(playlistIdFrom(`https://www.youtube.com/playlist?list=${id}`)).toBe(id);
    expect(playlistIdFrom(`https://youtube.com/playlist?list=${id}&si=abc123`)).toBe(id);
    expect(playlistIdFrom(`https://www.youtube.com/watch?v=YoQhEfj8AgE&list=${id}&index=2`)).toBe(id);
    expect(playlistIdFrom(` ${id} `)).toBe(id);
    expect(playlistIdFrom('https://www.youtube.com/@chelsea_community_church')).toBeNull();
    expect(playlistIdFrom('')).toBeNull();
  });
});
