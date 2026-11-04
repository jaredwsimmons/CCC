import { defineField, defineType } from 'sanity';
import { buttons, sectionPreview } from '../fields';

const ctaButtons = buttons(2);

export default defineType({
  name: 'ctaBandSection',
  title: 'Call-to-action band',
  type: 'object',
  fields: [
    defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required() }),
    defineField({ name: 'text', title: 'One line', type: 'string' }),
    { ...ctaButtons, validation: (Rule) => Rule.required().min(1).max(2) },
  ],
  preview: sectionPreview('Call-to-action band'),
});
