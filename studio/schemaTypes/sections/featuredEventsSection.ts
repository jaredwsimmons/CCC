import { defineType } from 'sanity';
import { eyebrow, heading, sectionPreview } from '../fields';

// Upcoming events marked “featured” in Planning Center Calendar, live.
export default defineType({
  name: 'featuredEventsSection',
  title: 'Featured events',
  type: 'object',
  description: 'Shows upcoming events marked “featured” in Planning Center Calendar.',
  fields: [eyebrow, heading],
  preview: sectionPreview('Featured events'),
});
