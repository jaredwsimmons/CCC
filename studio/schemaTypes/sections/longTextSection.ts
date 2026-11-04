import { defineField, defineType } from 'sanity';
import { sectionPreview } from '../fields';

// Long documents such as the bylaws: the table of contents is built from the headings.
export default defineType({
  name: 'longTextSection',
  title: 'Long text with contents',
  type: 'object',
  fields: [
    defineField({
      name: 'body',
      title: 'Text',
      type: 'blockContent',
      description: 'Each Heading becomes an entry in the table of contents.',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: { prepare: () => ({ title: 'Long text with contents' }) },
});
