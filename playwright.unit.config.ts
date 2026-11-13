import { defineConfig } from '@playwright/test';

// Deterministic source and rendered-component tests need neither a browser nor a Worker server.
export default defineConfig({
  testDir: 'tests',
  testMatch: /(?:announcements|cache|calendar|churchcenter|links|migration|components)\.spec\.ts/,
  projects: [{ name: 'desktop' }],
  workers: 1,
  reporter: 'list',
});
