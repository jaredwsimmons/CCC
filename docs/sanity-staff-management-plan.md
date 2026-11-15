# Staff-managed Sanity website: implementation plan

Status: implementation merged and deployed to the existing website preview and Sanity Studio. Connected verification completed November 15, 2026; staff acceptance under their own accounts remains pending.

Implementation update: editing controls, homepage builder, validation, source settings, guarded upgrades and staff/admin guides are deployed. The existing preview is the only website preview. The administrator runbook records the native backup, connected draft/publish/recovery checks, preserved staff drafts and YouTube RSS limitation. The phases below remain the staff acceptance and future production-domain release checklist.

## Goal and completion standard

Staff can maintain routine website content through Sanity: update words, photos, branding assets, videos, buttons and navigation; create pages from templates; assemble approved sections; preview drafts; publish; and recover from mistakes. Routine updates must not require editing the repository or deploying code.

Keep the staff-directed page format and the consistent headings, alignment and spacing established in the website review. The editor should provide useful choices within that design. New component types, application behavior and changes to the design system remain development work.

The deployed editor includes 25 section types, four page templates, dynamic page routing, editable navigation and shared church details. Home sections, branding, source connections and common labels are editable. A connected Sanity editing round trip has been verified, in addition to the seeded responsive layout checks and a review of all 22 existing live routes.

## Content ownership

| Content or task | Staff manage it in | Website responsibility |
| --- | --- | --- |
| Pages, headings, body copy, photos, buttons and search descriptions | Sanity | Render published content and preview drafts |
| Homepage sections, branding assets, menus and shared church information | Sanity | Apply the approved layout and responsive rules |
| Events, groups, registrations, giving and operational forms | Planning Center / Church Center | Display feeds and link to the native transaction or form |
| Sermon videos, announcement videos and podcast episodes | Their existing media platforms | Use Sanity for placement, headings, labels and approved source connections |
| Credentials and deployment configuration | Restricted hosting configuration | Keep secrets server-side; never place them in public CMS documents |

Sanity must not become a second database for members, donations, registrations or volunteer schedules. No additional application database is required for this work.

## Implementation sequence

Each batch should have a focused change set, a migration where needed and observable acceptance evidence. Build on the current review work without merging or deploying it as part of writing this plan.

### 1. Establish the editing contract and connected test environment

- Create a coverage inventory mapping each public editorial element to its Sanity field, query and renderer. Include every route, all 25 sections, global navigation, branding, media and button labels. Record intentional system text separately from staff-authored copy.
- Confirm the church-owned Sanity project, dataset, Studio address, website preview address and account ownership. Inspect existing content before importing anything.
- Connect a staging website and Studio using an isolated test dataset or a verified copy of existing content. Configure preview origins and server-side credentials without exposing them to the browser.
- Confirm which permissions and publishing controls the church's actual Sanity subscription supports. Assign administrative integration settings separately where supported; hiding fields in the editor alone is not an access restriction.

**Complete when:** a changed draft appears in authenticated preview, public requests still show the published version, and publishing updates the staging site. Record actual publishing/cache behavior and the remaining coverage gaps.

### 2. Close the remaining content and asset gaps

- Add shared branding fields for header/footer logos, the church mark, favicon and touch icon. Retain existing assets as fallbacks during migration. Decorative interface icons remain part of the component library, with staff selecting approved options where useful.
- Make the homepage background video replaceable, with a poster image and usable image-only fallback. Select an upload or hosted-video approach after checking the existing asset's size and delivery requirements.
- Expose remaining routine public labels and button wording through clear shared settings. Keep accessibility semantics and system behavior reliable rather than turning every internal string into a content field.
- Centralize public Church Center and media source connections in an administrative settings area. Validate supported URLs and identifiers; keep authentication secrets in hosting configuration.
- Wire leader biography/email fields to an agreed presentation, or remove misleading unused editor fields. Check the other schemas for the same mismatch.
- Verify image alternative text, crop and focal-point behavior in every placement, including page headers and homepage artwork.

**Complete when:** each editorial item in the inventory has a working control, and changing a representative photo, logo, video, label and button visibly updates its intended location. No field appears to offer a feature the site ignores.

### 3. Finish the page-building experience

