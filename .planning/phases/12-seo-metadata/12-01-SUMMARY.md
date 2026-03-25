---
phase: 12-seo-metadata
plan: 01
subsystem: seo
tags: [next-metadata, open-graph, canonical-url, twitter-card, payload-cms]

# Dependency graph
requires:
  - phase: 09-foundation-config
    provides: SiteTheme global, og-default.png media upload, layout metadata template
provides:
  - Shared generatePageMeta helper (src/lib/metadata.ts)
  - ogDefaultImage upload field on SiteTheme global
  - Canonical URLs on all pages
  - Complete OG tags on all pages
  - Article-type metadata for news posts
affects: [13-qa-final-audit]

# Tech tracking
tech-stack:
  added: []
  patterns: [shared metadata helper pattern, OG image fallback chain, absolute title for homepage]

key-files:
  created:
    - src/lib/metadata.ts
  modified:
    - src/globals/SiteTheme.ts
    - src/app/(frontend)/page.tsx
    - src/app/(frontend)/news/page.tsx
    - src/app/(frontend)/news/[slug]/page.tsx
    - src/app/(frontend)/[slug]/page.tsx
    - src/app/(frontend)/meetings/page.tsx
    - src/app/(frontend)/contact-officials/page.tsx

key-decisions:
  - "Homepage uses title.absolute to bypass layout template suffix"
  - "OG image fallback chain: page SEO image -> featured image -> SiteTheme ogDefaultImage -> /og-default.png"

patterns-established:
  - "generatePageMeta pattern: all pages call shared helper for metadata instead of inline metadata objects"
  - "Canonical URLs via alternates.canonical resolving against metadataBase"

requirements-completed: [SEO-05, SEO-06, SEO-07]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 12 Plan 01: SEO Metadata Summary

**Shared generatePageMeta helper with canonical URLs, complete OG tags, and 4-level fallback image chain across all 7 page routes**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T15:38:02Z
- **Completed:** 2026-03-25T15:40:14Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created shared generatePageMeta helper that produces canonical URLs, complete OG tags (url, type, siteName, images, description), and Twitter cards
- Added ogDefaultImage upload field to SiteTheme global for editor-managed OG fallback image
- Eliminated all duplicate "| BIBB United" title suffixes across 6 page files (SEO-05)
- Every page now has self-referencing canonical URL via alternates.canonical (SEO-06)
- News articles use openGraph.type 'article' with publishedTime and author (SEO-07)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create generatePageMeta helper and add ogDefaultImage to SiteTheme** - `b88af87` (feat)
2. **Task 2: Refactor all page generateMetadata exports to use generatePageMeta** - `6e1971c` (feat)

## Files Created/Modified
- `src/lib/metadata.ts` - Shared generatePageMeta helper with canonical URL, OG tags, Twitter card, fallback image chain
- `src/globals/SiteTheme.ts` - Added ogDefaultImage upload field for editor-managed OG fallback
- `src/app/(frontend)/page.tsx` - Homepage uses generatePageMeta with absolute title override
- `src/app/(frontend)/news/page.tsx` - News listing uses generatePageMeta with slug 'news'
- `src/app/(frontend)/news/[slug]/page.tsx` - News articles use article type with publishedTime/author
- `src/app/(frontend)/[slug]/page.tsx` - CMS pages use generatePageMeta with SEO plugin fields
- `src/app/(frontend)/meetings/page.tsx` - Meetings listing uses generatePageMeta
- `src/app/(frontend)/contact-officials/page.tsx` - Officials listing uses generatePageMeta

## Decisions Made
- Homepage uses `title: { absolute: '...' }` to bypass layout template suffix (layout template adds "| BIBB United" which would duplicate on homepage)
- OG image fallback chain: page SEO image -> featured image -> SiteTheme ogDefaultImage -> static /og-default.png

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All SEO metadata foundations in place for Phase 12 Plan 02 (sitemap and structured data fixes if applicable)
- Phase 13 QA audit can verify metadata correctness across all pages

---
*Phase: 12-seo-metadata*
*Completed: 2026-03-25*
