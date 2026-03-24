# Phase 6: Responsive Device Testing - Research

**Researched:** 2026-03-24
**Domain:** Playwright browser automation / responsive layout verification
**Confidence:** HIGH

## Summary

This phase adds Playwright end-to-end tests that verify every public route renders correctly at five viewport sizes (320px, 375px, 768px, 1024px, 1440px). The project has zero testing infrastructure today -- Playwright must be installed from scratch with config, test directory, and npm scripts. The site is a Next.js + Payload CMS app that requires a running dev server (with database) for tests to execute against.

The testing strategy is structural DOM assertions (no pixel-diff visual regression). Tests check for horizontal overflow, element visibility, navigation functionality, and text readability at each viewport. Screenshots are captured as evidence artifacts but not used for assertions. This approach is deterministic, CI-friendly, and immune to CMS content changes.

**Primary recommendation:** Use Playwright projects to define five viewport configurations, iterate all six public routes through each viewport with shared test logic, and capture full-page screenshots as artifacts alongside pass/fail DOM assertions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use Playwright for all responsive testing. CLAUDE.md mandates Playwright MCP or Chrome DevTools MCP for browser testing.
- **D-02:** Full Playwright setup from scratch -- no testing infrastructure exists in the project yet.
- **D-03:** Test at 5 viewport widths: 320px (small mobile), 375px (iPhone), 768px (tablet), 1024px (small desktop), 1440px (large desktop).
- **D-04:** Use standard device heights: 320x568, 375x667, 768x1024, 1024x768, 1440x900.
- **D-05:** Test ALL 6 public routes: `/`, `/news`, `/news/[slug]`, `/[slug]`, `/contact-officials`, `/meetings`.
- **D-06:** Skip `/admin` routes -- Payload admin panel is not part of DSGN-04 scope.
- **D-07:** Use structural DOM assertions (element visibility, no horizontal overflow, text readability, navigation functionality) as the primary test method.
- **D-08:** Take reference screenshots at each viewport as visual evidence. Screenshots are artifacts, not assertion sources (no pixel-diff comparison).
- **D-09:** Navigation menu must be testable at all viewports -- verify mobile hamburger menu opens/closes and desktop nav items are visible.
- **D-10:** Local-only test execution for v1. No CI pipeline integration.

### Claude's Discretion
- Test file organization (single file vs. per-page files)
- Specific Playwright config options (browsers, timeouts, retries)
- Helper utilities for viewport iteration
- Whether to use Playwright's built-in `expect` or custom assertion helpers

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DSGN-04 | Fully responsive, mobile-first layout tested on real device sizes | Playwright viewport projects at 5 device sizes across all 6 routes, with DOM assertions for overflow, visibility, and navigation. Screenshots as evidence artifacts. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @playwright/test | 1.58.2 | Browser automation and test runner | Industry standard for e2e testing. Built-in assertions, multi-browser support, viewport emulation, screenshot capture. Current npm registry version. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | -- | -- | Playwright's built-in assertions (`expect`) cover all needs. No additional assertion libraries required. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Playwright | Cypress | Cypress has weaker multi-viewport support and no native project-based viewport configuration. Playwright is mandated by CONTEXT.md D-01. |
| DOM assertions | Visual regression (toHaveScreenshot) | Pixel-diff is brittle with dynamic CMS content. D-08 explicitly rejects pixel comparison. |

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install chromium
```

Note: Only Chromium is needed. Firefox and WebKit are unnecessary for responsive layout testing (CSS layout engines are browser-independent for the tested properties). This saves ~500MB of browser downloads.

## Architecture Patterns

### Recommended Project Structure
```
e2e/
  responsive/
    homepage.spec.ts        # Tests for / route
    news-listing.spec.ts    # Tests for /news route
    news-article.spec.ts    # Tests for /news/[slug] route
    cms-page.spec.ts        # Tests for /[slug] route
    contact-officials.spec.ts  # Tests for /contact-officials
    meetings.spec.ts        # Tests for /meetings
    navigation.spec.ts      # Tests for nav at all viewports
  helpers/
    assertions.ts           # Shared assertion helpers (overflow, visibility)
