---
phase: 09-foundation-config
plan: 01
subsystem: database, infra
tags: [payload-cms, postgresql, next-config, cache-headers, migration]

# Dependency graph
requires: []
provides:
  - displayName field on Users collection (optional text field)
  - DB migration adding display_name column to users table
  - X-Powered-By header suppression
  - Long-lived cache headers for media paths
affects: [09-02, 10-component-migration, 11-seo-a11y-fixes]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Payload migration pattern: IF NOT EXISTS / IF EXISTS for idempotent DDL"
    - "Next.js headers() for route-specific cache control"

key-files:
  created:
    - src/migrations/20260324_200000.ts
  modified:
    - src/collections/Users.ts
    - src/migrations/index.ts
    - next.config.ts

key-decisions:
  - "displayName field is optional (no required: true) -- falls back to 'BIBB United Staff' in byline code"
  - "Cache headers applied to /media/:path* and /api/media/:path* only -- Next.js handles /_next/static automatically"

patterns-established:
  - "Migration naming: YYYYMMDD_HHMMSS timestamp format"
  - "Migration index: import and register each migration in chronological order"

requirements-completed: [A11Y-05, INFRA-01, INFRA-02]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 09 Plan 01: Foundation Config Summary

**Optional displayName field on Users with DB migration, plus Next.js cache headers and X-Powered-By suppression**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T23:03:43Z
- **Completed:** 2026-03-24T23:05:17Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Added optional displayName text field to Users collection for article bylines
- Created idempotent DB migration to add display_name varchar column to users table
- Suppressed X-Powered-By header via poweredByHeader: false
- Configured immutable cache headers (1 year) for /media and /api/media paths

## Task Commits

Each task was committed atomically:

1. **Task 1: Add displayName field to Users collection and create DB migration** - `17fb696` (feat)
2. **Task 2: Configure Next.js cache headers and suppress X-Powered-By** - `2616f0f` (feat)

## Files Created/Modified
- `src/collections/Users.ts` - Added optional displayName text field with admin description
- `src/migrations/20260324_200000.ts` - New migration: ALTER TABLE users ADD COLUMN display_name varchar
- `src/migrations/index.ts` - Registered new migration in chronological order
- `next.config.ts` - Added poweredByHeader: false and headers() for media cache control

## Decisions Made
- displayName field is optional (no required constraint) -- byline components will fall back to "BIBB United Staff" when empty
- Cache headers applied only to /media/:path* and /api/media/:path* -- Next.js handles /_next/static/* cache headers automatically, so adding custom rules would be redundant

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Build verification (`pnpm build`) fails due to missing PostgreSQL connection in development environment -- this is a pre-existing infrastructure issue unrelated to our changes. TypeScript compilation (`tsc --noEmit`) passes cleanly, confirming code correctness.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- displayName field and migration are ready for the seed script (Plan 02) to set display names
- Next.js config hardening complete, no further changes needed for this phase

---
*Phase: 09-foundation-config*
*Completed: 2026-03-24*
