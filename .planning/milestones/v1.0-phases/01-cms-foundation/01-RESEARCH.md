# Phase 1: CMS Foundation - Research

**Researched:** 2026-03-24
**Domain:** Payload CMS 3.x collections, globals, Lexical rich text editor, PostgreSQL
**Confidence:** HIGH

## Summary

Phase 1 scaffolds a Payload CMS 3.x project inside Next.js, defines content collections (Pages, News Posts, Media), a Global (Urgent Banner), and configures the Lexical rich text editor with pull quotes, inline images, tables, embeds, and horizontal rules. The project uses `create-payload-app` with the blank template, PostgreSQL via `@payloadcms/db-postgres`, and pnpm as the package manager.

Payload 3.x runs inside the Next.js process -- there is no separate CMS server. Collections and Globals are defined in TypeScript config files and auto-generate admin UI, REST/GraphQL APIs, and TypeScript types. The Lexical editor supports custom blocks via `BlocksFeature`, which is how pull quotes and callout boxes will be implemented. Drafts are built-in via the `versions.drafts` config option on collections. CTA blocks are implemented as dedicated fields on Page and News Post collections per user decision D-11.

**Primary recommendation:** Use `create-payload-app@latest` with the blank template and PostgreSQL adapter, then define collections/globals incrementally. Use `BlocksFeature` for pull quote blocks in the Lexical editor. Enable `versions.drafts` on Pages and News Posts for draft/publish workflow.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Draft/publish workflow enabled -- editors save drafts, preview, then explicitly publish. Use Payload's built-in draft/versions support.
- **D-02:** URL slugs auto-generated from title with manual override capability.
- **D-03:** News posts track author (selected from CMS users) for credibility on civic content.
- **D-04:** Pages use a flat hierarchy -- no parent/child nesting. Navigation (Phase 3) provides the organizational structure.
- **D-05:** Lexical editor configured with pull quotes / callout boxes for emphasizing key statements.
- **D-06:** Inline images with captions and alt text within article body.
- **D-07:** Embedded content support (YouTube videos, iframes) for board meeting recordings and external media.
- **D-08:** Table support for structured data (budget line items, vote tallies, comparisons).
- **D-09:** Horizontal rule / section dividers for breaking long-form explainers into visual sections.
- **D-10:** Standard formatting: bold, italic, headings, links, ordered/unordered lists.
- **D-11:** Call-to-action implemented as dedicated fields on the Page and News Post collections (not as a Lexical inline block). CTA text + link fields at the collection level ensure consistent placement and editors never forget to add one.
- **D-12:** Site-wide urgent banner implemented as a Payload Global with simple on/off toggle, message text field, and optional link. No severity levels -- one style, just active or inactive.
- **D-13:** Project initialized via `create-payload-app` (official Payload scaffolding). Clean up any Tailwind v3 config or unnecessary boilerplate after generation.
- **D-14:** Package manager: pnpm.
- **D-15:** Node.js target: 22 LTS (pin in `.nvmrc` and Dockerfile).

