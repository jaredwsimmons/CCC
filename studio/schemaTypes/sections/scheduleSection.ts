import { defineArrayMember, defineField, defineType } from 'sanity';
import { buttons, eyebrow, heading, sectionPreview } from '../fields';

export default defineType({
  name: 'scheduleSection',
  title: 'Schedule',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'rows',
      title: 'Times',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'scheduleRow',
          title: 'Time',
          type: 'object',
          fields: [
            defineField({ name: 'time', title: 'When', type: 'string', description: 'e.g. “9:00 AM” or “Wednesday Nights”', validation: (Rule) => Rule.required() }),
            defineField({ name: 'what', title: 'What', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'place', title: 'Where', type: 'string' }),
          ],
          preview: { select: { title: 'time', subtitle: 'what' } },
        }),
      ],
    }),
    defineField({ name: 'note', title: 'Note', type: 'text', rows: 2 }),
    buttons(1),
  ],
  preview: sectionPreview('Schedule'),
});
