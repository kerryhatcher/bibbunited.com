---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Production Polish
status: Phase complete — ready for verification
stopped_at: Completed 14-01-PLAN.md
last_updated: "2026-03-25T18:30:08.468Z"
last_activity: 2026-03-25
progress:
  total_phases: 6
  completed_phases: 6
  total_plans: 14
  completed_plans: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-24)

**Core value:** Community members can find clear, actionable information about their local school system and know exactly what to do about it.
**Current focus:** Phase 14 — navigation-url-fix-doc-drift

## Current Position

Phase: 14 (navigation-url-fix-doc-drift) — EXECUTING
Plan: 1 of 1

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.1 Roadmap]: Sequence fixes by dependency chain, not severity -- foundation first, QA last
- [v1.1 Roadmap]: next/link and next/image migrations each done as single coordinated batch (Phase 10)
- [v1.1 Roadmap]: displayName DB migration in Phase 9 before byline code change in Phase 11
- [Phase 09]: displayName field optional -- byline falls back to BIBB United Staff
- [Phase 09]: Cache headers on /media and /api/media only -- Next.js handles /_next/static automatically
- [Phase 09]: OG image uploaded as Payload media item -- layout.tsx /og-default.png remains fallback until Phase 12
- [Phase 09]: Navigation uses external type with URL for collection listing routes (/news, /officials, /meetings)
- [Phase 10]: Internal/external link detection uses href.startsWith('/') heuristic
- [Phase 10]: Hero carousel only first slide gets priority={true} for LCP optimization
- [Phase 10]: Used native inert attribute (React 19) for mobile panel accessibility instead of manual aria-hidden
- [Phase 10]: Co-located useFocusTrap hook in Header.tsx -- single consumer, extract later if reused
- [Phase 11]: Named isActiveLink to avoid collision with useFocusTrap isActive parameter
- [Phase 11]: Extracted FooterCTA as client component to keep Footer as server component
- [Phase 12]: Native App Router sitemap.ts/robots.ts replace next-sitemap -- eliminates ESM/CJS compatibility issue and postbuild step
- [Phase 12]: Homepage uses title.absolute to bypass layout template suffix
- [Phase 12]: OG image fallback chain: page SEO image -> featured image -> SiteTheme ogDefaultImage -> /og-default.png
- [Phase 13]: Used lighthouse@13 with playwright-lighthouse@4 for Node 22 compatibility
- [Phase 13]: Refactored lighthouse spec to use direct API for score capture instead of playAudit
- [Phase 13]: Footer color contrast identified as single root cause for all axe-core failures
- [Phase 13]: Logo variant prop (default|footer) controls UNITED text color per dark/light context
- [Phase 13-quality-audit]: News article meta description fallback uses post.title + brand suffix, matching CMS page pattern
- [Phase 14]: Data-only fix: corrected seed URL, did not modify Header.tsx or add redirects

### Roadmap Evolution

- Phases 5-8 added during v1.0 via audit-driven gap closure
- Phases 9-13 added for v1.1 Production Polish milestone

### Pending Todos

None.

### Blockers/Concerns

- [Phase 10]: Turbopack/webpack build conflict -- verify `pnpm build` succeeds before component changes
- [Phase 10]: next/image CLS regression risk -- audit parent `position: relative` for every `<Image fill>`
- [Phase 12]: next-sitemap `additionalPaths` ESM/CJS compatibility -- may need App Router `sitemap.ts` fallback
- [Phase 11]: pt-16 was removed -- sticky header reserves flow space, pt-16 was causing a visible gap (resolved in quick-260325-jc8)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260324-koh | Fix postbuild script to use next-sitemap --config next-sitemap.config.cjs | 2026-03-24 | 4956e61 | [260324-koh-fix-postbuild-script-to-use-next-sitemap](./quick/260324-koh-fix-postbuild-script-to-use-next-sitemap/) |
| 260324-u4b | Add Next.js app service to docker-compose.dev.yml for single-command dev startup | 2026-03-25 | 765ad69 | [260324-u4b-update-the-docker-compose-setup-so-that-](./quick/260324-u4b-update-the-docker-compose-setup-so-that-/) |
| 260324-vt1 | Make header background solid white instead of theme-dependent | 2026-03-25 | 7bddf40 | [260324-vt1-make-the-top-menu-solid-white-instead-of](./quick/260324-vt1-make-the-top-menu-solid-white-instead-of/) |
| 260324-vxb | Fix footer text contrast - text-white instead of text-text-on-dark | 2026-03-25 | b31e6b0 | [260324-vxb-fix-footer-text-contrast-text-nearly-unr](./quick/260324-vxb-fix-footer-text-contrast-text-nearly-unr/) |
| 260324-wer | Fix header broken in dark theme - restore bg-bg-dominant | 2026-03-25 | 1b1bf3a | [260324-wer-fix-header-broken-in-dark-theme-restore-](./quick/260324-wer-fix-header-broken-in-dark-theme-restore-/) |
| 260324-wou | Dark mode header background matches footer navy | 2026-03-25 | 58e6e0d | [260324-wou-dark-mode-header-background-matches-foot](./quick/260324-wou-dark-mode-header-background-matches-foot/) |
| 260325-jc8 | Remove gap between hero image and top menu | 2026-03-25 | d4b49a6 | [260325-jc8-remove-the-gap-between-the-hero-img-and-](./quick/260325-jc8-remove-the-gap-between-the-hero-img-and-/) |

## Session Continuity

Last activity: 2026-03-25
Stopped at: Completed 14-01-PLAN.md
Resume file: None
