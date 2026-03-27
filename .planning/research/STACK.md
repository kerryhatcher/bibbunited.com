# Technology Stack -- v2.0 CMS Data Model & Content

**Project:** BIBB United
**Milestone:** v2.0 -- Organization collection, homepage editable content, upstream cache busting
**Researched:** 2026-03-27
**Scope:** Stack additions and integration patterns for three new features on existing Payload CMS 3.x + Next.js 16 + PostgreSQL site.

## Installed Stack (Current Baseline)

| Technology | Installed Version | Purpose |
|------------|------------------|---------|
| Next.js | 16.2.1 | Full-stack framework |
| React | 19.2.4 | UI rendering |
| Tailwind CSS | 4.2.2 | Utility-first CSS |
| Payload CMS | 3.80.0 | Headless CMS |
| @payloadcms/db-postgres | 3.80.0 | PostgreSQL adapter (Drizzle ORM) |
| @payloadcms/richtext-lexical | 3.80.0 | Lexical rich text editor |
| @payloadcms/plugin-seo | 3.80.0 | SEO metadata fields |
| sharp | 0.34.2 | Image optimization |
| lucide-react | 1.0.1 | Icons |
| date-fns | 4.1.0 | Date formatting |

---

## New Dependencies Required: NONE

This milestone requires **zero new npm packages**. All three features are implemented using capabilities already present in the installed stack.

### Why No New Packages

| Feature | How It's Built | Why No New Dependency |
|---------|---------------|---------------------|
| Organization collection | Payload `CollectionConfig` with `relationship` field type | Payload's built-in relationship fields handle collection-to-collection links. Already used (e.g., Homepage heroSpotlight relates to news-posts). |
| Homepage rich text content | Payload `richText` field on Homepage global using existing `richTextEditor` config | The `@payloadcms/richtext-lexical` editor and `RichText` renderer component are already installed and configured with custom blocks (PullQuote, Callout, Embed). |
| Cloudflare cache purge | Native `fetch()` to Cloudflare REST API from Payload afterChange hooks | The Cloudflare purge API is a single POST endpoint. Adding the `cloudflare` npm SDK (26MB unpacked) for one API call is unjustifiable bloat. Node.js `fetch()` (available since Node 18, project uses Node 22) handles this cleanly. |

**Confidence:** HIGH -- all three approaches verified against installed codebase and official documentation.

---

## Feature 1: Organization Collection

### Stack Integration

No new technology. Uses Payload's existing `CollectionConfig` API.

**Key Payload field types needed (all built-in):**

| Field Type | Usage | Notes |
|------------|-------|-------|
| `text` | Name, phone, address line(s) | Already used in Officials, Meetings |
| `text` with URL validation | Website URL | Use `validate` function or Payload's built-in URL validation |
| `email` | Contact email | Already used in Officials |
| `textarea` | Description/notes | Already used in Meetings |
| `number` | Sort order | Already used in Officials (`sortOrder`) |

**Relationship refactor (Officials -> Organizations):**

The existing Officials collection uses a `select` field for `body` (governing body) with hardcoded options: `board-of-education`, `county-commission`, `water-board`. This will be refactored to a `relationship` field pointing to the new Organizations collection.

```typescript
// BEFORE (current Officials.ts)
{
  name: 'body',
  type: 'select',
  options: [
    { label: 'Board of Education', value: 'board-of-education' },
    // ...
  ],
}

// AFTER (refactored)
{
  name: 'organization',
  type: 'relationship',
  relationTo: 'organizations',
  required: true,
}
```

**Migration concern:** The `body` field stores string values (`board-of-education`). Changing to a `relationship` field changes the stored data type to an ID reference. A Payload migration (via `payload migrate:create`) will handle the schema change, but existing seed data and any production data will need a data migration script to map old select values to new Organization document IDs.

**Confidence:** HIGH -- Payload's `relationship` field is well-documented and already used in the codebase (Homepage heroSpotlight -> news-posts, topicCallouts -> pages).

### Revalidation Pattern

The existing `revalidateCollection` hook from `src/hooks/revalidate.ts` handles ISR cache invalidation. The Organization collection needs to revalidate:
- `/contact-officials` (the page that displays officials grouped by organization)
- Potentially the homepage if organizations appear there

This follows the exact same pattern as the existing `Officials` collection hook.

---

## Feature 2: Homepage Rich Text Content Block

