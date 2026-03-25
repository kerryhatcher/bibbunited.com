# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.1 -- Production Polish

**Shipped:** 2026-03-25
**Phases:** 6 | **Plans:** 14 | **Timeline:** 1 day (2026-03-25)

### What Was Built
- Foundation hardening: displayName DB migration, complete seed overhaul with 6 distinct labeled images, branded OG image, populated Navigation/Homepage/Officials/Meetings globals
- Component migration: all internal links to next/link (SPA navigation), all images to next/image (AVIF/WebP optimization with LCP priority)
- WCAG 2.1 AA accessibility: skip-to-content link, sr-only H1, footer focus rings, mobile panel inert attribute, keyboard focus trap
- UX polish: active nav indicators with aria-current, article bylines with displayName, news card excerpts via Lexical text extraction, actionable empty states, conditional footer CTA
- SEO completeness: shared generatePageMeta helper, canonical URLs, complete OG tags with 4-level fallback chain, native sitemap.ts/robots.ts
- Quality audit: Lighthouse 100/100/100/100 on all routes, zero axe-core violations, 61 automated audit tests

### What Worked
- **Dependency-ordered phase sequencing:** Foundation (Phase 9) before components (10) before a11y/UX (11) before SEO (12) before audit (13) -- each phase built cleanly on the previous
- **Milestone audit before shipping:** Running `/gsd:audit-milestone` caught the seed URL mismatch (VIS-02/UX-02) and documentation drift that phase-level verification missed -- Phase 14 closed all gaps surgically
- **Native App Router sitemap.ts:** Replacing next-sitemap eliminated the ESM/CJS compatibility headache and postbuild step entirely
- **Automated quality baseline:** 61 Lighthouse + axe-core tests across all routes at all viewports creates a regression safety net for future changes
- **React 19 inert attribute:** Native `inert` replaced manual aria-hidden management for the mobile panel -- cleaner, more reliable

### What Was Inefficient
- **Documentation drift accumulated across phases:** REQUIREMENTS.md checkboxes, ROADMAP.md plan checkboxes, and SUMMARY frontmatter all fell out of sync during phases 9-12, requiring dedicated fix passes
- **Footer contrast fixed twice:** Originally fixed in v1.0 Phase 8, then the audit revealed it regressed or was incomplete -- needed re-fixing in Phase 13
- **Audit gap closure required extra phase:** Phase 14 was created just to fix a seed URL typo and doc drift -- could have been caught earlier with a seed URL validation step

### Patterns Established
- **generatePageMeta helper:** Single shared function for all page metadata with consistent title template, canonical URLs, and OG tag generation
- **4-level OG image fallback:** page SEO image -> featured image -> SiteTheme ogDefaultImage -> /og-default.png
- **Lexical text extraction for excerpts:** `getExcerpt()` utility extracts plain text from Lexical JSON for news card summaries
- **Logo variant prop:** `variant="default"|"footer"` controls UNITED text color per dark/light context
- **FooterCTA as client component:** Extracted to keep Footer as server component while enabling pathname-based conditional rendering

### Key Lessons
1. **Automate documentation sync.** Checkbox drift across REQUIREMENTS.md, ROADMAP.md, and SUMMARY frontmatter happened in both milestones. This needs tooling, not discipline.
2. **Validate seed data against routes.** The `/officials` vs `/contact-officials` mismatch was a simple typo that broke navigation. A seed validation step comparing URLs to actual routes would catch this instantly.
3. **Run audit early, not just at the end.** Phase 13's audit found issues that were easy to fix but would have been easier to prevent. Consider a mid-milestone checkpoint.
4. **Component migrations are batch operations.** Doing all next/link and next/image migrations in a single phase (10) was the right call -- avoided scattered changes across phases.

### Cost Observations
- Model mix: Primarily Opus with quality profile
- Sessions: ~5 sessions in 1 day
- Notable: Phase 14 (gap closure) completed in minutes -- single seed data fix plus doc updates

---

## Milestone: v1.0 -- MVP

**Shipped:** 2026-03-24
**Phases:** 8 | **Plans:** 18 | **Timeline:** 2 days (2026-03-23 to 2026-03-24)

