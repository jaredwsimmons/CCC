import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { client } from './sanity';

const builder = client ? imageUrlBuilder(client) : null;

/**
 * Build a responsive image URL from a Sanity image reference.
 * Returns null when Sanity isn't configured (callers fall back to a static image/placeholder).
 * Honors the editor's hotspot/crop automatically.
 */
export function urlForImage(source: SanityImageSource | undefined | null) {
  if (!builder || !source) return null;
  return builder.image(source).auto('format').fit('max');
}
