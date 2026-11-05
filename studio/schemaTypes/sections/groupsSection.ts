import { defineField, defineType } from 'sanity';
import { background, eyebrow, heading, sectionPreview } from '../fields';

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
    defineField({ name: 'filters', title: 'Show filter buttons', type: 'boolean', description: 'Lets visitors narrow the list by group type.', initialValue: false }),
    defineField({ name: 'emptyText', title: 'When there are no open groups', type: 'blockContent', description: 'Shown instead of the list. Leave blank to hide the section.' }),
    defineField({ name: 'note', title: 'Note below the list', type: 'blockContent', description: 'Optional.' }),
    background,
  ],
  preview: sectionPreview('Groups'),
});
