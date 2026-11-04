import { defineField, defineType } from 'sanity';
import { eyebrow, heading, sectionPreview } from '../fields';

// Church Center groups open to join, live, optionally of one group type.
export default defineType({
  name: 'groupsSection',
  title: 'Groups',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'groupType',
      title: 'Group type',
      type: 'string',
      options: { list: ['Community Groups', "Women's Groups", 'Ministry Groups'] },
      description: 'Leave blank to show every open group.',
    }),
  ],
  preview: sectionPreview('Groups'),
});
