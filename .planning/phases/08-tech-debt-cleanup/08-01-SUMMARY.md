---
phase: 08-tech-debt-cleanup
plan: 01
subsystem: ui, infra, seo
tags: [wcag, accessibility, contrast, media, opengraph, absolute-url]

# Dependency graph
requires:
  - phase: 02-brand-design-system
    provides: Footer component and CSS theme variables
  - phase: 04-seo-production-deployment
    provides: OG image infrastructure and Media collection
provides:
  - WCAG AA compliant Footer text contrast
  - Absolute path Media staticDir for deployment robustness
  - Dynamic homepage OpenGraph image with absolute URL
affects: [deployment, seo, accessibility]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "import.meta.url + path.resolve for ESM-safe absolute staticDir paths"
    - "NEXT_PUBLIC_SERVER_URL prefix for absolute OG image URLs"

key-files:
  created: []
  modified:
    - src/components/layout/Footer.tsx
    - src/collections/Media.ts
    - src/app/(frontend)/page.tsx

key-decisions:
  - "Red accent #DC2626 passes WCAG AA at 4.79:1 -- no color change needed"
  - "Media staticDir uses import.meta.url pattern matching payload.config.ts convention"
  - "Homepage OG image falls back to og-default.png when no published news post exists"

patterns-established:
  - "ESM dirname pattern: fileURLToPath(import.meta.url) + path.dirname for absolute paths in collections"

requirements-completed: [DSGN-05, DEPLOY-05, SEO-01]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 08 Plan 01: Code-Level Tech Debt Fixes Summary

**WCAG AA Footer contrast fix, absolute-path Media staticDir, and dynamic homepage OG image with absolute URL**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T20:26:48Z
- **Completed:** 2026-03-24T20:29:07Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Footer text contrast upgraded to WCAG AA compliance (removed /60 opacity, standardized nav links to full opacity)
- Media staticDir hardened with path.resolve + import.meta.url for deployment-safe absolute paths
- Homepage generateMetadata now fetches latest published news post for dynamic OG image
- OG image URLs are absolute (prepend NEXT_PUBLIC_SERVER_URL) per OpenGraph spec requirement

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix Footer contrast and verify red accent color** - `4850afd` (fix)
2. **Task 2: Harden Media staticDir and add homepage OG image with absolute URL** - `4bbdb75` (fix)

## Files Created/Modified
- `src/components/layout/Footer.tsx` - Improved text contrast: subtitle to full opacity, copyright to /80, nav links to full opacity
- `src/collections/Media.ts` - staticDir changed from relative 'media' to path.resolve absolute path
- `src/app/(frontend)/page.tsx` - generateMetadata now queries latest published news post for OG image with absolute URL

## Decisions Made
- Red accent color #DC2626 verified at 4.79:1 contrast ratio on white -- passes WCAG AA (>4.5:1), no color change needed
- Used import.meta.url + path.dirname pattern (matching existing payload.config.ts convention) for ESM-safe dirname
- OG image fallback uses og-default.png (already exists in public/) with absolute URL prefix

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Code-level tech debt items (3 of 10) resolved
- Ready for Plan 02 (Dockerfile optimization) and Plan 03 (testing infrastructure improvements)

## Self-Check: PASSED

All files and commits verified.

---
*Phase: 08-tech-debt-cleanup*
*Completed: 2026-03-24*