### Claude's Discretion
- Media collection configuration (image sizes, formats, upload constraints)
- Database migration strategy and seed data approach
- ESLint/Prettier configuration details
- File/directory organization within the scaffolded project

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONT-01 | User can create and edit rich text pages with headings, images, pull quotes, and embedded content | Lexical editor with HeadingFeature, UploadFeature, BlocksFeature (pull quote block), BlockquoteFeature, HorizontalRuleFeature; Pages collection with richText field |
| CONT-02 | User can create and edit news posts with title, body, publish date, and featured image | News Posts collection with title, richText body, date field, upload relationship to Media collection |
| CONT-03 | Each page and news post has a configurable call-to-action block (CTA text + link) | CTA group field (text + link) added as dedicated fields on Pages and News Posts collections per D-11 |
| CONT-04 | Editor can activate a site-wide urgent banner with custom message and optional link | UrgentBanner Global with active toggle, message text, optional link fields per D-12 |
| CONT-05 | Non-technical editors can publish and manage all content via Payload CMS admin UI | Payload auto-generates admin UI from collection/global configs; versions.drafts enables publish workflow |
| DEPLOY-04 | PostgreSQL connection configured for cluster database | @payloadcms/db-postgres adapter with DATABASE_URI env var; Drizzle ORM handles schema sync |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- Always use `uv` to manage and run python environments and tasks (not applicable to this phase -- Node.js project)
- Never use system python (not applicable)
- Always use Context7 MCP to look up latest documentation on languages/libraries
- Always use Conventional Commits for commit messages and pull requests
- Tech stack: Next.js + React + Tailwind CSS + Payload CMS 3.x -- non-negotiable
- Database: PostgreSQL -- non-negotiable
- Do NOT use: Payload 2.x, Pages Router, Prisma, Redux/Zustand, Slate editor, Express/Fastify standalone, MongoDB, CSS-in-JS, Moment.js, GraphQL client

## Standard Stack

### Core (Phase 1 scope)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| payload | 3.80.0 | CMS framework | Latest stable. Runs inside Next.js, auto-generates admin UI and APIs |
| @payloadcms/db-postgres | 3.80.0 | PostgreSQL adapter | Uses Drizzle ORM internally. Handles migrations via `payload migrate` |
| @payloadcms/richtext-lexical | 3.80.0 | Rich text editor | Default Payload 3.x editor. Supports custom blocks, inline images, tables |
| @payloadcms/storage-local | 3.80.0 | Local file storage | Stores uploads to disk. Maps to K8s PersistentVolume in production |
| @payloadcms/plugin-seo | 3.80.0 | SEO metadata fields | Auto-adds title/description/og:image to collections. Installed now, configured in Phase 4 |
| next | 16.2.1 | Full-stack React framework | Payload 3.x requires Next.js App Router |
| react | 19.x | UI rendering | Ships with Next.js 15+ |
| typescript | 5.x | Type safety | Payload auto-generates types from collection configs |
| sharp | 0.34.5 | Image processing | Required by Next.js `next/image` and Payload upload resizing |

### Supporting (Phase 1 scope)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwindcss | 4.2.2 | Utility CSS | User-specified. Installed during scaffolding, used in Phase 2+ |
| @tailwindcss/typography | 0.5.19 | Prose styling | For CMS rich text content rendering in Phase 3 |
| eslint | 9.x (10.1.0 latest) | Linting | Code quality. Scaffolding generates eslint.config.mjs |
| prettier | 3.8.1 | Code formatting | Consistent style |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| BlocksFeature for pull quotes | Custom Lexical node | BlocksFeature is officially supported; custom nodes require deep Lexical internals knowledge |
| Collection-level CTA fields | Lexical inline block CTA | User decided D-11: collection-level fields ensure editors never miss adding a CTA |
| Global for urgent banner | Collection with single doc | Global is semantically correct -- exactly one document, simpler API |

**Installation:**
```bash
# Scaffold project (interactive -- selects blank template, PostgreSQL, pnpm)
pnpx create-payload-app@latest

# Additional packages after scaffolding
pnpm add @payloadcms/storage-local @payloadcms/plugin-seo sharp
```

**Version verification:** All versions checked against npm registry on 2026-03-24. Payload ecosystem packages are at 3.80.0 (monorepo, all packages share version). Next.js is at 16.2.1. Note: `create-payload-app` will install compatible versions automatically.

## Architecture Patterns

