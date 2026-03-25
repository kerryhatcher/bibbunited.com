---
phase: 10-component-migration-visual-fixes
plan: 01
subsystem: ui
tags: [next-link, next-image, avif, webp, client-side-navigation, image-optimization, lcp]

requires:
  - phase: 09-foundation-config
    provides: "CMS collections, navigation, media uploads, seed data"
provides:
  - "All internal links use next/link for SPA client-side navigation"
  - "All images use next/image with AVIF/WebP format optimization"
  - "Hero image preloaded with priority for LCP"
  - "next.config.ts image format configuration"
affects: [10-02-visual-fixes, 12-seo-meta-final-audit]

tech-stack:
  added: []
  patterns:
    - "Internal link heuristic: href.startsWith('/') -> Link, else -> <a> with target=_blank"
    - "Image fill mode with responsive sizes for variable-width containers"
    - "Image fixed width/height for known-dimension thumbnails and avatars"
    - "priority={index === 0} pattern for carousel hero LCP optimization"

key-files:
  created: []
  modified:
    - next.config.ts
    - src/components/ui/Button.tsx
    - src/components/ui/Card.tsx
    - src/components/layout/Header.tsx
    - src/components/layout/Footer.tsx
    - src/components/layout/UrgentBannerBar.tsx
    - src/components/homepage/HeroSpotlight.tsx
    - src/components/homepage/LatestNews.tsx
    - src/app/(frontend)/news/[slug]/page.tsx
    - src/app/(frontend)/contact-officials/page.tsx

key-decisions:
  - "Internal/external link detection uses href.startsWith('/') heuristic -- simple, sufficient for this project"
  - "Hero carousel only first slide gets priority={true} -- others lazy-load for performance"
  - "Thumbnails use fixed width/height (64x64, 80x80) instead of fill mode -- known dimensions"
  - "No remotePatterns needed in next.config.ts -- all images are same-origin"

patterns-established:
  - "Link heuristic: all components use href.startsWith('/') to decide Link vs <a>"
  - "Image fill pattern: parent must have relative + aspect-ratio, Image gets fill + sizes"
  - "Image fixed pattern: use width/height props for known-dimension thumbnails"

requirements-completed: [COMP-01, COMP-02]

duration: 5min
completed: 2026-03-25
---

# Phase 10 Plan 01: Component Migration (next/link + next/image) Summary

**Migrated all internal <a> tags to next/link for SPA navigation and all <img> tags to next/image with AVIF/WebP format optimization across 10 files**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-25T01:20:34Z
- **Completed:** 2026-03-25T01:26:23Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- All internal links across 7 component files migrated to next/link -- eliminates full page reloads on navigation
- All images across 5 files migrated to next/image with fill mode or fixed dimensions -- serves AVIF/WebP automatically
- Hero carousel first slide uses priority loading for fastest LCP
- next.config.ts configured with AVIF/WebP format optimization
- Production build passes with zero errors after all migrations

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate all internal links to next/link and configure image formats** - `733a9f8` (feat)
2. **Task 2: Migrate all images to next/image with fill mode and responsive sizes** - `ccd3455` (feat)
3. **Task 3: Build verification** - no commit (verification only, no file changes)

## Files Created/Modified

- `next.config.ts` - Added images.formats config for AVIF/WebP optimization
- `src/components/ui/Button.tsx` - Conditional Link for internal paths, <a> for external
- `src/components/ui/Card.tsx` - Link wrapper + Image fill with responsive sizes
- `src/components/layout/Header.tsx` - Link for logo, renderLink, all desktop/mobile dropdown children
- `src/components/layout/Footer.tsx` - All 4 nav links migrated to Link
- `src/components/layout/UrgentBannerBar.tsx` - Conditional Link/a for banner links
- `src/components/homepage/HeroSpotlight.tsx` - Image fill with priority on first slide, Link for title
- `src/components/homepage/LatestNews.tsx` - Image fixed 64x64 for thumbnails, Link for sidebar items
- `src/app/(frontend)/news/[slug]/page.tsx` - Image fill with sizes=100vw for featured image
- `src/app/(frontend)/contact-officials/page.tsx` - Image fixed 80x80 for official photos

## Decisions Made

- Used `href.startsWith('/')` as the internal/external link heuristic -- covers all routes in this project
- Hero carousel: only index === 0 gets `priority={true}` -- other slides lazy-load by default
- Thumbnails (64x64) and official photos (80x80) use fixed width/height instead of fill mode
- No `remotePatterns` in next.config.ts -- all images served from same origin

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Link migration for HeroSpotlight title links**
- **Found during:** Task 2 (image migration)
- **Issue:** HeroSpotlight had `<a href="/news/...">` title links that were not listed in Task 1's scope
- **Fix:** Added `import Link from 'next/link'` and replaced title `<a>` with `<Link>` in HeroSpotlight.tsx
- **Files modified:** src/components/homepage/HeroSpotlight.tsx
- **Verification:** grep confirms no raw `<a href="/` in HeroSpotlight.tsx
- **Committed in:** ccd3455 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for completeness -- hero title links were the only remaining internal `<a>` tags.

## Issues Encountered

- Docker compose dev file only defines a db service (no nextjs container) -- build ran directly via `pnpm build` instead of `docker compose exec`. Not a regression, just a plan assumption mismatch.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All next/link and next/image migrations complete -- ready for Plan 02 (visual fixes)
- Build verified clean with zero TypeScript errors
- No stubs or placeholder content introduced

## Self-Check: PASSED

All 10 modified files verified present. Both task commits (733a9f8, ccd3455) verified in git log. Build exit code 0 confirmed.

---
*Phase: 10-component-migration-visual-fixes*
*Completed: 2026-03-25*
