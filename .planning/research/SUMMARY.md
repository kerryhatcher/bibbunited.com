# Project Research Summary

**Project:** BIBB United — v1.1 Production Polish
**Domain:** Civic advocacy website — 25 UI/UX quality fixes on a shipped v1.0
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

BIBB United is a shipped civic advocacy website built on Next.js 16 + Payload CMS 3.x + Tailwind v4 + PostgreSQL. The v1.1 milestone is not a new-feature release — it is a 25-issue production polish pass covering accessibility gaps, image optimization, SEO completeness, and navigation UX. No new dependencies are needed. All fixes operate within the existing architecture and toolchain.

The recommended approach is to sequence fixes by dependency chain, not by severity alone. Three critical migrations (next/link, next/image, and metadata/OG completeness) touch overlapping files and should each be done as a single coordinated batch. Foundation changes — config updates, database migrations for schema additions, seed script overhaul, and the og-default.png asset — must precede the component work to avoid rework. The research identified five phases that mirror natural dependency boundaries: Foundation, Core Component Migration, Accessibility and Layout, SEO and Metadata, and Content Polish.

The primary risks are regression-oriented, not complexity-oriented. The next/image migration carries the highest regression risk (CLS spikes from parent containers lacking `position: relative`). The Tailwind v4 `@theme initial` cascade behavior will resurface on any future dark-section component if not documented as a project convention. The metadata OG shallow-merge behavior means every page-level `openGraph` object must re-include `siteName` and `type` explicitly. All three are well-understood patterns with clear prevention strategies documented in the research.

## Key Findings

### Recommended Stack

The installed stack is verified and requires no changes for this milestone. STACK.md confirmed that Next.js is actually version 16.2.1 (not 15 as referenced in older docs), React 19.2.4, Payload CMS 3.80.0, and Tailwind 4.2.2. This version discrepancy matters in one place: Next.js 16 uses Turbopack by default, which may conflict with the existing webpack config block in `next.config.ts`.

**Core technologies:**
- Next.js 16.2.1: Full-stack framework — `next/image` and `next/link` optimizations are core to this milestone; `preload` replaces deprecated `priority` prop on images
- Payload CMS 3.80.0: CMS with Drizzle-managed PostgreSQL — schema changes (Users displayName field) require `payload migrate:create` + `payload migrate`
- Tailwind 4.2.2: CSS framework — `@theme initial` tokens do NOT cascade; color utilities must be applied directly to elements in dark sections, never relied on via CSS inheritance
- next-sitemap 4.2.3: Sitemap generation — requires `additionalPaths` extension to capture CMS-managed dynamic routes
- sharp 0.34.2: Image optimization — already installed; required for next/image server-side processing in Docker

### Expected Features

Research validated all 25 fixes as legitimate issues with clear implementation patterns. Priority tiers from FEATURES.md:

**Must have (table stakes — site appears broken without these):**
- Footer contrast fix (C1): `text-text-on-dark` Tailwind v4 cascade failure makes footer text invisible on dark background
- Navigation population via seed (C2): No nav items in CMS means no visible navigation
- Hero spotlight data and empty state fallback (C3): Empty hero creates a 540px dark void on the homepage
- Seed image replacement (C4): Dark placeholder images make content unreadable

**Must have (core quality):**
- `next/link` migration across all internal links (H3): Raw `<a>` tags cause full page reloads
- `next/image` migration for all images (H4): Raw `<img>` tags serve no WebP/AVIF, no responsive srcset, no lazy loading
- Skip-to-content link (H2): WCAG 2.4.1 Level A; keyboard users trapped in nav menus
- Homepage H1 (H1): Missing H1 is the highest-impact single SEO and accessibility gap
- Mobile menu keyboard trap fix (H6): WCAG 2.1.2 Level A; close button focusable when panel is off-screen
- Admin email exposure fix (H5): Article bylines show `admin@bibbunited.com` instead of a display name

**Should have (SEO and polish):**
- Duplicate title template fix (M1), canonical URLs (M2), complete OG tags (M3), dynamic sitemap (M4), active nav indicator (M8), empty state messaging (M6), news card excerpts (M7)

**Defer until after 25 issues are resolved:**
- Blur-up image placeholders — requires a Payload `afterChange` hook to generate blur hashes; nice differentiator but out of scope for this pass

