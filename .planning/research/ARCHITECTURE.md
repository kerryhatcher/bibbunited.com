# Architecture Patterns

**Domain:** CMS data model extension + upstream cache busting for Payload CMS 3.x + Next.js 15 civic site
**Researched:** 2026-03-27
**Scope:** Organization collection, Homepage rich text content, Cloudflare/Traefik cache invalidation

## Recommended Architecture

Three integration points into the existing system, each following established patterns already in the codebase. No new architectural paradigms required -- this is extension, not rearchitecture.

### Integration Overview

```
                    EXISTING                           NEW / MODIFIED
                    --------                           --------------
Collections:
  Pages             [unchanged]
  NewsPosts         [unchanged]
  Officials         [MODIFIED - add organization relationship, remove body select]
  Meetings          [unchanged]
  Media             [unchanged]
  Users             [unchanged]
  Organizations     [NEW COLLECTION]

Globals:
  Homepage          [MODIFIED - add editorContent rich text field]
  Navigation        [unchanged]
  SiteTheme         [unchanged]
  UrgentBanner      [unchanged]

Hooks:
  revalidate.ts     [MODIFIED - add purgeUpstreamCache() calls]

Lib:
  purgeCache.ts     [NEW - Cloudflare API purge logic]

Frontend:
  /contact-officials  [MODIFIED - group by organization instead of body select]
  / (homepage)        [MODIFIED - render editorContent between hero and news]

Components:
  EditorContent.tsx   [NEW - renders Homepage rich text block]

Config:
  payload.config.ts   [MODIFIED - register Organizations collection]
  .env                [MODIFIED - add CF_ZONE_ID, CF_API_TOKEN]
  K8s secrets         [MODIFIED - add CF_ZONE_ID, CF_API_TOKEN]
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `Organizations` collection | Stores org name, website, phone, address | Referenced by `Officials` via relationship field |
| `Officials` collection (modified) | Stores official info + org reference | References `Organizations` and `Media` |
| `Organizations` Join field | Virtual reverse lookup of officials per org | Reads from `Officials.organization` relationship |
| `Homepage` global (modified) | Stores hero spotlight, topic callouts, AND editor content | Referenced by `getHomepage()` lib function |
| `EditorContent` component | Renders rich text between hero and latest news | Receives data from Homepage global |
| `purgeCache` lib | Calls Cloudflare API to purge specific URLs | Called from revalidate hooks after `revalidatePath` |
| `revalidate.ts` hooks (modified) | On-demand ISR + upstream Cloudflare purge | Calls `revalidatePath` then `purgeCache` |

### Data Flow

**Content publish flow (current):**
```
Editor saves in /admin
  -> Payload afterChange hook fires
  -> revalidatePath('/contact-officials') called
  -> Next.js marks cached page as stale
  -> Next visitor gets fresh SSR response
```

**Content publish flow (new, with upstream cache busting):**
```
Editor saves in /admin
  -> Payload afterChange hook fires
  -> revalidatePath('/contact-officials') called   [Next.js ISR cache]
  -> purgeUpstreamCache(['/contact-officials'])     [Cloudflare edge cache]
  -> Next visitor gets fresh response AND Cloudflare serves fresh response
```

**Organization -> Official data flow:**
```
Organizations collection
  |
  |-- Officials.organization (relationship field, each official belongs to one org)
  |
  |-- Organizations.officials (Join field, virtual reverse -- shows related officials)
  |
  v
/contact-officials page
  -> payload.find({ collection: 'organizations', sort: 'sortOrder', depth: 1, joins: { officials: { sort: 'sortOrder' } } })
  -> Each org comes with its officials pre-joined
  -> Renders org name as section header, then officials under that org
