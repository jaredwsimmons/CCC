import { defineField, defineType } from 'sanity';
import { sectionMembers } from './sections';

// The pages built around live data (Calendar, Groups, Media, Give, Leaders). There is
// one document per page, made by the Studio structure (sanity.config.ts); staff edit
// their words and add sections below the live part, but not the layout.
export default defineType({
  name: 'fixedPage',
  title: 'Fixed page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'header', title: 'Page header', type: 'pageHeader' }),
    defineField({
      name: 'sections',
      title: 'Sections below the live content',
      type: 'array',
      of: sectionMembers,
    }),
    defineField({
      name: 'seo',
      title: 'Search engines',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 })],
    }),
  ],
});
