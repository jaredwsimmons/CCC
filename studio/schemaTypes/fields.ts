import { defineArrayMember, defineField } from 'sanity';

// Fields shared by several section types, so every section offers them the same way.

const altField = defineField({
  name: 'alt',
  title: 'Alt text',
  type: 'string',
  description: 'One sentence describing the photo for blind visitors, e.g. “Kids singing at VBS”.',
  validation: (Rule) => Rule.required(),
});

/** A photo with required alt text (described for blind visitors) and a focal point. */
export const imageWithAlt = (name: string, title: string, description?: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: { hotspot: true },
    fields: [altField],
  });

/** The same photo, as an item in a list of photos (or in rich text). */
export const imageMember = defineArrayMember({
  type: 'image',
  options: { hotspot: true },
  fields: [altField],
});

/** Small label above a heading, e.g. “Discipleship”. */
export const eyebrow = defineField({
  name: 'eyebrow',
  title: 'Small label',
  type: 'string',
  description: 'Optional short label shown above the heading.',
});

export const heading = defineField({ name: 'heading', title: 'Heading', type: 'string' });

/** Background of a section. The design picks the exact colors. */
export const background = defineField({
  name: 'background',
  title: 'Background',
  type: 'string',
  options: {
    list: [
      { title: 'Plain', value: 'plain' },
      { title: 'Tinted', value: 'tinted' },
      { title: 'Navy', value: 'navy' },
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
  initialValue: 'plain',
});

/** How a section appears in a page's list of sections: its heading, then its type. */
export const sectionPreview = (label: string, field = 'heading') => ({
  select: { title: field },
  prepare: ({ title }: { title?: string }) => ({ title: title || label, subtitle: label }),
});

/** Up to `max` buttons. */
export const buttons = (max: number) =>
  defineField({
    name: 'buttons',
    title: max === 1 ? 'Button' : 'Buttons',
    type: 'array',
    of: [defineArrayMember({ type: 'button' })],
    validation: (Rule) => Rule.max(max),
  });
