import { defineConfig, isDev } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { pageTemplates } from './schemaTypes/templates';

// Set SANITY_STUDIO_PROJECT_ID in studio/.env (copy from studio/.env.example).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

// One document each, reached from the menu below; staff can't create, duplicate or delete them.
const SINGLETON_TYPES = new Set(['siteSettings', 'home', 'fixedPage']);
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore']);

// The fixed pages and their document IDs (the website looks them up by these IDs).
export const FIXED_PAGES = [
  { id: 'fixed-calendar', title: 'Calendar' },
  { id: 'fixed-groups', title: 'Community Groups' },
  { id: 'fixed-media', title: 'Media' },
  { id: 'fixed-give', title: 'Give' },
  { id: 'fixed-leaders', title: 'Leaders' },
];

export default defineConfig({
  name: 'default',
  title: 'Chelsea Community Church',
  projectId,
  dataset,
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.listItem().title('Home page').id('home').child(S.document().schemaType('home').documentId('home')),
            S.divider(),
            S.documentTypeListItem('page').title('Pages'),
            S.listItem()
              .title('Fixed pages')
              .id('fixedPages')
              .child(
                S.list()
                  .title('Fixed pages')
                  .items(
                    FIXED_PAGES.map((p) =>
                      S.listItem().title(p.title).id(p.id).child(S.document().schemaType('fixedPage').documentId(p.id)),
                    ),
                  ),
              ),
            S.divider(),
            S.documentTypeListItem('leader').title('Leaders'),
            S.documentTypeListItem('ministry').title('Ministries & Deacons'),
          ]),
    }),
    // The GROQ query playground is for developers; staff don't see it in the deployed Studio.
    ...(isDev ? [visionTool()] : []),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => [...prev.filter((t) => !SINGLETON_TYPES.has(t.schemaType)), ...pageTemplates],
  },
  document: {
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType) ? prev.filter(({ action }) => action && SINGLETON_ACTIONS.has(action)) : prev,
  },
});