```

---

## Feature 1: Organizations Collection

### Architecture Decision

**Use a relationship field on Officials pointing to Organizations, plus a Join field on Organizations pointing back.**

The current Officials collection uses a `body` select field with hardcoded options (`board-of-education`, `county-commission`, `water-board`). This is rigid -- adding a new organization requires a code change and deployment. The Organization collection makes this CMS-managed.

### New Collection: `Organizations`

```typescript
// src/collections/Organizations.ts
import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  hooks: {
    afterChange: [revalidateCollection(['/contact-officials'])],
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'website', 'phone', 'sortOrder'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Organization Name',
      admin: {
        description: 'e.g., "Board of Education", "County Commission"',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Website URL',
      admin: {
        description: 'Public website for this organization',
      },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Phone Number',
    },
    {
      name: 'address',
      type: 'textarea',
      label: 'Address',
      admin: {
        description: 'Physical address or mailing address',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first on the contact page',
      },
    },
    // Virtual reverse relationship -- shows officials belonging to this org
    {
      name: 'officials',
      type: 'join',
      collection: 'officials',
      on: 'organization',
      defaultSort: 'sortOrder',
      admin: {
        defaultColumns: ['name', 'role', 'email'],
        allowCreate: true,
      },
    },
  ],
}
```

### Modified Collection: `Officials`

Replace the `body` select field with an `organization` relationship field.

**Fields to change:**

```typescript
// REMOVE this field:
{
  name: 'body',
  type: 'select',
  required: true,
  label: 'Governing Body',
  options: [
    { label: 'Board of Education', value: 'board-of-education' },
    { label: 'County Commission', value: 'county-commission' },
    { label: 'Water Board', value: 'water-board' },
  ],
}

// ADD this field:
{
  name: 'organization',
  type: 'relationship',
  relationTo: 'organizations',
  required: true,
  admin: {
    description: 'The organization this official belongs to',
  },
}
```

Also update `defaultColumns` from `['name', 'role', 'body', 'email']` to `['name', 'role', 'organization', 'email']`.

### Database Migration Strategy

**This is a breaking schema change.** The `body` column (text/enum) is being replaced by `organization_id` (foreign key integer). This requires careful handling:

1. Create the `organizations` table (automatic via `payload migrate:create`)
2. Seed organization records matching the three existing `body` values
3. Add the `organization_id` column to `officials` table
4. Migrate existing data: map `body` values to organization IDs
5. Drop the `body` column

**Recommendation:** Handle this as a custom migration, NOT relying solely on auto-migration. Write a migration that:
- Creates the organizations table
- Inserts the three known organizations (Board of Education, County Commission, Water Board)
- Maps existing officials to the correct organization ID based on their `body` value
- Drops the `body` column

This is safer than auto-migration because Drizzle's auto-migration will see "column removed, column added" and not know they are semantically related. Data would be lost.

### Frontend Impact: `/contact-officials` Page

**Current pattern (hardcoded grouping):**
```typescript
const bodyLabels: Record<string, string> = {
  'board-of-education': 'Board of Education',
  'county-commission': 'County Commission',
  'water-board': 'Water Board',
}
const bodyOrder = ['board-of-education', 'county-commission', 'water-board']
// Groups officials by body string, renders in hardcoded order
```

**New pattern (dynamic grouping via Join field):**
```typescript
const organizations = await payload.find({
  collection: 'organizations',
  sort: 'sortOrder',
  depth: 1,
  joins: {
    officials: {
      sort: 'sortOrder',
      limit: 50,
    },
  },
})
// Each org.officials.docs contains the populated officials
// Render in organization sortOrder -- no hardcoded grouping needed
```

**Recommendation:** Use the Join field approach. It is a single query, follows Payload's intended pattern, and keeps the grouping logic server-side. The Join field is described as "extremely performant" in the Payload docs and replaces the manual `reduce()` grouping currently in the page.

The existing `bodyLabels` map and `bodyOrder` array become unnecessary -- organization names come from the database.

### Revalidation Hook Impact

Organizations afterChange hook should revalidate `/contact-officials` (same as Officials). Officials afterChange continues to revalidate `/contact-officials` (already does). When an Organization is updated (e.g., name change), the contact-officials page automatically refreshes.

### JSON-LD Impact

The current `governmentOrgJsonLd()` function in `src/lib/jsonLd.ts` takes a hardcoded body label string. Update it to accept the organization name (and optionally website) from the database instead of a hardcoded string.

### Seed Script Impact

The seed script must:
1. Create Organization records BEFORE Officials (dependency)
2. Reference Organization IDs in Official creation (replace `body` string with `organization` relationship)
3. Remove the hardcoded `body` property from officials seed data

---

## Feature 2: Homepage Editable Content (Rich Text)

### Architecture Decision

**Add a single `editorContent` rich text field to the existing Homepage global, positioned between `heroSpotlight` and `topicCallouts` in the field definition.**

The Homepage global already stores `heroSpotlight` (array of news post relationships) and `topicCallouts` (array of card configs). Adding a rich text field follows the same pattern -- another field on the global, managed by editors in the admin UI.

### Modified Global: `Homepage`

```typescript
// Add this field between heroSpotlight and topicCallouts in the fields array:
{
  name: 'editorContent',
  type: 'richText',
  label: 'Editor Content Block',
  editor: richTextEditor, // Same editor config as Pages/NewsPosts
  admin: {
    description:
      'Rich text content displayed between the hero section and latest news. ' +
      'Use this for announcements, calls to action, or editorial messages.',
  },
}
```

**Why use the full `richTextEditor` (from `src/editors/richText.ts`)?**
- Editors get the same capabilities as pages: headings, pull quotes, callouts, embeds, tables
- Consistent editing experience across the admin UI
- The existing `RichTextRenderer` component already handles all these block types
- No additional rendering code needed

### Frontend Integration: Homepage (`page.tsx`)

**Current layout order:**
```
<HeroSpotlight />
<GetInvolvedCTA />
<LatestNews />
<TopicCallouts />
```

**New layout order:**
```
<HeroSpotlight />
<GetInvolvedCTA />
<EditorContent />     <-- NEW: between CTA and latest news
<LatestNews />
<TopicCallouts />
```

The requirement says "between hero and latest news." The GetInvolvedCTA currently sits between hero and news. The editorContent goes between GetInvolvedCTA and LatestNews -- this preserves the CTA's prominent position while giving editors a content block before the news feed.

### New Component: `EditorContent`

```typescript
// src/components/homepage/EditorContent.tsx
import { RichTextRenderer } from '@/components/shared/RichTextRenderer'
import { Section } from '@/components/ui/Section'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

