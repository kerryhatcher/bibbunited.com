# Phase 9: Foundation & Config - Research

**Researched:** 2026-03-24
**Domain:** Seed data overhaul, Payload CMS schema migration, Next.js header configuration, sharp image generation
**Confidence:** HIGH

## Summary

Phase 9 is a foundation-laying phase that makes no frontend changes but fixes all the backend data and config prerequisites that downstream phases (10-12) depend on. The work breaks into four independent workstreams: (1) overhauling the seed script to generate colorful labeled images, populate Navigation/Homepage globals, and seed Officials/Meetings data; (2) adding a `displayName` field to Users and running a Payload DB migration; (3) generating a branded OG default image and uploading it as a Payload media item; (4) configuring `next.config.ts` for cache headers and X-Powered-By suppression.

All required libraries (`sharp`, `payload`, `next`) are already installed. No new dependencies are needed. The existing seed script provides a solid foundation with established patterns (find-or-create idempotency, `makeRichText()` helper, `overrideAccess: true`). The migration system is already in use with one existing migration file.

**Primary recommendation:** Execute the four workstreams in dependency order -- Users migration first (needed by seed), then seed script overhaul (creates media + globals data), then OG image generation (uses same sharp patterns), then Next.js config changes (independent).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Generate 5-6 visually distinct seed images using sharp with different bright colors (red, blue, green, gold, etc.) and overlay text labels like "Budget", "Safety", "Schools". Images must contrast against the dark `bg-bg-secondary` (#1B2A4A) card backgrounds.
- **D-02:** Populate the Navigation global with menu items matching the site structure: News, About, Get Involved, Contact Officials, Meetings. Consider a "Take Action" dropdown grouping civic pages.
- **D-03:** Assign seeded news posts to the Homepage global's `heroSpotlight` array so the hero section renders content instead of an empty dark rectangle.
- **D-04:** Seed 3-4 sample Officials and 2-3 upcoming Meetings so those civic pages aren't empty in dev/test environments.
- **D-05:** All seed images must have descriptive, context-specific alt text (not generic "test image" text). Satisfies A11Y-05.
- **D-06:** Seed the Homepage global's `topicCallouts` array with relevant civic topic cards.
- **D-07:** Create a branded 1200x630 OG default image with "BIBB UNITED" text, tagline "Civic Advocacy for BIBB County", navy background, white text, and gold accent bar. Generated via sharp with SVG overlay.
- **D-08:** Upload the OG image as a Payload media item (not static `public/` file) so editors can swap it via admin panel without a code deploy. Seed script handles the initial upload.
- **D-09:** Configure headers in `next.config.ts` -- set `poweredByHeader: false` to suppress X-Powered-By (INFRA-02) and add `headers()` config for long-lived cache on media paths: `Cache-Control: public, max-age=31536000, immutable` (INFRA-01).
- **D-10:** Single source of truth in Next.js config -- no Traefik-level header changes needed.
- **D-11:** Add `displayName` text field to Users collection as optional (not required). Frontend code in Phase 11 will fall back to "BIBB United Staff" when displayName is empty.
- **D-12:** Run Payload DB migration to add the column to PostgreSQL.
- **D-13:** Seed script sets the seed user's displayName to "BIBB United Staff".

### Claude's Discretion
- Navigation menu structure details (exact dropdown groupings, ordering) -- Claude picks a sensible structure based on seeded pages
- Exact bright colors and text labels for seed images -- Claude chooses visually distinct combinations
- SVG layout details for the OG image -- Claude implements the brand-forward design described above
- Cache header path patterns -- Claude determines which routes get long-lived cache headers

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIS-02 | Navigation menu is populated with all site sections in both desktop and mobile views | D-02: Seed script populates Navigation global with items array matching site structure |
| VIS-03 | Hero spotlight displays featured news content on homepage instead of empty dark rectangle | D-03: Seed script assigns news posts to Homepage global's heroSpotlight array |
| VIS-04 | Seed images are visually distinct and high-contrast against card backgrounds | D-01: Sharp generates colored images with SVG text overlays in bright colors |
| A11Y-05 | All seed images have descriptive, context-specific alt text | D-05: Each seed image gets unique, descriptive alt text matching its topic label |
| INFRA-01 | Media files served with long-lived cache headers | D-09: Next.js headers() config adds Cache-Control to /media/ and /api/media/ paths |
| INFRA-02 | X-Powered-By response header is not exposed in production | D-09: poweredByHeader: false in next.config.ts |
| SEO-09 | Default branded 1200x630 OG image exists for pages without custom images | D-07/D-08: Sharp generates OG image, seed script uploads as Payload media item |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x -- non-negotiable
- **Database**: PostgreSQL with @payloadcms/db-postgres
- **Testing**: All UI verification must use Playwright MCP or Chrome DevTools MCP -- no manual tasks
- **Commits**: Conventional Commits format required
- **GSD Workflow**: Use GSD commands for all file changes
- **Context7**: Always use context7 MCP for library documentation lookups

## Architecture Patterns

### Existing Seed Script Pattern (REUSE)
The current `src/seed.ts` establishes patterns that MUST be followed:

1. **Find-or-create idempotency**: Check existence before creating (prevents duplicates on re-run)
2. **overrideAccess: true**: All seed operations bypass access control
3. **Payload Local API**: Use `payload.create()`, `payload.find()`, `payload.updateGlobal()` -- no raw SQL
4. **Sharp for image generation**: Already used for the single seed image -- extend for multiple
5. **makeRichText() helper**: Creates Lexical-compatible rich text nodes -- reuse for new content

### Navigation Global Schema
The Navigation global (`src/globals/Navigation.ts`) supports:
- `items` array (max 8 rows) with `label`, `type` (internal/external), `page` (relationship), `url`, `newTab`
- `children` sub-array (max 6 rows) for dropdown items with same field structure
- Links use the shared `linkFields()` helper from `src/fields/link.ts`
- Relationships support `pages` and `news-posts` collections

### Homepage Global Schema
The Homepage global (`src/globals/Homepage.ts`) has:
- `heroSpotlight`: array of `{ story: relationship to news-posts }` (min 1, max 5)
- `topicCallouts`: array of `{ title, blurb, icon (Lucide name), link (relationship to pages) }` (min 1, max 4)

### Payload Migration Pattern
Existing migration at `src/migrations/20260324_153917.ts` shows:
- Import `{ MigrateUpArgs, MigrateDownArgs, sql }` from `@payloadcms/db-postgres`
- Export `up()` and `down()` functions with raw SQL via template literals
- Migration index at `src/migrations/index.ts` registers all migrations
- Generate via: `pnpm payload migrate:create` (creates timestamped files)
- Apply via: `pnpm payload migrate` (runs pending migrations)

### Recommended Execution Structure
```
src/
├── seed.ts                    # Overhauled seed script (all seed logic)
├── collections/
│   └── Users.ts               # Add displayName field
├── migrations/
│   ├── index.ts               # Updated to include new migration
│   └── 20260324_XXXXXX.ts     # New migration: ALTER TABLE users ADD display_name
└── payload.config.ts          # No changes needed (Users already registered)

next.config.ts                 # Add poweredByHeader + headers()
```

### Anti-Patterns to Avoid
- **Do NOT create separate seed files per entity**: Keep all seed logic in one `src/seed.ts` for simplicity -- this is a small project
- **Do NOT use raw SQL for seed data**: Use Payload's Local API exclusively for data operations
- **Do NOT put the OG image in public/**: D-08 explicitly requires it as a Payload media item (note: existing `public/og-default.png` should be removed or ignored)
- **Do NOT make displayName required**: D-11 says optional -- Phase 11 handles the fallback in frontend

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image generation with text | Canvas/Puppeteer screenshot | sharp + SVG composite | sharp is already a dependency, SVG overlay is lightweight and serverless-friendly |
| Database schema migration | Raw ALTER TABLE scripts | `pnpm payload migrate:create` | Payload generates migration files that work with its Drizzle ORM internals |
| Rich text content structure | Custom JSON | `makeRichText()` helper | Already exists in seed.ts, produces correct Lexical AST format |
| Navigation data structure | Hardcoded JSON inserts | `payload.updateGlobal('navigation', ...)` | Respects schema validation and relationship resolution |

## Common Pitfalls

### Pitfall 1: Sharp SVG Text Rendering Without Fonts
**What goes wrong:** SVG text rendered by sharp uses system fonts. If the build environment lacks the expected font, text renders in a fallback font that looks wrong.
**Why it happens:** sharp uses librsvg which depends on system fontconfig.
**How to avoid:** Use simple sans-serif font family in SVG (e.g., `font-family="Arial, Helvetica, sans-serif"`). These are universally available. Do NOT specify custom web fonts.
**Warning signs:** Text appears as squares or in wrong font on CI/Docker.

### Pitfall 2: Navigation Relationship IDs vs Slugs
**What goes wrong:** Trying to set navigation items with page slugs instead of numeric IDs.
**Why it happens:** The link field `page` is a relationship field that expects the document ID (integer), not the slug string.
**How to avoid:** First create/find pages, store their IDs, then use those IDs when populating the Navigation global.
**Warning signs:** Payload validation errors on global update.

### Pitfall 3: Homepage heroSpotlight Requires Published Posts
**What goes wrong:** Adding news posts to heroSpotlight that have `_status: 'draft'` -- they exist in the array but the frontend query may filter them out.
**Why it happens:** Payload's draft/published system filters by status on public queries.
**How to avoid:** Ensure all news posts assigned to heroSpotlight have `_status: 'published'` (the existing seed script already does this).
**Warning signs:** Hero section appears empty despite data being in the global.

### Pitfall 4: Cache-Control on Next.js Managed Paths
**What goes wrong:** Setting Cache-Control on `/_next/static/*` paths -- Next.js already sets `public, max-age=31536000, immutable` on these and your custom header is ignored.
**Why it happens:** Next.js documentation explicitly states immutable assets cannot have their Cache-Control overridden.
**How to avoid:** Only set custom Cache-Control on media paths (`/media/:path*` and `/api/media/:path*`). Let Next.js handle its own static asset caching.
**Warning signs:** Headers not appearing in response despite being configured.

### Pitfall 5: Migration File Not Registered
**What goes wrong:** Creating a migration file but forgetting to add it to `src/migrations/index.ts`.
**Why it happens:** `payload migrate:create` generates the file and updates index.ts automatically, but manual migration creation does not.
**How to avoid:** Always use `pnpm payload migrate:create` to generate migrations. If the DB is not available, manually create the file AND update index.ts.
**Warning signs:** `pnpm payload migrate` reports "no pending migrations."

### Pitfall 6: Seed Script Order of Operations
**What goes wrong:** Trying to populate Homepage global's heroSpotlight before news posts exist, or topicCallouts before pages exist.
**Why it happens:** Relationship fields need the referenced documents to exist first.
**How to avoid:** Execute seed in dependency order: (1) User, (2) Media items, (3) Pages, (4) News Posts, (5) Officials, (6) Meetings, (7) Navigation global (needs page IDs), (8) Homepage global (needs news post IDs and page IDs).
**Warning signs:** Foreign key constraint errors or null reference IDs.

## Code Examples

### Sharp SVG Text Overlay for Seed Images
```typescript
// Source: sharp docs (sharp.pixelplumbing.com/api-composite) + verified with installed sharp 0.34.5
const { default: sharp } = await import('sharp')

const width = 1200
const height = 630
const label = 'Budget'
const bgColor = { r: 220, g: 50, b: 50 } // bright red

const svgOverlay = Buffer.from(`
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="50%" font-family="Arial, Helvetica, sans-serif"
          font-size="72" font-weight="bold" fill="white"
          text-anchor="middle" dominant-baseline="central">
      ${label}
    </text>
  </svg>
`)

const imageBuffer = await sharp({
  create: {
    width,
    height,
    channels: 3,
    background: bgColor,
  },
})
  .composite([{ input: svgOverlay, top: 0, left: 0 }])
  .jpeg({ quality: 85 })
  .toBuffer()
```

### OG Image with SVG Overlay (Navy + Gold Accent)
```typescript
// Source: D-07 decision + sharp composite API
const ogWidth = 1200
const ogHeight = 630

const ogSvg = Buffer.from(`
  <svg width="${ogWidth}" height="${ogHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="${ogHeight - 8}" width="${ogWidth}" height="8" fill="#D4A843"/>
    <text x="50%" y="40%" font-family="Arial, Helvetica, sans-serif"
          font-size="64" font-weight="bold" fill="white"
          text-anchor="middle" dominant-baseline="central">
      BIBB UNITED
    </text>
    <text x="50%" y="58%" font-family="Arial, Helvetica, sans-serif"
          font-size="28" fill="#CCCCCC"
          text-anchor="middle" dominant-baseline="central">
      Civic Advocacy for BIBB County
    </text>
  </svg>
`)

const ogBuffer = await sharp({
  create: {
    width: ogWidth,
    height: ogHeight,
    channels: 3,
    background: { r: 27, g: 42, b: 74 }, // navy matching site brand
  },
})
  .composite([{ input: ogSvg, top: 0, left: 0 }])
  .png() // PNG for OG images (lossless text rendering)
  .toBuffer()
```

### Updating Navigation Global via Payload Local API
```typescript
// Source: Payload CMS docs + existing Navigation.ts schema
// Pages must be created first to get their IDs
const aboutPage = await payload.find({
  collection: 'pages',
  where: { title: { equals: 'About' } },
  limit: 1,
  overrideAccess: true,
})

await payload.updateGlobal({
  slug: 'navigation',
  data: {
    items: [
      {
        label: 'News',
        type: 'external',
        url: '/news',
      },
      {
        label: 'About',
        type: 'internal',
        page: aboutPage.docs[0].id,  // numeric ID, not slug
      },
      {
        label: 'Take Action',
        type: 'external',
        url: '#',
        children: [
          {
            label: 'Contact Officials',
            type: 'external',
            url: '/officials',
          },
          {
            label: 'Meetings',
            type: 'external',
            url: '/meetings',
          },
        ],
      },
    ],
  },
  overrideAccess: true,
})
```

### Updating Homepage Global
```typescript
// Source: Homepage.ts schema
const newsPosts = await payload.find({
  collection: 'news-posts',
  limit: 3,
  sort: '-publishDate',
  overrideAccess: true,
})

const aboutPage = /* ... find about page ... */
const getInvolvedPage = /* ... find get-involved page ... */

await payload.updateGlobal({
  slug: 'homepage',
  data: {
    heroSpotlight: newsPosts.docs.map((post) => ({ story: post.id })),
    topicCallouts: [
      {
        title: 'School Budget',
        blurb: 'Track how $180M is allocated across BIBB County schools',
        icon: 'dollar-sign',
        link: aboutPage.id,
      },
      // ... more callouts
    ],
  },
  overrideAccess: true,
})
```

### Adding displayName to Users Collection
```typescript
// Source: Payload collection config docs
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'displayName',
      type: 'text',
      label: 'Display Name',
      admin: {
        description: 'Public name shown on article bylines. Falls back to "BIBB United Staff" if empty.',
      },
    },
  ],
}
```

### Next.js Config with Headers
```typescript
// Source: nextjs.org/docs/app/api-reference/config/next-config-js/headers
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,  // INFRA-02: suppress X-Powered-By
  async headers() {
    return [
      {
        // Payload media files served from /media/ path
        source: '/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Payload API media endpoint
        source: '/api/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // ... existing webpack and turbopack config
}
```

### Payload Migration for displayName
```typescript
// Generated via: pnpm payload migrate:create
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN "display_name" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "users" DROP COLUMN IF EXISTS "display_name";
  `)
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Single dark seed image | Multiple bright colored images with text labels | This phase | Cards no longer blend into dark backgrounds |
| Empty Navigation global | Populated with site structure | This phase | Navigation renders immediately after seed |
| Empty Homepage global | heroSpotlight + topicCallouts populated | This phase | Homepage shows content instead of empty sections |
| Admin email in bylines | displayName field on Users | This phase (schema) + Phase 11 (frontend) | Professional article attribution |
| No OG image | Branded 1200x630 OG image as Payload media | This phase | Social media shares show branded preview |
| Default Next.js headers | Custom cache + security headers | This phase | Better performance + security hardening |

## Open Questions

1. **Navigation link type for collection listing pages (News, Officials, Meetings)**
   - What we know: These are not "pages" collection documents -- they are Next.js routes at `/news`, `/officials`, `/meetings`
   - What's unclear: The Navigation link field supports `internal` (relationship to pages/news-posts) or `external` (URL string). Collection listing pages aren't individual documents.
   - Recommendation: Use `type: 'external'` with URL strings like `/news`, `/officials`, `/meetings` for collection listing routes. Only use `type: 'internal'` for actual page documents (About, Get Involved, Resources).

2. **Existing `public/og-default.png` (26KB)**
   - What we know: A file already exists at `public/og-default.png` from a previous phase
   - What's unclear: Whether any existing code references this path
   - Recommendation: D-08 says upload as Payload media instead. The seed script should create the OG image as a media item. The old `public/og-default.png` can be removed or left as a fallback -- check if any metadata code references it before deleting.

3. **Media path for cache headers**
   - What we know: Media `staticDir` is `../../media` relative to `src/collections/` (i.e., project root `/media/`). Payload serves media files at `/api/media/file/` and also potentially at `/media/` depending on configuration.
   - Recommendation: Add cache headers for both `/media/:path*` and `/api/media/:path*` to cover all serving paths. Verify actual serving path by checking the URL in existing media records.

## Sources

### Primary (HIGH confidence)
- sharp 0.34.5 installed locally -- composite API verified
- Next.js official docs (nextjs.org/docs/app/api-reference/config/next-config-js/headers) -- headers() syntax and Cache-Control behavior
- Next.js official docs (nextjs.org/docs/app/api-reference/config/next-config-js/poweredByHeader) -- poweredByHeader: false
- Payload CMS docs (payloadcms.com/docs/database/migrations) -- migrate:create workflow
- Existing codebase: `src/seed.ts`, `src/collections/Users.ts`, `src/globals/Navigation.ts`, `src/globals/Homepage.ts`, `src/migrations/20260324_153917.ts`, `next.config.ts`

### Secondary (MEDIUM confidence)
- sharp SVG composite approach (sharp.pixelplumbing.com/api-composite + github.com/lovell/sharp/issues/1120) -- SVG text overlay pattern widely used

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed, versions verified in package.json
- Architecture: HIGH -- all patterns derived from existing codebase (seed.ts, migration files, collection configs)
- Pitfalls: HIGH -- derived from schema analysis and Next.js official docs on Cache-Control limitations
- Code examples: MEDIUM -- sharp SVG composite pattern is well-documented but font rendering can vary by environment

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- no moving targets in this phase)
