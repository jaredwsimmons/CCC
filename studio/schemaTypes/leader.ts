import { defineField, defineType } from 'sanity';
import { imageWithAlt } from './fields';

// Elders, pastors and staff on the Leaders page.
export default defineType({
  name: 'leader',
  title: 'Leader',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. “Pastor of Students & Worship”' }),
    imageWithAlt('photo', 'Photo'),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 4 }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: (Rule) => Rule.email() }),
    defineField({ name: 'order', title: 'Sort order', type: 'number', description: 'Lower numbers show first.', initialValue: 100 }),
  ],
  orderings: [{ name: 'byOrder', title: 'Display order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});
