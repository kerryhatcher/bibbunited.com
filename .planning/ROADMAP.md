# Roadmap: BIBB United

## Overview

BIBB United delivers a civic advocacy website in four phases: first establish the CMS data model and editorial workflow, then build the bold activist brand identity and design system, then assemble the public-facing site with pages, navigation, and civic action content, and finally harden for production with SEO and containerized deployment to K8s. Each phase produces a testable artifact -- working admin panel, design system, rendered site, deployed production app.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: CMS Foundation** - Payload CMS collections, PostgreSQL database, and editorial workflow for managing all site content
- [ ] **Phase 2: Brand & Design System** - BIBB United visual identity and Tailwind-based component system with bold activist aesthetic
- [ ] **Phase 3: Site Pages & Navigation** - Public-facing homepage, content templates, CMS-managed navigation, and civic action pages
- [ ] **Phase 4: SEO & Production Deployment** - Search engine optimization, social sharing metadata, Docker containerization, and K8s deployment
- [ ] **Phase 5: Critical Build & Route Fixes** - Fix generateStaticParams build failure, add /news listing route, complete Twitter Card metadata, remove orphaned scaffold route
- [ ] **Phase 6: Responsive Device Testing** - Automated Playwright testing at mobile/tablet/desktop viewports to satisfy DSGN-04
- [ ] **Phase 7: Audit Documentation Cleanup** - Fix SUMMARY.md frontmatter gaps and VERIFICATION.md body/frontmatter mismatch
- [ ] **Phase 8: Tech Debt Cleanup** - Accessibility contrast fixes, deployment hardening, seed data for test coverage, deployment documentation

## Phase Details

### Phase 1: CMS Foundation
**Goal**: Editors can create, edit, and manage all site content types through Payload CMS admin panel backed by PostgreSQL
**Depends on**: Nothing (first phase)
**Requirements**: CONT-01, CONT-02, CONT-03, CONT-04, CONT-05, DEPLOY-04
**Success Criteria** (what must be TRUE):
  1. Editor can create a rich text page with headings, images, pull quotes, and embedded content in the Payload admin panel
  2. Editor can create a news post with title, body, publish date, and featured image in the Payload admin panel
  3. Editor can add a call-to-action block (text + link) to any page or news post
  4. Editor can activate and deactivate a site-wide urgent banner with custom message and optional link
  5. All content persists in PostgreSQL and survives app restarts
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md -- Scaffold project, PostgreSQL config, Media collection, reusable fields (slug, CTA)
- [x] 01-02-PLAN.md -- Lexical editor blocks, Pages and NewsPosts collections with drafts and rich text
- [ ] 01-03-PLAN.md -- UrgentBanner global, final config wiring, admin panel verification

### Phase 2: Brand & Design System
**Goal**: BIBB United has a distinctive activist visual identity and a reusable Tailwind component system that enforces it across the site
**Depends on**: Phase 1
**Requirements**: DSGN-01, DSGN-02, DSGN-04, DSGN-05
**Success Criteria** (what must be TRUE):
  1. Brand identity exists: logo, color palette, and typography that convey urgency and activist energy
  2. Tailwind design tokens (colors, fonts, spacing) are configured and produce consistent styling across components
  3. Core UI components (buttons, cards, headers, CTAs) render correctly on mobile, tablet, and desktop viewports
  4. Color contrast ratios meet WCAG 2.1 AA standards and all components use semantic HTML with keyboard navigation support
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md -- Tailwind v4 design tokens, fonts, SiteTheme Global, PostCSS config
- [x] 02-02-PLAN.md -- UI components (Button, Card, Section, Logo), favicon, showcase page, visual verification

### Phase 3: Site Pages & Navigation
**Goal**: Visitors can browse the complete public-facing site -- homepage, content pages, news posts, civic action pages -- via CMS-managed navigation
**Depends on**: Phase 2
**Requirements**: NAV-01, NAV-02, NAV-03, CIVX-01, CIVX-02, DSGN-03, DSGN-06, DSGN-07
**Success Criteria** (what must be TRUE):
  1. Homepage displays a hero section, latest news posts, and key topic callouts that update automatically as editors publish content
  2. Navigation menu with one-level dropdowns renders correctly and supports both internal page links and external URLs, manageable from CMS
  3. Contact Your Officials page displays names, roles, emails, and phone numbers for local officials
  4. Meeting Schedule page shows upcoming school board meeting dates, times, and locations
  5. Content pages and news posts display "last updated" timestamps, and articles have a print-friendly layout
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md -- CMS data layer (Officials, Meetings, Navigation, Homepage), site chrome (Header, Footer, UrgentBannerBar), layout integration, print CSS
- [ ] 03-02-PLAN.md -- Page templates (news article, static page), shared content components (RichTextRenderer, DateDisplay, PrintButton)
- [ ] 03-03-PLAN.md -- Homepage (hero spotlight, latest news, topic callouts), civic action pages (Contact Officials, Meeting Schedule)

