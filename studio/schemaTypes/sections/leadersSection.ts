import { defineField, defineType } from 'sanity';
import { background, eyebrow, heading, sectionPreview } from '../fields';

// Photos of the staff or the elders, from the Leaders list.
export default defineType({
  name: 'leadersSection',
  title: 'Leaders',
  type: 'object',
  description: 'Add, remove or reorder people under Leaders in the left menu.',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'group',
      title: 'Who to show',
      type: 'string',
      options: { list: [{ title: 'Staff', value: 'staff' }, { title: 'Elders', value: 'elder' }], layout: 'radio' },
      initialValue: 'staff',
      validation: (Rule) => Rule.required(),
    }),
    background,
  ],
  preview: sectionPreview('Leaders'),
});
