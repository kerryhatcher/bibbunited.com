# Domain Pitfalls: v2.0 CMS Data Model & Content

**Domain:** Adding Organization collection, homepage content field, and cache busting to existing Payload CMS 3.x + Next.js 15 civic advocacy site
**Researched:** 2026-03-27
**Scope:** Pitfalls specific to refactoring existing data model (Officials -> Organizations), extending existing Homepage global, and implementing upstream cache busting (Cloudflare API + Traefik)

---

## Critical Pitfalls

Mistakes that cause data loss, broken production pages, or require reverting the entire milestone.

### Pitfall 1: PostgreSQL Enum Transaction Error When Migrating the `body` Select Field

**What goes wrong:** The existing Officials collection has a `body` field typed as `select` with enum values (`board-of-education`, `county-commission`, `water-board`). This is stored in PostgreSQL as `enum_officials_body`. When replacing this `select` field with a `relationship` field pointing to a new Organizations collection, Payload's auto-generated migration will attempt to (a) drop the `body` column (which uses the enum), (b) add a new `organization_id` column, and (c) alter related constraints -- all within a single transaction. If the migration also tries to modify the enum type (e.g., `ALTER TYPE ... ADD VALUE`), PostgreSQL will error with "unsafe use of new value" because PostgreSQL prohibits using newly added enum values within the transaction that added them.

**Why it happens:** Payload wraps all migration statements in `initTransaction()/commitTransaction()`. PostgreSQL's `ALTER TYPE ... ADD VALUE` cannot be used in the same transaction as a statement referencing the new value. This is a known Payload CMS 3.x issue (GitHub issue #15071). Even if the migration does not add enum values, dropping a column that uses an enum type and then dropping the enum type requires careful ordering.

**Consequences:** Migration fails mid-execution. The database may be left in a partially migrated state (some ALTER statements succeeded, others did not). Rolling back requires manual SQL intervention. Production downtime.

**Prevention:**
- Do NOT rely solely on `payload migrate:create` auto-generation for this migration. Always review the generated SQL before running it.
- Plan a multi-step migration: (1) create the Organizations table and populate it with seed data, (2) add the `organization_id` column to Officials as nullable, (3) run a data migration script that maps existing `body` enum values to Organization IDs, (4) drop the `body` column and the `enum_officials_body` type in a subsequent migration.
- Test the migration against a copy of the production database BEFORE deploying.
- If Payload generates a migration that combines enum changes with references, manually split it into two migration files: one that modifies the enum/drops the column, and one that adds the new relationship.

**Detection:** `payload migrate` fails with "unsafe use of new value" or "column does not exist" errors.

**Confidence:** HIGH -- confirmed via Payload GitHub issue #15071 and PostgreSQL documentation on ALTER TYPE.

---

### Pitfall 2: Replacing Officials `body` Select With Relationship Breaks the Contact Officials Page

**What goes wrong:** The existing `/contact-officials` page (at `src/app/(frontend)/contact-officials/page.tsx`) groups officials by `official.body` (a string like `'board-of-education'`). It uses a hardcoded `bodyLabels` map and `bodyOrder` array to render section headers. After replacing `body: select` with `organization: relationship`, the value of `official.body` becomes `undefined` (field removed) or `official.organization` is either an ID (number) or a populated Organization object (depending on `depth`). The grouping logic, labels, and ordering all break simultaneously.

**Why it happens:** The page reads `official.body as string` on line 42 and groups by that string value. After the refactor, there is no `body` field. The `organization` field at `depth: 0` returns just an integer ID (useless for grouping by name). At `depth: 1` it returns the full Organization document -- but the page code does not expect this shape. The `bodyLabels` and `bodyOrder` constants become meaningless.

**Consequences:** The Contact Officials page either crashes (undefined property access), renders a blank page (all officials grouped under `undefined`), or shows raw organization IDs instead of names. This is the most visible public-facing regression.

