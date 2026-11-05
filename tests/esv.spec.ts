import { test, expect } from '@playwright/test';
import { passageText } from '../src/lib/format';

// How an ESV API reply becomes tooltip text. A chained reference ("John 1:12, 3:16")
// comes back as one passage each, and none of them may be dropped.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
});

test('a chained reference keeps every passage, each labeled', () => {
  const text = passageText({
    passages: ['But to all who did receive him,\n', '  For God so loved\n  the world,\n'],
    passage_meta: [{ canonical: 'John 1:12' }, { canonical: 'John 3:16' }],
  });
  expect(text).toBe('John 1:12\nBut to all who did receive him,\n\nJohn 3:16\nFor God so loved the world,');
});

test('a single passage has no label', () => {
  const text = passageText({ passages: ['Jesus wept.\n'], passage_meta: [{ canonical: 'John 11:35' }] });
  expect(text).toBe('Jesus wept.');
});

test('a reply with no passage text is empty', () => {
  expect(passageText({})).toBe('');
  expect(passageText({ passages: ['  \n'] })).toBe('');
});
