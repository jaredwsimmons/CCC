// GROQ queries. Field lists follow studio/schemaTypes; references (pages a button or
// menu item points to, ministries) are resolved here so components get plain values.

const LINK = `{ _type, _id, "slug": slug.current }`;
export const BUTTON = `{ ..., page->${LINK}, ministry->{ name, email } }`;
const BUTTONS = `"buttons": buttons[]${BUTTON}`;

const HEADER = `header{ ..., ${BUTTONS}, ministry->{ name, deacons }, "deaconText": *[_id == "siteSettings"][0].deaconCardText }`;
const SECTIONS = `sections[]{
  ...,
  ${BUTTONS},
  "cardLink": cardLink${BUTTON},
  "cards": cards[]{ ..., ${BUTTONS}, ministry->{ name, deacons } }
}`;

export const settingsQuery = /* groq */ `
  *[_id == "siteSettings"][0]{
    ...,
    menu[]{ label, page->${LINK}, children[]{ label, page->${LINK} } },
    "weeklyRhythm": *[_id == "weeklyRhythm"][0].tiles[]{ ..., "button": button${BUTTON} },
    "giveButton": giveButton${BUTTON},
    "footerPrayer": footerPrayer${BUTTON},
    "footerConnect": footerConnect[]${BUTTON},
    notFound{ ..., ${BUTTONS} }
  }
`;

export const homeQuery = /* groq */ `
  *[_id == "home"][0]{
    ...,
    hero{ ..., ${BUTTONS} },
    quickLinks[]{ ..., "link": link${BUTTON} },
    week{ ..., "calendarLink": calendarLink${BUTTON} },
    announcements{ ..., "link": link${BUTTON} },
    places{ ..., tiles[]{ ..., "link": link${BUTTON} }, "moreLinks": moreLinks[]${BUTTON} },
    currentSeries{ ..., ${BUTTONS} },
    app{ ..., ${BUTTONS} }
  }
`;

export const seriesArtQuery = /* groq */ `*[_id == "home"][0].currentSeries.image`;

export const pageQuery = /* groq */ `
  *[_type == "page" && slug.current == $slug][0]{ title, "slug": slug.current, ${HEADER}, ${SECTIONS}, seo }
`;

export const fixedPageQuery = /* groq */ `*[_id == $id][0]{ title, ${HEADER}, ${SECTIONS}, seo }`;

export const leadersQuery = /* groq */ `*[_type == "leader"] | order(order asc){ name, role, group, photo }`;

export const deaconsQuery = /* groq */ `*[_type == "ministry" && count(deacons) > 0] | order(name asc){ name, deacons }`;

export const pageSlugsQuery = /* groq */ `*[_type == "page" && defined(slug.current)].slug.current`;
