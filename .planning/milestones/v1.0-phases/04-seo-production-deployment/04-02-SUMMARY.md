---
phase: 04-seo-production-deployment
plan: 02
subsystem: seo
tags: [json-ld, opengraph, twitter-card, schema-org, structured-data, metadata]

requires:
  - phase: 04-01
    provides: "SEO plugin with meta fields on Pages and NewsPosts, og-default.png fallback image, next-sitemap config"
provides:
  - "JSON-LD structured data library (src/lib/jsonLd.ts) with Organization, WebSite, NewsArticle, BreadcrumbList, GovernmentOrganization schemas"
  - "OpenGraph and Twitter Card meta tags on all 6 frontend page routes"
  - "CMS-configurable SEO metadata per page/post via Payload admin SEO tab"
  - "generateMetadata pattern replacing all static metadata exports"
affects: [04-03, deployment, seo-validation]

tech-stack:
  added: []
  patterns: [json-ld-via-script-tag, generateMetadata-pattern, og-image-fallback-chain]

key-files:
  created:
    - src/lib/jsonLd.ts
  modified:
    - src/app/(frontend)/layout.tsx
    - src/app/(frontend)/page.tsx
    - src/app/(frontend)/[slug]/page.tsx
    - src/app/(frontend)/news/[slug]/page.tsx
    - src/app/(frontend)/contact-officials/page.tsx
    - src/app/(frontend)/meetings/page.tsx

key-decisions:
  - "Used React.createElement for JSON-LD script injection with XSS prevention via unicode escaping"
  - "OG image fallback chain: SEO override > featuredImage > og-default.png (from layout)"

patterns-established:
  - "JsonLdScript component: reusable JSON-LD renderer accepting any schema.org data object"
  - "generateMetadata pattern: all pages use async generateMetadata instead of static metadata export"
  - "SEO meta field access: page.meta?.title, page.meta?.description, page.meta?.image with graceful fallbacks"

requirements-completed: [SEO-01, SEO-02, SEO-04]

duration: 4min
completed: 2026-03-24
---

# Phase 4 Plan 2: OG/Twitter Metadata and JSON-LD Structured Data Summary

**OpenGraph/Twitter Card meta tags on all 6 page routes with JSON-LD structured data (NewsArticle, Organization, WebSite, BreadcrumbList, GovernmentOrganization) for search engine rich snippets**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-24T14:00:17Z
- **Completed:** 2026-03-24T14:04:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Created JSON-LD helper library with 6 exports covering all schema.org types needed
- Replaced all static metadata exports with generateMetadata across 6 page routes
- Added CMS-configurable OG/Twitter meta tags with fallback chain (SEO fields > featured image > default)
- Injected structured data: Organization + WebSite on homepage, NewsArticle on news posts, GovernmentOrganization + Person on contact officials, BreadcrumbList on all content pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create JSON-LD helper library** - `1476cfe` (feat)
2. **Task 2: Add generateMetadata and JSON-LD to all page routes** - `01e2ad6` (feat)

## Files Created/Modified
- `src/lib/jsonLd.ts` - JSON-LD helper library with JsonLdScript, organizationJsonLd, websiteJsonLd, newsArticleJsonLd, breadcrumbJsonLd, governmentOrgJsonLd
- `src/app/(frontend)/layout.tsx` - generateMetadata with metadataBase, OG defaults, Twitter card config
- `src/app/(frontend)/page.tsx` - Homepage OG metadata + Organization/WebSite JSON-LD
- `src/app/(frontend)/[slug]/page.tsx` - CMS-configurable OG/Twitter + BreadcrumbList JSON-LD
- `src/app/(frontend)/news/[slug]/page.tsx` - OG/Twitter with featuredImage fallback + NewsArticle/BreadcrumbList JSON-LD
- `src/app/(frontend)/contact-officials/page.tsx` - OG metadata + GovernmentOrganization/Person/BreadcrumbList JSON-LD
- `src/app/(frontend)/meetings/page.tsx` - OG metadata + BreadcrumbList JSON-LD

## Decisions Made
- Used React.createElement for JSON-LD rendering with XSS prevention (unicode escape of `<` characters) per Next.js official guidance
- OG image fallback chain: SEO override image > featured image > og-default.png inherited from layout
- All pages use title template `%s | BIBB United` from layout except homepage which sets full title

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Known Stubs
None - all data sources are wired to CMS fields.

## Next Phase Readiness
- All pages have complete SEO metadata and structured data
- Ready for sitemap generation and production deployment (Plan 04-03)
- JSON-LD schemas can be validated with Google Rich Results Test once deployed

## Self-Check: PASSED

All files exist. All commit hashes verified.

---
*Phase: 04-seo-production-deployment*
*Completed: 2026-03-24*
