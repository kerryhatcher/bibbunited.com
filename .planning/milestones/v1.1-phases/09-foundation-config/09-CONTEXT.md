# Phase 9: Foundation & Config - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

All prerequisite infrastructure, data, and assets are in place so downstream phases (10-12) can build on correct config, populated seed data, and required static assets. This phase delivers: overhauled seed script, Users displayName DB migration, branded OG default image, and cache/security header configuration.

</domain>

<decisions>
## Implementation Decisions

### Seed Data Strategy
- **D-01:** Generate 5-6 visually distinct seed images using sharp with different bright colors (red, blue, green, gold, etc.) and overlay text labels like "Budget", "Safety", "Schools". Images must contrast against the dark `bg-bg-secondary` (#1B2A4A) card backgrounds.
- **D-02:** Populate the Navigation global with menu items matching the site structure: News, About, Get Involved, Contact Officials, Meetings. Consider a "Take Action" dropdown grouping civic pages.
- **D-03:** Assign seeded news posts to the Homepage global's `heroSpotlight` array so the hero section renders content instead of an empty dark rectangle.
- **D-04:** Seed 3-4 sample Officials and 2-3 upcoming Meetings so those civic pages aren't empty in dev/test environments.
- **D-05:** All seed images must have descriptive, context-specific alt text (not generic "test image" text). Satisfies A11Y-05.
- **D-06:** Seed the Homepage global's `topicCallouts` array with relevant civic topic cards.

### OG Default Image
- **D-07:** Create a branded 1200x630 OG default image with "BIBB UNITED" text, tagline "Civic Advocacy for BIBB County", navy background, white text, and gold accent bar. Generated via sharp with SVG overlay.
- **D-08:** Upload the OG image as a Payload media item (not static `public/` file) so editors can swap it via admin panel without a code deploy. Seed script handles the initial upload.

### Cache & Security Headers
- **D-09:** Configure headers in `next.config.ts` — set `poweredByHeader: false` to suppress X-Powered-By (INFRA-02) and add `headers()` config for long-lived cache on media paths: `Cache-Control: public, max-age=31536000, immutable` (INFRA-01).
- **D-10:** Single source of truth in Next.js config — no Traefik-level header changes needed.

### displayName Field
- **D-11:** Add `displayName` text field to Users collection as optional (not required). Frontend code in Phase 11 will fall back to "BIBB United Staff" when displayName is empty.
- **D-12:** Run Payload DB migration to add the column to PostgreSQL.
- **D-13:** Seed script sets the seed user's displayName to "BIBB United Staff".

### Claude's Discretion
- Navigation menu structure details (exact dropdown groupings, ordering) — Claude picks a sensible structure based on seeded pages
- Exact bright colors and text labels for seed images — Claude chooses visually distinct combinations
- SVG layout details for the OG image — Claude implements the brand-forward design described above
- Cache header path patterns — Claude determines which routes get long-lived cache headers

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### UI/UX Review (source of all v1.1 issues)
- `UI-UX-REVIEW-2026-03-24.md` — Issues C2 (empty nav), C3 (empty hero), C4 (dark seed images), H5 (admin email in bylines), and low-priority items L3 (X-Powered-By), L2 (missing OG image)

### Requirements
- `.planning/REQUIREMENTS.md` — VIS-02, VIS-03, VIS-04, A11Y-05, INFRA-01, INFRA-02, SEO-09

### Existing Code
- `src/seed.ts` — Current seed script to overhaul
- `src/collections/Users.ts` — Users collection needing displayName field
- `src/collections/Media.ts` — Media collection config (upload settings, image sizes)
- `src/globals/Navigation.ts` — Navigation global schema (items array with children)
- `src/globals/Homepage.ts` — Homepage global schema (heroSpotlight, topicCallouts)
- `src/collections/Officials.ts` — Officials collection for civic seed data
- `src/collections/Meetings.ts` — Meetings collection for civic seed data
- `next.config.ts` — Next.js config for header changes
- `src/payload.config.ts` — Payload config (collections, globals, plugins)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `sharp` is already a project dependency and used in the seed script for image generation — extend for multi-color images and OG image with SVG overlay
- `makeRichText()` helper in seed.ts creates Lexical-compatible rich text nodes — reuse for new seed content
- `formatSlug` hook auto-generates slugs from titles — seed script doesn't need to set slugs manually

### Established Patterns
- Seed script uses idempotent "find-or-create" pattern — check existence before creating
- Payload's `overrideAccess: true` used throughout seed for admin operations
- Media collection has predefined image sizes: thumbnail (400x300), card (768w), hero (1920w)
- Navigation global supports nested items with `children` array (one-level dropdowns)

### Integration Points
- `src/payload.config.ts` registers all collections — no changes needed (Users collection already registered)
- Payload's `payload migrate:create` generates migration files in `src/migrations/`
- Homepage global's `heroSpotlight` is a relationship array to `news-posts`
- Homepage global's `topicCallouts` needs title, blurb, icon (Lucide name), and link (relationship to pages)

</code_context>

<specifics>
## Specific Ideas

- Seed images should have text labels that match civic topics (e.g., "Budget", "Safety", "Schools", "Community", "Board Meeting") — makes the images feel intentional rather than random colored rectangles
- OG image design: navy background matching the site's brand color, bold white "BIBB UNITED" text, smaller tagline "Civic Advocacy for BIBB County", with a gold accent horizontal bar — professional and immediately identifiable when shared on social media

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-foundation-config*
*Context gathered: 2026-03-24*
