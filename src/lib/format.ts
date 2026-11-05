/** ["9:00 AM", "10:30 AM"] → "9:00 & 10:30 AM" (a shared AM/PM is written once). */
export function shortTimes(times?: string[] | null): string {
  const list = times ?? [];
  const suffix = list[0]?.match(/\s?(AM|PM)$/i)?.[0];
  if (suffix && list.every((t) => t.endsWith(suffix))) return `${list.map((t) => t.slice(0, -suffix.length)).join(' & ')}${suffix}`;
  return list.join(' & ');
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
