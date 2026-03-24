# Phase 5: Critical Build & Route Fixes - Research

**Researched:** 2026-03-24
**Domain:** Next.js build pipeline, App Router dynamic routes, Payload CMS data fetching, SEO metadata
**Confidence:** HIGH

## Summary

Phase 5 addresses five specific bugs/gaps identified during the v1.0 milestone audit. All issues have clear root causes found through direct codebase inspection. No new libraries are needed -- this is purely a fix-and-create phase using existing patterns already established in phases 1-4.

The critical issue is the `next build` failure caused by `generateStaticParams` in `/news/[slug]/page.tsx` returning null slugs from draft posts. The second major task is creating the missing `/news` listing page. The remaining items (Twitter Card metadata on two pages, orphaned route cleanup) are straightforward edits.

**Primary recommendation:** Fix generateStaticParams to filter out null/draft slugs, create `/news` listing page following existing page patterns, add twitter metadata to contact-officials and meetings pages, delete orphaned my-route.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | Dockerized Next.js + Payload app as single container | Fix generateStaticParams so `next build` succeeds -- Dockerfile already correct |
| SEO-03 | Auto-generated sitemap.xml | Sitemap generation runs as postbuild script; unblocked once `next build` passes |
| DSGN-03 | Clear, scannable homepage with latest news, key topic callouts, and hero section | Create `/news` listing page so "View All News" link resolves; homepage components already exist |
| SEO-01 | OpenGraph and Twitter Card meta tags on all pages and posts | Add `twitter` property to generateMetadata in contact-officials and meetings pages |
</phase_requirements>

## Issue Analysis

### Issue 1: `next build` Fails (CRITICAL)

**Error:** `A required parameter (slug) was not provided as a string received object in generateStaticParams for /news/[slug]`

**Root cause (HIGH confidence -- verified in codebase):**

`src/app/(frontend)/news/[slug]/page.tsx` line 21-29:
```typescript
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'news-posts',
    limit: 100,
    select: { slug: true },
  })
  return posts.docs.map((post) => ({ slug: post.slug }))
}
```

The `NewsPosts` collection has `versions.drafts` enabled. The `slug` field type in `payload-types.ts` is `slug?: string | null`. Two problems combine:

1. **No `_status: 'published'` filter** -- The Local API at build time runs without a user context, so the `read` access control filter applies `{ _status: { equals: 'published' } }`. However, during build with `select: { slug: true }`, Payload may return partial objects where slug resolution behaves differently.

2. **No null guard** -- `post.slug` can be `null` or `undefined`. The `.map()` passes this directly to Next.js, which expects a plain string.

**Fix pattern:**
```typescript
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'news-posts',
    limit: 100,
    where: { _status: { equals: 'published' } },
    select: { slug: true },
  })
  return posts.docs
    .filter((post): post is typeof post & { slug: string } => typeof post.slug === 'string')
    .map((post) => ({ slug: post.slug }))
}
```

**Note:** The same pattern exists in `src/app/(frontend)/[slug]/page.tsx` for the pages collection. That collection also has `slug?: string | null` in types. It should receive the same defensive fix to prevent future build failures.

### Issue 2: Missing `/news` Listing Route

**Problem:** `LatestNews.tsx` line 89 links to `/news` and `Footer.tsx` line 50 links to `/news`. No route file exists at `src/app/(frontend)/news/page.tsx`. The URL falls through to the `[slug]` catch-all, queries `pages` collection for `slug = "news"`, finds nothing, returns 404.

**What exists:** `src/app/(frontend)/news/[slug]/page.tsx` (individual post pages). The directory `src/app/(frontend)/news/` exists but only contains `[slug]/`.

**Fix:** Create `src/app/(frontend)/news/page.tsx` -- a listing page that queries all published news posts and renders them in a paginated or scrollable list.

**Pattern to follow:** The homepage already fetches news posts in `src/app/(frontend)/page.tsx`:
```typescript
const latestNews = await payload.find({
  collection: 'news-posts',
  limit: 5,
  sort: '-publishDate',
  depth: 1,
})
```

The news listing page should use the same query pattern but with a higher limit and include proper metadata + JSON-LD breadcrumbs.

**Existing components to reuse:**
- `Card` component from `@/components/ui/Card`
- `DateDisplay` from `@/components/shared/DateDisplay`
- `Section` from `@/components/ui/Section`
- `JsonLdScript` + `breadcrumbJsonLd` from `@/lib/jsonLd`

### Issue 3: Twitter Card Metadata Missing on Two Pages

**Problem:** `contact-officials/page.tsx` and `meetings/page.tsx` have `openGraph` in their `generateMetadata` but no `twitter` property. Next.js inherits `twitter.card: 'summary_large_image'` from layout.tsx but page-specific titles/descriptions do not appear in Twitter Card previews.

**Fix:** Add `twitter` property to both pages' `generateMetadata` return, matching the openGraph content. Pattern already established in `news/[slug]/page.tsx` and `[slug]/page.tsx`:

```typescript
twitter: {
  title: 'Contact Your Officials | BIBB United',
  description: 'Contact information for local officials...',
},
```

### Issue 4: Orphaned Scaffold Route

**Problem:** `src/app/my-route/route.ts` is a Payload scaffold stub returning `{ message: 'This is an example of a custom route.' }`. Never removed after project creation. No requirement served.

**Fix:** Delete `src/app/my-route/route.ts` and the `src/app/my-route/` directory.

**Note:** This route sits outside the `(frontend)` route group. It is a plain API route at `/my-route`. Deleting it has zero impact on any other functionality.

## Architecture Patterns

### News Listing Page Structure

