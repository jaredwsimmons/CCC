import { defineField, defineType } from 'sanity';
import { buttons, sectionPreview } from '../fields';

// The "This Sunday" card for visitors. The service times, address and map link come from
// Site Settings, so they're never out of step with the rest of the site.
export default defineType({
  name: 'visitSection',
  title: 'This Sunday card',
  type: 'object',
  description: 'Service times, address and directions, from Site Settings. Placed first on a page, it overlaps the page header.',
  fields: [
    defineField({ name: 'label', title: 'Small label', type: 'string', initialValue: 'This Sunday' }),
    defineField({ name: 'subline', title: 'Line under the times', type: 'string', description: 'e.g. “Worship & Community Groups”' }),
    defineField({ name: 'note', title: 'Extra line', type: 'string', description: 'e.g. “Programming for kids and students at both hours”' }),
    buttons(1),
    defineField({ name: 'directionsLabel', title: 'Directions link text', type: 'string', initialValue: 'Get directions', description: 'Leave blank to hide the directions link.' }),
  ],
  preview: sectionPreview('This Sunday card', 'label'),
});