### Phase 4: SEO & Production Deployment
**Goal**: The site is discoverable by search engines, shareable on social media, and running in production on the K8s cluster
**Depends on**: Phase 3
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-05
**Success Criteria** (what must be TRUE):
  1. Every page and post renders OpenGraph and Twitter Card meta tags with CMS-configurable descriptions
  2. JSON-LD structured data for articles and organization is present and validates with Google's Rich Results Test
  3. Sitemap.xml is auto-generated and includes all published pages and posts
  4. The app runs as a single Docker container deployed to K8s with Traefik ingress and Cloudflare tunnel, with admin routes bypassing cache
  5. Media uploads persist across pod restarts via persistent storage
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md -- Payload SEO plugin wiring, sitemap/robots generation, OG fallback image, Next.js standalone config
- [ ] 04-02-PLAN.md -- OpenGraph/Twitter metadata and JSON-LD structured data on all page routes
- [x] 04-03-PLAN.md -- Docker multi-stage build, K8s manifests (dev/prod), GitHub Actions CI/CD pipeline

### Phase 5: Critical Build & Route Fixes
**Goal**: Production build succeeds and all navigation links resolve to valid routes
**Depends on**: Phase 4
**Requirements**: DEPLOY-01, SEO-03, DSGN-03, SEO-01
**Gap Closure**: Closes critical integration and flow gaps from v1.0 audit
**Success Criteria** (what must be TRUE):
  1. `next build` completes without errors (generateStaticParams for /news/[slug] fixed)
  2. `/news` listing route exists and renders published news posts
  3. "View All News" and Footer "News" links navigate to the /news listing (not 404)
  4. Twitter Card metadata is present on contact-officials and meetings pages
  5. Orphaned `src/app/my-route/route.ts` is removed
**Plans**: 2 plans

Plans:
- [ ] 05-01-PLAN.md -- Fix generateStaticParams null slug crash, add Twitter Card metadata, delete orphaned route
- [ ] 05-02-PLAN.md -- Create /news listing page with card grid, metadata, and JSON-LD

### Phase 6: Responsive Device Testing
**Goal**: DSGN-04 is fully satisfied with automated responsive testing evidence at real device sizes
**Depends on**: Phase 5
**Requirements**: DSGN-04
**Gap Closure**: Closes the only unsatisfied v1.0 requirement
**Success Criteria** (what must be TRUE):
  1. Playwright tests verify layout at mobile (320px, 375px), tablet (768px), and desktop (1024px, 1440px) viewports
  2. No layout breakage, overflow, or unreadable text at any tested viewport
  3. Navigation menu is functional at all viewport sizes
**Plans**: 1 plan

Plans:
- [ ] 06-01-PLAN.md -- Playwright setup, responsive test suite for all 6 public routes at 5 viewports, screenshot evidence

### Phase 7: Audit Documentation Cleanup
**Goal**: All 10 partial documentation gaps are resolved — SUMMARY.md frontmatter and VERIFICATION.md body match actual status
**Depends on**: Phase 5
**Requirements**: DEPLOY-04, NAV-01, NAV-02, CIVX-01, CIVX-02, DSGN-03, DEPLOY-01, DEPLOY-02, DEPLOY-03, DEPLOY-05
**Gap Closure**: Closes 10 partial requirement documentation gaps from v1.0 audit
**Success Criteria** (what must be TRUE):
  1. SUMMARY.md files (01-01, 02-02, 03-01, 03-03, 04-03) include correct `requirements_completed` frontmatter
  2. Phase 3 VERIFICATION.md body matches frontmatter status (both say passed)
  3. All 26 v1 requirements show as satisfied in a re-audit
**Plans**: 1 plan

Plans:
- [x] 07-01-PLAN.md -- Fix SUMMARY.md frontmatter gaps, correct VERIFICATION.md body/frontmatter mismatch, re-audit 26/26 requirements

### Phase 8: Tech Debt Cleanup
**Goal:** Resolve all accumulated tech debt from v1.0 audit -- fix accessibility contrast issues, harden deployment fragilities, add DB seed data for full Playwright test coverage, and document external setup items
**Requirements**: DSGN-05 (hardening), DEPLOY-05 (hardening), SEO-01 (hardening)
**Depends on:** Phase 7
**Gap Closure:** Closes 10 tech debt items from v1.0 audit
**Success Criteria** (what must be TRUE):
  1. Footer text meets WCAG AA contrast requirements against navy background
  2. Red accent color verified at or above 4.5:1 contrast ratio
  3. Media staticDir uses absolute path resistant to WORKDIR changes
  4. Homepage OpenGraph image dynamically uses featured article image
  5. Seed data enables all Playwright tests to execute with zero skips
  6. Deployment runbook documents Cloudflare DNS, Docker build DB, and JSON-LD validation
**Plans:** 3 plans

Plans:
- [ ] 08-01-PLAN.md -- Footer contrast fix, red color verification, Media staticDir hardening, homepage OG image
- [ ] 08-02-PLAN.md -- Deployment documentation (Cloudflare DNS, Docker build DB, JSON-LD validation)
- [ ] 08-03-PLAN.md -- Seed script for test content, full Playwright test suite verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CMS Foundation | 0/3 | Planned    |  |
| 2. Brand & Design System | 0/2 | Planned    |  |
| 3. Site Pages & Navigation | 1/3 | In progress | - |
| 4. SEO & Production Deployment | 0/3 | Not started | - |
| 5. Critical Build & Route Fixes | 0/2 | Planned    |  |
| 6. Responsive Device Testing | 0/1 | Planned    |  |
| 7. Audit Documentation Cleanup | 0/1 | Not started | - |
| 8. Tech Debt Cleanup | 0/3 | Planned    |  |
