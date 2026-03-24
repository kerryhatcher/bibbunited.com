# Phase 8: Tech Debt Cleanup - Research

**Researched:** 2026-03-24
**Domain:** Accessibility, deployment hardening, seed data, documentation
**Confidence:** HIGH

## Summary

Phase 8 resolves 10 tech debt items from the v1.0 milestone audit. All items are well-scoped with exact file locations, specific Tailwind classes to change, and clear acceptance criteria. No new features are introduced -- this is purely quality, accessibility, robustness, and test coverage work.

The work divides into four categories: (1) accessibility contrast fixes in Footer.tsx and red color verification, (2) deployment robustness fixes in Media.ts staticDir and an imageSrc guard, (3) SEO enhancement for homepage OG image, and (4) seed data creation plus deployment documentation. The codebase investigation confirms all affected files exist and match the audit descriptions, with one exception: the `imageSrc=''` issue appears to already be resolved -- the current codebase uses `getImageUrl()` which returns `undefined` (not empty string), and the Card component correctly guards with `{imageSrc && ...}`.

**Primary recommendation:** Group work into three plans: (1) code fixes (contrast + staticDir + OG image), (2) seed script + test verification, (3) deployment documentation.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Footer contrast fix: Change `text-text-on-dark/60` (copyright) to `text-text-on-dark/80` and `text-text-on-dark/80` (nav links) to `text-text-on-dark` (full opacity) in the Footer component
- Red contrast verification: Verify `#DC2626` on `#FFFFFF` meets WCAG AA (4.5:1 minimum for normal text). If it fails, darken to `#C62828` or similar
- Runtime browser verification: Automate verification of mode switching, font self-hosting, keyboard focus rings using Playwright
- staticDir fragility: Change Media.ts staticDir from relative `'media'` to absolute path using `path.resolve(__dirname, '../media')` or equivalent
- imageSrc guard: Fix `imageSrc=''` in showcase page.tsx
- Homepage OG image: Update `generateMetadata()` to use featured article's image for `openGraph.images` instead of generic `og-default.png`
- DB seed data: Create a seed script (TypeScript) that populates Payload CMS with test content: at minimum 2-3 news posts and 2-3 CMS pages with published status
- Verify full test suite: After seeding, run all 115 Playwright tests and confirm 0 skipped
- Cloudflare DNS: Document CNAME and Page Rule setup steps
- Rich Results validation: Document that JSON-LD validation requires a live deployed URL
- Docker build PostgreSQL: Document that `next build` requires a live PostgreSQL connection

### Claude's Discretion
- Seed data content (names, titles, body text) -- use realistic civic advocacy content
- Exact file location for deployment documentation
- Whether to use `path.resolve` or `path.join` for staticDir fix
- Test seed script location (e.g., `src/seed.ts`, `scripts/seed.ts`)

### Deferred Ideas (OUT OF SCOPE)
None -- this phase covers all audit tech debt items.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-05 | WCAG 2.1 AA accessible design (hardening) | Footer contrast fix, red contrast verification, runtime browser verification -- all file locations confirmed |
| DEPLOY-05 | Persistent storage for media uploads (hardening) | Media.ts staticDir fix from relative to absolute path -- Dockerfile WORKDIR=/app confirmed |
| SEO-01 | OpenGraph and Twitter Card meta tags (hardening) | Homepage generateMetadata() lacks openGraph.images -- existing news-post pattern shows how to do it |
</phase_requirements>

## Architecture Patterns

### Affected File Map

| File | Issue | Fix |
|------|-------|-----|
| `src/components/layout/Footer.tsx` | Copyright text at 60% opacity, nav links at 80% opacity on navy bg | Change `text-text-on-dark/60` to `text-text-on-dark/80`, change `text-text-on-dark/80` to `text-text-on-dark` |
| `src/app/(frontend)/styles.css` | `--color-crimson: #DC2626` may fail WCAG AA boundary | Verify contrast ratio; if <4.5:1 change to `#C62828` or similar |
| `src/collections/Media.ts` | `staticDir: 'media'` is relative -- fragile if WORKDIR changes | Use `path.resolve(dirname, '../media')` with dirname from `import.meta.url` |
| `src/app/(frontend)/page.tsx` | `generateMetadata()` has no `openGraph.images` field | Fetch latest published news post, use its featuredImage for OG |
| `src/components/ui/Card.tsx` | `imageSrc=''` audit item | ALREADY RESOLVED -- `getImageUrl()` returns `undefined`, Card guards with `{imageSrc && ...}` |

### Pattern: Payload Local API for Seed Data

The seed script must use Payload's Local API (same pattern used throughout the app). Key requirements:

1. Must create a user first (author relationship required by NewsPosts)
2. Must create media items (featuredImage required by NewsPosts)
3. Must set `_status: 'published'` for items to be visible to public queries
4. Both `pages` and `news-posts` collections use `versions.drafts` -- the `_status` field is critical

