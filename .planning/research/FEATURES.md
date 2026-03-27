# Feature Landscape: v2.0 CMS Data Model & Content

**Domain:** Civic advocacy website -- organization data model, editable homepage content, and upstream CDN cache busting
**Researched:** 2026-03-27
**Confidence:** HIGH (patterns verified via Payload CMS docs, Cloudflare API docs, and existing codebase analysis)

## Table Stakes

Features that are expected behavior for this milestone. Missing = the feature feels half-built or the system behaves incorrectly from an editor or visitor perspective.

### Organization Collection

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Organization collection with name, website, phone, address | The site already has a hard-coded `body` select field on Officials with three options (Board of Education, County Commission, Water Board). Replacing this with a proper collection lets editors add/remove organizations without code changes. Every government directory site manages organizations as first-class entities. | Low | New `Organizations` collection in Payload config | Flat collection (no nesting/hierarchy). Fields: `name` (text, required), `slug` (auto-generated), `website` (text/URL), `phone` (text), `address` (textarea), `email` (email), `description` (textarea -- short blurb about the org's purpose), `sortOrder` (number, sidebar). Use `admin.useAsTitle: 'name'`. |
| Officials linked to organization via relationship field | Currently Officials have a `body` select field with hard-coded values. Replacing with a `relationship` field to the Organizations collection means the source of truth for organization names, contact info, and grouping lives in one place. Editors expect to pick from a dropdown of real organizations, not hard-coded strings. | Low | Organizations collection must exist first. Existing Officials collection needs field migration. | Replace `body` (select) with `organization` (relationship, relationTo: 'organizations'). This is a breaking change to the data model -- existing Officials documents reference string values like 'board-of-education' that need migration to Organization document IDs. Requires a migration script or seed update. |
| Organization detail displayed on Contact Officials page | When officials are grouped by organization, visitors expect to see the organization's contact info (website, phone, address) as a group header -- not just the organization name. This is standard for any government directory page. | Low | Organizations collection populated, Officials linked, contact-officials page refactored | The `contact-officials/page.tsx` currently uses a hard-coded `bodyLabels` lookup and `bodyOrder` array. Replace with: query Organizations, iterate each org, display org details as section header, then list linked officials underneath. Use Payload's Join field OR query Officials filtered by organization. |
| Join field on Organizations to surface linked Officials in admin | Payload's Join field creates bi-directional visibility. Without it, an editor viewing an Organization in the admin panel has no idea which Officials belong to it -- they have to go search the Officials collection separately. This is a basic CMS usability expectation. | Low | Officials must have the `organization` relationship field | Add a `join` field to Organizations: `{ name: 'officials', type: 'join', collection: 'officials', on: 'organization' }`. This is a virtual field (no database change), purely for admin UX. Surfaces a list of linked officials directly on the Organization edit page. |
| Revalidation hooks on Organization changes | The existing pattern is established: every collection has `afterChange` hooks that call `revalidateCollection` with affected paths. Organizations affect the `/contact-officials` page. Editors expect changes to appear immediately, matching the existing publish-and-see behavior. | Low | `revalidateCollection` hook already exists in `src/hooks/revalidate.ts` | Add `hooks: { afterChange: [revalidateCollection(['/contact-officials'])] }` to the Organizations collection. Also update Officials hook to revalidate `/contact-officials` (already does this). |
| Seed script updated with organization data | The site has a comprehensive seed script that populates all collections for development and testing. Adding a new collection without seed data breaks the established DX pattern and means Playwright tests cannot verify the feature. | Low-Medium | Organizations collection defined, Officials field changed | Create 3 Organization documents (Board of Education, County Commission, Water Board) matching the existing hard-coded values. Update existing Official seed entries to reference the Organization document IDs instead of string values. Update seed's `makeOfficials` section. |

### Homepage Editable Content Block

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Rich text field on Homepage global between hero and latest news | The PROJECT.md explicitly requires "editable homepage content between hero and latest news." Editors currently cannot add any free-form content to the homepage -- the hero spotlight and latest news sections are entirely structured. A rich text block gives editors a place for announcements, mission statements, seasonal messages, or calls to action without developer involvement. | Low | Homepage global config, `richTextEditor` already defined in `src/editors/richText.ts` | Add a `richText` field named `contentBlock` (or `introContent`) to the Homepage global, positioned after `heroSpotlight` and before `topicCallouts` in the fields array. Use the existing `richTextEditor` config for full feature parity (headings, images, pull quotes, callouts, embeds, tables). Make it optional -- empty means the section simply does not render. |
| Frontend rendering of the content block | Adding the field to the CMS without rendering it on the frontend is a half-finished feature. The homepage must display the rich text between the HeroSpotlight and LatestNews components. | Low | `RichTextRenderer` component already exists at `src/components/shared/RichTextRenderer.tsx`, Homepage global field added | In `src/app/(frontend)/page.tsx`, read `homepage.contentBlock` from the existing `getHomepage()` call. Conditionally render `<RichTextRenderer data={homepage.contentBlock} />` between `<HeroSpotlight>` and `<LatestNews>` (or between hero and GetInvolvedCTA, depending on desired visual ordering). Wrap in a `<Section>` for consistent spacing. |
| Appropriate prose styling for the content block | The site uses the `prose` class from `@tailwindcss/typography` for CMS rich text content (see existing `RichTextRenderer`). The homepage content block must match the typographic style used on pages and news posts. Inconsistent styling signals a broken site. | Low | `@tailwindcss/typography` already installed, `RichTextRenderer` handles this | `RichTextRenderer` already wraps content in `prose prose-lg max-w-[65ch] mx-auto`. This may need slight adjustment for homepage context (perhaps `max-w-none` or a different width constraint to fit the homepage's full-width design language). |
| Seed script with sample content block | Tests and development need representative content. An empty content block in seed data means the feature is invisible during development and untestable. | Low | Homepage global field added | Add a `contentBlock` to the Homepage global seed data using the existing `makeRichText()` or `makeMultiParagraphRichText()` helpers. Example content: a welcome message or mission statement paragraph. |

### Automated Upstream Cache Busting

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| Cloudflare cache purge on content publish | The site runs behind Cloudflare Tunnels, which means Cloudflare's CDN caches responses at the edge. Currently, when an editor publishes content, `revalidatePath` invalidates the Next.js internal cache, but Cloudflare's edge cache may continue serving stale content until its TTL expires. Editors will see "I published but the site didn't update" -- this is the single most common CMS complaint with CDN-fronted sites. | Medium | Cloudflare API token with Zone.Cache Purge permission, Zone ID, environment variables | Cloudflare API: `POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache` with `Authorization: Bearer {token}`. Two strategies: (1) purge by URL -- surgical, purge only the affected paths, or (2) `purge_everything` -- simpler, purges all cached content. For a small site with infrequent publishes, `purge_everything` is pragmatic and eliminates edge cases. All plan tiers support all purge methods as of April 2025. |
| Traefik cache consideration | Traefik (the K8s ingress) does NOT cache HTTP responses by default. It is a pure reverse proxy without built-in caching middleware (unless Traefik Enterprise or the Souin plugin is explicitly configured). This means Traefik is not a cache-busting target -- only Cloudflare is. | None | Verify Traefik config has no caching middleware | **No action needed for Traefik.** Standard Traefik (open-source) passes requests through without caching. If the cluster has Souin or Traefik Enterprise HTTP Cache middleware, that would need purging too, but this is unlikely given the existing setup description. Confirm during implementation. |
| Hook-based cache purge triggered by Payload afterChange | The existing revalidation system uses Payload `afterChange` hooks. Cache busting must follow the same pattern -- no manual purge step for editors. The hook calls `revalidatePath` for Next.js internal cache AND calls the Cloudflare purge API for the CDN layer. This is a natural extension of the existing pattern. | Medium | Cloudflare credentials as env vars, utility function for API calls | Create a `purgeCloudflareCache` utility in `src/lib/cloudflare.ts`. Call it from the existing `revalidateCollection` and `revalidateGlobal` hook functions (or create a wrapper that does both). Use `fetch()` -- no npm package needed. Environment variables: `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN`. |
| Graceful failure on cache purge errors | The Cloudflare API may be unreachable, the token may be expired, or the zone ID may be wrong. A failed cache purge must NEVER prevent content from being saved in Payload. The purge is a best-effort side effect. | Low | Error handling in the purge utility | Wrap the `fetch` call in try/catch. Log errors (console.error or a logging utility) but do not throw. Return a success/failure boolean for optional monitoring. The existing `safeRevalidate` function in `revalidate.ts` follows this exact pattern -- silently catches errors. |
| Environment variable configuration | Editors and developers need zero-config deployment. The Cloudflare credentials must be injected via environment variables, not hard-coded. The feature should degrade gracefully (skip purging) when env vars are not set (e.g., in local development). | Low | `.env.example` updated, Docker Compose and K8s deployment config | Add `CLOUDFLARE_ZONE_ID` and `CLOUDFLARE_API_TOKEN` to `.env.example` (with placeholder values). In the purge utility, check if both are set before attempting to call the API. Skip silently in development. |
| Debouncing / batching for bulk operations | When a seed script creates 20 documents in rapid succession, firing 20 individual Cloudflare purge requests is wasteful and may hit rate limits (Free plan: 30,000 purge API requests/day). The existing `disableRevalidate` context flag handles this for revalidation; cache purging should respect the same flag. | Low | Existing `context.disableRevalidate` pattern in `revalidate.ts` | The `revalidateCollection` and `revalidateGlobal` hooks already check `req.context?.disableRevalidate || context?.disableRevalidate` and skip when true. The Cloudflare purge logic should follow the same guard. For individual publishes (the normal editorial flow), one purge per save is fine -- the site has infrequent publishes. |

## Differentiators

Features that go beyond the minimum requirement but add clear value. Not expected for this milestone, but could be included if scope allows.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| Organization page with dedicated URL | Instead of only showing organizations as section headers on the Contact Officials page, give each organization its own page (`/organizations/board-of-education`) with full details, linked officials, related meetings. Provides a canonical URL for sharing and linking. | Medium | Organizations collection with slug field, new frontend route, SEO metadata | A natural evolution but NOT in the active requirements. The current milestone only asks for Organizations as a data model linked to Officials. A dedicated page can be added in a future milestone. |
| Meetings linked to organizations | Meetings currently have no relationship to organizations. Adding an `organization` relationship to Meetings lets the site display "Board of Education Meetings" vs "County Commission Meetings" and enables filtering. | Low-Medium | Organizations collection, Meetings collection field addition | Currently meetings are flat with a free-text `title` field. Linking to organizations would enable grouped display on the meetings page and potential filtering. Not in active requirements but a logical extension. |
| Content block with conditional visibility toggle | Add an `enabled` boolean to the homepage content block so editors can toggle it on/off without deleting the content. Preserves draft content that may be seasonal (e.g., "Budget season starts March 1"). | Low | Homepage global field addition | A simple `checkbox` field named `showContentBlock` with default `true`. Frontend checks this before rendering. Small UX improvement for editors who want to pre-write content. |
| Purge-by-URL instead of purge-everything | Surgical cache invalidation by URL means only the specific changed page is purged, keeping the rest of the CDN cache warm. Better for performance on high-traffic sites. | Medium | URL construction logic in hooks, mapping collection documents to their public URLs | For a small civic site with infrequent publishes, the benefit over `purge_everything` is minimal. But for correctness: Officials change -> purge `/contact-officials`; News post change -> purge `/news/{slug}` and `/` and `/news`; Homepage global change -> purge `/`. The URL mapping already exists in the `revalidateCollection` path arrays. |
| Organizations directory page | A standalone `/organizations` page listing all organizations with their contact info, linked officials count, and meeting count. Like a phone book for local government bodies. | Medium | Organizations collection populated, new route, JSON-LD for GovernmentOrganization schema | Standard civic transparency pattern. Not in active requirements but would be a natural home for organization data beyond the Contact Officials page. |
| Webhook-based cache purge with retry queue | Instead of inline API calls in hooks, publish cache purge events to a lightweight queue (or use a Payload plugin event system) that retries on failure. More resilient than fire-and-forget fetch calls. | High | Queue infrastructure (Redis, BullMQ, or similar) | Over-engineering for this scale. The inline fetch with try/catch approach is the right level of complexity for a site with 2-3 editors and infrequent publishes. Revisit only if cache staleness becomes a recurring problem. |

## Anti-Features

Features to explicitly NOT build during this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Hierarchical organization tree (parent/child orgs) | The project explicitly specifies "flat -- boards, bodies, authorities." Hierarchy adds query complexity (recursive CTEs or self-referential relationships), admin UI confusion for non-technical editors, and rendering complexity. BIBB has ~3-5 organizations -- hierarchy is solving a problem that does not exist. | Keep organizations flat. Add a `sortOrder` field for display ordering. If hierarchy is ever needed, add a simple `parentOrganization` relationship field later -- Payload makes this trivial to add. |
| Organization types/categories taxonomy | With 3-5 organizations, adding a classification system (boards vs commissions vs authorities) is premature abstraction. Editors would need to manage both the organizations AND the taxonomy. | If grouping is ever needed, add a simple `type` select field with hard-coded options (matching the pattern the Officials collection is moving AWAY from, but appropriate at this tiny scale for display grouping only). |
| Blocks field with multiple content block types on homepage | Payload's `blocks` field type allows editors to compose pages from reusable block types (hero, CTA, text, image gallery, etc.). This is powerful but adds complexity: editors must understand block types, ordering becomes a concern, and the frontend needs renderers for each block type. | Use a single `richText` field. The existing Lexical editor already supports headings, images, pull quotes, callouts, embeds, and tables -- this covers every content pattern needed for a homepage content section. A single rich text field is simpler to edit, render, and test. |
| Draft preview for homepage content block | Payload supports draft/publish workflow, but the Homepage global currently has no versioning enabled. Adding draft preview for a single rich text field is over-engineering -- the editor can simply save and check the live page (which updates instantly via revalidation). | Rely on the existing publish-and-revalidate flow. Editors save, site updates immediately. If draft preview is needed in the future, enable `versions.drafts` on the Homepage global. |
| Cloudflare Workers for cache invalidation | Cloudflare Workers could intercept requests and implement custom cache logic at the edge. This is powerful but introduces a separate deployment artifact, a different runtime (V8 isolates), and Cloudflare-specific vendor lock-in. | Use the simple REST API purge endpoint called from Payload hooks. One fetch call, no additional infrastructure, no vendor-specific runtime. |
| Traefik Souin cache plugin | Adding an HTTP cache layer at the Traefik level would provide faster responses for repeat visitors. However, it introduces another cache layer that needs invalidation, configuration complexity, and potential debugging headaches (which cache is stale?). | Keep Traefik as a pure reverse proxy. Cloudflare provides CDN caching at the edge. Next.js provides server-side caching internally. Two cache layers are sufficient and well-understood. |
| Cache purge admin UI button | A "Purge CDN Cache" button in the Payload admin panel would let editors manually trigger cache invalidation. Sounds useful, but it signals that automatic cache busting is unreliable. | Make automatic cache busting reliable. If editors never see stale content, they never need a manual purge button. Log purge results for developer debugging, not editor interaction. |
| Full-page static generation (SSG) for all routes | Generating all pages at build time would eliminate server rendering entirely. But with a CMS that updates frequently, SSG means rebuilding the entire site on every change. ISR/on-demand revalidation is the correct pattern for a CMS-driven site. | Continue using Next.js server rendering with on-demand revalidation via `revalidatePath`. Pages are rendered on first request and cached until content changes trigger revalidation. |

## Feature Dependencies

```
Organizations collection ──── must exist before Officials can reference it
                         └── must exist before Join field can be added
                         └── must exist before seed script can reference org IDs

Officials field migration ─── depends on Organizations collection
                         └── breaks existing Officials data (select -> relationship)
                         └── seed script must be updated simultaneously

Contact Officials page ────── depends on Officials field migration complete
refactor                 └── depends on Organizations collection populated
                         └── can reuse existing page structure with modified queries

Homepage contentBlock ──────── independent of Organization work
field                   └── depends only on Homepage global config change
                        └── and frontend page.tsx update

Homepage content ───────────── depends on contentBlock field existing
rendering               └── reuses existing RichTextRenderer component

Cloudflare cache purge ─────── independent of Organization and Homepage work
utility                 └── depends on env vars (CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN)

Hook integration ───────────── depends on purge utility existing
(cache busting)          └── modifies existing revalidate.ts hooks
                         └── affects ALL collections and globals (universal)

Seed script updates ────────── depends on Organizations collection
                         └── depends on Officials field migration
                         └── depends on Homepage contentBlock field
                         └── should be updated last after all schema changes
```

## MVP Recommendation

### Phase 1: Organization Data Model (do first)

1. **Organizations collection** -- define collection config with all fields
2. **Officials field migration** -- replace `body` select with `organization` relationship
3. **Join field on Organizations** -- virtual, for admin UX
4. **Seed script update** -- create org documents, update official references
5. **Contact Officials page refactor** -- query orgs, group officials by org relationship

**Rationale:** This is the foundational data model change. The Officials field migration is a breaking change that affects the seed script, the frontend page, and potentially the admin workflows. Get this stable first.

### Phase 2: Homepage Content Block (do second)

6. **Homepage global field addition** -- add `contentBlock` richText field
7. **Frontend rendering** -- conditionally render between hero and news
8. **Seed script update** -- add sample content block data

**Rationale:** Completely independent of Organization work. Low complexity, low risk. Uses existing patterns (richTextEditor, RichTextRenderer). Can be done in parallel with Phase 1 if needed.

### Phase 3: Cache Busting (do last)

9. **Cloudflare purge utility** -- `src/lib/cloudflare.ts` with `purgeCache()` function
10. **Hook integration** -- extend `revalidateCollection` and `revalidateGlobal` to call purge
11. **Environment variable setup** -- `.env.example`, Docker Compose, K8s secrets
12. **Testing** -- verify purge fires on publish, verify graceful failure without env vars

**Rationale:** This is a cross-cutting concern that touches all hooks. Do it last so the Organization and Homepage changes are already stable and hooked up. Testing cache purging requires the full publish flow to be working.

**Defer:**
- **Organization detail pages** (`/organizations/{slug}`) -- not in active requirements, natural v2.1 feature
- **Meetings linked to organizations** -- not in active requirements, would be part of a data model expansion milestone
- **Purge-by-URL optimization** -- `purge_everything` is sufficient for this site's scale; optimize later if metrics show need

## Complexity Assessment

| Feature Area | Items | Estimated Effort | Risk Level | Notes |
|-------------|-------|-----------------|------------|-------|
| Organizations collection + config | 1 collection, 1 join field | 1-2 hours | Low | Standard Payload collection. Follows Officials/Meetings pattern exactly. |
| Officials field migration | 1 field change, seed update | 1-2 hours | Medium | Breaking change to data model. Existing data references string values; new field expects document IDs. Must coordinate seed script, frontend, and schema change. |
| Contact Officials page refactor | 1 page rewrite | 1-2 hours | Low | Query pattern changes (filter by relationship instead of string match), but component structure stays similar. Remove hard-coded `bodyLabels` and `bodyOrder`. |
| Homepage content block field | 1 global field addition | 30 min | Low | Adding a richText field to an existing global. Uses existing editor config. |
| Homepage content rendering | 1 component insertion | 30 min | Low | Conditional render of existing RichTextRenderer. May need styling adjustment for homepage context. |
| Cloudflare purge utility | 1 utility file | 1 hour | Low-Medium | Simple fetch call with error handling. Risk is in credential management and verifying the API works with Cloudflare Tunnels setup. |
| Hook integration | Modify revalidate.ts | 1 hour | Medium | Touches the existing revalidation system that works for ALL collections and globals. Must not break existing revalidation behavior. Test thoroughly. |
| Seed script updates | 1 file modification | 1-2 hours | Low | Mechanical changes -- add org data, update official references, add homepage content block. |
| Environment / deployment config | .env, Docker, K8s | 30 min | Low | Adding env vars to existing config files. |
| **Total** | **~10 items** | **~8-12 hours** | **Low-Medium** | Largest risk is the Officials field migration (data model breaking change) and hook integration (cross-cutting system modification). |

## Sources

- [Payload CMS Collection Hooks documentation](https://payloadcms.com/docs/hooks/collections) -- HIGH confidence
- [Payload CMS Global Hooks documentation](https://payloadcms.com/docs/hooks/globals) -- HIGH confidence
- [Payload CMS Join Field documentation](https://payloadcms.com/docs/fields/join) -- HIGH confidence
- [Payload CMS Relationship Field documentation](https://payloadcms.com/docs/fields/relationship) -- HIGH confidence
- [Payload CMS Rich Text Field documentation](https://payloadcms.com/docs/fields/rich-text) -- HIGH confidence
- [Payload CMS Rendering Rich Text guide](https://payloadcms.com/posts/guides/how-to-render-rich-text-from-payload-in-a-nextjs-frontend) -- HIGH confidence
- [Cloudflare Cache Purge API](https://developers.cloudflare.com/api/resources/cache/methods/purge/) -- HIGH confidence
- [Cloudflare Cache Purge documentation](https://developers.cloudflare.com/cache/how-to/purge-cache/) -- HIGH confidence
- [Cloudflare purge methods available for all plans (April 2025)](https://developers.cloudflare.com/changelog/2025-04-01-purge-for-all/) -- HIGH confidence
- [Traefik Enterprise HTTP Cache middleware](https://doc.traefik.io/traefik-enterprise/middlewares/http-cache/) -- MEDIUM confidence (confirms Traefik OSS does not cache by default)
- Existing codebase analysis: `src/hooks/revalidate.ts`, `src/globals/Homepage.ts`, `src/collections/Officials.ts`, `src/app/(frontend)/page.tsx`, `src/app/(frontend)/contact-officials/page.tsx` -- HIGH confidence (direct source code inspection)
