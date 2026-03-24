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
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

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
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD
- [ ] 03-03: TBD

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
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. CMS Foundation | 0/3 | Planned    |  |
| 2. Brand & Design System | 0/2 | Not started | - |
| 3. Site Pages & Navigation | 0/3 | Not started | - |
| 4. SEO & Production Deployment | 0/2 | Not started | - |