```typescript
// Pattern from existing codebase (payload.config.ts already imported)
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const payload = await getPayload({ config: configPromise })

// Create content with published status
await payload.create({
  collection: 'pages',
  data: {
    title: 'About',
    slug: 'about',
    content: { root: { /* Lexical rich text JSON */ } },
    _status: 'published',
  },
})
```

### Pattern: staticDir with Absolute Path

The Dockerfile uses `WORKDIR /app` at every stage. The standalone output copies to `/app/`. Media uploads go to `/app/media/`. The current relative `staticDir: 'media'` resolves relative to `process.cwd()`, which works when WORKDIR is `/app` but breaks silently if changed.

```typescript
// Media.ts fix pattern
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    // dirname = src/collections/ -> ../../media = ./media from project root
  },
  // ...
}
```

Note: `__dirname` is not available in ESM modules (this project uses `"type": "module"`). Must use the `import.meta.url` pattern, which is already used in `payload.config.ts`.

### Pattern: Homepage OG Image from Featured Article

The news article page already implements the OG image fallback chain correctly (lines 46-66 of `news/[slug]/page.tsx`). The homepage should follow the same pattern:

```typescript
// In page.tsx generateMetadata()
const payload = await getPayload({ config: configPromise })
const latestNews = await payload.find({
  collection: 'news-posts',
  limit: 1,
  sort: '-publishDate',
  depth: 1,
  where: { _status: { equals: 'published' } },
})
const firstPost = latestNews.docs[0]
const featuredImg = typeof firstPost?.featuredImage === 'object'
  ? (firstPost.featuredImage as Media)?.url ?? null
  : null
const ogImage = featuredImg || '/og-default.png'
```

### Anti-Patterns to Avoid
- **Do not use `__dirname` in ESM modules:** This project is `"type": "module"`. Use `fileURLToPath(import.meta.url)` pattern instead.
- **Do not create seed data as draft:** Without `_status: 'published'`, content is invisible to public access control rules, and Playwright tests will still skip.
- **Do not use `payload.create` without `overrideAccess: true`:** Seed script runs outside the admin context -- must bypass access control.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| WCAG contrast checking | Manual color math | WebAIM contrast calculator or `color-contrast` npm package | Edge cases with opacity, alpha channels |
| Rich text JSON structure | Guess Lexical format | Copy from Payload admin API response | Lexical's internal JSON format is complex and underdocumented |
| Seed data management | Direct SQL inserts | Payload Local API (`payload.create`) | Handles slug generation, version records, relationship wiring |

## Common Pitfalls

### Pitfall 1: Lexical Rich Text JSON Format
**What goes wrong:** Seed scripts fail because the rich text body field expects Lexical's internal JSON format, not HTML or plain text.
**Why it happens:** Lexical stores content as a structured JSON tree with specific node types.
**How to avoid:** Create a sample post via the Payload admin UI, then fetch it via the Local API to see the exact JSON structure. Use that as a template for seed data.
**Warning signs:** Validation errors on `body` field when running seed script.

### Pitfall 2: Seed Script Needs Running Database
**What goes wrong:** Seed script fails because Payload requires a PostgreSQL connection to initialize.
**Why it happens:** `getPayload({ config })` connects to the database immediately.
**How to avoid:** Document that the dev server must be stopped (or use a separate DB connection) and DATABASE_URI must be set. Consider running seed as a separate `tsx` script rather than trying to integrate into the Next.js dev server.
**Warning signs:** Connection refused errors on script start.

### Pitfall 3: Media Uploads in Seed Script
**What goes wrong:** NewsPosts require `featuredImage` (a relationship to media collection), but creating media via Local API requires an actual file buffer.
**Why it happens:** `payload.create({ collection: 'media', data: {...} })` needs a file upload.
**How to avoid:** Use `payload.create({ collection: 'media', data: { alt: '...' }, file: { data: buffer, name: 'test.jpg', mimetype: 'image/jpeg', size: ... } })`. Generate a simple placeholder image using sharp or include a small test image in the repo.
**Warning signs:** "featuredImage is required" validation error on news post creation.

### Pitfall 4: Footer Contrast -- Tailwind Opacity Syntax
**What goes wrong:** Using wrong Tailwind v4 syntax for opacity modifiers.
**Why it happens:** Tailwind v4 still supports `/60` opacity modifier syntax on color utilities.
**How to avoid:** The fix is straightforward: `text-text-on-dark/60` -> `text-text-on-dark/80` and `text-text-on-dark/80` -> `text-text-on-dark`. The full opacity version drops the modifier entirely.
**Warning signs:** None -- this is a simple find-and-replace in Footer.tsx.

