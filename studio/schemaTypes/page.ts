import { defineType, defineField } from 'sanity';

// A generic content page — this powers every nav page (Beliefs, Kids, Groups, Missions, ...).
export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL path',
      type: 'slug',
      description: 'The address of the page. "beliefs" makes it live at /beliefs.',
      options: { source: 'title', maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'A short sentence shown under the page title in the header.',
    }),
    defineField({
      name: 'hero',
      title: 'Hero image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional banner image. Drag the focal point so it crops well on phones.',
      fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
    }),
    defineField({
      name: 'cta',
      title: 'Call-to-action button',
      type: 'object',
      description: 'Optional button in the page header (e.g. a Church Center form or registration).',
      options: { collapsible: true, collapsed: true },
      fields: [
        { name: 'label', title: 'Button text', type: 'string' },
        { name: 'url', title: 'Link (Church Center or external URL)', type: 'url' },
        {
          name: 'openInModal',
          title: 'Open in Church Center pop-up?',
          type: 'boolean',
          initialValue: false,
          description: 'Turn on for Church Center giving / forms / registration links.',
        },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      options: { collapsible: true, collapsed: true },
      fields: [{ name: 'description', title: 'Meta description', type: 'text', rows: 2 }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current', media: 'hero' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? `/${subtitle}` : 'no url yet',
      media,
    }),
  },
});