### What Was Built
- Full CMS editorial platform with Payload 3.x, Lexical rich text editor, Pages/NewsPosts collections, draft/publish workflow, and site-wide urgent banner
- Bold activist design system with Tailwind v4 CSS-first tokens, dual-mode color switching (community/urgent), Barlow Condensed + Inter typography
- Complete public-facing site: CMS-managed navigation, homepage with hero spotlight, latest news, Contact Officials, Meeting Schedule, news listing
- Production deployment pipeline: Docker multi-stage build, K8s manifests, Traefik IngressRoute, GitHub Actions CI/CD to GHCR
- 160 Playwright e2e tests across 5 viewports with seed data for full coverage

### What Worked
- **Coarse-grained GSD phases:** 4 original phases covered the entire MVP scope cleanly; audit-driven gap phases (5-8) were surgical and efficient
- **Audit-driven quality loop:** Running `/gsd:audit-milestone` after Phase 4 caught 15 requirement gaps and 4 integration issues before declaring done -- resulted in 4 targeted fix phases instead of a messy rework
- **CMS-managed everything:** Navigation, officials, meetings, and urgent banner all editable from Payload admin -- zero frontend changes needed for content updates
- **Tailwind v4 CSS-first approach:** @theme block with CSS variable indirection made dual-mode switching trivial; no JavaScript theme provider needed
- **DOM assertions over pixel-diff:** Playwright tests use structural assertions (overflow, clipping, element presence) instead of screenshot comparison -- stable despite CMS content changes

### What Was Inefficient
- **ROADMAP.md plan checkboxes drifted:** The roadmap's plan completion checkboxes fell out of sync with actual SUMMARY.md status, requiring Phase 7 to fix documentation
- **SUMMARY.md frontmatter gaps:** Several phase summaries had incomplete `requirements_completed` fields, only caught by audit -- should be enforced during plan completion
- **Tech debt accumulated silently:** Footer contrast, staticDir fragility, and missing seed data were all minor issues that individually seemed fine but collectively needed a cleanup phase

### Patterns Established
- **3-source requirement verification:** REQUIREMENTS.md checkbox + VERIFICATION.md + SUMMARY.md frontmatter creates a reliable cross-reference
- **Seed script for test data:** `src/seed.ts` enables reproducible test runs without manual CMS setup
- **Print hiding via `data-print-hide`:** Consistent attribute convention across all components
- **Server Components by default:** Only Header and DateDisplay are client components; everything else renders on the server
- **JSON-LD via React.createElement:** Structured data rendered as script tags with XSS unicode escaping

### Key Lessons
1. **Run milestone audit before declaring done.** The audit caught issues that would have been embarrassing in a shipped product. Build audit into the workflow, not as an afterthought.
2. **Frontmatter validation should be automated.** Manual cross-referencing of requirement IDs across SUMMARY/VERIFICATION/REQUIREMENTS files is error-prone. Future milestones should automate this check.
3. **Dual-mode design needs testing early.** The community/urgent mode switching worked well but wasn't tested at all viewports until Phase 6. Test both modes from the start.
4. **Small editorial teams need seed data.** Without seed data, new environments start empty and editors can't see how the site looks with real content. The seed script should be part of Phase 1 next time.

### Cost Observations
- Model mix: Primarily Opus with quality profile
- Sessions: ~10 sessions across 2 days
- Notable: Phases 5-8 (gap closure) were fast -- averaging 1-3 minutes per plan because the codebase was well-understood by that point

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 2 days | 8 | Audit-driven gap phases proved highly effective for quality |
| v1.1 | 1 day | 6 | Dependency-ordered sequencing + automated quality baseline |

### Cumulative Quality

| Milestone | Tests | Requirements | Audit Score |
|-----------|-------|-------------|-------------|
| v1.0 | 160 | 26/26 | 78/78 must-haves |
| v1.1 | 221 | 52/52 cumulative | Lighthouse 100/100/100/100, zero a11y violations |

### Top Lessons (Verified Across Milestones)

1. Milestone audits catch gaps that phase-level verification misses -- always audit before shipping (confirmed v1.0, v1.1)
2. Seed data is infrastructure, not an afterthought -- include in first phase next time (confirmed v1.0, validated in v1.1 with full seed rewrite)
3. Documentation sync needs automation, not discipline -- checkbox/frontmatter drift happened in both milestones
4. Batch operations (component migrations, doc fixes) are more efficient than scattered changes across phases (new in v1.1)
