# Phase 15: Organization Data Model - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Editors can manage governing bodies as first-class CMS records. Officials are dynamically linked to organizations via relationship field instead of hardcoded body select. Contact Officials page rebuilt to display officials grouped by organization level and sorted by org sortOrder. Multi-step data migration maps existing body values to organization relationships without data loss.

Requirements: ORG-01 through ORG-07

</domain>

<decisions>
## Implementation Decisions

### Organization Fields (ORG-01)
- **D-01:** Structured address fields (street, city, state, zip) — all optional
- **D-02:** Level field as required select: County, State, National
- **D-03:** sortOrder number field for controlling display order within level groups
- **D-04:** Slug field using existing `slugField` helper for URL-ready identifier (ORG-03)

### Contact Officials Page (ORG-05)
- **D-05:** Section headers show org name only (no inline contact info)
- **D-06:** Organizations grouped by level in fixed order: County, State, National
- **D-07:** Within each level group, organizations sorted by sortOrder field
- **D-08:** Officials sorted by their own sortOrder within each organization (existing behavior preserved)

### Delete Protection
- **D-09:** Block delete on organizations that have linked officials — reuse `preventReferencedDelete` hook pattern with clear error message: "Remove or reassign officials first."

### Seed Data (ORG-06)
- **D-10:** Seed creates all 3 existing bodies as county-level orgs: Board of Education, County Commission, Water Board
- **D-11:** Seed creates 1-2 state/national example orgs (e.g., Georgia Board of Education) to demonstrate level grouping
- **D-12:** All example orgs include placeholder officials (1-2 per org) to demonstrate full grouping on Contact page
- **D-13:** Existing 9 BOE officials linked to Board of Education org

### Claude's Discretion
- Organization admin panel layout (field positioning, default columns) — follow existing collection patterns
- JSON-LD structured data updates for Contact Officials page — adapt existing `governmentOrgJsonLd` helper
- Revalidation hook paths for organizations — follow existing `revalidateCollection` pattern

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Collections & Patterns
- `src/collections/Officials.ts` — Current Officials collection with hardcoded `body` select field (the field being replaced)
- `src/collections/NewsPosts.ts` — Reference for relationship field pattern, versioning, and hook configuration
- `src/collections/Pages.ts` — Reference for slugField usage and collection structure
- `src/fields/slug.ts` — Reusable slug field helper with formatSlug hook
- `src/hooks/revalidate.ts` — Revalidation hook pattern to reuse for organizations
- `src/hooks/preventReferencedDelete.ts` — Delete protection hook pattern to reuse for organizations

### Frontend
- `src/app/(frontend)/contact-officials/page.tsx` — Current Contact Officials page with hardcoded bodyLabels/bodyOrder (must be rebuilt)
- `src/app/(frontend)/contact-officials/loading.tsx` — Loading state (preserve)

### Seed & Migration
- `src/seed.ts` — Current seed script with 9 BOE officials (lines 426-512) — must be updated to create orgs and link officials

### Requirements
- `.planning/REQUIREMENTS.md` — ORG-01 through ORG-07 acceptance criteria, plus deferred ORG-08/ORG-09

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `slugField` (`src/fields/slug.ts`): Auto-generates slug from title field — reuse for organization name->slug
- `revalidateCollection` (`src/hooks/revalidate.ts`): Revalidation hook — reuse for organizations to bust `/contact-officials` cache
- `preventReferencedDelete` pattern (`src/hooks/preventReferencedDelete.ts`): Existing hook pattern for blocking deletes on referenced records
- `generatePageMeta` (`src/lib/metadata.ts`): Page metadata helper — no changes needed
- `governmentOrgJsonLd` (`src/lib/jsonLd.ts`): JSON-LD helper that may need updating for org-based structure

### Established Patterns
- Collections use `admin.useAsTitle` for display, `admin.defaultColumns` for list view
- Relationship fields use `relationTo` with `depth: 1` for populated queries
- Seed script uses find-or-create by unique field for idempotency
- `revalidateCollection` accepts static paths or a function returning paths from the doc
- Hooks registered in collection config under `hooks.afterChange` and `hooks.beforeDelete`

### Integration Points
- `payload.config.ts` — Must register new Organizations collection
- `src/seed.ts` — Must create orgs before officials, update official creation to use org relationship
- `src/app/(frontend)/contact-officials/page.tsx` — Must query organizations + officials, group by level
- `src/payload-types.ts` — Auto-generated; will update after collection changes

### Known Migration Constraints (from STATE.md)
- PostgreSQL enum transaction error — auto-migration will fail for body->organization refactor; must hand-author migration SQL
- Contact Officials page must update atomically with Officials schema change to avoid runtime crash
- Check production Officials data inventory before migration — verify body values match expected set

</code_context>

<specifics>
## Specific Ideas

- Level group display order is explicitly: County first, State second, National third — this is a fixed display order, not alphabetical
- User specifically wants org detail pages (ORG-08) in a future phase with meetings linked to orgs (ORG-09) as a companion feature
- The org name-only section header was chosen because org detail pages will eventually provide the full contact info view

</specifics>

<deferred>
## Deferred Ideas

- **ORG-08: Organization detail pages** — Dedicated public URLs at `/organizations/[slug]` with full org info + linked officials. User wants this as a future phase. The Contact page name-only header is designed anticipating a "view details" link later.
- **ORG-09: Meetings linked to organizations** — User specifically requested that meetings should be linked to orgs and upcoming meetings displayed on org detail pages. This pairs with ORG-08 and should be in the same future phase.

</deferred>

---

*Phase: 15-organization-data-model*
*Context gathered: 2026-03-27*