### Stack Integration

No new technology. Uses the existing `richTextEditor` configuration from `src/editors/richText.ts` and the `RichTextRenderer` component from `src/components/shared/RichTextRenderer.tsx`.

**What changes in the Homepage global:**

Add a `richText` field to the existing `Homepage` global config between the `heroSpotlight` and `topicCallouts` fields:

```typescript
{
  name: 'contentBlock',
  type: 'richText',
  label: 'Content Block',
  editor: richTextEditor,  // Same editor used by Pages and NewsPosts
  admin: {
    description: 'Rich text content displayed between the hero and latest news sections',
  },
}
```

**Why reuse the existing editor:** The `richTextEditor` already includes HeadingFeature, UploadFeature, BlocksFeature (PullQuote, Callout, Embed), HorizontalRuleFeature, TableFeature, and FixedToolbarFeature. Editors can use the same familiar toolbar for homepage content as they do for pages and news posts. No new Lexical features or blocks are needed.

**Frontend rendering:** The `RichTextRenderer` component wraps `@payloadcms/richtext-lexical/react`'s `RichText` component with prose styling. It is already used on `[slug]/page.tsx` and `news/[slug]/page.tsx`. The homepage (`page.tsx`) will use the same component.

**Confidence:** HIGH -- identical pattern to existing richText fields on Pages and NewsPosts collections.

### Data Implications

The `richText` field stores Lexical's `SerializedEditorState` as JSON in the database. For the Homepage global, this is stored in the `globals` table. No schema changes beyond the automatic migration that Payload generates.

---

## Feature 3: Automated Upstream Cache Busting

### Architecture Overview

The caching architecture has three layers:

```
Browser -> Cloudflare Edge -> Traefik (K8s) -> Next.js (ISR cache)
```

**Current state of each layer:**

| Layer | Caching Behavior | Current Config |
|-------|-----------------|----------------|
| Next.js ISR | Serves cached pages; invalidated by `revalidatePath()` in Payload afterChange hooks | Working -- `src/hooks/revalidate.ts` |
| Traefik | Does NOT cache content itself. Sets `s-maxage=60, stale-while-revalidate=300` response headers on public routes. | Working -- `argocd/prod/ingress.yaml` |
| Cloudflare | Does NOT cache HTML/JSON by default (only static assets like JS/CSS/images). Would cache HTML only if a Cache Rule with "Cache Everything" is configured for the zone. | Unknown whether a Cache Rule exists |

### Critical Finding: Cloudflare Default Behavior

Cloudflare's CDN does **not** cache HTML or JSON responses by default. It only caches static file types (CSS, JS, images, fonts, etc.) based on file extension. The `s-maxage=60` header from Traefik only affects Cloudflare's edge cache behavior **if** a Cache Rule has been set to override the default behavior and cache HTML.

This means:
1. **If no "Cache Everything" rule exists:** HTML requests pass through Cloudflare uncached. Only the Next.js ISR cache matters, and the existing `revalidatePath` hooks already handle that. The Cloudflare purge API would be a no-op for HTML.
2. **If a "Cache Everything" rule is configured (or will be):** Then Cloudflare caches HTML for up to 60 seconds (per the `s-maxage` header). A purge API call would clear stale HTML from the edge.

**Recommendation:** Implement the Cloudflare purge regardless, because:
- The deployment should work correctly whether or not Cache Rules exist
- Cache Rules may be added in the future for performance
- Static assets (images, CSS) are always cached by Cloudflare and may need purging
- The implementation cost is minimal (one utility function, a few env vars)

**Confidence:** HIGH -- verified against [Cloudflare Default Cache Behavior docs](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/).

### Implementation: Native fetch() to Cloudflare API

**Endpoint:** `POST https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache`

**Authentication:** Bearer token via API Token (not Global API Key). The token needs **Zone > Cache Purge > Purge** permission.

**Purge strategies available:**

| Strategy | Request Body | Best For | Plan Availability |
|----------|-------------|----------|-------------------|
| Purge by URL | `{ "files": ["https://..."] }` | Targeted content changes (publish/update one page) | All plans |
| Purge everything | `{ "purge_everything": true }` | Global changes (nav, theme, urgent banner) | All plans |
| Purge by prefix | `{ "prefixes": ["www.bibbunited.com/news"] }` | Category-level changes | All plans |
| Purge by host | `{ "hosts": ["www.bibbunited.com"] }` | Full domain purge | All plans |

