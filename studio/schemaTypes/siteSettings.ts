import { defineArrayMember, defineField, defineType } from 'sanity';
import { imageWithAlt } from './fields';
import { churchCenterUrl, podcastFeedUrl } from '../../shared/public-sources';

const pageRef = defineField({
  name: 'page',
  title: 'Page',
  type: 'reference',
  to: [{ type: 'page' }, { type: 'home' }, { type: 'fixedPage' }],
  options: { disableNew: true },
  validation: (Rule) => Rule.required(),
});

// One document for what appears site-wide.
export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'menu', title: 'Menu', default: true },
    { name: 'church', title: 'Church info' },
    { name: 'footer', title: 'Footer' },
    { name: 'other', title: 'Other wording' },
    { name: 'branding', title: 'Branding' },
    { name: 'integrations', title: 'Administrative settings' },
  ],
  fields: [
    defineField({
      name: 'integrations', title: 'Public source connections', type: 'object', group: 'integrations',
      description: 'Administrator setup. Public addresses only: never paste API keys or passwords. Planning Center and the media platform remain the source of the records. Empty fields retain the existing church connections.',
      readOnly: ({ currentUser }) => !currentUser?.roles.some((role) => role.name === 'administrator'),
      fields: [
        defineField({ name: 'churchCenterHost', title: 'Church Center hostname', type: 'string', description: 'The hostname only, e.g. chelseachurch.churchcenter.com.', validation: (Rule) => Rule.custom((value) => !value || /^[a-z0-9-]+\.churchcenter\.com$/.test(value) || 'Use a Church Center hostname without https:// or a path.') }),
        defineField({ name: 'calendarPage', title: 'Public Church Center calendar', type: 'url', validation: (Rule) => Rule.custom((value) => !value || Boolean(churchCenterUrl(value)) || 'Use an HTTPS Church Center address.') }),
        defineField({ name: 'givingBase', title: 'Church Center giving address', type: 'url', validation: (Rule) => Rule.custom((value) => !value || Boolean(churchCenterUrl(value)) || 'Use an HTTPS Church Center address.') }),
        defineField({ name: 'podcastFeed', title: 'Podcast RSS feed', type: 'url', description: 'Supports Anchor/Spotify (anchor.fm), Buzzsprout, Simplecast, Megaphone and Podbean feed hosts. Ask the administrator to review other providers.', validation: (Rule) => Rule.custom((value) => !value || Boolean(podcastFeedUrl(value)) || 'Use an HTTPS RSS address from a supported podcast provider.') }),
        defineField({ name: 'youtubeChannelId', title: 'YouTube channel ID', type: 'string', description: 'The UC… channel ID, not a channel handle or video address.', validation: (Rule) => Rule.custom((value) => !value || /^UC[\w-]{22}$/.test(value) || 'Use a YouTube channel ID beginning UC followed by 22 letters, numbers, underscores or dashes.') }),
      ],
    }),
    defineField({
      name: 'branding', title: 'Branding assets', type: 'object', group: 'branding',
      description: 'Replace shared artwork here. Leave a field empty to use the existing church artwork. Colors, fonts and spacing follow the approved design.',
      fields: [
        imageWithAlt('headerLogo', 'Header logo', 'A horizontal logo for a light background.'),
        imageWithAlt('footerMark', 'Footer mark', 'A mark that reads clearly on navy.'),
        imageWithAlt('accentMark', 'Accent mark', 'Used on deacon badges, group placeholders and the not-found page.'),
        imageWithAlt('favicon', 'Browser icon', 'A square image, at least 32 × 32 pixels.'),
        imageWithAlt('touchIcon', 'Phone home-screen icon', 'A square image, at least 180 × 180 pixels.'),
      ],
    }),
    defineField({
      name: 'wording', title: 'Shared labels', type: 'object', group: 'other',
      description: 'Common public labels. Empty fields retain their current wording.',
      fields: [
        ['addressLabel', 'Address label'], ['phoneLabel', 'Phone label'], ['emailLabel', 'Email label'],
        ['prayerLabel', 'Prayer label'], ['sundaysLabel', 'Sunday services label'], ['deaconLabel', 'One deacon'],
        ['deaconsLabel', 'Several deacons'], ['viewGroupLabel', 'View group button'], ['joinGroupLabel', 'Join group button'],
        ['groupOpenLabel', 'Open group badge'], ['contentsLabel', 'Document contents heading'],
        ['registerLabel', 'Registration button'], ['registrationDetailsLabel', 'Full/closed registration button'],
        ['eventRegisterLabel', 'Calendar registration link'], ['eventDetailsLabel', 'Calendar details link'],
        ['featuredLabel', 'Featured announcement badge'], ['learnMoreLabel', 'Announcement link'],
        ['listLabel', 'Calendar list view'], ['monthLabel', 'Calendar month view'],
      ].map(([name, title]) => defineField({ name, title, type: 'string' })),
    }),
    defineField({ name: 'giveButton', title: 'Give button', type: 'button', group: 'menu', description: 'The gold button at the end of the menu.' }),
    defineField({
      name: 'menu',
      title: 'Menu',
      type: 'array',
      group: 'menu',
      description: 'The main menu, in order. An item with sub-items becomes a dropdown.',
      of: [
        defineArrayMember({
          name: 'menuItem',
          title: 'Menu item',
          type: 'object',
          fields: [
            defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }),
            pageRef,
            defineField({
              name: 'children',
              title: 'Sub-items',
              type: 'array',
              of: [
                defineArrayMember({
                  name: 'menuChild',
                  title: 'Sub-item',
                  type: 'object',
                  fields: [defineField({ name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required() }), pageRef],
                  preview: { select: { title: 'label', subtitle: 'page.title' } },
                }),
              ],
            }),
          ],
          preview: { select: { title: 'label', subtitle: 'page.title' } },
        }),
      ],
    }),
    defineField({
      name: 'serviceTimes',
      title: 'Sunday service times',
      type: 'array',
      group: 'church',
      of: [{ type: 'string' }],
      description: 'e.g. “9:00 AM”',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      group: 'church',
      fields: [
        defineField({ name: 'line1', title: 'Street', type: 'string' }),
        defineField({ name: 'city', title: 'City', type: 'string' }),
        defineField({ name: 'state', title: 'State', type: 'string' }),
        defineField({ name: 'zip', title: 'ZIP', type: 'string' }),
        defineField({ name: 'mapsUrl', title: 'Map link', type: 'url' }),
      ],
    }),
    defineField({ name: 'churchName', title: 'Church name', type: 'string', group: 'church', description: 'Shown in the footer and browser tabs.' }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'church' }),
    defineField({ name: 'description', title: 'Description for search engines', type: 'text', rows: 2, group: 'church', description: 'Used on any page without its own.' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', group: 'church' }),
    defineField({ name: 'email', title: 'Main email', type: 'string', group: 'church', validation: (Rule) => Rule.email() }),
    defineField({
      name: 'footerPrayer',
      title: 'Footer: prayer link',
      type: 'button',
      group: 'church',
      description: 'Shown under “Prayer” in the footer. Leave it empty to hide the link.',
    }),
    defineField({ name: 'footerTouchHeading', title: 'First column heading', type: 'string', group: 'footer' }),
    defineField({ name: 'footerEmailText', title: 'Email link text', type: 'string', group: 'footer' }),
    defineField({ name: 'footerConnectHeading', title: 'Second column heading', type: 'string', group: 'footer' }),
    defineField({ name: 'footerConnect', title: 'Second column links', type: 'array', group: 'footer', of: [defineArrayMember({ type: 'button' })] }),
    defineField({
      name: 'deaconCardText',
      title: 'Deacon card wording',
      type: 'string',
      group: 'other',
      description: 'The line under the names on a ministry page’s deacon card.',
    }),
    defineField({
      name: 'notFound',
      title: 'Page not found',
      type: 'object',
      group: 'other',
      description: 'What visitors see at an address that doesn’t exist.',
      fields: [
        defineField({ name: 'heading', title: 'Heading', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
        defineField({ name: 'buttons', title: 'Buttons', type: 'array', of: [defineArrayMember({ type: 'button' })], validation: (Rule) => Rule.max(2) }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
});
