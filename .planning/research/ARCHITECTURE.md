# Architecture Patterns

**Domain:** Civic advocacy website (CMS-driven broadcast site)
**Researched:** 2026-03-23
**Confidence:** MEDIUM (based on training data for Payload CMS 3.x; web verification tools unavailable during research -- verify Payload 3.x docs before implementation)

## Recommended Architecture

Payload CMS 3.x fundamentally changed the CMS-application relationship: Payload is now a Next.js plugin, not a separate server. The CMS admin panel, the REST/GraphQL API, and the public-facing frontend all run inside a single Next.js application. This is the defining architectural decision -- there is no separate "backend" to deploy.

### High-Level Architecture

```
                    +---------------------------+
                    |     Cloudflare Tunnel      |
                    +-------------+-------------+
                                  |
                    +-------------v-------------+
                    |    Traefik Ingress (K8s)   |
                    +-------------+-------------+
                                  |
                    +-------------v-------------+
                    |   Docker Container (K8s)   |
                    |                            |
                    |  +----------------------+  |
                    |  |   Next.js App        |  |
                    |  |                      |  |
                    |  |  /           Public   |  |
                    |  |  /news/*    frontend  |  |
                    |  |  /pages/*   (SSR/SSG) |  |
                    |  |                      |  |
                    |  |  /admin     Payload   |  |
                    |  |             Admin UI  |  |
                    |  |                      |  |
                    |  |  /api/**    Payload   |  |
                    |  |             REST API  |  |
                    |  +----------+-----------+  |
                    |             |               |
                    +-------------+--------------+
                                  |
                    +-------------v-------------+
                    |      PostgreSQL (K8s)       |
                    +----------------------------+
```

### Why Single-Process Architecture

Payload 3.x is installed as `@payloadcms/next` and runs inside the Next.js process via a `withPayload()` wrapper around `next.config.js`. This means:

1. **No separate CMS server** -- Payload's admin panel serves from `/admin` within the same app
2. **No API gateway needed** -- Payload's REST API is available at `/api/*` as Next.js API routes
3. **Direct database access** -- Frontend pages can call Payload's Local API (server-side, no HTTP) for zero-latency data fetching
4. **Single deployment artifact** -- One Docker image contains everything

This is not a choice; it is how Payload 3.x works. The architecture follows from the tool.

## Project Structure