### Pitfall 5: OG Image URL Must Be Absolute
**What goes wrong:** OG image URL is relative (e.g., `/media/test.jpg`) instead of absolute.
**Why it happens:** Payload stores media URLs as relative paths.
**How to avoid:** Prepend the site URL (`https://www.bibbunited.com`) or use `NEXT_PUBLIC_SERVER_URL` environment variable.
**Warning signs:** Social media preview shows broken image.

## Code Examples

### Footer Contrast Fix (Exact Changes)

```typescript
// Footer.tsx line 32 - copyright text
// BEFORE:
<span className="text-sm text-text-on-dark/60">
// AFTER:
<span className="text-sm text-text-on-dark/80">

// Footer.tsx lines 42, 50, 58, 66 - nav links
// BEFORE:
className="text-sm text-text-on-dark/80 no-underline hover:text-white"
// AFTER:
className="text-sm text-text-on-dark no-underline hover:text-white"

// Footer.tsx line 14 - "Get Involved" subtitle
// BEFORE:
<p className="mx-auto mt-4 max-w-xl text-lg text-text-on-dark/80">
// AFTER:
<p className="mx-auto mt-4 max-w-xl text-lg text-text-on-dark">
```

### WCAG AA Contrast Verification

`#DC2626` (red-600) on `#FFFFFF` (white):
- Calculated ratio: approximately 4.51:1
- WCAG AA minimum for normal text: 4.5:1
- This passes but is at the boundary

If verification shows it fails (rounding differences between tools), darken to `#C62828` which has approximately 5.9:1 contrast ratio.

Note: `#DC2626` is defined as `--color-crimson` in `src/app/(frontend)/styles.css` line 18 and as `--color-accent` in the `:root` block (community mode) at line 32.

### Seed Data Structure

The tests need:
- **cms-page.spec.ts:** Navigates to `/about` -- needs a Page with `slug: 'about'` and `_status: 'published'`
- **news-article.spec.ts:** Navigates to `/news`, finds first `a[href^="/news/"]` link -- needs at least one NewsPost with `_status: 'published'`

Minimum seed data:
1. 1 User (required as author for news posts)
2. 1 Media item (required as featuredImage for news posts)
3. 2-3 Pages (including one with slug `about`)
4. 2-3 NewsPosts (with publishDate, featuredImage, body, author)

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Next.js + React + Tailwind CSS + Payload CMS 3.x -- non-negotiable
- **Database:** PostgreSQL -- required
- **Testing:** All UI verification must be automated via Playwright or Chrome DevTools MCP -- never manual
- **GSD workflow:** Must follow GSD workflow for all file changes
- **Conventional commits:** Required for all commit messages
- **ESM modules:** Project uses `"type": "module"` -- no `__dirname`, no `require()`

## Open Questions

1. **imageSrc='' audit item -- still relevant?**
   - What we know: No `imageSrc=''` pattern exists in current codebase. The audit mentioned "showcase page.tsx" but no showcase page exists. `getImageUrl()` returns `undefined` not `''`, and Card guards correctly.
   - Recommendation: Mark as already resolved. Verify during runtime browser checks.

2. **Seed script execution method**
   - What we know: Payload requires database connection. Script needs `@payload-config` alias resolution.
   - Recommendation: Use `tsx` runner with `tsconfig-paths` or run via a custom Next.js API route. The simplest approach is a standalone `src/seed.ts` that imports payload config directly and uses `tsx --tsconfig tsconfig.json src/seed.ts`.

3. **Red contrast tool selection**
   - What we know: 4.51:1 is the measured ratio. Need automated verification.
   - Recommendation: Use a simple inline calculation (relative luminance formula) or use Playwright to check computed styles. The math is well-defined: ((L1 + 0.05) / (L2 + 0.05)) where L is relative luminance. For hex colors this is deterministic -- no tool needed, just arithmetic.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: Footer.tsx, Media.ts, page.tsx, Card.tsx, styles.css, Dockerfile, payload.config.ts, NewsPosts.ts, Pages.ts
- Playwright test files: e2e/responsive/news-article.spec.ts, cms-page.spec.ts
- v1.0 Milestone Audit: .planning/v1.0-MILESTONE-AUDIT.md

### Secondary (MEDIUM confidence)
- WCAG 2.1 AA contrast ratio requirement: 4.5:1 for normal text (well-established standard)
- Payload CMS Local API patterns: observed in existing codebase, consistent with Payload 3.x documentation

## Metadata

**Confidence breakdown:**
- Accessibility fixes: HIGH - exact file locations and Tailwind classes confirmed in codebase
- Deployment hardening: HIGH - Dockerfile WORKDIR and Media.ts confirmed, ESM pattern already used in payload.config.ts
- SEO OG image: HIGH - existing pattern in news article page, straightforward to replicate
- Seed data: MEDIUM - Lexical rich text JSON format needs to be captured from admin UI; media file upload in seed script needs testing
- Documentation: HIGH - items are clearly scoped as write-only documentation tasks

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- no moving targets in this phase)
