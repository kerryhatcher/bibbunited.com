# Research Summary: BIBB United

**Domain:** Civic advocacy / community information website
**Researched:** 2026-03-23
**Overall confidence:** MEDIUM (core architecture patterns are well-established and HIGH confidence; specific version numbers are MEDIUM due to inability to verify against live npm registry)

## Executive Summary

BIBB United is a civic advocacy website for informing community members about local school system issues and activating them to take action. The technology stack is user-specified and well-suited to the problem: Next.js + React for fast, SEO-friendly page rendering; Payload CMS 3.x for editorial content management; PostgreSQL for structured civic data; Tailwind CSS for rapid UI development of a bold, activist visual design; and Docker on existing K8s infrastructure for deployment.

Payload CMS 3.x is the linchpin of this architecture. Unlike Payload 2.x (which ran as a separate Express server), 3.x runs inside the Next.js process itself. This means one build artifact, one Docker container, one deployment. The admin panel is served at `/admin` from the same app. For a small editorial team of 2-3 people managing pages and news posts, this is an ideal setup -- zero infrastructure overhead for the CMS layer.

The site is fundamentally a content publishing platform, not a web application. There is no user authentication for visitors, no complex client-side state, no real-time features. This simplicity is a strength: Server Components fetch data at render time via Payload's Local API, Tailwind handles styling, and the result is a fast static-ish site backed by a CMS. The main technical complexity lives in the Payload collection configuration (defining content types, fields, access control) and the Docker/K8s deployment pipeline.

The biggest risk is Payload CMS 3.x's relative newness (GA in late 2024). While the core is stable, the plugin ecosystem is still maturing, and community resources (tutorials, Stack Overflow answers) still frequently reference the 2.x architecture. The team should lean heavily on official Payload docs and not trust older blog posts or tutorials.

## Key Findings

**Stack:** Next.js 15 + React 19 + Payload CMS 3.x + PostgreSQL + Tailwind CSS v4, single Docker container deployment
**Architecture:** Monolithic Next.js app with Payload embedded; App Router with Server Components; Payload Local API for data fetching; two core collections (pages, news-posts) plus media and users
**Critical pitfall:** Payload 2.x vs 3.x confusion -- the architecture is completely different and old tutorials/patterns will lead to broken implementations

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Project Scaffolding and CMS Foundation** - Set up the Next.js + Payload project structure, configure PostgreSQL, define core collections (pages, news-posts, media, users), and verify the admin panel works for editors
   - Addresses: CMS-managed pages, CMS-managed news posts, PostgreSQL-backed Payload CMS with multi-user support
   - Avoids: Getting deep into frontend before the data model is solid

2. **Branding and Design System** - Establish the BIBB United visual identity (logo, color palette, typography) and build the Tailwind-based design system with the bold, activist aesthetic
   - Addresses: BIBB United branding, bold activist visual design
   - Avoids: Building pages before having a consistent design language

3. **Frontend Pages and Navigation** - Build the homepage, page templates, news post templates, and CMS-managed navigation
   - Addresses: Homepage, CMS-managed navigation, fully responsive mobile-first layout
   - Avoids: Trying to design and build simultaneously

4. **SEO, Polish, and Deployment** - Add SEO metadata, sitemap, og:image support, Docker build, K8s manifests, and production hardening
   - Addresses: Dockerized deployment, discoverability, production readiness
   - Avoids: Deploying before content structure and design are validated

**Phase ordering rationale:**
- CMS collections must exist before frontend pages can render content from them
- Branding/design system before page templates prevents rework -- you need to know your colors, typography, and component patterns before building pages
- Deployment last because there is no value in deploying an incomplete site; validation happens locally
- Each phase produces a tangible, testable artifact (working admin, design system, rendered pages, deployed site)

**Research flags for phases:**
- Phase 1: May need deeper research on Payload 3.x collection configuration patterns (blocks, relationships, access control)
- Phase 2: Standard design/Tailwind work; unlikely to need research
- Phase 3: May need research on Payload's navigation patterns (global configs for menus)
- Phase 4: Docker standalone output with Payload needs care; may need research on PersistentVolume configuration for media uploads

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Core technologies are correct; specific version numbers need verification against npm |
| Features | HIGH | Requirements are clearly defined in PROJECT.md with explicit scope boundaries |
| Architecture | HIGH | Payload 3.x + Next.js App Router architecture is well-documented and well-understood |
| Pitfalls | HIGH | Payload 2.x vs 3.x confusion is a well-known community issue; Docker deployment patterns are established |

## Gaps to Address

- Exact current versions of all packages (verify with `npm view` before scaffolding)
- Tailwind CSS v4 configuration approach changed significantly from v3 -- if project scaffolding generates v3 config, needs migration
- Payload CMS 3.x may have released new plugins or changed APIs since May 2025
- K8s manifest patterns for Payload (PersistentVolume for media, PostgreSQL connection in cluster) -- address during deployment phase
- Whether `create-payload-app` supports Tailwind v4 out of the box or requires manual setup
