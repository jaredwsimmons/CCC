import { defineConfig, isDev } from 'sanity';
import { structureTool } from 'sanity/structure';
import { defineDocuments, defineLocations, presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';
import { pageTemplates } from './schemaTypes/templates';

// Set SANITY_STUDIO_PROJECT_ID in studio/.env (copy from studio/.env.example).
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || '';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

// One document each, reached from the menu below; staff can't create, duplicate or delete them.
const SINGLETON_TYPES = new Set(['siteSettings', 'home', 'fixedPage']);
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore']);

// The website the Live Preview shows. Set SANITY_STUDIO_PREVIEW_URL to the real address
// before deploying the Studio.
const previewUrl = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:4321';

// The fixed pages and their document IDs (the website looks them up by these IDs).
export const FIXED_PAGES = [
  { id: 'fixed-calendar', title: 'Calendar' },
  { id: 'fixed-groups', title: 'Community Groups' },
  { id: 'fixed-media', title: 'Media' },
  { id: 'fixed-give', title: 'Give' },
  { id: 'fixed-leaders', title: 'Leaders' },
];
const fixedPath = (id = '') => `/${id.replace(/^(drafts\.)?fixed-/, '')}`;

export default defineConfig({
  name: 'default',
  title: 'Chelsea Community Church',
  projectId,
  dataset,
  plugins: [
    // First in the list, so the Studio opens on the real website.
    presentationTool({
      title: 'Live Preview',
      previewUrl: {
        initial: previewUrl,
        previewMode: { enable: '/api/draft-mode/enable', disable: '/api/draft-mode/disable' },
      },
      allowOrigins: ['http://localhost:*', previewUrl],
      resolve: {
        // Which form opens beside each web address.
        mainDocuments: defineDocuments([
          { route: '/', filter: `_id == "home"` },
          ...FIXED_PAGES.map((p) => ({ route: fixedPath(p.id), filter: `_id == "${p.id}"` })),
          { route: '/:slug', filter: `_type == "page" && slug.current == $slug` },
        ]),
        // Where each kind of document shows up on the website.
        locations: {
          siteSettings: defineLocations({
            message: 'This is used across the whole site.',
            tone: 'caution',
            locations: [{ title: 'Home', href: '/' }],
          }),
          home: defineLocations({ locations: [{ title: 'Home', href: '/' }] }),
          page: defineLocations({
            select: { title: 'title', slug: 'slug.current' },
            resolve: (doc) => ({
              locations: doc?.slug ? [{ title: doc.title || 'Untitled', href: `/${doc.slug}` }] : [],
            }),
          }),
          fixedPage: defineLocations({
            select: { title: 'title', id: '_id' },
            resolve: (doc) => ({ locations: [{ title: doc?.title || 'Page', href: fixedPath(doc?.id) }] }),
          }),
          leader: defineLocations({ locations: [{ title: 'Leaders', href: '/leaders' }] }),
          ministry: defineLocations({ locations: [{ title: 'Leaders', href: '/leaders' }] }),
        },
      },
    }),
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
