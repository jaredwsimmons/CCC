import type { Template } from 'sanity';

// Starter pages: a template only sets a new page's first sections; staff can add,
// remove or reorder any of them. (Each array item needs its own _key.)
export const pageTemplates: Template[] = [
  {
    id: 'page-ministry',
    title: 'Ministry page',
    schemaType: 'page',
    value: {
      header: { _type: 'pageHeader', eyebrow: 'Ministries' },
      sections: [
        { _type: 'textPhotoSection', _key: 'intro', photoSide: 'right', background: 'plain' },
        { _type: 'scheduleSection', _key: 'schedule', heading: 'When we meet' },
        { _type: 'openRegistrationsSection', _key: 'events', heading: 'Coming up' },
        { _type: 'ctaBandSection', _key: 'cta' },
      ],
    },
  },
  {
    id: 'page-info',
    title: 'Info page',
    schemaType: 'page',
    value: {
      header: { _type: 'pageHeader', eyebrow: 'About' },
      sections: [
        { _type: 'textSection', _key: 'text', background: 'plain' },
        { _type: 'cardsSection', _key: 'cards', columns: 3, background: 'tinted' },
        { _type: 'ctaBandSection', _key: 'cta' },
      ],
    },
  },
  {
    id: 'page-event',
    title: 'Event page',
    schemaType: 'page',
    value: {
      header: { _type: 'pageHeader' },
      sections: [
        { _type: 'textPhotoSection', _key: 'about', photoSide: 'right', background: 'plain' },
        { _type: 'registrationCardSection', _key: 'register' },
        { _type: 'ctaBandSection', _key: 'cta' },
      ],
    },
  },
  {
    id: 'page-document',
    title: 'Document',
    schemaType: 'page',
    value: {
      header: { _type: 'pageHeader', eyebrow: 'About' },
      sections: [{ _type: 'longTextSection', _key: 'document' }],
    },
  },
];