**Prevention:**
- Update the page code IN THE SAME PHASE as the data model change. Do not deploy the collection change without the page update.
- Ensure the query uses `depth: 1` (or higher) so `official.organization` is populated as a full object with `name`, `website`, etc.
- Replace the `bodyLabels` map with dynamic labels from the populated organization: `(official.organization as Organization).name`.
- Replace `bodyOrder` with a query-driven approach: query all organizations sorted by their `sortOrder` field, then group officials by organization ID.
- Update the `governmentOrgJsonLd` calls to use organization data instead of hardcoded body labels.
- Update the seed script to create Organizations FIRST, then create Officials referencing them.

**Detection:** Visit `/contact-officials` after deployment. Officials should be grouped under organization names with correct headers.

**Confidence:** HIGH -- directly observed in codebase. Lines 25-29 (`bodyLabels`), 40-48 (grouping logic), 50 (`bodyOrder`), and 63-79 (rendering) all depend on the `body` field.

---

### Pitfall 3: Data Migration Ordering -- Organizations Must Exist Before Officials Can Reference Them

**What goes wrong:** The migration adds a `organization_id` foreign key column to the `officials` table that references the `organizations` table. If the Organizations table does not exist yet when the Officials migration runs, or if no Organization rows exist when trying to populate the `organization_id` column for existing Officials, the migration fails with a foreign key constraint violation.

**Why it happens:** Payload's `migrate:create` generates migrations in the order it encounters schema changes, which may not match the logical dependency order. A single migration file that creates the Organizations table AND adds the FK column to Officials in one SQL batch should work, but a data migration step (mapping `body` enum values to Organization IDs) must run AFTER organizations are inserted.

**Consequences:** Migration fails. Existing Officials records cannot be saved because they reference non-existent organizations.

**Prevention:**
- Structure the migration in three logical phases:
  1. Schema migration: Create `organizations` table + add nullable `organization_id` column to `officials`.
  2. Data migration: Insert Organization seed records (Board of Education, County Commission, Water Board), then UPDATE existing officials SET `organization_id` = (SELECT id FROM organizations WHERE slug matches old body value).
  3. Cleanup migration: Drop the `body` column and `enum_officials_body` type. Optionally make `organization_id` NOT NULL if all records are populated.
- The `organization_id` column MUST be nullable initially to avoid constraint failures during migration.
- The seed script must also be updated to create organizations before officials, with the same dependency ordering.

**Detection:** Migration error: "insert or update on table officials violates foreign key constraint."

**Confidence:** HIGH -- standard relational database migration pattern.

---

### Pitfall 4: Cloudflare Cache Purge Fires on Every Draft Save, Not Just Publish

**What goes wrong:** The afterChange hook fires on EVERY document change -- including draft saves, autosaves, and admin form initializations. If the Cloudflare API purge is triggered in the afterChange hook without checking whether the change represents an actual publish event, every keystroke by an editor in the admin panel generates Cloudflare API calls. With the Free plan limit of 5 purge-everything requests per minute (bucket size 25), editors hit rate limits within seconds.

**Why it happens:** Payload's `afterChange` hook does not distinguish between draft saves and published saves by default. The existing revalidation hooks (in `src/hooks/revalidate.ts`) already have guards for `disableRevalidate` context and GET requests, but they do NOT check `_status`. Every POST/PATCH that saves a document triggers the hook, including draft saves and autosaves.

**Consequences:** Cloudflare API rate limiting (HTTP 429 responses). Cache purge calls silently fail. Editors experience slowness because async hooks that hit rate limits may take seconds to resolve. Purge-everything calls waste the entire zone cache on trivial edits.

