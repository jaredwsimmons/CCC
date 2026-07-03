import { defineType, defineField } from 'sanity';

// A single document (singleton) for site-wide bits: the announcement bar and the current series.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'announcement',
      title: 'Announcement bar',
      type: 'string',
      description: 'Short text shown in the gold bar on the homepage. Leave blank to hide it.',
    }),
    defineField({
      name: 'currentSeries',
      title: 'Current series',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        { name: 'title', title: 'Series title', type: 'string' },
        { name: 'description', title: 'Description', type: 'text', rows: 3 },
        { name: 'image', title: 'Series image', type: 'image', options: { hotspot: true } },
        { name: 'youtubeUrl', title: 'YouTube link', type: 'url' },
        { name: 'spotifyUrl', title: 'Spotify link', type: 'url' },
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
