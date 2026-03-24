# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

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

### Cumulative Quality

| Milestone | Tests | Requirements | Audit Score |
|-----------|-------|-------------|-------------|
| v1.0 | 160 | 26/26 | 78/78 must-haves |

### Top Lessons (Verified Across Milestones)

1. Milestone audits catch gaps that phase-level verification misses -- always audit before shipping
2. Seed data is infrastructure, not an afterthought -- include in first phase next time
