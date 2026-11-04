import { site, withBase } from '../data/site';

// Turns Sanity buttons and menu items into links. Every kind of button is handled here,
// so the rules (Church Center pop-ups, giving funds, ministry email) live in one place.

export type LinkTarget = { _type?: string; _id?: string; slug?: string | null } | null | undefined;

export type Button = {
  label?: string;
  kind?: 'page' | 'churchCenter' | 'give' | 'email' | 'url';
  page?: LinkTarget;
  churchCenterUrl?: string;
  fund?: string;
  amount?: number;
  recurring?: boolean;
  ministry?: { email?: string } | null;
  url?: string;
};

// The fixed pages' document IDs (studio/sanity.config.ts FIXED_PAGES) → their routes.
const FIXED_ROUTES: Record<string, string> = {
  'fixed-calendar': '/calendar',
  'fixed-groups': '/groups',
  'fixed-media': '/media',
  'fixed-give': '/give',
  'fixed-leaders': '/leaders',
};

/** Site path of a page, the home page or a fixed page; null if it has none yet. */
export function pathFor(doc: LinkTarget): string | null {
  if (!doc) return null;
  if (doc._type === 'home') return '/';
  if (doc._type === 'fixedPage') return FIXED_ROUTES[doc._id ?? ''] ?? null;
  return doc.slug ? `/${doc.slug}` : null;
}

// Typed-in links may be web, email or phone links or site paths — never javascript: and the like.
const safe = (url?: string): url is string => Boolean(url && /^(https?:|mailto:|tel:|\/(?!\/))/i.test(url));

/** Church Center links open in its pop-up (a new tab on phones). */
export const inModal = (url: string) => `${url}${url.includes('?') ? '&' : '?'}open-in-church-center-modal=true`;

/** Where a button goes, and whether in a new tab; null if it isn't filled in. */
export function buttonLink(b: Button | null | undefined): { href: string; newTab: boolean } | null {
  if (!b) return null;
  switch (b.kind) {
    case 'page': {
      const path = pathFor(b.page);
      return path ? { href: withBase(path), newTab: false } : null;
    }
    case 'churchCenter':
      return safe(b.churchCenterUrl) ? { href: inModal(b.churchCenterUrl), newTab: false } : null;
    case 'give': {
      if (!b.fund) return null;
      const url = new URL(`${site.churchCenter.giving}/to/${b.fund}`);
      if (b.amount) url.searchParams.set('default_amount', String(b.amount));
      if (b.recurring) url.searchParams.set('recurring', 'true');
      return { href: inModal(url.toString()), newTab: false };
    }
    case 'email':
      return b.ministry?.email ? { href: `mailto:${b.ministry.email}`, newTab: false } : null;
    case 'url':
      if (!safe(b.url)) return null;
      return b.url.startsWith('/')
        ? { href: withBase(b.url), newTab: false }
        : { href: b.url, newTab: /^https?:/.test(b.url) };
  }
  return null;
}

/** "Section" component variant for a section's background choice. */
export const variantFor = (background?: string): 'default' | 'alt' | 'navy' =>
  background === 'tinted' ? 'alt' : background === 'navy' ? 'navy' : 'default';
