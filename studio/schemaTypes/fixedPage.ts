import { defineField, defineType } from 'sanity';
import { sectionMembers } from './sections';

// The pages at fixed addresses (Calendar, Groups, Media, Give, Leaders). There is one
// document per page, made by the Studio structure (sanity.config.ts). They're built from
// sections like any page; their address and page type just can't be changed or deleted.
export default defineType({
  name: 'fixedPage',
  title: 'Fixed page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'header', title: 'Page header', type: 'pageHeader' }),
    defineField({
      name: 'sections',
      title: 'Sections',
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