### Recommended Project Structure
```
src/
  app/
    (payload)/          # Auto-generated Payload admin routes (DO NOT EDIT)
      admin/
        [[...segments]]/
          page.tsx
      api/
        [...slug]/
          route.ts
    (frontend)/         # Future frontend routes (Phase 3)
      layout.tsx
      page.tsx
  collections/
    Pages.ts            # Pages collection config
    NewsPosts.ts        # News posts collection config
    Media.ts            # Media/uploads collection config
    Users.ts            # CMS users (auto-generated by scaffolding)
  globals/
    UrgentBanner.ts     # Site-wide banner global config
  blocks/
    PullQuote.ts        # Pull quote block for Lexical editor
    Callout.ts          # Callout box block for Lexical editor
  fields/
    slug.ts             # Reusable slug field with auto-generation hook
    cta.ts              # Reusable CTA field group
  hooks/
    formatSlug.ts       # beforeChange hook for slug generation
  payload.config.ts     # Main Payload configuration
  payload-types.ts      # Auto-generated TypeScript types (DO NOT EDIT)
```

### Pattern 1: Collection with Drafts and Versions
**What:** Enable draft/publish workflow on content collections
**When to use:** Pages and News Posts (per D-01)
**Example:**
```typescript
// Source: payloadcms.com/docs/versions/drafts
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 1500,
      },
      schedulePublish: true,
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    // ... fields
  ],
}
```

### Pattern 2: Lexical Editor with Custom Features
**What:** Configure Lexical with all required editor features including custom blocks
**When to use:** richText fields on Pages and News Posts
**Example:**
```typescript
// Source: payloadcms.com/docs/rich-text/overview, /official-features
import {
  lexicalEditor,
  BlocksFeature,
  HeadingFeature,
  UploadFeature,
  HorizontalRuleFeature,
  BlockquoteFeature,
  LinkFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
} from '@payloadcms/richtext-lexical'
import { PullQuote } from '../blocks/PullQuote'
import { Callout } from '../blocks/Callout'

export const richTextEditor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures,
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    UploadFeature({
      collections: {
        media: {
          fields: [
            { name: 'caption', type: 'text' },
          ],
        },
      },
    }),
    BlocksFeature({
      blocks: [PullQuote, Callout],
    }),
    HorizontalRuleFeature(),
    EXPERIMENTAL_TableFeature(),
    FixedToolbarFeature(),
  ],
})
```

### Pattern 3: Reusable Slug Field with Auto-generation
**What:** Auto-generate URL slugs from title with manual override
**When to use:** Pages and News Posts (per D-02)
**Example:**
```typescript
// Source: common Payload pattern from official examples
import type { FieldHook, Field } from 'payload'

const formatSlug = (val: string): string =>
  val
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()

const formatSlugHook: FieldHook = ({ data, operation, value }) => {
  if (operation === 'create' || !value) {
    const fallback = data?.title
    if (fallback && typeof fallback === 'string') {
      return formatSlug(fallback)
    }
  }
  return value
}

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  unique: true,
  admin: {
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [formatSlugHook],
  },
}
```

### Pattern 4: Payload Global for Urgent Banner
**What:** Single-document global for site-wide configuration
**When to use:** Urgent Banner (per D-12)
**Example:**
```typescript
// Source: payloadcms.com/docs/configuration/globals
import type { GlobalConfig } from 'payload'

export const UrgentBanner: GlobalConfig = {
  slug: 'urgent-banner',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Banner',
    },
    {
      name: 'message',
      type: 'text',
      required: true,
      admin: {
        condition: (data) => data?.active,
      },
    },
    {
      name: 'link',
      type: 'text',
      admin: {
        condition: (data) => data?.active,
        description: 'Optional URL for the banner action',
      },
    },
  ],
}
```

### Pattern 5: CTA Fields as Collection-Level Group
**What:** Dedicated CTA fields at collection level (not Lexical block)
**When to use:** Pages and News Posts (per D-11)
**Example:**
```typescript
// Reusable CTA field group
import type { Field } from 'payload'

export const ctaFields: Field = {
  name: 'cta',
  type: 'group',
  label: 'Call to Action',
  admin: {
    description: 'Add a call-to-action button to this content',
  },
  fields: [
    {
      name: 'text',
      type: 'text',
      label: 'Button Text',
    },
    {
      name: 'link',
      type: 'text',
      label: 'Button URL',
    },
  ],
}
```

