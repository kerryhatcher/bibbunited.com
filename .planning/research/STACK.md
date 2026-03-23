# Technology Stack

**Project:** BIBB United -- Civic Advocacy Website
**Researched:** 2026-03-23
**Overall Confidence:** MEDIUM (versions based on training data through May 2025; cannot verify latest releases as of March 2026 -- run `npm view <pkg> version` before scaffolding)

## Version Verification Required

All version numbers below reflect the latest stable releases known through May 2025. Before starting development, verify current versions by running:

```bash
npm view next version
npm view payload version
npm view tailwindcss version
npm view react version
npm view @payloadcms/db-postgres version
npm view @payloadcms/richtext-lexical version
```

Update this document with actual verified versions before scaffolding the project.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | ^15.x | Full-stack React framework | Payload CMS 3.x is built on Next.js -- they share the same server process. Next.js App Router provides SSR/SSG for fast page loads (critical for civic engagement sites where mobile users on spotty connections need quick access). | MEDIUM |
| React | ^19.x | UI rendering | Next.js 15 ships with React 19. Server Components reduce client bundle size, which matters for a content-heavy site. | MEDIUM |
| TypeScript | ^5.x | Type safety | Payload 3.x is TypeScript-native and auto-generates types from your collections. Skipping TS means losing half of Payload's developer experience. Non-negotiable for this stack. | HIGH |

### CMS

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Payload CMS | ^3.x | Headless CMS with admin UI | User-specified. Payload 3.x runs inside the same Next.js process (not a separate server), so there is one deployment artifact. The admin panel is built-in and requires zero frontend work. Perfect for 2-3 non-technical editors. | HIGH |
| @payloadcms/db-postgres | ^3.x | PostgreSQL database adapter | Payload 3.x uses Drizzle ORM under the hood for PostgreSQL. User-specified database. Drizzle handles migrations automatically via `payload migrate`. | HIGH |
| @payloadcms/richtext-lexical | ^3.x | Rich text editor | Lexical is Payload 3.x's default and recommended rich text editor (replaces Slate from v2). Built by Meta, actively maintained, excellent for structured content editing that non-technical editors need. | HIGH |
| @payloadcms/plugin-seo | ^3.x | SEO metadata | Adds title, description, og:image fields to collections automatically. Essential for a civic advocacy site that needs to be discoverable and shareable on social media. | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.x | Utility-first CSS | User-specified. Tailwind v4 (released early 2025) has a new CSS-first configuration approach -- no more `tailwind.config.js`, configuration happens in CSS via `@theme`. Faster builds with the new Oxide engine. | MEDIUM |
| @tailwindcss/typography | ^0.5.x | Prose styling for CMS content | The `prose` class handles all the typography for CMS-rendered rich text content. Without it, you would need to manually style every HTML element that Lexical outputs. Essential for a content-heavy site. | HIGH |

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PostgreSQL | 16.x | Primary database | User-specified. Payload's Drizzle-based postgres adapter is production-ready. PostgreSQL 16 is the current stable release line. Use the official Docker image for K8s deployment. | HIGH |

### Infrastructure / Deployment

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Docker | -- | Container runtime | Single Dockerfile builds the Next.js + Payload app. Multi-stage build: install deps, build, copy to slim runtime image. | HIGH |
| Node.js | 20 LTS or 22 LTS | Runtime | Next.js 15 requires Node 18.17+. Use 20 LTS (supported through April 2026) or 22 LTS for longer runway. Pin in `.nvmrc` and Dockerfile. | MEDIUM |
| Traefik | existing | Ingress / reverse proxy | Already in place on user's K8s cluster. No changes needed -- just configure Ingress resource or IngressRoute CRD. | HIGH |
| Cloudflare Tunnels | existing | Public access | Already in place. Provides SSL termination and DDoS protection for free. | HIGH |