```
bibbunited.com/
|-- src/
|   |-- app/                        # Next.js App Router
|   |   |-- (frontend)/             # Route group for public site
|   |   |   |-- layout.tsx          # Public site layout (nav, footer)
|   |   |   |-- page.tsx            # Homepage
|   |   |   |-- news/
|   |   |   |   |-- page.tsx        # News listing
|   |   |   |   |-- [slug]/
|   |   |   |       |-- page.tsx    # Individual news post
|   |   |   |-- [slug]/
|   |   |       |-- page.tsx        # Dynamic CMS pages
|   |   |-- (payload)/              # Route group for Payload admin
|   |   |   |-- admin/
|   |   |   |   |-- [[...segments]]/
|   |   |   |       |-- page.tsx    # Payload admin catch-all
|   |   |   |       |-- not-found.tsx
|   |   |   |-- api/
|   |   |       |-- [...slug]/
|   |   |           |-- route.ts    # Payload REST API catch-all
|   |   |-- layout.tsx              # Root layout
|   |   |-- globals.css             # Tailwind + global styles
|   |
|   |-- collections/                # Payload collection configs
|   |   |-- Pages.ts
|   |   |-- News.ts
|   |   |-- Media.ts
|   |   |-- Users.ts
|   |
|   |-- globals/                    # Payload global configs
|   |   |-- Navigation.ts
|   |   |-- SiteSettings.ts
|   |
|   |-- blocks/                     # Payload block configs (rich content)
|   |   |-- CallToAction.ts
|   |   |-- RichText.ts
|   |   |-- ContactList.ts
|   |
|   |-- components/                 # React components
|   |   |-- layout/
|   |   |   |-- Header.tsx
|   |   |   |-- Footer.tsx
|   |   |   |-- MobileNav.tsx
|   |   |-- blocks/                 # Block renderers (match Payload blocks)
|   |   |   |-- CallToAction.tsx
|   |   |   |-- RichText.tsx
|   |   |   |-- ContactList.tsx
|   |   |-- ui/                     # Shared UI primitives
|   |       |-- Button.tsx
|   |       |-- Card.tsx
|   |       |-- Badge.tsx
|   |
|   |-- lib/                        # Utilities
|   |   |-- payload.ts              # getPayload() helper
|   |   |-- utils.ts                # General utilities
|   |
|   |-- payload.config.ts           # Payload configuration root
|   |-- payload-types.ts            # Auto-generated TypeScript types
|
|-- public/                         # Static assets
|-- tailwind.config.ts
|-- next.config.mjs                 # Includes withPayload() wrapper
|-- Dockerfile
|-- docker-compose.yml              # Local dev with PostgreSQL
|-- package.json
|-- tsconfig.json
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Payload Config** (`payload.config.ts`) | Defines collections, globals, blocks, plugins, database adapter, upload adapter | Next.js (via `withPayload()`), PostgreSQL (via `@payloadcms/db-postgres`) |
| **Collections** (`src/collections/`) | Schema definitions for Pages, News, Media, Users | Payload Config (imported by it), auto-generates types |
| **Globals** (`src/globals/`) | Schema definitions for Navigation, SiteSettings | Payload Config (imported by it), auto-generates types |
| **Blocks** (`src/blocks/`) | Reusable content block schemas for flexible page building | Collections (used within Page/News content fields) |
| **Payload Admin** (`/admin`) | CMS interface for editors to manage content | Payload REST API, PostgreSQL (via Payload internals) |
| **Public Frontend** (`src/app/(frontend)/`) | Server-rendered pages visitors see | Payload Local API (direct, no HTTP), React components |
| **Block Renderers** (`src/components/blocks/`) | React components that render each block type | Receive typed block data from page components |
| **Layout Components** (`src/components/layout/`) | Header, Footer, MobileNav -- shared across public pages | Payload Local API (for navigation data), UI components |
| **UI Components** (`src/components/ui/`) | Atomic design elements (buttons, cards, badges) | Pure props -- no data fetching |
| **PostgreSQL** | Persistent storage for all content, users, media references | Payload only (never accessed directly by frontend code) |

## Data Flow

### Content Creation Flow (Editor)

```
Editor --> Payload Admin UI (/admin)
  --> Payload REST API (/api/*)
    --> Payload Core (validation, hooks, access control)
      --> PostgreSQL (INSERT/UPDATE)
        --> (optional) Revalidation trigger for ISR
```

### Content Reading Flow (Visitor)

```
Visitor --> Next.js Route (e.g., /news/budget-breakdown)
  --> Server Component calls Payload Local API
    --> Payload Core (access control, query)
      --> PostgreSQL (SELECT)
    <-- Typed data returned (no serialization overhead)
  --> Server Component renders with Block Renderers
  --> HTML streamed to browser
```

### Key: Local API vs REST API

This is the most important data flow concept in Payload 3.x:

- **Local API** -- Used by server components on the frontend. Direct function calls within the same process. No HTTP, no serialization. This is how `src/app/(frontend)/` pages fetch data. Call `getPayload()` then `payload.find()` / `payload.findByID()`.
- **REST API** -- Used by the admin panel and any external consumers. Available at `/api/*`. The frontend should NOT use this for SSR -- it adds unnecessary HTTP overhead.

```typescript
// src/app/(frontend)/news/[slug]/page.tsx
import { getPayload } from '@/lib/payload'

export default async function NewsPost({ params }: { params: { slug: string } }) {
  const payload = await getPayload()
  const news = await payload.find({
    collection: 'news',
    where: { slug: { equals: params.slug } },
    limit: 1,
  })
  // Render directly -- no fetch(), no API call
}
```

### Navigation Data Flow

```
Payload Global "Navigation"
  --> Fetched in (frontend)/layout.tsx via Local API
    --> Passed to Header component as props
      --> Header renders nav links, dropdown menus
      --> MobileNav renders hamburger menu variant
```

### Media Flow

```
Editor uploads image --> Payload Admin
  --> Payload processes (resize, optimize via Sharp)
    --> Stored to disk (local filesystem in Docker volume)
    --> Metadata stored in PostgreSQL (Media collection)

Visitor requests image --> Next.js static file serving (or /api/media/*)
```

## Patterns to Follow

### Pattern 1: Route Groups for Separation

**What:** Use Next.js route groups `(frontend)` and `(payload)` to cleanly separate the public site from the CMS admin.

**When:** Always -- this is the standard Payload 3.x pattern.

**Why:** Each route group gets its own `layout.tsx`. The public site uses your custom layout (nav, footer, brand styles). The Payload admin uses Payload's built-in layout. They share nothing visually.

```
src/app/
  (frontend)/    # Your design, your layout, Tailwind
    layout.tsx   # Public layout with Header + Footer
  (payload)/     # Payload's admin UI, Payload's layout
    admin/       # Payload handles this entirely
```

### Pattern 2: Block-Based Content Architecture

**What:** Use Payload's Blocks field type to give editors flexible page building. Define block schemas in Payload, then create matching React renderer components.

**When:** For any content type where editors need layout flexibility (Pages, and optionally News).

**Why:** This avoids the "one rigid template" trap. Editors can assemble pages from a library of block types without developer intervention.

```typescript
// src/blocks/CallToAction.ts (Payload schema)
import { Block } from 'payload'

export const CallToAction: Block = {
  slug: 'callToAction',
  fields: [
    { name: 'heading', type: 'text', required: true },
    { name: 'body', type: 'richText' },
    { name: 'buttonText', type: 'text', required: true },
    { name: 'buttonLink', type: 'text', required: true },
    { name: 'style', type: 'select', options: ['urgent', 'standard'] },
  ],
}
```

```tsx
// src/components/blocks/CallToAction.tsx (React renderer)
export function CallToActionBlock({ heading, body, buttonText, buttonLink, style }) {
  return (
    <section className={style === 'urgent' ? 'bg-red-700 text-white' : 'bg-gray-100'}>
      <h2>{heading}</h2>
      {/* render body, button */}
    </section>
  )
}
```

### Pattern 3: Globals for Site-Wide Data

**What:** Use Payload Globals (not Collections) for singleton data like navigation menus and site settings.

**When:** Any data that has exactly one instance (site title, nav structure, footer content, social links).

**Why:** Globals are fetched with `payload.findGlobal({ slug: 'navigation' })` -- simpler than querying a collection. They appear as single editable forms in the admin panel, which is the right UX for editors managing a nav menu.

### Pattern 4: Server Components as Default

**What:** All page-level components should be React Server Components. Only add `'use client'` for interactive elements (mobile nav toggle, accordion, etc.).

**When:** Always for data-fetching pages. Client components only for DOM event handlers.

**Why:** Server Components can call the Payload Local API directly. Client Components cannot (they run in the browser). Minimizing client JS also improves performance and SEO.

### Pattern 5: Draft Preview with Payload Live Preview

**What:** Payload 3.x includes a Live Preview feature that lets editors see draft content on the actual frontend before publishing.

**When:** Implement after core content types are working. Not needed for MVP but valuable for the editorial workflow.

**Why:** Editors can preview how their content will look on the real site, not just in the admin panel. This is a Payload built-in that requires minimal configuration.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Fetching via REST API from Server Components

**What:** Using `fetch('/api/news')` in server components instead of the Local API.

**Why bad:** Adds an unnecessary HTTP round-trip within the same process. Slower, harder to type-check, and bypasses the main advantage of Payload 3.x's embedded architecture.

**Instead:** Always use `const payload = await getPayload(); payload.find(...)` in server components.

### Anti-Pattern 2: Separate CMS and Frontend Deployments

**What:** Deploying Payload and the Next.js frontend as separate services.

**Why bad:** This was the Payload 2.x model. In 3.x, Payload IS inside Next.js. Separating them means duplicating the app, losing the Local API advantage, and creating unnecessary complexity.

**Instead:** One Docker container, one Next.js app, one deployment.

### Anti-Pattern 3: Over-Engineering Content Types

**What:** Creating many collection types anticipating future needs (Events, Officials, Districts, Committees, etc.) before they are needed.

**Why bad:** Each collection adds admin complexity, migration surface area, and code to maintain. BIBB United v1 needs Pages, News, Media, and Users. That is it.

**Instead:** Start with 4 collections. The block system provides content flexibility within pages. Add new collections when a real need emerges, not speculatively.

### Anti-Pattern 4: Client-Side Data Fetching for Page Content

**What:** Using React Query, SWR, or `useEffect` + `fetch` to load page content.

**Why bad:** Destroys SSR/SEO benefits. Content is static or near-static -- there is no reason for client-side fetching. The page will render blank until JS hydrates and the fetch completes.

**Instead:** Server Components with the Local API. Content is rendered on the server and streamed as HTML.

### Anti-Pattern 5: Custom Auth for the Admin Panel

**What:** Adding OAuth, SAML, or custom authentication for CMS editors.

**Why bad:** Payload has built-in email/password auth with role-based access control. For 2-3 editors, this is more than sufficient. Custom auth adds complexity and is explicitly out of scope.

**Instead:** Use Payload's built-in `Users` collection with `auth: true`.

## Collection Design

### Pages Collection

```typescript
// Purpose: Evergreen content -- budget explainers, resource pages, policy analysis
{
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'content', type: 'blocks', blocks: [RichText, CallToAction, ContactList] },
    { name: 'meta', type: 'group', fields: [
      { name: 'description', type: 'textarea' },
      { name: 'image', type: 'upload', relationTo: 'media' },
    ]},
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
    { name: 'publishedDate', type: 'date' },
  ],
}
```

### News Collection

```typescript
// Purpose: Timely content -- meeting recaps, breaking developments, periodic summaries
{
  slug: 'news',
  admin: { useAsTitle: 'title' },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea' },  // For listing cards
    { name: 'featuredImage', type: 'upload', relationTo: 'media' },
    { name: 'content', type: 'richText' },  // Simpler than blocks for news
    { name: 'status', type: 'select', options: ['draft', 'published'], defaultValue: 'draft' },
    { name: 'publishedDate', type: 'date', required: true },
  ],
  defaultSort: '-publishedDate',
}
```

### Media Collection

```typescript
// Purpose: Image uploads with automatic resizing via Sharp
{
  slug: 'media',
  upload: {
    staticDir: 'media',    // Stored in Docker volume
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300 },
      { name: 'card', width: 768, height: 480 },
      { name: 'hero', width: 1920, height: 1080 },
    ],
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
  ],
}
```

### Users Collection

```typescript
// Purpose: CMS admin accounts (2-3 editors)
{
  slug: 'users',
  auth: true,  // Enables Payload's built-in auth
  admin: { useAsTitle: 'email' },
  fields: [
    { name: 'name', type: 'text' },
    { name: 'role', type: 'select', options: ['admin', 'editor'], defaultValue: 'editor' },
  ],
}
```

## Navigation Global Design

```typescript
// Purpose: CMS-managed nav with one-level dropdowns
{
  slug: 'navigation',
  fields: [
    {
      name: 'items',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'type', type: 'select', options: ['link', 'dropdown'], required: true },
        // For direct links:
        { name: 'url', type: 'text' },         // External URL
        { name: 'page', type: 'relationship', relationTo: 'pages' },  // Internal page
        // For dropdowns:
        {
          name: 'children',
          type: 'array',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'url', type: 'text' },
            { name: 'page', type: 'relationship', relationTo: 'pages' },
          ],
          admin: { condition: (data, siblingData) => siblingData?.type === 'dropdown' },
        },
      ],
    },
  ],
}
```

## Deployment Architecture

### Docker Container Structure

```dockerfile
# Single-stage production build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build    # Builds both Next.js and Payload

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Media uploads volume mount point
VOLUME /app/media

