import { defineConfig } from '@playwright/test';

// Exercise the real rendered components with deterministic upstream fixtures.
export default defineConfig({
  testDir: 'tests',
  testMatch: 'components.browser.spec.ts',
  workers: 2,
  reporter: 'list',
  use: {
    contextOptions: { reducedMotion: 'reduce' },
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined },
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
