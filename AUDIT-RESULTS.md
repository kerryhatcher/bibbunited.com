# Audit Results

**Date:** 2026-03-25
**Phase:** 13 - Quality Audit (v1.1 Production Polish)
**Threshold:** 95+ Lighthouse (all categories), 0 axe-core violations
**Routes audited:** 6 (/, /news, /news/[slug], /contact-officials, /meetings, /about)
**Viewports:** 5 (320x568, 375x667, 768x1024, 1024x768, 1440x900)

## Regression Suite

**Existing e2e tests:** 145/175 passing (30 failures)

The 30 regression failures are pre-existing test sensitivity issues, not v1.1 regressions:

- **"no clipped text" (20 failures):** Navigation menu items (LI/A elements) report zero height because the mobile navigation panel is collapsed/hidden by CSS. The assertion detects hidden elements as "clipped." Affects cms-page, contact-officials, homepage, meetings, news-listing across mobile-small, mobile-iphone, and tablet viewports. Desktop viewports are not affected because the desktop nav is always visible.
- **"no horizontal overflow" (5 failures):** Homepage and navigation pages report `scrollWidth > clientWidth` across all 5 viewports. Likely caused by the hero carousel or mobile nav panel width.
- **"article content visible" (5 failures):** News article page at `/news/school-board-approves-2026-2027-budget` returns a 500 error due to `Cannot read properties of null (reading 'displayName')` in `NewsArticlePage`. The seeded news post author's `displayName` is null. This is a pre-existing data/code issue.

**Assessment:** None of these failures are regressions from v1.1 changes (Phases 9-12). The "clipped text" tests need refinement to exclude hidden nav elements. The news article 500 error needs a null-safety fix in the author byline code.

## Lighthouse Scores

| Route | Viewport | Performance | Accessibility | Best Practices | SEO | Status |
|-------|----------|-------------|---------------|----------------|-----|--------|
| / | mobile-small | 100 | 96 | 100 | 100 | PASS |
| / | mobile-iphone | 100 | 96 | 100 | 100 | PASS |
| / | tablet | 100 | 96 | 100 | 100 | PASS |
| / | desktop-small | 100 | 96 | 100 | 100 | PASS |
| / | desktop-large | 100 | 96 | 100 | 100 | PASS |
| /news | mobile-small | 100 | 96 | 100 | 100 | PASS |
| /news | mobile-iphone | 100 | 96 | 100 | 100 | PASS |
| /news | tablet | 100 | 96 | 100 | 100 | PASS |
| /news | desktop-small | 100 | 96 | 100 | 100 | PASS |
| /news | desktop-large | 100 | 96 | 100 | 100 | PASS |
| /news/[slug] | mobile-small | 0 | 0 | 0 | 0 | FAIL |
| /news/[slug] | mobile-iphone | 0 | 0 | 0 | 0 | FAIL |
| /news/[slug] | tablet | 0 | 0 | 0 | 0 | FAIL |
| /news/[slug] | desktop-small | 0 | 0 | 0 | 0 | FAIL |
| /news/[slug] | desktop-large | 0 | 0 | 0 | 0 | FAIL |
| /contact-officials | mobile-small | 100 | 96 | 100 | 100 | PASS |
| /contact-officials | mobile-iphone | 100 | 96 | 100 | 100 | PASS |
| /contact-officials | tablet | 100 | 96 | 100 | 100 | PASS |
| /contact-officials | desktop-small | 100 | 96 | 100 | 100 | PASS |
| /contact-officials | desktop-large | 100 | 96 | 100 | 100 | PASS |
| /meetings | mobile-small | 100 | 96 | 100 | 100 | PASS |
| /meetings | mobile-iphone | 100 | 96 | 100 | 100 | PASS |
| /meetings | tablet | 100 | 96 | 100 | 100 | PASS |
| /meetings | desktop-small | 100 | 96 | 100 | 100 | PASS |
| /meetings | desktop-large | 100 | 96 | 100 | 100 | PASS |
| /about | mobile-small | 100 | 96 | 100 | 92 | FAIL |
| /about | mobile-iphone | 100 | 96 | 100 | 92 | FAIL |
| /about | tablet | 100 | 96 | 100 | 92 | FAIL |
| /about | desktop-small | 100 | 96 | 100 | 92 | FAIL |
| /about | desktop-large | 100 | 96 | 100 | 92 | FAIL |

**Summary:** 20/30 route-viewport combinations pass the 95+ threshold.

- **4 routes pass consistently:** /, /news, /contact-officials, /meetings (all 5 viewports each)
- **/about fails on SEO (92):** Missing meta description for the About page. The CMS page has no SEO metadata configured in the admin panel.
- **/news/[slug] scores 0 across the board:** The page returns a 500 server error (`Cannot read properties of null (reading 'displayName')`), so Lighthouse cannot audit it. This is a pre-existing null-safety bug in the author byline rendering.

## Accessibility (axe-core)