interface EditorContentProps {
  data: SerializedEditorState | null | undefined
}

export function EditorContent({ data }: EditorContentProps) {
  if (!data) return null // No content set -- render nothing

  return (
    <Section>
      <RichTextRenderer data={data} />
    </Section>
  )
}
```

**Key design choices:**
- Returns `null` when no content is set (field is optional -- site works without it)
- Uses existing `RichTextRenderer` which applies `prose` styling from `@tailwindcss/typography`
- Wraps in existing `Section` component for consistent spacing
- No `'use client'` needed -- this is a Server Component (rich text rendering is static HTML)

### Data Flow

```
getHomepage() -> payload.findGlobal({ slug: 'homepage', depth: 2 })
  -> homepage.editorContent (SerializedEditorState | null)
  -> <EditorContent data={homepage.editorContent} />
  -> <RichTextRenderer data={data} /> (renders if data exists, null otherwise)
```

### Revalidation

The Homepage global already has `afterChange: [revalidateGlobal(['/'])]`. This handles the editorContent field automatically -- any change to the Homepage global triggers revalidation of the homepage route. No hook changes needed for this feature.

### Seed Script Impact

The seed script should set `editorContent` to a sample value using the existing `makeMultiParagraphRichText()` helper:

```typescript
await payload.updateGlobal({
  slug: 'homepage',
  data: {
    // ...existing heroSpotlight and topicCallouts...
    editorContent: makeMultiParagraphRichText([
      'BIBB United is your source for civic information about Bibb County schools...',
      'We track budgets, board decisions, and policy changes so you can hold leaders accountable.',
    ]),
  },
})
```

### Database Migration

This is a non-breaking additive change. The `editorContent` field is a new JSONB column on the `_homepage` globals table. Payload's auto-migration handles this correctly -- it adds the column with a NULL default. No custom migration needed.

---

## Feature 3: Automated Upstream Cache Busting

### Architecture Decision: What Actually Needs Purging

**Critical finding: The current caching architecture is more nuanced than it appears.**

| Layer | What Caches | How Invalidated | Current Status |
|-------|-------------|-----------------|----------------|
| **Next.js ISR** | Server-rendered pages in `.next/cache` | `revalidatePath()` in afterChange hooks | Already implemented and working |
| **Traefik** | NOTHING -- open-source Traefik only sets headers | N/A -- not a cache layer | Headers middleware sets `Cache-Control` |
| **Cloudflare Edge** | Static assets by default; HTML only if a Cache Rule forces it | API purge or TTL expiry | Partially configured |
| **Browser** | Per `max-age` / `stale-while-revalidate` | TTL expiry only | Controlled by Traefik headers |

**Key insight:** Traefik open-source does NOT cache responses. It is a reverse proxy that routes requests and can modify headers, but HTTP caching is an Enterprise/Hub-only feature. The `public-cache` middleware in `argocd/prod/ingress.yaml` sets `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` on responses, but Traefik itself does not store or serve cached responses.

**Second key insight:** Cloudflare does NOT cache HTML by default. It caches static assets (JS, CSS, images, fonts) based on file extension. HTML responses pass through uncached UNLESS a "Cache Everything" Cache Rule exists. The DEPLOYMENT.md only documents a bypass rule for `/admin` -- no "Cache Everything" rule is referenced.

**Two possible current states:**
1. **No HTML caching at Cloudflare** (most likely) -- The `s-maxage` header is set but Cloudflare ignores it for HTML. Only static assets are edge-cached.
2. **HTML caching via an undocumented Cache Rule** -- A "Cache Everything" rule may exist in the Cloudflare dashboard but is not documented in the repo.

**Recommendation: Implement Cloudflare purge regardless.** Even if HTML is not currently edge-cached, this feature prepares for when it is (which it should be for performance). The purge logic is simple, and having it in place means cache rules can be safely enabled later without worrying about stale content. Additionally, purging static asset URLs (CSS/JS with hashed filenames) is a no-op since they change filenames on rebuild anyway, so the purge only matters for HTML paths.

### Implementation: Lightweight Custom Purge (NOT Plugin)

**Do NOT use the `payload-plugin-cloudflare-purge` npm package.** Rationale:
- The plugin requires Payload ^3.37.0 peer dep (not harmful, but unnecessary coupling)
- It adds admin UI buttons, an API endpoint, and localization support that are overkill for this site
- The actual Cloudflare purge call is ~20 lines of code using `fetch()`
- The project already has a well-structured hooks system (`src/hooks/revalidate.ts`)
- Fewer dependencies = simpler Docker builds and less maintenance surface

### New File: `src/lib/purgeCache.ts`

```typescript
const CF_ZONE_ID = process.env.CF_ZONE_ID
const CF_API_TOKEN = process.env.CF_API_TOKEN
const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.bibbunited.com'

