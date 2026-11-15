# Sanity administrator runbook

## Current release state

PR #9 was merged on November 14, 2026. The website is deployed to the existing review site, `https://chelsea-church-website.chelsea-church-website.workers.dev/`, using project `nrlmdamv`, dataset `production`. Additional version-preview URLs are disabled. The church's public domain has not been changed.

The hosted Studio at `https://chelseachurch.sanity.studio` has the updated build and schema. Home controls and weekly video labels are initialized; current branding assets and public source settings are populated in Sanity. The guarded copy updates were applied to published content and matching drafts without publishing the three pre-existing staff drafts.

Connected verification on November 15 covered section selection, custom validation, draft preview, publishing, a draft-only edit, automatic preview refresh after rapid typing, and discarding that edit to recover the published content. Anonymous Content Lake reads could not see the draft. The temporary verification page was unpublished and removed. Live document validation, including custom callbacks, reported no errors. This used an administrator account; staff must still rehearse with their own accounts and approve the handoff. No account roles were changed.

A native pre-rollout backup contains 53 content documents (including three staff drafts) and all 50 original image files, each checked against its original SHA-1. Temporary preview secrets were excluded. This replaces the earlier CDN-rendition snapshot as the recovery backup. The approved one-hour rollout token was revoked after use; a subsequent authenticated request returned 401.

The configured YouTube playlist and channel RSS endpoints returned 404 during verification. Keep the staff-configured YouTube button visible when a playlist feed is unavailable. The three short weekly labels are stored in Sanity and apply when video entries are available; this does not certify the upstream media feed.

The existing dataset remains compatible when new fields are absent. Branding/source/wording fields fall back to existing values; a missing Home sections array uses the original three sections. An empty array intentionally hides all body sections.

## Connect the existing preview

1. Identify the church-owned project and current dataset; inspect its existing content. Confirm church account ownership and the staff who edit, publish and administer it. Check available role/history/approval features against the actual subscription before promising them.
2. Keep one website preview and a verified dataset export before any import or patch. The existing preview uses the `production` Sanity dataset; it is not an isolated copy of church content. Test future destructive migrations on a separate dataset or verified copy without creating another preview website. Do not overwrite a populated dataset with the repository's seed import.
3. Set website `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` and `PUBLIC_SANITY_STUDIO_URL`; set Studio `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` and `SANITY_STUDIO_PREVIEW_URL` to the matching existing installation. Use a server-side read token as `SANITY_API_READ_TOKEN`. See README for preview origin/CORS setup.
4. Run `npm run cms:check` from the repository root. It reads local `.env`, `.dev.vars` and `studio/.env` when present. A passing result confirms matching project/dataset, required published documents and authenticated reading, not the browser workflow.
5. Deploy the reviewed application and Studio to their existing addresses through the church's hosting process. Test Studio login, preview navigation, click-to-edit, CORS, public-vs-draft isolation and publishing with real staff accounts.

Project IDs and public URLs are configuration; tokens remain hosting secrets. Never put credentials in Sanity documents or commit environment files.

## Existing-content upgrade

Export the dataset with the church's authenticated Sanity CLI (`sanity dataset export <dataset> <backup-path>`), record the application/Studio commit and verify the backup is readable. Keep backups outside the public site and repository.

Run `npm run cms:upgrade` to review the dry run. It lists only missing Home controls: the default three-section array and `hero.showVideo`. It never replaces an existing array, including an intentionally empty one, and preserves an explicit video setting.

After checking staging and the export, run `npm run cms:upgrade -- --apply` with `SANITY_API_WRITE_TOKEN` supplied through the environment. Each document patch checks the revision read by the script, so concurrent edits fail instead of being overwritten. Published Home and its draft are handled separately. If a revision changes, inspect the new content and rerun the dry run. Keep migration logs.

The earlier review copy corrections use the separate `npm run reconcile:content` script. Review that dry run independently. Do not assume a code deployment changes an existing dataset.

For a brand-new, empty project only, the initial `export:sanity`/dataset import includes current branding images and the new Home controls. Existing projects can upload replacement branding directly in Studio; empty branding fields deliberately retain the current artwork.

## Administrative source settings

Site Settings → Administrative settings holds public source connections, not operational records. Church Center hosts and URLs, YouTube channel IDs and supported podcast URLs are validated. Source identities are included in feed caches, and anonymous Church Center token acquisition is separated by organization. Changes to source settings still follow CMS caching.

The Studio makes these fields read-only for accounts without the `administrator` role. **This is an editor convenience, not backend authorization.** Verify project roles/dataset permissions with the church's actual subscription. If field-level restrictions are required and unavailable, keep those trusted settings under an agreed administrator publishing process; do not claim the UI restriction secures direct API access.

The supported podcast hosts are Anchor, Buzzsprout, Simplecast, Megaphone and Podbean. Review a different provider's public feed before adding its host to the allowlist. New giving funds are created in Planning Center; Sanity buttons accept their existing fund slug.

## Validation and release gates

- Run website type checks/build, deterministic unit/component regressions, Studio TypeScript/build, and browser interaction checks. CI builds Studio with a fixture project ID; that proves it compiles, not that it connects to the church project.
- Run `SANITY_LIVE_PROJECT_ID=nrlmdamv npm run test:unit -- --grep 'Sanity accepts'` for the connected page-query check (override `SANITY_LIVE_DATASET` when appropriate). The local GROQ parser can accept syntax rejected by Content Lake; this check verifies both a real page and a missing address against Sanity's parser.
- Studio and the website share plain defaults/URL validators in `shared/`, with their own TypeScript configuration. Studio uses relative imports and disables Vite's unused path-alias scanning so an independent install does not require the parent website's Astro configuration.
- Review all existing routes at 1440, 768, 390 and 320 pixels, then repeat relevant checks with actual staged CMS content and a newly staff-built page. Inspect headings, overflow, image crop, long labels and hidden/reordered sections.
- Follow the staff acceptance exercise in the implementation plan. Record who tested, account roles, addresses, measured publication/cache delay and any failed steps. Include sitemap delay: it currently permits a one-hour browser/shared cache.
- Confirm anonymous visitors cannot read drafts; invalid/expired preview cookies remain public; unpublishing and restoring behave as documented; operational changes appear from Planning Center without duplicate entry.
- Production application/Studio deployment and domain cutover remain a separate release action after these gates. Preserve the existing email/DNS configuration during any later domain work.

## Recovery

For an unpublished edit, discard changes to recover the last published content; use Refresh preview if the recovered view lags. For older published content, verify the available history/restore controls against the account and subscription. For an application regression, roll back to the recorded compatible revision. If content migration is involved, inspect its field log and prefer a narrow corrective patch; restore a full backup only after accounting for newer staff edits. Rehearse recovery before production, and check both published and draft content afterwards.

Do not delete the previous dataset or overwrite a newer export during troubleshooting. Assign a named church administrator to retain account access, exports and the verified recovery procedure.
