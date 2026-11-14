// Backward-compatible order for existing Home documents without a sections array.
export const defaultHomeSections = [
  { _type: 'homeWeekSection', _key: 'week' },
  { _type: 'homeAnnouncementsSection', _key: 'announcements' },
  { _type: 'homeHighlightsSection', _key: 'highlights' },
];
