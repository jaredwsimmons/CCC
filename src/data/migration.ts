// Today's site content as Sanity documents: the one-time migration into the CMS.
//
// buildDocuments() turns content.ts / site.ts (the copy crawled from the old site) into
// documents shaped like the Studio's schemas (studio/schemaTypes). It has two uses:
//   1. `npm run export:sanity` writes them to migration/dataset.ndjson for
//      `sanity dataset import`, which also uploads the photos from public/images.
//   2. Until a Sanity project is configured, the site renders from these documents
//      directly (src/lib/sanity.ts), so pages and tests already use the migrated content.
// Once the import is done and staff edit in Sanity, this file and content.ts can go.
//
// Bylaws stays a coded page (src/pages/bylaws.astro) for now: its lettered sub-lists
// and cross-references ("Section A.1).b.") need a careful conversion of their own.

import { site, nav } from './site';
import * as c from './content';
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
  Men: { email: site.contacts.missions, contactName: 'Brian' },
  Women: { email: site.contacts.women, contactName: 'Tammy' },
  Worship: { email: site.contacts.tech },
  Missions: { email: site.contacts.missions, contactName: 'Brian' },
  Connections: { email: site.contacts.missions, contactName: 'Brian' },
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
    photo: img(p.image, `${p.name} — ${p.role}`),
    order: (i + 1) * 10,
  }));
}

