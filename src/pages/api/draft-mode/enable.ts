import type { APIRoute } from 'astro';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { perspectiveCookieName } from '@sanity/preview-url-secret/constants';
import { SANITY_API_READ_TOKEN } from 'astro:env/server';
import { previewClient } from '../../../lib/sanity';
import { PREVIEW_COOKIE, PREVIEW_SECONDS, signPreview } from '../../../lib/preview';

// The Studio's Live Preview opens this with a one-time secret it saved in Sanity. If
// Sanity confirms the secret, this browser gets the signed cookie that unlocks drafts.
export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const client = previewClient();
  if (!client || !SANITY_API_READ_TOKEN) {
    return new Response('Preview needs SANITY_API_READ_TOKEN on the server.', { status: 503 });
  }

  let result;
  try {
    result = await validatePreviewUrl(client, request.url);
  } catch (err) {
    console.warn('[preview] could not check the secret:', (err as Error).message);
    return new Response('Could not reach Sanity to start the preview.', { status: 502 });
  }
  if (!result.isValid) return new Response('This preview link is not valid.', { status: 401 });

  // The Studio shows the site in a frame from another address, so the cookies must be
  // allowed there (SameSite=None), and Safari only keeps them if they're Partitioned.
  const shared = {
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: PREVIEW_SECONDS,
    partitioned: request.headers.get('sec-fetch-dest') === 'iframe' && request.headers.get('sec-fetch-site') === 'cross-site',
  } as const;
  cookies.set(PREVIEW_COOKIE, await signPreview(SANITY_API_READ_TOKEN), { ...shared, httpOnly: true });
  // Which view the Studio asked for. The overlay changes it when staff switch views.
  cookies.set(perspectiveCookieName, result.studioPreviewPerspective ?? 'drafts', shared);

  return redirect(result.redirectTo ?? '/', 307);
};
