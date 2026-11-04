import { defineArrayMember, defineField, defineType } from 'sanity';
import { imageWithAlt } from './fields';

const pageRef = defineField({
  name: 'page',
  title: 'Page',
  type: 'reference',
  to: [{ type: 'page' }, { type: 'home' }, { type: 'fixedPage' }],
  options: { disableNew: true },
  validation: (Rule) => Rule.required(),
});

// One document for what appears site-wide.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'news', title: 'Announcement & series', default: true },
    { name: 'menu', title: 'Menu' },
    { name: 'church', title: 'Church info' },
    { name: 'rhythm', title: 'Weekly rhythm' },
  ],
  fields: [
    defineField({
      name: 'announcement',
      title: 'Announcement bar',
      type: 'string',
      group: 'news',
      description: 'Short text shown at the top of the homepage, e.g. a weather closure. Leave blank to hide it.',
    }),
    defineField({
      name: 'currentSeries',
      title: 'Current sermon series',
      type: 'object',
      group: 'news',
      fields: [
        defineField({ name: 'title', title: 'Series title', type: 'string' }),
        defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
        imageWithAlt('image', 'Series art'),
        defineField({ name: 'watchUrl', title: 'Watch link', type: 'url' }),
        defineField({ name: 'listenUrl', title: 'Listen link', type: 'url' }),
      ],
    }),
    defineField({
      name: 'menu',
      title: 'Menu',
      type: 'array',
      group: 'menu',
      description: 'The main menu, in order. An item with sub-items becomes a dropdown.',
      of: [
        defineArrayMember({
          name: 'menuItem',
          title: 'Menu item',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            pageRef,
            defineField({
              name: 'children',
              title: 'Sub-items',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'menuChild',
                  title: 'Sub-item',
                  type: 'object',
                  fields: [defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }), pageRef],
                  preview: { select: { title: 'label', subtitle: 'page.title' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'page.title' } },
        }),
      ],
    }),
    defineField({
      name: 'serviceTimes',
      title: 'Sunday service times',
      type: 'array',
      group: 'church',
      of: [{ type: 'string' }],
      description: 'e.g. “9:00 AM”',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'church',
      fields: [
        defineField({ name: 'line1', title: 'Street', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'zip', title: 'ZIP', type: 'string' }),
        defineField({ name: 'mapsUrl', title: 'Map link', type: 'url' }),
      ],
    }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'church' }),
    defineField({ name: 'email', title: 'Main email', type: 'string', group: 'church', validation: (Rule) => Rule.email() }),
    defineField({
      name: 'social',
      title: 'Social and podcast links',
      type: 'object',
      group: 'church',
      fields: ['facebook', 'instagram', 'youtube', 'spotify', 'applePodcasts', 'amazonMusic', 'textSignup'].map((name) =>
        defineField({
          name,
          type: 'url',
          title: {
            facebook: 'Facebook',
            instagram: 'Instagram',
            youtube: 'YouTube',
            spotify: 'Spotify',
            applePodcasts: 'Apple Podcasts',
            amazonMusic: 'Amazon Music',
            textSignup: 'Text updates sign-up',
          }[name],
        }),
      ),
    }),
    defineField({
      name: 'weeklyRhythm',
      title: 'Weekly rhythm',
      type: 'array',
      group: 'rhythm',
      description: 'The tiles shown on the Calendar and I’m New pages (and any “Weekly rhythm” section).',
      of: [
        defineArrayMember({
          name: 'rhythmTile',
          title: 'Tile',
          type: 'object',
          fields: [
            defineField({ name: 'category', title: 'Small label', type: 'string', description: 'e.g. “Worship”' }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'time', title: 'When', type: 'string' }),
            defineField({ name: 'location', title: 'Where', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({ name: 'button', title: 'Link', type: 'button' }),
          ],
          preview: { select: { title: 'title', subtitle: 'time' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
