---
phase: 08-tech-debt-cleanup
plan: 03
subsystem: testing
tags: [payload-cms, seed-script, playwright, tsx, browser-verification, accessibility]

# Dependency graph
requires:
  - phase: 08-01
    provides: "Accessibility fixes (focus rings, footer contrast, media staticDir)"
  - phase: 06-responsive-testing
    provides: "Playwright test suite (160 tests across 5 viewports)"
provides:
  - "Database seed script for test content (3 pages, 3 news posts, media)"
  - "npm seed command for reproducible test data"
  - "160/160 Playwright tests passing with 0 skipped"
  - "Runtime browser verification evidence for mode switching, fonts, focus rings"
affects: []

# Tech tracking
tech-stack:
  added: [tsx]
  patterns: [payload-local-api-seeding, node-env-file-loading, playwright-runtime-verification]

key-files:
  created:
    - src/seed.ts
    - e2e/verify-runtime.spec.ts
  modified:
    - package.json

key-decisions:
  - "Seed script uses title-based lookup for idempotency since slug hook auto-generates from title on create"
  - "Used node --env-file=.env instead of dotenv for environment loading (Node 22 native feature)"
  - "Fonts are Barlow Condensed (headings) and Inter (body), not Oswald as initially assumed in plan"

patterns-established:
  - "Seed idempotency: check by title (not slug) since Payload slug hooks override on create"
  - "Runtime verification: Playwright spec files for browser-level checks beyond layout testing"

requirements-completed: [DSGN-05, SEO-01]

# Metrics
duration: 11min
completed: 2026-03-24
---

# Phase 08 Plan 03: Seed Script & Test Coverage Summary

**Payload CMS seed script populating 3 pages + 3 news posts enabling all 160 Playwright tests to pass with zero skips; runtime browser verification of fonts, mode switching, and focus rings**

## Performance

- **Duration:** 11 min
- **Started:** 2026-03-24T20:32:24Z
- **Completed:** 2026-03-24T20:43:30Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created idempotent seed script that populates database with 3 published pages (including /about) and 3 published news posts with author and featured image relationships
- Eliminated all 20 skipped Playwright tests (previously skipping due to missing CMS content) -- 160/160 now pass
- Verified runtime browser behavior: Barlow Condensed headings, Inter body text, self-hosted fonts (no Google CDN), 13/14 elements with visible keyboard focus indicators, community mode active

## Task Commits

Each task was committed atomically:

1. **Task 1: Create seed script with test content** - `d23958b` (feat)
2. **Task 2: Run seed, verify test suite, and perform runtime browser verification** - `3d2af7f` (fix)

## Files Created/Modified
- `src/seed.ts` - Payload Local API seed script creating users, media, pages, and news posts with _status: 'published'
- `e2e/verify-runtime.spec.ts` - Runtime browser verification for mode switching, font self-hosting, and keyboard focus rings
- `package.json` - Added "seed" npm script and tsx devDependency

## Decisions Made
- **Title-based idempotency:** Seed script checks for existing content by title (not slug) because Payload's slug hook auto-generates from title on create, ignoring any explicitly provided slug value
- **Node --env-file:** Used Node 22's native --env-file flag instead of adding dotenv dependency, keeping the dependency footprint small
- **Font correction:** Plan referenced Oswald for headings, but actual implementation uses Barlow Condensed (from Phase 2 decisions). Verified correct font loading in browser.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed seed script slug handling**
- **Found during:** Task 2 (seed execution)
- **Issue:** Payload's formatSlugHook always overrides slug on create operation, ignoring explicitly provided slugs. The seed script's explicit slugs were being overwritten, causing idempotency check failures and unique constraint violations on re-runs.
- **Fix:** Changed seed to use title-based lookup instead of slug-based; removed explicit slug values from page/news post data; set About page title to "About" so auto-generated slug matches test expectations
- **Files modified:** src/seed.ts
- **Verification:** `pnpm run seed` runs idempotently, /about returns 200
- **Committed in:** 3d2af7f (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed seed script environment loading**
- **Found during:** Task 2 (seed execution)
- **Issue:** Seed script failed with "missing secret key" because PAYLOAD_SECRET and DATABASE_URI from .env were not loaded
- **Fix:** Changed npm seed script from `cross-env NODE_OPTIONS=--no-deprecation tsx src/seed.ts` to `node --no-deprecation --env-file=.env --import tsx/esm src/seed.ts`
- **Files modified:** package.json
- **Verification:** `pnpm run seed` completes with "Seeding complete!" output
- **Committed in:** 3d2af7f (Task 2 commit)

**3. [Rule 3 - Blocking] Made media creation idempotent**
- **Found during:** Task 2 (seed re-execution)
- **Issue:** Media creation was not idempotent - created duplicate test images on each re-run
- **Fix:** Added alt-text-based lookup before creating media
- **Files modified:** src/seed.ts
- **Verification:** Re-running seed shows "Using existing media" instead of creating duplicates
- **Committed in:** 3d2af7f (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 2 blocking)
**Impact on plan:** All fixes necessary for seed script to function correctly. No scope creep.

## Issues Encountered
- Plan specified Oswald as heading font, but Phase 2 actually implemented Barlow Condensed. Verified the actual font in browser -- Barlow Condensed is correct and loads properly.
- Plan expected ~115 tests total; actual count is 160 tests across 5 viewports. All 160 pass with 0 skipped.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 08 (tech-debt-cleanup) is now complete with all 3 plans executed
- Full test coverage achieved: 160/160 Playwright tests passing
- Seed script available for future test environment setup via `pnpm run seed`

---
*Phase: 08-tech-debt-cleanup*
*Completed: 2026-03-24*
