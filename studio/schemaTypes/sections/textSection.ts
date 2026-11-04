import { defineField, defineType } from 'sanity';
import { background, eyebrow, heading, sectionPreview } from '../fields';

export default defineType({
  name: 'textSection',
  title: 'Text',
  type: 'object',
  fields: [eyebrow, heading, defineField({ name: 'body', title: 'Text', type: 'blockContent' }), background],
  preview: sectionPreview('Text'),
});
