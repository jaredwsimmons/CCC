import { defineField, defineType } from 'sanity';
import { heading, imageMember, sectionPreview } from '../fields';

export default defineType({
  name: 'gallerySection',
  title: 'Photo gallery',
  type: 'object',
  fields: [
    heading,
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      of: [imageMember],
      options: { layout: 'grid' },
      validation: (Rule) => Rule.required().min(3).max(12),
    }),
  ],
  preview: sectionPreview('Photo gallery'),
});
