import { defineField, defineType } from 'sanity';
import { background, eyebrow, heading, sectionPreview } from '../fields';

// Every ministry's deacons, from the Ministries & Deacons list.
export default defineType({
  name: 'deaconsSection',
  title: 'Deacons',
  type: 'object',
  description: 'Change names under Ministries & Deacons in the left menu.',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'note', title: 'Note below the list', type: 'blockContent', description: 'Optional.' }),
    background,
  ],
  preview: sectionPreview('Deacons'),
});