### Supporting Libraries

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| sharp | ^0.33.x | Image optimization | Required by Next.js `next/image` for server-side image processing. Must be explicitly installed for Docker deployments. | HIGH |
| @payloadcms/storage-local | ^3.x | Local file storage | For media uploads (logos, article images). Stores to a persistent volume in K8s. Use this over S3 since the site is self-hosted and small-scale. | HIGH |
| date-fns | ^4.x | Date formatting | For displaying "Published 2 days ago" on news posts and formatting meeting dates. Lightweight, tree-shakeable, no moment.js bloat. | MEDIUM |
| lucide-react | latest | Icons | Clean, consistent icon set. MIT licensed. Covers all common UI icons (menu, arrow, external-link, calendar, etc.). Better than loading a full icon font. | MEDIUM |
| next-sitemap | ^4.x | Sitemap generation | Auto-generates sitemap.xml from Next.js routes. Helps with SEO discovery for a civic info site. | MEDIUM |

### Development Tools

| Tool | Version | Purpose | Why | Confidence |
|------|---------|---------|-----|------------|
| ESLint | ^9.x | Linting | ESLint 9 with flat config. Next.js ships `eslint-config-next` for framework-specific rules. | MEDIUM |
| Prettier | ^3.x | Code formatting | Consistent code style. Use `prettier-plugin-tailwindcss` to auto-sort Tailwind classes. | HIGH |
| prettier-plugin-tailwindcss | latest | Tailwind class sorting | Automatically sorts Tailwind utility classes in a consistent order. Prevents pointless diff noise and makes templates readable. | HIGH |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Rich text editor | Lexical (@payloadcms/richtext-lexical) | Slate (@payloadcms/richtext-slate) | Slate is the legacy Payload editor, deprecated in favor of Lexical in 3.x. Lexical has better performance, extensibility, and active maintenance from Meta. |
| Database | PostgreSQL via @payloadcms/db-postgres | MongoDB via @payloadcms/db-mongodb | User specified PostgreSQL. Additionally, PostgreSQL is better for structured civic data (meetings, contacts, budgets) and has stronger querying capabilities. |
| CSS framework | Tailwind CSS v4 | CSS Modules / styled-components | User specified Tailwind. Additionally, Tailwind's utility approach is faster for building responsive layouts and the bold, high-contrast design this site needs. |
| Image storage | @payloadcms/storage-local | @payloadcms/storage-s3 | S3 adds unnecessary complexity and cost for a small self-hosted site. Local storage with a K8s PersistentVolume is simpler and sufficient for this scale. If the site grows significantly, migration to S3 is straightforward later. |
| Icons | lucide-react | Font Awesome / Heroicons | Lucide is tree-shakeable (only import what you use), MIT licensed, and has excellent React integration. Heroicons is also good but Lucide has a broader icon set. Font Awesome is bloated for this use case. |
| Date library | date-fns | Day.js / Moment.js | Moment.js is deprecated and massive. Day.js is fine but date-fns is more tree-shakeable and has better TypeScript types. |
| ORM | Drizzle (built into Payload) | Prisma | Not a choice -- Payload 3.x uses Drizzle internally for PostgreSQL. Do not add Prisma alongside it; that would be two ORMs fighting over the same database. If you need custom queries beyond Payload's Local API, use Drizzle directly via Payload's `db` property. |
| Deployment | Docker on K8s | Vercel / Netlify | User has existing K8s infrastructure. Self-hosted avoids vendor lock-in and recurring costs. Payload 3.x works perfectly in Docker. |
| State management | None (React Server Components) | Redux / Zustand | This is a content site, not a SPA. Server Components handle data fetching. There is no complex client-side state to manage. Adding a state management library would be over-engineering. |
| Email / Newsletter | None (out of scope) | Resend / SendGrid | Explicitly deferred to v2 in PROJECT.md. |
| Search | None (out of scope) | Algolia / Meilisearch | Explicitly deferred to v2 in PROJECT.md. Site will be small enough to navigate via menu. |
| Analytics | None (defer) | Plausible / Umami | Not mentioned in requirements, but worth adding in a later phase. Both are privacy-friendly, self-hostable analytics that align with civic transparency values. Recommend Plausible for v2. |

---

## Payload CMS 3.x Architecture Notes

Payload 3.x is fundamentally different from 2.x. Key points for this project:

1. **Single process:** Payload runs inside your Next.js app, not as a separate Express server. Your `next.config.mjs` wraps with `withPayload()`. One build, one deploy.

2. **App Router required:** Payload 3.x uses Next.js App Router (`app/` directory), not Pages Router. All frontend routes use React Server Components by default.