EXPOSE 3000
CMD ["npm", "start"]
```

### K8s Considerations

| Concern | Approach |
|---------|----------|
| **Media persistence** | PersistentVolumeClaim mounted at `/app/media`. Media files must survive pod restarts. |
| **Database** | PostgreSQL as a separate K8s deployment (or external managed DB). Do NOT run in the same pod. |
| **Migrations** | Payload auto-runs migrations on startup. First deploy creates tables. Single replica during migrations. |
| **Environment variables** | `DATABASE_URI`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SERVER_URL` via K8s Secrets / ConfigMap. |
| **Replicas** | Start with 1 replica. Payload 3.x can run multiple replicas but media uploads need shared storage (NFS or S3 adapter) if scaling horizontally. |
| **Health checks** | Liveness: `GET /api/health` (or custom). Readiness: same after migrations complete. |

## Scalability Considerations

| Concern | At 100 visitors | At 10K visitors | At 1M visitors |
|---------|-----------------|-----------------|-----------------|
| **Rendering** | SSR on every request is fine | Enable ISR (revalidate every 60s) to cache pages | Full static generation + CDN; Cloudflare cache |
| **Database** | Single PostgreSQL, no tuning needed | Add connection pooling, basic indexing | Read replicas, aggressive caching layer |
| **Media** | Local filesystem in Docker volume | Same -- images served through Next.js | Move to S3-compatible storage + Cloudflare CDN |
| **Deployment** | Single replica | Single replica (still fine) | Multiple replicas + shared media storage |

