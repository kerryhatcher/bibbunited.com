# Phase 13: Quality Audit - Research

**Researched:** 2026-03-25
**Domain:** Automated web quality auditing (Lighthouse, axe-core, Playwright)
**Confidence:** HIGH

## Summary

Phase 13 is a verification-only phase. No application code changes -- the goal is to run comprehensive automated audits across all public routes at all 5 viewports, confirm all v1.1 fixes hold, catch regressions, and document remaining polish opportunities. The tooling decisions are locked: `playwright-lighthouse` for Lighthouse integration + `@axe-core/playwright` for accessibility scanning, both running within the existing Playwright test infrastructure.

The existing Playwright setup (5 viewport projects, chromium, HTML reporter, screenshots on, traces on failure) provides the foundation. New audit test specs will extend this with Lighthouse score assertions and axe-core zero-violation checks. The 160 existing regression tests run first to confirm nothing broke, then audit specs run per-route per-viewport.

**Primary recommendation:** Use `playwright-lighthouse` (v4.0.0) for Lighthouse integration -- it handles the Chrome remote debugging port coordination that raw Lighthouse requires. Use `@axe-core/playwright` (v4.11.1) directly with AxeBuilder for axe-core scans. Both integrate cleanly with existing `@playwright/test` (v1.58.2). Output JSON results alongside the markdown summary.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Belt-and-suspenders for Lighthouse: Chrome DevTools MCP `lighthouse_audit` tool for interactive audits + `lighthouse` npm package integrated into Playwright tests for CI-ready programmatic runs
- D-02: Belt-and-suspenders for accessibility: Chrome DevTools MCP for DOM inspection + `@axe-core/playwright` for automated WCAG violation scanning
- D-03: Add `lighthouse` and `@axe-core/playwright` as devDependencies
- D-04: Re-run all existing 160 Playwright e2e tests as regression check
- D-05: Lighthouse threshold: 95+ on all four categories for every audited route
- D-06: Axe-core threshold: zero violations at any severity level
- D-07: All existing 160 Playwright e2e tests must pass (zero failures)
- D-08: Audit routes: `/`, `/news`, `/news/[slug]`, `/contact-officials`, `/meetings`, `/[slug]` (About)
- D-09: Audit admin login page `/admin` -- verify it loads correctly only
- D-10: All audits at all 5 viewports: 320x568, 375x667, 768x1024, 1024x768, 1440x900
- D-11: Generate `AUDIT-RESULTS.md` markdown summary with scores, pass/fail, and "Future Polish" section
- D-12: Generate machine-readable JSON output from Lighthouse and axe-core
- D-13: Standard Playwright HTML report captures full test execution details

### Claude's Discretion
- Test file organization within `e2e/` directory
- Lighthouse configuration options (throttling, categories, form factor)
- Lighthouse score variability handling (averaging runs, best of N)
- Order of operations (regression first vs. all together)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QA-01 | Full automated re-review (Lighthouse, visual, accessibility, responsive, SEO) verifies all fixes and identifies remaining polish opportunities | playwright-lighthouse for Lighthouse scores, @axe-core/playwright for accessibility, existing 160 Playwright tests for regression, JSON + markdown output for documentation |

</phase_requirements>

## Standard Stack

### Core (New Dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| playwright-lighthouse | 4.0.0 | Lighthouse integration with Playwright | Handles Chrome remote debugging port coordination automatically; provides `playAudit()` with threshold assertions; works with existing @playwright/test fixtures |
| @axe-core/playwright | 4.11.1 | Automated WCAG accessibility scanning | Official Deque integration for Playwright; AxeBuilder API chains with `.withTags()`, `.exclude()`, `.analyze()`; returns structured violation objects with impact levels |
| lighthouse | 13.0.3 | Lighthouse engine (peer dependency) | Required by playwright-lighthouse; also used directly by Chrome DevTools MCP |

### Existing (Already Installed)

| Library | Version | Purpose |
|---------|---------|---------|
| @playwright/test | 1.58.2 | Test runner, browser automation, HTML reporter |
| chromium (via Playwright) | bundled | Browser engine for all audits |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| playwright-lighthouse | Raw `lighthouse` + `chrome-launcher` | More control but requires manual CDP port management and custom fixtures -- unnecessary complexity for this use case |
| @axe-core/playwright | pa11y | axe-core is the industry standard with better Playwright integration and more granular rule control |

**Installation:**
```bash
pnpm add -D playwright-lighthouse lighthouse @axe-core/playwright
```

## Architecture Patterns

### Recommended Test File Organization

