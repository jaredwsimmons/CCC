// Central site configuration — the one place to edit church-wide constants.
// Values marked TODO were not confirmed during the stack research; verify before launch.

export const site = {
  name: 'Chelsea Community Church',
  shortName: 'CCC',
  tagline: 'Pursuing God. Pursuing others.',
  url: 'https://chelseachurch.com',
  description:
    'Chelsea Community Church — a gospel-centered church in Chelsea, Alabama. Pursuing God. Pursuing others.',

  serviceTimes: ['9:00 AM', '10:30 AM'],

  // TODO: confirm exact address / contact before launch
  address: { line1: '', city: 'Chelsea', state: 'AL', zip: '' },
  email: '', // TODO
  phone: '', // TODO

  social: {
    facebook: 'https://www.facebook.com/chelseachurch', // TODO verify handle
    instagram: 'https://www.instagram.com/chelseachurch', // TODO verify handle
    youtube: '', // TODO
    spotify: '', // TODO
  },

  // Planning Center Church Center — the live engine behind calendar/giving/forms/registration/app.
  // These come from the current site's crawl (2026-07-03); the vanity subdomain is chelseachurch.churchcenter.com.
  churchCenter: {
    subdomain: 'chelseachurch.churchcenter.com',
    orgSlug: 'chelsea-community-church-488313',
    // Calendar embed (month view, with filtering) — used in an <iframe> on /calendar
    calendarEmbed:
      'https://chelsea-community-church-488313.churchcenter.com/calendar?embed=true&view=month&allowFiltering=true',
    giving: 'https://chelseachurch.churchcenter.com/giving',
    appSetup: 'https://chelseachurch.churchcenter.com/setup',
  },
} as const;

// Primary navigation. Ministries render as a grouped dropdown; the rest are top-level links.
export const nav: Array<{
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}> = [
  { label: "I'm New", href: '/imnew' },
  { label: 'Beliefs', href: '/beliefs' },
  {
    label: 'Ministries',
    href: '/serve',
    children: [
      { label: 'Kids', href: '/kids' },
      { label: 'Students', href: '/students' },
      { label: 'Preschool', href: '/preschool' },
      { label: 'Men', href: '/men' },
      { label: 'Women', href: '/women' },
      { label: 'Worship', href: '/worship' },
      { label: 'Missions', href: '/missions' },
      { label: 'Groups', href: '/groups' },
      { label: 'Serve', href: '/serve' },
    ],
  },
  { label: 'Media', href: '/media' },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Prayer', href: '/prayer' },
];

// Pages driven by the CMS. Until Sanity has content, these render as placeholders (see [...slug].astro).
export const contentPages: Array<{ slug: string; title: string }> = [
  { slug: 'imnew', title: "I'm New" },
  { slug: 'beliefs', title: 'What We Believe' },
  { slug: 'history', title: 'Our History' },
  { slug: 'connections', title: 'Connect' },
  { slug: 'groups', title: 'Community Groups' },
  { slug: 'serve', title: 'Serve' },
  { slug: 'prayer', title: 'Prayer' },
  { slug: 'missions', title: 'Missions' },
  { slug: 'worship', title: 'Worship' },
  { slug: 'kids', title: 'Kids' },
  { slug: 'students', title: 'Students' },
  { slug: 'preschool', title: 'Preschool' },
  { slug: 'men', title: 'Men' },
  { slug: 'women', title: 'Women' },
  { slug: 'leaders', title: 'Our Leaders' },
];
