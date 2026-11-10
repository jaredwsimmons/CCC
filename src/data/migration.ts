// Today's site content as Sanity documents: the one-time migration into the CMS.
//
// buildDocuments() turns content.ts / site.ts (the copy crawled from the old site) into
// documents shaped like the Studio's schemas (studio/schemaTypes). It has two uses:
//   1. `npm run export:sanity` writes them to migration/dataset.ndjson for
//      `sanity dataset import`, which also uploads the photos from public/images.
//   2. Until a Sanity project is configured, the site renders from these documents
//      directly (src/lib/sanity.ts), so pages and tests already use the migrated content.
// Once the import is done and staff edit in Sanity, this file and content.ts can go.

import { site, nav } from './site';
import * as c from './content';
import { bylaws } from './bylaws';
import { rhythm } from '../lib/calendar';

export type SanityDoc = { _id: string; _type: string; [field: string]: unknown };

let n = 0;
const key = () => `k${(n++).toString(36)}`;
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ref = (id: string) => ({ _type: 'reference', _ref: id });

// Photos: `_sanityAsset` tells `sanity dataset import` to upload the file; src/lib/image.ts
// serves the same file from /images while the site renders from these documents.
const img = (src: string, alt: string) => ({ _type: 'image', _sanityAsset: `image@file://./public${src}`, alt });
const photo = (src: string, alt: string) => ({ _key: key(), ...img(src, alt) });

// Portable Text (rich text) blocks.
const span = (text: string, marks: string[] = []) => ({ _type: 'span', _key: key(), text, marks });
const block = (text: string, style = 'normal') => ({ _type: 'block', _key: key(), style, markDefs: [], children: [span(text)] });
const paras = (...texts: string[]) => texts.map((t) => block(t));
const bullets = (items: string[]) => items.map((t) => ({ ...block(t), listItem: 'bullet', level: 1 }));
function linkBlock(before: string, text: string, href: string, after = '', listItem?: string) {
  const mark = key();
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    ...(listItem ? { listItem, level: 1 } : {}),
    markDefs: [{ _type: 'link', _key: mark, href }],
    children: [...(before ? [span(before)] : []), span(text, [mark]), ...(after ? [span(after)] : [])],
  };
}

/** A paragraph mixing plain text and links: strings stay plain, [text, href] pairs link. */
function richBlock(...parts: (string | [string, string])[]) {
  const markDefs: { _type: string; _key: string; href: string }[] = [];
  const children = parts.map((p) => {
    if (typeof p === 'string') return span(p);
    const mark = key();
    markDefs.push({ _type: 'link', _key: mark, href: p[1] });
    return span(p[0], [mark]);
  });
  return { _type: 'block', _key: key(), style: 'normal', markDefs, children };
}

// Buttons (studio/schemaTypes/objects/button.ts). `one()` drops the list key for single fields.
const btn = {
  page: (label: string, id: string) => ({ _type: 'button', _key: key(), label, kind: 'page', page: ref(id) }),
  cc: (label: string, url: string) => ({ _type: 'button', _key: key(), label, kind: 'churchCenter', churchCenterUrl: url }),
  email: (label: string, ministry: string) => ({ _type: 'button', _key: key(), label, kind: 'email', ministry: ref(`ministry-${ministry}`) }),
  url: (label: string, url: string) => ({ _type: 'button', _key: key(), label, kind: 'url', url }),
};
const one = <T extends { _key?: string }>({ _key, ...rest }: T) => rest;

const section = (type: string, fields: Record<string, unknown>) => ({ _type: type, _key: key(), ...fields });
const header = (fields: Record<string, unknown>) => ({ _type: 'pageHeader', ...fields });
const seo = (description: string) => ({ description });

// Paths on today's site → the documents that own them.
const ROUTE_IDS: Record<string, string> = {
  '/': 'home',
  '/calendar': 'fixed-calendar',
  '/groups': 'fixed-groups',
  '/media': 'fixed-media',
  '/give': 'fixed-give',
  '/leaders': 'fixed-leaders',
};
const idFor = (path: string) => ROUTE_IDS[path] ?? `page-${path.replace(/^\//, '')}`;

const cc = site.churchCenter;
const planVisit = cc.forms.planVisit;

// Who answers "Email …" buttons for each ministry (site.contacts), by deacon area.
const CONTACTS: Record<string, { email: string; contactName?: string }> = {
  Kids: { email: site.contacts.family, contactName: 'Ben' },
  Preschool: { email: site.contacts.family, contactName: 'Ben' },
  Students: { email: site.contacts.students, contactName: 'Drew' },
  Men: { email: site.contacts.missions, contactName: 'Ben' },
  Women: { email: site.contacts.women, contactName: 'Tammy' },
  Worship: { email: site.contacts.tech },
  Missions: { email: site.contacts.missions, contactName: 'Ben' },
  Connections: { email: site.contacts.missions, contactName: 'Ben' },
};