**Explicitly out of scope:**
- Full WCAG 2.2 AAA compliance, custom image CDN, client-side search, dynamic OG image generation per article

### Architecture Approach

The architecture is unchanged for this milestone. All 25 fixes are in-place modifications to existing components, config files, and the seed script. One new file (`src/proxy.ts` or `next.config.ts` headers config for media cache) and one new asset (`public/og-default.png`) are required. One small new client component (`FooterCTA`) extracts pathname-dependent CTA buttons from the server-rendered Footer to avoid converting the entire footer to a client component.

**Major components being modified:**
1. `Header.tsx` (client component) — `next/link`, `usePathname()` active indicator, `inert` attribute for focus trap
2. `Footer.tsx` (server component) — text color fix, `next/link`, focus ring styles, CTA extracted to client wrapper
3. `Card.tsx` / `HeroSpotlight.tsx` / `LatestNews.tsx` — coordinated `next/link` + `next/image` migration
4. `layout.tsx` — skip-to-content link, metadata base, `pt-16` evaluation
5. `next.config.ts` — `poweredByHeader: false`, media cache headers
6. `next-sitemap.config.cjs` — `additionalPaths` for CMS dynamic routes, `transform` for per-route priorities
7. `Users.ts` collection — additive `displayName` field (requires Drizzle migration)
8. `seed.ts` — nav data, hero data, better images, descriptive alt text, displayName on seed user

**Key pattern: batch migrations.** The `next/link` and `next/image` migrations each touch 7+ files. Research strongly recommends completing each as a single coordinated batch, not file-by-file, to avoid periods where some links cause full-page reloads and others do not.

### Critical Pitfalls

1. **next/image CLS regression from missing `position: relative` on parent containers** — Every `<Image fill>` parent must have `className="relative"` and explicit dimensions (via aspect-ratio or fixed height). `Card.tsx` line 23 is the highest risk; its parent `<div>` needs `relative` added. Test CLS with Lighthouse after the image migration batch, not just at the end of the milestone. Consequence: CLS from 0.00 to 0.3+ (Core Web Vitals failure).

2. **Tailwind v4 `@theme initial` cascade will repeat on future dark-section components** — The footer contrast bug (C1) is caused by child elements inheriting `color` from `body` rather than the parent's `text-text-on-dark` class. The fix (`text-white` directly on the container and children) is correct for C1, but the same failure pattern will recur. Document as a project convention: always apply color utilities directly to elements in dark sections.

3. **OG metadata shallow merge erases layout-level fields** — When any page defines its own `openGraph` object, it completely replaces the layout's `openGraph` (not a deep merge). Every page-level `generateMetadata` that includes `openGraph` must also include `siteName: 'BIBB United'` and the appropriate `type`. Create a shared `baseOpenGraph` constant to enforce this.

4. **Removing `pt-16` from `<main>` hides content behind the sticky header** — The UI/UX review flags this padding as unnecessary, but it IS necessary: the sticky `h-16` header requires `pt-16` on main content so the first element is visible. Blindly removing it hides the top 64px of every page.

5. **next-sitemap silently omits CMS dynamic routes when the database is unavailable during build** — Without `additionalPaths` configured, `news/[slug]` and `[slug]` routes only appear in the sitemap if `generateStaticParams` succeeded with DB access during the build. CI environments without DB access produce silently incomplete sitemaps.

## Implications for Roadmap

Based on research, the dependency graph points to exactly the 5-phase structure ARCHITECTURE.md derived from direct codebase analysis. The convergence of FEATURES.md priority tiers, ARCHITECTURE.md dependency graph, and PITFALLS.md phase warnings all support this ordering.

### Phase 1: Foundation Fixes
**Rationale:** Configuration, database migration, seed overhaul, and the OG default image asset are prerequisites for downstream phases. None depend on each other and all can be done in any order within this phase.
**Delivers:** Updated `next.config.ts` (poweredByHeader, media cache headers), database migration for Users `displayName` field, overhauled seed script (nav data, hero data, better images, descriptive alt text, displayName on seed user), branded `og-default.png` asset (1200x630).
**Addresses:** L3 (X-Powered-By), M9 (media cache headers), H5 prerequisite (displayName field migration), C2/C3/C4/M10 (seed overhaul).
**Avoids:** Pitfall 13 (migration not run before byline code change), Pitfall 14 (seed idempotency broken by alt text changes — switch to filename-based idempotency checks).