playwright.config.ts        # Root-level config
```

**Rationale for per-page files:** Each route has distinct elements to verify (cards on news listing, official cards on contact page, meeting schedule on meetings page). Per-page files keep tests focused and make failures immediately attributable to a specific route. The navigation test file is separate because it tests cross-cutting behavior.

### Pattern 1: Playwright Projects for Viewport Matrix

**What:** Define each viewport as a Playwright "project" so every test file automatically runs at all five sizes.
**When to use:** Always -- this is the core pattern for this phase.
**Example:**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

const viewports = [
  { name: 'mobile-small', width: 320, height: 568 },
  { name: 'mobile-iphone', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-small', width: 1024, height: 768 },
  { name: 'desktop-large', width: 1440, height: 900 },
];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  workers: 2,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
  projects: viewports.map((vp) => ({
    name: vp.name,
    use: {
      viewport: { width: vp.width, height: vp.height },
      browserName: 'chromium',
    },
  })),
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

### Pattern 2: Horizontal Overflow Detection

**What:** JavaScript evaluation that checks if any element's scrollWidth exceeds its clientWidth, indicating horizontal overflow.
**When to use:** Every page at every viewport -- the core "no layout breakage" assertion.
**Example:**
```typescript
// e2e/helpers/assertions.ts
import { Page, expect } from '@playwright/test';

export async function assertNoHorizontalOverflow(page: Page) {
  const overflowElements = await page.evaluate(() => {
    const results: string[] = [];
    document.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (htmlEl.scrollWidth > htmlEl.clientWidth + 1) {
        const tag = htmlEl.tagName.toLowerCase();
        const cls = htmlEl.className?.toString().slice(0, 50) || '';
        results.push(`${tag}.${cls} (scrollWidth=${htmlEl.scrollWidth}, clientWidth=${htmlEl.clientWidth})`);
      }
    });
    return results;
  });
  expect(overflowElements, 'Elements with horizontal overflow').toEqual([]);
}
```

### Pattern 3: Mobile Navigation Toggle Test

**What:** At mobile viewports (< 1024px / `lg` breakpoint), verify the hamburger menu button is visible, click it, verify the slide-out panel appears, then close it.
**When to use:** Navigation test file, mobile and tablet projects only.
**Example:**
```typescript
import { test, expect } from '@playwright/test';