**Recommended approach for this project:**

| Payload Event | Purge Strategy | Rationale |
|--------------|---------------|-----------|
| Page/NewsPost publish | Purge by URL (the specific page + homepage) | Targeted, minimal cache disruption |
| Organization/Official change | Purge by URL (`/contact-officials`) | Targeted |
| Homepage global change | Purge by URL (`/`) | Only homepage affected |
| Navigation/UrgentBanner/SiteTheme change | Purge everything | These affect every page's layout |

**Rate limits (Free plan):**

| Method | Rate Limit |
|--------|-----------|
| Purge by URL | 800 URLs/second, max 30 URLs per request |
| Purge everything | 5 requests/minute, 25-token bucket |

These limits are more than sufficient for a CMS that publishes a few articles per day.

### Implementation Pattern

```typescript
// src/lib/cloudflare.ts
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN
const CLOUDFLARE_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.bibbunited.com'

export async function purgeCloudflareUrls(paths: string[]): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) return // Skip if not configured

  const files = paths.map((p) => `${SITE_URL}${p}`)

  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files }),
    },
  ).catch(() => {}) // Fire-and-forget; don't block CMS save on purge failure
}

export async function purgeCloudflareEverything(): Promise<void> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) return

  await fetch(
    `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
    },
  ).catch(() => {})
}
```

**Key design decision: Fire-and-forget.** The Cloudflare API call must not block the CMS save operation. If the purge fails (network issue, bad token, etc.), the editor should not see an error. The content is still saved and Next.js ISR still revalidates the page. Cloudflare cache will expire naturally within 60 seconds (per `s-maxage`).

### Integration with Existing Revalidation Hooks

The existing `revalidateCollection` and `revalidateGlobal` hooks in `src/hooks/revalidate.ts` call `revalidatePath()` for Next.js ISR. The Cloudflare purge should be added alongside these calls, not replace them. Two options:

**Option A (Recommended): Extend existing hooks to also call Cloudflare purge**
Modify `revalidateCollection` and `revalidateGlobal` to call `purgeCloudflareUrls()` with the same paths. Keeps all cache invalidation logic in one place.

**Option B: Add separate afterChange hooks for Cloudflare**
Add a second afterChange hook per collection/global that handles only Cloudflare purging. More modular but duplicates path logic.

**Recommendation:** Option A. The existing hooks already know which paths to invalidate. Adding the Cloudflare call inside them is 3-4 lines of code and avoids duplicating path resolution.

**Confidence:** HIGH for the API call pattern (verified against [Cloudflare API docs](https://developers.cloudflare.com/api/resources/cache/methods/purge/)). MEDIUM for the fire-and-forget pattern (Payload docs confirm non-awaited hooks are fine for side effects).

### Traefik: No Changes Needed

Traefik is not a cache -- it only sets response headers. The existing `public-cache` middleware in `argocd/prod/ingress.yaml` sets `s-maxage=60, stale-while-revalidate=300`, which tells Cloudflare (or any shared cache) how long to cache. There is no Traefik cache to purge.

The `s-maxage=60` value is already conservative enough that even without active purging, stale content is at most 60 seconds old (plus up to 5 minutes of stale-while-revalidate serving). The Cloudflare purge makes this near-instant instead.

**Confidence:** HIGH -- verified from `argocd/prod/ingress.yaml` which shows Traefik only sets headers, not HTTP caching middleware.

---

## Environment Variables (New)

| Variable | Value | Where | Purpose |
|----------|-------|-------|---------|
| `CLOUDFLARE_API_TOKEN` | API token with Zone > Cache Purge > Purge permission | K8s Secret (`bibbunited-secrets`) | Authenticate to Cloudflare purge API |
| `CLOUDFLARE_ZONE_ID` | Zone ID from Cloudflare dashboard | K8s Secret (`bibbunited-secrets`) | Identify which zone to purge |

These should be added to:
- `.env.example` (placeholder values with comments)
- K8s Secret `bibbunited-secrets` (actual values)
- NOT required for local development (purge gracefully skips when vars are missing)

---

## What NOT to Add

| Technology | Why Not |
|------------|---------|
| `cloudflare` npm package (v5.2.0) | 26MB unpacked for a single POST request. Native `fetch()` does the same thing in 15 lines. |
| Redis/Memcached for cache layer | The site has ~50 pages. Next.js ISR + Cloudflare edge is more than sufficient. Adding a cache store adds operational complexity with no measurable benefit at this scale. |
| Payload Jobs Queue | The Cloudflare purge is a single HTTP call that takes <100ms. A job queue adds infrastructure (Redis or DB-backed) for a fire-and-forget side effect. Overkill. |
| `@payloadcms/plugin-*` (any new plugin) | No new Payload plugins needed. The Organization collection is a standard collection, the homepage content is a standard richText field, and cache busting is a custom hook. |
| GraphQL client | Cloudflare API uses REST. The existing codebase uses Payload's Local API for data fetching. No GraphQL needed. |
| `node-fetch` or `axios` | Node.js 22 (project runtime) has native `fetch()`. No polyfill or alternative HTTP client needed. |
| New Lexical editor features/blocks | The existing `richTextEditor` config has all needed features for homepage content. No new blocks or plugins required. |

---

## Database Migration Strategy

### Schema Changes

Payload CMS 3.x uses Drizzle ORM and auto-generates migrations via `payload migrate:create`. The v2.0 milestone introduces:

1. **New `organizations` table** -- created automatically when the Organizations collection is registered in `payload.config.ts`
2. **Modified `officials` table** -- the `body` column (text/enum) changes to `organization_id` (foreign key reference). This requires a data migration.

### Migration Steps

```bash
# 1. After adding Organizations collection and modifying Officials
pnpm payload migrate:create   # Generates migration file in src/migrations/

