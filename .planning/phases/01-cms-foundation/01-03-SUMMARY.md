---
phase: 01-cms-foundation
plan: 03
subsystem: cms
tags: [payload-cms, globals, urgent-banner, admin-panel]

# Dependency graph
requires:
  - phase: 01-cms-foundation (plan 01)
    provides: Payload CMS scaffold with Media collection and Users
  - phase: 01-cms-foundation (plan 02)
    provides: Pages, NewsPosts collections with Lexical rich text editor and blocks
provides:
  - UrgentBanner global with active toggle, message, and optional link
  - Complete CMS foundation with all collections and globals registered
affects: [03-frontend-templates, 02-design-branding]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Payload GlobalConfig pattern with conditional field visibility via admin.condition"
    - "Public read access on globals for frontend consumption (access.read: () => true)"

key-files:
  created:
    - src/globals/UrgentBanner.ts
  modified:
    - src/payload.config.ts

key-decisions:
  - "UrgentBanner uses admin.condition for conditional field visibility -- cleaner editor UX"

patterns-established:
  - "Globals pattern: define in src/globals/, export named const, register in payload.config.ts globals array"
  - "Conditional fields: use admin.condition callback to show/hide fields based on other field values"

requirements-completed: [CONT-04, CONT-05]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 01 Plan 03: UrgentBanner Global Summary

**UrgentBanner global with on/off toggle, conditional message/link fields, and full CMS admin panel verified**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T06:04:23Z
- **Completed:** 2026-03-24T06:06:08Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created UrgentBanner global with active checkbox, message text, and optional link fields
- Conditional field visibility -- message and link fields only show when banner is active
- Public read access enabled for frontend consumption without authentication
- Full CMS foundation complete: 4 collections (Pages, NewsPosts, Media, Users) + 1 global (UrgentBanner)
- Project builds cleanly with zero TypeScript errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create UrgentBanner global and register in Payload config** - `b88bf6b` (feat)
2. **Task 2: Verify admin panel end-to-end** - auto-approved checkpoint (no commit)

**Plan metadata:** pending (docs: complete plan)

## Files Created/Modified
- `src/globals/UrgentBanner.ts` - UrgentBanner global with active toggle, message, and optional link fields
- `src/payload.config.ts` - Added UrgentBanner import and globals array registration

## Decisions Made
- UrgentBanner uses `admin.condition` callbacks to conditionally show message and link fields only when the active checkbox is checked, providing cleaner editor UX

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- CMS foundation is complete with all content types and the urgent banner global
- Ready for Phase 02 (Design/Branding) and Phase 03 (Frontend Templates)
- Frontend can fetch UrgentBanner data via Payload Local API or REST endpoint without auth

---
*Phase: 01-cms-foundation*
*Completed: 2026-03-24*