test('mobile menu opens and closes', async ({ page }) => {
  await page.goto('/');

  // Desktop nav should be hidden at mobile
  const desktopNav = page.locator('nav[aria-label="Main navigation"]');
  await expect(desktopNav).toBeHidden();

  // Open hamburger menu
  const menuButton = page.getByLabel('Open menu');
  await expect(menuButton).toBeVisible();
  await menuButton.click();

  // Mobile nav panel should be visible
  const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
  await expect(mobileNav).toBeVisible();

  // Close menu
  const closeButton = page.getByLabel('Close menu');
  await closeButton.click();

  // Panel should slide away (may still be in DOM but translated off-screen)
  await expect(mobileNav).toBeHidden();
});
```

### Pattern 4: Screenshot Capture as Evidence

**What:** Full-page screenshots saved with descriptive names per viewport per route.
**When to use:** After assertions pass, capture screenshot as DSGN-04 evidence.
**Example:**
```typescript
test('homepage renders correctly', async ({ page }, testInfo) => {
  await page.goto('/');
  // ... assertions ...
  await page.screenshot({
    path: `e2e/screenshots/${testInfo.project.name}-homepage.png`,
    fullPage: true,
  });
});
```

### Anti-Patterns to Avoid
- **Pixel-diff screenshots as assertions:** CMS content changes break these tests constantly. Use structural DOM assertions instead. (D-08 forbids this.)
- **Testing at arbitrary viewport widths:** Stick to the five specified sizes. Random widths add noise without covering real devices.
- **Hardcoded text assertions:** CMS content changes. Assert element presence and structure, not specific text content.
- **Testing Payload admin routes:** Out of scope per D-06. Admin panel uses its own responsive framework.
- **Installing all browsers:** Only Chromium is needed. Layout testing does not require cross-browser coverage -- CSS rendering differences that matter at this level are negligible.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Viewport iteration | Manual loops in each test file | Playwright projects config | Projects run every test at every viewport automatically. Zero per-test boilerplate. |
| Screenshot naming | Custom naming logic | `testInfo.project.name` + route name | Playwright provides project metadata in test context. |
| Dev server management | Manual start/stop scripts | Playwright `webServer` config | Automatically starts dev server before tests, waits for ready, reuses existing server. |
| DOM assertion helpers | Inline evaluate calls in every test | Shared helper module (`e2e/helpers/assertions.ts`) | Reusable, maintainable, consistent error messages. |

## Common Pitfalls

### Pitfall 1: Dev Server Requires Database
**What goes wrong:** Playwright starts `npm run dev` but the Next.js + Payload app fails to boot because PostgreSQL is not running or `DATABASE_URL` is not set.
**Why it happens:** Payload CMS initializes database connection on server startup. No database = crash.
**How to avoid:** Ensure `.env` has valid `DATABASE_URL` before running tests. Document this as a prerequisite. Use `reuseExistingServer: true` so developers can pre-start the server.
**Warning signs:** Playwright timeout waiting for server at localhost:3000.

### Pitfall 2: Dynamic Routes Need Seed Data
**What goes wrong:** `/news/[slug]` and `/[slug]` routes return 404 because no CMS content exists.
**Why it happens:** These are dynamic routes that require database records.
**How to avoid:** Tests should either: (a) use routes that exist in the seeded database, or (b) query the site first to discover valid slugs, or (c) accept that 404 pages also need responsive testing. Best approach: navigate to `/news` listing, extract a slug from a link, then test that article page.
**Warning signs:** Tests pass but are testing error pages, not real content pages.

### Pitfall 3: Mobile Menu Animation Timing
**What goes wrong:** Test clicks hamburger, immediately checks for mobile nav visibility, fails because CSS transition (300ms `transition-transform`) hasn't completed.
**Why it happens:** The slide-out panel uses `transition-transform duration-300` (see Header.tsx line 241). Playwright's `toBeVisible()` may fire before the panel is fully in view.
**How to avoid:** Use Playwright's auto-waiting -- `await expect(mobileNav).toBeVisible()` retries by default (5s timeout). The slide animation completes in 300ms, well within the default timeout. Do NOT add manual `page.waitForTimeout()`.
**Warning signs:** Flaky tests that pass on fast machines but fail under load.

### Pitfall 4: Overflow False Positives on Scrollable Elements
**What goes wrong:** Horizontal overflow detection flags intentionally scrollable elements (e.g., code blocks, wide tables).
**Why it happens:** The `scrollWidth > clientWidth` check is indiscriminate.
**How to avoid:** Filter out elements with `overflow-x: auto`, `overflow-x: scroll`, or `overflow: hidden` from the overflow check. These are intentionally scrollable.
**Warning signs:** Tests fail on pages with code snippets or wide embedded content.

### Pitfall 5: Body Overflow Hidden During Mobile Menu
**What goes wrong:** Overflow test runs while mobile menu is open (Header.tsx sets `body.style.overflow = 'hidden'`), producing incorrect results.
**Why it happens:** The Header component locks body scroll when mobile menu is open.
**How to avoid:** Run overflow assertions before opening the mobile menu, or ensure the menu is closed before checking overflow.
**Warning signs:** Overflow test results differ depending on test execution order.

## Code Examples

### Complete Test File Pattern
```typescript
// e2e/responsive/homepage.spec.ts
import { test, expect } from '@playwright/test';
import { assertNoHorizontalOverflow } from '../helpers/assertions';

test.describe('Homepage responsive layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('no horizontal overflow', async ({ page }) => {
    await assertNoHorizontalOverflow(page);
  });

  test('hero section is visible', async ({ page }) => {
    // Hero section should always be visible regardless of viewport
    const hero = page.locator('section').first();
    await expect(hero).toBeVisible();
  });

  test('content is readable (no zero-height elements)', async ({ page }) => {
    // Verify main content area has non-zero dimensions
    const main = page.locator('main');
    const box = await main.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThan(100);
  });

  test('capture screenshot', async ({ page }, testInfo) => {
    await page.screenshot({
      path: `e2e/screenshots/${testInfo.project.name}-homepage.png`,
      fullPage: true,
    });
  });
});
```

### Shared Assertion: Text Readability Check
```typescript
// e2e/helpers/assertions.ts
export async function assertNoClippedText(page: Page) {
  // Check that no visible text elements have zero height (indicating clipping)
  const clipped = await page.evaluate(() => {
    const results: string[] = [];
    document.querySelectorAll('p, h1, h2, h3, h4, li, a, span, td').forEach((el) => {
      const rect = el.getBoundingClientRect();
      const text = el.textContent?.trim();
      if (text && text.length > 0 && rect.height === 0) {
        results.push(`${el.tagName}: "${text.slice(0, 30)}"`);
      }
    });
    return results;
  });
  expect(clipped, 'Text elements with zero height').toEqual([]);
}
```

### Navigation Viewport-Aware Test
```typescript
// e2e/responsive/navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('navigation is functional', async ({ page, viewport }) => {
    if (!viewport) return;

    if (viewport.width < 1024) {
      // Mobile/tablet: hamburger menu
      const desktopNav = page.locator('nav[aria-label="Main navigation"]');
      await expect(desktopNav).toBeHidden();

      const menuBtn = page.getByLabel('Open menu');
      await expect(menuBtn).toBeVisible();
      await menuBtn.click();

      const mobileNav = page.locator('nav[aria-label="Mobile navigation"]');
      await expect(mobileNav).toBeVisible();

      // Verify nav items exist
      const navItems = mobileNav.locator('li');
      await expect(navItems.first()).toBeVisible();

      // Close
      await page.getByLabel('Close menu').click();
    } else {
      // Desktop: inline nav
      const desktopNav = page.locator('nav[aria-label="Main navigation"]');
      await expect(desktopNav).toBeVisible();

      // Hamburger should be hidden
      const menuBtn = page.getByLabel('Open menu');
      await expect(menuBtn).toBeHidden();
    }
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual browser resizing | Playwright viewport projects | Playwright 1.x+ | Automated, repeatable, CI-ready |
| Pixel-diff visual regression | Structural DOM assertions | Industry trend 2023+ | More stable for CMS-driven sites |
| Per-test viewport loops | Project-based configuration | Playwright 1.x+ | Tests are viewport-unaware; config handles the matrix |

