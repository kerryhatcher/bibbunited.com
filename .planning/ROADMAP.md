# Roadmap: BIBB United

## Milestones

- ✅ **v1.0 MVP** -- Phases 1-8 (shipped 2026-03-24) | [Archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Production Polish** -- Phases 9-13 (in progress)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-8) -- SHIPPED 2026-03-24</summary>

- [x] Phase 1: CMS Foundation (3/3 plans) -- Payload CMS collections, PostgreSQL, editorial workflow
- [x] Phase 2: Brand & Design System (2/2 plans) -- Visual identity, Tailwind v4 tokens, dual-mode theme
- [x] Phase 3: Site Pages & Navigation (3/3 plans) -- Homepage, content templates, navigation, civic pages
- [x] Phase 4: SEO & Production Deployment (3/3 plans) -- SEO metadata, JSON-LD, Docker, K8s manifests
- [x] Phase 5: Critical Build & Route Fixes (2/2 plans) -- Build fix, /news route, Twitter Cards
- [x] Phase 6: Responsive Device Testing (1/1 plan) -- 160 Playwright tests at 5 viewports
- [x] Phase 7: Audit Documentation Cleanup (1/1 plan) -- 26/26 requirements 3-source verification
- [x] Phase 8: Tech Debt Cleanup (3/3 plans) -- Contrast fixes, seed data, deployment docs

</details>

### v1.1 Production Polish

**Milestone Goal:** Fix all UI/UX review issues and perform a final quality audit so the site is production-ready -- visually polished, fully accessible, optimized, and SEO-complete.

- [ ] **Phase 9: Foundation & Config** - Database migration, seed overhaul, config hardening, and OG default asset
- [x] **Phase 10: Component Migration & Visual Fixes** - next/link and next/image batch migrations, footer contrast, and keyboard trap fix (completed 2026-03-25)
- [ ] **Phase 11: Accessibility, Layout & UX Polish** - Skip link, H1, active nav, bylines, excerpts, empty states, spacing, and focus indicators
- [ ] **Phase 12: SEO & Metadata** - Title template, canonical URLs, OG tags, dynamic sitemap, and sitemap priorities
- [ ] **Phase 13: Quality Audit** - Full automated re-review verifying all fixes and catching regressions

## Phase Details

### Phase 9: Foundation & Config
**Goal**: All prerequisite infrastructure, data, and assets are in place so downstream phases can build on correct config, populated seed data, and required static assets
**Depends on**: Phase 8 (v1.0 complete)
**Requirements**: VIS-02, VIS-03, VIS-04, A11Y-05, INFRA-01, INFRA-02, SEO-09
**Success Criteria** (what must be TRUE):
  1. Seed script populates navigation menu items, hero spotlight content, and visually distinct images with descriptive alt text
  2. Users collection has a displayName field and the seed user has a display name set
  3. A branded 1200x630 OG default image exists at a known public path
  4. Media files are served with long-lived cache headers and the X-Powered-By header is suppressed
**Plans**: 2 plans
Plans:
- [x] 09-01-PLAN.md -- Users displayName field, DB migration, Next.js cache/security headers
- [x] 09-02-PLAN.md -- Seed script overhaul: images, OG image, Navigation/Homepage globals, Officials, Meetings

### Phase 10: Component Migration & Visual Fixes
**Goal**: All internal links use client-side navigation, all images are optimized via next/image, and critical visual bugs (footer contrast, keyboard trap) are resolved
**Depends on**: Phase 9
**Requirements**: COMP-01, COMP-02, VIS-01, A11Y-03
**Success Criteria** (what must be TRUE):
  1. Clicking any internal link navigates without a full page reload (next/link migration complete)
  2. All images serve optimized formats (WebP/AVIF) with responsive srcset and lazy loading (next/image migration complete)
  3. Footer text is clearly readable against the dark background with WCAG 4.5:1 contrast ratio
  4. Mobile menu close button is not reachable via keyboard when the slide-out panel is hidden
**Plans**: 2 plans
Plans:
- [x] 10-01-PLAN.md -- next/link migration across all components, next/image migration with fill/fixed modes, next.config.ts image formats
- [x] 10-02-PLAN.md -- Footer contrast fix (remove /80 opacity), keyboard trap fix (inert + focus trap)

### Phase 11: Accessibility, Layout & UX Polish
**Goal**: The site meets WCAG 2.1 AA for keyboard navigation and document structure, and content presentation gives users the context they need to act
**Depends on**: Phase 10
**Requirements**: A11Y-01, A11Y-02, A11Y-04, UX-01, UX-02, UX-03, UX-04, UX-05, UX-06
**Success Criteria** (what must be TRUE):
  1. Keyboard user can skip to main content via a visible skip link that appears on focus
  2. Homepage has a proper H1 heading visible to screen readers
  3. Current page is visually indicated in navigation with active styling and aria-current attribute
  4. Article bylines show a human-readable display name instead of an email address
  5. News cards show excerpt text, empty civic pages show actionable fallback messaging, footer CTA does not link to current page, footer links have visible focus rings, and main content is correctly spaced below the sticky header
**Plans**: TBD
**UI hint**: yes

### Phase 12: SEO & Metadata
**Goal**: Every page has correct, complete metadata for search engines and social sharing
**Depends on**: Phase 9 (OG default image), Phase 11 (H1 structure)
**Requirements**: SEO-05, SEO-06, SEO-07, SEO-08, INFRA-03
**Success Criteria** (what must be TRUE):
  1. Page titles follow a consistent template without duplicate site name suffixes
  2. Every page has a canonical URL and complete Open Graph tags (url, type, site_name, image, description)
  3. All news articles and CMS pages appear in sitemap.xml with homepage at priority 1.0
**Plans**: TBD

### Phase 13: Quality Audit
**Goal**: All v1.1 fixes are verified through automated re-review and no regressions remain
**Depends on**: Phase 12
**Requirements**: QA-01
**Success Criteria** (what must be TRUE):
  1. Lighthouse scores meet or exceed v1.0 baselines for performance, accessibility, best practices, and SEO
  2. Automated visual, accessibility, and responsive checks pass across all public routes at all 5 viewports
  3. Any remaining polish opportunities are documented for future consideration
**Plans**: TBD

## Progress

**Execution Order:** Phase 9 -> 10 -> 11 -> 12 -> 13

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. CMS Foundation | v1.0 | 3/3 | Complete | 2026-03-23 |
| 2. Brand & Design System | v1.0 | 2/2 | Complete | 2026-03-23 |
| 3. Site Pages & Navigation | v1.0 | 3/3 | Complete | 2026-03-23 |
| 4. SEO & Production Deployment | v1.0 | 3/3 | Complete | 2026-03-24 |
| 5. Critical Build & Route Fixes | v1.0 | 2/2 | Complete | 2026-03-24 |
| 6. Responsive Device Testing | v1.0 | 1/1 | Complete | 2026-03-24 |
| 7. Audit Documentation Cleanup | v1.0 | 1/1 | Complete | 2026-03-24 |
| 8. Tech Debt Cleanup | v1.0 | 3/3 | Complete | 2026-03-24 |
| 9. Foundation & Config | v1.1 | 0/2 | Planning | - |
| 10. Component Migration & Visual Fixes | v1.1 | 2/2 | Complete    | 2026-03-25 |
| 11. Accessibility, Layout & UX Polish | v1.1 | 0/0 | Not started | - |
| 12. SEO & Metadata | v1.1 | 0/0 | Not started | - |
| 13. Quality Audit | v1.1 | 0/0 | Not started | - |
