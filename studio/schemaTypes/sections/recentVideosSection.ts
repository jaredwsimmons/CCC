import { defineArrayMember, defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, sectionPreview } from '../fields';

// The newest services from the church's YouTube channel, live.
export default defineType({
  name: 'recentVideosSection',
  title: 'Recent videos',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'count', title: 'How many videos', type: 'number', initialValue: 6, validation: (Rule) => Rule.min(1).max(12).integer() }),
    defineField({
      name: 'excludePlaylists',
      title: 'Leave out videos in these playlists',
      type: 'array',
      description: 'YouTube playlist links, e.g. Weekly Announcements, so those videos don’t show here.',
      of: [defineArrayMember({ type: 'url', validation: (Rule) => Rule.uri({ scheme: ['https'] }) })],
    }),
    defineField({ name: 'emptyText', title: 'If YouTube can’t be reached', type: 'blockContent', description: 'Shown instead of the videos.' }),
    buttons(2),
    background,
  ],
  preview: sectionPreview('Recent videos'),
});
