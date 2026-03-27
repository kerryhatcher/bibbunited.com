# Phase 15: Organization Data Model - Research

**Researched:** 2026-03-27
**Domain:** Payload CMS 3.x collection design, PostgreSQL schema migration, data model refactoring
**Confidence:** HIGH

## Summary

Phase 15 replaces the hardcoded `body` select field on the Officials collection with a first-class Organizations collection linked via a Payload relationship field. This is a breaking schema change that requires a hand-authored PostgreSQL migration because the `body` column is stored as a PostgreSQL enum (`enum_officials_body`) and cannot be automatically transformed to a foreign key integer column by Payload's migration generator.

The codebase already contains all the reusable patterns needed: `slugField` for URL-ready identifiers (with one caveat about the `title` vs `name` field name), `revalidateCollection` for cache busting, `preventReferencedDelete` for delete protection, and established collection patterns for admin panel configuration. The Contact Officials page must be rebuilt to query organizations with their linked officials instead of grouping by the hardcoded body enum. The seed script must be updated to create organizations before officials and link them via relationship IDs.

The migration is the highest-risk element. It must be hand-authored as a multi-step SQL script: create the organizations table, insert organization rows, add an `organization_id` FK column to officials, populate it by mapping enum values to organization IDs, drop the old `body` column and its enum type, and update the `payload_locked_documents_rels` table to include the new organizations collection.

**Primary recommendation:** Build the Organizations collection first (with all hooks and admin config), then write a single hand-authored migration that creates the table, seeds the mapping data, transforms the officials schema, and cleans up the enum -- all in one transactional migration file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Structured address fields (street, city, state, zip) -- all optional
- **D-02:** Level field as required select: County, State, National
- **D-03:** sortOrder number field for controlling display order within level groups
- **D-04:** Slug field using existing `slugField` helper for URL-ready identifier (ORG-03)
- **D-05:** Section headers show org name only (no inline contact info)
- **D-06:** Organizations grouped by level in fixed order: County, State, National
- **D-07:** Within each level group, organizations sorted by sortOrder field
- **D-08:** Officials sorted by their own sortOrder within each organization (existing behavior preserved)
- **D-09:** Block delete on organizations that have linked officials -- reuse `preventReferencedDelete` hook pattern with clear error message: "Remove or reassign officials first."
- **D-10:** Seed creates all 3 existing bodies as county-level orgs: Board of Education, County Commission, Water Board
- **D-11:** Seed creates 1-2 state/national example orgs (e.g., Georgia Board of Education) to demonstrate level grouping
- **D-12:** All example orgs include placeholder officials (1-2 per org) to demonstrate full grouping on Contact page
- **D-13:** Existing 9 BOE officials linked to Board of Education org

### Claude's Discretion
- Organization admin panel layout (field positioning, default columns) -- follow existing collection patterns
- JSON-LD structured data updates for Contact Officials page -- adapt existing `governmentOrgJsonLd` helper
- Revalidation hook paths for organizations -- follow existing `revalidateCollection` pattern

### Deferred Ideas (OUT OF SCOPE)
- **ORG-08: Organization detail pages** -- Dedicated public URLs at `/organizations/[slug]` with full org info + linked officials. User wants this as a future phase.
- **ORG-09: Meetings linked to organizations** -- Meetings linked to orgs with upcoming meetings displayed on org detail pages. Pairs with ORG-08.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ORG-01 | Editor can create an organization with name, website, phone, address, and email in the CMS admin | Organizations collection definition with all specified fields, admin panel layout follows existing patterns |
| ORG-02 | Editor can view all officials linked to an organization from the organization admin page (Join field) | Payload 3.x Join field type verified in node_modules types -- `type: 'join'`, `collection: 'officials'`, `on: 'organization'` |
| ORG-03 | Organization has a slug field for URL-ready identifier | Existing `slugField` helper reusable but requires adaptation -- current `formatSlugHook` hardcodes `data?.title`, organizations use `name` |
| ORG-04 | Official is linked to an organization via relationship field (replaces hardcoded body select) | Payload relationship field `{ type: 'relationship', relationTo: 'organizations' }` replaces `{ type: 'select', options: [...] }` |
| ORG-05 | Contact Officials page groups officials by organization and displays org contact info | Page query changes from flat officials sort to organizations query with depth:1, grouping by level in fixed County/State/National order |
| ORG-06 | Seed script creates organizations and links existing officials to them | Seed must create orgs first (find-or-create by name), then reference org IDs when creating/updating officials |
| ORG-07 | Data migration maps existing body select values to organization relationships without data loss | Hand-authored SQL migration: create orgs table, insert mapping rows, add FK column, populate via JOIN, drop old enum column |
</phase_requirements>