```
e2e/
  audit/
    lighthouse.spec.ts       # Lighthouse audits for all routes x viewports
    accessibility.spec.ts    # Axe-core scans for all routes x viewports
    admin-login.spec.ts      # Admin page load verification
  helpers/
    assertions.ts            # Existing shared helpers
    audit-helpers.ts         # New: Lighthouse/axe result collection + JSON output
  responsive/
    *.spec.ts                # Existing 160 regression tests (unchanged)
  screenshots/               # Existing screenshot output
```

### Pattern 1: playwright-lighthouse Integration with Custom Fixture

**What:** Create a custom Playwright test fixture that launches Chromium with `--remote-debugging-port` and provides `playAudit` to each test.

**When to use:** Every Lighthouse audit test.

**Example:**
```typescript
// e2e/audit/lighthouse.spec.ts
import { chromium } from 'playwright';
import { test as base, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { lighthouseDesktopConfig } from 'lighthouse/core/config/lr-desktop-config.js';

// Custom fixture that manages the remote debugging port
const test = base.extend<{}, { port: number; browser: any }>({
  port: [async ({}, use) => {
    // Use a fixed port per worker to avoid conflicts
    const port = 9222 + (test.info().parallelIndex ?? 0);
    await use(port);
  }, { scope: 'worker' }],
  browser: [async ({ port }, use) => {
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`],
    });
    await use(browser);
    await browser.close();
  }, { scope: 'worker' }],
});

const ROUTES = ['/', '/news', '/contact-officials', '/meetings'];
const THRESHOLDS = {
  performance: 95,
  accessibility: 95,
  'best-practices': 95,
  seo: 95,
};

