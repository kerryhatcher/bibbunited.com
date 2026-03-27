# BIBB United

## What This Is

A civic advocacy website for the BIBB community, starting with local school system issues. The site informs residents about what's happening -- budgets, policies, board decisions -- and activates them to take action: attend meetings, contact officials, and get involved. Bold, urgent design with dual-mode color switching (community/urgent) that demands attention. Powered by Payload CMS 3.x so a small editorial team can publish content without touching code. Deployed as a single Docker container on self-hosted K8s.

## Current Milestone: v2.0 CMS Data Model & Content

**Goal:** Restructure the data model around organizations, give editors control over homepage content, and automate upstream cache busting on publish.

**Target features:**

- Organization collection (flat — boards, bodies, authorities) with contact info
- Officials linked to an organization (refactor existing collection)
- Single rich text block on homepage between hero and latest news
- Automated upstream cache busting (Cloudflare/Traefik) on content publish

## Current State

**Version:** v1.1 shipped (2026-03-25)
**Codebase:** 7,308 LOC (TypeScript/TSX/CSS), 109 files changed since v1.0
**Test coverage:** 160 Playwright e2e tests + 61 audit tests (Lighthouse 100/100/100/100, axe-core zero violations, admin login) across 5 viewports
**Requirements:** 26/26 v1.0 requirements satisfied; 26/26 v1.1 requirements satisfied
**Quality:** Lighthouse perfect scores on all routes, WCAG 2.1 AA compliant, complete SEO metadata

## Core Value

Community members can find clear, actionable information about their local school system and know exactly what to do about it.

## Requirements

### Validated

**v1.0 MVP:**
- Rich text pages with headings, images, pull quotes, callouts, embeds, tables (CONT-01) -- v1.0
- News posts with title, body, publish date, featured image (CONT-02) -- v1.0
- Call-to-action blocks on pages and news posts (CONT-03) -- v1.0
- Site-wide urgent banner with toggle, message, optional link (CONT-04) -- v1.0
- Non-technical editors manage all content via Payload CMS admin (CONT-05) -- v1.0
- CMS-managed navigation menu with one-level dropdowns (NAV-01) -- v1.0
- Menu items support internal page links and external URLs (NAV-02) -- v1.0
- About/Mission page accessible from navigation (NAV-03) -- v1.0
- Contact Your Officials page with names, roles, emails, phones (CIVX-01) -- v1.0
- Meeting Schedule page with upcoming school board meetings (CIVX-02) -- v1.0
- Bold activist visual design with strong colors and urgency (DSGN-01) -- v1.0
- BIBB United brand identity: logo, color palette, typography (DSGN-02) -- v1.0
- Clear, scannable homepage with latest news, callouts, hero (DSGN-03) -- v1.0
- Fully responsive, mobile-first layout at 5 viewport sizes (DSGN-04) -- v1.0
- WCAG 2.1 AA accessible design (DSGN-05) -- v1.0
- Content freshness signals with timestamps (DSGN-06) -- v1.0
- Print-friendly CSS for articles (DSGN-07) -- v1.0
- OpenGraph and Twitter Card meta tags on all pages (SEO-01) -- v1.0
- JSON-LD structured data for articles and organization (SEO-02) -- v1.0
- Auto-generated sitemap.xml (SEO-03) -- v1.0
- CMS-configurable meta descriptions (SEO-04) -- v1.0
- Dockerized Next.js + Payload single container (DEPLOY-01) -- v1.0
- K8s manifests with Traefik ingress (DEPLOY-02) -- v1.0
- Cloudflare tunnel with admin route cache bypass (DEPLOY-03) -- v1.0
- PostgreSQL connection configured (DEPLOY-04) -- v1.0
- Persistent media storage across pod restarts (DEPLOY-05) -- v1.0

**v1.1 Production Polish:**
- Footer text readable with WCAG 4.5:1 contrast (VIS-01) -- v1.1
- Navigation menu populated with all site sections (VIS-02) -- v1.1
- Hero spotlight displays featured news on homepage (VIS-03) -- v1.1
- Seed images visually distinct and high-contrast (VIS-04) -- v1.1
- Homepage has proper H1 for screen readers (A11Y-01) -- v1.1
- Skip-to-content link visible on keyboard focus (A11Y-02) -- v1.1
- Mobile menu close button not focusable when hidden (A11Y-03) -- v1.1
- Footer links have visible high-contrast focus indicators (A11Y-04) -- v1.1
- All seed images have descriptive alt text (A11Y-05) -- v1.1
- All internal links use next/link for SPA navigation (COMP-01) -- v1.1
- All images use next/image with format optimization (COMP-02) -- v1.1
- Consistent page title template (SEO-05) -- v1.1
- Canonical URLs on all pages (SEO-06) -- v1.1
- Complete Open Graph tags on all pages (SEO-07) -- v1.1
- All pages in sitemap.xml (SEO-08) -- v1.1
- Default branded OG image (SEO-09) -- v1.1
- Article bylines show display name (UX-01) -- v1.1
- Active nav indicator with aria-current (UX-02) -- v1.1
- News cards show excerpt text (UX-03) -- v1.1
- Actionable empty states on civic pages (UX-04) -- v1.1
- Footer CTA doesn't link to current page (UX-05) -- v1.1
- Correct spacing below sticky header (UX-06) -- v1.1
- Media served with long-lived cache headers (INFRA-01) -- v1.1
- X-Powered-By header not exposed (INFRA-02) -- v1.1
- Homepage priority 1.0 in sitemap (INFRA-03) -- v1.1
- Full automated quality audit passes (QA-01) -- v1.1

