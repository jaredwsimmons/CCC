import { defineField, defineType } from 'sanity';
import { eyebrow, sectionPreview } from '../fields';

// Shows the Weekly rhythm cards, so they're edited in one place.
export default defineType({
  name: 'weeklyRhythmSection',
  title: 'Weekly rhythm',
  type: 'object',
  description: 'Edit the cards themselves under Weekly rhythm cards in the left menu, or click one in Live Preview.',
  fields: [
    eyebrow,
    defineField({ name: 'heading', title: 'Heading', type: 'string', initialValue: 'The rhythm of our week' }),
  ],
  preview: sectionPreview('Weekly rhythm'),
});