## Architecture Patterns

### Organizations Collection Structure

```typescript
// src/collections/Organizations.ts
// Source: Derived from existing Officials.ts, NewsPosts.ts, Pages.ts patterns
import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { revalidateCollection, revalidateOnDelete } from '../hooks/revalidate'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  hooks: {
    afterChange: [revalidateCollection(['/contact-officials'])],
    beforeDelete: [/* preventReferencedDelete for linked officials */],
    afterDelete: [revalidateOnDelete(['/contact-officials'])],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'level', 'sortOrder', 'website'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'level',
      type: 'select',
      required: true,
      options: [
        { label: 'County', value: 'county' },
        { label: 'State', value: 'state' },
        { label: 'National', value: 'national' },
      ],
    },
    slugField, // NOTE: requires slug hook adaptation for 'name' field
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    // Address group (all optional per D-01)
    {
      name: 'address',
      type: 'group',
      fields: [
        { name: 'street', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'zip', type: 'text' },
      ],
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first within their level group',
      },
    },
    // Join field for ORG-02 -- virtual, no stored data
    {
      name: 'officials',
      type: 'join',
      collection: 'officials',
      on: 'organization', // field name on Officials collection
    },
  ],
}
```

### Updated Officials Collection (relationship replaces select)

```typescript
// Replace the body select field with:
{
  name: 'organization',
  type: 'relationship',
  relationTo: 'organizations',
  required: true,
  label: 'Organization',
  admin: {
    position: 'sidebar', // or main area, Claude's discretion
  },
},
```

### Contact Officials Page Query Pattern

```typescript
// Source: Adapted from existing page.tsx query pattern
const payload = await getPayload({ config: configPromise })

// Query organizations sorted by level and sortOrder
const orgs = await payload.find({
  collection: 'organizations',
  limit: 100,
  sort: 'sortOrder',
  depth: 0, // We'll query officials separately or use join
})

// Query all officials with populated organization
const officials = await payload.find({
  collection: 'officials',
  limit: 200,
  sort: 'sortOrder',
  depth: 1, // populate organization relationship
})

// Group by level, then by organization within level
const levelOrder = ['county', 'state', 'national'] as const
// Build nested structure: level -> org -> officials[]
```

### Slug Field Adaptation for 'name' Field

**Critical finding:** The existing `formatSlugHook` in `src/hooks/formatSlug.ts` hardcodes `data?.title` as the fallback source. Organizations use `name`, not `title`. Two options:

**Option A (recommended):** Create a `slugFieldFromName` variant or parameterize the slug field helper:
```typescript
// src/fields/slug.ts -- add a sourceField parameter
export function createSlugField(sourceField: string = 'title'): Field {
  return {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: `Auto-generated from ${sourceField}. Edit to override.`,
    },
    hooks: {
      beforeValidate: [createFormatSlugHook(sourceField)],
    },
  }
}

// Backward compatible export
export const slugField = createSlugField('title')
```

**Option B (simpler):** Modify the hook to check `data?.name || data?.title`:
```typescript
const fallback = data?.name || data?.title
```

Option A is cleaner and more extensible. Option B is a quick fix but couples the hook to specific field names.

### Delete Protection Hook for Organizations

