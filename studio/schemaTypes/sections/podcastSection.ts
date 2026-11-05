import { defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, sectionPreview } from '../fields';

// Recent sermon podcast episodes, live.
export default defineType({
  name: 'podcastSection',
  title: 'Podcast episodes',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'count', title: 'How many episodes', type: 'number', initialValue: 6, validation: (Rule) => Rule.min(1).max(12).integer() }),
    defineField({
      name: 'skipNewest',
      title: 'Skip the newest episode',
      type: 'boolean',
      description: 'Turn on when a Latest message section is already showing it.',
      initialValue: true,
    }),
    defineField({ name: 'emptyText', title: 'If the podcast can’t be reached', type: 'blockContent', description: 'Shown instead of the episodes.' }),
    buttons(3),
    background,
  ],
  preview: sectionPreview('Podcast episodes'),
});
