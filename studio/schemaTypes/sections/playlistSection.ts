import { defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, sectionPreview } from '../fields';

// A YouTube playlist, live: the newest video plays on the page, the next few link to YouTube.
export default defineType({
  name: 'playlistSection',
  title: 'Video playlist',
  type: 'object',
  description: 'Shows a YouTube playlist, newest first, e.g. Weekly Announcements. Add videos to the playlist on YouTube.',
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'playlist',
      title: 'Playlist link',
      type: 'url',
      description: 'The playlist’s YouTube link (it contains “list=”).',
      validation: (Rule) => Rule.required().uri({ scheme: ['https'] }),
    }),
    defineField({ name: 'count', title: 'How many earlier videos to list', type: 'number', initialValue: 3, validation: (Rule) => Rule.min(0).max(9).integer() }),
    defineField({
      name: 'videoLabels',
      title: 'Short video headings',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Optional headings, newest first. Weekly announcements use “This week”, “Last week”, and “Two weeks ago”. Leave blank to show the YouTube titles.',
      validation: (Rule) => Rule.max(10),
    }),
    buttons(2),
    background,
  ],
  preview: sectionPreview('Video playlist'),
});