# 2. Review the generated SQL -- Drizzle should create the organizations table
#    and alter the officials table

# 3. Write a data migration script to:
#    a. Create Organization documents for each previous select option
#    b. Update Officials documents to reference the new Organization IDs
#    c. This runs as part of the seed script for dev/test environments

# 4. Apply migration
pnpm payload migrate
```

**Confidence:** HIGH -- this is standard Payload/Drizzle migration workflow. The project already has migration infrastructure in place (the CI runs `pnpm payload migrate:fresh`).

---

## Alternatives Considered

| Decision | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Cloudflare API client | Native `fetch()` | `cloudflare` npm SDK (v5.2.0) | 26MB package for one API call. The REST endpoint is trivial to call directly. |
| Cache purge trigger | Extend existing afterChange hooks | Separate webhook / API route | Hooks already know the paths; adding a webhook duplicates logic and adds an HTTP hop. |
| Cache purge timing | Fire-and-forget (non-blocking) | Awaited (blocking) | Editor should not wait for Cloudflare. If purge fails, ISR + s-maxage handles staleness within 60s. |
| Organization data model | Flat collection | Nested config / hardcoded | Collections are CMS-editable; hardcoded select options require code changes to add a new org. |
| Homepage content field | richText (full editor) | textarea (plain text) | Editors need formatting, links, callouts -- the same rich text capabilities as pages. |
| Homepage content field | richText with existing editor | richText with stripped-down editor | Consistency matters more than restriction. Editors know one toolbar. |
| Purge scope for globals | purge_everything | purge by URL list | Navigation, theme, and urgent banner affect every page. Listing all URLs is fragile and grows with content. |

---

## Sources

- [Cloudflare Cache Purge API](https://developers.cloudflare.com/api/resources/cache/methods/purge/) -- HIGH confidence, official API docs
- [Cloudflare Default Cache Behavior](https://developers.cloudflare.com/cache/concepts/default-cache-behavior/) -- HIGH confidence, confirms HTML not cached by default
- [Cloudflare Purge Cache Overview](https://developers.cloudflare.com/cache/how-to/purge-cache/) -- HIGH confidence, rate limits and plan availability
- [Cloudflare API Token Permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/) -- HIGH confidence, required permissions for cache purge
- [Cloudflare API Rate Limits](https://developers.cloudflare.com/fundamentals/api/reference/limits/) -- HIGH confidence, 1200 req/5min global limit
- [Payload CMS Hooks Overview](https://payloadcms.com/docs/hooks/overview) -- HIGH confidence, async vs sync hook behavior
- [Payload CMS Collection Hooks](https://payloadcms.com/docs/hooks/collections) -- HIGH confidence, afterChange hook signature
- Existing codebase: `src/hooks/revalidate.ts`, `argocd/prod/ingress.yaml`, `src/globals/Homepage.ts`, `src/collections/Officials.ts` -- HIGH confidence, direct source code