**Prevention:**
- Check the document's `_status` field (for collections with draft/publish workflow) before triggering purge. Only purge when `_status === 'published'` or when the document transitions from draft to published.
- For globals (Homepage, UrgentBanner, etc.) which do not have `_status`, always purge on change since every save is effectively a publish.
- Use URL-specific purge (`POST /zones/{zone_id}/purge_cache` with `files` array) instead of purge-everything. The Free plan allows 800 URLs/second for single-file purge vs. only 5 requests/minute for purge-everything.
- Batch purge URLs: collect all affected URLs from the afterChange hook, then make a single API call with up to 30 URLs in the `files` array.
- Use the fire-and-forget pattern for the Cloudflare API call so it does not block the admin save response:
  ```typescript
  void purgeCloudflareUrls(affectedPaths) // No return -> Payload does not wait
  ```

**Detection:** Monitor Cloudflare API responses in server logs. HTTP 429 = rate limited. Check Cloudflare dashboard for unusual purge volume.

**Confidence:** HIGH -- confirmed by examining existing hooks and Cloudflare rate limit documentation.

---

## Moderate Pitfalls

Mistakes that cause visible bugs, stale content, or wasted effort but are fixable without data loss.

### Pitfall 5: Traefik Does NOT Cache Content -- Only Cloudflare Does

**What goes wrong:** Implementing "Traefik cache invalidation" as a separate system when Traefik open-source does NOT have built-in HTTP content caching. The existing Traefik ingress middleware (`public-cache` in `argocd/prod/ingress.yaml`) only SETS the `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` response header. It tells Cloudflare and browsers to cache; it does not store cached content itself. Building a Traefik cache invalidation system is solving a problem that does not exist.

**Why it happens:** The milestone requirement says "Cloudflare/Traefik cache busting." Traefik Enterprise and Traefik Hub have HTTP caching middleware, but the project uses open-source Traefik, which only does routing, load balancing, and header manipulation. Caching decisions happen at two points: (1) Cloudflare edge (controlled by Cache-Control headers Traefik sets), and (2) the user's browser (also controlled by Cache-Control headers).

**Consequences:** Wasted development time building Traefik invalidation that has no effect. Confusion about where cache actually lives. Missing the actual caching layer that needs invalidation (Cloudflare edge).

**Prevention:**
- The cache invalidation strategy should target THREE layers:
  1. **Next.js ISR/Data Cache:** Already handled by existing `revalidatePath()` calls in afterChange hooks.
  2. **Cloudflare edge cache:** Purge via Cloudflare API (`POST /zones/{zone_id}/purge_cache` with `files` array).
  3. **Browser cache:** The `s-maxage=60` header means Cloudflare respects server freshness for 60 seconds. The `stale-while-revalidate=300` allows serving stale content for 5 minutes while revalidating. Browser-side cache will naturally refresh within this window after Cloudflare is purged.
- Do NOT add Traefik plugins (Souin, etc.) for caching. The existing header-only middleware is correct and sufficient.
- Document the caching architecture so future developers understand that Traefik only sets headers, Cloudflare stores the cache, and Next.js handles server-side cache.

**Detection:** After content publish, check if Cloudflare serves updated content. If using `curl -I`, look for `CF-Cache-Status: HIT/MISS/EXPIRED` headers.

**Confidence:** HIGH -- confirmed by reading `argocd/prod/ingress.yaml` (Traefik only sets `Cache-Control` header, no `httpcache` middleware) and Traefik open-source documentation (caching is Enterprise/Hub only).

---

### Pitfall 6: Cloudflare Tunnel URL Format -- Purge Must Use the Public Domain, Not Internal

**What goes wrong:** The Cloudflare purge API requires the exact public URLs as they appear to Cloudflare's edge. The application internally resolves to `http://localhost:3000` or the K8s service URL (`http://bibbunited.civpulse-prod.svc.cluster.local:3000`). If the purge hook constructs URLs using `NEXT_PUBLIC_SERVER_URL` set to `http://localhost:3000` (the Docker default from `.env.example`), the purge targets URLs that Cloudflare has never cached.

