---
phase: 03-site-pages-navigation
plan: 01
subsystem: ui, cms
tags: [payload-cms, navigation, header, footer, urgent-banner, print-css, date-fns, lucide-react]

# Dependency graph
requires:
  - phase: 02-brand-design-system
    provides: "Tailwind design tokens, UI components (Button, Logo, Section), font loading"
  - phase: 01-cms-foundation
    provides: "Pages, NewsPosts, Media, Users collections, UrgentBanner/SiteTheme globals, Payload config"
provides:
  - "Officials CMS collection (name, role, body, contact info)"
  - "Meetings CMS collection (date, time, location, agenda)"
  - "Navigation global with nested dropdown support"
  - "Homepage global with hero spotlight and topic callouts"
  - "Reusable linkFields() for internal/external links"
  - "Sticky Header with desktop dropdowns and mobile hamburger"
  - "Footer with GET INVOLVED CTA section"
  - "UrgentBannerBar conditional rendering"
  - "Print CSS hiding site chrome"
  - "Data fetchers: getNavigation, getHomepage, getUrgentBanner"
affects: [03-02, 03-03, 04-seo-production]

# Tech tracking
tech-stack:
  added: [date-fns@4.1.0]
  patterns: [linkFields reusable field factory, data fetcher helpers, data-print-hide attribute convention, server-side nav data in layout]

key-files:
  created:
    - src/fields/link.ts
    - src/collections/Officials.ts
    - src/collections/Meetings.ts
    - src/globals/Navigation.ts
    - src/globals/Homepage.ts
    - src/lib/getNavigation.ts
    - src/lib/getHomepage.ts
    - src/lib/getUrgentBanner.ts
    - src/components/layout/UrgentBannerBar.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/Footer.tsx
  modified:
    - src/payload.config.ts
    - src/payload-types.ts
    - src/app/(frontend)/layout.tsx
    - src/app/(frontend)/styles.css
    - package.json

key-decisions:
  - "linkFields uses CollectionSlug[] type for type-safe relation targets"
  - "Header is client component for interactive dropdowns; Footer and UrgentBannerBar are server components"
  - "Navigation data fetched in layout and passed as serializable prop to Header"
  - "Print hiding uses data-print-hide attribute convention rather than class names"

patterns-established:
  - "linkFields(): reusable field factory with disableLabel option for embedded use"
  - "data-print-hide: attribute-based print style hiding for all site chrome"
  - "Layout chrome pattern: UrgentBannerBar > Header > main(pt-16) > Footer"

requirements-completed: [NAV-01, NAV-02, DSGN-07]

# Metrics
duration: 4min
completed: 2026-03-24
---

# Phase 3 Plan 1: Site Navigation & Layout Chrome Summary

**CMS-managed navigation with sticky header (desktop dropdowns + mobile hamburger), CTA footer, urgent banner, Officials/Meetings collections, and print CSS**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-24T10:30:03Z
- **Completed:** 2026-03-24T10:34:16Z
- **Tasks:** 3
- **Files modified:** 15

## Accomplishments
- Created Officials and Meetings CMS collections for civic engagement data
- Built Navigation and Homepage globals with CMS-managed menu items supporting internal/external links and one-level dropdowns
- Implemented sticky Header with desktop hover/click dropdowns, keyboard navigation (ArrowDown/ArrowUp/Escape), and mobile slide-out hamburger menu
- Built Footer with prominent GET INVOLVED CTA section and quick links
- Added UrgentBannerBar that conditionally renders from CMS data
- Wired all chrome components into the frontend layout
- Added print CSS that hides navigation/footer/banner and shows clean article content
- Installed date-fns for upcoming date formatting needs

## Task Commits

Each task was committed atomically:

1. **Task 1: CMS data layer** - `e665688` (feat)
2. **Task 2: Site chrome components** - `2736b45` (feat)
3. **Task 3: Layout integration, date-fns, print CSS** - `db921f5` (feat)

## Files Created/Modified
- `src/fields/link.ts` - Reusable internal/external link field factory
- `src/collections/Officials.ts` - Officials collection (name, role, governing body, contact)
- `src/collections/Meetings.ts` - Meetings collection (date, time, location, agenda)
- `src/globals/Navigation.ts` - CMS-managed navigation with nested dropdown items
- `src/globals/Homepage.ts` - Homepage hero spotlight and topic callout configuration
- `src/lib/getNavigation.ts` - Navigation data fetcher (depth 1)
- `src/lib/getHomepage.ts` - Homepage data fetcher (depth 2)
- `src/lib/getUrgentBanner.ts` - Urgent banner data fetcher
- `src/components/layout/UrgentBannerBar.tsx` - Conditional urgent banner server component
- `src/components/layout/Header.tsx` - Sticky header with desktop/mobile nav
- `src/components/layout/Footer.tsx` - CTA footer with quick links
- `src/payload.config.ts` - Registered Officials, Meetings, Navigation, Homepage
- `src/payload-types.ts` - Regenerated with new collection/global types
- `src/app/(frontend)/layout.tsx` - Wired chrome components around children
- `src/app/(frontend)/styles.css` - Added print media styles

## Decisions Made
- Used `CollectionSlug[]` type for linkFields relationTo parameter for type safety
- Header is a client component (needs useState for mobile menu and dropdown interactions); Footer and UrgentBannerBar are server components
- Navigation data fetched server-side in layout and passed as serializable prop to Header to keep the data fetching on the server
- Print hiding uses `data-print-hide` HTML attribute rather than CSS classes for semantic clarity

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed CollectionSlug type mismatch in linkFields**
- **Found during:** Task 2 (TypeScript compilation)
- **Issue:** `relationTo` typed as `string[]` but Payload expects `CollectionSlug[]`
- **Fix:** Changed interface to use `CollectionSlug` import from payload
- **Files modified:** src/fields/link.ts
- **Verification:** `npx tsc --noEmit` passes cleanly
- **Committed in:** 2736b45 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor type fix necessary for TypeScript compilation. No scope creep.

## Issues Encountered
- Worktree was behind main branch; required `git merge main` to get existing code from phases 1 and 2
- Dependencies not installed in worktree; required `pnpm install` before type generation

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All layout chrome components ready; pages will render inside Header/Footer shell
- Officials and Meetings collections ready for content entry and page templates (Plan 02/03)
- Homepage global ready for hero spotlight and topic callout wiring (Plan 02)
- Navigation global ready for editors to configure menu items
- date-fns installed and ready for date formatting in content templates

## Self-Check: PASSED

All 11 created files verified present. All 3 task commit hashes verified in git log.

---
*Phase: 03-site-pages-navigation*
*Completed: 2026-03-24*