function ministries(): SanityDoc[] {
  const docs: SanityDoc[] = c.leaders.deacons.map((d) => ({
    _id: `ministry-${slug(d.area)}`,
    _type: 'ministry',
    name: d.area,
    ...CONTACTS[d.area],
    deacons: d.names.split(',').map((s) => s.trim()),
  }));
  docs.push({ _id: 'ministry-church-office', _type: 'ministry', name: 'Church office', email: site.contacts.office, contactName: 'Rebecca' });
  return docs;
}

function leaders(): SanityDoc[] {
  return c.leaders.staff.map((p, i) => ({
    _id: `leader-${slug(p.name)}`,
    _type: 'leader',
    name: p.name,
    role: p.role,
    group: p.group,
    photo: img(p.image, `${p.name} — ${p.role}`),
    order: (i + 1) * 10,
  }));
}

function weeklyRhythm(): SanityDoc {
  return {
    _id: 'weeklyRhythm',
    _type: 'weeklyRhythm',
    tiles: rhythm.map((t) => ({
      _type: 'rhythmTile',
      _key: key(),
      category: t.category,
      title: t.title,
      time: t.time,
      location: t.location,
      description: t.description,
      ...(t.link ? { button: one(btn.page(t.link.label, 'fixed-groups')) } : {}),
    })),
  };
}

function siteSettings(): SanityDoc {
  return {
    _id: 'siteSettings',
    _type: 'siteSettings',
    churchName: site.name,
    tagline: site.tagline,
    description: site.description,
    giveButton: one(btn.cc('Give', cc.giving)),
    menu: nav.map((item) => ({
      _type: 'menuItem',
      _key: key(),
      label: item.label,
      page: ref(idFor(item.href)),
      ...(item.children
        ? { children: item.children.map((ch) => ({ _type: 'menuChild', _key: key(), label: ch.label, page: ref(idFor(ch.href)) })) }
        : {}),
    })),
    serviceTimes: [...site.serviceTimes],
    address: { line1: site.address.line1, city: site.address.city, state: site.address.state, zip: site.address.zip, mapsUrl: site.address.maps },
    phone: site.phone,
    email: site.email,
    footerTouchHeading: 'Get in Touch',
    footerEmailText: 'Send us a message',
    footerPrayer: one(btn.cc('Share a prayer request', cc.forms.prayer)),
    footerConnectHeading: 'Connect',
    footerConnect: [
      btn.url('Facebook', site.social.facebook),
      btn.url('Instagram', site.social.instagram),
      btn.url('YouTube', site.social.youtube),
      btn.page('Media', 'fixed-media'),
      btn.url('Text updates', site.textSignup),
      btn.url('Church Center app', cc.appSetup),
    ],
    deaconCardText: 'Serving and praying over this ministry — reach out anytime.',
    notFound: {
      heading: "We couldn't find that page",
      text: "The link may be old or mistyped — but you're still welcome here. Let's get you back on track.",
      buttons: [btn.page('Back home', 'home'), btn.page('Plan a visit', 'page-imnew')],
    },
  };
}

