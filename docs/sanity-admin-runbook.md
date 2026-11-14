# Sanity administrator runbook

## Current release state

The staff-management implementation is on the review branch. It has not been deployed or applied to a church dataset. The repository identifies an existing Studio host, `chelseachurch.sanity.studio`, which leads to Sanity sign-in. This workspace has no configured Sanity project, Studio/preview environment URLs or preview read token. Connected preview, church account permissions, publication timing and staff acceptance therefore remain unverified.

The existing dataset remains compatible when new fields are absent. Branding/source/wording fields fall back to existing values; a missing Home sections array uses the original three sections. An empty array intentionally hides all body sections.

## Connect staging first

1. Identify the church-owned project and current dataset; inspect its existing content. Confirm church account ownership and the staff who edit, publish and administer it. Check available role/history/approval features against the actual subscription before promising them.
2. Use a separate staging dataset or a verified copy of the current dataset. Keep a matching export before any import or patch. Do not overwrite a populated dataset with the repository's seed import.
3. Set website `PUBLIC_SANITY_PROJECT_ID`, `PUBLIC_SANITY_DATASET` and `PUBLIC_SANITY_STUDIO_URL`; set Studio `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` and `SANITY_STUDIO_PREVIEW_URL` to the matching staging installation. Use a server-side read token as `SANITY_API_READ_TOKEN`. See README for preview origin/CORS setup.
4. Run `npm run cms:check` from the repository root. It reads local `.env`, `.dev.vars` and `studio/.env` when present. A passing result confirms matching project/dataset, required published documents and authenticated reading, not the browser workflow.
5. Deploy the reviewed application and Studio to the staging addresses through the church's hosting process. Test Studio login, preview navigation, click-to-edit, CORS, public-vs-draft isolation and publishing with real staff accounts.

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
- Studio and the website share plain defaults/URL validators in `shared/`, with their own TypeScript configuration. Studio uses relative imports and disables Vite's unused path-alias scanning so an independent install does not require the parent website's Astro configuration.
- Review all existing routes at 1440, 768, 390 and 320 pixels, then repeat relevant checks with actual staged CMS content and a newly staff-built page. Inspect headings, overflow, image crop, long labels and hidden/reordered sections.
- Follow the staff acceptance exercise in the implementation plan. Record who tested, account roles, addresses, measured publication/cache delay and any failed steps. Include sitemap delay: it currently permits a one-hour browser/shared cache.
- Confirm anonymous visitors cannot read drafts; invalid/expired preview cookies remain public; unpublishing and restoring behave as documented; operational changes appear from Planning Center without duplicate entry.
- Production application/Studio deployment and domain cutover remain a separate release action after these gates. Preserve the existing email/DNS configuration during any later domain work.

## Recovery

For an isolated edit, use the verified Studio history/restore workflow. For an application regression, roll back the deployment to the recorded compatible revision. If content migration is involved, inspect its field log and prefer a narrow corrective patch; restore a full backup only after accounting for newer staff edits. Rehearse recovery on staging before production, and check both published and draft content afterwards.

Do not delete the previous dataset or overwrite a newer export during troubleshooting. Assign a named church administrator to retain account access, exports and the verified recovery procedure.
