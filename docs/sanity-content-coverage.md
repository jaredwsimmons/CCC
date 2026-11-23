# Website content coverage inventory

Implementation inventory, updated November 15, 2026. The website and Studio are deployed at their existing addresses. Connected editing, preview, publishing and draft recovery were checked with an administrator account; staff acceptance under their own accounts remains required. See the administrator runbook for the media-feed limitation. Common fields and nested objects are shared, so they are listed once below rather than repeated for each block.

## Global and page-level controls

| Public element | Sanity control | Query / renderer | State |
| --- | --- | --- | --- |
| Menu/dropdowns, giving button | siteSettings.menu / giveButton | settingsQuery → Base / Header | Editable; unresolved page destinations omitted |
| Header logo, footer mark, shared accent mark | siteSettings.branding | settingsQuery → Header / Footer / DeaconNote / GroupCards / 404 | Editable images; existing assets remain fallbacks |
| Browser and phone icons | siteSettings.branding.favicon / touchIcon | settingsQuery → Base | Editable images |
| Picture shown with shared links | Page header photo, else siteSettings.branding.shareImage | page queries / settingsQuery → Base | Editable images; the worship photo remains the fallback |
| Church name, tagline, search default, address, map, phone, email, services | siteSettings church fields | settingsQuery → Base / Footer / VisitSection | Editable |
| Footer headings, links, prayer action | siteSettings footer fields | settingsQuery → Footer | Editable |
| Public shared labels | siteSettings.wording | settingsQuery → Footer / DeaconNote / GroupCards / Calendar / RegistrationCard / EventList / AnnouncementList / LongText | Editable, with existing wording as fallback |
| 404 words/buttons | siteSettings.notFound | settingsQuery → 404 | Editable |
| Public source connections | siteSettings.integrations | settingsQuery / button projection → feed libraries and link resolver | Wired; administrator UI control; actual account permissions unverified |
| Page title, header, intro, photos, buttons, ministry/deacon badge, SEO | page / fixedPage | pageQuery / fixedPageQuery → PageHeader / Sections / Base | Editable; header focal point applied |
| Page address and previous addresses | page.slug / previousSlugs | pageQuery → dynamic route | Validated; old addresses redirect to current slug |
| Body-section order, insertion, removal, visibility | sections array / hidden | section projections → Sections | Editable across pages and Home |
| Leader name, role, portrait, group, order, bio, email | leader documents | leadersQuery → LeadersSection | All displayed fields wired |
| Ministry name, email, deacons | ministry documents | button/header projections / deaconsQuery | Editable; contactName is an editor reference, not an automatic button label |
| Shared weekly schedule | weeklyRhythm.tiles | settingsQuery → WeeklyRhythmSection / HomeSection | Editable |

## Homepage

| Element | Sanity control | Renderer |
| --- | --- | --- |
| Closure/announcement bar | home.announcement | index |
| Hero copy/photos/focal points/buttons | home.hero | index |
| Background video and image-only switch | home.hero.video / showVideo; main photo is poster | homeQuery resolves uploaded file URL → index |
| Quick links, icons and hide switch | home.quickLinks / hideQuickLinks | index |
| Original three-section order plus approved custom sections | home.sections | homeQuery → Sections |
| Weekly schedule/events heading and links | home.week | homeWeekSection → HomeSection |
| Written announcements heading/count/links | home.announcements | homeAnnouncementsSection → HomeSection |
| Latest-message wording/art/fallback/expiry and app spotlight | home.currentSeries / app | homeHighlightsSection → HomeSection |

The hero stays first and quick links retain their approved placement. These are intentional design constraints, not missing arbitrary-layout controls. Existing Home fields stay in place; section markers reference them instead of copying their content.

## Approved section coverage

Every section includes a Hide this section control. Most share eyebrow, heading, background and/or buttons through `fields.ts`. All button lists resolve page/ministry references through `queries.ts`; photos share alt-text/hotspot fields and `image.ts`; rich text uses the approved Portable Text styles. The table lists additional explicit fields (including nested item fields).