function home(): SanityDoc {
  const h = c.home;
  const tile = (link: object, text: string, extra: Record<string, unknown> = {}) => ({ _type: 'placeTile', _key: key(), link: one(link as { _key?: string }), text, ...extra });
  const quick = (icon: string, link: object, text: string) => ({ _type: 'quickLink', _key: key(), icon, link: one(link as { _key?: string }), text });
  return {
    _id: 'home',
    _type: 'home',
    hero: {
      eyebrow: 'A church family in Chelsea, Alabama',
      title: 'Pursuing God.\nPursuing others.',
      text: 'Our heart is to live life together by worshiping the Father, growing in faith, and sharing in fellowship and ministry with each other.',
      image: img(h.hero.image, h.hero.imageAlt),
      photos: [photo(c.students.photo.src, c.students.photo.alt), photo(c.women.photo.src, c.women.photo.alt)],
      buttons: [btn.url('Find your place', '/#place'), btn.page("I'm New", 'page-imnew')],
    },
    quickLinks: [
      quick('visit', btn.page("I'm New", 'page-imnew'), 'What to expect'),
      quick('watch', btn.page('Watch & Listen', 'fixed-media'), "Sunday's message"),
      quick('groups', btn.page('Find a Group', 'fixed-groups'), 'Groups open to join'),
      quick('prayer', btn.cc('Prayer', cc.forms.prayer), 'Share a prayer request'),
    ],
    week: {
      heading: 'This week at Chelsea',
      everyWeekLabel: 'Every week',
      comingUpLabel: 'Coming up',
      calendarLink: one(btn.page('Full calendar', 'fixed-calendar')),
    },
    places: {
      heading: 'Find your place',
      tiles: [
        tile(btn.page('Kids & Preschool', 'page-kids'), "A safe and loving environment where kids explore their Bible and build strong, lasting relationships that mirror Christ's love.", {
          image: img('/images/preschool-6.webp', 'A preschool teacher playing basketball outside with a child'),
        }),
        tile(btn.page('Students', 'page-students'), c.students.intro.split('. ')[1] ?? c.students.intro, { image: img(c.students.photo.src, c.students.photo.alt) }),
        tile(btn.page('Community Groups', 'fixed-groups'), 'Life is better together. Groups meet during both Sunday services and throughout the week.', {
          cta: 'Groups open to join',
          highlight: true,
        }),
        tile(btn.page('Women', 'page-women'), 'Authentic friendships at every stage of life.', { image: img(c.women.photo.src, c.women.photo.alt) }),
        tile(btn.page('Men', 'page-men'), 'Weekly Bible study, time to deepen friendships, and service alongside our mission partners.', { cta: "Men's ministry" }),
      ],
      moreLabel: 'More ways to be part of it',
      moreLinks: [
        btn.page('Missions', 'page-missions'),
        btn.page('Prayer', 'page-prayer'),
        btn.page('Worship', 'page-worship'),
        btn.page('Connections', 'page-connections'),
        btn.page('Serve', 'page-serve'),
        btn.page('Preschool', 'page-preschool'),
      ],
    },
    currentSeries: {
      eyebrow: 'Current sermon series',
      title: h.series.title,
      description: h.series.body,
      image: img(h.series.art, h.series.artAlt),
      buttons: [btn.url('Watch Service', site.media.seriesPlaylist), btn.url('Listen on Spotify', site.social.spotify)],
    },
    app: {
      eyebrow: h.app.eyebrow,
      heading: h.app.title,
      text: h.app.body,
      image: img(h.app.image, h.app.imageAlt),
      buttons: [btn.url('App Store', site.app.ios), btn.url('Google Play', site.app.android), btn.url('Set up Church Center', cc.appSetup)],
    },
  };
}

