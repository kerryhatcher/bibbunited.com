# Project Research Summary

**Project:** BIBB United — v2.0 CMS Data Model & Content
**Domain:** Civic advocacy site — Payload CMS extension (Organization collection, homepage content, CDN cache busting)
**Researched:** 2026-03-27
**Confidence:** HIGH

## Executive Summary

This milestone is an extension of an already-working Payload CMS 3.x + Next.js + PostgreSQL site — not a greenfield build. All three features (Organization collection, homepage editable content, Cloudflare cache busting) are implemented using capabilities already installed in the stack. Zero new npm packages are required. The primary risks are operational rather than technical: a breaking data model migration (Officials `body` select -> `organization` relationship), a multi-step PostgreSQL migration that must be executed in the correct order to avoid foreign key and enum transaction failures, and cache purge hook logic that fires correctly only on publish, not on draft saves.

The recommended execution order is sequential: Organizations first (foundational data model, hardest migration, most cross-cutting impact), Homepage content block second (fully independent, additive-only, low risk), and Cloudflare cache busting last (cross-cutting hook modification that should happen after the other two features are stable). All three features can share a single branch, but the Organizations work must stabilize before the cache busting hooks are wired in alongside the Organizations collection's revalidation paths.

The key risk mitigation is treating the Officials-to-Organizations migration as three explicit steps rather than one auto-generated migration: schema first (create Organizations table, add nullable FK column to Officials), data second (seed organizations, map existing officials to org IDs by matching old `body` string values), cleanup third (drop the body column and its enum type in a separate transaction). Auto-migration alone will lose data and may generate an illegal PostgreSQL enum transaction. Everything else is a standard, low-risk Payload CMS extension following patterns already proven in the codebase.

## Key Findings

### Recommended Stack

The installed stack is sufficient for all three v2.0 features. No new npm packages are required.

**Core technologies in use:**
- Payload CMS 3.80.0: CollectionConfig, relationship fields, join fields, afterChange hooks — all needed for Organizations; identical patterns already used for Officials and Meetings
- @payloadcms/richtext-lexical 3.80.0: richText field type and RichTextRenderer component — reused as-is for the homepage content block; no new Lexical features or blocks needed
- Node.js native fetch() (Node 22): Cloudflare purge API calls — 15-line utility, no `cloudflare` npm SDK required (26 MB package for one REST endpoint)
- @payloadcms/db-postgres 3.80.0 (Drizzle ORM): schema migrations — requires manual review and multi-step authoring for the body->organization refactor; additive changes (homepage field) auto-migrate correctly

**New environment variables required (Phase 3 only):**
- `CF_ZONE_ID` — Cloudflare zone identifier (from domain Overview sidebar in Cloudflare dashboard)
- `CF_API_TOKEN` — scoped API token with Zone > Cache Purge > Edit permission only
- Both are optional in local dev; purge utility skips silently when absent

### Expected Features

**Must have (table stakes) — all in scope for v2.0:**
- Organization collection with name, website, phone, address, sortOrder fields
- Officials linked to organizations via relationship field (replaces hardcoded `body` select)
- Organization details displayed as section headers on the Contact Officials page
- Join field on Organizations for bidirectional admin UI visibility (virtual, no DB cost)
- Revalidation hooks on Organization changes triggering `/contact-officials` ISR revalidation
- Seed script updated to create organizations before officials (dependency ordering)
- Homepage rich text field (`editorContent`) positioned between hero CTA and LatestNews
- Frontend rendering of content block using existing RichTextRenderer; returns null when empty
- Cloudflare cache purge on content publish (URL-specific for content, purge-all for layout globals)
- Graceful failure on purge errors — never block editor saves
- `disableRevalidate` context guard applied to purge calls (prevents bulk seed from thrashing Cloudflare API)

**Should have (differentiators — not in v2.0 scope):**
- Organization detail pages with dedicated public URLs (`/organizations/[slug]`)
- Meetings linked to organizations for grouped display and filtering
- Content block visibility toggle (enabled/disabled without deleting content)
- Purge-by-URL instead of purge-all for layout globals (optimization only, correctness not affected)

**Defer to v2.1+:**
- Organization types/categories taxonomy
- Blocks-based homepage (multiple block types, drag-and-drop composition)
- Draft preview for homepage content block
- Cloudflare Workers for edge-side cache logic
- Webhook-based purge retry queue