For BIBB United v1, the "100 visitors" column is the reality. Do not over-engineer. ISR can be added later with a one-line config change per page.

## Suggested Build Order

Based on component dependencies, build in this order:

### Phase 1: Foundation (everything else depends on this)
1. **Project scaffolding** -- `create-payload-app` with Next.js + PostgreSQL
2. **Payload config** -- Database adapter, base configuration
3. **Users collection** -- Required for CMS authentication
4. **Media collection** -- Required by Pages and News (image references)

**Why first:** No content can be created without Users (auth), and no content can reference images without Media. The Payload config is the root of everything.

### Phase 2: Content Types + Admin
5. **Pages collection** -- Core content type with block-based content
6. **News collection** -- Time-based content type with rich text
7. **Block definitions** -- RichText, CallToAction, ContactList blocks
8. **Navigation global** -- CMS-managed nav structure
9. **SiteSettings global** -- Site title, description, social links

**Why second:** Editors need these to start entering content. The admin panel is automatically available once collections are defined. No frontend code needed yet.

### Phase 3: Frontend + Design
10. **Branding** -- Logo, color palette, typography tokens in Tailwind config
11. **Layout components** -- Header (with nav), Footer, MobileNav
12. **Homepage** -- Latest news + key pages
13. **Page template** -- Dynamic `[slug]` route with block renderers
14. **News listing + detail** -- News index and individual post pages
15. **Block renderer components** -- React components matching each block type

