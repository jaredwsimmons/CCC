const ITEM_HEADINGS = new Set(['cardsSection', 'placesSection', 'scheduleSection', 'stepsSection', 'accordionSection', 'leadersSection', 'deaconsSection', 'openRegistrationsSection', 'featuredEventsSection', 'recentVideosSection', 'playlistSection', 'podcastSection']);

export function validateSectionHeading(section: any): true | string {
  if (!section || section.hidden) return true;
  if (ITEM_HEADINGS.has(section._type) && !section.heading?.trim()) return 'Add a section heading above its items so the page keeps a clear heading hierarchy.';
  let level = section.heading ? 2 : 1;
  for (const block of section.body ?? []) {
    const next = /^h[1-6]$/.test(block.style) ? Number(block.style.slice(1)) : null;
    if (next === 1) return 'Use the page header for the main title. Body headings start at Heading (H2).';
    if (next && next > level + 1) return 'A body heading skips a level. Start with Heading, then use Subheading and Small heading in order.';
    if (next) level = next;
  }
  return true;
}