### Architecture Approach

This milestone introduces three minimal, targeted changes to the existing system: one new collection, one modified collection, one modified global, one new utility file, one modified hook file, and two modified frontend pages. No new architectural paradigms are introduced — every pattern follows something already established in the codebase.

**Major components and their changes:**
1. `Organizations` collection (NEW) — flat CMS-managed list of governing bodies; referenced by Officials via relationship field; Join field exposes reverse lookup for admin UX; afterChange hook revalidates `/contact-officials`
2. `Officials` collection (MODIFIED) — `body: select` replaced with `organization: relationship`; requires multi-step migration; `defaultColumns` updated; existing seed data updated
3. `Homepage` global (MODIFIED) — `editorContent: richText` field added between heroSpotlight and topicCallouts; additive-only migration (single ALTER TABLE ADD COLUMN jsonb)
4. `EditorContent` component (NEW) — Server Component wrapping existing RichTextRenderer; returns null when field is empty; uses existing `Section` wrapper for consistent spacing
5. `purgeCache.ts` lib (NEW at `src/lib/purgeCache.ts`) — two functions: `purgeCloudflareUrls(paths)` for content changes, `purgeCloudflareAll()` for layout globals; fails silently with console.error
6. `revalidate.ts` hooks (MODIFIED) — add purge calls alongside existing `revalidatePath()` calls; fire-and-forget via `.catch(() => {})`; respect `disableRevalidate` context
7. `/contact-officials` page (MODIFIED) — replace hardcoded `bodyLabels`/`bodyOrder` with dynamic Join field query sorted by `sortOrder`

**Data flow for content publish (post-v2.0):**
```
Editor saves -> afterChange hook fires -> revalidatePath() [Next.js ISR cache]
                                       -> purgeCloudflareUrls() [Cloudflare edge cache]
```

**Caching architecture (three layers, two relevant):**
- Next.js ISR: already handled by existing hooks
- Cloudflare edge: HTML not cached by default (only static assets); implement purge now so Cache Rules can be safely enabled later
- Traefik: NOT a cache layer (open-source Traefik only sets headers); no Traefik changes needed

### Critical Pitfalls

1. **PostgreSQL enum transaction error on Officials migration** — The `body` select field is stored as `enum_officials_body`. Auto-migration attempts to drop the enum and add a FK column in one transaction, which PostgreSQL prohibits (`ALTER TYPE ... ADD VALUE` cannot be referenced in the same transaction). Split into three migration steps: schema, data, cleanup. Always review auto-generated SQL before running.

2. **Contact Officials page crashes when Officials schema changes** — The page currently groups by `official.body` string using hardcoded `bodyLabels` and `bodyOrder` constants. After the refactor, `official.body` is undefined; the page must be updated in the same commit as the collection change. Use the Join field approach: query organizations sorted by `sortOrder`, each with officials pre-populated via `depth: 1`.

3. **FK constraint violation if Organizations don't exist when mapping Officials** — Migration must create Organization rows before populating `organization_id` on Officials. The `organization_id` column must be nullable during migration, enforced NOT NULL only after all existing records are mapped.

4. **Cloudflare purge fires on every draft save** — The afterChange hook fires on all saves, not just publishes. For collections with draft/publish workflow, guard with `_status === 'published'` check. The Free plan limits purge-everything to 5 requests/minute (bucket size 25) — draft saves would exhaust this within seconds of an editing session.

5. **Cloudflare purge URLs must use the public domain** — `NEXT_PUBLIC_SERVER_URL` defaults to `http://localhost:3000` in local dev. The purge API requires `https://www.bibbunited.com/path`. The utility should construct absolute URLs using the production server URL env var; skip silently when `CF_ZONE_ID` is absent.

## Implications for Roadmap

Based on combined research, the dependency graph drives three phases in strict order. All three research files independently converge on the same sequence: Organizations -> Homepage content -> Cache busting.

### Phase 1: Organization Data Model

**Rationale:** The foundational breaking change. Organizations must exist in the database before Officials can reference them. The schema migration is the highest-risk work in the milestone (enum transaction, FK ordering, data mapping, frontend page regression). The Contact Officials page refactor and seed script update are tightly coupled — ship them in the same phase.

**Delivers:** CMS-managed list of governing bodies; Officials dynamically linked to org records instead of hardcoded strings; Contact Officials page driven by database query; JSON-LD updated to use org names from DB; Payload admin shows linked officials on Organization edit page; full seed runs end-to-end.

