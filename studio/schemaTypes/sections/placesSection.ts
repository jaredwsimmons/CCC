import { defineArrayMember, defineField, defineType } from 'sanity';
import { eyebrow, heading, imageWithAlt, sectionPreview } from '../fields';

// Ministry tiles (photo, or words on a plain or pale-blue tile) and small buttons for the rest.
export default defineType({
  name: 'placesSection',
  title: 'Find your place',
  type: 'object',
  fields: [
    eyebrow,
    heading,
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
  preview: sectionPreview('Find your place'),
});
