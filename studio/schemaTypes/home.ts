import { defineArrayMember, defineField, defineType } from 'sanity';
import { buttons, eyebrow, imageWithAlt, imageMember } from './fields';

// The homepage keeps its hand-tuned layout; staff edit its words, buttons and photos.
// It's about the life of the church; the visitor details (service times, address,
// directions) live on I'm New. The weekly schedule comes from Weekly rhythm cards and the
// "Coming up" events live from Church Center.
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
        defineField({ name: 'text', title: 'Text under the title', type: 'text', rows: 3 }),
        imageWithAlt('image', 'Main photo', 'Shown in the large frame, and instead of the video on slow connections.'),
        defineField({
          name: 'photos',
          title: 'Smaller photos',
          type: 'array',
          description: 'Up to two, stacked beside the main photo on wide screens.',
          of: [imageMember],
          validation: (Rule) => Rule.max(2),
        }),
        buttons(2),
      ],
    }),
    defineField({
      name: 'quickLinks',
      title: 'Quick links',
      type: 'array',
      description: 'The row of tiles that overlaps the bottom of the top section.',
      validation: (Rule) => Rule.max(4),
      of: [
        defineArrayMember({
          name: 'quickLink',
          title: 'Quick link',
          type: 'object',
          fields: [
            defineField({ name: 'link', title: 'Title and where it goes', type: 'button', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', title: 'Line under the title', type: 'string' }),
            defineField({
              name: 'icon',
              title: 'Icon',
              type: 'string',
              options: {
                list: [
                  { title: 'Map pin', value: 'visit' },
                  { title: 'Play', value: 'watch' },
                  { title: 'People', value: 'groups' },
                  { title: 'Heart', value: 'prayer' },
                  { title: 'Calendar', value: 'calendar' },
                  { title: 'Gift', value: 'give' },
                ],
              },
              initialValue: 'visit',
            }),
          ],
          preview: { select: { title: 'link.label', subtitle: 'text' } },
        }),
      ],
    }),
    defineField({
      name: 'week',
      title: 'This week',
      type: 'object',
      description: 'The weekly schedule (from Weekly rhythm cards) beside upcoming events from Church Center.',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'everyWeekLabel', title: 'Label over the weekly schedule', type: 'string' }),
        defineField({ name: 'comingUpLabel', title: 'Label over the events', type: 'string' }),
        defineField({ name: 'calendarLink', title: 'Link to the calendar', type: 'button' }),
      ],
    }),
    defineField({
      name: 'places',
      title: 'Find your place',
      type: 'object',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({
          name: 'tiles',
          title: 'Tiles',
          type: 'array',
          description: 'The first tile is shown wider. A tile without a photo shows its text on a plain or pale-blue tile.',
          validation: (Rule) => Rule.max(6),
          of: [
            defineArrayMember({
              name: 'placeTile',
              title: 'Tile',
              type: 'object',
              fields: [
                defineField({ name: 'link', title: 'Title and where it goes', type: 'button', validation: (Rule) => Rule.required() }),
                defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
                imageWithAlt('image', 'Photo'),
                defineField({ name: 'cta', title: 'Link text', type: 'string', description: 'Optional, e.g. “Groups open to join”. Shown with an arrow.' }),
                defineField({ name: 'highlight', title: 'Pale blue tile', type: 'boolean', initialValue: false }),
              ],
              preview: { select: { title: 'link.label', subtitle: 'text', media: 'image' } },
            }),
          ],
        }),
        defineField({ name: 'moreLabel', title: 'Label before the extra links', type: 'string' }),
        defineField({
          name: 'moreLinks',
          title: 'Extra links',
          type: 'array',
          description: 'Ministries without a tile, shown as small buttons.',
          of: [defineArrayMember({ type: 'button' })],
          validation: (Rule) => Rule.max(10),
        }),
      ],
    }),
    defineField({
      name: 'currentSeries',
      title: 'Current sermon series',
      type: 'object',
      description: 'The homepage shows the newest sermon from the podcast feed here; these words and art stand in when the feed can’t be reached. The art is also used on the Media page for episodes without their own.',
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
        imageWithAlt('image', 'Photo', 'Shown at the top of the box.'),
        buttons(3),
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
