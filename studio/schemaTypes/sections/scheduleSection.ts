import { defineArrayMember, defineField, defineType } from 'sanity';
import { buttons, eyebrow, heading, sectionPreview } from '../fields';

// Text and buttons beside a schedule card, e.g. “Get Ready For Sunday” on Kids.
export default defineType({
  name: 'scheduleSection',
  title: 'Schedule',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'intro', title: 'Text beside the schedule', type: 'text', rows: 3 }),
    buttons(2),
    defineField({ name: 'cardTitle', title: 'Schedule title', type: 'string', description: 'e.g. “Sunday Schedule”' }),
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
    defineField({ name: 'cardLink', title: 'Link under the schedule', type: 'button' }),
  ],
  preview: sectionPreview('Schedule'),
});
