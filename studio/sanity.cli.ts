import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // chelseachurch.sanity.studio
  studioHost: 'chelseachurch',
  deployment: { appId: 'ib848idlaum84rdk33dv5t6m' },
});
