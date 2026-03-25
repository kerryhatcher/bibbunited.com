# Phase 13: Quality Audit - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Full automated re-review verifying all v1.1 fixes (Phases 9-12) and catching regressions. Produces Lighthouse, accessibility, and responsive audit results across all public routes at all 5 viewports. Documents remaining polish opportunities for future consideration. Delivers requirement QA-01.

</domain>

<decisions>
## Implementation Decisions

### Audit Tooling Strategy
- **D-01:** Belt-and-suspenders approach for Lighthouse: Chrome DevTools MCP `lighthouse_audit` tool for interactive audits + `lighthouse` npm package integrated into Playwright tests for CI-ready programmatic runs.
- **D-02:** Belt-and-suspenders approach for accessibility: Chrome DevTools MCP for DOM inspection + `@axe-core/playwright` for automated WCAG violation scanning with detailed rule-level reporting.
- **D-03:** Add `lighthouse` and `@axe-core/playwright` as devDependencies. These are audit-only tools, not runtime dependencies.
- **D-04:** Re-run all existing 160 Playwright e2e tests as part of this phase to catch regressions from v1.1 changes, in addition to new audit-specific tests.

### Pass/Fail Criteria
- **D-05:** Lighthouse threshold: 95+ on all four categories (Performance, Accessibility, Best Practices, SEO) for every audited route. No exceptions.
- **D-06:** Axe-core threshold: zero violations at any severity level (critical, serious, moderate, minor). Strictest standard — every WCAG issue must be resolved.
- **D-07:** All existing 160 Playwright e2e tests must pass (zero failures).

### Route Coverage
- **D-08:** Audit all public routes: homepage (`/`), news listing (`/news`), news article (`/news/[slug]`), contact officials (`/contact-officials`), meetings (`/meetings`), CMS pages (`/[slug]` e.g. About).
- **D-09:** Also audit admin login page (`/admin`) — verify it loads correctly. Do not audit internal Payload admin UI beyond the login page.
- **D-10:** Run all audits at all 5 viewports matching existing Playwright config: 320x568, 375x667, 768x1024, 1024x768, 1440x900.

### Output & Reporting
- **D-11:** Generate `AUDIT-RESULTS.md` markdown summary with scores per route per viewport, pass/fail status, and a "Future Polish" section documenting anything that could be improved beyond the 95+ threshold.
- **D-12:** Generate machine-readable JSON output from Lighthouse and axe-core for future CI pipeline integration.
- **D-13:** Standard Playwright HTML report captures full test execution details (screenshots, traces on failure).

### Claude's Discretion
- Test file organization within `e2e/` directory (new audit specs can be a separate `e2e/audit/` subdirectory or alongside existing tests)
- Lighthouse configuration options (throttling, categories to test, form factor settings)
- How to handle Lighthouse score variability (averaging multiple runs, taking best of N, etc.)
- Order of operations: whether to run regression suite first, then audits, or all together

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Original Review (source of v1.1 requirements)
- `UI-UX-REVIEW-2026-03-24.md` -- The 25-issue review that drove all v1.1 work. Audit should verify every issue marked as fixed.

### Requirements
- `REQUIREMENTS.md` -- QA-01 definition and full v1.1 requirement checklist with completion status

### Existing Test Infrastructure
- `playwright.config.ts` -- Current Playwright config with 5 viewports, base URL, webServer config
- `e2e/responsive/*.spec.ts` -- Existing 160 e2e tests to re-run for regression checking
- `e2e/helpers/assertions.ts` -- Shared assertion helpers

### Prior Phase Context (what was fixed)
- `.planning/phases/09-foundation-config/09-CONTEXT.md` -- Seed data, OG image, cache headers
- `.planning/phases/10-component-migration-visual-fixes/10-CONTEXT.md` -- next/link, next/image, footer contrast, keyboard trap
- `.planning/phases/11-accessibility-layout-ux-polish/11-CONTEXT.md` -- Skip link, H1, active nav, bylines, excerpts, empty states
- `.planning/phases/12-seo-metadata/12-CONTEXT.md` -- Title template, canonical URLs, OG tags, sitemap

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `playwright.config.ts`: 5-viewport project setup, can be extended for audit-specific projects
- `e2e/helpers/assertions.ts`: Shared assertion patterns for DOM checks
- `e2e/responsive/*.spec.ts`: 160 existing tests covering all page types at all viewports

### Established Patterns
- DOM assertions over pixel-diff testing (project-level decision)
- Playwright with chromium browser across 5 viewport projects
- Dev server via docker compose at localhost:3000
- Screenshots on by default, traces retained on failure

### Integration Points
- Chrome DevTools MCP available for lighthouse_audit and DOM evaluation
- Playwright webServer config points to `npm run dev` but actual dev runs via docker compose
- New audit tests integrate into existing `e2e/` directory structure

</code_context>

<specifics>
## Specific Ideas

- User wants the strictest possible quality bar: 95+ Lighthouse across all categories, zero axe violations at any severity
- Belt-and-suspenders philosophy: dual tooling (MCP + npm packages) for both Lighthouse and accessibility
- Admin login page included in audit scope (but not internal Payload admin UI)
- AUDIT-RESULTS.md should include "Future Polish" section for items beyond the strict pass/fail criteria

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 13-quality-audit*
*Context gathered: 2026-03-25*