/**
 * Purge specific URLs from Cloudflare's edge cache.
 * Fails silently -- cache purge is best-effort, not critical path.
 * Content will expire naturally via s-maxage TTL if purge fails.
 */
export async function purgeCloudflareUrls(paths: string[]): Promise<void> {
  if (!CF_ZONE_ID || !CF_API_TOKEN) return // Skip in dev/CI

  const urls = paths.map((p) => `${SITE_URL}${p}`)

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: urls }),
      },
    )

    if (!response.ok) {
      const body = await response.text()
      console.error('[CF Purge] Failed:', response.status, body)
    }
  } catch (error) {
    console.error('[CF Purge] Error:', error)
  }
}

/**
 * Purge everything from Cloudflare's edge cache.
 * Use sparingly -- only for global changes (navigation, theme, banner).
 */
export async function purgeCloudflareAll(): Promise<void> {
  if (!CF_ZONE_ID || !CF_API_TOKEN) return

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ purge_everything: true }),
      },
    )

    if (!response.ok) {
      const body = await response.text()
      console.error('[CF Purge All] Failed:', response.status, body)
    }
  } catch (error) {
    console.error('[CF Purge All] Error:', error)
  }
}
```

**Design choices:**
- Uses native `fetch()` directly -- no `cloudflare` npm package needed (avoids a dependency for a trivial API call)
- Fails silently with `console.error` -- cache purge is best-effort, not critical
- Absent env vars = skip silently (local dev, CI, seed scripts work without Cloudflare config)
- Two functions: URL-specific purge (for content changes) and purge-all (for layout/global changes)

### Modified Hook: `src/hooks/revalidate.ts`

Add upstream cache purging alongside existing `revalidatePath()` calls. The purge call is fire-and-forget (`.catch(() => {})`).

```typescript
import { purgeCloudflareUrls, purgeCloudflareAll } from '../lib/purgeCache'

