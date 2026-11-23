import { site, withBase } from '../data/site';
import { churchCenterUrl } from './integrations';
import { mailtoHref, telHref } from '../../shared/contact-links';

// Turns Sanity buttons and menu items into links. Every kind of button is handled here,
// so the rules (Church Center pop-ups, giving funds, email and phone) live in one place.

export type LinkTarget = { _type?: string; _id?: string; slug?: string | null } | null | undefined;

export type Button = {
  label?: string;
  kind?: 'page' | 'churchCenter' | 'give' | 'email' | 'emailAddress' | 'phone' | 'url';
  page?: LinkTarget;
  churchCenterUrl?: string;
  fund?: string;
  amount?: number;
  recurring?: boolean;
  givingBase?: string;
  ministry?: { email?: string } | null;
  emailAddress?: string;
  phone?: string;
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

/** Typed-in links may be web, email or phone links or site paths — never javascript: and the like. */
export const safeUrl = (url?: string): url is string => Boolean(url && /^(https?:|mailto:|tel:|\/(?!\/))/i.test(url));

/** Church Center links open in its pop-up (a new tab on phones). */
export const inModal = (url: string) => `${url}${url.includes('?') ? '&' : '?'}open-in-church-center-modal=true`;

// The only Church Center pages it will show inside another site. Registrations, groups and the
// rest refuse (X-Frame-Options), which would leave its pop-up spinning forever.
const MODAL_PAGES = /^\/(?:people\/forms|giving)(?:\/|$)/;

/**
 * A Church Center link: in its pop-up for forms and giving; anything else in a new tab, which
 * Footer.astro turns into a small window on computers for registrations and groups. Phones hand
 * either kind to the Church Center app when it's installed.
 */
export function churchCenterLink(url: string): { href: string; newTab: boolean } {
  let path = '';
  try {
    path = new URL(url).pathname;
  } catch {
    // Not a full address: treat it as a page the pop-up can't show.
  }
  return MODAL_PAGES.test(path) ? { href: inModal(url), newTab: false } : { href: url, newTab: true };
}

/** Where a button goes, and whether in a new tab; null if it isn't filled in. */
export function buttonLink(b: Button | null | undefined): { href: string; newTab: boolean } | null {
  if (!b) return null;
  switch (b.kind) {
    case 'page': {
      const path = pathFor(b.page);
      return path ? { href: withBase(path), newTab: false } : null;
    }
    case 'churchCenter':
      return safeUrl(b.churchCenterUrl) ? churchCenterLink(b.churchCenterUrl) : null;
    case 'give': {
      if (!b.fund || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(b.fund)) return null;
      const url = new URL(`${churchCenterUrl(b.givingBase) || site.churchCenter.giving}/to/${b.fund}`);
      if (b.amount) url.searchParams.set('default_amount', String(b.amount));
      if (b.recurring) url.searchParams.set('recurring', 'true');
      return { href: inModal(url.toString()), newTab: false };
    }
    case 'email':
      return b.ministry?.email ? { href: `mailto:${b.ministry.email}`, newTab: false } : null;
    case 'emailAddress': {
      const href = mailtoHref(b.emailAddress);
      return href ? { href, newTab: false } : null;
    }
    case 'phone': {
      const href = telHref(b.phone);
      return href ? { href, newTab: false } : null;
    }
    case 'url':
      if (!safeUrl(b.url)) return null;
      return b.url.startsWith('/')
        ? { href: withBase(b.url), newTab: false }
        : { href: b.url, newTab: /^https?:/.test(b.url) };
  }
  return null;
}

/** "Section" component variant for a section's background choice. */
export const variantFor = (background?: string): 'default' | 'alt' | 'navy' =>
  background === 'tinted' ? 'alt' : background === 'navy' ? 'navy' : 'default';
