import imageUrlBuilder from '@sanity/image-url';
import { dataset, projectId } from './sanity';
import { withBase } from '../data/site';

export type SanityImage = {
  asset?: { _ref?: string };
  _sanityAsset?: string; // migrated content, before import: "image@file://./public/images/x.webp"
  hotspot?: { x: number; y: number };
  alt?: string;
} | null | undefined;

const builder = projectId ? imageUrlBuilder({ projectId, dataset }) : null;

/**
 * URL for a Sanity image about `width` px wide (Sanity resizes it and serves WebP/AVIF),
 * or the original file from /images while the site renders migrated content.
 */
export function imageUrl(image: SanityImage, width = 1200): string | null {
  if (!image) return null;
  const local = image._sanityAsset?.match(/^image@file:\/\/\.\/public(\/.+)$/)?.[1];
  if (local) return withBase(local);
  if (!builder || !image.asset?._ref) return null;
  return builder.image(image).width(width).fit('max').auto('format').url();
}

/** CSS object-position from the focal point staff set, so cover-cropped photos keep it. */
export function imagePosition(image: SanityImage): string | undefined {
  const h = image?.hotspot;
  return h ? `object-position: ${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : undefined;
}
