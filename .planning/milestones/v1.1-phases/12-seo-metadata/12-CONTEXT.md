# Phase 12: SEO & Metadata - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Every page has correct, complete metadata for search engines and social sharing. Delivers: consistent title template without duplicate suffixes, canonical URLs on all pages, complete Open Graph tags (url, type, site_name, image, description), dynamic sitemap with all CMS and static pages, homepage priority 1.0, and removal of next-sitemap in favor of native App Router handlers. Requirements: SEO-05, SEO-06, SEO-07, SEO-08, INFRA-03.

</domain>

<decisions>
## Implementation Decisions

### Sitemap Approach
- **D-01:** Replace next-sitemap with a native Next.js App Router `sitemap.ts` route handler. Queries Payload directly for all pages and news posts. No ESM/CJS compatibility issues. Resolves the STATE.md blocker.
- **D-02:** Include all routes in sitemap: homepage (priority 1.0), CMS pages collection (priority 0.8), news articles (priority 0.7), and static civic pages -- /news, /meetings, /contact-officials (priority 0.8).
- **D-03:** Replace static `public/robots.txt` with App Router `robots.ts` for consistency. Same rules: allow all, disallow /admin/.
- **D-04:** Full removal of next-sitemap: delete `next-sitemap.config.cjs`, remove `next-sitemap` from `package.json`, remove postbuild script, delete `public/sitemap*.xml` and `public/robots.txt` static files.

### OG Image Fallback Chain
- **D-05:** Add an `ogDefaultImage` upload field to the SiteTheme global. Editors can set/change the default OG image via admin panel.
- **D-06:** Fallback chain for OG images: per-page SEO image (meta.image) -> featured image (for news posts) -> SiteTheme ogDefaultImage -> static `/og-default.png`.
- **D-07:** The `generatePageMeta` helper fetches SiteTheme to resolve the default OG image. Callers don't need to know about the fallback chain.

### Metadata Helper Pattern
- **D-08:** Create a shared `generatePageMeta` utility in `src/lib/metadata.ts`. Takes `{title, description, slug, type?, image?, publishedTime?, author?}` and returns a complete Next.js `Metadata` object with canonical URL, OG tags, Twitter cards, and proper fallbacks.
- **D-09:** The helper fetches the SiteTheme global itself to resolve the default OG image. Callers pass only page-specific data.
- **D-10:** All page `generateMetadata` exports refactored to use this helper instead of building metadata manually.

### Title Template Strategy
- **D-11:** Layout keeps existing template: `title: { default: 'BIBB United', template: '%s | BIBB United' }`.
- **D-12:** Homepage uses `title: { absolute: 'BIBB United -- Civic Advocacy for the BIBB Community' }` to bypass the template and set a descriptive title for search results.
- **D-13:** All other pages export short titles (e.g., `title: 'News'`, `title: post.title`) and let the layout template append `| BIBB United`.
- **D-14:** CMS pages use `meta.title` from Payload SEO plugin if set, falling back to the page's main `title` field. Gives editors control over search result titles.

### OG Types
- **D-15:** News article detail pages use `openGraph.type: 'article'` with `published_time` and `author` fields.
- **D-16:** All other pages (homepage, listings, civic pages, CMS pages) use `openGraph.type: 'website'`.

### Canonical URLs
- **D-17:** Every page gets a self-referencing canonical URL via `alternates.canonical` in the Metadata object. Built from `metadataBase` + slug.
- **D-18:** No pagination exists -- canonical strategy stays simple. Revisit if pagination is added in a future phase.

### Claude's Discretion
- Exact implementation details of the `generatePageMeta` helper (parameter types, internal caching, error handling)
- Whether to cache the SiteTheme OG image fetch or rely on Payload's built-in request deduplication
- Plan structure: how to split these requirements into logical plan groupings
- Order of operations for the migration (helper first vs sitemap first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` -- SEO-05, SEO-06, SEO-07, SEO-08, INFRA-03

### Prior Phase Context
- `.planning/phases/09-foundation-config/09-CONTEXT.md` -- D-07, D-08 (OG default image as Payload media item, seed script upload)

### Existing Metadata Implementation
- `src/app/(frontend)/layout.tsx` -- Root layout with title template, metadataBase, default OG/Twitter config
- `src/app/(frontend)/page.tsx` -- Homepage metadata with dynamic OG image from latest news
- `src/app/(frontend)/news/[slug]/page.tsx` -- News article metadata with SEO plugin fields, featured image fallback
- `src/app/(frontend)/[slug]/page.tsx` -- CMS page metadata with SEO plugin fields
- `src/app/(frontend)/news/page.tsx` -- News listing metadata (hardcoded)
- `src/app/(frontend)/meetings/page.tsx` -- Meetings metadata (hardcoded)
- `src/app/(frontend)/contact-officials/page.tsx` -- Officials metadata (hardcoded)

### Sitemap (to be replaced)
- `next-sitemap.config.cjs` -- Current sitemap config (will be removed)

### Globals
- `src/globals/SiteTheme.ts` -- SiteTheme global where ogDefaultImage field will be added

### JSON-LD (reference only -- not being changed)
- `src/lib/jsonLd.ts` -- Existing JSON-LD structured data utilities

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/jsonLd.ts` -- JSON-LD utilities already established (not changing, but good pattern reference)
- `src/lib/getTheme.ts` -- Existing SiteTheme fetch pattern to follow for OG image retrieval
- `src/globals/SiteTheme.ts` -- Global config where ogDefaultImage field will be added
- Payload SEO plugin fields (`meta.title`, `meta.description`, `meta.image`) already on Pages and NewsPosts collections

### Established Patterns
- `generateMetadata` async exports on every page -- Next.js App Router metadata pattern
- `metadataBase` set in root layout -- all relative URLs in metadata resolve against it
- Payload `getPayload({ config: configPromise })` pattern for server-side data fetching
- `generateStaticParams` on dynamic routes for SSG

### Integration Points
- Root layout `generateMetadata` -- title template and defaults (will keep, minor adjustments)
- Every page's `generateMetadata` -- will be refactored to use shared helper
- `package.json` postbuild script -- references next-sitemap (will be removed)
- `public/` directory -- static sitemap and robots files (will be removed)

</code_context>

<specifics>
## Specific Ideas

No specific requirements -- open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 12-seo-metadata*
*Context gathered: 2026-03-25*
