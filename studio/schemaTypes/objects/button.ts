import { defineField, defineType } from 'sanity';
import { mailtoHref, telHref } from '../../../shared/contact-links';

// One button that works the same way in every section. Staff pick its kind; the
// site builds the link (Church Center pop-up, giving fund, ministry email, ...).
// Fund slugs are the church's Church Center giving funds.

const isChurchCenter = (url?: string) => !url || /^https:\/\/[a-z0-9-]+\.churchcenter\.com\//.test(url);
const requiredFor = (kind: string, message: string) => (value: unknown, context: { parent?: unknown }) =>
  (context.parent as { kind?: string } | undefined)?.kind === kind && !value ? message : true;

export default defineType({
  name: 'button',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Button text', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({
      name: 'kind',
      title: 'What it opens',
      type: 'string',
      options: {
        list: [
          { title: 'A page on this site', value: 'page' },
          { title: 'Church Center (form, registration, …)', value: 'churchCenter' },
          { title: 'Give to a fund', value: 'give' },
          { title: 'Email a ministry', value: 'email' },
          { title: 'An email address', value: 'emailAddress' },
          { title: 'A phone number', value: 'phone' },
          { title: 'Another website', value: 'url' },
        ],
        layout: 'radio',
      },
      initialValue: 'page',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'page',
      title: 'Page',
      type: 'reference',
      to: [{ type: 'page' }, { type: 'home' }, { type: 'fixedPage' }],
      options: { disableNew: true },
      hidden: ({ parent }) => parent?.kind !== 'page',
      validation: (Rule) => Rule.custom(requiredFor('page', 'Pick a page.')),
    }),
    defineField({
      name: 'churchCenterUrl',
      title: 'Church Center link',
      type: 'url',
      description: 'Paste the link from Church Center. It opens as a pop-up (a new tab on phones).',
      hidden: ({ parent }) => parent?.kind !== 'churchCenter',
      validation: (Rule) =>
        Rule.custom(requiredFor('churchCenter', 'Paste a Church Center link.')).custom((url) =>
          isChurchCenter(url as string | undefined) ? true : 'This must be a Church Center link (…churchcenter.com/…).',
        ),
    }),
    defineField({
      name: 'fund',
      title: 'Fund',
      type: 'string',
      description: 'Copy the fund slug from its Church Center giving link: the part after /to/, e.g. general or missions. Create and manage the fund in Planning Center first.',
      hidden: ({ parent }) => parent?.kind !== 'give',
      validation: (Rule) => Rule.custom(requiredFor('give', 'Enter a fund slug.')).custom((value) => !value || /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) || 'Use the fund slug: lowercase letters, numbers and dashes.'),
    }),
    defineField({
      name: 'amount',
      title: 'Suggested amount ($)',
      type: 'number',
      description: 'Optional. Pre-fills the giving form.',
      hidden: ({ parent }) => parent?.kind !== 'give',
      validation: (Rule) => Rule.min(1).integer(),
    }),
    defineField({
      name: 'recurring',
      title: 'Start as a recurring gift',
      type: 'boolean',
      hidden: ({ parent }) => parent?.kind !== 'give',
    }),
    defineField({
      name: 'ministry',
      title: 'Ministry',
      type: 'reference',
      to: [{ type: 'ministry' }],
      description: 'Emails the address listed for this ministry.',
      hidden: ({ parent }) => parent?.kind !== 'email',
      validation: (Rule) => Rule.custom(requiredFor('email', 'Pick a ministry.')),
    }),
    defineField({
      name: 'emailAddress',
      title: 'Email address',
      type: 'string',
      description: 'e.g. jane@example.com. Opens the visitor’s email app.',
      hidden: ({ parent }) => parent?.kind !== 'emailAddress',
      validation: (Rule) =>
        Rule.custom(requiredFor('emailAddress', 'Enter an email address.')).custom((value) =>
          !value || mailtoHref(value as string) ? true : 'Enter one email address, like jane@example.com.',
        ),
    }),
    defineField({
      name: 'phone',
      title: 'Phone number',
      type: 'string',
      description: 'With area code, e.g. 734-555-0100. Phones dial it when tapped.',
      hidden: ({ parent }) => parent?.kind !== 'phone',
      validation: (Rule) =>
        Rule.custom(requiredFor('phone', 'Enter a phone number.')).custom((value) =>
          !value || telHref(value as string) ? true : 'Enter a phone number with its area code, using only numbers, spaces, dashes, dots and brackets.',
        ),
    }),
    defineField({
      name: 'url',
      title: 'Website address',
      type: 'url',
      description: 'Opens in a new tab. A path like /bylaws opens a page of this site that isn’t in Sanity.',
      hidden: ({ parent }) => parent?.kind !== 'url',
      validation: (Rule) =>
        Rule.custom(requiredFor('url', 'Paste the website address.')).uri({
          allowRelative: true,
          scheme: ['http', 'https', 'mailto', 'tel'],
        }),
    }),
  ],
  preview: {
    select: { title: 'label', kind: 'kind' },
    prepare: ({ title, kind }) => ({
      title: title || 'Button',
      subtitle: { page: 'Page', churchCenter: 'Church Center', give: 'Give', email: 'Email', emailAddress: 'Email address', phone: 'Phone', url: 'Website' }[
        kind as string
      ],
    }),
  },
});
