---
phase: 04-seo-production-deployment
plan: 01
subsystem: seo, infra
tags: [payload-seo, next-sitemap, og-image, standalone-output, docker]

# Dependency graph
requires:
  - phase: 01-cms-foundation
    provides: "Payload CMS with Pages and NewsPosts collections"
  - phase: 02-brand-design-system
    provides: "Brand color tokens (navy, crimson) for OG image"
provides:
  - "SEO plugin with auto-generated title, description, URL for pages and news-posts"
  - "next-sitemap build-time sitemap.xml and robots.txt generation"
  - "Branded OG fallback image at public/og-default.png"
  - "Next.js standalone output for Docker builds"
  - "Regenerated payload-types.ts with SEO meta fields"
affects: [04-02, 04-03]

# Tech tracking
tech-stack:
  added: [next-sitemap]
  patterns: [seoPlugin configuration with auto-generation functions, postbuild script pattern]

key-files:
  created:
    - next-sitemap.config.cjs
    - public/og-default.png
  modified:
    - src/payload.config.ts
    - next.config.ts
    - package.json
    - src/payload-types.ts

key-decisions:
  - "SEO plugin uses tabbedUI for clean editor experience"
  - "next-sitemap runs as postbuild script (build-time generation, not runtime)"
  - "OG fallback image generated via sharp SVG-to-PNG conversion"

patterns-established:
  - "Payload plugin configuration: import plugin, add to plugins array with collection targeting"
  - "postbuild script pattern for build-time asset generation"

requirements-completed: [SEO-01, SEO-03, SEO-04]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 4 Plan 1: SEO Infrastructure & Build Config Summary

**Payload SEO plugin with auto-generation for pages/news-posts, next-sitemap for build-time sitemap/robots.txt, branded OG fallback image, and standalone output for Docker**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T13:50:24Z
- **Completed:** 2026-03-24T13:52:30Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Wired @payloadcms/plugin-seo with auto-generated title, description, and URL functions for pages and news-posts collections
- Configured next-sitemap for build-time sitemap.xml and robots.txt generation with /admin/ disallowed
- Created 1200x630 branded OG fallback image with BIBB/UNITED wordmark on navy background
- Added output: 'standalone' to next.config.ts for Docker multi-stage builds
- Regenerated payload-types.ts with SEO meta fields for downstream Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire Payload SEO plugin, configure Next.js standalone output, and regenerate types** - `99e5803` (feat)
2. **Task 2: Configure next-sitemap for build-time sitemap and robots.txt generation** - `75ddd4f` (feat)
3. **Task 3: Create branded OG fallback image** - `31688ac` (feat)

## Files Created/Modified
- `src/payload.config.ts` - Added seoPlugin with generateTitle, generateDescription, generateURL and tabbedUI
- `next.config.ts` - Added output: 'standalone' for Docker builds
- `src/payload-types.ts` - Regenerated with SEO meta fields (title, description, image)
- `next-sitemap.config.cjs` - Build-time sitemap and robots.txt config
- `package.json` - Added next-sitemap dependency and postbuild script
- `public/og-default.png` - 1200x630 branded OG fallback image

## Decisions Made
- SEO plugin uses tabbedUI for clean editor experience separating content from SEO fields
- next-sitemap runs as postbuild script for build-time generation rather than runtime
- OG fallback image generated via sharp SVG-to-PNG conversion matching brand design tokens

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SEO infrastructure ready for Plan 02 (per-page metadata, dynamic OG images)
- payload-types.ts has meta fields that Plan 02 generateMetadata functions will consume
- standalone output ready for Plan 03 (Dockerfile and K8s deployment)

## Self-Check: PASSED

All files verified present. All commit hashes verified in git log.

---
*Phase: 04-seo-production-deployment*
*Completed: 2026-03-24*
