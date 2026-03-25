# Phase 13: Quality Audit - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 13-quality-audit
**Areas discussed:** Audit tooling, Pass/fail criteria, Route coverage, Output format

---

## Audit Tooling

### Lighthouse Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Chrome DevTools MCP | Use chrome-devtools MCP lighthouse_audit tool. No new npm deps. | (combined) |
| @playwright/test + lighthouse npm | Add lighthouse as devDep, run inside Playwright tests. CI-friendly. | (combined) |
| Lighthouse CLI standalone | Run lighthouse CLI via bash as separate step. | |

**User's choice:** Both options 1 and 2 -- "belt and suspenders"
**Notes:** User wants maximum coverage with dual tooling approach.

### Accessibility Approach

| Option | Description | Selected |
|--------|-------------|----------|
| Chrome DevTools MCP | Use chrome-devtools snapshot/evaluate for DOM assertions. | (combined) |
| @axe-core/playwright | Add axe-core as Playwright plugin. Industry standard WCAG testing. | (combined) |
| Both | Chrome DevTools MCP + @axe-core/playwright. | |

**User's choice:** Both -- belt and suspenders
**Notes:** Consistent with Lighthouse decision -- dual tooling for maximum confidence.

### Existing E2E Tests

| Option | Description | Selected |
|--------|-------------|----------|
| Re-run all | Run existing 160 tests + new audit tests. Catches regressions. | |
| New audit tests only | Only run new Lighthouse/a11y audit tests. | |

**User's choice:** Re-run all (Recommended)

---

## Pass/Fail Criteria

### Lighthouse Thresholds

| Option | Description | Selected |
|--------|-------------|----------|
| 90+ all categories | Standard production-quality bar. | |
| 95+ a11y/SEO, 85+ perf | Stricter on a11y/SEO, lenient on performance. | |
| 80+ minimum, document gaps | Lower bar, document anything below 90. | |

**User's choice:** "95 min on all" -- 95+ on all four categories
**Notes:** User chose a stricter threshold than any presented option. Applies to Performance, Accessibility, Best Practices, and SEO equally.

### Axe-Core Violations

| Option | Description | Selected |
|--------|-------------|----------|
| Zero critical/serious | Fail on critical/serious, document minor/moderate. | |
| Zero all violations | Fail on any violation at any severity. Strictest. | |
| Document only | Run axe but don't fail -- just capture results. | |

**User's choice:** Zero all violations
**Notes:** Strictest possible standard. Every WCAG violation must be resolved regardless of severity.

---

## Route Coverage

### Routes to Audit

| Option | Description | Selected |
|--------|-------------|----------|
| All public routes | Homepage, /news, /news/[slug], /contact-officials, /meetings, /[slug]. Skip /admin. | |
| All public + admin login | All public routes plus admin login page. | |
| Homepage + key pages only | Just homepage, /news, /contact-officials, /meetings. | |

**User's choice:** All public + admin login
**Notes:** Verifies admin panel loads but doesn't audit internal Payload UI beyond login.

### Viewports

| Option | Description | Selected |
|--------|-------------|----------|
| All 5 viewports | 320, 375, 768, 1024, 1440. Matches existing Playwright config. | |
| Desktop + mobile only | Just 375 and 1440. Faster, covers extremes. | |

**User's choice:** All 5 viewports (Recommended)

---

## Output Format

### Reporting

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown + Playwright HTML | AUDIT-RESULTS.md summary + Playwright HTML report. | (combined) |
| Playwright HTML only | All results in standard Playwright report. | |
| JSON + markdown | Machine-readable JSON + human-readable markdown. | (combined) |

**User's choice:** "1 and 3" -- Markdown report + JSON + Playwright HTML
**Notes:** All three output formats for maximum utility.

### Future Polish Documentation

| Option | Description | Selected |
|--------|-------------|----------|
| In AUDIT-RESULTS.md | Include "Future Polish" section in audit results. | |
| Separate POLISH-BACKLOG.md | Standalone file for future improvements. | |
| No, just pass/fail | Only report pass/fail. | |

**User's choice:** Yes, in AUDIT-RESULTS.md (Recommended)

---

## Claude's Discretion

- Test file organization within e2e/ directory
- Lighthouse configuration options (throttling, form factor)
- Score variability handling (averaging, best-of-N)
- Order of operations for test execution

## Deferred Ideas

None -- discussion stayed within phase scope
