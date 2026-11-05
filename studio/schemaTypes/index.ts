import siteSettings from './siteSettings';
import home from './home';
import page from './page';
import fixedPage from './fixedPage';
import leader from './leader';
import ministry from './ministry';
import weeklyRhythm from './weeklyRhythm';
import blockContent from './blockContent';
import button from './objects/button';
import pageHeader from './objects/pageHeader';
import { sectionTypes } from './sections';

export const schemaTypes = [
  siteSettings,
  home,
  page,
  fixedPage,
  leader,
  ministry,
  weeklyRhythm,
  blockContent,
  button,
  pageHeader,
  ...sectionTypes,
];
