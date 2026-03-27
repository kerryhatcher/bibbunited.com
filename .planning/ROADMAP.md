# Roadmap: BIBB United

## Milestones

- [x] **v1.0 MVP** -- Phases 1-8 (shipped 2026-03-24) | [Archive](milestones/v1.0-ROADMAP.md)
- [x] **v1.1 Production Polish** -- Phases 9-14 (shipped 2026-03-25) | [Archive](milestones/v1.1-ROADMAP.md)
- [ ] **v2.0 CMS Data Model & Content** -- Phases 15-17 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-8) -- SHIPPED 2026-03-24</summary>

- [x] Phase 1: CMS Foundation (3/3 plans) -- Payload CMS collections, PostgreSQL, editorial workflow
- [x] Phase 2: Brand & Design System (2/2 plans) -- Visual identity, Tailwind v4 tokens, dual-mode theme
- [x] Phase 3: Site Pages & Navigation (3/3 plans) -- Homepage, content templates, navigation, civic pages
- [x] Phase 4: SEO & Production Deployment (3/3 plans) -- SEO metadata, JSON-LD, Docker, K8s manifests
- [x] Phase 5: Critical Build & Route Fixes (2/2 plans) -- Build fix, /news route, Twitter Cards
- [x] Phase 6: Responsive Device Testing (1/1 plan) -- 160 Playwright tests at 5 viewports
- [x] Phase 7: Audit Documentation Cleanup (1/1 plan) -- 26/26 requirements 3-source verification
- [x] Phase 8: Tech Debt Cleanup (3/3 plans) -- Contrast fixes, seed data, deployment docs

</details>

<details>
<summary>v1.1 Production Polish (Phases 9-14) -- SHIPPED 2026-03-25</summary>

- [x] Phase 9: Foundation & Config (2/2 plans) -- DB migration, seed overhaul, config hardening, OG default asset
- [x] Phase 10: Component Migration & Visual Fixes (2/2 plans) -- next/link and next/image migrations, footer contrast, keyboard trap fix
- [x] Phase 11: Accessibility, Layout & UX Polish (3/3 plans) -- Skip link, H1, active nav, bylines, excerpts, empty states, focus indicators
- [x] Phase 12: SEO & Metadata (2/2 plans) -- Title template, canonical URLs, OG tags, dynamic sitemap
- [x] Phase 13: Quality Audit (4/4 plans) -- Lighthouse/axe-core/admin audit, regression fixes, re-verification
- [x] Phase 14: Navigation URL Fix & Documentation Drift (1/1 plan) -- Seed URL fix, documentation drift correction

</details>

### v2.0 CMS Data Model & Content (In Progress)

**Milestone Goal:** Restructure the data model around organizations, give editors control over homepage content, and automate upstream cache busting on publish.

- [x] **Phase 15: Organization Data Model** - Organizations collection, Officials refactor, Contact Officials page rebuild, multi-step migration (completed 2026-03-27)
- [ ] **Phase 16: Homepage Editor Content Block** - Editable rich text block on homepage between hero and latest news
- [ ] **Phase 17: Cloudflare Cache Busting** - Automated edge cache purge on content publish with graceful local dev fallback

## Phase Details

### Phase 15: Organization Data Model

**Goal**: Editors can manage governing bodies as first-class CMS records and officials are dynamically linked to organizations instead of hardcoded strings
**Depends on**: Phase 14 (v1.1 complete)
**Requirements**: ORG-01, ORG-02, ORG-03, ORG-04, ORG-05, ORG-06, ORG-07

**Success Criteria** (what must be TRUE):

1. Editor can create, edit, and delete an organization with name, website, phone, address, and email in the Payload admin panel
2. Editor can select an organization when editing an official (relationship field replaces hardcoded body select)
3. Contact Officials page groups officials under their organization with org contact info displayed as section headers
4. Editor can see all linked officials from an organization's admin page (Join field)
5. Full seed script runs end-to-end creating organizations and linking officials without errors

**Plans:** 3/3 plans complete

- [x] 15-01-PLAN.md -- Organizations collection, slug parameterization, Officials refactor, delete protection
- [x] 15-02-PLAN.md -- Hand-authored PostgreSQL migration for body-to-organization schema transition
- [x] 15-03-PLAN.md -- Seed script update and Contact Officials page rebuild with org-based grouping

### Phase 16: Homepage Editor Content Block

**Goal**: Editors can publish formatted content on the homepage between the hero and latest news sections without touching code
**Depends on**: Phase 15
**Requirements**: HOME-01, HOME-02, HOME-03

**Success Criteria** (what must be TRUE):

1. Editor can add and edit rich text content on the homepage via the CMS admin panel
2. Homepage displays the content block between hero and latest news with proper prose styling
3. Homepage renders cleanly with no blank space when the content field is empty

**Plans**: TBD
**UI hint**: yes

### Phase 17: Cloudflare Cache Busting

**Goal**: Content changes propagate to the Cloudflare edge immediately on publish so visitors see fresh content without waiting for TTL expiry
**Depends on**: Phase 16
**Requirements**: CACHE-01, CACHE-02, CACHE-03, CACHE-04

**Success Criteria** (what must be TRUE):

1. Publishing content in the CMS automatically purges the Cloudflare edge cache (draft saves do not trigger purge)
2. Editor can manually trigger a full Cloudflare cache purge from the Payload admin panel
3. CMS save operations complete without delay regardless of purge outcome (fire-and-forget)
4. Local development works normally without Cloudflare credentials configured (graceful skip)

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 15 -> 16 -> 17

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
| 9. Foundation & Config | v1.1 | 2/2 | Complete | 2026-03-25 |
| 10. Component Migration & Visual Fixes | v1.1 | 2/2 | Complete | 2026-03-25 |
| 11. Accessibility, Layout & UX Polish | v1.1 | 3/3 | Complete | 2026-03-25 |
| 12. SEO & Metadata | v1.1 | 2/2 | Complete | 2026-03-25 |
| 13. Quality Audit | v1.1 | 4/4 | Complete | 2026-03-25 |
| 14. Navigation URL Fix & Doc Drift | v1.1 | 1/1 | Complete | 2026-03-25 |
| 15. Organization Data Model | v2.0 | 3/3 | Complete   | 2026-03-27 |
| 16. Homepage Editor Content Block | v2.0 | 0/0 | Not started | - |
| 17. Cloudflare Cache Busting | v2.0 | 0/0 | Not started | - |
