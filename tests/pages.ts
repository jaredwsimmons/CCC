// Every route the site builds. `live` pages show Church Center or feed data that
// changes from day to day, so their content is checked by structure, not snapshot.
export const pages: { name: string; path: string; live?: boolean }[] = [
  { name: 'home', path: '/' },
  { name: 'imnew', path: '/imnew' },
  { name: 'our-story', path: '/our-story' },
  { name: 'beliefs', path: '/beliefs' },
  { name: 'leaders', path: '/leaders' },
  { name: 'bylaws', path: '/bylaws' },
  { name: 'serve', path: '/serve' },
  { name: 'connections', path: '/connections' },
  { name: 'kids', path: '/kids' },
  { name: 'men', path: '/men' },
  { name: 'missions', path: '/missions' },
  { name: 'prayer', path: '/prayer' },
  { name: 'preschool', path: '/preschool' },
  { name: 'students', path: '/students' },
  { name: 'women', path: '/women' },
  { name: 'worship', path: '/worship' },
  { name: 'give', path: '/give' },
  { name: 'calendar', path: '/calendar', live: true },
  { name: 'groups', path: '/groups', live: true },
  { name: 'media', path: '/media', live: true },
];
