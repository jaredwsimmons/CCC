// Email and phone buttons. Staff type these in, so the Studio and the website accept the same
// values: one plain address (no extra recipients or subject), or a phone number of 10–15 digits.
export function mailtoHref(value?: string): string | null {
  const email = value?.trim() ?? '';
  return /^[^\s@?&#/:]+@[^\s@?&#/:]+\.[a-z]{2,}$/i.test(email) ? `mailto:${email}` : null;
}

export function telHref(value?: string): string | null {
  const phone = value?.trim() ?? '';
  if (!/^\+?[\d\s().-]+$/.test(phone)) return null;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15 ? `tel:${phone.startsWith('+') ? '+' : ''}${digits}` : null;
}
