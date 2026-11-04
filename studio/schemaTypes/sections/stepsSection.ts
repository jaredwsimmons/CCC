import { defineArrayMember, defineField, defineType } from 'sanity';
import { eyebrow, heading, sectionPreview } from '../fields';

export default defineType({
  name: 'stepsSection',
  title: 'Steps',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      description: 'Numbered automatically, in this order.',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'step',
          title: 'Step',
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string' }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 2, validation: (Rule) => Rule.required() }),
          ],
          preview: { select: { title: 'title', subtitle: 'text' } },
        }),
      ],
    }),
    defineField({ name: 'closing', title: 'Closing note', type: 'text', rows: 2 }),
  ],
  preview: sectionPreview('Steps'),
});