### Active

- [ ] Organization collection with name, website, phone, address
- [ ] Officials linked to an organization
- [ ] Editable homepage content between hero and latest news
- [ ] Automated upstream cache busting (Cloudflare/Traefik)

### Out of Scope

- User accounts / visitor login -- broadcast site, not a community platform
- Comments or discussion forums -- moderation complexity with no clear value
- Donation / payment processing -- PCI compliance concerns; link to hosted solution
- Full-text search -- site small enough (<50 pages) to navigate via menu
- Event RSVP / ticketing -- over-engineering for public meetings
- Multi-language support (i18n) -- significant complexity, defer if needed
- Real-time notifications / push -- social media serves this function
- Admin analytics dashboard -- use external tool (Plausible, Umami)
- AI-generated content -- undermines credibility for civic trust content
- OAuth / social login for CMS -- Payload's built-in auth is sufficient
- Blur-up image placeholders -- requires Payload upload hook; nice-to-have post-v1.1

## Context

- **Community:** BIBB is a local community with an active school system needing better civic engagement and transparency
- **Content strategy:** Mix of long-form explainer pages and timely news posts, plus resource pages (contacts, schedules)
- **Editorial team:** 2-3 people managing content through Payload CMS admin panel
- **Infrastructure:** Self-hosted K8s cluster with Traefik ingress and Cloudflare tunnels
- **Codebase:** Next.js 15 + React 19 + Tailwind v4 + Payload CMS 3.x + PostgreSQL
- **Shipped:** v1.0 MVP on 2026-03-24 (8 phases, 18 plans, 26/26 requirements); v1.1 Production Polish on 2026-03-25 (6 phases, 14 plans, 26/26 requirements)
- **Quality baseline:** Lighthouse 100/100/100/100 on all routes, zero WCAG violations, 221 automated tests

## Constraints

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x -- non-negotiable
- **Database**: PostgreSQL -- required by deployment environment
- **Hosting**: Self-hosted K8s with Traefik + Cloudflare tunnels -- no cloud PaaS
- **Content team**: Must be manageable by non-technical editors through Payload admin UI

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Payload CMS 3.x with PostgreSQL | User-specified stack; Payload 3.x has first-class Next.js integration | Good -- v1.0 |
| Self-hosted K8s deployment | User has existing infrastructure; avoids vendor lock-in | Good -- v1.0 |
| SEO + JSON-LD structured data | Civic advocacy needs discoverability; rich snippets improve search | Good -- v1.0 |
| GitOps with ArgoCD | CI builds to GHCR, ArgoCD syncs -- zero-touch deployments | Good -- v1.0 |
| Bold activist visual direction | Site's purpose is advocacy -- design conveys urgency | Good -- v1.0 |
| Two content types (pages + news) | Covers evergreen reference content and timely updates | Good -- v1.0 |
| CMS-managed navigation + civic pages | Navigation, Officials, Meetings all CMS-managed for editorial independence | Good -- v1.0 |
| Tailwind v4 CSS-first config | Dual-mode color switching via CSS variables; no tailwind.config.js needed | Good -- v1.0 |
| Lexical rich text editor | Payload 3.x default; extensible with custom blocks (PullQuote, Callout, Embed) | Good -- v1.0 |
| DOM assertions over pixel-diff testing | CMS content changes; structural assertions are more stable than screenshots | Good -- v1.0 |
| Seed script for test data | Enables full Playwright test coverage without manual setup | Good -- v1.0 |
| Native inert attribute for mobile panel | React 19 supports inert natively; cleaner than manual aria-hidden management | Good -- v1.1 |
| Native App Router sitemap.ts/robots.ts | Eliminated next-sitemap ESM/CJS compatibility issues and postbuild step | Good -- v1.1 |
| Shared generatePageMeta helper | Single source of truth for metadata across all 7 routes; 4-level OG image fallback | Good -- v1.1 |
| Lighthouse + axe-core automated audit | Catches regressions objectively; perfect 100/100/100/100 baseline established | Good -- v1.1 |
| Data-only seed fix for nav URL | Corrected seed data rather than adding redirects; simpler, no code change needed | Good -- v1.1 |

## Future Milestone Ideas

- **v2.1 API & Data Exchange** — Swagger/OpenAPI spec, bulk org+officials import (one file per org), full site export/backup zip
- **v2.2 Civic Automation & Subscriptions** — BCSD meetings scraper (K8s CronJob, 12h), .ics calendar feed (webcal), .vcf vCard downloads; CalDAV/CardDAV/JMAP deferred to later
- Topic taxonomy/tags (TAXO-01, TAXO-02 from v2 backlog)
- Email newsletter subscription (ENGMT-01, ENGMT-02 from v2 backlog)
- Resource links page (RSRC-01 from v2 backlog)
- Analytics integration (Plausible/Umami)

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 after v2.0 milestone started*