### Pattern 6: Pull Quote Block for Lexical
**What:** Custom block for pull quotes / callout boxes in the editor
**When to use:** Rich text content (per D-05)
**Example:**
```typescript
// Source: payloadcms.com/docs/fields/blocks + BlocksFeature
import type { Block } from 'payload'

export const PullQuote: Block = {
  slug: 'pullQuote',
  labels: {
    singular: 'Pull Quote',
    plural: 'Pull Quotes',
  },
  fields: [
    {
      name: 'quote',
      type: 'text',
      required: true,
    },
    {
      name: 'attribution',
      type: 'text',
    },
  ],
}
```

### Anti-Patterns to Avoid
- **Using Payload 2.x patterns:** Payload 3.x is fundamentally different (runs inside Next.js, not Express). Do not follow any tutorial that imports from `payload/dist/` or uses `express()`.
- **Adding Prisma alongside Drizzle:** Payload 3.x uses Drizzle internally. Two ORMs on one database causes migration conflicts.
- **Mixing push and migrate on the same database:** Use `push` for development, `migrate` for production. Never mix them on the same database instance.
- **Editing auto-generated files:** `payload-types.ts` and `(payload)/` admin routes are auto-generated. Manual edits will be overwritten.
- **Using Pages Router:** Payload 3.x requires App Router exclusively. Do not create a `pages/` directory.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Rich text editing | Custom editor | `@payloadcms/richtext-lexical` with features | Lexical handles selection, undo/redo, serialization, keyboard shortcuts -- hundreds of edge cases |
| Image resizing/cropping | Sharp pipeline | Payload's `upload.imageSizes` config | Automatic thumbnail/variant generation with admin crop UI |
| Draft/publish workflow | Custom status field + logic | `versions.drafts: true` | Built-in _status field, API filtering, admin UI publish button, autosave |
| Admin UI for content editing | Custom React forms | Payload auto-generated admin | Complete CRUD interface with field validation, relationships, list views |
| Database schema/migrations | Raw SQL | `payload migrate` CLI | Drizzle generates migrations from your config changes automatically |
| Slug generation | Custom middleware | Payload field hook (`beforeValidate`) | Hook runs at the right lifecycle point, handles create vs update correctly |
| User authentication for CMS | Custom auth | Payload built-in Users collection | Session management, password hashing, access control already implemented |

**Key insight:** Payload CMS auto-generates an admin panel, REST API, GraphQL API, and TypeScript types from your collection/global configs. The entire Phase 1 is configuration, not application code.

## Common Pitfalls

### Pitfall 1: Tailwind v3 Config from Scaffolding
**What goes wrong:** `create-payload-app` may generate `tailwind.config.js` (v3 style) instead of v4 CSS-first config
**Why it happens:** Payload templates may not have updated to Tailwind v4 yet
**How to avoid:** After scaffolding, check for `tailwind.config.js` or `tailwind.config.ts`. If present, remove it and migrate to Tailwind v4 CSS-first config using `@theme` in CSS. Or defer Tailwind config to Phase 2 since Phase 1 is admin-panel only.
**Warning signs:** Existence of `tailwind.config.js` or `tailwind.config.ts` in project root

### Pitfall 2: Forgetting to Run Migrations Before Deploy
**What goes wrong:** App crashes in production because database schema doesn't match Payload config
**Why it happens:** Development uses `push` mode (auto-sync). Production requires explicit migrations.
**How to avoid:** Always run `pnpm payload migrate:create` before deploying and `pnpm payload migrate` in CI/deploy pipeline. Add to deploy checklist.
**Warning signs:** "relation does not exist" PostgreSQL errors

### Pitfall 3: EXPERIMENTAL_TableFeature Breaking Changes
**What goes wrong:** Table feature API changes without a major version bump
**Why it happens:** The feature is explicitly marked EXPERIMENTAL in Payload's source
**How to avoid:** Pin Payload version in package.json. Test table functionality after any Payload upgrade. Accept the risk since D-08 requires tables.
**Warning signs:** "EXPERIMENTAL" prefix in the import name

