import type { APIRoute } from 'astro';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { PREVIEW_COOKIE } from '../../../lib/preview';

// Leaves preview. A Partitioned cookie is only cleared by an expiry that is Partitioned
// too, and enable.ts may have set either kind, so both are expired here.
export const GET: APIRoute = async () => {
  const headers = new Headers({ Location: '/' });
  for (const name of [PREVIEW_COOKIE, perspectiveCookieName]) {
    const expired = `${name}=; Path=/; Secure; SameSite=None; Max-Age=0`;
    headers.append('Set-Cookie', expired);
    headers.append('Set-Cookie', `${expired}; Partitioned`);
  }
  return new Response(null, { status: 307, headers });
};