// In revalidateCollection -- after the revalidatePath loop:
const validPaths = resolved.filter(
  (p) => p && !p.includes('undefined') && !p.includes('null'),
)
if (validPaths.length > 0) {
  purgeCloudflareUrls(validPaths).catch(() => {})
}

// In revalidateGlobal -- after the revalidatePath loop:
// For layout-type revalidation (Navigation, UrgentBanner, SiteTheme):
if (type === 'layout') {
  purgeCloudflareAll().catch(() => {})
} else {
  purgeCloudflareUrls(paths).catch(() => {})
}
```

### Mapping: Which Collection/Global Purges What

| Collection/Global | revalidatePath (existing) | Cloudflare Purge (new) |
|-------------------|--------------------------|------------------------|
| Pages | `/${doc.slug}` | `purgeCloudflareUrls(['/${doc.slug}'])` |
| NewsPosts | `/news`, `/news/${doc.slug}`, `/` | `purgeCloudflareUrls(['/news', '/news/${slug}', '/'])` |
| Officials | `/contact-officials` | `purgeCloudflareUrls(['/contact-officials'])` |
| **Organizations** | `/contact-officials` | `purgeCloudflareUrls(['/contact-officials'])` |
| Meetings | `/meetings` | `purgeCloudflareUrls(['/meetings'])` |
| Homepage | `/` | `purgeCloudflareUrls(['/'])` |
| Navigation | `/` (layout) | `purgeCloudflareAll()` -- affects every page |
| UrgentBanner | `/` (layout) | `purgeCloudflareAll()` -- affects every page |
| SiteTheme | `/` (layout) | `purgeCloudflareAll()` -- affects every page |

### Environment Variables

**New env vars (add to `.env.example`):**
```
# Cloudflare Cache Purge (optional -- leave empty for local dev)
CF_ZONE_ID=
CF_API_TOKEN=
```

**K8s secret update:**
```bash
kubectl create secret generic bibbunited-secrets \
  --namespace=civpulse-prod \
  --from-literal=CF_ZONE_ID='your-zone-id' \
  --from-literal=CF_API_TOKEN='your-api-token' \
  # ...existing secrets...