**Addresses (from FEATURES.md):** Organization collection with all fields, relationship field on Officials, Join field for admin UX, Contact Officials page refactor, seed script update, revalidation hooks for Organizations.

**Avoids (from PITFALLS.md):** Pitfall 1 (enum transaction — multi-step migration), Pitfall 2 (page crash — atomic deploy), Pitfall 3 (FK ordering — nullable column, orgs first), Pitfall 10 (`payload_locked_documents_rels` column — verify in generated SQL), Pitfall 13 (stale seed — update atomically with collection change), Pitfall 14 (slug collision — do not add slug field in v2.0).

### Phase 2: Homepage Editor Content Block

**Rationale:** Completely independent of Phase 1. Additive-only migration (single `ALTER TABLE ADD COLUMN jsonb`). Reuses existing `richTextEditor` config, `RichTextRenderer` component, and `Section` layout wrapper. Lowest risk work in the milestone — can be verified in complete isolation.

**Delivers:** Editors can add formatted content to the homepage between the GetInvolvedCTA and LatestNews sections. Content renders with proper prose styling from `@tailwindcss/typography`. Empty field renders nothing (graceful null). Sample seed content enables Playwright tests to verify the feature.

**Addresses (from FEATURES.md):** Homepage rich text field, frontend rendering, appropriate prose styling, seed data with sample content block.

**Avoids (from PITFALLS.md):** Pitfall 7 (object rendering — use RichTextRenderer, not raw JSON display), Pitfall 8 (migration drops existing data — review SQL, should be a single ADD COLUMN with no sub-table drops).

### Phase 3: Cloudflare Cache Busting

**Rationale:** Cross-cutting concern that modifies all existing afterChange hooks. Do this last so Phase 1 and Phase 2 hook patterns are already stable. Requires external credentials that need to be provisioned in K8s secrets before end-to-end testing is possible. This is also the only feature requiring external validation — verify by checking the Cloudflare dashboard for purge activity after a publish event.

**Delivers:** Content changes propagate to Cloudflare edge immediately on publish, not after the `s-maxage=60` TTL expires. Layout global changes (Navigation, UrgentBanner, SiteTheme) trigger a full zone purge. Purge failures are logged but never surface to editors. Local development works without Cloudflare credentials configured.

**Addresses (from FEATURES.md):** Cloudflare cache purge on content publish, correct Traefik no-op (no Traefik cache to invalidate), hook-based automatic trigger, graceful failure handling, env var configuration with K8s secret updates, `disableRevalidate` context guard for bulk operations.

**Avoids (from PITFALLS.md):** Pitfall 4 (draft saves trigger purge — check `_status === 'published'`), Pitfall 5 (Traefik has no cache — target Cloudflare API only), Pitfall 6 (wrong URL format — construct absolute URLs using `NEXT_PUBLIC_SERVER_URL` in production), Pitfall 9 (wrong token permissions — zone-scoped Cache Purge Edit only), Pitfall 11 (blocking admin saves — fire-and-forget void pattern).

### Phase Ordering Rationale

- Phase 1 is non-negotiable first: Officials field change is a breaking migration with FK dependencies; Organizations must exist in the database before any related code ships; the Contact Officials page must update atomically with the schema change.
- Phase 2 is next: additive-only, no data risk, independent of Phase 1. Could theoretically run in parallel but sequential ordering avoids seed script merge conflicts and keeps the migration narrative simple.
- Phase 3 is last: modifies `revalidate.ts`, the shared hook used by all collections and globals. The Phase 1 Organizations collection needs finalized revalidation paths before cache purge logic is added alongside them. External Cloudflare credentials must be provisioned before this phase can be tested end-to-end.

### Research Flags

Phases requiring careful implementation attention during execution:

- **Phase 1 (migration authoring):** The migration SQL must be manually reviewed and likely hand-authored in two separate migration files. Do not trust auto-generation for the body->organization refactor. The seed script, frontend page, and collection config must land together.
- **Phase 3 (`_status` guard implementation):** The `_status === 'published'` check depends on the exact hook args signature in Payload 3.80.0. Verify against the existing `src/hooks/revalidate.ts` hook signature before writing the guard. Also verify that the existing revalidation hooks already have this guard or whether the Cloudflare purge needs to add it independently.
- **Phase 3 (URL construction):** Confirm that `NEXT_PUBLIC_SERVER_URL` is set to the production domain (`https://www.bibbunited.com`) in the K8s deployment before testing purge behavior. Purge calls succeed with HTTP 200 even when URLs are wrong — silent failure is the risk.

