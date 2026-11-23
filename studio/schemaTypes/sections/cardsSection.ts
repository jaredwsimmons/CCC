import { defineArrayMember, defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, imageWithAlt, sectionPreview } from '../fields';

export default defineType({
  name: 'cardsSection',
  title: 'Cards',
  type: 'object',
  fields: [
    eyebrow,
    heading,
    defineField({ name: 'intro', title: 'Intro', type: 'text', rows: 2 }),
    defineField({
      name: 'columns',
      title: 'Cards per row',
      type: 'number',
      options: { list: [2, 3, 4], layout: 'radio', direction: 'horizontal' },
      initialValue: 3,
    }),
    defineField({
      name: 'cards',
      title: 'Cards',
      type: 'array',
      validation: (Rule) => Rule.required().min(1),
      of: [
        defineArrayMember({
          name: 'card',
          title: 'Card',
          type: 'object',
          fields: [
            imageWithAlt('logo', 'Logo', 'Optional, shown at the top of the card, e.g. a partner’s logo.'),
            defineField({
              name: 'logoOnDark',
              title: 'White logo',
              type: 'boolean',
              description: 'Turn on for a logo that is white, so it shows on navy instead of disappearing on white.',
              initialValue: false,
              hidden: ({ parent }) => !parent?.logo,
            }),
            defineField({
              name: 'label',
              title: 'Small label',
              type: 'string',
              description: 'Optional, e.g. “Step 1” or Bible references like “John 3:16”.',
            }),
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 3 }),
            defineField({ name: 'bullets', title: 'Bullet list', type: 'array', of: [{ type: 'string' }] }),
            { ...buttons(2), title: 'Links' },
            defineField({
              name: 'ministry',
              title: 'Deacon badge',
              type: 'reference',
              to: [{ type: 'ministry' }],
              description: 'Optional. Shows the deacons of this ministry on the card.',
            }),
            defineField({
              name: 'deaconButton',
              title: 'Deacon badge button',
              type: 'button',
              description: 'Optional link inside the deacon badge, e.g. “Email Jane” (An email address) or “Call Jane” (A phone number).',
              hidden: ({ parent }) => !parent?.ministry,
            }),
            defineField({
              name: 'memberBadge',
              title: 'Member badge',
              type: 'string',
              description: 'Optional. Any member’s name, shown in a badge at the foot of the card. Separate several names with commas.',
            }),
            defineField({
              name: 'memberButton',
              title: 'Member badge button',
              type: 'button',
              description: 'Optional link inside the member badge, e.g. “Email Jane” (An email address) or “Call Jane” (A phone number).',
              hidden: ({ parent }) => !parent?.memberBadge,
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'label', media: 'logo' } },
        }),
      ],
    }),
    background,
  ],
  preview: sectionPreview('Cards'),
});
