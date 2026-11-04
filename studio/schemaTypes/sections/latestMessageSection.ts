import { defineField, defineType } from 'sanity';
import { eyebrow, sectionPreview } from '../fields';

// The newest sermon from YouTube or the podcast feed, live.
export default defineType({
  name: 'latestMessageSection',
  title: 'Latest message',
  type: 'object',
  fields: [
    eyebrow,
    defineField({
      name: 'source',
      title: 'Show the newest',
      type: 'string',
      options: {
        list: [
          { title: 'Video (YouTube)', value: 'video' },
          { title: 'Podcast episode', value: 'podcast' },
        ],
        layout: 'radio',
      },
      initialValue: 'podcast',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: sectionPreview('Latest message', 'eyebrow'),
});