**Why it happens:** In development, `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`. In production, it may be set to `https://www.bibbunited.com` or may not be set at all. The Cloudflare purge API needs `https://www.bibbunited.com/contact-officials`, not `http://localhost:3000/contact-officials`. The existing `revalidatePath()` calls use relative paths (`/contact-officials`), which work for Next.js internal revalidation but are incomplete for Cloudflare API calls.

**Consequences:** Cloudflare purge API calls succeed (HTTP 200) but purge nothing because the URLs do not match any cached content. Content appears stale to visitors. Debugging is difficult because there is no error -- just silent cache misses.

**Prevention:**
- Create a dedicated environment variable (e.g., `CLOUDFLARE_PURGE_BASE_URL=https://www.bibbunited.com`) separate from `NEXT_PUBLIC_SERVER_URL`. This ensures purge URLs always use the public domain regardless of the server's internal URL.
- In the purge hook, construct full URLs by prepending the base URL to relative paths:
  ```typescript
  const purgeUrl = `${process.env.CLOUDFLARE_PURGE_BASE_URL}${path}`
  ```
- Also add `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` to the K8s secrets and `.env.example`.
- Skip Cloudflare purge entirely in development (when `CLOUDFLARE_ZONE_ID` is not set) to avoid noise.

**Detection:** After content publish, check Cloudflare dashboard for purge activity. If purge count is zero despite saves, the URLs are wrong.

**Confidence:** HIGH -- directly observed in `.env.example` (only has `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`).

---

### Pitfall 7: Adding Rich Text Field to Homepage Global Requires Lexical-Aware Rendering

**What goes wrong:** Adding a new `richText` field to the Homepage global stores data in Lexical's JSON format (nested `root > children > paragraph > text` structure). If the homepage page component renders this field expecting a simple string or raw HTML, it either crashes (trying to render a JSON object) or shows `[object Object]`.

**Why it happens:** Payload 3.x uses the Lexical editor by default. Rich text fields store content as a JSON AST, not HTML strings. Payload provides `@payloadcms/richtext-lexical/react` with a `RichText` component to render this AST. The existing codebase does not currently render any rich text on the homepage (hero spotlight references news posts, topic callouts use plain text fields).

**Consequences:** Homepage crashes or renders raw JSON. If the field is added as a simple `textarea` type instead of `richText` to avoid this, editors lose formatting capabilities.

**Prevention:**
- Use a Lexical `richText` field type (not `textarea`) so editors get the full formatting toolbar.
- Render it using the Payload Lexical React component:
  ```tsx
  import { RichText } from '@payloadcms/richtext-lexical/react'
  // In the component:
  {homepage.contentBlock && <RichText data={homepage.contentBlock} />}
  ```
- Wrap the rendered rich text in a `<div className="prose">` container using `@tailwindcss/typography` (already installed) so headings, lists, links, and paragraphs receive proper styling.
- Handle the null/undefined case gracefully -- when no content has been added yet, render nothing (not an error).
- The field should NOT be `required` so editors are not forced to add content before saving other Homepage fields.

**Detection:** Visit homepage after adding the field. Content should render with proper formatting, not as `[object Object]`.

**Confidence:** HIGH -- standard Payload CMS 3.x rich text rendering pattern.

---

### Pitfall 8: Homepage Global Schema Migration May Reset Existing heroSpotlight and topicCallouts Data

**What goes wrong:** When running `payload migrate:create` after adding a new field to the Homepage global, the auto-generated migration may attempt to recreate or alter the `homepage` table in a way that drops existing array sub-tables (`homepage_hero_spotlight`, `homepage_topic_callouts`). If the migration drops and recreates these tables, all existing homepage configuration (featured stories, topic callouts) is lost.

**Consequences:** Production homepage loses its hero spotlight stories and topic callout cards. The site renders with empty homepage sections. Editors must re-configure everything through the admin panel.

