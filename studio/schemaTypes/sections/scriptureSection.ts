import { defineField, defineType } from 'sanity';
import { sectionPreview } from '../fields';

export default defineType({
  name: 'scriptureSection',
  title: 'Scripture quote',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Verse', type: 'text', rows: 3, validation: (Rule) => Rule.required() }),
    defineField({
      name: 'reference',
      title: 'Reference',
      type: 'string',
      description: 'e.g. “2 Corinthians 9:7”',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: sectionPreview('Scripture quote', 'reference'),
});
