import { defineField, defineType } from 'sanity';
import { eyebrow, heading, sectionPreview } from '../fields';

// Upcoming events, live: open Church Center registrations and calendar events whose names match.
export default defineType({
  name: 'openRegistrationsSection',
  title: 'Upcoming events',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'match',
      title: 'Show events with these words in their name',
      type: 'string',
      description: 'Words from the event names in Planning Center, separated by commas, e.g. “Men’s” or “Kids, K-5”. The section stays hidden when nothing matches. Leave blank to show every open registration.',
    }),
  ],
  preview: sectionPreview('Upcoming events'),
});
