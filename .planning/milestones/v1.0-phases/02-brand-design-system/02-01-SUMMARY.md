---
phase: 02-brand-design-system
plan: 01
subsystem: ui
tags: [tailwindcss, postcss, design-tokens, css-variables, next-font, payload-global]

# Dependency graph
requires:
  - phase: 01-cms-foundation
    provides: Payload CMS globals pattern (UrgentBanner), payload.config.ts, frontend layout
provides:
  - Tailwind v4 CSS-first theme with @theme tokens for brand colors, fonts, spacing
  - CSS variable indirection for community/urgent mode switching
  - SiteTheme Payload Global for editorial mode control
  - Barlow Condensed 700 and Inter font loading via next/font
  - Global heading typography rules (h1/h2 uppercase per D-08)
  - Prose typography overrides with brand colors
affects: [02-02, 03-01, 03-02, 03-03]

# Tech tracking
tech-stack:
  added: [tailwindcss 4.2.2, "@tailwindcss/postcss 4.2.2", "@tailwindcss/typography 0.5.19", lucide-react 1.0.1]
  patterns: [CSS-first Tailwind config via @theme, CSS variable indirection for mode switching, next/font with CSS variable output]

key-files:
  created:
    - postcss.config.mjs
    - src/globals/SiteTheme.ts
    - src/lib/getTheme.ts
  modified:
    - package.json
    - pnpm-lock.yaml
    - src/app/(frontend)/styles.css
    - src/app/(frontend)/layout.tsx
    - src/payload.config.ts

key-decisions:
  - "Tailwind v4 CSS-first config with @theme block instead of JS config file"
  - "CSS variable indirection pattern: :root and [data-mode=urgent] set --brand-* vars, @theme maps them to --color-* tokens"
  - "Barlow Condensed loaded with explicit weight: 700 (not a variable font)"
  - "SiteTheme Global uses select field with community/urgent options, defaulting to community"

patterns-established:
  - "CSS variable indirection: brand vars in :root/[data-mode], Tailwind tokens reference them via var()"
  - "Font loading: next/font/google with variable prop, referenced in @theme via var(--font-*)"
  - "Payload Global pattern: GlobalConfig with slug, admin description, public read access"
  - "Theme fetching: getThemeMode() async helper using payload.findGlobal()"

requirements-completed: [DSGN-01, DSGN-02, DSGN-05]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 2 Plan 1: Design Tokens & Theme Foundation Summary

**Tailwind v4 CSS-first design tokens with dual-mode color switching (community/urgent), Barlow Condensed + Inter font loading, and SiteTheme Payload Global for editorial mode control**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T07:30:52Z
- **Completed:** 2026-03-24T07:32:53Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Installed Tailwind v4 with @tailwindcss/postcss, typography plugin, and lucide-react
- Defined complete brand color palette for both community (light) and urgent (dark) modes via CSS variable indirection
- Created SiteTheme Payload Global allowing editors to switch between community and urgent visual modes
- Loaded Barlow Condensed 700 (headings) and Inter (body) via next/font with zero external runtime requests
- Enforced global h1/h2 uppercase typography per D-08 design spec
- Configured prose overrides for CMS rich text content with brand colors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Tailwind v4 dependencies and create PostCSS config** - `693d2ce` (chore)
2. **Task 2: Create brand design tokens, SiteTheme Global, font loading, and layout wiring** - `2291113` (feat)

## Files Created/Modified
- `postcss.config.mjs` - PostCSS config with @tailwindcss/postcss plugin
- `package.json` - Added tailwindcss, @tailwindcss/postcss, @tailwindcss/typography, lucide-react
- `src/app/(frontend)/styles.css` - Tailwind v4 @theme tokens, CSS variable mode switching, base typography, prose overrides
- `src/app/(frontend)/layout.tsx` - Font loading via next/font, theme mode fetch, data-mode attribute on body
- `src/globals/SiteTheme.ts` - Payload Global for editorial mode switching (community/urgent)
- `src/lib/getTheme.ts` - Helper to fetch current theme mode from Payload
- `src/payload.config.ts` - Registered SiteTheme global alongside UrgentBanner

## Decisions Made
- Used Tailwind v4 CSS-first config with @theme block (no tailwind.config.js) per project stack requirements
- Implemented CSS variable indirection pattern: :root and [data-mode="urgent"] define --brand-* variables, @theme maps them to --color-* Tailwind tokens for seamless mode switching
- Barlow Condensed loaded with explicit weight: '700' since it is not a variable font (Research Pitfall 2)
- SiteTheme Global defaults to 'community' mode; editors switch to 'urgent' for high-priority periods

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All design tokens, fonts, and theme infrastructure ready for Plan 02-02 (UI components)
- Components can reference `bg-bg-dominant`, `text-accent`, `font-heading` etc. via Tailwind utility classes
- Mode switching works via data-mode attribute on body element, controlled by CMS

## Self-Check: PASSED

All 6 created/modified source files verified present. Both task commits (693d2ce, 2291113) verified in git log. SUMMARY.md exists.

---
*Phase: 02-brand-design-system*
*Completed: 2026-03-24*