**Prevention:**
- Review the auto-generated migration SQL BEFORE running it. Adding a single `richText` field to the Homepage global should only produce:
  ```sql
  ALTER TABLE "homepage" ADD COLUMN "content_block" jsonb;
  ```
  If the migration includes `DROP TABLE homepage_hero_spotlight` or similar, REJECT it and write the migration manually.
- Adding a `jsonb` column to a globals table should be a simple `ALTER TABLE ADD COLUMN`. If Payload generates a complex migration involving sub-tables, it is a sign of schema diff confusion.
- Always back up the production database before running migrations.
- Test the migration against a database with real data (seeded or production copy), not a fresh empty database.

**Detection:** After migration, check the admin panel's Homepage settings. Hero spotlight and topic callouts should still be populated.

**Confidence:** MEDIUM -- depends on specific Payload version behavior. Payload 3.80.0 (installed version) generally handles additive field changes well, but edge cases exist.

---

### Pitfall 9: Cloudflare API Token Permissions -- Zone-Scoped vs Account-Scoped

**What goes wrong:** Creating a Cloudflare API token with insufficient permissions. A token scoped to "Zone:Read" cannot purge cache. A token scoped to the wrong zone purges a different site's cache. An account-level token with `Zone:Cache Purge:Edit` permission on ALL zones could accidentally purge cache for other domains hosted on the same Cloudflare account.

**Why it happens:** Cloudflare's token permission model is granular. Cache purge requires `Zone:Cache Purge:Edit` permission, which is a separate permission from general Zone editing. The zone ID must match the specific zone (domain) being purged.

**Consequences:** With wrong permissions: HTTP 403 on purge API calls, cache never invalidated. With overly broad permissions: accidental purge of other zones on the same account if code has a bug.

**Prevention:**
- Create a dedicated API token with EXACTLY these permissions:
  - **Zone > Cache Purge > Edit** -- scoped to only the `bibbunited.com` zone.
  - No other permissions needed.
