// Shared by current addresses and old addresses. Redirects always target this page's
// current slug, so they cannot form redirect chains or loops between aliases.
export const RESERVED = new Set(['404', 'calendar', 'groups', 'media', 'give', 'leaders', 'api', 'home', 'history', 'our-story', 'beliefs', 'serve', 'sitemap', 'robots']);

export function validAddress(value?: string): true | string {
  if (!value) return true; // required validation belongs to the field
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value) || value.length > 96) return 'Use up to 96 lowercase letters, numbers and dashes, e.g. vbs-2027.';
  return RESERVED.has(value) ? `“${value}” is already used by the site.` : true;
}

type AddressContext = {
  document?: { _id?: string };
  getClient: (options: { apiVersion: string }) => { withConfig: (options: { perspective: 'raw' }) => {
    fetch: (query: string, params: Record<string, unknown>) => Promise<boolean>;
  } };
};

export async function addressIsUnique(value: string, context: AddressContext): Promise<boolean> {
  if (!value || !context.document?._id) return true;
  const id = context.document._id.replace(/^drafts\./, '').replace(/^versions\.[^.]+\./, '');
  return context.getClient({ apiVersion: '2025-02-19' }).withConfig({ perspective: 'raw' }).fetch(
    '!defined(*[_type == "page" && !sanity::versionOf($id) && (slug.current == $value || $value in previousSlugs)][0]._id)',
    { id, value },
  );
}
