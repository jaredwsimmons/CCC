import { defineArrayMember, defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, sectionPreview } from '../fields';

export default defineType({
  name: 'accordionSection',
  title: 'Tap-to-open list',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'items',
      title: 'Rows',
      type: 'array',
      description: 'Each row shows its title. Visitors tap it to read the rest, which suits beliefs or FAQs.',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'item',
          title: 'Row',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({
              name: 'label',
              title: 'Small label',
              type: 'string',
              description: 'Optional, e.g. Bible references like “John 3:16; Romans 8:29”.',
            }),
            defineField({ name: 'body', title: 'Text', type: 'blockContent', validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'title', subtitle: 'label' } },
        }),
      ],
    }),
    defineField({ name: 'closing', title: 'Closing note', type: 'text', rows: 2 }),
    buttons(2),
    background,
  ],
  preview: sectionPreview('Tap-to-open list'),
});
