---
phase: 13-quality-audit
plan: 01
subsystem: testing
tags: [lighthouse, axe-core, accessibility, playwright, audit, wcag]

# Dependency graph
requires:
  - phase: 09-foundation-config
    provides: seed data with news articles, officials, meetings for route testing
provides:
  - Lighthouse audit test suite for 6 public routes with 95+ threshold assertions
  - Axe-core accessibility test suite for 6 public routes with zero-violation assertions
  - Admin login page load verification test
  - Shared audit helper utilities (score types, JSON output, markdown reporting)
affects: [13-02-audit-execution]

# Tech tracking
tech-stack:
  added: [playwright-lighthouse@4.0.0, "@axe-core/playwright@4.11.1", lighthouse@13.0.3]
  patterns: [worker-scoped chromium fixture with remote-debugging-port, axe-core WCAG 2.1 AA tag filtering]

key-files:
  created:
    - e2e/helpers/audit-helpers.ts
    - e2e/audit/lighthouse.spec.ts
    - e2e/audit/accessibility.spec.ts
    - e2e/audit/admin-login.spec.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - .gitignore

key-decisions:
  - "Used lighthouse@13 (Node 22 compatible) with playwright-lighthouse@4"
  - "Corrected seeded news slug to school-board-approves-2026-2027-budget (plan had incorrect slug)"
  - "Lighthouse throttling fully disabled for consistent local/CI results"

patterns-established:
  - "Audit fixture pattern: worker-scoped chromium with --remote-debugging-port=9222+workerIndex"
  - "Audit results written as ephemeral JSON to e2e/audit/results/ (gitignored)"

requirements-completed: [QA-01]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 13 Plan 01: Audit Test Suite Summary

**Lighthouse, axe-core, and admin audit specs covering 6 public routes with 95+ thresholds and zero-violation accessibility assertions**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T16:15:05Z
- **Completed:** 2026-03-25T16:17:30Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed playwright-lighthouse, @axe-core/playwright, and lighthouse as dev dependencies
- Created shared audit helpers with AuditScore interface, route constants, thresholds, JSON output, and markdown report generation
- Created Lighthouse spec that tests all 6 routes with custom chromium fixture (remote debugging port), disabled throttling, and 95+ thresholds on all 4 categories
- Created axe-core accessibility spec testing all 6 routes with WCAG 2.1 AA tags and zero-violation assertions
- Created admin login page verification test

## Task Commits

Each task was committed atomically:

1. **Task 1: Install audit dependencies and create shared helpers** - `77520ac` (chore)
2. **Task 2: Create Lighthouse and accessibility audit test specs** - `67778a8` (feat)

## Files Created/Modified
- `package.json` - Added playwright-lighthouse, @axe-core/playwright, lighthouse devDependencies
- `pnpm-lock.yaml` - Lock file updated for new dependencies
- `.gitignore` - Added e2e/audit/results/ exclusion
- `e2e/helpers/audit-helpers.ts` - Shared audit types, constants, utilities (AuditScore, AUDIT_ROUTES, LIGHTHOUSE_THRESHOLDS, writeJsonResult, summarizeAxeResults, generateAuditMarkdown)
- `e2e/audit/lighthouse.spec.ts` - Lighthouse audit tests for 6 routes with worker-scoped chromium fixture
- `e2e/audit/accessibility.spec.ts` - Axe-core accessibility tests for 6 routes with WCAG 2.1 AA assertions
- `e2e/audit/admin-login.spec.ts` - Admin login page load and form verification

## Decisions Made
- Used lighthouse@13 with playwright-lighthouse@4 since Node 22 is the runtime
- Corrected the seeded news article slug from `bibb-county-school-budget-2025` (plan) to `school-board-approves-2026-2027-budget` (actual seed data)
- Lighthouse throttling fully disabled (cpuSlowdownMultiplier: 1, all network throttling zeroed) for consistent local/CI results
- Desktop formFactor with screenEmulation disabled so Playwright viewport dimensions apply

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected seeded news article slug**
- **Found during:** Task 1 (audit helpers creation)
- **Issue:** Plan specified `/news/bibb-county-school-budget-2025` but actual seed data generates slug `school-board-approves-2026-2027-budget` from title "School Board Approves 2026-2027 Budget"
- **Fix:** Updated AUDIT_ROUTES to use correct slug `/news/school-board-approves-2026-2027-budget`
- **Files modified:** e2e/helpers/audit-helpers.ts
- **Verification:** Verified against src/seed.ts newsPostsData[0].title
- **Committed in:** 77520ac (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Essential correction -- wrong slug would cause all news article audit tests to 404.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All audit test specs ready for execution in plan 13-02
- Tests require running dev server (docker compose) with seeded database
- Results will be written to e2e/audit/results/ as JSON artifacts

## Self-Check: PASSED

All 4 created files verified present. Both commit hashes (77520ac, 67778a8) verified in git log.

---
*Phase: 13-quality-audit*
*Completed: 2026-03-25*
