import { defineConfig } from '@playwright/test';
import base from './playwright.config';

// Review the real production build at several widths; do not update visual baselines.
export default defineConfig({
  ...base,
  testDir: 'scripts/review',
  testMatch: 'layout.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  outputDir: 'layout-review/test-results',
  use: { ...base.use, navigationTimeout: 60_000 },
  projects: [{ name: 'layout', use: { viewport: { width: 1440, height: 900 } } }],
});
