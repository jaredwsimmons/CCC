import { defineArrayMember, defineField } from 'sanity';
import textSection from './textSection';
import textPhotoSection from './textPhotoSection';
import cardsSection from './cardsSection';
import placesSection from './placesSection';
import scheduleSection from './scheduleSection';
import stepsSection from './stepsSection';
import accordionSection from './accordionSection';
import gallerySection from './gallerySection';
import scriptureSection from './scriptureSection';
import ctaBandSection from './ctaBandSection';
import weeklyRhythmSection from './weeklyRhythmSection';
import visitSection from './visitSection';
import longTextSection from './longTextSection';
import registrationCardSection from './registrationCardSection';
import openRegistrationsSection from './openRegistrationsSection';
import groupsSection from './groupsSection';
import featuredEventsSection from './featuredEventsSection';
import announcementsSection from './announcementsSection';
import latestMessageSection from './latestMessageSection';
import calendarEventsSection from './calendarEventsSection';
import recentVideosSection from './recentVideosSection';
import playlistSection from './playlistSection';
import podcastSection from './podcastSection';
import leadersSection from './leadersSection';
import deaconsSection from './deaconsSection';
import { validateSectionHeading } from '../../lib/section-validation';

// The approved section list: 13 content sections, then the live ones. The order here
// is the order of the "Add section" menu.
export const sectionTypes = [
  textSection,
  textPhotoSection,
  cardsSection,
  placesSection,
  scheduleSection,
  stepsSection,
  accordionSection,
  gallerySection,
  scriptureSection,
  ctaBandSection,
  weeklyRhythmSection,
  visitSection,
  longTextSection,
  registrationCardSection,
  openRegistrationsSection,
  groupsSection,
  featuredEventsSection,
  announcementsSection,
  latestMessageSection,
  calendarEventsSection,
  recentVideosSection,
  playlistSection,
  podcastSection,
  leadersSection,
  deaconsSection,
].map((section) => ({
  ...section,
  validation: (Rule: any) => Rule.custom(validateSectionHeading),
  fields: [
    defineField({ name: 'hidden', title: 'Hide this section', type: 'boolean', initialValue: false,
      description: 'Keep the content here but leave this section off the website. Turn off to show it again.' }),
    ...section.fields,
  ],
}));

/** The members of a `sections` array field. */
export const sectionMembers = sectionTypes.map((t) => defineArrayMember({ type: t.name }));

export const sectionMenu = { insertMenu: { groups: [
  { name: 'content', title: 'Content', of: ['textSection', 'textPhotoSection', 'cardsSection', 'placesSection', 'scheduleSection', 'stepsSection', 'accordionSection', 'gallerySection', 'scriptureSection', 'ctaBandSection', 'visitSection', 'longTextSection'] },
  { name: 'churchCenter', title: 'Church Center', of: ['registrationCardSection', 'openRegistrationsSection', 'groupsSection', 'featuredEventsSection', 'announcementsSection', 'calendarEventsSection'] },
  { name: 'media', title: 'Media', of: ['latestMessageSection', 'recentVideosSection', 'playlistSection', 'podcastSection'] },
  { name: 'people', title: 'People & shared schedules', of: ['weeklyRhythmSection', 'leadersSection', 'deaconsSection'] },
] } };
