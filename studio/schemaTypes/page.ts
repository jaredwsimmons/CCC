import { defineField, defineType } from 'sanity';
import { sectionMembers } from './sections';

// Addresses owned by the fixed pages, the API and the old-URL redirects.
const RESERVED = new Set(['calendar', 'groups', 'media', 'give', 'leaders', 'api', 'home', 'history', 'our-story', 'beliefs', 'serve']);

// A page staff build from sections. New pages can start from a template (templates.ts).
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'The page’s address: “vbs-2027” makes it live at /vbs-2027. Changing it breaks old links.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) =>
        Rule.required().custom((slug) => {
          if (!slug?.current) return true;
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug.current)) return 'Use lowercase letters, numbers and dashes only, e.g. “vbs-2027”.';
          return RESERVED.has(slug.current) ? `“${slug.current}” is already used by the site.` : true;
        }),
    }),
    defineField({ name: 'header', title: 'Page header', type: 'pageHeader' }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: sectionMembers,
      options: {
        insertMenu: {
          groups: [
            {
              name: 'content',
              title: 'Content',
              of: [
                'textSection',
                'textPhotoSection',
                'cardsSection',
                'placesSection',
                'scheduleSection',
                'stepsSection',
                'accordionSection',
                'gallerySection',
                'scriptureSection',
                'ctaBandSection',
                'weeklyRhythmSection',
                'visitSection',
                'longTextSection',
              ],
            },
            {
              name: 'live',
              title: 'Live from Church Center',
              of: [
                'registrationCardSection',
                'openRegistrationsSection',
                'groupsSection',
                'featuredEventsSection',
                'announcementsSection',
                'latestMessageSection',
                'calendarEventsSection',
                'recentVideosSection',
                'podcastSection',
                'leadersSection',
                'deaconsSection',
              ],
            },
          ],
        },
      },
    }),
    defineField({
      name: 'seo',
      title: 'Search engines',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 })],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'header.image' },
    prepare: ({ title, subtitle, media }) => ({ title, subtitle: subtitle ? `/${subtitle}` : 'no address yet', media }),
  },
});
