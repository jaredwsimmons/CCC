import { defineArrayMember, defineField, defineType } from 'sanity';
import { buttons, eyebrow, imageWithAlt } from './fields';

// The homepage keeps its hand-tuned layout; staff edit its words, buttons and photos.
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
        buttons(2),
      ],
    }),
    defineField({
      name: 'band',
      title: 'Band under the top of the page',
      type: 'object',
      description: 'The service times and address come from Site Settings.',
      fields: [
        defineField({ name: 'sundayLabel', title: 'Label before the service times', type: 'string' }),
        defineField({ name: 'directionsLabel', title: 'Directions link text', type: 'string' }),
      ],
    }),
    defineField({
      name: 'welcome',
      title: 'Welcome',
      type: 'object',
      fields: [eyebrow, defineField({ name: 'heading', title: 'Heading', type: 'string' }), defineField({ name: 'text', title: 'Text', type: 'text', rows: 4 }), buttons(2)],
    }),
    defineField({
      name: 'currentSeries',
      title: 'Current sermon series',
      type: 'object',
      description: 'Its art is also used on the Media page for episodes without their own.',
      fields: [
        eyebrow,
        defineField({ name: 'title', title: 'Series title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        imageWithAlt('image', 'Series art'),
        buttons(2),
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
        buttons(3),
      ],
    }),
    defineField({
      name: 'contact',
      title: 'Get in touch',
      type: 'object',
      fields: [
        eyebrow,
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({
          name: 'cards',
          title: 'Cards',
          type: 'array',
          validation: (Rule) => Rule.max(4),
          of: [
            defineArrayMember({
              name: 'contactCard',
              title: 'Card',
              type: 'object',
              fields: [
                defineField({ name: 'link', title: 'Card title and where it goes', type: 'button', validation: (Rule) => Rule.required() }),
                defineField({ name: 'text', title: 'Text', type: 'string' }),
              ],
              preview: { select: { title: 'link.label', subtitle: 'text' } },
            }),
          ],
        }),
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