function fixedPages(): SanityDoc[] {
  return [
    {
      _id: 'fixed-calendar',
      _type: 'fixedPage',
      title: 'Calendar',
      header: header({
        eyebrow: "What's happening",
        title: 'Calendar',
        intro: "The rhythms of our week and what's coming up. See something you'd like to be part of? You're always welcome.",
      }),
      sections: [
        section('weeklyRhythmSection', { eyebrow: 'Every week', heading: 'The rhythm of our week' }),
        section('calendarEventsSection', {
          eyebrow: 'Upcoming',
          heading: 'On the calendar',
          emptyText: [richBlock('No upcoming events to show right now. See the ', ['Church Center calendar', cc.calendarPage], ' for the latest.')],
          note: [richBlock('Events are pulled live from our ', ['Church Center calendar', cc.calendarPage], '.')],
          background: 'tinted',
        }),
        section('ctaBandSection', {
          heading: 'Plan your visit',
          text: "New here? Let us know you're coming and we'll have a gift waiting.",
          buttons: [btn.cc('Plan a Visit', planVisit)],
        }),
      ],
      seo: seo("What's happening at Chelsea Community Church — the rhythm of our week plus upcoming events, live from Church Center."),
    },
    {
      _id: 'fixed-groups',
      _type: 'fixedPage',
      title: 'Community Groups',
      header: header({
        eyebrow: 'Community groups',
        title: 'Life is better together',
        intro: c.groups.intro,
        ministry: ref('ministry-adult-discipleship'),
      }),
      sections: [
        section('groupsSection', {
          eyebrow: 'Find your group',
          heading: 'Groups open to join',
          filters: true,
          emptyText: [richBlock('No open groups to show right now. ', ['Browse all groups on Church Center', `https://${cc.subdomain}/groups`], '.')],
          note: [
            richBlock(
              'Groups are listed live from ',
              ['Church Center', `https://${cc.subdomain}/groups`],
              ". Full groups aren't shown — if one you love is full, ",
              ['let us know', `mailto:${site.email}`],
              " and we'll help you find a fit.",
            ),
          ],
        }),
        section('ctaBandSection', {
          heading: 'Not sure which group fits?',
          text: "Tell us a little about yourself and we'll help you find a group that feels like home.",
          buttons: [btn.email(`Email ${c.groups.contactName} for more information!`, 'church-office')],
        }),
      ],
      seo: seo('Community groups at Chelsea Community Church — find one that fits your week and request to join.'),
    },
    {
      _id: 'fixed-media',
      _type: 'fixedPage',
      title: 'Media',
      header: header({ eyebrow: 'Media', title: 'Watch & Listen', intro: c.media.intro[0] }),
      sections: [
        section('latestMessageSection', {
          eyebrow: 'Latest message',
          source: 'podcast',
          watchLabel: 'Watch on YouTube',
          watchUrl: site.social.youtube,
          listenLabel: 'Listen',
        }),
        section('recentVideosSection', {
          eyebrow: 'Watch',
          heading: 'Recent services',
          count: 6,
          emptyText: paras('Our worship services are streamed live on YouTube each Sunday morning, then uploaded to our channel.'),
          buttons: [btn.url('See all on YouTube', site.social.youtube)],
        }),
        section('podcastSection', {
          eyebrow: 'Listen',
          heading: 'Sermon podcast',
          count: 6,
          skipNewest: true,
          emptyText: paras('You can also find our sermons in podcast form on all major streaming platforms!'),
          buttons: [btn.url('Spotify', site.social.spotify), btn.url('Apple Podcasts', site.social.applePodcasts), btn.url('Amazon Music', site.social.amazonMusic)],
          background: 'tinted',
        }),
      ],
      seo: seo('Watch Chelsea Community Church worship services and listen to the sermon podcast — recent messages, updated automatically.'),
    },
    {
      _id: 'fixed-give',
      _type: 'fixedPage',
      title: 'Give',
      header: header({
        eyebrow: 'Generosity',
        title: 'Give',
        intro: 'Thank you for partnering in the mission of our church. Giving is handled securely through Church Center.',
        buttons: [btn.cc('Give now', cc.giving), btn.url('Open in a new tab', cc.giving)],
      }),
      sections: [
        section('cardsSection', {
          eyebrow: 'Simple & secure',
          heading: 'Ways to give',
          columns: 3,
          background: 'plain',
          cards: [
            { _type: 'card', _key: key(), title: 'Online', text: 'Give a one-time gift or set up recurring giving in seconds — securely through Church Center.' },
            { _type: 'card', _key: key(), title: 'In the app', text: 'Download the Church Center app to give and stay connected from anywhere.' },
            { _type: 'card', _key: key(), title: 'In person', text: 'Give during either Sunday gathering as an act of worship together.' },
          ],
        }),
        section('scriptureSection', {
          text: '“Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.”',
          reference: '2 Corinthians 9:7',
        }),
      ],
      seo: seo('Give to Chelsea Community Church securely through Church Center — online, in the app, or in person on Sunday.'),
    },
    {
      _id: 'fixed-leaders',
      _type: 'fixedPage',
      title: 'Leaders',
      header: header({ eyebrow: 'About', title: 'Leaders' }),
      sections: [
        section('leadersSection', { eyebrow: 'Staff', heading: 'Our staff', group: 'staff', background: 'plain' }),
        section('leadersSection', { eyebrow: 'Elders', heading: 'Our elders', group: 'elder', background: 'tinted' }),
        section('deaconsSection', {
          eyebrow: 'Deacons',
          heading: 'Serving the Body',
          note: [richBlock('Questions about our leadership? ', ['Email the church office', `mailto:${site.email}`], '.')],
          background: 'plain',
        }),
      ],
      seo: seo('The staff, elders, and deacons of Chelsea Community Church.'),
    },
  ];
}

const page = (path: string, title: string, fields: Record<string, unknown>): SanityDoc => ({
  _id: idFor(path),
  _type: 'page',
  title,
  slug: { _type: 'slug', current: path.slice(1) },
  ...fields,
});

const cta = (heading: string, text: string, ...buttons: unknown[]) => section('ctaBandSection', { heading, text, buttons });
// Every ministry page ends with its upcoming events, then who to contact.
const upcoming = (match: string) => section('openRegistrationsSection', { eyebrow: 'Upcoming events', heading: 'Join us', match });