3. **Admin at `/admin`:** Payload serves its admin panel at `/admin` automatically. The `(payload)/` route group in your `app/` directory handles this. No separate admin app needed.

4. **Collections = content types:** Each collection (pages, news-posts, media, users) gets a Payload config file defining fields, access control, and hooks. Payload auto-generates the admin UI and REST/GraphQL APIs.

5. **Local API:** For SSR pages, use Payload's Local API (`payload.find()`, `payload.findByID()`) instead of hitting REST endpoints. It runs in-process with zero network overhead. This is the recommended pattern for Next.js Server Components.

6. **Migrations:** `npx payload migrate:create` generates SQL migrations from schema changes. `npx payload migrate` applies them. Drizzle handles the SQL generation.

7. **Blocks and fields:** Payload's block-based field type lets editors compose flexible page layouts from predefined components -- perfect for the mix of explainer pages and resource pages this site needs.

---

## Installation

```bash
# Scaffold with Payload's official create tool (recommended for new projects)
npx create-payload-app@latest bibbunited --db postgres

# Or manual installation into an existing Next.js project:
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical

# Styling
npm install tailwindcss @tailwindcss/typography

# Payload plugins
npm install @payloadcms/plugin-seo @payloadcms/storage-local

# Supporting libraries
npm install sharp date-fns lucide-react next-sitemap

# Dev dependencies
npm install -D typescript @types/node @types/react eslint prettier prettier-plugin-tailwindcss eslint-config-next
```

**Recommended approach:** Use `npx create-payload-app@latest` to scaffold. It generates the correct Next.js + Payload integration boilerplate, including the admin route group, payload.config.ts, and proper next.config.mjs with `withPayload()`. Then layer on Tailwind, plugins, and supporting libraries.

---

## Environment Variables

```bash
# .env (never committed)
DATABASE_URI=postgresql://user:password@localhost:5432/bibbunited
PAYLOAD_SECRET=<random-32-char-string>  # Used for auth token signing
NEXT_PUBLIC_SITE_URL=https://bibbunited.com  # For SEO and og:image URLs
```

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| Payload CMS 2.x | Completely different architecture (separate Express server). Payload 3.x is the current major version. Do not follow 2.x tutorials. |
| Pages Router (`pages/` directory) | Payload 3.x requires App Router. Mixing routers creates confusion and routing conflicts. |
| Prisma | Payload 3.x uses Drizzle internally. Adding Prisma creates ORM conflicts. Use Payload's Local API or Drizzle directly. |
| Redux / Zustand / Jotai | No complex client state in a content site. Server Components handle data fetching. |
| Slate rich text editor | Deprecated in Payload 3.x. Lexical is the supported replacement. |
| express / fastify (standalone) | Payload 3.x runs inside Next.js. No separate API server needed. |
| MongoDB | User specified PostgreSQL. Additionally, relational data (civic records, budget breakdowns) maps better to PostgreSQL. |
| CSS-in-JS (styled-components, emotion) | Conflicts with React Server Components (which render on the server). Tailwind is user-specified and works perfectly with RSC. |
| Moment.js | Deprecated. Use date-fns. |
| GraphQL client (Apollo, urql) | Payload's Local API is faster for server-side rendering (no network hop). Only use REST/GraphQL for external integrations, which are not in v1 scope. |

---

## Docker Build Strategy

```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

Key considerations:
- Use `output: 'standalone'` in `next.config.mjs` for Docker deployments. This creates a self-contained server without needing `node_modules`.
- `sharp` must be available at build time for image optimization.
- Mount a PersistentVolume at the media upload directory for file persistence across pod restarts.

---

## Sources

- Payload CMS 3.x documentation (payloadcms.com/docs) -- HIGH confidence for architecture patterns
- Next.js documentation (nextjs.org/docs) -- HIGH confidence for App Router patterns
- Tailwind CSS documentation (tailwindcss.com) -- HIGH confidence for utility patterns
- npm registry -- version numbers could not be verified live; flagged as MEDIUM confidence

**NOTE:** All version numbers should be verified against npm before project scaffolding. The specific minor/patch versions may have advanced since training data cutoff (May 2025). The major version recommendations (Next.js 15, React 19, Payload 3.x, Tailwind 4.x, Node 20 LTS) are very likely still current as of March 2026, but verify.