```typescript
// src/hooks/preventReferencedDelete.ts -- add new export
export const preventOrganizationDelete: BeforeDeleteHook = async ({ id, req }) => {
  const officials = await req.payload.find({
    collection: 'officials',
    where: { organization: { equals: id } },
    limit: 1,
    depth: 0,
  })

  if (officials.docs.length > 0) {
    throw new APIError(
      'Remove or reassign officials first.',
      400,
    )
  }
}
```

### Anti-Patterns to Avoid
- **Do NOT use `payload migrate:create` for the body->organization migration:** Payload's auto-generated migration cannot handle enum-to-FK conversion. It will try to ALTER ENUM which fails in a PostgreSQL transaction. Hand-author the full migration.
- **Do NOT update the frontend page before the migration runs:** The Contact Officials page reads `official.body` which will be gone after migration. Page and schema must update atomically in the same deployment.
- **Do NOT create organizations via Payload API in the migration:** The migration SQL runs at database level. Use raw SQL INSERT statements to create organization rows, then reference their IDs.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slug generation | Custom slug logic | Existing `slugField` + `formatSlugHook` (parameterized) | Already handles create vs update, deduplication via unique index |
| Cache busting | Custom revalidation | Existing `revalidateCollection` / `revalidateOnDelete` | Handles SSR safety, disableRevalidate context, method guards |
| Delete protection | Custom beforeDelete logic | Existing `preventReferencedDelete` pattern | Proven pattern with APIError, consistent UX |
| Reverse relationship display | Custom admin component | Payload's built-in `join` field type | Virtual field, no stored data, native admin UI integration |
| Data grouping for display | Client-side state management | Server-side grouping in the page component | RSC handles all data fetching, no client state needed |

## Common Pitfalls

### Pitfall 1: PostgreSQL Enum Transaction Error
**What goes wrong:** Running `payload migrate:create` after changing the Officials `body` field to a relationship generates a migration that tries to DROP the enum type and ALTER the column in the same transaction. PostgreSQL refuses because the enum type may still be referenced.
**Why it happens:** Payload's Drizzle-based migration generator doesn't handle enum-to-FK type conversions gracefully. The generated SQL wraps everything in a transaction, but PostgreSQL requires enum modifications to happen outside of transactions where the enum values are used.
**How to avoid:** Hand-author the entire migration. Use `payload migrate:create` to generate a skeleton, then replace the `up()` and `down()` functions with custom SQL that: (1) creates organizations table, (2) inserts org rows, (3) adds organization_id column, (4) populates via UPDATE...FROM mapping, (5) drops body column, (6) drops enum type.
**Warning signs:** Migration fails with "unsafe use of new value" or "cannot drop type that is still in use."

### Pitfall 2: Slug Field Generates Empty Slugs
**What goes wrong:** The `slugField` auto-generates slugs from `data?.title`, but Organizations use `name` as the primary text field. The slug will be empty/null on create because `data?.title` is undefined.
**Why it happens:** `formatSlugHook` in `src/hooks/formatSlug.ts` line 11 hardcodes `data?.title`.
**How to avoid:** Parameterize the slug field helper to accept a source field name, or modify the hook fallback chain to check `data?.name || data?.title`.
**Warning signs:** Organizations created with null slug, unique constraint violations on empty strings.

### Pitfall 3: Frontend Crash During Deployment
**What goes wrong:** If the Next.js server restarts with the new code before the migration runs, the Contact Officials page crashes because it tries to read `official.body` which no longer exists in the TypeScript types (but may still exist in the database) or vice versa.
**How to avoid:** Deploy migration and code atomically. In this project's Docker-based deployment, the migration runs at container startup before the server accepts traffic (Payload auto-runs pending migrations).
**Warning signs:** 500 errors on `/contact-officials` after deployment.

### Pitfall 4: Join Field Misconfiguration
**What goes wrong:** The `join` field on Organizations shows no officials or shows wrong officials.
**Why it happens:** The `on` property must exactly match the field name on the Officials collection that holds the relationship. If Officials has `{ name: 'organization', type: 'relationship', relationTo: 'organizations' }`, then the join field must use `on: 'organization'`.
**How to avoid:** Verify that the `on` value in the join field matches the relationship field name on Officials exactly.
**Warning signs:** Empty join field in admin panel, "Field not found" errors.

