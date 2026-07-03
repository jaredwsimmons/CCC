import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

// Set SANITY_STUDIO_PROJECT_ID in studio/.env (copy from studio/.env.example).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

export default defineConfig({
  name: 'default',
  title: 'Chelsea Community Church',
  projectId,
  dataset,
  plugins: [
    // Custom desk structure: "Site Settings" is a single document (singleton), not a list.
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            S.documentTypeListItem('page').title('Pages'),
            S.documentTypeListItem('event').title('Events'),
            S.documentTypeListItem('sermon').title('Sermons'),
            S.documentTypeListItem('staff').title('Leaders & Staff'),
          ]),
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
