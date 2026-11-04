import { defineArrayMember, defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, sectionPreview } from '../fields';

export default defineType({
  name: 'cardsSection',
  title: 'Cards',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Cards per row',
      type: 'number',
      options: { list: [2, 3, 4], layout: 'radio', direction: 'horizontal' },
      initialValue: 3,
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'card',
          title: 'Card',
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Small label',
              type: 'string',
              description: 'Optional, e.g. “Step 1” or Bible references like “John 3:16”.',
            }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
            defineField({ name: 'bullets', title: 'Bullet list', type: 'array', of: [{ type: 'string' }] }),
            { ...buttons(2), title: 'Links' },
          ],
          preview: { select: { title: 'title', subtitle: 'label' } },
        }),
      ],
    }),
    background,
  ],
  preview: sectionPreview('Cards'),
});