- Add homepage section controls for order and visibility, plus supported additional sections. Preserve the current homepage appearance and migrate existing fields without discarding staff changes.
- Support hiding approved sections without deleting their content across the page builder. Keep section-specific controls understandable and consistent.
- Refine the existing Ministry, Information, Event and Document templates with helpful headings, sample structure and field guidance. Preserve the staff-directed page format; use existing components before creating new ones.
- Organize the insert menu into accurate content, media, Church Center and people categories. Explain what each block displays and where its underlying information is edited.
- Validate page addresses against actual routes, including `/404`, existing redirects and duplicate slugs. Add an editor-managed redirect workflow for changed addresses, with checks against loops and route collisions.
- Validate required destinations, meaningful image descriptions and section headings where needed. Maintain one page H1 and a sensible heading hierarchy without requiring headings on intentionally heading-free blocks.
- Let staff create a page, preview it, publish it and add it to the menu as separate, explicit steps. Navigation should use page references so routine title/address changes stay consistent.

**Complete when:** a staff member can build a ministry or event page, add/reorder/hide sections, publish it at a valid address, add it to navigation, and change its address without breaking the previous link.

### 4. Make Studio understandable and publication recoverable

- Organize Studio around staff tasks: Home, Pages, People & Ministries, Shared Content, Branding, Navigation and Administrative Settings.
- Add clear descriptions and previews to fields and section cards. Extend visual click-to-edit coverage to new display fields and announcement-video labels while keeping URLs and configuration values free of display metadata.
- Verify the supported draft, publish, unpublish and restore workflows with the church's actual accounts. Document who edits, who publishes and who owns integrations; do not promise an approval workflow or scheduling feature until account support is confirmed.
- Protect singleton documents and shared references from accidental duplication or destructive changes. Explain the difference between unpublishing a page and removing its menu link.
- Provide a short staff guide for common edits, page creation, images, Planning Center handoffs and recovery, plus a separate administrator runbook for configuration and troubleshooting.

**Complete when:** a staff tester completes the common tasks using the guide, including recovering an edit, without repository access or a developer explaining each field.

### 5. Verify, migrate and hand over

- Add focused regression coverage for new behavior: schema-to-renderer coverage, page/redirect validation, homepage order and visibility, asset rendering, and draft isolation. Include tests that catch editable fields being silently ignored.
- Exercise the website against the connected staging dataset. Repeat the responsive layout review at 1440, 768, 390 and 320 pixels, including a newly staff-built page and deliberately long or missing optional content.
- Check navigation, links, sitemap inclusion, unpublished pages and retired addresses. Confirm existing Planning Center transactions and live feeds still work, including their unavailable/empty states.
- Before production content changes, export the existing dataset and retain the matching application revision. Use dry-run, revision-guarded migrations that preserve staff-authored values. Document how to restore both content and compatible application code.
- Rehearse migration on staging, record the staff acceptance results, and prepare the production configuration and rollback instructions. Production deployment/domain cutover is a separate release action.

**Complete when:** the acceptance exercise below passes, no routine editorial gap remains unexplained, and the church has the guide, account ownership and recovery instructions.

## Staff acceptance exercise

Use real staff accounts against staging, with a reviewer checking the public result:

1. Change a headline, photo/focal point, button destination and shared church detail.
2. Replace homepage media; reorder a section and hide another without deleting it.
3. Create a page from a template with at least three approved sections; preview its unpublished version.
4. Publish the page, add it to navigation, and verify its desktop/mobile layout and sitemap behavior within the documented cache window.
5. Change its address and confirm the old address redirects correctly.
6. Unpublish it, remove its navigation entry, then recover content through the supported restore workflow. Confirm anonymous visitors cannot retrieve drafts.
7. Update one operational item in Planning Center and verify the website reflects it without re-entering the record in Sanity.

## Handoff deliverables and scope

Deliver the completed coverage inventory, incremental implementation changes, guarded migration scripts, staff guide, administrator runbook, responsive screenshots and acceptance results. Update README claims to describe the verified editing workflow and actual publication timing.

Advanced scheduling/approvals beyond the account's supported controls, custom form building, member portals and new church operations applications are separate decisions. The immediate goal is a dependable website editor built on the existing Sanity and Planning Center foundation.
