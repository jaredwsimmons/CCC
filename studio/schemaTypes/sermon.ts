import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'sermon',
  title: 'Sermon',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'date', title: 'Date', type: 'date' }),
    defineField({ name: 'speaker', title: 'Speaker', type: 'string' }),
    defineField({ name: 'series', title: 'Series', type: 'string' }),
    defineField({ name: 'scripture', title: 'Scripture', type: 'string', description: 'e.g. "Matthew 5:1–12"' }),
    defineField({ name: 'youtubeUrl', title: 'YouTube URL', type: 'url' }),
    defineField({ name: 'spotifyUrl', title: 'Spotify URL', type: 'url' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
  ],
  orderings: [{ name: 'byDate', title: 'Newest first', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', speaker: 'speaker', date: 'date' },
    prepare: ({ title, speaker, date }) => ({
      title,
      subtitle: [speaker, date ? new Date(date).toLocaleDateString() : null].filter(Boolean).join(' · '),
    }),
  },
});
