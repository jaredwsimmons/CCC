import { defineField, defineType } from 'sanity';

// These retain the current homepage designs and read their words from Home page.
// They can be moved alongside the same approved sections used on other pages.
export const homeSectionTypes = [
  ['homeWeekSection', 'This week', 'Weekly schedule and upcoming Church Center events. Edit its wording in This week below.'],
  ['homeAnnouncementsSection', 'Announcements', 'Church Center announcements. Edit its heading and links in Announcements below.'],
  ['homeHighlightsSection', 'Message & app spotlight', 'The latest message beside the app spotlight. Edit their content in the fields below.'],
].map(([name, title, description]) => defineType({
  name, title, type: 'object', description,
  fields: [defineField({ name: 'hidden', title: 'Hide this section', type: 'boolean', initialValue: false,
    description: 'Keep its content but leave it off the website.' })],
  preview: { select: { hidden: 'hidden' }, prepare: ({ hidden }) => ({ title, subtitle: hidden ? 'Hidden' : description }) },
}));

export { defaultHomeSections } from '../../shared/home-sections';
