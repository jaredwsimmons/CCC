import { defineField, defineType } from 'sanity';
import { background, eyebrow, heading, sectionPreview } from '../fields';

// Upcoming events from Church Center, live, with its List and Month views.
export default defineType({
  name: 'calendarEventsSection',
  title: 'Calendar',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'emptyText', title: 'When there are no events', type: 'blockContent', description: 'Shown instead of the calendar when Church Center has nothing upcoming.' }),
    defineField({ name: 'note', title: 'Note below the calendar', type: 'blockContent', description: 'Optional.' }),
    background,
  ],
  preview: sectionPreview('Calendar'),
});
