import { defineField, defineType } from 'sanity';
import { eyebrow, heading, sectionPreview } from '../fields';

// Every open Church Center registration, live, optionally narrowed by a word in its name.
export default defineType({
  name: 'openRegistrationsSection',
  title: 'Open registrations',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'match',
      title: 'Only show names containing',
      type: 'string',
      description: 'Optional, e.g. “Women’s” or “C3SM”. Leave blank to show every open registration.',
    }),
  ],
  preview: sectionPreview('Open registrations'),
});
