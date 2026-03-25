# Phase 12: SEO & Metadata - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 12-seo-metadata
**Areas discussed:** Sitemap approach, OG image fallback chain, Metadata helper pattern, Title template fix strategy, next-sitemap cleanup, OG type per page, Canonical URL for paginated content

---

## Sitemap Approach

| Option | Description | Selected |
|--------|-------------|----------|
| App Router sitemap.ts | Replace next-sitemap with native Next.js sitemap.ts route handler. Queries Payload directly. No ESM/CJS issues. | ✓ |
| Fix next-sitemap config | Keep next-sitemap but add additionalPaths callback. Runs at build time only. ESM/CJS risk. | |
| You decide | Claude picks the best approach. | |

**User's choice:** App Router sitemap.ts
**Notes:** Also decided to replace robots.txt with App Router robots.ts for consistency.

**Follow-up: Civic pages in sitemap?**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include them | /meetings, /contact-officials, /news listing at priority 0.8 | ✓ |
| Only CMS-managed content | Just homepage, pages, and news-posts | |

**User's choice:** Yes, include them

---

## OG Image Fallback Chain

| Option | Description | Selected |
|--------|-------------|----------|
| Payload media URL from SiteTheme global | Add ogDefaultImage field to SiteTheme. layout.tsx reads it. Falls back to /og-default.png. | ✓ |
| Static /og-default.png only | Keep using static file. Contradicts Phase 9 D-08. | |
| You decide | Claude picks. | |

**User's choice:** Payload media URL from SiteTheme global
**Notes:** SiteTheme global already exists with just a mode field. Natural place for the OG image config.

---

## Metadata Helper Pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Shared generatePageMeta utility | Function in src/lib/metadata.ts. Returns complete Metadata object. All pages call it. | ✓ |
| Fix each page individually | Update each generateMetadata export independently. More diff churn. | |
| You decide | Claude picks. | |

**User's choice:** Shared generatePageMeta utility

**Follow-up: Should helper fetch SiteTheme OG image itself?**

| Option | Description | Selected |
|--------|-------------|----------|
| Helper fetches it | Reads SiteTheme global. Callers don't manage fallback chain. | ✓ |
| Caller passes it in | Helper stays pure. Each page fetches default OG image. | |

**User's choice:** Helper fetches it

---

## Title Template Fix Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Absolute title for homepage | Homepage uses title: { absolute: '...' }. All other pages use short titles with template suffix. | ✓ |
| Short homepage title | Homepage uses layout default 'BIBB United' only. | |
| You decide | Claude picks. | |

**User's choice:** Absolute title for homepage

**Follow-up: CMS page title source?**

| Option | Description | Selected |
|--------|-------------|----------|
| meta.title with page title fallback | Use SEO plugin title if set, otherwise page title. | ✓ |
| Always use page title | Ignore meta.title. | |

**User's choice:** meta.title with page title fallback

---

## next-sitemap Cleanup

| Option | Description | Selected |
|--------|-------------|----------|
| Full removal | Delete config, dependency, postbuild script, static files. | ✓ |
| Keep as fallback | Leave installed but disabled. | |
| You decide | Claude handles. | |

**User's choice:** Full removal

---

## OG Type Per Page

| Option | Description | Selected |
|--------|-------------|----------|
| 'website' for all non-articles | News articles get 'article' with published_time/author. Everything else is 'website'. | ✓ |
| More granular types | Use 'profile' for officials, 'event' for meetings, etc. | |
| You decide | Claude picks. | |

**User's choice:** 'website' for all non-articles

---

## Canonical URL for Paginated Content

| Option | Description | Selected |
|--------|-------------|----------|
| Self-referencing canonicals, no pagination concern | Every page's canonical points to itself. Revisit when pagination is added. | ✓ |
| Root-only canonicals for listing pages | Listings always canonicalize to unpaginated root. | |

**User's choice:** Self-referencing canonicals, no pagination concern

---

## Claude's Discretion

- Exact implementation details of generatePageMeta helper
- SiteTheme OG image caching strategy
- Plan structure and order of operations
- Whether to cache SiteTheme fetch or rely on Payload request deduplication

## Deferred Ideas

None -- discussion stayed within phase scope
