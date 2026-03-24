---
phase: 01-cms-foundation
plan: 01
subsystem: cms
tags: [payload-cms, next-js, postgresql, typescript]

# Dependency graph
requires: []
provides:
  - Payload CMS 3.x project skeleton with Next.js and PostgreSQL
  - Media collection with thumbnail/card/hero image sizes
  - Users collection with built-in auth
  - Reusable slug field with auto-generation from title
  - Reusable CTA field group (text + link)
  - formatSlug utility hook
affects: [01-02, 01-03, 02-01, 03-01]

# Tech tracking
tech-stack:
  added: [payload@3.80.0, next@16.2.1, react@19.2.4, "@payloadcms/db-postgres@3.80.0", "@payloadcms/richtext-lexical@3.80.0", "@payloadcms/plugin-seo@3.80.0", sharp@0.34.5, typescript@5.9.3]
  patterns: [Payload collection config, Payload field hooks, reusable field modules, PostgreSQL via Drizzle adapter]

key-files:
  created:
    - src/payload.config.ts
    - src/collections/Media.ts
    - src/collections/Users.ts
    - src/fields/slug.ts
    - src/fields/cta.ts
    - src/hooks/formatSlug.ts
    - .env.example
    - .nvmrc
  modified: []

key-decisions:
  - "Manual project setup from Payload blank template instead of create-payload-app (scaffolder TTY issues in CI/automated environments)"
  - "Removed @payloadcms/storage-local dependency (package does not exist on npm; Payload stores uploads locally by default)"
  - "Node.js 22 LTS pinned per D-15"
  - "pnpm as package manager per D-14"

patterns-established:
  - "Collection configs in src/collections/ as named exports"
  - "Reusable fields in src/fields/ as named exports"
  - "Payload hooks in src/hooks/ as named exports"
  - "Empty src/blocks/ and src/globals/ directories reserved for future plans"

requirements-completed: [DEPLOY-04, CONT-05]

# Metrics
duration: 5min
completed: 2026-03-24
---

# Phase 1 Plan 01: Project Scaffold Summary

**Payload CMS 3.x project with PostgreSQL adapter, Media collection (3 image sizes), and reusable slug/CTA fields for content collections**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-24T05:51:06Z
- **Completed:** 2026-03-24T05:56:11Z
- **Tasks:** 2
- **Files modified:** 29

## Accomplishments
- Payload CMS 3.x project scaffolded with Next.js 16, React 19, TypeScript 5.9
- PostgreSQL database adapter configured via @payloadcms/db-postgres with DATABASE_URI env var
- Media collection with thumbnail (400x300), card (768w), hero (1920w) image sizes and required alt text
- Reusable slug field with auto-generation from title via beforeValidate hook
- Reusable CTA field group (text + link) ready for Pages and News Posts collections

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Payload CMS project and configure PostgreSQL** - `84ba042` (feat)
2. **Task 2: Create Media collection, slug field, and CTA field group** - `08149db` (feat)

## Files Created/Modified
- `src/payload.config.ts` - Main Payload configuration with PostgreSQL adapter, Users and Media collections
- `src/collections/Media.ts` - Media upload collection with 3 image sizes (thumbnail, card, hero)
- `src/collections/Users.ts` - CMS users collection with built-in auth
- `src/fields/slug.ts` - Reusable slug field with auto-generation from title, unique constraint
- `src/fields/cta.ts` - Reusable CTA field group (button text + URL)
- `src/hooks/formatSlug.ts` - Slug formatting utility and Payload field hook
- `.nvmrc` - Node.js 22 LTS version pin
- `.env.example` - Environment variable template (DATABASE_URI, PAYLOAD_SECRET)
- `package.json` - Project dependencies and scripts
- `next.config.ts` - Next.js configuration with Payload integration
- `tsconfig.json` - TypeScript strict mode configuration
- `eslint.config.mjs` - ESLint 9 flat config
- `.gitignore` - Standard Next.js + Payload ignores
- `src/app/(payload)/` - Auto-generated Payload admin routes (7 files)
- `src/app/(frontend)/` - Minimal frontend layout and page (3 files)

## Decisions Made
- **Manual setup vs create-payload-app:** The `create-payload-app` scaffolder requires TTY interaction and could not run in the automated environment. Manually created the project structure from the official Payload blank template, adapted for PostgreSQL.
- **No @payloadcms/storage-local:** The research recommended this package but it does not exist on npm. Payload uses local file storage by default -- no plugin needed.
- **Minimal frontend page:** Created a simple placeholder page instead of the template's branded landing page. Frontend design is handled in Phase 2.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] create-payload-app TTY failure**
- **Found during:** Task 1 (Project scaffolding)
- **Issue:** `create-payload-app` CLI requires interactive TTY for database connection string prompt; fails in automated/non-TTY environments
- **Fix:** Manually created all project files based on Payload's official blank template (from GitHub), adapted for PostgreSQL adapter instead of MongoDB
- **Files modified:** All project files (created from scratch)
- **Verification:** TypeScript compiles cleanly with `tsc --noEmit`
- **Committed in:** 84ba042 (Task 1 commit)

**2. [Rule 1 - Bug] @payloadcms/storage-local package does not exist**
- **Found during:** Task 1 (Dependency installation)
- **Issue:** Package `@payloadcms/storage-local` returns 404 on npm registry. The research/plan referenced it but it does not exist.
- **Fix:** Removed from dependencies. Payload stores uploads to local filesystem by default (the `upload.staticDir` config in Media collection handles this).
- **Files modified:** package.json
- **Verification:** `pnpm install` succeeds, Media collection config has `staticDir: 'media'`
- **Committed in:** 84ba042 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking, 1 bug)
**Impact on plan:** Both auto-fixes necessary for task completion. No scope creep. Final result matches all plan acceptance criteria.

## Issues Encountered
- None beyond the auto-fixed deviations above.

## User Setup Required
None - no external service configuration required. Local PostgreSQL is needed for development (`docker run -d --name bibb-postgres -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=bibbunited -p 5432:5432 postgres:16`).

## Next Phase Readiness
- Project skeleton ready for Plan 02 (Pages and News Posts collections)
- Reusable slug field and CTA field group importable from `src/fields/`
- Media collection ready for relationship fields in content collections
- `src/blocks/` directory ready for PullQuote and Callout blocks (Plan 02)
- `src/globals/` directory ready for UrgentBanner global (Plan 03)

## Self-Check: PASSED

All 13 created files verified present. Both task commits (84ba042, 08149db) verified in git history. TypeScript compilation passes with zero errors.

---
*Phase: 01-cms-foundation*
*Completed: 2026-03-24*
