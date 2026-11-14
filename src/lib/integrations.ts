import { site } from '../data/site';

export const churchCenterHost = (value?: string): string =>
  value && /^[a-z0-9-]+\.churchcenter\.com$/.test(value) ? value : site.churchCenter.subdomain;

export { churchCenterUrl, podcastFeedUrl } from '../../shared/public-sources';

export const youtubeChannelId = (value?: string): string =>
  value && /^UC[\w-]{22}$/.test(value) ? value : site.media.youtubeChannelId;
