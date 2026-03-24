# BIBB United

## What This Is

A civic advocacy website for the BIBB community, starting with local school system issues. The site informs residents about what's happening — budgets, policies, board decisions — and activates them to take action: attend meetings, contact officials, and get involved. Bold, urgent design that demands attention. Powered by Payload CMS so a small editorial team can publish content without touching code.

## Core Value

Community members can find clear, actionable information about their local school system and know exactly what to do about it.

## Requirements

### Validated

- [x] CMS-managed pages with rich text editor (headings, images, pull quotes, callouts, embeds, tables) — Validated in Phase 1: CMS Foundation
- [x] CMS-managed news posts with title, body, publish date, featured image, author — Validated in Phase 1: CMS Foundation
- [x] Call-to-action blocks on pages and news posts — Validated in Phase 1: CMS Foundation
- [x] Site-wide urgent banner with toggle, message, optional link — Validated in Phase 1: CMS Foundation
- [x] PostgreSQL-backed Payload CMS with draft/publish workflow — Validated in Phase 1: CMS Foundation

### Active

- [ ] Dockerized deployment to self-hosted K8s cluster via Traefik + Cloudflare tunnels

### Validated in Phase 2: Brand & Design System

- [x] Bold activist visual design — strong colors, attention-grabbing headlines, urgency
- [x] Fully responsive, mobile-first layout
- [x] BIBB United branding (logo, color palette, typography)

### Validated in Phase 3: Site Pages & Navigation

- [x] CMS-managed navigation menu with one-level dropdowns (internal + external links)
- [x] Homepage showcasing latest news and key pages
- [x] Contact Officials page with officials grouped by governing body
- [x] Meeting Schedule page with upcoming/past meetings
- [x] Content freshness signals (Published/Updated dates, relative time)
- [x] Print-friendly article output

### Out of Scope

- User accounts / login for visitors — this is a broadcast site, not a community platform
- Comments or discussion — advocacy happens in person and on existing social channels
- E-commerce / donations — not in v1
- Email newsletter — defer to v2
- Search — defer to v2 (site will be small enough to navigate via menu)
- OAuth / social login for CMS — Payload's built-in auth is sufficient for a small team

## Context

- **Community:** BIBB is a local community with an active school system that needs better civic engagement and transparency
- **Content strategy:** Mix of long-form explainer pages (budget breakdowns, policy analysis) and timely news posts (meeting recaps, breaking developments), plus resource pages (contacts, schedules, public records links)
- **Editorial team:** 2-3 people managing content through Payload CMS admin panel
- **Civic topics:** School system is first; the site architecture should support expanding to other civic topics later (but this is not a v1 requirement)
- **Infrastructure:** User has existing K8s cluster with Traefik ingress and Cloudflare tunnels — deployment target is a Docker container

## Constraints

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x — user-specified, non-negotiable
- **Database**: PostgreSQL — required by deployment environment and user preference
- **Hosting**: Self-hosted K8s with Traefik + Cloudflare tunnels — no cloud PaaS
- **Branding**: Needs to be created from scratch — no existing logo or color palette
- **Content team**: Must be manageable by non-technical editors through Payload admin UI

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Payload CMS 3.x with PostgreSQL | User-specified stack; Payload 3.x has first-class Next.js integration | Validated — Phase 1 |
| Self-hosted K8s deployment | User has existing infrastructure; avoids vendor lock-in and recurring cloud costs | -- Pending |
| Bold activist visual direction | Site's purpose is advocacy — design should convey urgency and demand attention | Validated — Phase 2 |
| Two content types (pages + news) | Covers both evergreen reference content and timely updates | Validated — Phase 3 |
| CMS-managed navigation + civic pages | Navigation, Officials, Meetings all CMS-managed for editorial independence | Validated — Phase 3 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-24 after Phase 3 completion*
