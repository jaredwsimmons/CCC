import { test, expect } from '@playwright/test';
import { buttonLink, churchCenterLink } from '../src/lib/links';

// Where a Sanity button goes. Staff type some of these links in, so the rules matter.
test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'no browser involved; run once');
});

test('buttons never link to script or protocol-relative URLs', () => {
  for (const url of ['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,hi', '//example.com']) {
    expect(buttonLink({ kind: 'url', url }), url).toBeNull();
    expect(buttonLink({ kind: 'churchCenter', churchCenterUrl: url }), url).toBeNull();
  }
});

test('buttons link to site pages, web addresses and giving funds', () => {
  expect(buttonLink({ kind: 'url', url: '/bylaws' })).toEqual({ href: '/bylaws', newTab: false });
  expect(buttonLink({ kind: 'url', url: 'https://example.com' })).toEqual({ href: 'https://example.com', newTab: true });
  expect(buttonLink({ kind: 'page', page: { _type: 'fixedPage', _id: 'fixed-give' } })?.href).toBe('/give');
  expect(buttonLink({ kind: 'page', page: { _type: 'page', slug: 'kids' } })?.href).toBe('/kids');
  expect(buttonLink({ kind: 'give', fund: 'missions', amount: 50, recurring: true })?.href).toBe(
    'https://chelseachurch.churchcenter.com/giving/to/missions?default_amount=50&recurring=true&open-in-church-center-modal=true',
  );
  expect(buttonLink({ kind: 'email', ministry: null })).toBeNull();
});

// Church Center refuses to show its registration and group pages (and most others) inside
// another site, so its pop-up would spin forever on them. Only forms and giving go there.
test('Church Center links use its pop-up only for forms and giving', () => {
  const host = 'https://chelseachurch.churchcenter.com';
  for (const path of ['/people/forms/876492', '/giving', '/giving/to/missions']) {
    expect(churchCenterLink(host + path), path).toEqual({ href: `${host}${path}?open-in-church-center-modal=true`, newTab: false });
  }
  for (const path of ['/registrations/events/3975973', '/groups/community-groups/villagers', '/calendar/events/1']) {
    expect(churchCenterLink(host + path), path).toEqual({ href: host + path, newTab: true });
  }
  const registration = `${host}/registrations/events/3975973`;
  expect(buttonLink({ kind: 'churchCenter', churchCenterUrl: registration })).toEqual({ href: registration, newTab: true });
  expect(buttonLink({ kind: 'churchCenter', churchCenterUrl: `${host}/people/forms/876492` })).toEqual({
    href: `${host}/people/forms/876492?open-in-church-center-modal=true`, newTab: false,
  });
});