| Section | Schema type | Additional explicit fields | Source of content | Renderer |
| --- | --- | --- | --- | --- |
| Tap-to-open list | `accordionSection` | `intro`, `items`, `item`, `title`, `label`, `body`, `closing` | Sanity | [AccordionSection.astro](../src/components/sections/AccordionSection.astro) |
| Announcements | `announcementsSection` | `unavailableMessage`, `emptyText` | Sanity layout/settings; Church Center records | [AnnouncementsSection.astro](../src/components/sections/AnnouncementsSection.astro) |
| Calendar | `calendarEventsSection` | `emptyText`, `unavailableMessage`, `note` | Sanity layout/settings; Church Center records | [CalendarEventsSection.astro](../src/components/sections/CalendarEventsSection.astro) |
| Cards | `cardsSection` | `intro`, `columns`, `cards`, `card`, `logoOnDark`, `label`, `title`, `text`, `bullets`, `ministry`, `deaconButton`, `memberBadge`, `memberButton` | Sanity | [CardsSection.astro](../src/components/sections/CardsSection.astro) |
| Call-to-action band | `ctaBandSection` | `heading`, `text` | Sanity | [CtaBandSection.astro](../src/components/sections/CtaBandSection.astro) |
| Deacons | `deaconsSection` | `note` | Sanity ministry documents | [DeaconsSection.astro](../src/components/sections/DeaconsSection.astro) |
| Featured events | `featuredEventsSection` | Shared fields | Sanity layout/settings; Church Center records | [FeaturedEventsSection.astro](../src/components/sections/FeaturedEventsSection.astro) |
| Photo gallery | `gallerySection` | `photos` | Sanity | [GallerySection.astro](../src/components/sections/GallerySection.astro) |
| Groups | `groupsSection` | `groupType`, `filters`, `emptyText`, `unavailableMessage`, `noMatchesMessage`, `note` | Sanity layout/settings; Church Center records | [GroupsSection.astro](../src/components/sections/GroupsSection.astro) |
| Latest message | `latestMessageSection` | `source`, `watchLabel`, `watchUrl`, `browseLabel`, `listenLabel` | Sanity layout/settings; media-platform records | [LatestMessageSection.astro](../src/components/sections/LatestMessageSection.astro) |
| Leaders | `leadersSection` | `group` | Sanity leader documents | [LeadersSection.astro](../src/components/sections/LeadersSection.astro) |
| Long text with contents | `longTextSection` | `body` | Sanity | [LongTextSection.astro](../src/components/sections/LongTextSection.astro) |
| Upcoming events | `openRegistrationsSection` | `match` | Sanity layout/settings; Church Center records | [OpenRegistrationsSection.astro](../src/components/sections/OpenRegistrationsSection.astro) |
| Find your place | `placesSection` | `tiles`, `placeTile`, `link`, `text`, `cta`, `highlight`, `moreLabel`, `moreLinks` | Sanity | [PlacesSection.astro](../src/components/sections/PlacesSection.astro) |
| Video playlist | `playlistSection` | `playlist`, `count`, `videoLabels` | Sanity layout/settings; media-platform records | [PlaylistSection.astro](../src/components/sections/PlaylistSection.astro) |
| Podcast episodes | `podcastSection` | `count`, `skipNewest`, `emptyText` | Sanity layout/settings; media-platform records | [PodcastSection.astro](../src/components/sections/PodcastSection.astro) |
| Recent videos | `recentVideosSection` | `count`, `excludePlaylists`, `emptyText` | Sanity layout/settings; media-platform records | [RecentVideosSection.astro](../src/components/sections/RecentVideosSection.astro) |
| Registration card | `registrationCardSection` | `url` | Sanity layout/settings; Church Center records | [RegistrationCardSection.astro](../src/components/sections/RegistrationCardSection.astro) |
| Schedule | `scheduleSection` | `intro`, `cardTitle`, `rows`, `scheduleRow`, `time`, `what`, `place`, `cardLink` | Sanity | [ScheduleSection.astro](../src/components/sections/ScheduleSection.astro) |
| Scripture quote | `scriptureSection` | `text`, `reference` | Sanity | [ScriptureSection.astro](../src/components/sections/ScriptureSection.astro) |
| Steps | `stepsSection` | `steps`, `step`, `title`, `text`, `timeline`, `closing` | Sanity | [StepsSection.astro](../src/components/sections/StepsSection.astro) |
| Text + Photo | `textPhotoSection` | `body`, `photos`, `photoSide` | Sanity | [TextPhotoSection.astro](../src/components/sections/TextPhotoSection.astro) |
| Text | `textSection` | `body` | Sanity | [TextSection.astro](../src/components/sections/TextSection.astro) |
| This Sunday card | `visitSection` | `label`, `subline`, `note`, `directionsLabel` | Sanity | [VisitSection.astro](../src/components/sections/VisitSection.astro) |
| Weekly rhythm | `weeklyRhythmSection` | `heading` | Sanity shared weekly schedule | [WeeklyRhythmSection.astro](../src/components/sections/WeeklyRhythmSection.astro) |

## Current route ownership

New pages join this list dynamically through their published Sanity slug; adding a page does not require a route file.

| Route | Sanity document | Editable structure |
| --- | --- | --- |
| / | `home` | Home page |
| /calendar | `fixed-calendar` | Header + approved sections + SEO |
| /groups | `fixed-groups` | Header + approved sections + SEO |
| /media | `fixed-media` | Header + approved sections + SEO |
| /give | `fixed-give` | Header + approved sections + SEO |
| /leaders | `fixed-leaders` | Header + approved sections + SEO |
| /imnew | `page-imnew` | Header + approved sections + SEO |
| /about | `page-about` | Header + approved sections + SEO |
| /bylaws | `page-bylaws` | Header + approved sections + SEO |
| /ministry | `page-serve` | Header + approved sections + SEO |
| /connections | `page-connections` | Header + approved sections + SEO |
| /kids | `page-kids` | Header + approved sections + SEO |
| /men | `page-men` | Header + approved sections + SEO |
| /missions | `page-missions` | Header + approved sections + SEO |
| /prayer | `page-prayer` | Header + approved sections + SEO |
| /preschool | `page-preschool` | Header + approved sections + SEO |
| /students | `page-students` | Header + approved sections + SEO |
| /women | `page-women` | Header + approved sections + SEO |
| /worship | `page-worship` | Header + approved sections + SEO |
| /kids-students | `page-kids-students` | Header + approved sections + SEO |
| /announcements | `page-announcements` | Header + approved sections + SEO |
| /other-ministries | `page-other-ministries` | Header + approved sections + SEO |

## Boundaries and remaining verification

Planning Center owns operational records and forms; the media platforms own uploads/episodes. Website configuration owns credentials, fixed routing infrastructure, fonts, colors, spacing, decorative icon artwork, accessibility/system controls and new component behavior. The unused legacy ContactForm is not offered as a CMS block.

Live verification remains open: real Studio login/account permissions, isolated staging dataset, preview/click-to-edit round trip, publication timing, actual-content screenshots, unpublish/history recovery and the staff acceptance exercise. No live dataset import, role change, content migration or production deployment has been performed.

See the [staff guide](sanity-staff-guide.md), [administrator runbook](sanity-admin-runbook.md) and [implementation plan](sanity-staff-management-plan.md).