Phases with well-documented, standard patterns (no additional research needed):

- **Phase 2:** Purely additive change using patterns proven in the existing codebase (richText field on globals, RichTextRenderer component, Section wrapper, conditional null rendering).
- **Phase 3 (implementation mechanics):** The fetch() utility pattern, fire-and-forget hook design, and env var guard are fully specified in STACK.md and ARCHITECTURE.md with working code examples.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Zero new dependencies confirmed; all patterns verified against installed package versions and direct source file inspection |
| Features | HIGH | Requirements derived from explicit PROJECT.md entries and direct codebase analysis; no speculative features included |
| Architecture | HIGH | Component boundaries, data flow, and query patterns verified against actual source files (`src/hooks/revalidate.ts`, `src/globals/Homepage.ts`, `src/collections/Officials.ts`, etc.) |
| Pitfalls | HIGH | Critical pitfalls backed by specific Payload GitHub issues (#15071, #14800), PostgreSQL documentation, and direct codebase line references (seed.ts:428-492, Officials.ts field definitions) |

**Overall confidence:** HIGH

### Gaps to Address

- **Whether a Cloudflare "Cache Everything" Cache Rule is active:** Research confirmed Cloudflare does not cache HTML by default; only static assets are edge-cached. The DEPLOYMENT.md only documents an `/admin` bypass rule — no "Cache Everything" rule is mentioned. The cache purge implementation works correctly either way, but validate the actual Cloudflare dashboard config during Phase 3 to understand what is actually being purged.

- **`_status` guard in hook args for Payload 3.80.0:** Pitfall 4 requires checking `_status === 'published'` before triggering purge. Verify the exact hook args shape in the installed version before implementing — specifically whether `doc._status` or `req.context` is the correct access path in `afterChange` hooks.

- **Production Officials data inventory before migration:** The migration maps existing `body` string values (`board-of-education`, `county-commission`, `water-board`) to new Organization IDs. If production has Officials records with other values beyond these three, the data migration script must account for them. Check production data before executing the migration.

## Sources

### Primary (HIGH confidence)
- Cloudflare Cache Purge API docs (developers.cloudflare.com/api/resources/cache/methods/purge/) — purge endpoint, request shapes, response format
- Cloudflare Default Cache Behavior docs (developers.cloudflare.com/cache/concepts/default-cache-behavior/) — confirms HTML not cached by default
- Cloudflare Cache Purge overview (developers.cloudflare.com/cache/how-to/purge-cache/) — rate limits, plan availability, all purge methods available on all plans as of April 2025
- Cloudflare API Token Permissions docs — Zone > Cache Purge > Edit permission scope
- Payload CMS 3.x docs — relationship field, join field, collection hooks, global hooks, migration workflow, hook context
- Next.js docs — revalidatePath behavior, server component patterns
- Traefik open-source middleware docs — confirms no built-in HTTP caching (Enterprise/Hub only)
- Direct codebase analysis (2026-03-27): `src/hooks/revalidate.ts`, `src/collections/Officials.ts`, `src/globals/Homepage.ts`, `src/app/(frontend)/contact-officials/page.tsx`, `src/app/(frontend)/page.tsx`, `argocd/prod/ingress.yaml`, `src/seed.ts`, `src/migrations/20260324_153917.ts`

### Secondary (MEDIUM confidence)
- payload-plugin-cloudflare-purge (npm/GitHub) — evaluated and rejected; confirmed native fetch() is correct approach
- Payload GitHub issue #15071 — enum transaction error in PostgreSQL migrations (pattern confirmed, exact behavior may vary by version)
- Payload GitHub issue #14800 — auto-generated down migration edge cases

### Tertiary (needs validation during execution)
- Whether a Cloudflare "Cache Everything" Cache Rule is configured for bibbunited.com — check dashboard during Phase 3
- Production Officials data inventory — verify body values before migration
- Payload 3.80.0 `_status` in afterChange hook args — verify before implementing `_status` guard

---
*Research completed: 2026-03-27*
*Ready for roadmap: yes*