function pages(): SanityDoc[] {
  const { imnew, beliefs, history, worship, preschool, kids, students, men, women, missions, serve, connections, prayer } = c;
  const partnerCards = (list: { name: string; focus: string; url?: string; newsletter?: string }[]) =>
    list.map((p) => ({
      _type: 'card',
      _key: key(),
      title: p.name,
      text: p.focus,
      buttons: [...(p.url ? [btn.url('Website', p.url)] : []), ...(p.newsletter ? [btn.url('Newsletter', p.newsletter)] : [])],
    }));

  return [
    page('/imnew', "I'm New", {
      header: header({
        eyebrow: "I'm New",
        title: imnew.hero.title,
        intro: "The best way to get to know us is a Sunday morning. We'd love to meet you.",
        image: img(imnew.hero.image, imnew.hero.imageAlt),
      }),
      sections: [
        section('visitSection', {
          label: 'This Sunday',
          subline: c.home.hero.sub,
          note: 'Programming for kids and students at both hours',
          buttons: [btn.cc("Let us know you're coming!", planVisit)],
          directionsLabel: 'Get directions',
        }),
        section('weeklyRhythmSection', { eyebrow: 'Every week', heading: 'The rhythm of our week' }),
        section('cardsSection', {
          columns: 2,
          background: 'plain',
          cards: [imnew.dress, imnew.whereToGo].map((x) => ({ _type: 'card', _key: key(), title: x.title, text: x.body })),
        }),
        section('textPhotoSection', {
          eyebrow: 'Before you arrive',
          heading: imnew.coming.title,
          body: [block(imnew.coming.body), block('Prefer to connect in person?', 'h3'), block(imnew.coming.desk)],
          photos: [photo(imnew.coming.image, imnew.coming.imageAlt)],
          photoSide: 'right',
          buttons: [btn.cc("Let us know you're coming!", planVisit)],
          background: 'tinted',
        }),
      ],
      seo: seo("What to expect on a Sunday at Chelsea Community Church — services at 9:00 & 10:30 AM, the rhythm of our week, what to wear, where to go first, and how to let us know you're coming."),
    }),

    page('/about', 'About', {
      header: header({ eyebrow: 'About', title: 'Our Story & What We Believe' }),
      sections: [
        section('textSection', { eyebrow: 'Our vision', heading: 'Pursuing God. Pursuing others.', body: paras(...beliefs.vision.body), background: 'plain' }),
        section('textSection', { eyebrow: 'How we got here', heading: 'Planting roots as Chelsea grows', body: paras(history.body), background: 'tinted' }),
        section('textSection', {
          eyebrow: 'Our affiliation',
          heading: 'A community church in the Baptist tradition',
          body: [
            linkBlock(
              'While maintaining our autonomy as a local body of believers, we identify ourselves as a community church in the Baptist tradition. ',
              'Learn about Double Oak Community Church →',
              beliefs.affiliation.doccUrl,
            ),
          ],
          background: 'plain',
        }),
        section('textPhotoSection', {
          heading: beliefs.pursuit.title,
          body: paras(...beliefs.pursuit.body),
          photos: [
            photo('/images/creation-god.webp', "Detail of God from Michelangelo's Creation of Adam, reaching toward Adam"),
            photo(beliefs.pursuit.image, beliefs.pursuit.imageAlt),
            photo('/images/creation-adam.webp', "Detail of Adam from Michelangelo's Creation of Adam, reaching out"),
          ],
          photoSide: 'right',
          background: 'tinted',
        }),
        section('cardsSection', {
          eyebrow: 'Our Beliefs',
          heading: 'What we hold to',
          columns: 2,
          background: 'plain',
          cards: [
            ...beliefs.statements.map((b) => ({ _type: 'card', _key: key(), label: b.refs, title: b.title, text: b.text })),
            {
              _type: 'card',
              _key: key(),
              title: 'Church Bylaws',
              text: 'How we govern ourselves as a congregation — Christ ruled, elder led, and congregationally accountable.',
              buttons: [btn.url('Read our church bylaws →', '/bylaws')],
            },
          ],
        }),
        cta('Come and see', "The best way to get to know us is a Sunday morning. We'd love to meet you.", btn.cc('Plan a Visit', planVisit), btn.page('What to expect', 'page-imnew')),
      ],
      seo: seo('The vision, founding, and statement of faith of Chelsea Community Church — the story of God pursuing us, and of our church in Chelsea, Alabama.'),
    }),

    page('/bylaws', 'Church Bylaws', {
      header: header({ eyebrow: 'About', title: 'Church Bylaws', intro: bylaws.hero.lead }),
      sections: [section('longTextSection', { body: bylaws.blocks })],
      seo: seo(bylaws.hero.description),
    }),

    page('/serve', 'Serve', {
      header: header({ eyebrow: 'Ministries', title: 'Serve', intro: `${serve.verse.text} (${serve.verse.ref})` }),
      sections: [
        section('textPhotoSection', {
          eyebrow: 'Teams Mobilizer',
          heading: 'Find your place. Know your purpose.',
          body: paras(...serve.intro),
          photos: [photo(serve.image.src, serve.image.alt)],
          photoSide: 'right',
          buttons: [btn.url('Click here to take the survey', serve.survey)],
          background: 'plain',
        }),
        section('cardsSection', {
          columns: 2,
          background: 'tinted',
          cards: [
            { _type: 'card', _key: key(), title: 'It Is:', bullets: serve.itIs },
            { _type: 'card', _key: key(), title: 'It Is Not:', bullets: serve.itIsNot },
          ],
        }),
        section('stepsSection', {
          eyebrow: 'Instructions',
          heading: 'Three simple steps',
          steps: serve.instructions.map((s) => ({ _type: 'step', _key: key(), title: s.title, text: s.body })),
          closing: serve.closing,
        }),
        cta('Questions about serving?', 'Ben Stephenson, our Family Pastor, is the one to ask.', btn.email('Email Ben for more information!', 'missions')),
      ],
      seo: seo('Find your place, know your purpose, be people of pursuit — the Teams Mobilizer tool at Chelsea Community Church.'),
    }),

    page('/connections', 'Connections', {
      header: header({ eyebrow: 'Ministries', title: 'Connections', ministry: ref('ministry-connections') }),
      sections: [
        section('textPhotoSection', {
          heading: 'A purpose and a place for everyone',
          body: paras(...connections.body),
          photoSide: 'right',
          background: 'plain',
        }),
        upcoming('Connections'),
        cta(
          'Stop by the Connections Desk',
          "Just past the Worship Room every Sunday morning — we'll help you find your place.",
          btn.email('Email Ben for more information!', 'connections'),
          btn.page('Plan your first visit', 'page-imnew'),
        ),
      ],
      seo: seo('The Connections team helps every guest and member find their place at Chelsea Community Church — ministries, community groups, and events.'),
    }),

    page('/kids', 'Kids', {
      header: header({ eyebrow: 'Ministries', title: 'Kids', intro: kids.mission, ministry: ref('ministry-kids') }),
      sections: [
        section('textPhotoSection', {
          eyebrow: 'What shapes Kids Ministry',
          heading: 'Gospel · Scripture · Family · Community · Mission',
          body: paras(kids.mission),
          photos: [photo(kids.values.image, kids.values.imageAlt)],
          photoSide: 'right',
          buttons: [btn.cc('Find out about serving in the Kids Ministry', cc.registrations.kidsServe)],
          background: 'plain',
        }),
        section('scheduleSection', {
          eyebrow: 'First time?',
          heading: kids.getReady.title,
          intro: kids.getReady.body,
          buttons: [btn.cc('Pre-Register Your Family', planVisit), btn.cc('Sign up for the Kids Ministry Newsletter!', cc.forms.kidsNewsletter)],
          cardTitle: 'Sunday Schedule',
          rows: kids.schedule.map((s) => ({ _type: 'scheduleRow', _key: key(), time: s.time, what: s.what })),
          cardLink: one(btn.page('Check out our Summer activities →', 'fixed-calendar')),
        }),
        section('textPhotoSection', {
          eyebrow: 'Family worship',
          heading: kids.worshipTogether.title,
          body: paras(kids.worshipTogether.body),
          photos: [photo(kids.summer.image, kids.summer.imageAlt)],
          photoSide: 'left',
          background: 'tinted',
        }),
        upcoming('Kids, K-5'),
        cta('Questions about Kids Ministry?', 'Ben Stephenson, our Family Pastor, would love to talk.', btn.email('Email Ben for more information', 'kids')),
      ],
      seo: seo('Kids Ministry at Chelsea Community Church — training up children to pursue God and pursue others, with programming at both Sunday services.'),
    }),

    page('/men', 'Men', {
      header: header({ eyebrow: 'Ministries', title: 'Men', ministry: ref('ministry-men') }),
      sections: [
        section('textPhotoSection', {
          eyebrow: men.discipleship.title,
          heading: 'Growing together in the Word',
          body: bullets(men.discipleship.items),
          photos: [photo(men.discipleship.image, men.discipleship.imageAlt)],
          photoSide: 'right',
          background: 'plain',
        }),
        section('textPhotoSection', {
          eyebrow: 'First Sunday · 6 PM',
          heading: men.fire.title,
          body: paras(men.fire.body),
          photos: [photo(men.fire.image, men.fire.imageAlt)],
          photoSide: 'left',
          background: 'navy',
        }),
        section('cardsSection', {
          columns: 2,
          background: 'plain',
          cards: [men.relationships, men.service].map((x) => ({ _type: 'card', _key: key(), title: x.title, text: x.body })),
        }),
        upcoming("Men's"),
        cta('Join the brotherhood', "Studies, the fire pit, serving shoulder-to-shoulder — there's a seat for you.", btn.email('Email Ben for more information!', 'men')),
      ],
      seo: seo("Men's ministry at Chelsea Community Church — discipleship, Men On Fire around the fire pit, relationships, and service alongside our mission partners."),
    }),

    page('/missions', 'Missions', {
      header: header({ eyebrow: 'Ministries', title: 'Missions', intro: `${missions.verse.text} (${missions.verse.ref})`, ministry: ref('ministry-missions') }),
      sections: [
        section('textPhotoSection', {
          eyebrow: 'Monthly missions highlight',
          heading: missions.highlight.title,
          body: paras(missions.highlight.body),
          photoSide: 'right',
          buttons: [btn.page("Men's Ministry", 'page-men'), btn.page("Women's Ministry", 'page-women')],
          background: 'plain',
        }),
        section('cardsSection', { eyebrow: 'Local mission partners', heading: 'Serving our neighbors', columns: 3, background: 'tinted', cards: partnerCards(missions.local) }),
        section('cardsSection', {
          eyebrow: 'National & international mission partners',
          heading: 'To the ends of the earth',
          columns: 3,
          background: 'plain',
          cards: partnerCards(missions.global),
        }),
        upcoming('Mission'),
        cta('Ready to get involved?', 'Pray, give, or go — Pastor Ben can help you find your place in the mission.', btn.email('Email Ben for more information!', 'missions')),
      ],
      seo: seo('Missions at Chelsea Community Church — local, national, and international partners and monthly highlights.'),
    }),

    page('/prayer', 'Prayer', {
      header: header({ eyebrow: 'Ministries', title: 'We want to pray for you', intro: prayer.cta, buttons: [btn.cc('Share a prayer request', cc.forms.prayer)], ministry: ref('ministry-prayer') }),
      sections: [
        section('textPhotoSection', { eyebrow: 'Our prayer ministry', heading: 'A church where prayer is central', body: paras(prayer.ministry), photoSide: 'right', background: 'plain' }),
        section('stepsSection', {
          eyebrow: 'Join the prayer team',
          heading: 'How to get involved',
          steps: prayer.joinSteps.map((s) => ({ _type: 'step', _key: key(), text: s })),
        }),
        section('cardsSection', { columns: 2, background: 'plain', cards: [{ _type: 'card', _key: key(), title: 'A note on privacy', text: prayer.note }] }),
        upcoming('Prayer'),
        cta('How can we pray with you?', "Whatever you're carrying — a burden or a blessing — we'd be honored to pray with you. Share as much or as little as you'd like.", btn.cc('Share a prayer request', cc.forms.prayer)),
      ],
      seo: seo('We want to pray for you — share your prayer concerns with Chelsea Community Church, or join the Prayer Team.'),
    }),

    page('/preschool', 'Preschool', {
      header: header({ eyebrow: 'Ministries', title: 'Preschool', ministry: ref('ministry-preschool') }),
      sections: [
        section('scheduleSection', {
          eyebrow: 'First time?',
          heading: preschool.getReady.title,
          intro: preschool.getReady.body,
          buttons: [btn.cc('Pre-Register Your Family', planVisit)],
          cardTitle: 'Sunday Schedule',
          rows: preschool.schedule.map((s) => ({ _type: 'scheduleRow', _key: key(), time: s.time, what: s.what })),
          cardLink: one(btn.url('Check out our monthly newsletter →', preschool.newsletter)),
        }),
        section('cardsSection', {
          eyebrow: 'Good to know',
          heading: 'Making Sunday mornings easy',
          columns: 3,
          background: 'tinted',
          cards: preschool.tips.map((t) => ({ _type: 'card', _key: key(), title: t.title, text: t.body })),
        }),
        section('gallerySection', {
          photos: preschool.gallery.map((src, i) => photo(src, `Preschool ministry at Chelsea Community Church — photo ${i + 1}`)),
        }),
        upcoming('Preschool'),
        cta('Questions about Preschool?', "We'd love to help your family feel at home.", btn.email('Email us for more information!', 'preschool')),
      ],
      seo: seo('Preschool ministry at Chelsea Community Church — worship and community groups for little ones every Sunday, with easy pre-registration for first-time families.'),
    }),

    page('/students', 'Students', {
      header: header({ eyebrow: 'Ministries', title: students.title, intro: students.intro, ministry: ref('ministry-students') }),
      sections: [
        section('textPhotoSection', {
          body: students.schedule.flatMap((s) => [block(s.when, 'h3'), block(s.what)]),
          photos: [photo(students.photo.src, students.photo.alt)],
          photoSide: 'left',
          buttons: [btn.cc('Let us know your family is coming!', planVisit), btn.page('Summer events calendar', 'fixed-calendar')],
          background: 'plain',
        }),
        upcoming('C3SM'),
        cta('Questions about C3SM?', 'Drew Blake, our Pastor of Students & Worship, would love to connect.', btn.email('Get in touch with Pastor Drew!', 'students')),
      ],
      seo: seo('C3SM — Chelsea Community Church Student Ministry for middle and high schoolers. Sunday community groups at 9 AM and Wednesday nights at 6 PM.'),
    }),

    // The hand-typed summer events become a live list of Church Center registrations
    // (approved in the section list), so events are never typed twice or left stale.
    page('/women', 'Women', {
      header: header({ eyebrow: 'Ministries', title: 'Women', intro: women.intro[0], ministry: ref('ministry-women') }),
      sections: [
        section('textPhotoSection', {
          body: paras(women.intro[1]),
          photos: [photo(women.photo.src, women.photo.alt)],
          photoSide: 'right',
          background: 'plain',
        }),
        upcoming("Women's"),
        cta("Questions about Women's Ministry?", `${women.contactName} would love to hear from you.`, btn.email(`Email ${women.contactName} for more information!`, 'women')),
      ],
      seo: seo("Women's Ministry at Chelsea Community Church — growing in Christ, building authentic friendships, and living out faith with confidence and purpose."),
    }),

    page('/worship', 'Worship', {
      header: header({ eyebrow: 'Ministries', title: 'Worship', ministry: ref('ministry-worship') }),
      sections: [
        section('textPhotoSection', {
          heading: 'A blend of all generations',
          body: paras(...worship.body),
          photoSide: 'right',
          background: 'plain',
        }),
        upcoming('Worship'),
        cta('Serve with music or tech', 'Musicians, vocalists, and behind-the-scenes hands all help make Sunday distraction-free.', btn.email(worship.serveCta.label, 'worship')),
      ],
      seo: seo('Blended worship — traditional and contemporary — reflecting a congregation of all generations at Chelsea Community Church.'),
    }),

    // Kids & Students: a summary of Preschool, Kids and Students, each linking to its own page,
    // with one list of their upcoming events.
    page('/kids-students', 'Kids & Students', {
      header: header({ eyebrow: 'Ministries', title: 'Kids & Students', intro: "From preschool through high school, there's a place for your kids every Sunday morning." }),
      sections: [
        section('textPhotoSection', {
          eyebrow: 'Preschool',
          heading: 'Preschool',
          body: paras('Preschool Worship at 9:00 AM and Preschool Community Groups at 10:30 AM every Sunday. Our Preschool Check-In desk is through the entrance on the right side of the building, past the Worship Room.'),
          photos: [photo(preschool.gallery[3], 'Two preschoolers painting at a table')],
          photoSide: 'right',
          buttons: [btn.cc('Pre-Register Your Family', planVisit), btn.page('More about Preschool', 'page-preschool')],
          background: 'plain',
        }),
        section('textPhotoSection', {
          eyebrow: 'Kids',
          heading: 'Kids',
          body: paras(kids.mission),
          photos: [photo(preschool.gallery[4], 'Two children talking together at church')],
          photoSide: 'left',
          buttons: [btn.cc('Pre-Register Your Family', planVisit), btn.page('More about Kids', 'page-kids')],
          background: 'tinted',
        }),
        section('textPhotoSection', {
          eyebrow: 'C3SM',
          heading: 'Students',
          body: paras(students.intro),
          photos: [photo(students.photo.src, students.photo.alt)],
          photoSide: 'right',
          buttons: [btn.page('More about C3SM', 'page-students')],
          background: 'plain',
        }),
        upcoming('Preschool, Kids, K-5, Students, C3SM'),
        cta(
          'Questions about Kids & Students?',
          'Ben Stephenson, our Family Pastor, and Drew Blake, our Pastor of Students & Worship, would love to connect.',
          btn.email('Email Ben', 'kids'),
          btn.email('Email Drew', 'students'),
        ),
      ],
      seo: seo('Preschool, Kids and Students (C3SM) at Chelsea Community Church — something for every age on Sunday mornings, and what’s coming up.'),
    }),

    // Other Ministries: a card for each ministry not in the menu, with its deacons and a link to its page.
    page('/other-ministries', 'Other Ministries', {
      header: header({ eyebrow: 'Ministries', title: 'Other Ministries' }),
      sections: [
        section('cardsSection', {
          columns: 3,
          background: 'plain',
          cards: [
            { _type: 'card', _key: key(), title: 'Connections', text: connections.body[0], buttons: [btn.page('More about Connections', 'page-connections')], ministry: ref('ministry-connections') },
            { _type: 'card', _key: key(), title: 'Prayer', text: 'At Chelsea Community Church we desire to be a church where prayer is central. We invite you to join us as we pray for our church, community, and world.', buttons: [btn.page('More about Prayer', 'page-prayer')], ministry: ref('ministry-prayer') },
            { _type: 'card', _key: key(), title: 'Worship', text: worship.body[0], buttons: [btn.page('More about Worship', 'page-worship')], ministry: ref('ministry-worship') },
          ],
        }),
      ],
      seo: seo('More ministries at Chelsea Community Church: Connections, Prayer and Worship.'),
    }),
  ];
}

/** Every document the migration creates, in import order. */
export function buildDocuments(): SanityDoc[] {
  n = 0;
  return [siteSettings(), weeklyRhythm(), home(), ...fixedPages(), ...pages(), ...leaders(), ...ministries()];
}
