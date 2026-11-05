import { defineArrayMember, defineField, defineType } from 'sanity';

// The weekly schedule cards, kept in one place so a change shows everywhere they're used.
export default defineType({
  name: 'weeklyRhythm',
  title: 'Weekly rhythm cards',
  type: 'document',
  fields: [
    defineField({
      name: 'tiles',
      title: 'Cards',
      type: 'array',
      description: 'Shown on the I’m New and Calendar pages, and anywhere a Weekly rhythm section is added.',
      of: [
        defineArrayMember({
          name: 'rhythmTile',
          title: 'Card',
          type: 'object',
          fields: [
            defineField({ name: 'category', title: 'Small label', type: 'string', description: 'e.g. “Worship”' }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'time', title: 'When', type: 'string' }),
            defineField({ name: 'location', title: 'Where', type: 'string' }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
            defineField({ name: 'button', title: 'Link', type: 'button' }),
          ],
          preview: { select: { title: 'title', subtitle: 'time' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Weekly rhythm cards' }) },
});
