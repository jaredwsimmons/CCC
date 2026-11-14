export const churchCenterUrl = (value?: string): string | null => {
  try {
    const url = new URL(value ?? '');
    return url.protocol === 'https:' && !url.username && !url.password && !url.port
      && /^[a-z0-9-]+\.churchcenter\.com$/.test(url.hostname) ? url.href.replace(/\/$/, '') : null;
  } catch { return null; }
};

// Supported public podcast providers. Additional providers need a reviewed allowlist
// entry so a content edit cannot make the server fetch a private/arbitrary endpoint.
export function podcastFeedUrl(value?: string): string | null {
  try {
    const url = new URL(value ?? '');
    const hosts = ['anchor.fm', 'feeds.buzzsprout.com', 'feeds.simplecast.com', 'feeds.megaphone.fm', 'feed.podbean.com'];
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && hosts.includes(url.hostname) ? url.href : null;
  } catch { return null; }
}
