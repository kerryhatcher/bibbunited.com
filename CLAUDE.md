<!-- GSD:project-start source:PROJECT.md -->
## Project

**BIBB United**

A civic advocacy website for the BIBB community, starting with local school system issues. The site informs residents about what's happening — budgets, policies, board decisions — and activates them to take action: attend meetings, contact officials, and get involved. Bold, urgent design that demands attention. Powered by Payload CMS so a small editorial team can publish content without touching code.

**Core Value:** Community members can find clear, actionable information about their local school system and know exactly what to do about it.

### Constraints

- **Tech stack**: Next.js + React + Tailwind CSS + Payload CMS 3.x — user-specified, non-negotiable
- **Database**: PostgreSQL — required by deployment environment and user preference
- **Hosting**: Self-hosted K8s with Traefik + Cloudflare tunnels — no cloud PaaS
- **Branding**: Needs to be created from scratch — no existing logo or color palette
- **Content team**: Must be manageable by non-technical editors through Payload admin UI
<!-- GSD:project-end -->

## Local Development

**Always use `docker compose` to start the local dev environment.** This starts both PostgreSQL and the Next.js+Payload dev server:

```bash
docker compose up        # foreground (see logs)
docker compose up -d     # background
```

- App: http://localhost:3000
- Payload admin: http://localhost:3000/admin
- Database: PostgreSQL on localhost:5499

If running Next.js outside Docker (for faster HMR), still use Docker for the database:

```bash
docker compose up -d db
cp .env.example .env     # if .env doesn't exist
pnpm dev
```

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Version Verification Required
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
## Payload CMS 3.x Architecture Notes
## Installation
# Scaffold with Payload's official create tool (recommended for new projects)
# Or manual installation into an existing Next.js project:
# Styling
# Payload plugins
# Supporting libraries
# Dev dependencies
## Environment Variables
# .env (never committed)
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
## Docker Build Strategy
# Multi-stage build for production
- Use `output: 'standalone'` in `next.config.mjs` for Docker deployments. This creates a self-contained server without needing `node_modules`.
- `sharp` must be available at build time for image optimization.
- Mount a PersistentVolume at the media upload directory for file persistence across pod restarts.
## Sources
- Payload CMS 3.x documentation (payloadcms.com/docs) -- HIGH confidence for architecture patterns
- Next.js documentation (nextjs.org/docs) -- HIGH confidence for App Router patterns
- Tailwind CSS documentation (tailwindcss.com) -- HIGH confidence for utility patterns
- npm registry -- version numbers could not be verified live; flagged as MEDIUM confidence
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
