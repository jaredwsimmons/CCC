import { defineField, defineType } from 'sanity';
import { sectionMembers, sectionMenu } from './sections';

import { addressIsUnique, validAddress } from '../lib/page-address';

// A page staff build from sections. New pages can start from a template (templates.ts).
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Page title', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description: 'The page’s address: “vbs-2027” makes it live at /vbs-2027. Before changing it, add the previous address to Old addresses below.',
      options: { source: 'title', maxLength: 96, isUnique: addressIsUnique },
      validation: (Rule) => Rule.required().custom((slug) => validAddress(slug?.current)),
    }),
    defineField({
      name: 'previousSlugs', title: 'Old addresses', type: 'array',
      description: 'Before changing the web address above, add its old value here without a slash. Old links will redirect to this page after publishing. Never reuse an address that another page owns.',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.unique().custom(async (values, context) => {
        const current = (context.document?.slug as { current?: string })?.current;
        for (const value of values ?? []) {
          const valid = validAddress(value as string);
          if (valid !== true) return valid;
          if (value === current) return 'An old address cannot match the current web address.';
          if (!await addressIsUnique(value as string, context)) return `“${value}” belongs to another page or redirect.`;
        }
        return true;
      }),
    }),
    defineField({ name: 'header', title: 'Page header', type: 'pageHeader' }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      of: sectionMembers,
      options: sectionMenu,
    }),
    defineField({
      name: 'seo',
      title: 'Search engines',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 })],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'header.image' },
    prepare: ({ title, subtitle, media }) => ({ title, subtitle: subtitle ? `/${subtitle}` : 'no address yet', media }),
  },
});