```

**Cloudflare API Token permissions needed:** `Zone > Cache Purge > Purge` only. Create a scoped token in the Cloudflare dashboard with the minimum required permission.

### Traefik: No Changes Needed

Traefik's `public-cache` middleware sets `Cache-Control` headers but does not cache responses itself. No Traefik configuration changes are needed for cache busting. The headers remain useful for browser caching and for Cloudflare if/when a "Cache Everything" rule is added.

---

## Patterns to Follow

### Pattern 1: Consistent Hook Integration

**What:** Every collection and global that generates frontend pages should have an afterChange hook that calls `revalidatePath` for Next.js ISR AND `purgeCloudflareUrls` for upstream CDN.

**When:** Any new collection or global that affects a frontend route.

**Example:** Organizations follows the exact same pattern as the existing Officials:
```typescript
hooks: {
  afterChange: [revalidateCollection(['/contact-officials'])],
}
```
The Cloudflare purge is added inside `revalidateCollection` itself, so it works automatically.

### Pattern 2: Payload Relationship + Join for Bidirectional Access

**What:** Store the foreign key on the "child" side (Official -> Organization), expose the reverse lookup via a Join field on the "parent" side (Organization -> Officials).

**When:** Any one-to-many relationship where editors need to see related documents from both directions in the admin UI.

**Why:** Single source of truth (FK stored once), no data duplication, Payload handles the join query automatically. The Join field is virtual and adds zero database overhead.

### Pattern 3: Optional Rich Text Fields on Globals

**What:** Add rich text fields to globals as optional (not `required: true`). Render with a null-check wrapper component that returns null when empty.

**When:** Giving editors control over content blocks that may or may not be populated.

**Why:** The site should function identically with or without the editor content. Forcing required content creates editorial friction.

### Pattern 4: Fire-and-Forget Cache Purge

**What:** Call Cloudflare purge API asynchronously (`.catch(() => {})`) and never let it block the Payload response.

**When:** Any cache purge call in an afterChange hook.

**Why:** Cache purge failure should NOT cause a 500 error for the editor. The content is saved. Worst case is stale cache for 60 seconds (per `s-maxage=60` TTL).

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Storing Relationship Data on Both Sides

**What:** Adding an `officials` array field on Organizations AND an `organization` field on Officials.

**Why bad:** Data duplication. When an official changes organizations, both records need updating. Drift is inevitable. Payload provides Join fields precisely to avoid this.

**Instead:** Use a relationship field on Officials (the "many" side) and a Join field on Organizations (the "one" side). The Join field is virtual -- no data stored.

### Anti-Pattern 2: Using the Cloudflare NPM Package for a Single API Call

**What:** `pnpm add cloudflare` to get the official SDK for purge-cache.

**Why bad:** Adds a dependency (with its own transitive dependencies) for a 20-line `fetch()` call. The purge API has exactly two request shapes: `{ purge_everything: true }` or `{ files: [...] }`. The SDK adds typed wrappers around this, but the response is trivial too: `{ success: boolean, errors: [], messages: [] }`.

**Instead:** Direct `fetch()` to `api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache`. Type the response yourself if needed.

### Anti-Pattern 3: Blocking on Cache Purge in Hooks

**What:** `await purgeCloudflareUrls(paths)` in the hook, making the editor wait for the Cloudflare API round-trip before the admin UI responds.

**Why bad:** Adds 100-500ms latency to every save. If Cloudflare API is slow or down, the admin panel feels broken even though the content is already saved.

**Instead:** Fire-and-forget with `.catch(() => {})`. Log failures for debugging but never block the content save.

### Anti-Pattern 4: Relying on Auto-Migration for the Body-to-Organization Refactor

**What:** Running `payload migrate:create` and expecting Drizzle to understand that `body` (string column) should be replaced by `organization_id` (FK column) with data preserved.

**Why bad:** Auto-migration sees "drop column body, add column organization_id" as two unrelated operations. All existing officials lose their organizational grouping. On a production database with real data, this destroys information.

**Instead:** Write a custom migration that creates organizations, maps body values to org IDs, updates officials, then drops the body column.

### Anti-Pattern 5: Purging All Cache on Every Content Change

**What:** Calling `purgeCloudflareAll()` for every collection/global change.

**Why bad:** Cloudflare rate limits purge-everything requests. Bulk edits or seed scripts would hit the limit. Also forces re-fetching of all static assets (CSS, JS, images) which wastes bandwidth.

**Instead:** Use URL-specific purge (`purgeCloudflareUrls`) for content changes. Reserve `purgeCloudflareAll()` for layout-level global changes (Navigation, UrgentBanner, SiteTheme) that affect every page.

---

## Scalability Considerations

| Concern | Current (v1.1) | After v2.0 | Future (100+ orgs) |
|---------|-----------------|------------|---------------------|
| Officials query | Single query, 9 docs, manual grouping | Single Join query, ~20 docs, auto-grouped | Add pagination if >50 officials per org |
| Org grouping | Hardcoded 3-value select | Dynamic from Organizations collection | Works unchanged -- sorted by sortOrder |
| Cloudflare purge | Not implemented | URL-specific, ~3-5 URLs per save | CF allows 30 URLs per purge request, 1000 req/min -- well within limits |
| Homepage content | 2 field groups (hero, callouts) | 3 field groups (hero, editor content, callouts) | No concern -- single global document |
| Database migrations | Auto-migrate only | Custom migration for body->org refactor | Auto-migrate for all future additive changes |

---

## Build Order (Dependency-Driven)

Based on the dependency graph between the three features:

```
Phase 1: Organizations Collection + Officials Refactor
  - Organizations MUST exist before Officials can reference them
  - Custom migration MUST handle data conversion
  - Frontend MUST update to new data shape
  - Seed script MUST create orgs before officials
  - JSON-LD MUST update to use org names from DB