Follow the pattern established by `contact-officials/page.tsx` and `meetings/page.tsx`:

```
src/app/(frontend)/news/page.tsx    # New file
src/app/(frontend)/news/[slug]/     # Existing (individual post)
```

The listing page should:
1. Export `generateMetadata` with title, description, openGraph, and twitter
2. Fetch all published news posts sorted by `-publishDate`
3. Render using existing Card/Section/DateDisplay components
4. Include breadcrumb JSON-LD
5. Be a server component (no client-side state needed)

### Metadata Pattern

All public-facing pages in this project follow this metadata structure:
```typescript
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Page Title',
    description: '...',
    openGraph: {
      title: 'Page Title | BIBB United',
      description: '...',
    },
    twitter: {
      title: 'Page Title | BIBB United',
      description: '...',
    },
  }
}
```

Pages with dynamic OG images also include `images` in both `openGraph` and `twitter`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| News listing layout | Custom grid from scratch | Existing Card + Section components | Consistency with homepage LatestNews design |
| Date formatting | Manual date string manipulation | Existing DateDisplay component | Handles hydration-safe relative dates |
| Breadcrumb JSON-LD | Manual script tags | Existing JsonLdScript + breadcrumbJsonLd | Pattern established in all other routes |

## Common Pitfalls

### Pitfall 1: Forgetting `_status: 'published'` filter
**What goes wrong:** Draft/unpublished posts appear on the public listing page or cause build errors.
**Why it happens:** Payload Local API at build time may not have user context to trigger access control filters.
**How to avoid:** Always explicitly filter `{ _status: { equals: 'published' } }` in generateStaticParams and listing page queries.
**Warning signs:** Posts visible on the site that are still in "draft" state in the admin.

### Pitfall 2: Null slug in generateStaticParams
**What goes wrong:** `next build` crashes with "parameter not provided as string."
**Why it happens:** Slug field is optional (`slug?: string | null`) in the Payload type definition. Posts can exist with null slugs during draft state.
**How to avoid:** Filter out null/undefined slugs with a type guard before mapping.
**Warning signs:** Build failure during page data collection phase.

### Pitfall 3: Route group parentheses in paths
**What goes wrong:** The `(frontend)` route group directory name requires quoting in shell commands.
**Why it happens:** Parentheses are special characters in bash.
**How to avoid:** Always quote paths containing route group directories.

### Pitfall 4: Sitemap not regenerating after route addition
**What goes wrong:** The `/news` route does not appear in sitemap.xml after creation.
**Why it happens:** next-sitemap runs as a postbuild script. It needs `next build` to succeed first.
**How to avoid:** The sitemap will automatically include `/news` once `next build` passes -- no config change needed.

## Code Examples

### generateStaticParams with null-safe slug filtering
```typescript
// Source: Codebase pattern from [slug]/page.tsx, fixed for null slugs
export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'news-posts',
    limit: 100,
    where: { _status: { equals: 'published' } },
    select: { slug: true },
  })
  return posts.docs
    .filter((post): post is typeof post & { slug: string } => typeof post.slug === 'string')
    .map((post) => ({ slug: post.slug }))
}
```

### Twitter metadata addition pattern
```typescript
// Source: Existing pattern from news/[slug]/page.tsx generateMetadata
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Page Title',
    description: '...',
    openGraph: {
      title: 'Page Title | BIBB United',
      description: '...',
    },
    // Add this block -- mirrors openGraph content
    twitter: {
      title: 'Page Title | BIBB United',
      description: '...',
    },
  }
}
```

### News listing page query
```typescript
// Source: Pattern from homepage page.tsx
const payload = await getPayload({ config: configPromise })
const newsPosts = await payload.find({
  collection: 'news-posts',
  limit: 50,
  sort: '-publishDate',
  where: { _status: { equals: 'published' } },
  depth: 1,
})
```

## Verification Strategy

After all fixes are applied, verify with:

1. **`next build`** -- must complete without errors (confirms generateStaticParams fix and no TypeScript issues)
2. **Dev server route check** -- navigate to `/news` and confirm it renders the listing page
3. **Link verification** -- confirm "View All News" from homepage and "News" from footer both navigate to `/news`
4. **Metadata inspection** -- check that contact-officials and meetings pages have `twitter:title` and `twitter:description` meta tags
5. **Orphaned route gone** -- confirm `/my-route` returns 404 and directory is deleted
6. **Sitemap** -- after successful build, verify `/news` appears in generated sitemap.xml

## Project Constraints (from CLAUDE.md)

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x (non-negotiable)
- **Payload 2.x patterns must be avoided** -- use 3.x Local API patterns only
- **Tailwind v4** CSS-first configuration
- **All UI verification must be automated** via Playwright MCP or Chrome DevTools MCP (no manual human tasks)
- **Conventional Commits** for all commit messages
- **Use context7 MCP** for documentation lookups
- **GSD workflow enforcement** -- no direct repo edits outside GSD workflow

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection -- all root causes verified by reading source files
- `payload-types.ts` -- confirms `slug?: string | null` type definition
- `next build` output -- confirms exact error message and location
- v1.0 milestone audit -- provides comprehensive issue catalog

### Secondary (MEDIUM confidence)
- Next.js App Router documentation -- generateStaticParams must return string values for all params
- Payload CMS 3.x -- `select` option returns only selected fields plus `id`

## Metadata

**Confidence breakdown:**
- Build fix (generateStaticParams): HIGH -- root cause verified in code and types
- News listing page: HIGH -- straightforward new route following established patterns
- Twitter metadata: HIGH -- two-line addition to existing functions
- Orphaned route: HIGH -- simple file deletion

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable codebase, no external dependency changes)
