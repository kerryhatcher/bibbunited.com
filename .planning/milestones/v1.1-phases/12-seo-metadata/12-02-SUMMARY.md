---
phase: 12-seo-metadata
plan: 02
subsystem: seo
tags: [sitemap, robots, next.js-app-router, payload-cms, seo]

# Dependency graph
requires:
  - phase: 09-foundation-config
    provides: Payload CMS collections (news-posts, pages) with published status
provides:
  - Native App Router sitemap.ts querying Payload for all published content
  - Native App Router robots.ts with crawler rules and sitemap reference
  - Removal of next-sitemap dependency and ESM/CJS compatibility issue
affects: [13-quality-audit]

# Tech tracking
tech-stack:
  added: []
  patterns: [Next.js App Router native sitemap/robots handlers, Payload Local API for SEO data]

key-files:
  created: [src/app/sitemap.ts, src/app/robots.ts]
  modified: [package.json]

key-decisions:
  - "Native App Router sitemap.ts/robots.ts replace next-sitemap -- eliminates ESM/CJS compatibility issue and postbuild step"

patterns-established:
  - "App Router metadata files: place sitemap.ts and robots.ts at src/app/ root, not inside route groups"
  - "Payload sitemap queries: use select to fetch only slug and updatedAt for performance"

requirements-completed: [SEO-08, INFRA-03]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 12 Plan 02: Sitemap & Robots Summary

**Native App Router sitemap.ts and robots.ts replace next-sitemap, querying Payload for all published news and pages with tiered priority (homepage 1.0, civic pages 0.8, news 0.7)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T15:38:05Z
- **Completed:** 2026-03-25T15:39:29Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Dynamic sitemap.ts queries Payload Local API for all published news-posts and pages
- Homepage priority 1.0, static civic pages (/news, /meetings, /contact-officials) priority 0.8, CMS pages 0.8, news articles 0.7
- robots.ts allows all crawlers, disallows /admin/, references /sitemap.xml
- Fully removed next-sitemap dependency, config file, postbuild script, and static output files
- Resolved ESM/CJS compatibility blocker noted in STATE.md

## Task Commits

Each task was committed atomically:

1. **Task 1: Create native sitemap.ts and robots.ts handlers** - `bcc3ac7` (feat)
2. **Task 2: Remove next-sitemap package, config, postbuild script, and static files** - `9982a9f` (chore)

## Files Created/Modified
- `src/app/sitemap.ts` - Dynamic sitemap querying Payload for all published news-posts and pages
- `src/app/robots.ts` - Crawler rules allowing all, disallowing /admin/, referencing sitemap.xml
- `package.json` - Removed next-sitemap dependency and postbuild script
- `next-sitemap.config.cjs` - Deleted (replaced by native handlers)

## Decisions Made
- Native App Router sitemap.ts/robots.ts replace next-sitemap -- eliminates the ESM/CJS compatibility issue documented in STATE.md and removes the postbuild step entirely

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Sitemap and robots are now served dynamically via App Router handlers
- No postbuild step needed -- simplifies build pipeline
- Ready for Phase 13 quality audit verification

---
*Phase: 12-seo-metadata*
*Completed: 2026-03-25*