## Project Constraints (from CLAUDE.md)

- **Testing automation mandate:** CLAUDE.md requires all UI verification to be automated via Playwright MCP or Chrome DevTools MCP. Never present browser testing as manual human tasks.
- **GSD workflow:** Do not make direct repo edits outside a GSD workflow.
- **Conventional Commits:** All commits must follow Conventional Commits format.
- **Tech stack:** Next.js + React + Tailwind CSS + Payload CMS 3.x (non-negotiable).
- **No Payload 2.x patterns:** Lean on official Payload 3.x docs only.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Test runtime | Yes | 22.16.0 | -- |
| npm | Package management | Yes | (bundled with Node) | -- |
| @playwright/test | Test framework | No (not yet installed) | 1.58.2 (latest on npm) | -- (must install) |
| Chromium (via Playwright) | Browser engine | No (not yet installed) | (bundled with Playwright) | -- (must install) |
| PostgreSQL | Dev server (Payload CMS) | Assumed yes | -- | Must verify DATABASE_URL in .env |
| Next.js dev server | Test target | Yes (npm run dev) | 16.2.1 | -- |

**Missing dependencies with no fallback:**
- `@playwright/test` must be installed as a dev dependency
- Chromium browser must be installed via `npx playwright install chromium`

**Missing dependencies with fallback:**
- None

## Open Questions

1. **Seed data for dynamic routes**
   - What we know: `/news/[slug]` and `/[slug]` require database records to render content pages (not 404s)
   - What's unclear: Whether the development database has seed data, and what specific slugs exist
   - Recommendation: Tests should discover valid slugs dynamically by scraping listing pages, or the plan should include a seed data step. A pragmatic approach is to navigate to `/news`, find the first article link, and use that slug.

2. **Dev server startup time**
   - What we know: Next.js + Payload with PostgreSQL takes time to cold-start. `webServer.timeout` is set to 120s.
   - What's unclear: Actual startup time on this machine
   - Recommendation: Use `reuseExistingServer: true` so developers can pre-start the server. The 120s timeout should be sufficient.

## Sources

### Primary (HIGH confidence)
- [Playwright Emulation docs](https://playwright.dev/docs/emulation) - viewport configuration and device emulation
- [Playwright Configuration docs](https://playwright.dev/docs/test-configuration) - config structure, projects, webServer
- [Playwright Use Options docs](https://playwright.dev/docs/test-use-options) - viewport, screenshot, trace options
- [Playwright Screenshots docs](https://playwright.dev/docs/screenshots) - screenshot API and options
- npm registry: `@playwright/test` version 1.58.2 (verified 2026-03-24)

### Secondary (MEDIUM confidence)
- Header.tsx source code analysis - mobile menu implementation details (translate-x transform, aria labels, lg breakpoint)
- styles.css source code analysis - Tailwind v4 theme tokens and responsive spacing

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Playwright is the only tool needed, version verified against npm registry
- Architecture: HIGH - Playwright projects pattern is well-documented; test structure follows standard conventions
- Pitfalls: HIGH - Derived from direct source code analysis of Header.tsx (animations, body scroll lock) and known Playwright patterns
- Code examples: HIGH - Based on official Playwright docs and actual project component structure (aria labels, class names)

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (Playwright API is stable; project code is the main variable)