### Phase 2: Core Component Migration
**Rationale:** next/link and next/image migrations touch overlapping files and have the highest user-visible impact. Doing them as coordinated batches in the same phase prevents inconsistent navigation behavior and eliminates rework.
**Delivers:** All `<a href>` internal links replaced with `<Link>`, all `<img>` replaced with `<Image>` (with correct `sizes` props and `position: relative` on fill parents), Footer contrast fixed, Hero empty state handled, Header focus trap corrected.
**Addresses:** H3 (next/link), H4 (next/image), C1 (footer contrast), C3 code side (hero empty state), H6 (focus trap).
**Avoids:** Pitfall 1 (CLS regression — audit parent `relative` before each `fill` usage), Pitfall 3 (Tailwind cascade — apply `text-white` directly to all child text elements), Pitfall 5 (external links stay as `<a>`, not `<Link>`).

### Phase 3: Accessibility and Layout
**Rationale:** These fixes improve document structure and keyboard accessibility. They are independent of the component migrations above and follow naturally once the component layer is stable.
**Delivers:** Skip-to-content link (z-[9999], positioned above sticky header), Homepage `sr-only` H1, `pt-16` evaluation (keep or redistribute per-page), actionable empty state messaging for Contact Officials and Meetings, active nav indicator using `usePathname()`, `FooterCTA` client component for self-link suppression, focus ring styles on footer links.
**Addresses:** H2 (skip link), H1 (homepage H1), M5 (layout padding), M6 (empty states), M8 (active nav), L1 (footer self-link), L4 (focus indicators).
**Avoids:** Pitfall 6 (skip link hidden behind z-50 sticky header — use `z-[9999]` and `focus:fixed`), Pitfall 7 (mobile menu `inert` must be bidirectional — also apply `inert` to main content when menu is open), Pitfall 10 (do not blindly remove `pt-16`).

### Phase 4: SEO and Metadata
**Rationale:** Metadata fixes are independent of visual rendering and can be batched. The og-default.png asset from Phase 1 is required. The Users `displayName` migration from Phase 1 must be applied before the byline fix lands.
**Delivers:** Duplicate title template fixed (page `generateMetadata` returns bare title only), canonical URLs on all pages, complete OG tags (type, siteName, url, description per page), dynamic sitemap including all CMS routes, correct sitemap priorities (homepage 1.0, news 0.8, static 0.6), article byline reading `displayName` with "BIBB United Staff" fallback.
**Addresses:** M1 (title dedup), M2 (canonical), M3 (OG completeness), M4 (sitemap), L5 (sitemap priorities), H5 (byline fix).
**Avoids:** Pitfall 4 (double suffix — pages return bare title, layout template handles suffix), Pitfall 8 (OG shallow merge — every page `openGraph` must include `siteName` and `type`), Pitfall 9 (sitemap misses CMS routes — use `additionalPaths`), Pitfall 12 (trailing slash canonical mismatch — use `metadataBase` with relative paths).

### Phase 5: Content Polish
**Rationale:** Content quality improvements with no blockers from other phases. The news excerpts feature requires an additive schema change and is a differentiator, not table stakes.
**Delivers:** `excerpt` text field added to `NewsPosts` collection (migration required), excerpt displayed on listing cards with `line-clamp-2`, seed alt text finalized if not already complete in Phase 1.
**Addresses:** M7 (news excerpts), M10 (seed alt text).
**Avoids:** Pitfall 13 pattern (new collection field requires migration — same process as Phase 1 Users displayName).

### Phase Ordering Rationale

- Phase 1 is non-negotiable first: the database migration for `displayName` must exist before Phase 4 byline code reads the field; seed data must exist before active nav indicator can be tested; og-default.png must exist before Phase 4 OG metadata references it.
- Phases 2-4 are ordered by user-visible impact: broken visual appearance (Phase 2) before invisible accessibility gaps (Phase 3) before invisible SEO gaps (Phase 4). A single developer working sequentially should see the most dramatic visual improvement in Phase 2.
- Phase 5 is last because it is a differentiator requiring a schema change, not a fix for a broken behavior.
- The `next/link` and `next/image` migrations MUST each be completed in a single batch to avoid inconsistent behavior during the window when only some links/images are migrated.

