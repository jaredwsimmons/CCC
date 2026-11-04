import { defineField, defineType } from 'sanity';
import { eyebrow, sectionPreview } from '../fields';

// Shows the weekly rhythm tiles kept in Site Settings, so they're edited in one place.
export default defineType({
  name: 'weeklyRhythmSection',
  title: 'Weekly rhythm',
  type: 'object',
  description: 'Shows the weekly schedule tiles from Site Settings.',
  fields: [
    eyebrow,
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'The rhythm of our week' }),
  ],
  preview: sectionPreview('Weekly rhythm'),
});