Phase 2: Homepage Editor Content
  - No dependencies on Phase 1
  - Additive change to Homepage global (auto-migration)
  - New component + homepage layout change
  - Could theoretically run in parallel with Phase 1

Phase 3: Cache Busting
  - Depends on Phase 1 (Organizations collection has revalidation hooks)
  - Should be last -- modifies ALL existing hooks
  - Needs env vars configured in K8s secrets
  - Can be tested independently against Cloudflare API
```

**Recommended order: Phase 1 -> Phase 2 -> Phase 3**

Rationale:
1. Phase 1 is the largest change (new collection, custom migration, frontend refactor, seed update) -- tackle the hardest work first
2. Phase 2 is small and self-contained (one global field, one component, one page layout tweak)
3. Phase 3 touches all hooks and should be done after the collection changes are stable; it is also the only feature requiring external API credentials

---

## Sources

- Payload CMS Relationship Field docs: https://payloadcms.com/docs/fields/relationship -- HIGH confidence
- Payload CMS Join Field docs: https://payloadcms.com/docs/fields/join -- HIGH confidence
- Payload CMS Collection Hooks docs: https://payloadcms.com/docs/hooks/collections -- HIGH confidence
- Payload CMS Global Hooks docs: https://payloadcms.com/docs/hooks/globals -- HIGH confidence
- Cloudflare Cache Purge API (Node.js): https://developers.cloudflare.com/api/node/resources/cache/methods/purge/ -- HIGH confidence
- Cloudflare Default Cache Behavior (HTML not cached by default): https://developers.cloudflare.com/cache/concepts/default-cache-behavior/ -- HIGH confidence
- Cloudflare Origin Cache Control (s-maxage): https://developers.cloudflare.com/cache/concepts/cache-control/ -- HIGH confidence
- Traefik Headers Middleware (sets headers, does not cache): https://doc.traefik.io/traefik/middlewares/http/headers/ -- HIGH confidence
- Traefik Enterprise HTTP Cache (enterprise-only feature): https://doc.traefik.io/traefik-enterprise/middlewares/http-cache/ -- HIGH confidence
- Next.js revalidatePath: https://nextjs.org/docs/app/api-reference/functions/revalidatePath -- HIGH confidence
- payload-plugin-cloudflare-purge (evaluated, not recommended): https://github.com/jogajunto/payload-plugin-cloudflare-purge -- MEDIUM confidence
- Existing codebase analysis: direct inspection of `src/hooks/revalidate.ts`, `src/collections/Officials.ts`, `src/globals/Homepage.ts`, `argocd/prod/ingress.yaml`, `src/app/(frontend)/contact-officials/page.tsx`, `src/app/(frontend)/page.tsx` -- HIGH confidence