- Store the token as `CLOUDFLARE_API_TOKEN` in K8s secrets (not in code or Dockerfile).
- Store the zone ID as `CLOUDFLARE_ZONE_ID` (find it in Cloudflare dashboard under the domain's Overview page, right sidebar).
- Test the token before deploying by making a manual curl call:
  ```bash
  curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
    -H "Authorization: Bearer {api_token}" \
    -H "Content-Type: application/json" \
    --data '{"files":["https://www.bibbunited.com/"]}'
  ```
- If the Cloudflare account manages multiple domains, NEVER use a global API key -- always use scoped API tokens.

**Detection:** Cloudflare purge API returns HTTP 403 with `"code": 9109, "message": "Access denied"`.

**Confidence:** HIGH -- standard Cloudflare API security practice.

---

### Pitfall 10: `payload_locked_documents_rels` Table Must Be Updated for New Collections

**What goes wrong:** When adding a new `organizations` collection, Payload's auto-generated migration needs to add an `organizations_id` column to the `payload_locked_documents_rels` table (which tracks document locking across all collections). If this column addition fails or is missing from the migration, document locking breaks for the new collection, causing "Error editing document" in the admin panel.

**Why it happens:** Payload's document locking system uses a single `payload_locked_documents_rels` table with one foreign key column per collection. This is an internal implementation detail. When auto-generating migrations, Payload usually handles this correctly, but there are known issues (GitHub issue #14800) with auto-generated down migrations and edge cases where the column addition is missing.

**Consequences:** Editors cannot edit Organization documents in the admin panel. Error appears when clicking to edit an organization.

**Prevention:**
- After running `payload migrate:create`, inspect the generated SQL for the line:
  ```sql
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "organizations_id" integer;
  ```
  If this line is missing, add it manually.
- Also check for the corresponding foreign key and index:
  ```sql
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk"
    FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_organizations_id_idx"
    ON "payload_locked_documents_rels" USING btree ("organizations_id");
  ```
- The existing migration (20260324_153917.ts) shows this pattern for officials and meetings at lines 343-344 and 428-429.

**Detection:** Edit an Organization in the admin panel. If locking errors appear, the column is missing.

**Confidence:** MEDIUM -- Payload usually handles this automatically, but the known issue makes it worth verifying.

---

## Minor Pitfalls

### Pitfall 11: Async Cloudflare Purge Hook Blocks Admin Save If Not Fire-and-Forget

**What goes wrong:** If the Cloudflare purge function is declared `async` and returned from the afterChange hook, Payload awaits the API call. With network latency to Cloudflare's API (50-200ms typical, up to 2s on timeout), every save in the admin panel feels sluggish. Editors notice a delay between clicking "Save" and seeing the success toast.

**Prevention:**
- Use the fire-and-forget pattern for external API calls in hooks:
  ```typescript
  afterChange: [
    revalidateCollection(['/contact-officials']),
    ({ doc, req, context }) => {
      if (context?.disableRevalidate) return doc
      void purgeCloudflareCache(['/contact-officials']) // Fire and forget
      return doc
    },
  ]
  ```
- Add error handling inside the purge function (try/catch with logging) so failures do not crash the server process.
- Consider using Payload's jobs queue for purge operations if latency becomes an issue (queue processes asynchronously after the request completes).

**Detection:** Time the admin save operation before and after adding the purge hook. A >200ms increase indicates the hook is blocking.

**Confidence:** HIGH -- confirmed by Payload docs: "if your hook returns a Promise, Payload will wait for it to resolve."

---

### Pitfall 12: Organization Collection Missing From SEO Plugin Configuration

**What goes wrong:** The existing `seoPlugin` in `payload.config.ts` (line 59) is configured for `collections: ['pages', 'news-posts']`. If the new Organizations collection needs SEO metadata (title, description, OG image for potential future organization pages), it must be added to this array. Forgetting to add it means the SEO tab does not appear in the Organization admin form.

**Prevention:**
- Evaluate whether Organizations need SEO metadata. For v2.0, organizations are only displayed on the Contact Officials page (no dedicated `/organizations/[slug]` route), so SEO fields are NOT needed yet.
- If a dedicated organization page is added later, add `'organizations'` to the `seoPlugin` collections array at that time.
- This is a non-issue for v2.0 but worth documenting to prevent confusion during development.

**Detection:** Check the admin panel for the Organization form. If an SEO tab is expected but missing, add to plugin config.

**Confidence:** HIGH -- directly observed in payload.config.ts.

---

### Pitfall 13: Seed Script Must Be Updated Atomically With Collection Changes

**What goes wrong:** The existing seed script (`src/seed.ts`) creates Officials with `body: 'board-of-education'` (line 433). After the collection refactor, the `body` field no longer exists and `organization` is required. If the seed script is not updated before the next seed run, it creates Officials with invalid data (missing organization reference, attempting to set removed `body` field).

**Prevention:**
- Update the seed script IN THE SAME COMMIT as the collection schema change:
  1. Create Organizations first (new step between current steps 4 and 5).
  2. Capture Organization IDs by name.
  3. Update Officials creation to use `organization: orgId` instead of `body: 'board-of-education'`.
  4. Remove the `body` field from seed data.
- Update the `homepage` global seed to reference any new content block if applicable.
- Run the full seed on a fresh database to verify the script works end-to-end.

**Detection:** Seed script throws "Validation error" or "Unknown field" when run against the new schema.

**Confidence:** HIGH -- directly observed in seed.ts lines 428-492.

---

### Pitfall 14: Organization `slug` Field Collision With Payload's Auto-Generated Slugs

**What goes wrong:** If the Organization collection includes a `slug` field with Payload's `formatSlug` hook (as used in Pages and NewsPosts), organizations with similar names could generate colliding slugs. For example, "Board of Education" and an organization named "Board Of Education" both generate `board-of-education`. Payload's unique slug constraint causes a database error on the second insert.

**Prevention:**
- If Organizations do not have their own public-facing pages (confirmed for v2.0), do NOT add a `slug` field. Use `name` as the identifier via `useAsTitle: 'name'`.
- If a slug is added for future use, ensure it has a unique index and handle collisions in the seed script (check for existing before creating).
- The existing `formatSlug` hook (at `src/hooks/formatSlug.ts`) lowercases and hyphenates. Test with actual organization names before deploying.

**Detection:** Seed script or admin panel shows "duplicate key violates unique constraint" error.

**Confidence:** MEDIUM -- depends on whether a slug field is added to Organizations.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Organization collection creation | Pitfall 10: `payload_locked_documents_rels` missing column | Verify auto-generated migration includes the column addition |
| Officials `body` -> `organization` refactor | Pitfall 1: Enum transaction error | Split migration into schema + data + cleanup phases |
| Officials `body` -> `organization` refactor | Pitfall 2: Contact Officials page crashes | Update page code in same phase as data model change |
| Data migration (existing officials) | Pitfall 3: FK constraint violation | Create organizations before mapping officials |
| Homepage rich text field | Pitfall 7: `[object Object]` rendering | Use Payload's RichText component with prose styling |
| Homepage global migration | Pitfall 8: Existing data loss | Review migration SQL; additive change should be single ALTER TABLE |
| Cloudflare cache purge implementation | Pitfall 4: Draft saves trigger purge | Check `_status === 'published'` before purging |
| Cloudflare cache purge implementation | Pitfall 5: Traefik has no cache to invalidate | Only target Cloudflare API and Next.js revalidation |
| Cloudflare URL construction | Pitfall 6: Internal URLs do not match cached URLs | Use dedicated `CLOUDFLARE_PURGE_BASE_URL` env var |
| Cloudflare API token setup | Pitfall 9: Wrong permissions | Use zone-scoped token with Cache Purge Edit only |
| Cache purge hook performance | Pitfall 11: Blocking admin saves | Use fire-and-forget (void) pattern |
| Seed script update | Pitfall 13: Stale seed data | Update seed in same commit as collection changes |

## Sources

- [Cloudflare Cache Purge docs -- rate limits and API](https://developers.cloudflare.com/cache/how-to/purge-cache/)
- [Cloudflare API rate limits](https://developers.cloudflare.com/fundamentals/api/reference/limits/)
- [Cloudflare purge API endpoint](https://developers.cloudflare.com/api/resources/cache/methods/purge/)
- [Payload CMS PostgreSQL enum migration issue #15071](https://github.com/payloadcms/payload/issues/15071)
- [Payload CMS migration auto-generated down migration issues #14800](https://github.com/payloadcms/payload/issues/14800)
- [Payload CMS Migrations documentation](https://payloadcms.com/docs/database/migrations)
- [Payload CMS Collection Hooks documentation](https://payloadcms.com/docs/hooks/collections)
- [Payload CMS Global Hooks documentation](https://payloadcms.com/docs/hooks/globals)
- [Payload CMS Relationship Field documentation](https://payloadcms.com/docs/fields/relationship)
- [Payload CMS Hook Context documentation](https://payloadcms.com/docs/hooks/context)
- [PayloadCMS Production Migration Guide (Build with Matija)](https://www.buildwithmatija.com/blog/payloadcms-postgres-push-to-migrations)
- [Traefik open-source middleware documentation](https://doc.traefik.io/traefik/middlewares/http/headers/) -- confirms caching is Enterprise/Hub only
- [Cloudflare Tunnel caching behavior](https://community.cloudflare.com/t/unsolicited-utomatic-caching-via-argo-tunnels-at-cf-edge/308615)
- Direct codebase analysis: `src/collections/Officials.ts`, `src/globals/Homepage.ts`, `src/hooks/revalidate.ts`, `src/payload.config.ts`, `src/seed.ts`, `src/migrations/20260324_153917.ts`, `argocd/prod/ingress.yaml` (2026-03-27)
