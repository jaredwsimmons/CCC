import { defineField, defineType } from 'sanity';
import { eyebrow, imageWithAlt } from './fields';

// The homepage keeps its hand-tuned layout; staff edit its words and photos.
// The current series, service times and address come from Site Settings.
export default defineType({
  name: 'home',
  title: 'Home page',
  type: 'document',
  fields: [
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
