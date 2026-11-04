import { defineConfig } from '@playwright/test';

// End-to-end tests (CLAUDE.md rule 5). `npm test` builds the site, serves the
// production output, and runs every spec in tests/ on a desktop and a phone viewport.
//
// Snapshots are the baseline the CMS migration is checked against:
//   tests/__snapshots__/    accessibility-tree snapshots of each page's content
//   tests/__screenshots__/  full-page screenshots (photos masked), per platform
// After an intended change, review the diff and run `npm run test:update`.
//
// Set PLAYWRIGHT_CHROMIUM_PATH to use a preinstalled Chromium instead of
// `npx playwright install chromium` (e.g. /opt/pw-browsers/chromium in cloud sessions).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;
const port = 4322; // not 4321, so a running `npm run dev` is never tested by mistake

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // Scroll-reveal content shows at once and the homepage video stays hidden.
    contextOptions: { reducedMotion: 'reduce' },
    launchOptions: { executablePath },
  },
  expect: {
    toHaveScreenshot: { pathTemplate: '{testDir}/__screenshots__/{platform}/{projectName}/{arg}{ext}' },
    toMatchAriaSnapshot: { pathTemplate: '{testDir}/__snapshots__/{arg}{ext}' },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    // `astro preview` runs the production build in the Workers runtime. --ignore-lock
    // starts our own server even if an earlier preview left its lock file behind.
    command: `npm run build && npm run preview -- --host 127.0.0.1 --port ${port} --ignore-lock`,
    url: `http://127.0.0.1:${port}`,
    // Snapshots assume no ESV key, so scripture references render as plain text: don't
    // set ESV_API_KEY in .dev.vars when running the tests.
    env: { ESV_API_KEY: '' },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
