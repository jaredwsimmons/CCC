/** ["9:00 AM", "10:30 AM"] → "9:00 & 10:30 AM" (a shared AM/PM is written once). */
export function shortTimes(times?: string[] | null): string {
  const list = times ?? [];
  const suffix = list[0]?.match(/\s?(AM|PM)$/i)?.[0];
  if (suffix && list.every((t) => t.endsWith(suffix))) return `${list.map((t) => t.slice(0, -suffix.length)).join(' & ')}${suffix}`;
  return list.join(' & ');
}

/**
 * Whether a name contains any of the comma-separated words in `match`, at the start of a
 * word, so "Men's" doesn't find "Women's". An empty `match` allows everything.
 */
export function nameMatches(name: string, match?: string): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[’‘]/g, "'");
  const words = norm(match ?? '').split(',').map((w) => w.trim()).filter(Boolean);
  const text = norm(name);
  return !words.length || words.some((w) => new RegExp(`(^|\\W)${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(text));
}

/** An ESV API reply as tooltip text. "John 1:12, 3:16" comes back as one passage each, so those are labeled. */
export function passageText(data: { passages?: string[]; passage_meta?: { canonical?: string }[] }): string {
  const passages = data?.passages ?? [];
  const labeled = passages.length > 1;
  return passages
    .map((p, i) => {
      const text = p.replace(/\s+/g, ' ').trim();
      const label = data.passage_meta?.[i]?.canonical;
      return labeled && label && text ? `${label}\n${text}` : text;
    })
    .filter(Boolean)
    .join('\n\n');
}

/** "205-201-0759" → "tel:+12052010759" */
export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, '')}`;