### Pitfall 5: Seed Script Ordering
**What goes wrong:** Seed script tries to create officials with an organization relationship before organizations exist, causing foreign key violations.
**Why it happens:** The seed script runs sequentially and the organization create must happen before official create/update.
**How to avoid:** Insert seed script organization creation block before the officials block. Use find-or-create by name for idempotency.
**Warning signs:** "violates foreign key constraint" errors during seeding.

### Pitfall 6: Migration Data Loss on Existing Officials
**What goes wrong:** Existing officials lose their body/organization association if the migration doesn't correctly map enum values to organization IDs.
**Why it happens:** The migration must INSERT organizations with known names, then UPDATE officials SET organization_id = orgs.id WHERE body = enum_value. If the mapping is wrong or incomplete, officials end up with NULL organization_id.
**How to avoid:** Use a deterministic mapping in the migration SQL. Verify all 3 existing body enum values have corresponding organization INSERTs. Add NOT NULL constraint to organization_id only after the UPDATE completes.
**Warning signs:** Officials with NULL organization after migration, constraint violation when adding NOT NULL.

## Code Examples

### Hand-Authored Migration SQL (Key Operations)

```typescript
// Source: Derived from existing migration patterns in src/migrations/
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Step 1: Create enum for organization level
  await db.execute(sql`
    CREATE TYPE "public"."enum_organizations_level" AS ENUM('county', 'state', 'national');
  `)

  // Step 2: Create organizations table
  await db.execute(sql`
    CREATE TABLE "organizations" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar NOT NULL,
      "level" "enum_organizations_level" NOT NULL,
      "slug" varchar,
      "website" varchar,
      "phone" varchar,
      "email" varchar,
      "address_street" varchar,
      "address_city" varchar,
      "address_state" varchar,
      "address_zip" varchar,
      "sort_order" numeric DEFAULT 0,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");
    CREATE INDEX "organizations_updated_at_idx" ON "organizations" USING btree ("updated_at");
    CREATE INDEX "organizations_created_at_idx" ON "organizations" USING btree ("created_at");
  `)

  // Step 3: Seed the 3 existing bodies as organizations
  await db.execute(sql`
    INSERT INTO "organizations" ("name", "level", "slug", "sort_order")
    VALUES
      ('Board of Education', 'county', 'board-of-education', 1),
      ('County Commission', 'county', 'county-commission', 2),
      ('Water Board', 'county', 'water-board', 3);
  `)

  // Step 4: Add organization_id FK column to officials
  await db.execute(sql`
    ALTER TABLE "officials" ADD COLUMN "organization_id" integer;
  `)

  // Step 5: Map existing body enum values to organization IDs
  await db.execute(sql`
    UPDATE "officials" o
    SET "organization_id" = org.id
    FROM "organizations" org
    WHERE (o."body"::text = 'board-of-education' AND org."slug" = 'board-of-education')
       OR (o."body"::text = 'county-commission' AND org."slug" = 'county-commission')
       OR (o."body"::text = 'water-board' AND org."slug" = 'water-board');
  `)

  // Step 6: Make organization_id NOT NULL and add FK constraint
  await db.execute(sql`
    ALTER TABLE "officials" ALTER COLUMN "organization_id" SET NOT NULL;
    ALTER TABLE "officials"
      ADD CONSTRAINT "officials_organization_id_organizations_id_fk"
      FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id")
      ON DELETE set null ON UPDATE no action;
    CREATE INDEX "officials_organization_idx" ON "officials" USING btree ("organization_id");
  `)

  // Step 7: Drop old body column and enum
  await db.execute(sql`
    ALTER TABLE "officials" DROP COLUMN "body";
    DROP TYPE "public"."enum_officials_body";
  `)

  // Step 8: Add organizations to payload_locked_documents_rels
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels"
      ADD COLUMN "organizations_id" integer;
    ALTER TABLE "payload_locked_documents_rels"
      ADD CONSTRAINT "payload_locked_documents_rels_organizations_fk"
      FOREIGN KEY ("organizations_id") REFERENCES "public"."organizations"("id")
      ON DELETE cascade ON UPDATE no action;
    CREATE INDEX "payload_locked_documents_rels_organizations_id_idx"
      ON "payload_locked_documents_rels" USING btree ("organizations_id");
  `)
}
```

**Note on NOT NULL + ON DELETE SET NULL conflict:** The migration above sets `organization_id` as NOT NULL but the FK uses `ON DELETE SET NULL`. This is the same pattern Payload uses for other required relationship fields (e.g., `homepage_hero_spotlight.story_id`). However, the `preventOrganizationDelete` beforeDelete hook prevents this conflict at the application level by blocking deletion of organizations with linked officials. If the hook is ever bypassed (e.g., direct SQL), the FK will set the column to NULL, violating the NOT NULL constraint. Alternative: use `ON DELETE RESTRICT` instead of `ON DELETE SET NULL` for defense in depth. The existing codebase uses `ON DELETE SET NULL` consistently, so following that pattern is acceptable as long as the hook is in place.

### Revalidation Hook Configuration for Organizations

```typescript
// Organizations changes should bust the Contact Officials page cache
// Source: Same pattern as Officials.ts line 7
hooks: {
  afterChange: [revalidateCollection(['/contact-officials'])],
  afterDelete: [revalidateOnDelete(['/contact-officials'])],
}
```

When an organization is edited (name change, contact info update), the Contact Officials page must revalidate because it displays organization names as section headers.

### JSON-LD Update for Contact Officials Page

```typescript
// Source: Adapted from existing governmentOrgJsonLd in src/lib/jsonLd.ts
// The existing helper already accepts bodyName + officials array
// No signature change needed -- just pass org.name instead of bodyLabels[key]
governmentOrgJsonLd(
  org.name,
  orgOfficials.map((o) => ({
    name: o.name,
    role: o.role,
    email: o.email || undefined,
    phone: o.phone || undefined,
  })),
)
```

The `governmentOrgJsonLd` helper does not need modification. The caller just changes from `bodyLabels[key]` to `org.name`.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hardcoded `body` select field with 3 enum values | Relationship field to Organizations collection | This phase | Editors can manage unlimited organizations, no code changes needed to add/remove bodies |
| Fixed `bodyLabels` and `bodyOrder` in page.tsx | Dynamic query of organizations with level-based grouping | This phase | Page is data-driven, not hardcoded |
| No reverse relationship visibility | Join field on Organizations showing linked officials | This phase (Payload 3.x feature) | Editors see at a glance which officials belong to each org |

## Open Questions

1. **NOT NULL + ON DELETE SET NULL tension on officials.organization_id**
   - What we know: The existing codebase uses ON DELETE SET NULL consistently for all FKs. The preventReferencedDelete hook blocks deletion of orgs with linked officials at the app level.
   - What's unclear: Whether to follow the existing ON DELETE SET NULL pattern (risk: direct SQL delete causes constraint violation) or use ON DELETE RESTRICT (defense in depth, but breaks the project's FK pattern).
   - Recommendation: Follow existing pattern (ON DELETE SET NULL) since the beforeDelete hook enforces the constraint. The migration script generated by `payload migrate:create` will use SET NULL, so matching that keeps things consistent. Document the constraint in the collection code as a comment.

2. **Migration atomicity with deployment**
   - What we know: Payload auto-runs pending migrations on startup. Docker deployments restart the container with new code + migration files together.
   - What's unclear: Whether there's a window where the old code reads from the new schema or vice versa during pod rollover in K8s.
   - Recommendation: Since this is a single-pod deployment (based on the self-hosted K8s setup), the container stops, rebuilds, and restarts atomically. No concerns for this deployment model.

3. **Address field storage: group vs flat columns**
   - What we know: D-01 specifies structured fields (street, city, state, zip). A Payload `group` type creates a nested object in the API response but flattened columns in PostgreSQL (e.g., `address_street`, `address_city`).
   - What's unclear: Whether to use a `group` field (cleaner API structure) or flat top-level fields (simpler queries).
   - Recommendation: Use `group` field. It creates the same flat columns in PostgreSQL but provides better admin UI organization and cleaner TypeScript types. The existing codebase doesn't have a group field example, but Payload's group type is well-documented and straightforward.

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Next.js + React + Tailwind CSS + Payload CMS 3.x (non-negotiable)
- **Database:** PostgreSQL (required)
- **Package manager:** pnpm (used throughout project)
- **Docker compose:** Required for local dev environment
- **Conventional Commits:** Required for all git commits
- **No new npm packages:** v2.0 roadmap decision -- all features use existing stack
- **Visual verification:** After UI changes, verify with Playwright MCP or screenshots
- **Payload 3.x patterns:** No Pages Router, no Prisma, no separate Express server, no Slate editor, no CSS-in-JS, no Redux/Zustand

## Sources

### Primary (HIGH confidence)
- `src/collections/Officials.ts` -- Current Officials collection with body enum field (the field being replaced)
- `src/collections/NewsPosts.ts` -- Relationship field pattern, hook configuration, slugField usage
- `src/collections/Pages.ts` -- Collection structure pattern with slugField, delete protection hooks
- `src/fields/slug.ts` -- Slug field helper implementation (line 11: hardcodes `data?.title`)
- `src/hooks/formatSlug.ts` -- Format slug hook (line 11: `const fallback = data?.title`)
- `src/hooks/revalidate.ts` -- Revalidation hook patterns (collection, global, delete variants)
- `src/hooks/preventReferencedDelete.ts` -- Delete protection hook pattern with APIError
- `src/app/(frontend)/contact-officials/page.tsx` -- Current page with hardcoded bodyLabels/bodyOrder
- `src/lib/jsonLd.ts` -- governmentOrgJsonLd helper (line 84-105, accepts bodyName + officials)
- `src/migrations/20260324_153917.ts` -- Initial migration showing enum_officials_body creation and table structure
- `src/seed.ts` -- Current seed with 9 BOE officials (lines 428-512) and find-or-create pattern
- `node_modules/payload/dist/fields/config/types.d.ts` -- JoinField type (line 1317): `collection`, `on`, `defaultSort`, `defaultLimit` properties verified
- `node_modules/payload/dist/fields/config/types.d.ts` -- SingleRelationshipField type (line 959): `relationTo: CollectionSlug` property verified
- `src/payload.config.ts` -- Collection registration array (line 45)

### Secondary (MEDIUM confidence)
- [Payload CMS Migrations Documentation](https://payloadcms.com/docs/database/migrations) -- migrate:create generates SQL, hand-authoring supported via MigrateUpArgs/MigrateDownArgs
- [Payload CMS Join Field Documentation](https://payloadcms.com/docs/fields/join) -- Join field is virtual, no stored data, surfaces related documents in admin UI
- [Payload CMS Relationship Field Documentation](https://payloadcms.com/docs/fields/relationship) -- relationTo, hasMany, filterOptions configuration
- [PostgreSQL Enum Migration Issue #15071](https://github.com/payloadcms/payload/issues/15071) -- Confirms enum transaction errors are a known Payload issue

### Tertiary (LOW confidence)
- None -- all findings verified against codebase source code or official Payload type definitions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages, all patterns exist in codebase
- Architecture: HIGH -- collection structure, hooks, and admin patterns directly derived from existing code
- Migration: HIGH -- PostgreSQL schema thoroughly analyzed, migration steps verified against existing migration files
- Pitfalls: HIGH -- all pitfalls identified from actual codebase analysis (slug field hardcoded title, enum transaction errors documented in Payload issues)

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable -- Payload 3.x patterns well-established in this codebase)
