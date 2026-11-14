# Website editing guide

Use the church's Studio address supplied by the administrator. The connected editing workflow must pass the acceptance exercise before this guide is handed over as a verified live process.

## Where to make a change

| Change | Open |
| --- | --- |
| Homepage words, pictures, background video, quick links and section order | Home page |
| Ministry, visitor, information or campaign page | Pages |
| Calendar, Groups, Media, Give or Leaders page layout | Calendar, Groups, Media, Give & Leaders pages |
| Names, roles, biographies, email addresses or portraits | Leaders |
| Ministry contact addresses and deacons | Ministries & Deacons |
| Recurring weekly schedule cards | Weekly rhythm cards |
| Menu, footer, church details, logos or common labels | Navigation, branding & shared settings |
| Events, registration, groups, giving or operational forms | Planning Center / Church Center |
| Video uploads or podcast episodes | The existing video or podcast platform |

## Edit a page

1. Open the page in Live Preview or the content list. Select the text/image in preview when a click-to-edit control is available; otherwise use its labeled form field.
2. Change the words, choose an existing image or upload a replacement, and describe the image in Alt text. Set its crop/focal point to keep the subject visible on phones.
3. Check buttons. Prefer a page reference for another page on this website; use a Church Center link for a form or registration. For a giving fund, copy its slug from the existing Church Center link after `/to/`.
4. Review the draft at desktop and phone widths. Fix validation errors. Publish when the result is ready.

Changes require no website rebuild. Public content has a short application cache plus Sanity CDN caching; it may take more than ten seconds to appear. If a feed is unavailable, the website may show older data or an unavailable message. Ask the administrator about the measured timing for this installation.

## Build a new page

1. Under Pages, start with Ministry page, Info page, Event page or Document. Fill in the page title and generate its web address, such as `vbs-2027`.
2. Fill the header introduction/photo/buttons. Leaving the header title empty uses the page title.
3. Add approved sections from Content, Church Center, Media, or People & shared schedules. Drag to reorder. Use **Hide this section** to keep its content off the website temporarily; remove a section only when you no longer need it.
4. Give a section a heading above its cards/items. In rich text, Heading means H2, Subheading means H3 and Small heading means H4. The main page title already supplies H1.
5. For a Church Center block, edit the underlying record in Planning Center. Configure the block's matching words, link or display settings here. Check what the live block actually includes before publishing.
6. Preview and publish the page. Then add a page reference under shared settings → Menu if visitors should find it there, and publish those settings too. A published page does not automatically enter the menu.

Sections provide approved layout choices; new component designs and application features need the site developer. Fonts, colors and shared spacing follow the church's design system.

## Arrange the homepage

The hero stays at the top. Its title, photos, buttons and background video are editable. Turn off **Play background video** for an image-only hero. Upload a compressed MP4 and keep a main photo for visitors who cannot play it. Reduced-motion visitors see the photo.

Use **Page sections** to reorder This week, Announcements and Message & app spotlight, hide them, or add other approved sections. Each original Home layout reads the content fields farther down the same document. Use each Home layout once. An explicitly empty section list leaves only the hero and quick links; it does not restore the old sections. Quick links have their own hide switch.

Existing datasets need the administrator's guarded CMS upgrade before staff rearranges this list. The upgrade initializes the current three-section order without replacing copy.

## Change addresses, retire pages and recover edits

- Before changing a page's web address, put its previous value in **Old addresses**, without a slash. Publish both changes together. Old links redirect directly to the current address. An old address must not be another page's current or old address.
- Remove links from the menu, buttons and other referencing content before unpublishing a page. Sanity may block actions while references remain. Unpublishing also disables its old-address redirects.
- To undo an unpublished edit, use the supported discard-changes action. For published mistakes, use Studio's available history/restore controls, preview the recovered content and publish it. The administrator must verify these controls for your actual account.
- Contact the administrator for deleted content, a failed migration or an unavailable Studio. Avoid importing datasets or changing source connections as a recovery shortcut.

No passwords or API keys belong in page content, public addresses or media fields.