function siteSettings(): SanityDoc {
  const s = c.home.series;
  return {
    _id: 'siteSettings',
    _type: 'siteSettings',
    currentSeries: {
      title: s.title,
      description: s.body,
      image: img(s.art, s.artAlt),
      watchUrl: site.media.seriesPlaylist,
      listenUrl: site.social.spotify,
    },
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
    social: { ...site.social, textSignup: site.textSignup },
    weeklyRhythm: rhythm.map((t) => ({
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

function home(): SanityDoc {
  const h = c.home;
  return {
    _id: 'home',
    _type: 'home',
    hero: {
      eyebrow: 'A church family in Chelsea, Alabama',
      title: 'Pursuing God.\nPursuing others.',
      subline: h.hero.sub,
      image: img(h.hero.image, h.hero.imageAlt),
    },
    welcome: { eyebrow: h.welcome.eyebrow, heading: h.welcome.title, text: h.welcome.body },
    app: { eyebrow: h.app.eyebrow, heading: h.app.title, text: h.app.body, image: img(h.app.image, h.app.imageAlt) },
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
      sections: [],
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
      sections: [],
      seo: seo('The elders, pastors, staff, and deacons of Chelsea Community Church.'),
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
      header: header({ eyebrow: "I'm New", title: imnew.hero.title, buttons: [btn.cc("Let Us Know You're Coming!", planVisit)] }),
      sections: [
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
          buttons: [btn.cc("Let Us Know You're Coming!", planVisit)],
          background: 'tinted',
        }),
        cta('Join us this Sunday', "The best way to get to know us is a Sunday morning. We'd love to meet you.", btn.url('Get directions', site.address.maps)),
      ],
      seo: seo("What to expect on a Sunday at Chelsea Community Church — services at 9:00 & 10:30 AM, the rhythm of our week, what to wear, where to go first, and how to let us know you're coming."),
    }),

    page('/our-story', 'Our Story', {
      header: header({ eyebrow: 'About', title: 'Our Story' }),
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
        cta('Come and see', "The best way to know us is a Sunday morning. We'd love to meet you.", btn.cc('Plan a Visit', planVisit), btn.page('What we believe', 'page-beliefs')),
      ],
      seo: seo("Our vision, our founding, and our affiliation — the story of Chelsea Community Church, from Double Oak's Chelsea campus to an independent church under the Chelsea Park clocktower."),
    }),

    page('/beliefs', 'What We Believe', {
      header: header({ eyebrow: 'About', title: 'What We Believe', buttons: [btn.page('Our story →', 'page-our-story')] }),
      sections: [
        section('textPhotoSection', {
          heading: beliefs.pursuit.title,
          body: paras(...beliefs.pursuit.body),
          photos: [
            photo('/images/creation-god.webp', "Detail of God from Michelangelo's Creation of Adam, reaching toward Adam"),
            photo(beliefs.pursuit.image, beliefs.pursuit.imageAlt),
            photo('/images/creation-adam.webp', "Detail of Adam from Michelangelo's Creation of Adam, reaching out"),
          ],
          photoSide: 'right',
          background: 'plain',
        }),
        section('cardsSection', {
          eyebrow: 'Our Beliefs',
          heading: 'What we hold to',
          columns: 2,
          background: 'tinted',
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
      seo: seo('The Bible tells the story of God pursuing us — the beliefs and statement of faith of Chelsea Community Church.'),
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
        cta('Questions about serving?', 'Brian Marbury, our Pastor of Missions & Service, is the one to ask.', btn.email('Email Brian for more information!', 'missions')),
      ],
      seo: seo('Find your place, know your purpose, be people of pursuit — the Teams Mobilizer tool at Chelsea Community Church.'),
    }),

    page('/connections', 'Connections', {
      header: header({ eyebrow: 'Ministries', title: 'Connections', ministry: ref('ministry-connections') }),
      sections: [
        section('textPhotoSection', {
          heading: 'A purpose and a place for everyone',
          body: paras(...connections.body),
          photos: [photo(connections.image.src, connections.image.alt)],
          photoSide: 'right',
          background: 'plain',
        }),
        cta(
          'Stop by the Connections Desk',
          "Just past the Worship Room every Sunday morning — we'll help you find your place.",
          btn.email('Email Brian for more information!', 'connections'),
          btn.page('Plan your first visit', 'page-imnew'),
        ),
      ],
      seo: seo('The Connections team helps every guest and member find their place at Chelsea Community Church — ministries, community groups, and events.'),
    }),

    page('/kids', 'Kids', {
      header: header({ eyebrow: 'Ministries', title: 'Kids', intro: kids.mission, ministry: ref('ministry-kids') }),
      sections: [
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
          background: 'plain',
        }),
        section('textPhotoSection', {
          eyebrow: 'What shapes Kids Ministry',
          heading: 'Gospel · Scripture · Family · Community · Mission',
          body: paras(kids.mission),
          photos: [photo(kids.values.image, kids.values.imageAlt)],
          photoSide: 'left',
          buttons: [btn.cc('Find out about serving in the Kids Ministry', cc.registrations.kidsServe)],
          background: 'tinted',
        }),
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
          background: 'tinted',
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
        cta('Join the brotherhood', "Studies, the fire pit, serving shoulder-to-shoulder — there's a seat for you.", btn.email('Email Brian for more information!', 'men')),
      ],
      seo: seo("Men's ministry at Chelsea Community Church — discipleship, Men On Fire around the fire pit, relationships, and service alongside our mission partners."),
    }),

    page('/missions', 'Missions', {
      header: header({ eyebrow: 'Ministries', title: 'Missions', intro: `${missions.verse.text} (${missions.verse.ref})`, ministry: ref('ministry-missions') }),
      sections: [
        section('textPhotoSection', {
          eyebrow: 'Monthly missions highlight',
          heading: 'The Big Kaboom',
          body: paras(missions.highlight.body),
          photos: [photo(missions.highlight.image, missions.highlight.imageAlt)],
          photoSide: 'right',
          buttons: [btn.email('Contact Pastor Brian', 'missions')],
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
        section('textSection', {
          eyebrow: 'Resources for personal growth',
          heading: 'Books worth your time',
          body: missions.resources.map((b) => linkBlock('', b.title, b.url, ` — ${b.author}`, 'bullet')),
          background: 'plain',
        }),
        cta('Ready to get involved?', 'Pray, give, or go — Pastor Brian can help you find your place in the mission.', btn.email('Email Brian for more information!', 'missions')),
      ],
      seo: seo('Missions at Chelsea Community Church — local, national, and international partners, monthly highlights, and resources for personal growth.'),
    }),

    page('/prayer', 'Prayer', {
      header: header({ eyebrow: 'Prayer', title: 'We want to pray for you', intro: prayer.cta, buttons: [btn.cc('Share a prayer request', cc.forms.prayer)], ministry: ref('ministry-prayer') }),
      sections: [
        section('textSection', {
          eyebrow: 'Share a request',
          heading: 'How can we pray with you?',
          body: paras("Whatever you're carrying — a burden or a blessing — we'd be honored to pray with you. Share as much or as little as you'd like."),
          buttons: [btn.cc('Share a prayer request', cc.forms.prayer)],
          background: 'plain',
        }),
        section('textSection', { eyebrow: 'Our prayer ministry', heading: 'A church where prayer is central', body: paras(prayer.ministry), background: 'tinted' }),
        section('stepsSection', {
          eyebrow: 'Join the prayer team',
          heading: 'How to get involved',
          steps: prayer.joinSteps.map((s) => ({ _type: 'step', _key: key(), text: s })),
        }),
        section('cardsSection', { columns: 2, background: 'plain', cards: [{ _type: 'card', _key: key(), title: 'A note on privacy', text: prayer.note }] }),
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
        cta('Questions about Preschool?', "We'd love to help your family feel at home.", btn.email('Email us for more information!', 'preschool')),
      ],
      seo: seo('Preschool ministry at Chelsea Community Church — worship and community groups for little ones every Sunday, with easy pre-registration for first-time families.'),
    }),

    page('/students', 'Students', {
      header: header({ eyebrow: 'Ministries · Students', title: students.title, intro: students.intro, ministry: ref('ministry-students') }),
      sections: [
        section('textPhotoSection', {
          body: students.schedule.flatMap((s) => [block(s.when, 'h3'), block(s.what)]),
          photos: [photo(students.photo.src, students.photo.alt)],
          photoSide: 'left',
          buttons: [btn.cc('Let us know your family is coming!', planVisit), btn.page('Summer events calendar', 'fixed-calendar')],
          background: 'plain',
        }),
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
        section('openRegistrationsSection', { eyebrow: 'Upcoming events', heading: 'Join us', match: "Women's" }),
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
          photos: worship.images.map((i) => photo(i.src, i.alt)),
          photoSide: 'right',
          background: 'plain',
        }),
        cta('Serve with music or tech', 'Musicians, vocalists, and behind-the-scenes hands all help make Sunday distraction-free.', btn.email(worship.serveCta.label, 'worship')),
      ],
      seo: seo('Blended worship — traditional and contemporary — reflecting a congregation of all generations at Chelsea Community Church.'),
    }),
  ];
}

/** Every document the migration creates, in import order. */
export function buildDocuments(): SanityDoc[] {
  n = 0;
  return [siteSettings(), home(), ...fixedPages(), ...pages(), ...leaders(), ...ministries()];
}
