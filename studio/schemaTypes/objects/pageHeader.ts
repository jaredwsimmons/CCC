import { defineField, defineType } from 'sanity';
import { buttons, eyebrow, imageWithAlt } from '../fields';

// The top of every page: label, title, intro, optional photo, buttons, deacon card.
export default defineType({
  name: 'pageHeader',
  title: 'Page header',
  type: 'object',
  fields: [
    eyebrow,
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Leave blank to use the page title.',
    }),
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 3 }),
    imageWithAlt('image', 'Photo', 'Optional. With a photo the header becomes a full-width photo banner.'),
    buttons(2),
    defineField({
      name: 'ministry',
      title: 'Deacon card',
      type: 'reference',
      to: [{ type: 'ministry' }],
      description: 'Optional. Shows the deacons who serve this ministry.',
    }),
  ],
});
