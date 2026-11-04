import { defineField, defineType } from 'sanity';

// One Church Center registration, shown live: name, image, date, price, open/full,
// with a Register button. Hides itself once registration closes.
export default defineType({
  name: 'registrationCardSection',
  title: 'Registration card',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'Church Center registration link',
      type: 'url',
      description: 'e.g. https://chelseachurch.churchcenter.com/registrations/events/1234567',
      validation: (Rule) =>
        Rule.required().custom((url) =>
          !url || /^https:\/\/[a-z0-9-]+\.churchcenter\.com\/registrations\/events\/\d+/.test(url as string)
            ? true
            : 'Paste a Church Center registration link (…churchcenter.com/registrations/events/…).',
        ),
    }),
  ],
  preview: { select: { url: 'url' }, prepare: ({ url }) => ({ title: 'Registration card', subtitle: url }) },
});
