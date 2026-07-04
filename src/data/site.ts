// Central site configuration — the one place to edit church-wide constants.
// Every value below was pulled from the live chelseachurch.com crawl (2026-07-03).

export const site = {
  name: 'Chelsea Community Church',
  shortName: 'CCC',
  tagline: 'Pursuing God. Pursuing others.',
  url: 'https://chelseachurch.com',
  description:
    'Chelsea Community Church exists to pursue God and pursue others — a church family in Chelsea, Alabama. Worship & Community Groups Sundays at 9:00 & 10:30 AM.',

  serviceTimes: ['9:00 AM', '10:30 AM'],

  address: {
    line1: '101 Chelsea Park Dr.',
    city: 'Chelsea',
    state: 'AL',
    zip: '35043',
    maps: 'https://maps.app.goo.gl/2eQ6opgKF2mtYANx8',
  },
  email: 'rebecca@chelseachurch.com', // the site-wide "Email Us" contact
  phone: '205-201-0759',

  // Ministry contacts (from the live site's per-page "Email …" buttons)
  contacts: {
    office: 'rebecca@chelseachurch.com',
    missions: 'brian@chelseachurch.com', // Brian Marbury — Pastor of Missions & Service
    family: 'ben@chelseachurch.com', // Ben Stephenson — Family Pastor (Kids/Preschool)
    students: 'drew@chelseachurch.com', // Drew Blake — Pastor of Students & Worship
    women: 'allgoodtchr@gmail.com', // Tammy Allgood
    tech: 'tech@chelseachurch.com', // worship / production team
  },

  social: {
    facebook: 'https://www.facebook.com/share/1ERuoVkBVp/',
    instagram: 'https://www.instagram.com/chelseacommunitychurch',
    youtube: 'https://www.youtube.com/@chelsea_community_church',
    spotify: 'https://open.spotify.com/show/4Hx7Zb0hZtARV8p3q0J4lA',
    applePodcasts:
      'https://podcasts.apple.com/us/podcast/chelsea-community-church-sermons/id1811838985',
    amazonMusic:
      'https://music.amazon.com/podcasts/765129ef-a6bd-4b4a-8714-1515bc68bb72/chelsea-community-church-sermons',
  },

  // Text updates signup (the "Text" link in the current site's utility bar)
  textSignup: 'https://app.txtsignal.io/w/72b2d04a',

  // Planning Center Church Center — the live engine behind calendar/giving/forms/registrations/app.
  churchCenter: {
    subdomain: 'chelseachurch.churchcenter.com',
    orgSlug: 'chelsea-community-church-488313',
    calendarEmbed:
      'https://chelsea-community-church-488313.churchcenter.com/calendar?embed=true&view=month&allowFiltering=true',
    calendarPage:
      'https://chelsea-community-church-488313.churchcenter.com/calendar?view=month&allowFiltering=true',
    giving: 'https://chelseachurch.churchcenter.com/giving',
    appSetup: 'https://chelseachurch.churchcenter.com/setup',
    // People forms (verified live on the current site)
    forms: {
      planVisit:
        'https://chelsea-community-church-488313.churchcenter.com/people/forms/869246', // "Let Us Know You're Coming!" / family pre-registration
      prayer:
        'https://chelsea-community-church-488313.churchcenter.com/people/forms/876492', // "How can we pray with you?"
      kidsNewsletter:
        'https://chelsea-community-church-488313.churchcenter.com/people/forms/893396',
    },
    registrations: {
      kidsServe:
        'https://chelsea-community-church-488313.churchcenter.com/registrations/events/2877950',
      sundaeBingo:
        'https://chelseachurch.churchcenter.com/registrations/events/3694679',
    },
  },

  // Church Center mobile app store listings
  app: {
    ios: 'https://apps.apple.com/us/app/church-center-app/id1357742931',
    android: 'https://play.google.com/store/apps/details?id=com.ministrycentered.churchcenter',
  },

  // Sunday worship livestream + sermon archive.
  // Feeds are PUBLIC (no token) — parsed at build time in src/lib/feeds.ts.
  media: {
    youtubeChannel: 'https://www.youtube.com/@chelsea_community_church',
    youtubeChannelId: 'UCp-U4UoiyeroDpOyrygy5YA',
    youtubeFeed:
      'https://www.youtube.com/feeds/videos.xml?channel_id=UCp-U4UoiyeroDpOyrygy5YA',
    podcastFeed: 'https://anchor.fm/s/10452dab4/podcast/rss',
    seriesPlaylist:
      'https://youtube.com/playlist?list=PLcnuF3joGnBHLhefAXRk4zswRf2Ti73Hx&si=bEs8rxO9QK1nLbbv',
  },

  // Church bylaws (public Google Doc linked from the beliefs page)
  bylaws:
    'https://docs.google.com/document/u/0/d/1p3udrhBXFaMOThxqw3sV-UnbVTGa0NkPWo589Z9jeRc/mobilebasic',
} as const;

// Primary navigation — mirrors the current site's structure:
// HOME · I'M NEW · ABOUT (Beliefs/Leaders/History) · MINISTRIES (…) · CALENDAR · MEDIA
export const nav: Array<{
  label: string;
  href: string;
  children?: Array<{ label: string; href: string }>;
}> = [
  {
    label: 'About',
    href: '/imnew',
    children: [
      { label: "I'm New", href: '/imnew' },
      { label: 'Our Story', href: '/our-story' },
      { label: 'What We Believe', href: '/beliefs' },
      { label: 'Leaders', href: '/leaders' },
    ],
  },
  { label: 'Calendar', href: '/calendar' },
  { label: 'Community Groups', href: '/groups' },
  { label: 'Media', href: '/media' },
  {
    label: 'Ministries',
    href: '/serve',
    // "Ministries" itself links to Serve; the dropdown lists the ministries
    // (Serve removed from the list). alphabetical; Prayer lives in here.
    children: [
      { label: 'Connections', href: '/connections' },
      { label: 'Kids', href: '/kids' },
      { label: 'Men', href: '/men' },
      { label: 'Missions', href: '/missions' },
      { label: 'Prayer', href: '/prayer' },
      { label: 'Preschool', href: '/preschool' },
      { label: 'Students', href: '/students' },
      { label: 'Women', href: '/women' },
      { label: 'Worship', href: '/worship' },
    ],
  },
];
