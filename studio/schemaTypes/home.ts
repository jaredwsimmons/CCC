import { defineField, defineType } from 'sanity';
import { eyebrow, imageWithAlt } from './fields';

// The homepage keeps its hand-tuned layout; staff edit its words and photos.
// The service times and address come from Site Settings.
export default defineType({
  name: 'home',
  title: 'Home page',
  type: 'document',
  fields: [
    defineField({
      name: 'announcement',
      title: 'Announcement bar',
      type: 'string',
      description: 'Short text shown at the top of the homepage, e.g. a weather closure. Leave blank to hide it.',
    }),
    defineField({
      name: 'hero',
      title: 'Top of the page',
      type: 'object',
      fields: [
        eyebrow,
        defineField({
          name: 'title',
          title: 'Title',
          type: 'text',
          rows: 2,
          description: 'Each line shows on its own line.',
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: 'subline', title: 'Line under the title', type: 'string', description: 'e.g. “Worship & Community Groups”. The service times are added after it.' }),
        imageWithAlt('image', 'Photo', 'Shown behind the title, and instead of the video on slow connections.'),
      ],
    }),
    defineField({
      name: 'welcome',
      title: 'Welcome',
      type: 'object',
      fields: [eyebrow, defineField({ name: 'heading', title: 'Heading', type: 'string' }), defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 })],
    }),
    defineField({
      name: 'currentSeries',
      title: 'Current sermon series',
      type: 'object',
      description: 'Its art is also used on the Media page for episodes without their own.',
      fields: [
        defineField({ name: 'title', title: 'Series title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        imageWithAlt('image', 'Series art'),
        defineField({ name: 'watchUrl', title: 'Watch link', type: 'url' }),
        defineField({ name: 'listenUrl', title: 'Listen link', type: 'url' }),
      ],
    }),
    defineField({
      name: 'app',
      title: 'App spotlight',
      type: 'object',
      fields: [
        eyebrow,
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
        imageWithAlt('image', 'Photo'),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'Search engines',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 })],
    }),
  ],
  preview: { prepare: () => ({ title: 'Home page' }) },
});
