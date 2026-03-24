---
phase: 05-critical-build-route-fixes
plan: 02
subsystem: ui
tags: [next.js, react, server-component, seo, json-ld, payload-cms]

# Dependency graph
requires:
  - phase: 03-site-pages-navigation
    provides: Card, Section, DateDisplay components and news-posts collection
  - phase: 04-seo-production-deployment
    provides: JsonLdScript, breadcrumbJsonLd utilities and metadata patterns
provides:
  - /news listing route resolving "View All News" and Footer links
  - OpenGraph and Twitter Card metadata for /news
  - Breadcrumb JSON-LD structured data (Home > News)
affects: [sitemap, seo, navigation]

# Tech tracking
tech-stack:
  added: []
  patterns: [news listing page with card grid and empty state]

key-files:
  created:
    - src/app/(frontend)/news/page.tsx
  modified: []

key-decisions:
  - "Followed existing card grid pattern from contact-officials and LatestNews components"
  - "Limited query to 50 posts with published filter -- sufficient for current scale"

patterns-established:
  - "Listing page pattern: generateMetadata + breadcrumb JSON-LD + payload.find with published filter + card grid + empty state"

requirements-completed: [DSGN-03, SEO-03]

# Metrics
duration: 1min
completed: 2026-03-24
---

# Phase 5 Plan 2: News Listing Page Summary

**Server-rendered /news listing page with responsive card grid, OG/Twitter metadata, and breadcrumb JSON-LD resolving dead "View All News" link**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-24T15:30:42Z
- **Completed:** 2026-03-24T15:31:48Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Created /news route as React Server Component eliminating 404 from homepage "View All News" and Footer links
- Added generateMetadata with title, description, OpenGraph, and Twitter Card properties
- Implemented responsive card grid (1 col mobile, 2 col sm, 3 col lg) using existing Card and DateDisplay components
- Added breadcrumb JSON-LD (Home > News) for search engine structured data
- Included empty state messaging when no posts are published

## Task Commits

Each task was committed atomically:

1. **Task 1: Create /news listing page with metadata, cards grid, and JSON-LD** - `eeff544` (feat)

## Files Created/Modified
- `src/app/(frontend)/news/page.tsx` - News listing page with metadata, card grid, JSON-LD, and empty state

## Decisions Made
- Followed existing patterns from contact-officials/page.tsx and LatestNews.tsx for consistency
- Used 50-post limit matching plan specification -- adequate for current content volume
- No excerpt displayed on cards (NewsPosts collection has no excerpt field per UI-SPEC)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- /news route complete and ready for full build verification
- Depends on plan 05-01 (generateStaticParams fix) completing for clean build
- Sitemap should include /news after successful build

## Self-Check: PASSED

- FOUND: src/app/(frontend)/news/page.tsx
- FOUND: .planning/phases/05-critical-build-route-fixes/05-02-SUMMARY.md
- FOUND: commit eeff544

---
*Phase: 05-critical-build-route-fixes*
*Completed: 2026-03-24*
