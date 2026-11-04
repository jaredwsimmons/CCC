/** ["9:00 AM", "10:30 AM"] → "9:00 & 10:30 AM" (a shared AM/PM is written once). */
export function shortTimes(times?: string[] | null): string {
  const list = times ?? [];
  const suffix = list[0]?.match(/\s?(AM|PM)$/i)?.[0];
  if (suffix && list.every((t) => t.endsWith(suffix))) return `${list.map((t) => t.slice(0, -suffix.length)).join(' & ')}${suffix}`;
  return list.join(' & ');
}

/** "205-201-0759" → "tel:+12052010759" */
export const telHref = (phone: string) => `tel:+1${phone.replace(/\D/g, '')}`;
