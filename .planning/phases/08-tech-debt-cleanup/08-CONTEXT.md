# Phase 8: Tech Debt Cleanup - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning
**Source:** v1.0 Milestone Audit tech_debt findings

<domain>
## Phase Boundary

This phase resolves all 10 tech debt items identified in the v1.0 milestone audit. No new features — only quality, accessibility, robustness, and test coverage improvements. After this phase, the milestone can be completed with zero outstanding items.

</domain>

<decisions>
## Implementation Decisions

### Accessibility Fixes (DSGN-05 hardening)

- **Footer contrast fix**: Change `text-text-on-dark/60` (copyright) to `text-text-on-dark/80` and `text-text-on-dark/80` (nav links) to `text-text-on-dark` (full opacity) in the Footer component. User-reported issue — footer text nearly unreadable on `bg-navy`.
- **Red contrast verification**: Verify `#DC2626` on `#FFFFFF` meets WCAG AA (4.5:1 minimum for normal text). Current measured ratio is 4.51:1 — at boundary. If it fails, darken to `#C62828` or similar. Use automated contrast checker.
- **Runtime browser verification**: Automate verification of mode switching (community/urgent), font self-hosting (Inter/Oswald loading), and keyboard focus ring visibility using Playwright or Chrome DevTools MCP.

### Deployment Robustness (DEPLOY-05 hardening)

- **staticDir fragility**: Change `Media.ts` collection's `staticDir` from relative `'media'` to absolute path using `path.resolve(__dirname, '../media')` or equivalent. Prevents silent breakage if Dockerfile `WORKDIR` changes.
- **imageSrc guard**: Fix `imageSrc=''` in showcase `page.tsx` — replace empty string with proper fallback or remove the conditional guard if no longer needed.

### SEO Enhancement (SEO-01 hardening)

- **Homepage OG image**: Update `generateMetadata()` in the homepage route to use a featured article's image for `openGraph.images` instead of always falling back to generic `og-default.png`.

### Test Coverage

- **DB seed data**: Create a seed script (TypeScript) that populates Payload CMS with test content: at minimum 2-3 news posts and 2-3 CMS pages with published status. This enables the 45 currently-skipped Playwright tests to execute.
- **Verify full test suite**: After seeding, run all 115 Playwright tests and confirm 0 skipped.

### External Items (Document Only)

- **Cloudflare DNS**: Document CNAME and Page Rule setup steps in a deployment runbook (DEPLOYMENT.md or similar).
- **Rich Results validation**: Document that JSON-LD validation requires a live deployed URL and link to Google's Rich Results Test tool.
- **Docker build PostgreSQL**: Document that `next build` requires a live PostgreSQL connection and how to provide it in CI (database service container pattern).

### Claude's Discretion

- Seed data content (names, titles, body text) — use realistic civic advocacy content
- Exact file location for deployment documentation
- Whether to use `path.resolve` or `path.join` for staticDir fix
- Test seed script location (e.g., `src/seed.ts`, `scripts/seed.ts`)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Audit
- `.planning/v1.0-MILESTONE-AUDIT.md` — Source of all 10 tech debt items with details

### Affected Files (from audit)
- `src/collections/Media.ts` — staticDir configuration (DEPLOY-05)
- `src/app/(frontend)/page.tsx` — Homepage generateMetadata (SEO-01)
- Footer component (find via grep for `text-text-on-dark/60`) — contrast fix
- Showcase page (find via grep for `imageSrc=''`) — empty src guard

### Design System
- `src/app/globals.css` — Tailwind design tokens including color definitions

### Testing
- `.playwright-mcp/` or `tests/` — Existing Playwright test suite

</canonical_refs>

<specifics>
## Specific Ideas

- Footer contrast: The exact Tailwind classes to change are `text-text-on-dark/60` → `text-text-on-dark/80` and `text-text-on-dark/80` → `text-text-on-dark`
- The 45 skipped tests are for `news-article` and `cms-page` routes — seed data must create content matching these route patterns
- Homepage OG image should pull from the first/featured news post if available, falling back to `og-default.png` if no posts exist

</specifics>

<deferred>
## Deferred Ideas

None — this phase covers all audit tech debt items.

</deferred>

---

*Phase: 08-tech-debt-cleanup*
*Context gathered: 2026-03-24 from v1.0 audit tech debt findings*
