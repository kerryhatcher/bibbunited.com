# BIBB United

## What This Is

A civic advocacy website for the BIBB community, starting with local school system issues. The site informs residents about what's happening -- budgets, policies, board decisions -- and activates them to take action: attend meetings, contact officials, and get involved. Bold, urgent design with dual-mode color switching (community/urgent) that demands attention. Powered by Payload CMS 3.x so a small editorial team can publish content without touching code. Deployed as a single Docker container on self-hosted K8s.

## Current State

**Version:** v1.1 in progress (v1.0 shipped 2026-03-24)
**Codebase:** 6,045 LOC (TypeScript/TSX/CSS), 185 files
**Test coverage:** 160 Playwright e2e tests across 5 viewports
**Requirements:** 26/26 v1 requirements satisfied; 11/25 v1.1 requirements satisfied (Phase 10 complete)

## Core Value

Community members can find clear, actionable information about their local school system and know exactly what to do about it.

## Requirements

### Validated

- ✓ Rich text pages with headings, images, pull quotes, callouts, embeds, tables (CONT-01) -- v1.0
- ✓ News posts with title, body, publish date, featured image (CONT-02) -- v1.0
- ✓ Call-to-action blocks on pages and news posts (CONT-03) -- v1.0
- ✓ Site-wide urgent banner with toggle, message, optional link (CONT-04) -- v1.0
- ✓ Non-technical editors manage all content via Payload CMS admin (CONT-05) -- v1.0
- ✓ CMS-managed navigation menu with one-level dropdowns (NAV-01) -- v1.0
- ✓ Menu items support internal page links and external URLs (NAV-02) -- v1.0
- ✓ About/Mission page accessible from navigation (NAV-03) -- v1.0
- ✓ Contact Your Officials page with names, roles, emails, phones (CIVX-01) -- v1.0
- ✓ Meeting Schedule page with upcoming school board meetings (CIVX-02) -- v1.0
- ✓ Bold activist visual design with strong colors and urgency (DSGN-01) -- v1.0
- ✓ BIBB United brand identity: logo, color palette, typography (DSGN-02) -- v1.0
- ✓ Clear, scannable homepage with latest news, callouts, hero (DSGN-03) -- v1.0
- ✓ Fully responsive, mobile-first layout at 5 viewport sizes (DSGN-04) -- v1.0
- ✓ WCAG 2.1 AA accessible design (DSGN-05) -- v1.0
- ✓ Content freshness signals with timestamps (DSGN-06) -- v1.0
- ✓ Print-friendly CSS for articles (DSGN-07) -- v1.0
- ✓ OpenGraph and Twitter Card meta tags on all pages (SEO-01) -- v1.0
- ✓ JSON-LD structured data for articles and organization (SEO-02) -- v1.0
- ✓ Auto-generated sitemap.xml (SEO-03) -- v1.0
- ✓ CMS-configurable meta descriptions (SEO-04) -- v1.0
- ✓ Dockerized Next.js + Payload single container (DEPLOY-01) -- v1.0
- ✓ K8s manifests with Traefik ingress (DEPLOY-02) -- v1.0
- ✓ Cloudflare tunnel with admin route cache bypass (DEPLOY-03) -- v1.0
- ✓ PostgreSQL connection configured (DEPLOY-04) -- v1.0
- ✓ Persistent media storage across pod restarts (DEPLOY-05) -- v1.0

### Active

(Defined in REQUIREMENTS.md for v1.1)

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

## Context

- **Community:** BIBB is a local community with an active school system needing better civic engagement and transparency
- **Content strategy:** Mix of long-form explainer pages and timely news posts, plus resource pages (contacts, schedules)
- **Editorial team:** 2-3 people managing content through Payload CMS admin panel
- **Infrastructure:** Self-hosted K8s cluster with Traefik ingress and Cloudflare tunnels
- **Codebase:** Next.js 15 + React 19 + Tailwind v4 + Payload CMS 3.x + PostgreSQL
- **Shipped:** v1.0 MVP on 2026-03-24 with 8 phases, 18 plans, 26/26 requirements

## Constraints

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x -- non-negotiable
- **Database**: PostgreSQL -- required by deployment environment
- **Hosting**: Self-hosted K8s with Traefik + Cloudflare tunnels -- no cloud PaaS
- **Content team**: Must be manageable by non-technical editors through Payload admin UI

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Payload CMS 3.x with PostgreSQL | User-specified stack; Payload 3.x has first-class Next.js integration | ✓ Good -- v1.0 |
| Self-hosted K8s deployment | User has existing infrastructure; avoids vendor lock-in | ✓ Good -- v1.0 |
| SEO + JSON-LD structured data | Civic advocacy needs discoverability; rich snippets improve search | ✓ Good -- v1.0 |
| GitOps with ArgoCD | CI builds to GHCR, ArgoCD syncs -- zero-touch deployments | ✓ Good -- v1.0 |
| Bold activist visual direction | Site's purpose is advocacy -- design conveys urgency | ✓ Good -- v1.0 |
| Two content types (pages + news) | Covers evergreen reference content and timely updates | ✓ Good -- v1.0 |
| CMS-managed navigation + civic pages | Navigation, Officials, Meetings all CMS-managed for editorial independence | ✓ Good -- v1.0 |
| Tailwind v4 CSS-first config | Dual-mode color switching via CSS variables; no tailwind.config.js needed | ✓ Good -- v1.0 |
| Lexical rich text editor | Payload 3.x default; extensible with custom blocks (PullQuote, Callout, Embed) | ✓ Good -- v1.0 |
| DOM assertions over pixel-diff testing | CMS content changes; structural assertions are more stable than screenshots | ✓ Good -- v1.0 |
| Seed script for test data | Enables full Playwright test coverage without manual setup | ✓ Good -- v1.0 |

## Current Milestone: v1.1 Production Polish

**Goal:** Fix all UI/UX review issues and perform a final quality audit so the site is production-ready -- visually polished, fully accessible, optimized, and SEO-complete.

**Target features:**
- Fix 4 critical appearance issues (footer contrast, empty nav, empty hero, dark seed images)
- Fix 6 high-priority quality issues (missing H1, skip-to-content, Next.js Link/Image migration, admin email exposure, keyboard trap)
- Fix 10 medium issues (duplicate titles, canonical URLs, OG tags, sitemap gaps, layout spacing, empty states, news excerpts, active nav indicator, cache headers, seed alt text)
- Fix 5 low issues (footer self-link, missing OG image, X-Powered-By header, footer focus rings, sitemap priority)
- Final quality audit: full automated re-review to verify all fixes, catch regressions, and identify remaining polish opportunities

**Source:** UI-UX-REVIEW-2026-03-24.md (25 issues across 4 priority tiers)

## Future Milestone Ideas

- Topic taxonomy/tags (TAXO-01, TAXO-02 from v2 backlog)
- Email newsletter subscription (ENGMT-01, ENGMT-02 from v2 backlog)
- Resource links page (RSRC-01 from v2 backlog)
- Analytics integration (Plausible/Umami)

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-03-24 -- Phase 9 (Foundation & Config) complete*
