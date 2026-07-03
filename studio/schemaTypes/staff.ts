import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'staff',
  title: 'Leader / Staff',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'role', title: 'Role', type: 'string', description: 'e.g. "Student & Worship Pastor"' }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'bio', title: 'Bio', type: 'text', rows: 4 }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'order', title: 'Sort order', type: 'number', description: 'Lower numbers show first.', initialValue: 100 }),
  ],
  orderings: [{ name: 'byOrder', title: 'Display order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'photo' } },
});