**Why third:** The frontend cannot render content that does not exist. Building collections first means editors can populate the site while frontend development happens. The frontend consumes whatever content is already in the CMS.

### Phase 4: Deployment
16. **Dockerfile** -- Multi-stage build
17. **K8s manifests** -- Deployment, Service, PVC, ConfigMap, Secret
18. **Traefik IngressRoute** -- With Cloudflare tunnel configuration
19. **Media volume** -- PersistentVolumeClaim for uploaded images

**Why last:** Deployment is the shell around a working application. Get it working locally first, then containerize.

### Dependency Graph

```
Users ----+
          |
Media ----+--> Pages ----+
          |               +--> Frontend Layout --> Homepage
          +--> News  ----+                    |
          |                                    +--> Page Template
Navigation -----------------------------------|
                                              +--> News Template
SiteSettings ---------------------------------+

Blocks ------> Pages (used within content field)
           |
           +--> Block Renderers (React components)

All of above --> Docker --> K8s Deployment
```

## Sources

- Payload CMS 3.x documentation (payloadcms.com/docs) -- architecture, collections, globals, blocks, Local API, database adapters [MEDIUM confidence -- sourced from training data, not live-verified]
- Next.js App Router documentation (nextjs.org/docs) -- route groups, server components, dynamic routes [MEDIUM confidence -- same]
- Payload CMS GitHub repository and examples (github.com/payloadcms/payload) -- project structure patterns [MEDIUM confidence -- same]

**Note:** Web verification tools were unavailable during this research session. All findings are based on training data through May 2025. Payload CMS 3.x was stable and well-documented before this cutoff, so findings are likely accurate, but should be verified against current docs before implementation -- particularly around any API changes in minor releases since then.