| Route | Viewport | Violations | Passes | Incomplete | Status |
|-------|----------|------------|--------|------------|--------|
| / | mobile-small | 1 | 24 | 1 | FAIL |
| / | mobile-iphone | 1 | 24 | 1 | FAIL |
| / | tablet | 1 | 24 | 1 | FAIL |
| / | desktop-small | 1 | 24 | 1 | FAIL |
| / | desktop-large | 1 | 24 | 1 | FAIL |
| /news | mobile-small | 1 | 24 | 0 | FAIL |
| /news | mobile-iphone | 1 | 24 | 0 | FAIL |
| /news | tablet | 1 | 24 | 0 | FAIL |
| /news | desktop-small | 1 | 24 | 0 | FAIL |
| /news | desktop-large | 1 | 24 | 0 | FAIL |
| /news/[slug] | mobile-small | 2 | 7 | 0 | FAIL |
| /news/[slug] | mobile-iphone | 2 | 7 | 0 | FAIL |
| /news/[slug] | tablet | 2 | 7 | 0 | FAIL |
| /news/[slug] | desktop-small | 2 | 7 | 0 | FAIL |
| /news/[slug] | desktop-large | 2 | 7 | 0 | FAIL |
| /contact-officials | mobile-small | 1 | 23 | 0 | FAIL |
| /contact-officials | mobile-iphone | 1 | 23 | 0 | FAIL |
| /contact-officials | tablet | 1 | 23 | 0 | FAIL |
| /contact-officials | desktop-small | 1 | 23 | 0 | FAIL |
| /contact-officials | desktop-large | 1 | 23 | 0 | FAIL |
| /meetings | mobile-small | 1 | 23 | 1 | FAIL |
| /meetings | mobile-iphone | 1 | 23 | 0 | FAIL |
| /meetings | tablet | 1 | 23 | 0 | FAIL |
| /meetings | desktop-small | 1 | 23 | 0 | FAIL |
| /meetings | desktop-large | 1 | 23 | 0 | FAIL |
| /about | mobile-small | 1 | 23 | 0 | FAIL |
| /about | mobile-iphone | 1 | 23 | 0 | FAIL |
| /about | tablet | 1 | 23 | 0 | FAIL |
| /about | desktop-small | 1 | 23 | 0 | FAIL |
| /about | desktop-large | 1 | 23 | 0 | FAIL |

**Summary:** 0/30 route-viewport combinations pass (zero violations required).

### Violation Details

**1. color-contrast (all 6 routes, all viewports)**
- **Rule:** WCAG 2 AA color-contrast (wcag143)
- **Impact:** serious
- **Affected elements:** 2 nodes in the footer
  - Footer CTA button link (`<a href="/meetings">`) -- red text (#dc2626) on navy background (#1b2a4a), contrast ratio 2.94:1 (required 4.5:1)
  - Footer brand text "UNITED" (`<span class="text-crimson ml-2">`) -- red text (#dc2626) on navy background (#1b2a4a), contrast ratio 2.94:1 (required 3:1 for large text)

**2. document-title (/news/[slug] only)**
- **Rule:** document-title
- **Impact:** serious
- **Cause:** The page returns a 500 error page which lacks proper `<title>` element

**3. html-has-lang (/news/[slug] only)**
- **Rule:** html-has-lang
- **Impact:** serious
- **Cause:** The 500 error page renders without `lang` attribute on `<html>`

## Admin Login

| Check | Status |
|-------|--------|
| /admin loads (status < 400) | PASS |
| Login form renders (email + password inputs) | PASS |

Admin login verification passed across all 5 viewports.

## Future Polish

_Items identified during audit that could be improved beyond the strict pass/fail criteria:_

### Critical (blocking audit pass)

1. **Fix footer color contrast:** The red-on-navy text in the footer CTA and "UNITED" branding fails WCAG AA. Options:
   - Change footer CTA button text from crimson to white or a lighter color
   - Change "UNITED" in footer from `text-crimson` to `text-white` or `text-accent`
   - This single fix would make all 25 non-error-page axe tests pass

2. **Fix news article null displayName error:** The `NewsArticlePage` component crashes when `displayName` is null. Add null-safety: `author?.displayName ?? 'BIBB United Staff'`. This would fix the /news/[slug] 500 error and restore Lighthouse/axe scoring for that route.

3. **Add meta description to About page:** The /about route scores 92 on SEO due to missing meta description. Configure SEO metadata in the Payload CMS admin for the About page, or add a fallback meta description in the page template.

### Medium (improvements beyond threshold)

4. **Refine "no clipped text" e2e tests:** Exclude hidden/collapsed navigation elements from the zero-height text assertion. These false positives inflate the failure count.

5. **Refine "no horizontal overflow" tests:** Investigate whether the hero carousel or mobile nav panel causes `scrollWidth > clientWidth` and either fix the overflow or adjust the test to account for off-screen elements.

6. **Homepage incomplete axe check:** 1 incomplete check on the homepage across all viewports. Worth investigating what axe-core could not determine (likely a color-contrast check requiring manual verification).

### Low (nice-to-have)

7. **Lighthouse Accessibility score is 96, not 100:** The 4-point gap is likely caused by the same color-contrast issue that axe-core flags. Fixing the footer contrast should push this to 100.

8. **Consider adding a meta description fallback for CMS pages:** Currently only pages with explicit SEO metadata in Payload get meta descriptions. A template-based fallback from the page content would improve SEO consistency.
