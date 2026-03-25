---
phase: 09-foundation-config
plan: 02
subsystem: seed-data, cms
tags: [payload-cms, sharp, seed-script, navigation, homepage, officials, meetings, og-image]

# Dependency graph
requires:
  - phase: 09-01
    provides: displayName field on Users collection
provides:
  - Complete seed script with 6 colorful labeled images
  - Branded OG default image as Payload media item
  - Populated Navigation global (News, About, Take Action dropdown, Resources)
  - Populated Homepage global (heroSpotlight with 3 news posts, topicCallouts with icons)
  - 4 seeded Officials (3 board-of-education, 1 county-commission)
  - 3 seeded Meetings with always-future dates
  - Seed user displayName set to BIBB United Staff
affects: [10-component-migration, 11-seo-a11y-fixes, 12-seo-metadata]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "sharp SVG composite for generating labeled seed images"
    - "Polymorphic relationship format: { relationTo, value } for multi-collection page fields"
    - "Relative date offsets for always-future meeting seed data"

key-files:
  created: []
  modified:
    - src/seed.ts

key-decisions:
  - "OG image uploaded as Payload media item (not to public/) -- layout.tsx /og-default.png remains as fallback until Phase 12 updates references"
  - "Navigation uses external type with URL for collection listing routes (/news, /officials, /meetings) since these are not Payload pages"
  - "Polymorphic page relationship format { relationTo: 'pages', value: id } required by Payload typed globals"

patterns-established:
  - "createSeedImage helper: reusable sharp-based image generation with find-or-create by alt text"
  - "Seed execution order: user -> media -> pages -> news -> officials -> meetings -> navigation -> homepage"

requirements-completed: [VIS-02, VIS-03, VIS-04, A11Y-05, SEO-09]

# Metrics
duration: 4min
completed: 2026-03-24
---

# Phase 09 Plan 02: Seed Script Overhaul Summary

**Complete seed rewrite with 6 colorful labeled images, branded OG image, populated Navigation/Homepage globals, 4 Officials, 3 Meetings, and user displayName**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-24T23:07:06Z
- **Completed:** 2026-03-24T23:10:55Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments
- Generated 6 colorful labeled seed images (Budget/red, Safety/blue, Schools/green, Community/gold, Board Meeting/purple, Spotlight/orange) with descriptive context-specific alt text
- Created branded OG default image (1200x630 PNG, navy #1B2A4A background, BIBB UNITED text, gold accent bar) as Payload media item
- Populated Navigation global with News, About, Take Action dropdown (Get Involved, Contact Officials, Meetings), Resources
- Populated Homepage global with heroSpotlight (3 news posts) and topicCallouts (School Budget/dollar-sign, Get Involved/megaphone, Board Meetings/calendar)
- Seeded 4 Officials (Dr. Sarah Mitchell, James Thompson, Maria Rodriguez from board-of-education; Robert Chen from county-commission)
- Seeded 3 Meetings with relative future dates (Regular Board Meeting +14d, Budget Work Session +28d, Curriculum Committee Meeting +42d)
- Set seed user displayName to 'BIBB United Staff'
- Each news post uses a different featured image for visual variety

## Task Commits

Each task was committed atomically:

1. **Task 1: Overhaul seed script with images, globals, civic data, and OG image** - `7f94a06` (feat)

## Files Created/Modified
- `src/seed.ts` - Complete rewrite with createSeedImage helper, 6 topic images, OG image, Officials, Meetings, Navigation global, Homepage global, user displayName

## Decisions Made
- OG image uploaded as Payload media item per D-08, not saved to public/. The existing /og-default.png reference in layout.tsx serves as fallback until Phase 12 updates it to use the Payload media URL.
- Navigation uses 'external' type with URL strings for collection listing routes (/news, /officials, /meetings) since these are Next.js routes, not Payload page documents.
- Used polymorphic relationship format { relationTo: 'pages', value: id } for Navigation page references, as required by Payload's typed global update API for multi-collection relationship fields.
- Cast displayName update data as Record<string, unknown> since payload-types.ts has not been regenerated after the 09-01 migration adding the field.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed sharp import pattern for TypeScript compatibility**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Plan used `sharpModule.default()` pattern but TypeScript sees the dynamic import differently
- **Fix:** Used `const { default: sharpFn } = await import('sharp')` and passed `sharpFn` directly
- **Files modified:** src/seed.ts
- **Verification:** `tsc --noEmit` passes cleanly
- **Committed in:** 7f94a06 (Task 1 commit)

**2. [Rule 1 - Bug] Fixed polymorphic relationship format for Navigation page field**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Navigation's page field is a polymorphic relationship (relationTo: ['pages', 'news-posts']), requiring `{ relationTo, value }` format, not bare IDs
- **Fix:** Changed `page: aboutPage.id` to `page: { relationTo: 'pages', value: aboutPage.id }`
- **Files modified:** src/seed.ts
- **Verification:** `tsc --noEmit` passes cleanly
- **Committed in:** 7f94a06 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs)
**Impact on plan:** Both auto-fixes necessary for TypeScript correctness. No scope creep.

## Issues Encountered
- Build verification (`pnpm build`) not run due to pre-existing PostgreSQL connection requirement in CI-less environment. TypeScript compilation (`tsc --noEmit`) passes cleanly, confirming code correctness.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Navigation and Homepage globals populated, ready for Phase 10 component migration
- Seed images are bright colors that contrast against #1B2A4A backgrounds, resolving dark-image issues
- OG default image exists as Payload media item, ready for Phase 12 to wire into layout.tsx metadata
- Officials and Meetings seeded for civic data pages

## Known Stubs

None - all seed data is fully wired with real field values.

---
*Phase: 09-foundation-config*
*Completed: 2026-03-24*