for (const route of ROUTES) {
  test(`Lighthouse audit: ${route}`, async ({ browser, port }) => {
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000${route}`);
    await page.waitForLoadState('networkidle');

    const result = await playAudit({
      page,
      port,
      thresholds: THRESHOLDS,
    });

    await page.close();
  });
}
```

### Pattern 2: @axe-core/playwright Zero-Violation Check

**What:** Run AxeBuilder on each route, assert zero violations, collect structured results.

**When to use:** Every accessibility audit test.

**Example:**
```typescript
// e2e/audit/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';

const ROUTES = ['/', '/news', '/contact-officials', '/meetings'];

for (const route of ROUTES) {
  test(`Axe accessibility: ${route}`, async ({ page }, testInfo) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Write JSON results for machine-readable output
    const filename = `axe-${route.replace(/\//g, '_') || 'home'}-${testInfo.project.name}.json`;
    fs.writeFileSync(
      `e2e/audit/results/${filename}`,
      JSON.stringify(results, null, 2)
    );

    // Zero violations at any severity (D-06)
    expect(
      results.violations,
      `Axe violations on ${route} at ${testInfo.project.name}`
    ).toEqual([]);
  });
}
```

### Pattern 3: Score Collection and Markdown Report Generation

**What:** Collect all Lighthouse scores and axe results into a summary report.

**When to use:** After all audit tests complete.

**Example:**
```typescript
// e2e/helpers/audit-helpers.ts
export interface AuditScore {
  route: string;
  viewport: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  axeViolations: number;
  pass: boolean;
}

export function generateAuditMarkdown(scores: AuditScore[]): string {
  let md = '# AUDIT-RESULTS.md\n\n';
  md += `**Date:** ${new Date().toISOString().split('T')[0]}\n`;
  md += `**Threshold:** 95+ Lighthouse, 0 axe violations\n\n`;
  md += '## Scores by Route\n\n';
  md += '| Route | Viewport | Perf | A11y | BP | SEO | Axe | Pass |\n';
  md += '|-------|----------|------|------|----|-----|-----|------|\n';
  for (const s of scores) {
    const pass = s.pass ? 'PASS' : 'FAIL';
    md += `| ${s.route} | ${s.viewport} | ${s.performance} | ${s.accessibility} | ${s.bestPractices} | ${s.seo} | ${s.axeViolations} | ${pass} |\n`;
  }
  return md;
}
```

### Anti-Patterns to Avoid

- **Running Lighthouse with default mobile throttling on localhost:** Lighthouse's default mobile simulation throttles CPU 4x and adds network latency, producing artificially low performance scores on a local dev server. Use `throttling: { rttMs: 0, throughputKbps: 0, cpuSlowdownMultiplier: 1 }` for consistent local results, or use the desktop config.
- **Running all Lighthouse audits in parallel:** Lighthouse is resource-intensive. Running multiple audits simultaneously on the same machine produces unreliable scores. Run sequentially or limit parallelism to 1 worker for audit specs.
- **Asserting exact Lighthouse scores:** Lighthouse scores fluctuate by 3-5 points between runs due to timing variability. Assert >= threshold, not exact values. For borderline cases, run 3 times and take the median.
- **Including Payload admin UI in axe-core scans:** The Payload admin panel renders its own React app with its own accessibility characteristics. Scanning it produces noise unrelated to the BIBB United codebase. Only verify `/admin` loads (D-09).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lighthouse integration with Playwright | Custom CDP port management + raw lighthouse() calls | `playwright-lighthouse` `playAudit()` | Port coordination, page lifecycle, and result extraction are handled automatically |
| WCAG violation scanning | Custom DOM checks for contrast, ARIA, etc. | `@axe-core/playwright` AxeBuilder | axe-core has 90+ rules covering WCAG 2.0/2.1 A/AA, maintained by accessibility experts at Deque |
| Score variability handling | Custom retry + averaging logic | Run 3x with median selection in a helper function | Simple approach, well-understood in the Lighthouse community |

**Key insight:** Quality auditing tools are mature and well-integrated with Playwright. The value is in configuration and threshold decisions, not custom tooling.

## Common Pitfalls

### Pitfall 1: Lighthouse Score Variability Between Runs
**What goes wrong:** Same page scores 97 on one run, 91 on the next. Tests become flaky.
**Why it happens:** Lighthouse simulates network and CPU conditions; minor timing differences cause score fluctuations, especially for Performance.
**How to avoid:** Run each Lighthouse audit 3 times, take the median. Set threshold at 95 (not 100) to account for natural variance. Disable throttling for local dev testing or use consistent desktop config.
**Warning signs:** Intermittent failures on Performance category only.

### Pitfall 2: playwright-lighthouse Port Conflicts
**What goes wrong:** `Error: listen EADDRINUSE :::9222` when running tests.
**Why it happens:** Multiple Playwright workers try to launch Chrome on the same debugging port.
**How to avoid:** Use worker-scoped fixtures with unique ports per worker (e.g., `9222 + parallelIndex`). Or run audit specs with `workers: 1` in a dedicated Playwright project.
**Warning signs:** Tests fail on startup, not during assertions.

### Pitfall 3: Axe-Core False Positives on Dynamic Content
**What goes wrong:** Axe reports violations on elements that are mid-animation or loading.
**Why it happens:** Scanning before page is fully rendered catches transient states.
**How to avoid:** Always `waitForLoadState('networkidle')` before running AxeBuilder. For pages with client-side hydration, add a short wait or check for a specific element.
**Warning signs:** Violations mentioning `color-contrast` on elements that look fine visually.

### Pitfall 4: Lighthouse Requires Remote Debugging Port (Not Default Playwright Browser)
**What goes wrong:** `playAudit()` fails because the browser wasn't launched with `--remote-debugging-port`.
**Why it happens:** Playwright's default browser launch doesn't expose CDP. playwright-lighthouse needs it to connect Lighthouse to the running Chrome instance.
**How to avoid:** Use a custom fixture that launches `chromium` with the `--remote-debugging-port` arg (see Pattern 1 above). This is a separate browser instance from Playwright's default.
**Warning signs:** Lighthouse timeout errors or "unable to connect" errors.

### Pitfall 5: Viewport-Specific Lighthouse Behavior
**What goes wrong:** Lighthouse ignores the Playwright viewport setting and uses its own emulation.
**Why it happens:** Lighthouse has its own device emulation (mobile Moto G Power by default). The Playwright viewport from the project config doesn't carry over.
**How to avoid:** Pass explicit `screenEmulation` in Lighthouse config to match the target viewport. For desktop viewports, use `lighthouseDesktopConfig`. For mobile, configure `formFactor: 'mobile'` with matching dimensions.
**Warning signs:** Performance scores differ wildly between viewports despite similar page content.

### Pitfall 6: JSON Output Directory Must Exist
**What goes wrong:** `fs.writeFileSync` fails with ENOENT.
**Why it happens:** The `e2e/audit/results/` directory doesn't exist on first run.
**How to avoid:** Use `fs.mkdirSync(dir, { recursive: true })` before writing, or create the directory in a globalSetup.
**Warning signs:** Test failures on file write, not assertions.

## Code Examples

### Lighthouse Desktop Config Override
```typescript
// Disable throttling for consistent local results
const lighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'desktop',
    screenEmulation: { disabled: true }, // Use Playwright's viewport
    throttling: {
      rttMs: 0,
      throughputKbps: 0,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
      cpuSlowdownMultiplier: 1,
    },
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  },
};
```

### Median Score Helper
```typescript
// Run Lighthouse N times and return median scores
async function runLighthouseMedian(
  page: any, port: number, config: any, runs: number = 3
): Promise<Record<string, number>> {
  const allScores: Record<string, number[]> = {
    performance: [], accessibility: [],
    'best-practices': [], seo: [],
  };

  for (let i = 0; i < runs; i++) {
    const result = await playAudit({ page, port, config, thresholds: {} });
    // playAudit returns void but throws on threshold failure
    // For score collection, use lighthouse directly or capture from report
  }

  return Object.fromEntries(
    Object.entries(allScores).map(([key, scores]) => {
      scores.sort((a, b) => a - b);
      return [key, scores[Math.floor(scores.length / 2)]];
    })
  );
}
```

### Axe Results Summary Extraction
```typescript
// Extract concise violation summary from axe results
function summarizeAxeResults(results: any) {
  return {
    violations: results.violations.length,
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    details: results.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.length,
    })),
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lighthouse CI (LHCI) GitHub Action | playwright-lighthouse for programmatic integration | 2024 | Tighter integration with existing Playwright test suites |
| axe-playwright (community) | @axe-core/playwright (official Deque) | 2023 | Official package with better maintenance and axe-core version alignment |
| Lighthouse v11 | Lighthouse v13.0.3 | 2025 | Requires Node 22+, new scoring algorithm, timespan/snapshot modes |