### Research Flags

Phases likely needing deeper research or verification during execution:

- **Phase 1 (media cache headers approach):** Two approaches are documented — `next.config.ts` `headers()` function (declarative, no runtime overhead) vs `src/proxy.ts` (Next.js 16 middleware successor). The `headers()` approach is simpler and recommended, but the `proxy.ts` naming convention needs verification against official Next.js 16 docs before implementation.
- **Phase 2 (Turbopack/webpack build conflict):** Next.js 16 uses Turbopack by default. The existing webpack config block in `next.config.ts` may cause `next build` to fail. Verify `pnpm build` succeeds before starting Phase 2 component changes. If it fails, migrate the `extensionAlias` config to Turbopack format.
- **Phase 4 (next-sitemap `additionalPaths` with Payload CJS):** The `additionalPaths` function in a CJS config file using `require('payload')` may have ESM/CJS compatibility issues (Payload 3.x is ESM-first). If this proves problematic, switch to Next.js App Router `sitemap.ts` which uses Payload's Local API natively.

Phases with well-established patterns (no additional research needed):

- **Phase 1:** Config changes, Drizzle migration, seed script — all established Payload 3.x patterns.
- **Phase 3:** Skip link, `inert` attribute, `usePathname()` active indicator — well-documented WCAG and Next.js patterns.
- **Phase 5:** Payload collection `text` field addition — identical pattern to Phase 1 Users migration.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Installed versions verified directly from package.json. Next.js 16 APIs confirmed for all migration patterns. One MEDIUM flag: Turbopack/webpack build compatibility needs runtime verification. |
| Features | HIGH | All 25 issues sourced from direct UI/UX review of the running site. WCAG standards and Next.js feature APIs are well-documented. Priority ordering validated across FEATURES.md and ARCHITECTURE.md independently. |
| Architecture | HIGH | Based on direct codebase analysis of all 55 source files. Component map, file paths, and dependency chains confirmed against actual code, not inferred. |
| Pitfalls | HIGH | Top critical pitfalls confirmed directly in codebase (CLS regression in Card.tsx, metadata shallow merge in layout.tsx, Tailwind cascade in styles.css + Footer.tsx). Two MEDIUM items: `inert` React 19 attribute handling and `usePathname()` hydration edge cases. |

**Overall confidence:** HIGH

### Gaps to Address

- **Turbopack build compatibility:** Verify `pnpm build` succeeds before any Phase 2 work. If it fails due to webpack config conflict, the `resolve.extensionAlias` setting needs migration to Turbopack format before component changes begin.
- **Media cache implementation approach:** Two valid approaches documented in research (config `headers()` vs `proxy.ts`). Settle on `next.config.ts` `headers()` as the first attempt in Phase 1; it is declarative and zero-overhead.
- **next-sitemap `additionalPaths` ESM/CJS compatibility:** If `require('payload')` in the CJS sitemap config fails, fall back to the App Router `sitemap.ts` pattern. This is a known risk area documented in both STACK.md and ARCHITECTURE.md.
- **og-default.png design:** The image must be created as a design task before Phase 4 can complete. It is a 1200x630 branded image. This is a content/design deliverable, not a code change.

## Sources

### Primary (HIGH confidence)
- Next.js 16 official docs (upgrade guide, Image API, generateMetadata API, Link API, usePathname) — stack patterns, migration guidance, breaking changes
- Payload CMS 3.x docs — schema changes, migration workflow, media URL behavior
- Direct codebase analysis (2026-03-24, all source files) — component map, existing patterns, confirmed bug root causes
- UI-UX-REVIEW-2026-03-24.md — the 25 identified issues with root cause analysis

### Secondary (MEDIUM confidence)
- next-sitemap GitHub and npm — `additionalPaths` API signature
- Payload CMS community help forums — cache header patterns for media routes in Next.js 16
- Tailwind CSS v4 release notes and GitHub discussions — `@theme initial` cascade behavior with CSS custom properties
- WCAG 2.1 guidelines via testparty.ai and WebAIM — skip link, keyboard trap, focus visible implementation patterns

### Tertiary (context only)
- CSS CLS best practices articles — next/image migration patterns for CMS content
- Next.js metadata merging behavior (community blog posts, confirmed by official docs)
- Can I Use: `inert` attribute (93%+ browser support confirmed)

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
