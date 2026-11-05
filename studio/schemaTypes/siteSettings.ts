import { defineArrayMember, defineField, defineType } from 'sanity';

const pageRef = defineField({
  name: 'page',
  title: 'Page',
  type: 'reference',
  to: [{ type: 'page' }, { type: 'home' }, { type: 'fixedPage' }],
  options: { disableNew: true },
  validation: (Rule) => Rule.required(),
});

// One document for what appears site-wide.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'menu', title: 'Menu', default: true },
    { name: 'church', title: 'Church info' },
    { name: 'footer', title: 'Footer' },
    { name: 'other', title: 'Other wording' },
  ],
  fields: [
    defineField({ name: 'giveButton', title: 'Give button', type: 'button', group: 'menu', description: 'The gold button at the end of the menu.' }),
    defineField({
      name: 'menu',
      title: 'Menu',
      type: 'array',
      group: 'menu',
      description: 'The main menu, in order. An item with sub-items becomes a dropdown.',
      of: [
        defineArrayMember({
          name: 'menuItem',
          title: 'Menu item',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            pageRef,
            defineField({
              name: 'children',
              title: 'Sub-items',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'menuChild',
                  title: 'Sub-item',
                  type: 'object',
                  fields: [defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }), pageRef],
                  preview: { select: { title: 'label', subtitle: 'page.title' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'page.title' } },
        }),
      ],
    }),
    defineField({
      name: 'serviceTimes',
      title: 'Sunday service times',
      type: 'array',
      group: 'church',
      of: [{ type: 'string' }],
      description: 'e.g. “9:00 AM”',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'church',
      fields: [
        defineField({ name: 'line1', title: 'Street', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'zip', title: 'ZIP', type: 'string' }),
        defineField({ name: 'mapsUrl', title: 'Map link', type: 'url' }),
      ],
    }),
    defineField({ name: 'churchName', title: 'Church name', type: 'string', group: 'church', description: 'Shown in the footer and browser tabs.' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'church' }),
    defineField({ name: 'description', title: 'Description for search engines', type: 'text', rows: 2, group: 'church', description: 'Used on any page without its own.' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'church' }),
    defineField({ name: 'email', title: 'Main email', type: 'string', group: 'church', validation: (Rule) => Rule.email() }),
    defineField({
      name: 'footerPrayer',
      title: 'Footer: prayer link',
      type: 'button',
      group: 'church',
      description: 'Shown under “Prayer” in the footer. Leave it empty to hide the link.',
    }),
    defineField({ name: 'footerTouchHeading', title: 'First column heading', type: 'string', group: 'footer' }),
    defineField({ name: 'footerEmailText', title: 'Email link text', type: 'string', group: 'footer' }),
    defineField({ name: 'footerConnectHeading', title: 'Second column heading', type: 'string', group: 'footer' }),
    defineField({ name: 'footerConnect', title: 'Second column links', type: 'array', group: 'footer', of: [defineArrayMember({ type: 'button' })] }),
    defineField({ name: 'footerExploreHeading', title: 'Third column heading', type: 'string', group: 'footer' }),
    defineField({ name: 'footerExplore', title: 'Third column links', type: 'array', group: 'footer', of: [defineArrayMember({ type: 'button' })] }),
    defineField({
      name: 'deaconCardText',
      title: 'Deacon card wording',
      type: 'string',
      group: 'other',
      description: 'The line under the names on a ministry page’s deacon card.',
    }),
    defineField({
      name: 'notFound',
      title: 'Page not found',
      type: 'object',
      group: 'other',
      description: 'What visitors see at an address that doesn’t exist.',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
        defineField({ name: 'buttons', title: 'Buttons', type: 'array', of: [defineArrayMember({ type: 'button' })], validation: (Rule) => Rule.max(2) }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