## Project Constraints (from CLAUDE.md)

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x -- audit tests run against this stack
- **Dev server**: Runs via docker compose at localhost:3000 -- Playwright `webServer` config has `reuseExistingServer: true`
- **Testing**: Never present UI/browser testing as manual tasks; always automate via Playwright or Chrome DevTools MCP (from MEMORY.md)
- **Conventional commits**: Required for all commits
- **Context7 MCP**: Use for documentation lookup

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Lighthouse 13 requires Node 22+ | Needs verification | Check at execution time | Use Lighthouse 12.x if Node < 22 |
| Docker + docker compose | Dev server | Available (existing infrastructure) | -- | -- |
| Chromium (Playwright) | All audits | Available via @playwright/test | Bundled | -- |
| pnpm | Package install | Available (existing) | -- | -- |

**Important version concern:** Lighthouse 13.x requires Node.js 22 or later. The project currently specifies `^18.20.2 || >=20.9.0` in engines. If the runtime is Node 20, Lighthouse 13 will not work. Fallback: install `lighthouse@12` which supports Node 18+. The planner MUST verify Node version at execution time and select the appropriate Lighthouse version.

## Open Questions

1. **Node.js version vs Lighthouse 13 compatibility**
   - What we know: Lighthouse 13 requires Node 22+. Project engines field allows Node 18/20+.
   - What's unclear: What Node version is actually running in the dev container.
   - Recommendation: Check `node --version` at execution time. If < 22, use `lighthouse@12` instead of `lighthouse@13`.

2. **playwright-lighthouse compatibility with Playwright 1.58**
   - What we know: playwright-lighthouse 4.0.0 is the latest. Playwright 1.58.2 is installed.
   - What's unclear: Whether there are breaking changes in Playwright 1.58 that affect playwright-lighthouse.
   - Recommendation: Install and verify in a quick smoke test before writing all audit specs.

3. **Lighthouse score variability at 95 threshold**
   - What we know: Lighthouse Performance scores fluctuate 3-5 points between runs.
   - What's unclear: Whether the site consistently hits 95+ on Performance or sits at the boundary.
   - Recommendation: Run initial manual audit via Chrome DevTools MCP to establish baseline. If scores are 93-97 range, implement median-of-3 strategy. If consistently 98+, single run is fine.

## Sources

### Primary (HIGH confidence)
- [playwright-lighthouse README](https://github.com/abhinaba-ghosh/playwright-lighthouse/blob/master/README.md) - API usage, fixture patterns, threshold configuration
- [@axe-core/playwright README](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md) - AxeBuilder API, withTags, analyze() result structure
- [Playwright accessibility testing docs](https://playwright.dev/docs/accessibility-testing) - Official Playwright + axe-core integration patterns

### Secondary (MEDIUM confidence)
- [npm registry](https://www.npmjs.com/) - Version numbers verified: lighthouse 13.0.3, @axe-core/playwright 4.11.1, playwright-lighthouse 4.0.0
- [Lighthouse GitHub](https://github.com/GoogleChrome/lighthouse) - Node 22 requirement for v13

### Tertiary (LOW confidence)
- Lighthouse score variability ranges (3-5 points) -- based on community experience, not formal measurement

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - versions verified via npm registry, APIs verified via official READMEs
- Architecture: HIGH - patterns are straightforward Playwright test organization extending existing project structure
- Pitfalls: HIGH - well-documented issues in Lighthouse + Playwright integration community

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable tooling, unlikely to change)
