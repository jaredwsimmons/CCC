import { defineField, defineType } from 'sanity';
import { background, buttons, eyebrow, heading, sectionPreview } from '../fields';

export default defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  fields: [eyebrow, heading, defineField({ name: 'body', title: 'Text', type: 'blockContent' }), buttons(2), background],
  preview: sectionPreview('Text'),
});
