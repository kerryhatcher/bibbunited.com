# Phase 6: Responsive Device Testing - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Automated Playwright tests that verify all public pages render correctly at mobile, tablet, and desktop viewport sizes. This phase satisfies DSGN-04 (the only unchecked v1 requirement) by producing test evidence that the responsive layout works at real device sizes.

This phase does NOT build new UI — it tests what Phases 2-5 already built.

</domain>

<decisions>
## Implementation Decisions

### Test Tooling
- **D-01:** Use Playwright for all responsive testing. CLAUDE.md mandates Playwright MCP or Chrome DevTools MCP for browser testing.
- **D-02:** Full Playwright setup from scratch — no testing infrastructure exists in the project yet.

### Viewport Coverage
- **D-03:** Test at 5 viewport widths per ROADMAP.md success criteria: 320px (small mobile), 375px (iPhone), 768px (tablet), 1024px (small desktop), 1440px (large desktop).
- **D-04:** Use standard device heights: 320x568, 375x667, 768x1024, 1024x768, 1440x900.

### Pages to Test
- **D-05:** Test ALL 6 public routes: `/` (homepage), `/news` (listing), `/news/[slug]` (article), `/[slug]` (CMS page), `/contact-officials`, `/meetings`.
- **D-06:** Skip `/admin` routes — Payload admin panel is not part of DSGN-04 scope.

### Test Assertion Strategy
- **D-07:** Use structural DOM assertions (element visibility, no horizontal overflow, text readability, navigation functionality) as the primary test method. These are deterministic and CI-friendly.
- **D-08:** Take reference screenshots at each viewport as visual evidence for DSGN-04 verification. Screenshots are artifacts, not assertion sources (no pixel-diff comparison — too brittle for a CMS site with dynamic content).
- **D-09:** Navigation menu must be testable at all viewports — verify mobile hamburger menu opens/closes and desktop nav items are visible.

### CI Integration
- **D-10:** Local-only test execution for v1. No CI pipeline integration — the team is small and can run tests manually before deployments.

### Claude's Discretion
- Test file organization (single file vs. per-page files)
- Specific Playwright config options (browsers, timeouts, retries)
- Helper utilities for viewport iteration
- Whether to use Playwright's built-in `expect` or custom assertion helpers

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Instructions
- `CLAUDE.md` — Mandates Playwright MCP or Chrome DevTools MCP for all browser testing; contains full tech stack constraints

### Phase Artifacts
- `.planning/ROADMAP.md` §Phase 6 — Success criteria defining exact viewport sizes and test requirements
- `.planning/REQUIREMENTS.md` §DSGN-04 — "Fully responsive, mobile-first layout tested on real device sizes"

### Design System
- `.planning/phases/02-brand-design-system/02-CONTEXT.md` — Brand decisions that inform what "correct" responsive rendering looks like
- `src/app/(frontend)/styles.css` — Tailwind v4 theme with breakpoints and design tokens

### Existing Pages (test targets)
- `src/app/(frontend)/page.tsx` — Homepage
- `src/app/(frontend)/news/page.tsx` — News listing
- `src/app/(frontend)/news/[slug]/page.tsx` — News article
- `src/app/(frontend)/[slug]/page.tsx` — CMS pages
- `src/app/(frontend)/contact-officials/page.tsx` — Officials page
- `src/app/(frontend)/meetings/page.tsx` — Meetings page

### Layout Components (responsive behavior sources)
- `src/components/layout/` — Header, Footer, navigation components
- `src/components/ui/` — Card, Section, Button components with responsive classes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No testing infrastructure exists — Playwright needs full setup (package, config, test directory)
- Tailwind v4 responsive classes (`sm:`, `md:`, `lg:`) are used throughout components

### Established Patterns
- All pages use `<Section>` wrapper component for consistent spacing
- Header is a client component with mobile hamburger menu toggle
- Footer is a server component with responsive grid layout
- Card component uses responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)

### Integration Points
- `package.json` — needs `@playwright/test` dependency
- Project root — needs `playwright.config.ts`
- New test directory (likely `tests/` or `e2e/`)
- `package.json` scripts — needs test runner command

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard Playwright viewport testing approach. The success criteria in ROADMAP.md are precise enough to guide implementation directly.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-responsive-device-testing*
*Context gathered: 2026-03-24*
