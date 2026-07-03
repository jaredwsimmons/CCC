import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Event name', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'slug', title: 'URL path', type: 'slug', options: { source: 'title', maxLength: 96 } }),
    defineField({ name: 'startsAt', title: 'Starts', type: 'datetime', validation: (Rule) => Rule.required() }),
    defineField({ name: 'endsAt', title: 'Ends', type: 'datetime' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    defineField({
      name: 'registrationUrl',
      title: 'Registration link',
      type: 'url',
      description: 'Church Center registration URL, if this event needs sign-ups.',
    }),
  ],
  orderings: [{ name: 'byDate', title: 'By date', by: [{ field: 'startsAt', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', date: 'startsAt', subtitle: 'location' },
    prepare: ({ title, date, subtitle }) => ({
      title,
      subtitle: [date ? new Date(date).toLocaleDateString() : null, subtitle].filter(Boolean).join(' · '),
    }),
  },
});
