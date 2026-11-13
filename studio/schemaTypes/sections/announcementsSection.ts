import { defineField, defineType } from 'sanity';
import { eyebrow, heading, sectionPreview } from '../fields';

// Announcements from Church Center (the same list as chelseachurch.churchcenter.com/announcements), live.
export default defineType({
  name: 'announcementsSection',
  title: 'Announcements',
  type: 'object',
  description: 'Shows the current announcements from Church Center, featured ones first. Edit them in Church Center.',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'unavailableMessage', title: 'When announcements cannot load', type: 'string', initialValue: 'We could not load announcements right now.' }),
    defineField({ name: 'emptyText', title: 'When there are no announcements', type: 'blockContent', description: 'Shown instead of the list when Church Center has none.' }),
  ],
  preview: sectionPreview('Announcements'),
});
