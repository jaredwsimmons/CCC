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
    defineField({ name: 'watchLabel', title: 'Watch button text', type: 'string', initialValue: 'Watch on YouTube' }),
    defineField({ name: 'watchUrl', title: 'Video archive link', type: 'url', description: 'Used when the message has no matched video. Labeled “Browse videos” so it does not promise that exact message.' }),
    defineField({ name: 'browseLabel', title: 'Video archive button text', type: 'string', initialValue: 'Browse videos' }),
    defineField({ name: 'listenLabel', title: 'Listen button text', type: 'string', initialValue: 'Listen' }),
  ],
  preview: sectionPreview('Latest message', 'eyebrow'),
});
