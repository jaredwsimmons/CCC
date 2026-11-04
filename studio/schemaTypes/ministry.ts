import { defineField, defineType } from 'sanity';

// A ministry or area of service: its contact address (for “Email a ministry” buttons)
// and its deacons (for page deacon cards and the deacon list on the Leaders page).
export default defineType({
  name: 'ministry',
  title: 'Ministry',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Ministry or area',
      type: 'string',
      description: 'e.g. “Women”, “Kids” or “Benevolence”.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Contact email',
      type: 'string',
      description: 'Where “Email a ministry” buttons send people.',
      validation: (Rule) => Rule.email(),
    }),
    defineField({ name: 'contactName', title: 'Contact person', type: 'string', description: 'First name, e.g. “Tammy”.' }),
    defineField({ name: 'deacons', title: 'Deacons', type: 'array', of: [{ type: 'string' }] }),
  ],
  orderings: [{ name: 'byName', title: 'Name', by: [{ field: 'name', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', email: 'email', deacons: 'deacons' },
    prepare: ({ title, email, deacons }) => ({ title, subtitle: [email, (deacons ?? []).join(', ')].filter(Boolean).join(' · ') }),
  },
});
