import { defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, imageMember, sectionPreview } from '../fields';

export default defineType({
  name: 'textPhotoSection',
  title: 'Text + Photo',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'body', title: 'Text', type: 'blockContent' }),
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [imageMember],
      description: 'Optional: up to 3 photos. Several are stacked beside the text.',
      validation: (Rule) => Rule.max(3),
    }),
    defineField({
      name: 'photoSide',
      title: 'Photo side',
      type: 'string',
      options: { list: ['left', 'right'], layout: 'radio', direction: 'horizontal' },
      initialValue: 'right',
    }),
    buttons(2),
    background,
  ],
  preview: sectionPreview('Text + Photo'),
});
