// GROQ queries. Run at build time via sanityFetch(). Keep field lists in sync with studio/schemaTypes.

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0]{
    announcement,
    "series": currentSeries{ title, description, youtubeUrl, spotifyUrl, "image": image }
  }
`;

export const allPagesQuery = /* groq */ `
  *[_type == "page" && defined(slug.current)]{
    "slug": slug.current,
    title,
    tagline,
    hero,
    body,
    cta
  }
`;

export const pageBySlugQuery = /* groq */ `
  *[_type == "page" && slug.current == $slug][0]{
    "slug": slug.current,
    title,
    tagline,
    hero,
    body,
    cta,
    seo
  }
`;

export const upcomingEventsQuery = /* groq */ `
  *[_type == "event" && dateTime(startsAt) >= dateTime(now())] | order(startsAt asc)[0...6]{
    title, startsAt, location, "slug": slug.current, registrationUrl
  }
`;

export const recentSermonsQuery = /* groq */ `
  *[_type == "sermon"] | order(date desc)[0...9]{
    title, date, speaker, series, youtubeUrl, spotifyUrl, scripture
  }
`;

export const leadersQuery = /* groq */ `
  *[_type == "staff"] | order(order asc){
    name, role, photo, bio, email
  }
`;
