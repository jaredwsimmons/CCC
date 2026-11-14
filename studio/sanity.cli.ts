import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // chelseachurch.sanity.studio
  studioHost: 'chelseachurch',
  deployment: { appId: 'ib848idlaum84rdk33dv5t6m' },
  // Imports use relative paths. Avoid scanning the parent website's Astro tsconfig
  // when schema validation runs with only the Studio dependencies installed.
  vite: { resolve: { tsconfigPaths: false } },
});