### Pitfall 4: Missing sharp in Production Docker Image
**What goes wrong:** Image uploads fail or next/image optimization errors in production
**Why it happens:** sharp has native dependencies that may not be available in slim Docker images
**How to avoid:** Explicitly install sharp in package.json (don't rely on peer dep resolution). Use `--platform=linux/amd64` in Docker build if needed. Verify with `node -e "require('sharp')"` in the container.
**Warning signs:** "Could not load the 'sharp' module" errors

### Pitfall 5: Embedded Content (iframes) Security
**What goes wrong:** XSS vulnerabilities from unfiltered iframe embeds
**Why it happens:** D-07 requires embedded content support (YouTube, iframes)
**How to avoid:** Use Lexical's built-in embed handling or implement allowlisted domains for iframe sources. Do NOT allow arbitrary iframe URLs.
**Warning signs:** Users pasting arbitrary HTML into the editor

### Pitfall 6: Slug Uniqueness Across Collections
**What goes wrong:** A Page and a News Post with the same slug cause routing conflicts in Phase 3
**Why it happens:** Slug uniqueness is per-collection, not cross-collection
**How to avoid:** Use different URL prefixes per collection type in Phase 3 routing (e.g., `/news/:slug` vs `/:slug`). The slug field itself should be `unique: true` within its collection.
**Warning signs:** Two documents with identical slugs in different collections

## Code Examples

### Complete payload.config.ts Structure
```typescript
// Source: payloadcms.com/docs/configuration/overview
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { localStorageAdapter } from '@payloadcms/storage-local'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

import { Pages } from './collections/Pages'
import { NewsPosts } from './collections/NewsPosts'
import { Media } from './collections/Media'
import { Users } from './collections/Users'
import { UrgentBanner } from './globals/UrgentBanner'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Pages, NewsPosts, Media, Users],
  globals: [UrgentBanner],
  editor: lexicalEditor({}),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  plugins: [
    seoPlugin({
      collections: ['pages', 'news-posts'],
      uploadsCollection: 'media',
    }),
  ],
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
```

### Media Collection with Image Sizes
```typescript
// Recommendation for Claude's discretion: media config
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
  },
  upload: {
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: undefined, // maintains aspect ratio
        position: 'centre',
      },
      {
        name: 'hero',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
      admin: {
        description: 'Describe this image for screen readers and accessibility',
      },
    },
  ],
}
```

### News Posts Collection
```typescript
import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'
import { ctaFields } from '../fields/cta'
import { richTextEditor } from './shared-editor'

export const NewsPosts: CollectionConfig = {
  slug: 'news-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishDate', '_status', 'updatedAt'],
  },
  versions: {
    drafts: {
      autosave: { interval: 1500 },
      schedulePublish: true,
    },
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { _status: { equals: 'published' } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishDate',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: richTextEditor,
    },
    ctaFields,
  ],
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Payload 2.x (Express server) | Payload 3.x (Next.js embedded) | Late 2024 GA | Single process, no separate API server, shared routing |
| Slate rich text editor | Lexical rich text editor | Payload 3.0 | Better performance, extensibility, Meta maintenance |
| tailwind.config.js (v3) | CSS-first @theme config (v4) | Early 2025 | No JS config file, faster builds with Oxide engine |
| ESLint .eslintrc (v8) | eslint.config.mjs flat config (v9) | 2024 | Breaking change in config format |
| Node.js 20 LTS | Node.js 22 LTS | Active LTS Oct 2024 | Longer support runway (April 2027) |

**Deprecated/outdated:**
- Payload 2.x patterns: Completely different architecture. Avoid any tutorial referencing `express()` or `payload.init()`
- `@payloadcms/richtext-slate`: Deprecated in favor of Lexical
- `tailwind.config.js`: Replaced by CSS-first config in v4

## Open Questions

1. **Tailwind v4 compatibility with create-payload-app scaffolding**
   - What we know: Payload templates may still generate Tailwind v3 config
   - What's unclear: Whether the latest `create-payload-app` has been updated for Tailwind v4
   - Recommendation: After scaffolding, inspect generated config. If v3, clean up and convert to v4. Since Phase 1 is admin-panel only (Payload ships its own admin styles), Tailwind setup can be deferred to Phase 2 with minimal risk.

2. **EXPERIMENTAL_TableFeature stability**
   - What we know: Tables are marked EXPERIMENTAL in Payload's Lexical implementation
   - What's unclear: Timeline for stabilization, specific known issues
   - Recommendation: Use it (D-08 requires tables) but pin Payload version and test table functionality on upgrades

3. **Embedded content implementation for D-07**
   - What we know: Lexical does not have a built-in "embed" feature in Payload's official features list
   - What's unclear: Whether to use a custom Lexical feature or a BlocksFeature block for embeds
   - Recommendation: Implement as a BlocksFeature block (EmbedBlock) with a URL field and allowlisted domains (youtube.com, vimeo.com). This gives editorial control over what can be embedded.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | Yes | 22.16.0 | -- |
| pnpm | Package manager (D-14) | Yes (via corepack) | 10.32.1 | -- |
| Docker | Containerization (Phase 4) | Yes | 29.3.0 | Not needed for Phase 1 |
| PostgreSQL (client) | Database connection | Yes (psql) | 14.22 | -- |
| npx | Scaffolding | Yes | 10.9.2 | -- |
| corepack | pnpm management | Yes | 0.32.0 | npm install -g pnpm |

**Missing dependencies with no fallback:** None

**Missing dependencies with fallback:** None

**Note:** A running PostgreSQL server is required for development. The user's K8s cluster has PostgreSQL, but a local dev instance may be needed. Docker can spin one up: `docker run -d --name payload-postgres -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:16`

## Sources

### Primary (HIGH confidence)
- [Payload CMS Drafts Documentation](https://payloadcms.com/docs/versions/drafts) -- draft/version configuration API
- [Payload CMS Collections Documentation](https://payloadcms.com/docs/configuration/collections) -- collection config structure
- [Payload CMS Globals Documentation](https://payloadcms.com/docs/configuration/globals) -- global config structure
- [Payload CMS Official Lexical Features](https://payloadcms.com/docs/rich-text/official-features) -- all built-in Lexical features
- [Payload CMS Rich Text Overview](https://payloadcms.com/docs/rich-text/overview) -- Lexical editor configuration
- [Payload CMS Installation](https://payloadcms.com/docs/getting-started/installation) -- scaffolding and setup
- [Payload CMS Uploads](https://payloadcms.com/docs/upload/overview) -- media collection and imageSizes
- [Payload CMS Migrations](https://payloadcms.com/docs/database/migrations) -- PostgreSQL migration workflow
- [Payload CMS Blocks Field](https://payloadcms.com/docs/fields/blocks) -- block definition for BlocksFeature
- [GitHub: Payload blank template](https://github.com/payloadcms/payload/tree/main/templates/blank) -- project structure

### Secondary (MEDIUM confidence)
- npm registry version checks (2026-03-24) -- payload@3.80.0, next@16.2.1, sharp@0.34.5, tailwindcss@4.2.2

### Tertiary (LOW confidence)
- [Payload inline blocks blog post](https://oleksii-s.dev/blog/how-to-add-dynamic-data-in-rich-text-using-inline-blocks-in-payload-cms) -- community example of BlocksFeature usage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, Payload 3.x docs are comprehensive
- Architecture: HIGH -- patterns derived from official Payload documentation and template structure
- Pitfalls: MEDIUM -- some based on community reports and general Next.js/Payload knowledge

**Research date:** 2026-03-24
**Valid until:** 2026-04-23 (Payload releases frequently but 3.x API is stable)
